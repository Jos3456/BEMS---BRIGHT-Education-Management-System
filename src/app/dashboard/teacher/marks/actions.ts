 "use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function saveDraftMark(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user || !user.email_confirmed_at) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("account_status").eq("id", user.id).maybeSingle();
  if (!profile || profile.account_status !== "active") redirect("/login");

  const { data: teacherRole } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "teacher").maybeSingle();
  if (!teacherRole) redirect("/dashboard");

  const readText = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
  };
  const assessmentId = readText("assessment_id");
  const learnerId = readText("learner_id");
  const rawScore = readText("score");
  const feedback = readText("teacher_feedback");

  if (!assessmentId || !learnerId || feedback.length > 2000) redirect("/dashboard/teacher/marks?error=invalid_form");

  let score: number | null = null;
  if (rawScore !== "") {
    score = Number(rawScore);
    if (!Number.isFinite(score) || score < 0) redirect(`/dashboard/teacher/marks?assessment_id=${encodeURIComponent(assessmentId)}&error=invalid_score`);
  }

  const { data: assessment, error: assessmentError } = await supabase.from("learning_assessments")
    .select("id, subject_name, course_name, max_score, status")
    .eq("id", assessmentId).eq("teacher_id", user.id).maybeSingle();

  if (assessmentError || !assessment || assessment.status === "closed") redirect("/dashboard/teacher/marks?error=not_authorized");
  if (score !== null && score > Number(assessment.max_score)) redirect(`/dashboard/teacher/marks?assessment_id=${encodeURIComponent(assessmentId)}&error=score_too_high`);

  const { data: assignments, error: assignmentError } = await supabase.from("teacher_learner_assignments")
    .select("id, learner_id, subject_name, course_name")
    .eq("teacher_id", user.id).eq("learner_id", learnerId)
    .eq("subject_name", assessment.subject_name).eq("status", "active");

  const hasAssignment = !assignmentError && (assignments ?? []).some(
    (assignment) => assignment.course_name === null || assignment.course_name === assessment.course_name,
  );
  if (!hasAssignment) redirect(`/dashboard/teacher/marks?assessment_id=${encodeURIComponent(assessmentId)}&error=not_authorized`);

  const { data: currentResult, error: currentResultError } = await supabase.from("assessment_results")
    .select("status").eq("assessment_id", assessmentId).eq("learner_id", learnerId).maybeSingle();
  if (currentResultError) redirect(`/dashboard/teacher/marks?assessment_id=${encodeURIComponent(assessmentId)}&error=save_failed`);
  if (currentResult?.status === "published") redirect(`/dashboard/teacher/marks?assessment_id=${encodeURIComponent(assessmentId)}&error=published_locked`);

  const { error: saveError } = await supabase.from("assessment_results").upsert({
    assessment_id: assessmentId,
    learner_id: learnerId,
    score,
    teacher_feedback: feedback || null,
    status: "draft",
    graded_by: user.id,
    graded_at: score === null ? null : new Date().toISOString(),
  }, { onConflict: "assessment_id,learner_id" });

  if (saveError) redirect(`/dashboard/teacher/marks?assessment_id=${encodeURIComponent(assessmentId)}&error=save_failed`);
  revalidatePath("/dashboard/teacher/marks");
  revalidatePath("/dashboard/teacher");
  redirect(`/dashboard/teacher/marks?assessment_id=${encodeURIComponent(assessmentId)}&saved=1`);
}
