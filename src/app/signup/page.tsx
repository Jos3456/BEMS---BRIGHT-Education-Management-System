
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl sm:p-10">
        <Link href="/" className="text-sm font-semibold text-blue-700 hover:underline">
          ← Back to sign in
        </Link>

        <div className="mt-6">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
            BRIGHT Education
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Create your account
          </h1>
          <p className="mt-2 text-slate-600">
            Join BEMS and start your learning journey.
          </p>
        </div>

        <form onSubmit={handleSignup} className="mt-8 space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={2}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="role" className="mb-2 block text-sm font-medium text-slate-700">
              I am registering as a
            </label>
            <select
              id="role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              <option value="student">Student / Learner</option>
              <option value="teacher">Teacher / Tutor</option>
            </select>
            <p className="mt-2 text-xs text-slate-500">
              Teacher accounts may require verification before teaching on BEMS.
            </p>
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="At least 8 characters"
            />
          </div>

          {message && (
            <p role="status" className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link href="/" className="font-semibold text-blue-700 hover:underline">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
