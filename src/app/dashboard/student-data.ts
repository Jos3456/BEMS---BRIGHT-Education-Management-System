import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ReportRow,
  ResultRow,
  StudentData,
  SubjectSummary,
  TeacherRow,
  UpcomingRow,
} from "./student-types";

// Supabase can return an embedded relation as an object or a one-element array
// depending on how the relationship is inferred. Accept both.
function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

type GradeRule = { grade_scale_id: string; grade_label: string; min_percentage: number };

function gradeFor(percentage: number, scaleId: string | null, rules: GradeRule[]) {
  if (!scaleId) return null;
  const match = rules
    .filter((rule) => rule.grade_scale_id === scaleId)
    .sort((a, b) => Number(b.min_percentage) - Number(a.min_percentage))
    .find((rule) => percentage >= Number(rule.min_percentage));
  return match ? match.grade_label : null;
}

/**
 * Loads the signed-in learner's own records. Row Level Security already limits
 * learners to published results, and we also filter explicitly so the intent is
 * visible and does not depend on policy alone.
 */
export async function loadStudentData(
  supabase: SupabaseClient,
  learnerId: string,
): Promise<StudentData> {
  // East Africa Time date string (YYYY-MM-DD) for "upcoming" comparisons.
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });

  const [resultsRes, upcomingRes, assignmentsRes, reportsRes] = await Promise.all([
    supabase
      .from("assessment_results")
      .select(
        "id, score, teacher_feedback, graded_at, learning_assessments(id, title, subject_name, course_name, assessment_type, max_score, assessment_date, grade_scale_id)",
      )
      .eq("learner_id", learnerId)
      .eq("status", "published")
      .order("graded_at", { ascending: false, nullsFirst: false })
      .limit(200),
    supabase
      .from("learning_assessments")
      .select("id, title, subject_name, course_name, assessment_type, max_score, due_date")
      .eq("status", "published")
      .gte("due_date", today)
      .order("due_date", { ascending: true })
      .limit(20),
    supabase
      .from("teacher_learner_assignments")
      .select("id, teacher_id, subject_name, course_name")
      .eq("learner_id", learnerId)
      .eq("status", "active")
      .order("subject_name", { ascending: true }),
    supabase
      .from("learner_reports")
      .select(
        "id, title, summary, strengths, areas_to_improve, teacher_comment, published_at, academic_periods(name)",
      )
      .eq("learner_id", learnerId)
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(20),
  ]);

  const loadFailed = Boolean(
    resultsRes.error || upcomingRes.error || assignmentsRes.error || reportsRes.error,
  );

  // Grade labels come from admin-configured scales, never hard-coded boundaries.
  const scaleIds = Array.from(
    new Set(
      (resultsRes.data ?? [])
        .map((row) => one(row.learning_assessments)?.grade_scale_id as string | null | undefined)
        .filter((id): id is string => Boolean(id)),
    ),
  );
  let rules: GradeRule[] = [];
  if (scaleIds.length > 0) {
    const { data } = await supabase
      .from("grade_scale_rules")
      .select("grade_scale_id, grade_label, min_percentage")
      .in("grade_scale_id", scaleIds);
    rules = (data ?? []) as GradeRule[];
  }

  const results: ResultRow[] = [];
  for (const row of resultsRes.data ?? []) {
    const assessment = one(row.learning_assessments);
    // A result whose assessment we cannot read (e.g. a revoked teacher link) is skipped
    // rather than shown without context.
    if (!assessment) continue;
    const maxScore = Number(assessment.max_score);
    const score = row.score === null || row.score === undefined ? null : Number(row.score);
    const percentage =
      score !== null && maxScore > 0 ? round1(Math.min((score / maxScore) * 100, 100)) : null;
    results.push({
      id: row.id,
      title: assessment.title,
      subject: assessment.subject_name,
      course: assessment.course_name ?? null,
      type: assessment.assessment_type,
      score,
      maxScore,
      percentage,
      grade: percentage === null ? null : gradeFor(percentage, assessment.grade_scale_id ?? null, rules),
      feedback: row.teacher_feedback ?? null,
      date: assessment.assessment_date ?? (row.graded_at ? String(row.graded_at).slice(0, 10) : null),
    });
  }

  const scored = results.filter((r) => r.percentage !== null);
  const overallAverage = scored.length
    ? round1(scored.reduce((sum, r) => sum + (r.percentage as number), 0) / scored.length)
    : null;

  const bySubject = new Map<string, number[]>();
  for (const r of scored) {
    bySubject.set(r.subject, [...(bySubject.get(r.subject) ?? []), r.percentage as number]);
  }
  const subjects: SubjectSummary[] = Array.from(bySubject.entries())
    .map(([subject, values]) => ({
      subject,
      count: values.length,
      average: round1(values.reduce((a, b) => a + b, 0) / values.length),
    }))
    .sort((a, b) => a.subject.localeCompare(b.subject));

  const upcoming: UpcomingRow[] = (upcomingRes.data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    subject: row.subject_name,
    course: row.course_name ?? null,
    type: row.assessment_type,
    dueDate: row.due_date as string,
    maxScore: Number(row.max_score),
  }));

  // Teacher names live in profiles. If a policy hides them we still show the subject.
  const teacherIds = Array.from(
    new Set((assignmentsRes.data ?? []).map((row) => row.teacher_id as string)),
  );
  const names = new Map<string, string>();
  if (teacherIds.length > 0) {
    const { data } = await supabase.from("profiles").select("id, full_name").in("id", teacherIds);
    for (const p of data ?? []) {
      if (p.full_name) names.set(p.id, p.full_name);
    }
  }
  const teachers: TeacherRow[] = (assignmentsRes.data ?? []).map((row) => ({
    id: row.id,
    teacherName: names.get(row.teacher_id) ?? null,
    subject: row.subject_name,
    course: row.course_name ?? null,
  }));

  const reports: ReportRow[] = (reportsRes.data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    period: one(row.academic_periods)?.name ?? null,
    summary: row.summary ?? null,
    strengths: row.strengths ?? null,
    areasToImprove: row.areas_to_improve ?? null,
    teacherComment: row.teacher_comment ?? null,
    publishedAt: row.published_at ?? null,
  }));

  return { results, subjects, overallAverage, upcoming, teachers, reports, loadFailed };
}
