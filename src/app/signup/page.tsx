"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            requested_role: role,
          },
        },
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Registration received! Check your email if verification is required before signing in."
        );
      }
    } catch {
      setMessage("Unable to connect. Please check your configuration and try again.");
    } finally {
      setLoading(false);
    }
  }

  const isSuccess = message.startsWith("Registration received!");

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

      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 shadow-[0_28px_90px_rgba(23,50,79,0.16)] backdrop-blur-xl md:grid-cols-[0.85fr_1.15fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#174a8b] p-10 text-white md:flex md:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/15" />
          <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full border border-white/15" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-[#8ed8d0]/15 blur-2xl" />
          <div className="relative">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium tracking-wide text-blue-100">
              Find your place at BRIGHT
            </span>
            <h1 className="mt-8 max-w-sm text-4xl font-semibold leading-[1.15] tracking-tight lg:text-5xl">
              Great things begin with one step.
            </h1>
            <p className="mt-5 max-w-sm text-base leading-7 text-blue-100">
              Create your account and join a community built around learning, teaching and growing together.
            </p>
          </div>
          <div className="relative mt-12 space-y-4">
            {[
              "A space to keep learning on track",
              "Support for learners and educators",
              "A community that grows together",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-blue-50">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-[#c8f0e8]">✓</span>
                {item}
              </div>
            ))}
          </div>
          <p className="relative mt-8 text-xs text-blue-200">© 2026 BRIGHT Education · BEMS</p>
        </section>

        <section className="px-6 py-10 sm:px-10 sm:py-12 md:px-12 md:py-10">
          <div className="mx-auto max-w-md">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-[#174a8b] transition hover:gap-3">
              <span aria-hidden="true">←</span> Back to sign in
            </Link>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-[#2876bb]">Join the community</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#17324f] sm:text-4xl">Create your account.</h2>
            <p className="mt-3 leading-6 text-[#6e8298]">A few details to get your journey started.</p>

            <form onSubmit={handleSignup} className="mt-7 space-y-4">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-semibold text-[#29445f]">Full name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  minLength={2}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-[#dce7f3] bg-white px-4 py-3 text-[#17324f] outline-none transition placeholder:text-[#9aabba] focus:border-[#2876bb] focus:ring-4 focus:ring-[#2876bb]/10"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#29445f]">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#dce7f3] bg-white px-4 py-3 text-[#17324f] outline-none transition placeholder:text-[#9aabba] focus:border-[#2876bb] focus:ring-4 focus:ring-[#2876bb]/10"
                />
              </div>

              <div>
                <label htmlFor="role" className="mb-2 block text-sm font-semibold text-[#29445f]">I’m joining BEMS as a</label>
                <select
                  id="role"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="w-full rounded-xl border border-[#dce7f3] bg-white px-4 py-3 text-[#17324f] outline-none transition focus:border-[#2876bb] focus:ring-4 focus:ring-[#2876bb]/10"
                >
                  <option value="student">Student / Learner</option>
                  <option value="teacher">Teacher / Tutor</option>
                </select>
                <p className="mt-2 text-xs leading-5 text-[#7d90a4]">
                  Teacher applications are reviewed before teaching access is granted.
                </p>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#29445f]">Create a password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-[#dce7f3] bg-white px-4 py-3 text-[#17324f] outline-none transition placeholder:text-[#9aabba] focus:border-[#2876bb] focus:ring-4 focus:ring-[#2876bb]/10"
                />
              </div>

              {message && (
                <p
                  role={isSuccess ? "status" : "alert"}
                  className={`rounded-xl border px-4 py-3 text-sm leading-6 ${isSuccess ? "border-emerald-100 bg-emerald-50 text-emerald-800" : "border-red-100 bg-red-50 text-red-700"}`}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#174a8b] px-5 py-3.5 font-semibold text-white shadow-lg shadow-[#174a8b]/15 transition hover:-translate-y-0.5 hover:bg-[#10396d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create my account"}
                {!loading && <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#6e8298]">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[#174a8b] hover:underline">Sign in</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
