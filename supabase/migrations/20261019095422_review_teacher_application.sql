create or replace function public.review_teacher_application(
  application_id uuid,
  decision text,
  notes text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  applicant_id uuid;
begin
  if (select auth.uid()) is null
     or not (select public.has_role('admin'::public.app_role)) then
    raise exception 'Admin access required';
  end if;

  if decision is null or decision not in ('approved', 'rejected') then
    raise exception 'Invalid decision';
  end if;

  if notes is not null and char_length(notes) > 2000 then
    raise exception 'Review notes must be 2000 characters or fewer';
  end if;

  update public.teacher_applications
  set
    status = decision::public.teacher_application_status,
    reviewer_id = (select auth.uid()),
    review_notes = nullif(btrim(notes), ''),
    reviewed_at = now(),
    updated_at = now()
  where id = application_id
    and status in (
      'submitted',
      'under_review',
      'additional_info_requested'
    )
  returning user_id into applicant_id;

  if applicant_id is null then
    raise exception 'Application not found or no longer awaiting review';
  end if;

  if decision = 'approved' then
    insert into public.user_roles (user_id, role, assigned_by)
    values (applicant_id, 'teacher'::public.app_role, (select auth.uid()))
    on conflict (user_id, role) do nothing;
  end if;
end;
$$;

revoke all on function public.review_teacher_application(uuid, text, text)
from public, anon;

grant execute on function public.review_teacher_application(uuid, text, text)
to authenticated;
