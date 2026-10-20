-- BEMS security hardening: keep the live database permissions and critical
-- authorization rules reproducible from version-controlled migrations.
-- Safe to re-run: indexes use IF NOT EXISTS and policies are altered in place.

-- Remove direct anon table access and dangerous table privileges.
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM authenticated;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM anon;

-- Prevent anonymous execution of application functions; explicitly grant the
-- authenticated role only the functions used by the application.
DO $$
DECLARE f record;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS signature
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prokind = 'f'
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon', f.signature);
  END LOOP;
END $$;

GRANT EXECUTE ON FUNCTION public.has_role(public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_status(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_teacher_application(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_teacher_application(text, text, text[], text[]) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.set_performance_tracking_updated_at() FROM authenticated;

-- Tighten future objects created by the postgres role.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM authenticated;

-- Index foreign keys used by joins/deletes and relationship checks.
CREATE INDEX IF NOT EXISTS academic_periods_created_by_idx ON public.academic_periods (created_by);
CREATE INDEX IF NOT EXISTS assessment_results_graded_by_idx ON public.assessment_results (graded_by);
CREATE INDEX IF NOT EXISTS grade_scales_created_by_idx ON public.grade_scales (created_by);
CREATE INDEX IF NOT EXISTS guardian_student_links_created_by_idx ON public.guardian_student_links (created_by);
CREATE INDEX IF NOT EXISTS learner_reports_academic_period_id_idx ON public.learner_reports (academic_period_id);
CREATE INDEX IF NOT EXISTS learner_reports_created_by_idx ON public.learner_reports (created_by);
CREATE INDEX IF NOT EXISTS learning_assessments_grade_scale_id_idx ON public.learning_assessments (grade_scale_id);
CREATE INDEX IF NOT EXISTS teacher_applications_reviewer_id_idx ON public.teacher_applications (reviewer_id);
CREATE INDEX IF NOT EXISTS teacher_learner_assignments_created_by_idx ON public.teacher_learner_assignments (created_by);
CREATE INDEX IF NOT EXISTS teacher_learner_assignments_learner_id_idx ON public.teacher_learner_assignments (learner_id);
CREATE INDEX IF NOT EXISTS user_roles_assigned_by_idx ON public.user_roles (assigned_by);

-- Prevent direct client-side insertion of administrator roles.
ALTER POLICY user_roles_insert_admin ON public.user_roles
WITH CHECK (
  public.is_active_user()
  AND public.has_role('admin'::public.app_role)
  AND role <> 'admin'::public.app_role
);

-- A teacher may only see results for learners they are actively assigned to.
ALTER POLICY "Authorized users read assessment results" ON public.assessment_results
USING (
  public.is_active_user()
  AND (
    (learner_id = (SELECT auth.uid()) AND status = 'published')
    OR EXISTS (
      SELECT 1 FROM public.guardian_student_links gl
      WHERE gl.guardian_id = (SELECT auth.uid())
        AND gl.learner_id = assessment_results.learner_id
        AND gl.status = 'active'
        AND assessment_results.status = 'published'
    )
    OR (
      public.has_role('teacher'::public.app_role)
      AND EXISTS (
        SELECT 1
        FROM public.learning_assessments a
        JOIN public.teacher_learner_assignments tla
          ON tla.teacher_id = a.teacher_id
         AND tla.learner_id = assessment_results.learner_id
         AND tla.subject_name = a.subject_name
         AND tla.status = 'active'
         AND (tla.course_name IS NULL OR tla.course_name = a.course_name)
        WHERE a.id = assessment_results.assessment_id
          AND a.teacher_id = (SELECT auth.uid())
      )
    )
    OR public.has_role('admin'::public.app_role)
  )
);

-- Keep result edits scoped to the teacher's own assigned learner and enforce
-- maximum score for teachers and administrators.
ALTER POLICY "Teachers update results for their own assessments" ON public.assessment_results
USING (
  public.is_active_user()
  AND (
    (
      public.has_role('teacher'::public.app_role)
      AND EXISTS (
        SELECT 1
        FROM public.learning_assessments a
        JOIN public.teacher_learner_assignments tla
          ON tla.teacher_id = a.teacher_id
         AND tla.learner_id = assessment_results.learner_id
         AND tla.subject_name = a.subject_name
         AND tla.status = 'active'
         AND (tla.course_name IS NULL OR tla.course_name = a.course_name)
        WHERE a.id = assessment_results.assessment_id
          AND a.teacher_id = (SELECT auth.uid())
      )
    )
    OR public.has_role('admin'::public.app_role)
  )
)
WITH CHECK (
  public.is_active_user()
  AND (
    (
      public.has_role('teacher'::public.app_role)
      AND EXISTS (
        SELECT 1
        FROM public.learning_assessments a
        JOIN public.teacher_learner_assignments tla
          ON tla.teacher_id = a.teacher_id
         AND tla.learner_id = assessment_results.learner_id
         AND tla.subject_name = a.subject_name
         AND tla.status = 'active'
         AND (tla.course_name IS NULL OR tla.course_name = a.course_name)
        WHERE a.id = assessment_results.assessment_id
          AND a.teacher_id = (SELECT auth.uid())
      )
    )
    OR public.has_role('admin'::public.app_role)
  )
  AND (score IS NULL OR score <= (
    SELECT a.max_score FROM public.learning_assessments a
    WHERE a.id = assessment_results.assessment_id
  ))
);

-- Only the owning teacher or an administrator can edit an assessment.
ALTER POLICY "Teachers update their own assessments and admins manage all"
ON public.learning_assessments
USING (
  public.is_active_user()
  AND (
    (teacher_id = (SELECT auth.uid()) AND public.has_role('teacher'::public.app_role))
    OR public.has_role('admin'::public.app_role)
  )
)
WITH CHECK (
  public.is_active_user()
  AND (
    (teacher_id = (SELECT auth.uid()) AND public.has_role('teacher'::public.app_role))
    OR public.has_role('admin'::public.app_role)
  )
);

-- Learners and guardians see published reports; only the report's teacher
-- (while still a teacher) or an administrator can read unpublished reports.
ALTER POLICY "Authorized users read learner reports" ON public.learner_reports
USING (
  public.is_active_user()
  AND (
    (learner_id = (SELECT auth.uid()) AND status = 'published')
    OR EXISTS (
      SELECT 1 FROM public.guardian_student_links gl
      WHERE gl.guardian_id = (SELECT auth.uid())
        AND gl.learner_id = learner_reports.learner_id
        AND gl.status = 'active'
        AND learner_reports.status = 'published'
    )
    OR ((created_by = (SELECT auth.uid())) AND public.has_role('teacher'::public.app_role))
    OR public.has_role('admin'::public.app_role)
  )
);

-- Ensure application submission requires an active, email-confirmed account.
CREATE OR REPLACE FUNCTION public.submit_teacher_application(
  p_qualifications text,
  p_experience text,
  p_subjects text[],
  p_curricula text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  applicant_id uuid := (SELECT auth.uid());
BEGIN
  IF applicant_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles AS p
    JOIN auth.users AS u ON u.id = p.id
    WHERE p.id = applicant_id
      AND p.account_status = 'active'
      AND u.email_confirmed_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Active account with confirmed email required';
  END IF;

  IF p_qualifications IS NULL
     OR length(btrim(p_qualifications)) < 2
     OR length(p_qualifications) > 5000 THEN
    RAISE EXCEPTION 'Please provide your qualifications (up to 5,000 characters)';
  END IF;

  IF p_experience IS NOT NULL AND length(p_experience) > 5000 THEN
    RAISE EXCEPTION 'Experience must be 5,000 characters or fewer';
  END IF;

  IF p_subjects IS NULL OR cardinality(p_subjects) = 0
     OR EXISTS (
       SELECT 1 FROM unnest(p_subjects) AS item(value)
       WHERE value IS NULL OR length(btrim(value)) = 0 OR length(value) > 120
     ) THEN
    RAISE EXCEPTION 'Add at least one valid subject';
  END IF;

  IF p_curricula IS NULL OR cardinality(p_curricula) = 0
     OR EXISTS (
       SELECT 1 FROM unnest(p_curricula) AS item(value)
       WHERE value IS NULL OR length(btrim(value)) = 0 OR length(value) > 120
     ) THEN
    RAISE EXCEPTION 'Add at least one valid curriculum';
  END IF;

  UPDATE public.teacher_applications
  SET qualifications = btrim(p_qualifications),
      experience = nullif(btrim(coalesce(p_experience, '')), ''),
      subjects = (
        SELECT array_agg(DISTINCT btrim(value))
        FROM unnest(p_subjects) AS item(value)
      ),
      curricula = (
        SELECT array_agg(DISTINCT btrim(value))
        FROM unnest(p_curricula) AS item(value)
      ),
      status = 'submitted',
      submitted_at = now(),
      updated_at = now()
  WHERE user_id = applicant_id AND status = 'draft';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No editable draft application was found';
  END IF;
END;
$function$;

REVOKE ALL ON FUNCTION public.submit_teacher_application(text, text, text[], text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_teacher_application(text, text, text[], text[]) TO authenticated;

