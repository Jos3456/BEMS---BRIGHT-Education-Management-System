create or replace function public.submit_teacher_application(
  p_qualifications text,
  p_experience text,
  p_subjects text[],
  p_curricula text[]
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  applicant_id uuid := auth.uid();
begin
  if applicant_id is null then
    raise exception 'Authentication required';
  end if;

  if p_qualifications is null or length(btrim(p_qualifications)) < 2
     or length(p_qualifications) > 5000 then
    raise exception 'Please provide your qualifications (up to 5,000 characters)';
  end if;

  if p_experience is not null and length(p_experience) > 5000 then
    raise exception 'Experience must be 5,000 characters or fewer';
  end if;

  if p_subjects is null or cardinality(p_subjects) = 0
     or exists (select 1 from unnest(p_subjects) as item(value) where length(btrim(value)) = 0 or length(value) > 120) then
    raise exception 'Add at least one valid subject';
  end if;

  if p_curricula is null or cardinality(p_curricula) = 0
     or exists (select 1 from unnest(p_curricula) as item(value) where length(btrim(value)) = 0 or length(value) > 120) then
    raise exception 'Add at least one valid curriculum';
  end if;

  update public.teacher_applications
  set qualifications = btrim(p_qualifications),
      experience = nullif(btrim(coalesce(p_experience, '')), ''),
      subjects = (select array_agg(distinct btrim(value)) from unnest(p_subjects) as item(value)),
      curricula = (select array_agg(distinct btrim(value)) from unnest(p_curricula) as item(value)),
      status = 'submitted',
      submitted_at = now(),
      updated_at = now()
  where user_id = applicant_id
    and status = 'draft';

  if not found then
    raise exception 'No editable draft application was found';
  end if;
end;
$$;

revoke all on function public.submit_teacher_application(text, text, text[], text[]) from public, anon;
grant execute on function public.submit_teacher_application(text, text, text[], text[]) to authenticated;
