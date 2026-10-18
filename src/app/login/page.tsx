"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect. Check your Supabase configuration.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 text-[#17324f] sm:px-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(247,250,255,0.84), rgba(247,250,255,0.90)), url('https://raw.githubusercontent.com/Jos3456/BEMS---BRIGHT-Education-Management-System/main/classroom.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Link
        href="/"
        className="absolute left-5 top-5 z-10 inline-flex items-center gap-3 rounded-full border border-white/80 bg-white/85 px-4 py-2.5 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white sm:left-8 sm:top-8"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#174a8b] text-sm font-bold text-white">B</span>
        <span className="text-left">
          <span className="block text-sm font-bold tracking-wide">BRIGHT Education</span>
          <span className="block text-[10px] tracking-[0.16em] text-[#6e8298]">LEARN · TEACH · GROW</span>
        </span>
      </Link>

      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-[0_28px_90px_rgba(23,50,79,0.16)] backdrop-blur-xl md:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#174a8b] p-10 text-white md:flex md:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/15" />
          <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full border border-white/15" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-[#8ed8d0]/15 blur-2xl" />
          <div className="relative">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium tracking-wide text-blue-100">
              A brighter way to learn
            </span>
            <h1 className="mt-8 max-w-sm text-4xl font-semibold leading-[1.15] tracking-tight lg:text-5xl">
              Your next chapter starts here.
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-blue-100">
              One connected space for learners, teachers and families to make every learning step count.
            </p>
          </div>
          <div className="relative mt-12 rounded-2xl border border-white/15 bg-white/10 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c8f0e8] text-lg text-[#174a8b]">✦</span>
              <div>
                <p className="font-semibold">Learn with purpose.</p>
                <p className="mt-1 text-sm text-blue-100">Grow with the right support.</p>
              </div>
            </div>
          </div>
          <p className="relative mt-8 text-xs text-blue-200">© 2026 BRIGHT Education · BEMS</p>
        </section>

        <section className="px-6 py-10 sm:px-10 sm:py-12 md:px-12 md:py-14">
          <div className="mx-auto max-w-md">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2876bb]">Welcome back</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#17324f] sm:text-4xl">Good to see you again.</h2>
            <p className="mt-3 leading-6 text-[#6e8298]">Sign in to pick up where your learning journey left off.</p>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#29445f]">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full rounded-xl border border-[#dce7f3] bg-white px-4 py-3.5 text-[#17324f] outline-none transition placeholder:text-[#9aabba] focus:border-[#2876bb] focus:ring-4 focus:ring-[#2876bb]/10"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#29445f]">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="w-full rounded-xl border border-[#dce7f3] bg-white px-4 py-3.5 text-[#17324f] outline-none transition placeholder:text-[#9aabba] focus:border-[#2876bb] focus:ring-4 focus:ring-[#2876bb]/10"
                />
              </div>

              {error && (
                <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#174a8b] px-5 py-3.5 font-semibold text-white shadow-lg shadow-[#174a8b]/15 transition hover:-translate-y-0.5 hover:bg-[#10396d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in to BEMS"}
                {!loading && <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-[#6e8298]">
              New to BEMS?{" "}
              <Link href="/signup" className="font-semibold text-[#174a8b] hover:underline">Create an account</Link>
            </p>
            <p className="mt-8 text-center text-xs text-[#91a0b1]">
              By continuing, you agree to use BEMS respectfully and responsibly.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
