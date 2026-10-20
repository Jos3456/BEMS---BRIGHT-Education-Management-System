import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";

export const instant = false;

const assessmentTypes = [
  { value: "quiz", label: "Quiz" },
  { value: "assignment", label: "Assignment" },
  { value: "cat", label: "CAT" },
  { value: "exam", label: "Exam" },
  { value: "project", label: "Project" },
  { value: "practice", label: "Practice" },
  { value: "other", label: "Other" },
] as const;

async function createAssessment(formData: FormData) {
  "use server";

    const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || !user.email_confirmed_at) {
    redirect("/login");
  }

  // Reject suspended or otherwise inactive accounts.
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.account_status !== "active") {
    redirect("/login");
  }

  // Confirm the user still has the teacher role.
  const { data: teacherRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "teacher")
    .maybeSingle();

  if (!teacherRole) redirect("/dashboard");

  const readText = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
  };

  const title = readText("title");
  const subjectName = readText("subject_name");
  const courseName = readText("course_name");
  const description = readText("description");
  const assessmentType = readText("assessment_type");
  const maxScore = Number(readText("max_score"));
  const assessmentDate = readText("assessment_date");
  const dueDate = readText("due_date");
  const validTypes = assessmentTypes.map((item) => item.value);

  if (
    !title || title.length > 120 ||
    !subjectName || subjectName.length > 120 ||
    !validTypes.includes(assessmentType as (typeof assessmentTypes)[number]["value"]) ||
    !Number.isFinite(maxScore) || maxScore <= 0 || maxScore > 10000 ||
    description.length > 2000 || courseName.length > 120
  ) {
    redirect("/dashboard/teacher?error=invalid_form");
  }

  if (
    (assessmentDate && !/^\d{4}-\d{2}-\d{2}$/.test(assessmentDate)) ||
    (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate))
  ) {
    redirect("/dashboard/teacher?error=invalid_form");
  }

  const { error } = await supabase.from("learning_assessments").insert({
    title,
    subject_name: subjectName,
    course_name: courseName || null,
    description: description || null,
    assessment_type: assessmentType,
    max_score: maxScore,
    assessment_date: assessmentDate || null,
    due_date: dueDate || null,
    teacher_id: user.id,
    status: "draft",
  });

  if (error) redirect("/dashboard/teacher?error=save_failed");

  revalidatePath("/dashboard/teacher");
  redirect("/dashboard/teacher?created=1");
}

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

type TeacherPageProps = {
  searchParams: Promise<{ created?: string; error?: string }>;
};

