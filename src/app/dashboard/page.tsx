
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function checkUser() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/");
        return;
      }

      if (!data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        router.replace("/");
        return;
      }

      setEmail(data.user.email ?? "");
      setLoading(false);
    }

    checkUser();
  }, [router]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (loading) {
    return <main className="p-10">Checking your account...</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-800">
          BRIGHT Education
        </h1>
        <button
          onClick={handleSignOut}
          className="rounded-lg border px-4 py-2 hover:bg-slate-100"
        >
          Sign out
        </button>
      </header>

      <section className="mx-auto mt-12 max-w-4xl">
        <p className="text-sm font-semibold text-blue-700">
          STUDENT PORTAL
        </p>
        <h2 className="mt-2 text-3xl font-bold">
          Welcome to BEMS
        </h2>
        <p className="mt-3 text-slate-600">
          Signed in as {email}
        </p>

        <div className="mt-8 rounded-xl border bg-white p-6">
          <h3 className="text-lg font-semibold">
            Your learning dashboard
          </h3>
          <p className="mt-2 text-slate-600">
            Your courses, lessons and assignments will appear here.
          </p>
        </div>
      </section>
    </main>
  );
}
