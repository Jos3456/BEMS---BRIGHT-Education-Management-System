-- BEMS: make the current row-level security policy expressions reproducible.
-- This forward migration restates each existing public policy in place; it does not
-- drop policies or alter application data. Expressions are sourced from pg_policies.

ALTER POLICY "Admins manage academic periods" ON "public"."academic_periods"
USING ((is_active_user() AND (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'admin'::app_role))))))
WITH CHECK ((is_active_user() AND (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'admin'::app_role))))));

ALTER POLICY "Signed-in users can read academic periods" ON "public"."academic_periods"
USING ((is_active_user() AND true));

ALTER POLICY "Admins delete assessment results" ON "public"."assessment_results"
USING ((is_active_user() AND (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'admin'::app_role))))));

ALTER POLICY "Authorized users read assessment results" ON "public"."assessment_results"
USING ((is_active_user() AND (((learner_id = ( SELECT auth.uid() AS uid)) AND (status = 'published'::text)) OR (EXISTS ( SELECT 1
   FROM guardian_student_links gl
  WHERE ((gl.guardian_id = ( SELECT auth.uid() AS uid)) AND (gl.learner_id = assessment_results.learner_id) AND (gl.status = 'active'::text) AND (assessment_results.status = 'published'::text)))) OR (has_role('teacher'::app_role) AND (EXISTS ( SELECT 1
   FROM (learning_assessments a
     JOIN teacher_learner_assignments tla ON (((tla.teacher_id = a.teacher_id) AND (tla.learner_id = assessment_results.learner_id) AND (tla.subject_name = a.subject_name) AND (tla.status = 'active'::text) AND ((tla.course_name IS NULL) OR (tla.course_name = a.course_name)))))
  WHERE ((a.id = assessment_results.assessment_id) AND (a.teacher_id = ( SELECT auth.uid() AS uid)))))) OR has_role('admin'::app_role))));

ALTER POLICY "Teachers enter results for their own assessments" ON "public"."assessment_results"
WITH CHECK ((is_active_user() AND ((EXISTS ( SELECT 1
   FROM learning_assessments a
  WHERE ((a.id = assessment_results.assessment_id) AND (a.teacher_id = auth.uid())))) AND (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'teacher'::app_role)))) AND (EXISTS ( SELECT 1
   FROM (learning_assessments a
     JOIN teacher_learner_assignments tla ON (((tla.teacher_id = a.teacher_id) AND (tla.learner_id = assessment_results.learner_id) AND (tla.subject_name = a.subject_name) AND (tla.status = 'active'::text) AND ((tla.course_name IS NULL) OR (tla.course_name = a.course_name)))))
  WHERE (a.id = assessment_results.assessment_id))) AND ((score IS NULL) OR (score <= ( SELECT a.max_score
   FROM learning_assessments a
  WHERE (a.id = assessment_results.assessment_id)))))));

ALTER POLICY "Teachers update results for their own assessments" ON "public"."assessment_results"
USING ((is_active_user() AND ((has_role('teacher'::app_role) AND (EXISTS ( SELECT 1
   FROM (learning_assessments a
     JOIN teacher_learner_assignments tla ON (((tla.teacher_id = a.teacher_id) AND (tla.learner_id = assessment_results.learner_id) AND (tla.subject_name = a.subject_name) AND (tla.status = 'active'::text) AND ((tla.course_name IS NULL) OR (tla.course_name = a.course_name)))))
  WHERE ((a.id = assessment_results.assessment_id) AND (a.teacher_id = ( SELECT auth.uid() AS uid)))))) OR has_role('admin'::app_role))))
WITH CHECK ((is_active_user() AND ((has_role('teacher'::app_role) AND (EXISTS ( SELECT 1
   FROM (learning_assessments a
     JOIN teacher_learner_assignments tla ON (((tla.teacher_id = a.teacher_id) AND (tla.learner_id = assessment_results.learner_id) AND (tla.subject_name = a.subject_name) AND (tla.status = 'active'::text) AND ((tla.course_name IS NULL) OR (tla.course_name = a.course_name)))))
  WHERE ((a.id = assessment_results.assessment_id) AND (a.teacher_id = ( SELECT auth.uid() AS uid)))))) OR has_role('admin'::app_role)) AND ((score IS NULL) OR (score <= ( SELECT a.max_score
   FROM learning_assessments a
  WHERE (a.id = assessment_results.assessment_id))))));

