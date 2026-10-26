-- Teacher marks-entry safeguards.
-- Teachers may save/edit draft marks only. Publishing is intentionally a separate workflow.
-- Also allow teachers to read the minimum profile details of learners actively assigned to them.

drop policy if exists "Teachers read assigned learner profiles" on public.profiles;
create policy "Teachers read assigned learner profiles"
  on public.profiles for select to authenticated
  using (
    is_active_user()
    and has_role('teacher'::app_role)
    and exists (
      select 1
      from public.teacher_learner_assignments tla
      where tla.teacher_id = auth.uid()
        and tla.learner_id = profiles.id
        and tla.status = 'active'
    )
  );

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
        and (assessment_results.score is null or assessment_results.score <= a.max_score)
    )
  );

-- Preserve an explicit administrator override for correcting result records.
drop policy if exists "Admins update assessment results" on public.assessment_results;
create policy "Admins update assessment results"
  on public.assessment_results for update to authenticated
  using (is_active_user() and has_role('admin'::app_role))
  with check (is_active_user() and has_role('admin'::app_role));
