import { connection } from "next/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

function parseList(value: FormDataEntryValue | null) {
  return typeof value === "string"
    ? [...new Set(value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean))]
    : [];
}

async function submitApplication(formData: FormData) {
  "use server";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email_confirmed_at) redirect("/login");

  const qualifications = String(formData.get("qualifications") ?? "").trim();
  const experience = String(formData.get("experience") ?? "").trim();
  const subjects = parseList(formData.get("subjects"));
  const curricula = parseList(formData.get("curricula"));

  if (
    qualifications.length < 2 || qualifications.length > 5000 ||
    experience.length > 5000 ||
    subjects.length === 0 || subjects.some((item) => item.length > 120) ||
    curricula.length === 0 || curricula.some((item) => item.length > 120)
  ) {
    redirect("/dashboard/teacher-application?error=invalid_form");
  }

  const { error } = await supabase.rpc("submit_teacher_application", {
    p_qualifications: qualifications,
    p_experience: experience || null,
    p_subjects: subjects,
    p_curricula: curricula,
  });

  if (error) {
    console.error("Teacher application submission failed:", error.message);
    redirect("/dashboard/teacher-application?error=submit_failed");
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/teacher-application");
  redirect("/dashboard/teacher-application?submitted=1");
}

type ApplicationPageProps = {
  searchParams: Promise<{ submitted?: string; error?: string }>;
};

export default async function TeacherApplicationPage({ searchParams }: ApplicationPageProps) {
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

  const { data: application, error } = await supabase
    .from("teacher_applications")
    .select("status, qualifications, experience, subjects, curricula")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !application) {
    return (
      <main className="min-h-screen bg-[#f7faff] px-4 py-10 text-[#17324f]">
        <section className="mx-auto max-w-2xl rounded-2xl border border-[#e1eaf5] bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">Teacher application</h1>
          <p className="mt-3 text-sm leading-6 text-[#71849b]">We could not find an application draft for this account. If you just created your account, sign out and back in; if this continues, contact BEMS support.</p>
          <a href="/dashboard" className="mt-5 inline-flex rounded-xl bg-[#174a8b] px-4 py-2.5 text-sm font-semibold text-white">Back to dashboard</a>
        </section>
      </main>
    );
  }

  if (application.status !== "draft") {
    const statusLabel = application.status.replaceAll("_", " ");
    return (
      <main className="min-h-screen bg-[#f7faff] px-4 py-10 text-[#17324f]">
        <section className="mx-auto max-w-2xl rounded-2xl border border-[#e1eaf5] bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">Teacher application</h1>
          {application.status === "approved" ? (
            <div role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
              <h2 className="font-semibold">Congratulations! Your teacher application has been approved.</h2>
              <p className="mt-1 text-sm leading-6">Your teacher role is active. You can now access your teacher tools.</p>
              <a href="/dashboard/teacher" className="mt-3 inline-flex rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">Open teacher tools</a>
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-[#71849b]">Your application status is <strong className="capitalize text-[#174a8b]">{statusLabel}</strong>.</p>
          )}
          <a href="/dashboard" className="mt-5 inline-flex rounded-xl bg-[#174a8b] px-4 py-2.5 text-sm font-semibold text-white">Back to dashboard</a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7faff] px-4 py-8 text-[#17324f] sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#52749a]">BRIGHT Education</p>
            <h1 className="mt-1 text-3xl font-bold">Teacher application</h1>
            <p className="mt-2 text-sm text-[#71849b]">Complete your details and submit them for administrator review.</p>
          </div>
          <a href="/dashboard" className="rounded-xl border border-[#dce7f3] bg-white px-4 py-2 text-sm font-semibold">Back to dashboard</a>
        </header>

        {params.submitted === "1" && (
          <p role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">Your application has been submitted for review.</p>
        )}
        {params.error === "invalid_form" && (
          <p role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Please add your qualifications, at least one subject and curriculum, and keep each field within its stated limit.</p>
        )}
        {params.error === "submit_failed" && (
          <p role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">We couldn&apos;t submit your application. Your draft has not been intentionally changed. Please try again; if the problem persists, contact support.</p>
        )}

        <form action={submitApplication} className="space-y-5 rounded-2xl border border-[#e1eaf5] bg-white p-5 shadow-sm sm:p-8">
          <div>
            <label htmlFor="qualifications" className="mb-2 block text-sm font-semibold">Qualifications and certifications</label>
            <textarea id="qualifications" name="qualifications" required minLength={2} maxLength={5000} rows={4} defaultValue={application.qualifications ?? ""} placeholder="List relevant education, training, and teaching certifications." className="w-full rounded-xl border border-[#dce7f3] px-4 py-3 text-sm outline-none focus:border-[#2876bb] focus:ring-2 focus:ring-[#2876bb]/15" />
          </div>
          <div>
            <label htmlFor="experience" className="mb-2 block text-sm font-semibold">Teaching experience <span className="font-normal text-[#71849b]">(optional)</span></label>
            <textarea id="experience" name="experience" maxLength={5000} rows={4} defaultValue={application.experience ?? ""} placeholder="Describe your teaching or tutoring experience." className="w-full rounded-xl border border-[#dce7f3] px-4 py-3 text-sm outline-none focus:border-[#2876bb] focus:ring-2 focus:ring-[#2876bb]/15" />
          </div>
          <div>
            <label htmlFor="subjects" className="mb-2 block text-sm font-semibold">Subjects you teach</label>
            <textarea id="subjects" name="subjects" required rows={2} defaultValue={(application.subjects ?? []).join(", ")} placeholder="e.g. Mathematics, Physics, English" className="w-full rounded-xl border border-[#dce7f3] px-4 py-3 text-sm outline-none focus:border-[#2876bb] focus:ring-2 focus:ring-[#2876bb]/15" />
            <p className="mt-1 text-xs text-[#71849b]">Separate subjects with commas or put each on a new line.</p>
          </div>
          <div>
            <label htmlFor="curricula" className="mb-2 block text-sm font-semibold">Curricula or programmes</label>
            <textarea id="curricula" name="curricula" required rows={2} defaultValue={(application.curricula ?? []).join(", ")} placeholder="e.g. Kenyan CBC, Cambridge, IB" className="w-full rounded-xl border border-[#dce7f3] px-4 py-3 text-sm outline-none focus:border-[#2876bb] focus:ring-2 focus:ring-[#2876bb]/15" />
            <p className="mt-1 text-xs text-[#71849b]">Separate curricula with commas or put each on a new line.</p>
          </div>
          <div className="rounded-xl bg-[#f7faff] p-4 text-sm leading-6 text-[#47627f]">
            Once submitted, your application will be locked for editing while it is under review. An administrator will review your qualifications, experience, subjects, and curricula.
          </div>
          <button type="submit" className="w-full rounded-xl bg-[#174a8b] px-5 py-3 font-semibold text-white transition hover:bg-[#123d75] sm:w-auto">Submit application for review</button>
        </form>
      </div>
    </main>
  );
}
