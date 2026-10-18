
import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Learn with confidence",
    description:
      "Explore subjects, discover learning resources and connect with teachers who support your academic goals.",
  },
  {
    number: "02",
    title: "Teach and inspire",
    description:
      "Apply to become a BEMS teacher, share your expertise and help learners make meaningful progress.",
  },
  {
    number: "03",
    title: "Stay connected",
    description:
      "Give families a clearer view of learning progress, lessons and important academic information.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      {/* Floating navigation */}
      <header className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-6xl -translate-x-1/2">
        <nav className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-lg shadow-slate-900/5 backdrop-blur-xl sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-lg font-bold text-white">
              B
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-slate-900">
                BRIGHT Education
              </p>
              <p className="text-xs text-slate-500">
                Education Management System
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            <a href="#home" className="text-sm text-slate-600 hover:text-blue-700">
              Home
            </a>
            <a href="#about" className="text-sm text-slate-600 hover:text-blue-700">
              About BEMS
            </a>
            <a href="#learners" className="text-sm text-slate-600 hover:text-blue-700">
              For Learners
            </a>
            <a href="#teachers" className="text-sm text-slate-600 hover:text-blue-700">
              For Teachers
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section
        id="home"
        className="relative scroll-mt-28 overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white px-6 pb-20 pt-36 sm:pt-44"
      >
        <div className="pointer-events-none absolute -right-32 -top-20 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-64 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-blue-800 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              A better way to learn together
            </div>

            <h1 className="mt-7 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Education that moves{" "}
              <span className="text-blue-700">everyone forward.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              One connected platform for learners, teachers and families.
              Discover learning opportunities, manage lessons and stay
              connected to academic progress.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="rounded-xl bg-blue-700 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:-translate-y-0.5 hover:bg-blue-800"
              >
                Get started
                <span className="ml-2" aria-hidden="true">→</span>
              </Link>
              <a
                href="#about"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
              >
                Discover BEMS
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
              <span>For learners</span>
              <span>For teachers</span>
              <span>For families</span>
            </div>
          </div>

          {/* Right-hand visual */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-4 rounded-[2rem] bg-blue-100/70 blur-2xl" />

            <div className="relative rounded-3xl border border-blue-100 bg-white p-5 shadow-2xl shadow-blue-900/10 sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    YOUR LEARNING JOURNEY
                  </p>
                  <h2 className="mt-1 text-xl font-bold">
                    Room to grow.
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-7 w-7"
                    aria-hidden="true"
                  >
                    <path d="M3 9.5 12 5l9 4.5-9 4.5-9-4.5Z" />
                    <path d="M7 12v5c3.3 2.4 6.7 2.4 10 0v-5" />
                    <path d="M21 10v6" />
                  </svg>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-blue-50 p-5">
                  <p className="text-sm font-medium text-blue-800">
                    LEARN
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-slate-900">
                    Find your next opportunity
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Explore subjects, resources and lessons designed to help
                    you keep moving forward.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-blue-700">
                      <span aria-hidden="true">↗</span>
                    </div>
                    <p className="mt-3 font-semibold">Grow</p>
                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Build knowledge step by step.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                      <span aria-hidden="true">◎</span>
                    </div>
                    <p className="mt-3 font-semibold">Connect</p>
                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Keep learners and families connected.
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-center text-xs text-slate-400">
                A shared space for learning and progress
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section id="about" className="scroll-mt-28 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
              Learning, connected
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything starts with the right support.
            </h2>
            <p className="mt-5 leading-8 text-slate-600">
              Education works best when the people around a learner can work
              together. BEMS is being built to bring learning resources,
              teaching and family involvement into one accessible place.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.number}
                id={
                  feature.number === "01"
                    ? "learners"
                    : feature.number === "02"
                      ? "teachers"
                      : "families"
                }
                className="scroll-mt-32 rounded-2xl border border-slate-200 bg-white p-7 transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5"
              >
                <span className="text-sm font-bold text-blue-700">
                  {feature.number}
                </span>
                <h3 className="mt-5 text-xl font-bold">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-blue-800 px-7 py-12 text-white sm:px-12 sm:py-16">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">
                Your next step starts here
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Be part of a better learning experience.
              </h2>
              <p className="mt-4 leading-7 text-blue-100">
                Create your account to get started with BEMS.
                Teacher applicants will go through an approval process.
              </p>
            </div>
            <Link
              href="/signup"
              className="shrink-0 rounded-xl bg-white px-6 py-3.5 font-semibold text-blue-800 transition hover:bg-blue-50"
            >
              Create an account →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 BRIGHT Education Management System</p>
          <div className="flex flex-wrap gap-5">
            <Link href="/login" className="hover:text-blue-700">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-blue-700">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
