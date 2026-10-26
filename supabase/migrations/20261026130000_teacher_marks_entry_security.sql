-- Teacher marks-entry safeguards.
-- Teachers may save/edit draft marks only. Publishing is intentionally a separate workflow.
-- Return only active assigned learner IDs and names to the signed-in teacher.
-- Do not grant direct SELECT access to all columns in public.profiles.
CREATE OR REPLACE FUNCTION public.teacher_assigned_learner_names()
RETURNS TABLE (learner_id uuid, full_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT p.id, p.full_name
  FROM public.profiles AS p
  WHERE p.account_status = 'active'
    AND EXISTS (
      SELECT 1
      FROM public.user_roles AS learner_role
      WHERE learner_role.user_id = p.id
        AND learner_role.role = 'student'::public.app_role
    )
    AND EXISTS (
      SELECT 1
      FROM public.teacher_learner_assignments AS tla
      WHERE tla.teacher_id = (SELECT auth.uid())
        AND tla.learner_id = p.id
        AND tla.status = 'active'
    )
    AND public.is_active_user()
    AND public.has_role('teacher'::public.app_role);
$function$;

REVOKE ALL ON FUNCTION public.teacher_assigned_learner_names()
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.teacher_assigned_learner_names()
  TO authenticated;

drop policy if exists "Teachers enter results for their own assessments" on public.assessment_results;
create policy "Teachers enter draft results for their own assessments"
  on public.assessment_results for insert to authenticated
  with check (
    is_active_user()
    and has_role('teacher'::app_role)
    and status = 'draft'
    and graded_by = auth.uid()
    and (score is null or score >= 0)
    and exists (
      select 1
      from public.learning_assessments a
      join public.teacher_learner_assignments tla
        on tla.teacher_id = a.teacher_id
       and tla.learner_id = assessment_results.learner_id
       and tla.subject_name = a.subject_name
       and tla.status = 'active'
       and (tla.course_name is null or tla.course_name = a.course_name)
      where a.id = assessment_results.assessment_id
        and a.teacher_id = auth.uid()
        and a.status <> 'closed'
        and (assessment_results.score is null or assessment_results.score <= a.max_score)
    )
  );

drop policy if exists "Teachers update results for their own assessments" on public.assessment_results;
drop policy if exists "Teachers update draft results for their own assessments" on public.assessment_results;
create policy "Teachers update draft results for their own assessments"
  on public.assessment_results for update to authenticated
  using (
    is_active_user()
    and has_role('teacher'::app_role)
    and status = 'draft'
    and exists (
      select 1
      from public.learning_assessments a
      join public.teacher_learner_assignments tla
        on tla.teacher_id = a.teacher_id
       and tla.learner_id = assessment_results.learner_id
       and tla.subject_name = a.subject_name
       and tla.status = 'active'
       and (tla.course_name is null or tla.course_name = a.course_name)
      where a.id = assessment_results.assessment_id
        and a.teacher_id = auth.uid()
        and a.status <> 'closed'
    )
  )
  with check (
    is_active_user()
    and has_role('teacher'::app_role)
    and status = 'draft'
    and graded_by = auth.uid()
    and (score is null or score >= 0)
    and exists (
      select 1
      from public.learning_assessments a
      join public.teacher_learner_assignments tla
        on tla.teacher_id = a.teacher_id
       and tla.learner_id = assessment_results.learner_id
       and tla.subject_name = a.subject_name
       and tla.status = 'active'
       and (tla.course_name is null or tla.course_name = a.course_name)
      where a.id = assessment_results.assessment_id
        and a.teacher_id = auth.uid()
        and a.status <> 'closed'
        and (assessment_results.score is null or assessment_results.score <= a.max_score)
    )
  );

-- Preserve an explicit administrator override for correcting result records.
drop policy if exists "Admins update assessment results" on public.assessment_results;
create policy "Admins update assessment results"
  on public.assessment_results for update to authenticated
  using (is_active_user() and has_role('admin'::app_role))
  with check (is_active_user() and has_role('admin'::app_role));
