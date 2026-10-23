-- BEMS: record teacher-application status changes in an administrator-only audit history.
-- Repository migration only: validate in a safe environment before applying to production.

create table if not exists public.teacher_application_review_history (
  id uuid primary key default gen_random_uuid(),
  -- Keep the original application UUID even if the application/account is later deleted.
  application_id uuid not null,
  applicant_id uuid references auth.users(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (
    action in ('submitted', 'approved', 'rejected', 'reopened', 'suspended', 'status_changed')
  ),
  previous_status public.teacher_application_status,
  new_status public.teacher_application_status not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists teacher_application_review_history_application_created_idx
  on public.teacher_application_review_history (application_id, created_at desc);

create index if not exists teacher_application_review_history_applicant_created_idx
  on public.teacher_application_review_history (applicant_id, created_at desc);

alter table public.teacher_application_review_history enable row level security;

drop policy if exists teacher_application_review_history_select_admin
  on public.teacher_application_review_history;

create policy teacher_application_review_history_select_admin
  on public.teacher_application_review_history
  for select
  to authenticated
  using (
    (select public.is_active_user())
    and (select public.has_role('admin'::public.app_role))
  );

revoke all on table public.teacher_application_review_history from public, anon, authenticated;
grant select on table public.teacher_application_review_history to authenticated;

-- Seed one best-effort historical event for existing reviewed applications.
-- The original database stores only the latest review, so earlier reviews cannot be reconstructed.
insert into public.teacher_application_review_history (
  application_id,
  applicant_id,
  actor_id,
  action,
  previous_status,
  new_status,
  notes,
  created_at
)
select
  ta.id,
  ta.user_id,
  ta.reviewer_id,
  case
    when ta.status = 'approved'::public.teacher_application_status then 'approved'
    when ta.status = 'rejected'::public.teacher_application_status then 'rejected'
    when ta.status = 'suspended'::public.teacher_application_status then 'suspended'
    else 'status_changed'
  end,
  null,
  ta.status,
  ta.review_notes,
  coalesce(ta.reviewed_at, ta.updated_at, ta.created_at)
from public.teacher_applications ta
where ta.status in (
  'approved'::public.teacher_application_status,
  'rejected'::public.teacher_application_status,
  'suspended'::public.teacher_application_status
)
and not exists (
  select 1
  from public.teacher_application_review_history h
  where h.application_id = ta.id
);

create or replace function public.log_teacher_application_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  event_action text;
  event_actor uuid;
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  event_action := case
    when new.status = 'submitted'::public.teacher_application_status then 'submitted'
    when new.status = 'approved'::public.teacher_application_status then 'approved'
    when new.status = 'rejected'::public.teacher_application_status then 'rejected'
    when new.status = 'suspended'::public.teacher_application_status then 'suspended'
    when old.status = 'rejected'::public.teacher_application_status
      and new.status = 'draft'::public.teacher_application_status then 'reopened'
    else 'status_changed'
  end;

  -- Do not attribute a service-role/background update to a previous reviewer.
  event_actor := (select auth.uid());

  insert into public.teacher_application_review_history (
    application_id,
    applicant_id,
    actor_id,
    action,
    previous_status,
    new_status,
    notes,
    created_at
  )
  values (
    new.id,
    new.user_id,
    event_actor,
    event_action,
    old.status,
    new.status,
    coalesce(new.review_notes, old.review_notes),
    now()
  );

  return new;
end;
$function$;

drop trigger if exists teacher_application_status_history
  on public.teacher_applications;

create trigger teacher_application_status_history
  after update of status on public.teacher_applications
  for each row
  when (old.status is distinct from new.status)
  execute function public.log_teacher_application_status_change();

-- This function is intended only for the trigger, not as a public RPC endpoint.
revoke all on function public.log_teacher_application_status_change() from public, anon, authenticated;
