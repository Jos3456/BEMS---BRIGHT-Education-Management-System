
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || !user.email_confirmed_at) {
    redirect("/");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, account_status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || profile.account_status !== "active") {
    redirect("/");
  }

  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (rolesError || !roles || roles.length === 0) {
    redirect("/");
  }

  const role = roles[0].role;

  const portalNames: Record<string, string> = {
    student: "Student Portal",
    teacher: "Teacher Portal",
    parent: "Parent / Guardian Portal",
    admin: "Administration Portal",
  };

  async function signOut() {
    "use server";

    const serverSupabase = await createClient();
    await serverSupabase.auth.signOut();
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-800">
            BRIGHT Education
          </h1>

          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border px-4 py-2 hover:bg-slate-100"
            >
              Sign out
            </button>
          </form>
        </header>

        <section className="mt-12">
          <p className="text-sm font-semibold uppercase text-blue-700">
            {portalNames[role] ?? "BEMS Portal"}
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Welcome{profile.full_name ? `, ${profile.full_name}` : ""}
          </h2>

          <p className="mt-3 text-slate-600">{user.email}</p>

          <div className="mt-8 rounded-xl border bg-white p-6">
            <h3 className="text-lg font-semibold">
              Your BEMS dashboard
            </h3>

            <p className="mt-2 text-slate-600">
              Your courses, lessons, assignments and learning
              information will appear here as those features are built.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
