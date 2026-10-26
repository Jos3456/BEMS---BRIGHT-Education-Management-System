import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { saveDraftMark } from "./actions";

export const instant = false;

type SearchParams = { assessment_id?: string; saved?: string; error?: string };
type Assessment = {
  id: string; title: string; subject_name: string; course_name: string | null;
  assessment_type: string; max_score: number; status: string;
};
type Assignment = { id: string; learner_id: string; subject_name: string; course_name: string | null };
type LearnerProfile = { id: string; full_name: string | null };
type AssessmentResult = {
  id: string; learner_id: string; score: number | null;
  teacher_feedback: string | null; status: "draft" | "published";
};

export default async function TeacherMarksPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await connection();
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user || !user.email_confirmed_at) redirect("/login");

  const { data: profile } = await supabase.from("profiles")
    .select("full_name, account_status").eq("id", user.id).maybeSingle();
  if (!profile || profile.account_status !== "active") redirect("/login");

  const { data: teacherRole } = await supabase.from("user_roles")
    .select("role").eq("user_id", user.id).eq("role", "teacher").maybeSingle();
  if (!teacherRole) redirect("/dashboard");

  const { data: assessmentRows, error: assessmentsError } = await supabase.from("learning_assessments")
    .select("id, title, subject_name, course_name, assessment_type, max_score, status")
    .eq("teacher_id", user.id).neq("status", "closed").order("created_at", { ascending: false });
  const assessments = (assessmentRows ?? []) as Assessment[];
  const selectedAssessment = assessments.find((assessment) => assessment.id === params.assessment_id) ?? null;

  let assignments: Assignment[] = [];
  let learnerProfiles: LearnerProfile[] = [];
  let results: AssessmentResult[] = [];
  let assignmentsError = false;
  let profilesError = false;
  let resultsError = false;

  if (selectedAssessment) {
    const assignmentResponse = await supabase.from("teacher_learner_assignments")
      .select("id, learner_id, subject_name, course_name")
      .eq("teacher_id", user.id).eq("subject_name", selectedAssessment.subject_name).eq("status", "active");
    assignmentsError = Boolean(assignmentResponse.error);
    assignments = ((assignmentResponse.data ?? []) as Assignment[]).filter(
      (assignment) => assignment.course_name === null || assignment.course_name === selectedAssessment.course_name,
    );
    const learnerIds = [...new Set(assignments.map((assignment) => assignment.learner_id))];

    if (learnerIds.length) {
      const profileResponse = await supabase.from("profiles").select("id, full_name, account_status").in("id", learnerIds).eq("account_status", "active");
      learnerProfiles = (profileResponse.data ?? []) as LearnerProfile[];
      profilesError = Boolean(profileResponse.error) || learnerProfiles.length < learnerIds.length;
      const visibleLearnerIds = new Set(learnerProfiles.map((item) => item.id));
      assignments = assignments.filter((assignment) => visibleLearnerIds.has(assignment.learner_id));
    }

    const resultResponse = await supabase.from("assessment_results")
      .select("id, learner_id, score, teacher_feedback, status").eq("assessment_id", selectedAssessment.id);
    resultsError = Boolean(resultResponse.error);
    results = (resultResponse.data ?? []) as AssessmentResult[];
  }

  const learners = assignments.map((assignment) => ({
    assignment,
    profile: learnerProfiles.find((item) => item.id === assignment.learner_id),
    result: results.find((item) => item.learner_id === assignment.learner_id),
  })).sort((a, b) => (a.profile?.full_name ?? "Learner").localeCompare(b.profile?.full_name ?? "Learner"));

  return (
    <main className="min-h-screen bg-[#f7faff] px-4 py-6 text-[#17324f] sm:px-8 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e1eaf5] bg-white p-4 shadow-sm sm:p-5">
          <a href="/dashboard/teacher" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#174a8b] font-bold text-white">B</span>
            <span><span className="block font-bold">BRIGHT Education</span><span className="mt-0.5 block text-[0.65rem] tracking-[0.15em] text-[#71849b]">MARKS ENTRY</span></span>
          </a>
          <nav className="flex items-center gap-2">
            <a href="/dashboard/teacher" className="rounded-xl px-3 py-2 text-sm font-semibold text-[#47627f] hover:bg-[#f0f6ff]">Teacher portal</a>
            <a href="/dashboard" className="rounded-xl px-3 py-2 text-sm font-semibold text-[#47627f] hover:bg-[#f0f6ff]">Dashboard</a>
          </nav>
        </header>

        <section className="mt-7 rounded-[1.75rem] bg-gradient-to-br from-[#153d70] to-[#2b72b8] p-7 text-white sm:p-10">
          <p className="text-xs font-bold tracking-[0.2em] text-[#c9e0ff]">ASSESSMENT RECORDS</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Enter learner marks</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">Welcome{profile.full_name ? ", " + profile.full_name : ""}. Marks are saved as drafts and are not visible to learners until a separate publishing workflow is implemented.</p>
        </section>

        {params.saved === "1" && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">Draft mark saved successfully.</p>}
        {params.error === "invalid_form" && <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Check the form and try again. Feedback must be 2,000 characters or fewer.</p>}
        {params.error === "invalid_score" && <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Enter a valid score of zero or more, or leave the score blank while it is ungraded.</p>}
        {params.error === "score_too_high" && <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">The score cannot exceed this assessment’s maximum score.</p>}
        {params.error === "published_locked" && <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">This result is already published and is locked from teacher editing.</p>}
        {params.error === "not_authorized" && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">You are not authorized to edit marks for that assessment or learner.</p>}
        {params.error === "save_failed" && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">The draft could not be saved. No published result was changed. Please retry or check the database policies.</p>}

        <section className="mt-6 rounded-2xl border border-[#e1eaf5] bg-white p-5 shadow-sm sm:p-7">
          <label htmlFor="assessment_id" className="block text-sm font-semibold">Choose an assessment</label>
          {assessmentsError ? <p role="alert" className="mt-3 text-sm text-rose-700">We could not load your assessments. Refresh the page to try again.</p>
          : assessments.length === 0 ? <div className="mt-4 rounded-xl border border-dashed border-[#dce7f3] p-5"><p className="font-semibold">No assessments available</p><p className="mt-2 text-sm leading-6 text-[#71849b]">Create an assessment in the teacher portal first. Closed assessments are not available for new marks entry.</p><a href="/dashboard/teacher" className="mt-4 inline-flex rounded-xl bg-[#174a8b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#123b70]">Go to teacher portal</a></div>
          : <form method="get" className="mt-3 flex flex-col gap-3 sm:flex-row">
              <select id="assessment_id" name="assessment_id" defaultValue={selectedAssessment?.id ?? ""} required className="min-h-11 flex-1 rounded-xl border border-[#dce7f3] bg-white px-3 py-2 text-sm">
                <option value="" disabled>Select an assessment…</option>
                {assessments.map((assessment) => <option key={assessment.id} value={assessment.id}>{assessment.title} — {assessment.subject_name}{assessment.course_name ? " · " + assessment.course_name : ""} ({assessment.max_score} marks)</option>)}
              </select>
              <button type="submit" className="rounded-xl bg-[#174a8b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#123b70]">Load learners</button>
            </form>}
        </section>

        {selectedAssessment && <section className="mt-6 rounded-2xl border border-[#e1eaf5] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-semibold">{selectedAssessment.title}</h2><p className="mt-1 text-sm text-[#71849b]">{selectedAssessment.subject_name}{selectedAssessment.course_name ? " · " + selectedAssessment.course_name : ""}</p></div><span className="rounded-full bg-[#eef5ff] px-3 py-1.5 text-xs font-semibold capitalize text-[#174a8b]">{selectedAssessment.status}</span></div>
          <p className="mt-3 text-sm text-[#47627f]">{selectedAssessment.assessment_type.toUpperCase()} · Maximum score: {selectedAssessment.max_score}</p>

          {assignmentsError ? <p role="alert" className="mt-5 text-sm text-rose-700">We could not load your learner assignments. Please refresh the page.</p>
          : profilesError ? <p role="alert" className="mt-5 text-sm text-rose-700">Learner names could not be loaded. Check the assigned-learner profile read policy before entering marks.</p>
          : resultsError ? <p role="alert" className="mt-5 text-sm text-rose-700">Existing marks could not be loaded. Editing is paused to avoid accidentally overwriting a result.</p>
          : learners.length === 0 ? <div className="mt-5 rounded-xl border border-dashed border-[#dce7f3] p-6 text-center"><h3 className="font-semibold">No learners assigned for this subject/course</h3><p className="mt-2 text-sm leading-6 text-[#71849b]">Ask an administrator to assign learners to your teacher account. This page shows only active assignments that match this assessment.</p></div>
          : <div className="mt-5 space-y-4">
              {learners.map(({ assignment, profile: learnerProfile, result }) => <article key={assignment.id} className="rounded-xl border border-[#e1eaf5] p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-semibold">{learnerProfile?.full_name || "Assigned learner"}</h3><p className="mt-1 text-xs text-[#71849b]">Learner reference: {assignment.learner_id.slice(0, 8).toUpperCase()}</p></div><span className={result?.status === "published" ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800" : "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900"}>{result?.status === "published" ? "Published · locked" : result ? "Draft saved" : "Not graded"}</span></div>
                {result?.status === "published" ? <div className="mt-4 rounded-lg bg-[#f7faff] p-4 text-sm"><p><span className="font-semibold">Score:</span> {result.score === null ? "Not recorded" : `${result.score} / ${selectedAssessment.max_score}`}</p>{result.teacher_feedback && <p className="mt-2"><span className="font-semibold">Feedback:</span> {result.teacher_feedback}</p>}<p className="mt-2 text-xs text-[#71849b]">Published results are locked here. Use the approved publishing/adjustment workflow for any correction.</p></div>
                : <form action={saveDraftMark} className="mt-4 grid gap-4 sm:grid-cols-2">
                    <input type="hidden" name="assessment_id" value={selectedAssessment.id} /><input type="hidden" name="learner_id" value={assignment.learner_id} />
                    <div><label htmlFor={`score-${assignment.id}`} className="block text-sm font-semibold">Score (out of {selectedAssessment.max_score})</label><input id={`score-${assignment.id}`} name="score" type="number" min="0" max={selectedAssessment.max_score} step="0.01" defaultValue={result?.score ?? ""} placeholder="Leave blank if ungraded" className="mt-1.5 min-h-11 w-full rounded-xl border border-[#dce7f3] px-3 py-2 text-sm" /></div>
                    <div><label htmlFor={`feedback-${assignment.id}`} className="block text-sm font-semibold">Teacher feedback (optional)</label><textarea id={`feedback-${assignment.id}`} name="teacher_feedback" maxLength={2000} rows={2} defaultValue={result?.teacher_feedback ?? ""} placeholder="Feedback for this learner" className="mt-1.5 w-full rounded-xl border border-[#dce7f3] px-3 py-2 text-sm" /></div>
                    <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2"><p className="text-xs text-[#71849b]">Saving updates this learner’s draft only. It does not publish results.</p><button type="submit" className="rounded-xl bg-[#174a8b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#123b70]">Save draft mark</button></div>
                  </form>}
              </article>)}
            </div>}
        </section>}

        <p className="mt-6 text-xs leading-5 text-[#71849b]">Security note: this page must be paired with the draft-only database policies in the feature migration before it is used against live data.</p>
      </div>
    </main>
  );
}
