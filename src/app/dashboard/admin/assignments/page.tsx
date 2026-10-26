import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { assignLearnersToTeacher, setTeacherLearnerAssignmentStatus } from "./actions";

export const instant = false;

type Person = { id: string; full_name: string | null; account_status: string };
type Assignment = {
  id: string;
  teacher_id: string;
  learner_id: string;
  subject_name: string;
  course_name: string | null;
  status: "active" | "revoked";
  created_at: string;
};

export default async function TeacherLearnerAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
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

  const { data: adminRole, error: roleError } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (roleError || !adminRole) redirect("/dashboard");

  const [teacherRoleRows, studentRoleRows, assignmentResponse] = await Promise.all([
    supabase.from("user_roles").select("user_id").eq("role", "teacher"),
    supabase.from("user_roles").select("user_id").eq("role", "student"),
    supabase.from("teacher_learner_assignments")
      .select("id, teacher_id, learner_id, subject_name, course_name, status, created_at")
      .order("created_at", { ascending: false }).limit(300),
  ]);

  const teacherIds = [...new Set((teacherRoleRows.data ?? []).map((item) => item.user_id))];
  const studentIds = [...new Set((studentRoleRows.data ?? []).map((item) => item.user_id))];
  const [teacherProfilesResponse, studentProfilesResponse] = await Promise.all([
    supabase.from("profiles").select("id, full_name, account_status")
      .in("id", teacherIds.length ? teacherIds : ["00000000-0000-0000-0000-000000000000"])
      .eq("account_status", "active").order("full_name"),
    supabase.from("profiles").select("id, full_name, account_status")
      .in("id", studentIds.length ? studentIds : ["00000000-0000-0000-0000-000000000000"])
      .eq("account_status", "active").order("full_name"),
  ]);

  const teachers = (teacherProfilesResponse.data ?? []) as Person[];
  const learners = (studentProfilesResponse.data ?? []) as Person[];
  const assignments = (assignmentResponse.data ?? []) as Assignment[];
  const peopleById = new Map<string, Person>();
  for (const person of [...teachers, ...learners]) peopleById.set(person.id, person);

  const loadError = Boolean(
    teacherRoleRows.error || studentRoleRows.error || assignmentResponse.error ||
    teacherProfilesResponse.error || studentProfilesResponse.error,
  );

  const successMessage = params.saved === "1"
    ? `Assignment update complete: ${params.assigned ?? "0"} new/reactivated and ${params.existing ?? "0"} already active.`
    : params.status === "revoked"
      ? "Assignment revoked. The teacher will no longer see this learner for that subject/course."
      : params.status === "reactivated"
        ? "Assignment reactivated."
        : null;

  const errorMessages: Record<string, string> = {
    invalid_form: "Complete the required fields and select at least one learner.",
    invalid_teacher: "Choose an active teacher account.",
    invalid_learner: "Every selected learner must be an active student account.",
    load_failed: "Teacher or learner details could not be verified. Refresh and try again.",
    save_failed: "The assignment could not be saved. Check database permissions and try again.",
  };

  return (
    <main className="min-h-screen bg-[#f7faff] p-6 text-[#17324f] sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#52749a]">BRIGHT Education</p>
            <h1 className="mt-1 text-3xl font-bold">Teacher–learner assignments</h1>
            <p className="mt-2 text-sm text-[#71849b]">
              Assign active students to an active teacher by subject and optional course.
            </p>
          </div>
          <a href="/dashboard/admin" className="rounded-xl border border-[#dce7f3] bg-white px-4 py-2 text-sm font-semibold hover:bg-[#f0f6ff]">
            Back to administration
          </a>
        </header>

        {successMessage && <p role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{successMessage}</p>}
        {params.error && <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorMessages[params.error] ?? "Something went wrong. Refresh and try again."}</p>}

        <section className="mt-8 rounded-2xl border border-[#e1eaf5] bg-white p-6 shadow-sm sm:p-7">
          <h2 className="text-xl font-bold">Create or reactivate assignments</h2>
          <p className="mt-2 text-sm leading-6 text-[#71849b]">
            You can select multiple students for the same teacher, subject and course. Existing active assignments are kept as they are; revoked matching assignments are reactivated instead of duplicated.
          </p>

          {loadError ? (
            <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">Some assignment data could not be loaded. Refresh the page or check Supabase permissions before making changes.</p>
          ) : teachers.length === 0 || learners.length === 0 ? (
            <p className="mt-5 rounded-xl bg-[#f7faff] p-4 text-sm text-[#71849b]">
              {teachers.length === 0 ? "No active teacher accounts are available." : "No active student accounts are available."} Assignments can be created once both account types are available.
            </p>
          ) : (
            <form action={assignLearnersToTeacher} className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Teacher *
                <select name="teacher_id" required defaultValue="" className="mt-2 min-h-12 w-full rounded-xl border border-[#dce7f3] bg-white px-3 py-2 text-sm">
                  <option value="" disabled>Select a teacher</option>
                  {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.full_name || "Unnamed teacher"} · {teacher.id.slice(0, 8)}</option>)}
                </select>
              </label>

              <label className="text-sm font-semibold">
                Subject *
                <input name="subject_name" required maxLength={120} placeholder="e.g. Mathematics" className="mt-2 min-h-12 w-full rounded-xl border border-[#dce7f3] px-3 py-2 text-sm" />
              </label>

              <label className="text-sm font-semibold">
                Course / class (optional)
                <input name="course_name" maxLength={120} placeholder="e.g. Form 2 Blue or Biology 101" className="mt-2 min-h-12 w-full rounded-xl border border-[#dce7f3] px-3 py-2 text-sm" />
                <span className="mt-1 block text-xs font-normal text-[#71849b]">Leave blank for a subject-wide assignment.</span>
              </label>

              <label className="text-sm font-semibold">
                Students * <span className="font-normal text-[#71849b]">(select one or more)</span>
                <select name="learner_ids" required multiple size={6} className="mt-2 w-full rounded-xl border border-[#dce7f3] bg-white px-3 py-2 text-sm">
                  {learners.map((learner) => <option key={learner.id} value={learner.id}>{learner.full_name || "Unnamed student"} · {learner.id.slice(0, 8)}</option>)}
                </select>
                <span className="mt-1 block text-xs font-normal text-[#71849b]">On Windows, hold Ctrl while clicking to select multiple students.</span>
              </label>

              <div className="sm:col-span-2">
                <button type="submit" className="rounded-xl bg-[#174a8b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#123b70]">
                  Save assignments
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-[#e1eaf5] bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Existing assignments</h2>
              <p className="mt-1 text-sm text-[#71849b]">The latest 300 assignments are shown, including revoked assignments.</p>
            </div>
            <span className="rounded-full bg-[#eef5ff] px-3 py-1.5 text-xs font-semibold text-[#174a8b]">{assignments.length} shown</span>
          </div>

          {loadError ? <p className="mt-5 text-sm text-red-700">Assignments could not be loaded.</p>
          : assignments.length === 0 ? <p className="mt-5 rounded-xl bg-[#f7faff] p-5 text-sm text-[#71849b]">No teacher–learner assignments have been created yet.</p>
          : <div className="mt-5 space-y-3">
            {assignments.map((assignment) => {
              const teacher = peopleById.get(assignment.teacher_id);
              const learner = peopleById.get(assignment.learner_id);
              const active = assignment.status === "active";
              return (
                <article key={assignment.id} className="rounded-xl border border-[#e1eaf5] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold">{learner?.full_name || "Student account unavailable"}</h3>
                      <p className="mt-1 text-sm text-[#47627f]">Teacher: {teacher?.full_name || "Teacher account unavailable"}</p>
                      <p className="mt-1 text-sm text-[#71849b]">{assignment.subject_name}{assignment.course_name ? ` · ${assignment.course_name}` : " · All courses"}</p>
                      <p className="mt-1 text-xs text-[#71849b]">Created {new Date(assignment.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={active ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800" : "rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"}>{active ? "Active" : "Revoked"}</span>
                  </div>
                  <form action={setTeacherLearnerAssignmentStatus} className="mt-4 border-t border-[#e1eaf5] pt-4">
                    <input type="hidden" name="assignment_id" value={assignment.id} />
                    <input type="hidden" name="next_status" value={active ? "revoked" : "active"} />
                    <button type="submit" className={active ? "rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50" : "rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"}>
                      {active ? "Revoke assignment" : "Reactivate assignment"}
                    </button>
                  </form>
                </article>
              );
            })}
          </div>}
        </section>
      </div>
    </main>
  );
}