export default async function TeacherPage({ searchParams }: TeacherPageProps) {
  await connection();
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user || !user.email_confirmed_at) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, account_status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.account_status !== "active") redirect("/login");

  const { data: teacherRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "teacher")
    .maybeSingle();

  if (!teacherRole) redirect("/dashboard");

  const { data: assessments, error: assessmentsError } = await supabase
    .from("learning_assessments")
    .select("id, title, subject_name, course_name, assessment_type, max_score, assessment_date, due_date, status, created_at")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#f7faff] px-4 py-6 text-[#17324f] sm:px-8 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e1eaf5] bg-white p-4 shadow-sm sm:p-5">
          <a href="/dashboard" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#174a8b] font-bold text-white">B</span>
            <span>
              <span className="block font-bold">BRIGHT Education</span>
              <span className="mt-0.5 block text-[0.65rem] tracking-[0.15em] text-[#71849b]">TEACHER PORTAL</span>
            </span>
          </a>
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="rounded-xl px-3 py-2 text-sm font-semibold text-[#47627f] hover:bg-[#f0f6ff]">Dashboard</a>
            <form action={signOut}>
              <button type="submit" className="rounded-xl border border-[#dce7f3] px-4 py-2 text-sm font-semibold transition hover:bg-[#f0f6ff]">Sign out</button>
            </form>
          </div>
        </header>

        <section className="mt-7 rounded-[1.75rem] bg-gradient-to-br from-[#153d70] to-[#2b72b8] p-7 text-white sm:p-10">
          <p className="text-xs font-bold tracking-[0.2em] text-[#c9e0ff]">TEACH · TRACK · SUPPORT</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Welcome{profile.full_name ? ", " + profile.full_name : ""}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">Create quizzes, assignments, CATs, and exams, then use the results to help learners understand where they are improving.</p>
        </section>

        {params.created === "1" && (
          <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Assessment saved as a draft.
          </p>
        )}
        {params.error === "invalid_form" && (
          <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Check the form: add a title and subject, choose a valid type, and enter a maximum score greater than zero.
          </p>
        )}
        {params.error === "save_failed" && (
          <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            The assessment could not be saved. Please try again. If it keeps happening, we will check the database policy and server logs.
          </p>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
          <section className="rounded-2xl border border-[#e1eaf5] bg-white p-5 shadow-sm sm:p-7">
            <div>
              <h2 className="text-xl font-semibold">Create an assessment</h2>
              <p className="mt-1 text-sm leading-6 text-[#71849b]">New assessments start as drafts, so you can review them before learners see them.</p>
            </div>

            <form action={createAssessment} className="mt-6 space-y-4">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-sm font-semibold">Assessment title</label>
                <input id="title" name="title" required maxLength={120} placeholder="e.g. Algebra CAT 1" className="w-full rounded-xl border border-[#dce7f3] bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#2b72b8] focus:ring-2 focus:ring-[#2b72b8]/15" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="subject_name" className="mb-1.5 block text-sm font-semibold">Subject</label>
                  <input id="subject_name" name="subject_name" required maxLength={120} placeholder="e.g. Mathematics" className="w-full rounded-xl border border-[#dce7f3] px-3.5 py-3 text-sm outline-none focus:border-[#2b72b8] focus:ring-2 focus:ring-[#2b72b8]/15" />
                </div>
                <div>
                  <label htmlFor="assessment_type" className="mb-1.5 block text-sm font-semibold">Assessment type</label>
                  <select id="assessment_type" name="assessment_type" required defaultValue="assignment" className="w-full rounded-xl border border-[#dce7f3] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#2b72b8] focus:ring-2 focus:ring-[#2b72b8]/15">
                    {assessmentTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="course_name" className="mb-1.5 block text-sm font-semibold">Course or learning programme <span className="font-normal text-[#71849b]">(optional)</span></label>
                <input id="course_name" name="course_name" maxLength={120} placeholder="e.g. IGCSE Year 10" className="w-full rounded-xl border border-[#dce7f3] px-3.5 py-3 text-sm outline-none focus:border-[#2b72b8] focus:ring-2 focus:ring-[#2b72b8]/15" />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="max_score" className="mb-1.5 block text-sm font-semibold">Maximum marks</label>
                  <input id="max_score" name="max_score" type="number" min="0.01" max="10000" step="any" required defaultValue="100" className="w-full rounded-xl border border-[#dce7f3] px-3.5 py-3 text-sm outline-none focus:border-[#2b72b8] focus:ring-2 focus:ring-[#2b72b8]/15" />
                </div>
                <div>
                  <label htmlFor="assessment_date" className="mb-1.5 block text-sm font-semibold">Assessment date</label>
                  <input id="assessment_date" name="assessment_date" type="date" className="w-full rounded-xl border border-[#dce7f3] px-3 py-3 text-sm outline-none focus:border-[#2b72b8] focus:ring-2 focus:ring-[#2b72b8]/15" />
                </div>
                <div>
                  <label htmlFor="due_date" className="mb-1.5 block text-sm font-semibold">Due date</label>
                  <input id="due_date" name="due_date" type="date" className="w-full rounded-xl border border-[#dce7f3] px-3 py-3 text-sm outline-none focus:border-[#2b72b8] focus:ring-2 focus:ring-[#2b72b8]/15" />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="mb-1.5 block text-sm font-semibold">Instructions or notes <span className="font-normal text-[#71849b]">(optional)</span></label>
                <textarea id="description" name="description" rows={3} maxLength={2000} placeholder="Add the topics covered or instructions for learners." className="w-full resize-y rounded-xl border border-[#dce7f3] px-3.5 py-3 text-sm outline-none focus:border-[#2b72b8] focus:ring-2 focus:ring-[#2b72b8]/15" />
              </div>

              <button type="submit" className="w-full rounded-xl bg-[#174a8b] px-5 py-3 font-semibold text-white transition hover:bg-[#123d75] sm:w-auto">Save as draft</button>
            </form>
          </section>

          <div className="space-y-6">
            <section className="rounded-2xl border border-[#e1eaf5] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Your assessments</h2>
                  <p className="mt-1 text-sm text-[#71849b]">Assessments you have created.</p>
                </div>
                <span className="rounded-lg bg-[#eef5ff] px-3 py-1.5 text-sm font-bold text-[#174a8b]">{assessments?.length ?? 0}</span>
              </div>

              {assessmentsError ? (
                <p className="mt-5 text-sm text-rose-700">We could not load your assessments. Refresh the page to try again.</p>
              ) : !assessments?.length ? (
                <div className="mt-5 rounded-xl border border-dashed border-[#dce7f3] p-5 text-center">
                  <p className="font-semibold">Nothing here yet</p>
                  <p className="mt-2 text-sm leading-6 text-[#71849b]">Your saved assessments will appear here after you create your first one.</p>
                </div>
              ) : (
                <ul className="mt-5 space-y-3">
                  {assessments.map((assessment) => (
                    <li key={assessment.id} className="rounded-xl border border-[#e1eaf5] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{assessment.title}</h3>
                          <p className="mt-1 text-sm text-[#71849b]">{assessment.subject_name}{assessment.course_name ? " · " + assessment.course_name : ""}</p>
                        </div>
                        <span className="rounded-full bg-[#f0f6ff] px-2.5 py-1 text-xs font-semibold capitalize text-[#174a8b]">{assessment.status}</span>
                      </div>
                      <p className="mt-3 text-sm text-[#47627f]">{assessment.assessment_type.toUpperCase()} · {assessment.max_score} marks</p>
                      {assessment.due_date && <p className="mt-1 text-xs text-[#71849b]">Due {assessment.due_date}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-[#dbe8fa] bg-[#eef5ff] p-5 sm:p-6">
              <h2 className="font-semibold text-[#174a8b]">Next: enter learner marks</h2>
              <p className="mt-2 text-sm leading-6 text-[#47627f]">Marks entry will be enabled after an administrator assigns learners to your subject or course. This keeps each teacher limited to the learners they are responsible for.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
