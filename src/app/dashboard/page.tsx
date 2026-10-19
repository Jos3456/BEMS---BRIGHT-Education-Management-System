import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const instant = false;
import StudentDashboard from "./student-dashboard";
import { loadStudentData } from "./student-data";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || !user.email_confirmed_at) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, account_status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || profile.account_status !== "active") {
    redirect("/login");
  }

  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (rolesError || !roles || roles.length === 0) {
    redirect("/login");
  }

  const role = roles[0].role;

  async function signOut() {
    "use server";
    const serverSupabase = await createClient();
    await serverSupabase.auth.signOut();
    redirect("/login");
  }

  if (role === "student") {
    const data = await loadStudentData(supabase, user.id);
    return (
      <StudentDashboard
        name={profile.full_name ?? ""}
        email={user.email ?? ""}
        data={data}
        signOut={signOut}
      />
    );
  }

  const portalNames: Record<string, string> = {
    student: "Student Portal",
    teacher: "Teacher Portal",
    parent: "Parent / Guardian Portal",
    admin: "Administration Portal",
  };

  return (
    <main className="min-h-screen bg-[#f7faff] p-6 text-[#17324f] sm:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between rounded-2xl border border-[#e1eaf5] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#174a8b] font-bold text-white">B</span>
            <div>
              <h1 className="font-bold">BRIGHT Education</h1>
              <p className="mt-0.5 text-[0.65rem] tracking-[0.15em] text-[#71849b]">LEARN · TEACH · GROW</p>
            </div>
          </div>
          <form action={signOut}>
            <button type="submit" className="rounded-xl border border-[#dce7f3] px-4 py-2 text-sm font-semibold transition hover:bg-[#f0f6ff]">Sign out</button>
          </form>
        </header>

        <section className="mt-8 rounded-[1.75rem] bg-gradient-to-br from-[#153d70] to-[#2b72b8] p-7 text-white sm:p-10">
          <p className="text-xs font-bold tracking-[0.2em] text-[#c9e0ff]">{portalNames[role] ?? "BEMS Portal"}</p>
          <h2 className="mt-3 text-3xl font-semibold">Welcome{profile.full_name ? ", " + profile.full_name : ""}</h2>
          <p className="mt-3 text-sm text-blue-100">{user.email}</p>
        </section>

        <section className="mt-5 rounded-[1.5rem] border border-[#e1eaf5] bg-white p-6">
          <h3 className="text-lg font-semibold">Your BEMS dashboard</h3>
          <p className="mt-2 leading-7 text-[#71849b]">
            Your {role === "teacher" ? "teaching tools and application status" : role === "parent" ? "linked learners and learning updates" : "administration tools"} will appear here as those features are built.
          </p>
          {role === "teacher" && (
            <a href="/dashboard/teacher" className="mt-5 inline-flex rounded-xl bg-[#174a8b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#123d75]">
              Open teacher assessment tools
            </a>
          )}
        </section>
      </div>
    </main>
  );
}
