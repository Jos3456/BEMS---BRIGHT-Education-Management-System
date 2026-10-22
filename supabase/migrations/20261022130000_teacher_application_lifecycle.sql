-- Preserve the complete teacher-application lifecycle and secure admin actions.
create table if not exists public.teacher_application_review_history (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.teacher_applications(id) on delete restrict,
  applicant_id uuid not null,
  actor_id uuid,
  action text not null check (action in (
    'submitted',
    'approved',
    'rejected',
    'reopened',
    'teacher_access_revoked',
    'status_changed'
  )),
  previous_status public.teacher_application_status,
  new_status public.teacher_application_status,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists teacher_application_review_history_application_created_idx
  on public.teacher_application_review_history (application_id, created_at desc);
create index if not exists teacher_application_review_history_applicant_created_idx
  on public.teacher_application_review_history (applicant_id, created_at desc);

alter table public.teacher_application_review_history enable row level security;
drop policy if exists teacher_application_review_history_admin_select
  on public.teacher_application_review_history;
create policy teacher_application_review_history_admin_select
  on public.teacher_application_review_history
  for select to authenticated
  using ((select public.has_role('admin'::public.app_role)));

revoke all on public.teacher_application_review_history from public, anon, authenticated;
grant select on public.teacher_application_review_history to authenticated;

create or replace function public.log_teacher_application_status_change()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  event_action text;
  event_notes text;
begin
  if old.status is not distinct from new.status then
    return new;
  end if;

  event_action := case
    when old.status = 'rejected' and new.status = 'draft' then 'reopened'
    when old.status = 'draft' and new.status = 'submitted' then 'submitted'
    when new.status = 'approved' then 'approved'
    when new.status = 'rejected' then 'rejected'
    when old.status = 'approved' and new.status = 'suspended' then 'teacher_access_revoked'
    else 'status_changed'
  end;

  event_notes := case
    when event_action = 'reopened' then old.review_notes
    else new.review_notes
  end;

  insert into public.teacher_application_review_history (
    application_id, applicant_id, actor_id, action,
    previous_status, new_status, notes
  ) values (
    new.id, new.user_id, coalesce(new.reviewer_id, (select auth.uid())),
    event_action, old.status, new.status, event_notes
  );

  return new;
end;
$function$;

drop trigger if exists teacher_application_status_history
  on public.teacher_applications;
create trigger teacher_application_status_history
  after update of status on public.teacher_applications
  for each row execute function public.log_teacher_application_status_change();
revoke all on function public.log_teacher_application_status_change() from public, anon, authenticated;

create or replace function public.review_teacher_application(
  application_id uuid,
  decision text,
  notes text default null
)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  applicant_id uuid;
  admin_id uuid := (select auth.uid());
begin
  if admin_id is null
     or not (select public.has_role('admin'::public.app_role)) then
    raise exception 'Admin access required';
  end if;

  if decision is null or decision not in ('approved', 'rejected') then
    raise exception 'Invalid decision';
  end if;

  if notes is not null and char_length(notes) > 2000 then
    raise exception 'Review notes must be 2000 characters or fewer';
  end if;

  select ta.user_id
    into applicant_id
  from public.teacher_applications as ta
  where ta.id = application_id
    and ta.status in ('submitted', 'under_review', 'additional_info_requested')
  for update;

  if applicant_id is null then
    raise exception 'Application not found or no longer awaiting review';
  end if;

  update public.teacher_applications
  set status = decision::public.teacher_application_status,
      reviewer_id = admin_id,
      review_notes = nullif(btrim(notes), ''),
      reviewed_at = now(),
      updated_at = now()
  where id = application_id;

  if decision = 'approved' then
    insert into public.user_roles (user_id, role, assigned_by)
    values (applicant_id, 'teacher'::public.app_role, admin_id)
    on conflict (user_id, role) do nothing;
  elsif decision = 'rejected' then
    -- A rejection must never leave teaching access in place; other roles are untouched.
    delete from public.user_roles
    where user_id = applicant_id and role = 'teacher'::public.app_role;
  end if;
end;
$function$;

create or replace function public.reopen_teacher_application(
  application_id uuid
)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  admin_id uuid := (select auth.uid());
begin
  if admin_id is null
     or not (select public.has_role('admin'::public.app_role)) then
    raise exception 'Admin access required';
  end if;

  update public.teacher_applications
  set status = 'draft'::public.teacher_application_status,
      reviewer_id = null,
      review_notes = null,
      reviewed_at = null,
      updated_at = now()
  where id = application_id
    and status = 'rejected'::public.teacher_application_status;

  if not found then
    raise exception 'Rejected application not found or no longer eligible to reopen';
  end if;
end;
$function$;

create or replace function public.admin_revoke_teacher_access(
  target_user_id uuid,
  notes text default null
)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  admin_id uuid := (select auth.uid());
  application_record public.teacher_applications%rowtype;
  removed_count integer;
begin
  if admin_id is null
     or not (select public.has_role('admin'::public.app_role)) then
    raise exception 'Admin access required';
  end if;

  if target_user_id is null or target_user_id = admin_id then
    raise exception 'Invalid target user';
  end if;

  if notes is not null and char_length(notes) > 2000 then
    raise exception 'Notes must be 2000 characters or fewer';
  end if;

  if exists (
    select 1 from public.user_roles
    where user_id = target_user_id and role = 'admin'::public.app_role
  ) then
    raise exception 'Teacher access cannot be revoked from an administrator through this action';
  end if;

  select * into application_record
  from public.teacher_applications
  where user_id = target_user_id
  for update;

  delete from public.user_roles
  where user_id = target_user_id and role = 'teacher'::public.app_role;
  get diagnostics removed_count = row_count;

  if removed_count = 0 then
    raise exception 'This user does not currently have the teacher role';
  end if;

  if application_record.id is not null
     and application_record.status = 'approved'::public.teacher_application_status then
    update public.teacher_applications
    set status = 'suspended'::public.teacher_application_status,
        reviewer_id = admin_id,
        review_notes = nullif(btrim(notes), ''),
        reviewed_at = now(),
        updated_at = now()
    where id = application_record.id;
  else
    insert into public.teacher_application_review_history (
      application_id, applicant_id, actor_id, action,
      previous_status, new_status, notes
    ) values (
      application_record.id, target_user_id, admin_id, 'teacher_access_revoked',
      application_record.status, application_record.status, nullif(btrim(notes), '')
    );
  end if;
end;
$function$;

revoke all on function public.review_teacher_application(uuid, text, text) from public, anon;
revoke all on function public.reopen_teacher_application(uuid) from public, anon;
revoke all on function public.admin_revoke_teacher_access(uuid, text) from public, anon;
grant execute on function public.review_teacher_application(uuid, text, text) to authenticated, service_role;
grant execute on function public.reopen_teacher_application(uuid) to authenticated, service_role;
grant execute on function public.admin_revoke_teacher_access(uuid, text) to authenticated, service_role;