ALTER POLICY "Admins manage grade scale rules" ON "public"."grade_scale_rules"
USING ((is_active_user() AND (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'admin'::app_role))))))
WITH CHECK ((is_active_user() AND (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'admin'::app_role))))));

ALTER POLICY "Signed-in users can read grade scale rules" ON "public"."grade_scale_rules"
USING ((is_active_user() AND (EXISTS ( SELECT 1
   FROM grade_scales gs
  WHERE ((gs.id = grade_scale_rules.grade_scale_id) AND (gs.is_active OR (EXISTS ( SELECT 1
           FROM user_roles ur
          WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'admin'::app_role))))))))));

ALTER POLICY "Admins manage grade scales" ON "public"."grade_scales"
USING ((is_active_user() AND (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'admin'::app_role))))))
WITH CHECK ((is_active_user() AND (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'admin'::app_role))))));

ALTER POLICY "Signed-in users can read active grade scales" ON "public"."grade_scales"
USING ((is_active_user() AND (is_active OR (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'admin'::app_role)))))));

ALTER POLICY "Admins manage guardian links" ON "public"."guardian_student_links"
USING ((is_active_user() AND (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'admin'::app_role))))))
WITH CHECK ((is_active_user() AND (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'admin'::app_role))))));

ALTER POLICY "Participants and admins read guardian links" ON "public"."guardian_student_links"
USING ((is_active_user() AND ((guardian_id = auth.uid()) OR (learner_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'admin'::app_role)))))));

ALTER POLICY "Admins delete learner reports" ON "public"."learner_reports"
USING ((is_active_user() AND (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'admin'::app_role))))));

ALTER POLICY "Authorized users read learner reports" ON "public"."learner_reports"
USING ((is_active_user() AND (((learner_id = ( SELECT auth.uid() AS uid)) AND (status = 'published'::text)) OR (EXISTS ( SELECT 1
   FROM guardian_student_links gl
  WHERE ((gl.guardian_id = ( SELECT auth.uid() AS uid)) AND (gl.learner_id = learner_reports.learner_id) AND (gl.status = 'active'::text) AND (learner_reports.status = 'published'::text)))) OR ((created_by = ( SELECT auth.uid() AS uid)) AND has_role('teacher'::app_role)) OR has_role('admin'::app_role))));

ALTER POLICY "Teachers create their own learner reports" ON "public"."learner_reports"
WITH CHECK ((is_active_user() AND ((created_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'teacher'::app_role)))) AND (EXISTS ( SELECT 1
   FROM teacher_learner_assignments tla
  WHERE ((tla.teacher_id = auth.uid()) AND (tla.learner_id = learner_reports.learner_id) AND (tla.status = 'active'::text)))))));

ALTER POLICY "Teachers update their own learner reports and admins manage all" ON "public"."learner_reports"
USING ((is_active_user() AND (((created_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'teacher'::app_role)))) AND (EXISTS ( SELECT 1
   FROM teacher_learner_assignments tla
  WHERE ((tla.teacher_id = auth.uid()) AND (tla.learner_id = learner_reports.learner_id) AND (tla.status = 'active'::text))))) OR (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'admin'::app_role)))))))
WITH CHECK ((is_active_user() AND (((created_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'teacher'::app_role)))) AND (EXISTS ( SELECT 1
   FROM teacher_learner_assignments tla
  WHERE ((tla.teacher_id = auth.uid()) AND (tla.learner_id = learner_reports.learner_id) AND (tla.status = 'active'::text))))) OR (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'admin'::app_role)))))));

ALTER POLICY "Admins delete assessments" ON "public"."learning_assessments"
USING ((is_active_user() AND (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'admin'::app_role))))));

ALTER POLICY "Teachers create their own assessments" ON "public"."learning_assessments"
WITH CHECK ((is_active_user() AND ((teacher_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'teacher'::app_role)))))));

