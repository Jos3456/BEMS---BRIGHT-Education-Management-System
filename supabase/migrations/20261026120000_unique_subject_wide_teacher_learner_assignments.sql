-- Enforce uniqueness for subject-wide assignments where course_name is NULL.
-- PostgreSQL's ordinary UNIQUE constraint treats NULL values as distinct, so the
-- existing (teacher_id, learner_id, subject_name, course_name) constraint does
-- not prevent duplicate rows when course_name is NULL.
--
-- This migration only adds an index. It does not alter or delete assignment rows.
-- If duplicate subject-wide rows exist when this migration runs, index creation
-- will fail safely and those rows must be reviewed before retrying.

CREATE UNIQUE INDEX IF NOT EXISTS teacher_learner_assignments_subject_wide_unique
  ON public.teacher_learner_assignments (teacher_id, learner_id, subject_name)
  WHERE course_name IS NULL;
