
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-xl md:grid-cols-2">
        <section className="flex flex-col justify-center bg-blue-950 p-10 text-white md:p-14">
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl font-bold text-blue-950">
              B
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">BEMS</h1>
              <p className="text-sm text-blue-200">BRIGHT Education Management System</p>
            </div>
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-300">
            Welcome to BRIGHT
          </p>
          <h2 className="mb-5 text-4xl font-bold leading-tight">
            Education, organised.
            <br />
            Success, empowered.
          </h2>
          <p className="max-w-md leading-7 text-blue-100">
            One place to manage school operations, support learners, and keep
            your school community connected.
          </p>

          <p className="mt-16 text-sm text-blue-300">
            © {new Date().getFullYear()} BRIGHT Education
          </p>
        </section>

        <section className="flex flex-col justify-center p-8 sm:p-12 md:p-14">
          <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
          <p className="mt-2 text-slate-500">
            Sign in to access your school dashboard.
          </p>

          <form className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@school.com"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Need help accessing your account? Contact your school administrator.
          </p>
        </section>
      </div>
    </main>
  );
}
