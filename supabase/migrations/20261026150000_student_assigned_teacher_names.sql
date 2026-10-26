-- Let a signed-in learner read only the names of teachers assigned to them.
-- Keep profiles protected by RLS rather than granting broad profile visibility.

CREATE OR REPLACE FUNCTION public.student_assigned_teacher_names()
RETURNS TABLE (teacher_id uuid, full_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT tla.teacher_id, p.full_name
  FROM public.teacher_learner_assignments AS tla
  JOIN public.profiles AS p
    ON p.id = tla.teacher_id
  WHERE tla.learner_id = (SELECT auth.uid())
    AND tla.status = 'active'
    AND public.is_active_user()
    AND public.has_role('student'::public.app_role);
$function$;

REVOKE ALL ON FUNCTION public.student_assigned_teacher_names()
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.student_assigned_teacher_names()
  TO authenticated;