ALTER POLICY "Teachers update their own assessments and admins manage all" ON "public"."learning_assessments"
USING ((is_active_user() AND (((teacher_id = ( SELECT auth.uid() AS uid)) AND has_role('teacher'::app_role)) OR has_role('admin'::app_role))))
WITH CHECK ((is_active_user() AND (((teacher_id = ( SELECT auth.uid() AS uid)) AND has_role('teacher'::app_role)) OR has_role('admin'::app_role))));

ALTER POLICY "Users read published assessments or their own" ON "public"."learning_assessments"
USING ((is_active_user() AND (((teacher_id = ( SELECT auth.uid() AS uid)) AND has_role('teacher'::app_role)) OR has_role('admin'::app_role) OR ((status = 'published'::text) AND ((EXISTS ( SELECT 1
   FROM teacher_learner_assignments tla
  WHERE ((tla.teacher_id = learning_assessments.teacher_id) AND (tla.learner_id = ( SELECT auth.uid() AS uid)) AND (tla.subject_name = learning_assessments.subject_name) AND (tla.status = 'active'::text) AND ((tla.course_name IS NULL) OR (tla.course_name = learning_assessments.course_name))))) OR (EXISTS ( SELECT 1
   FROM (guardian_student_links gl
     JOIN teacher_learner_assignments tla ON ((tla.learner_id = gl.learner_id)))
  WHERE ((gl.guardian_id = ( SELECT auth.uid() AS uid)) AND (gl.status = 'active'::text) AND (tla.teacher_id = learning_assessments.teacher_id) AND (tla.subject_name = learning_assessments.subject_name) AND (tla.status = 'active'::text) AND ((tla.course_name IS NULL) OR (tla.course_name = learning_assessments.course_name))))))))));

ALTER POLICY "profiles_select_own_or_admin" ON "public"."profiles"
USING ((is_active_user() AND ((id = ( SELECT auth.uid() AS uid)) OR ( SELECT has_role('admin'::app_role) AS has_role))));

ALTER POLICY "profiles_update_own_active" ON "public"."profiles"
USING ((is_active_user() AND ((id = ( SELECT auth.uid() AS uid)) AND (account_status = 'active'::account_status))))
WITH CHECK ((is_active_user() AND ((id = ( SELECT auth.uid() AS uid)) AND (account_status = 'active'::account_status))));

ALTER POLICY "teacher_applications_select_own_or_admin" ON "public"."teacher_applications"
USING ((is_active_user() AND ((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT has_role('admin'::app_role) AS has_role))));

ALTER POLICY "teacher_applications_update_admin" ON "public"."teacher_applications"
USING ((is_active_user() AND ( SELECT has_role('admin'::app_role) AS has_role)))
WITH CHECK ((is_active_user() AND ( SELECT has_role('admin'::app_role) AS has_role)));

ALTER POLICY "Admins manage teacher learner assignments" ON "public"."teacher_learner_assignments"
USING ((is_active_user() AND (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'admin'::app_role))))))
WITH CHECK ((is_active_user() AND (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'admin'::app_role))))));

ALTER POLICY "Participants linked guardians and admins read teacher learner a" ON "public"."teacher_learner_assignments"
USING ((is_active_user() AND ((teacher_id = auth.uid()) OR (learner_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM guardian_student_links gl
  WHERE ((gl.guardian_id = auth.uid()) AND (gl.learner_id = teacher_learner_assignments.learner_id) AND (gl.status = 'active'::text)))) OR (EXISTS ( SELECT 1
   FROM user_roles ur
  WHERE ((ur.user_id = auth.uid()) AND (ur.role = 'admin'::app_role)))))));

ALTER POLICY "user_roles_insert_admin" ON "public"."user_roles"
WITH CHECK ((is_active_user() AND has_role('admin'::app_role) AND (role <> 'admin'::app_role)));

ALTER POLICY "user_roles_select_own_or_admin" ON "public"."user_roles"
USING ((is_active_user() AND ((user_id = ( SELECT auth.uid() AS uid)) OR ( SELECT has_role('admin'::app_role) AS has_role))));

