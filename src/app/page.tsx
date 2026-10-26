import Link from "next/link";

const pathways = [
  {
    number: "01",
    eyebrow: "FOR LEARNERS",
    title: "Make learning feel possible.",
    description:
      "Find the right subjects, explore trusted resources and build confidence one step at a time.",
    icon: "↗",
    href: "/signup",
    tone: "blue",
    id: "learners",
  },
  {
    number: "02",
    eyebrow: "FOR TEACHERS",
    title: "Put your knowledge to work.",
    description:
      "Bring your experience to a growing learning community and help students reach their full potential.",
    icon: "✳",
    href: "/signup",
    tone: "mint",
    id: "teachers",
  },
  {
    number: "03",
    eyebrow: "FOR PARENTS",
    title: "Feel closer to their progress.",
    description:
      "Keep learning, lesson plans and important updates connected in one trusted place.",
    icon: "♡",
    href: "/signup",
    tone: "lavender",
    id: "families",
  },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M4.25 10h11.5M10 4.25 15.75 10 10 15.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main
      className="min-h-screen overflow-x-hidden text-[#17324f]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(247,250,255,0.84), rgba(247, 250, 255, 0.87)), url('classroom.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundAttachment: "fixed",
      }}
    >
      <header className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-6xl -translate-x-1/2">
        <nav className="flex items-center justify-between rounded-[1.35rem] border border-white/90 bg-white/90 px-4 py-3 shadow-[0_8px_35px_rgba(32,70,110,0.08)] backdrop-blur-xl sm:px-6">
          <Link href="/" className="flex items-center gap-3" aria-label="BEMS home">
            <span className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-[#174a8b] text-lg font-bold text-white shadow-sm">B</span>
            <span>
              <span className="block text-[0.98rem] font-bold tracking-[-0.03em] text-[#17324f]">BRIGHT Education</span>
              <span className="mt-0.5 block text-[0.68rem] tracking-wide text-[#71849b]">LEARN · TEACH · GROW</span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <a href="#home" className="text-sm font-medium text-[#536b84] transition hover:text-[#174a8b]">Home</a>
            <a href="#about" className="text-sm font-medium text-[#536b84] transition hover:text-[#174a8b]">Our approach</a>
            <a href="#learners" className="text-sm font-medium text-[#536b84] transition hover:text-[#174a8b]">Who it’s for</a>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-xl px-3 py-2.5 text-sm font-semibold text-[#38536e] transition hover:bg-[#f0f6ff] sm:inline-flex">Sign in</Link>
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-xl bg-[#174a8b] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_5px_14px_rgba(23,74,139,0.18)] transition hover:-translate-y-0.5 hover:bg-[#10396d]">
              Get started <ArrowIcon />
            </Link>
          </div>
        </nav>
      </header>

      <section id="home" className="relative scroll-mt-28 overflow-hidden px-6 pb-20 pt-36 sm:pb-28 sm:pt-44">
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-24 h-[34rem] w-[34rem] rounded-full bg-[#e4f1ff] blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-[28rem] h-80 w-80 rounded-full bg-[#e8f8f5] blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#dce9f8] bg-white/80 px-4 py-2 text-xs font-semibold tracking-wide text-[#426482] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#5cb9a6]" />
              A brighter way to learn together
            </div>

            <h1 className="mt-7 max-w-2xl text-[2.85rem] font-semibold leading-[1.08] tracking-[-0.055em] text-[#17324f] sm:text-6xl lg:text-[4.35rem]">
              Every learner deserves a <span className="text-[#2c72b8]">clear path</span> forward.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#60758b] sm:text-lg">
              A more connected learning experience for students, teachers and families — bringing the right people, resources and opportunities together.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup" className="inline-flex items-center gap-3 rounded-xl bg-[#174a8b] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(23,74,139,0.2)] transition hover:-translate-y-0.5 hover:bg-[#10396d]">
                Start your journey <ArrowIcon />
              </Link>
              <a href="#about" className="rounded-xl border border-[#d8e5f3] bg-white/80 px-6 py-3.5 text-sm font-semibold text-[#38536e] transition hover:border-[#aac9eb] hover:bg-white">
                Explore BEMS
              </a>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#6e8298]">
              <span className="inline-flex items-center gap-2"><span className="text-[#4a9d8b]">✓</span> Learner-centred</span>
              <span className="inline-flex items-center gap-2"><span className="text-[#4a9d8b]">✓</span> Built for connection</span>
              <span className="inline-flex items-center gap-2"><span className="text-[#4a9d8b]">✓</span> Room to grow</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[33rem]">
            <div aria-hidden="true" className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-[#dcecff] via-[#eff7ff] to-[#e0f6f0] blur-xl" />
            <div className="relative rounded-[2rem] border border-white bg-white/90 p-4 shadow-[0_25px_80px_rgba(38,75,115,0.13)] sm:p-6">
              <div className="flex items-center justify-between px-1 pb-5">
                <div>
                  <p className="text-[0.68rem] font-bold tracking-[0.17em] text-[#7b91a7]">YOUR LEARNING SPACE</p>
                  <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-[#17324f]">A little progress, every day.</h2>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eaf3ff] text-[#2c72b8]">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
                    <path d="M3.5 9.5 12 5l8.5 4.5L12 14 3.5 9.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    <path d="M7 12v4.2c3.1 2.3 6.9 2.3 10 0V12M20.5 10v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-[#edf5ff] p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-white px-3 py-1 text-[0.68rem] font-bold tracking-wide text-[#2c72b8]">THE BIG PICTURE</span>
                    <h3 className="mt-4 max-w-[15rem] text-2xl font-semibold leading-tight tracking-[-0.04em] text-[#17324f]">Learning works better, together.</h3>
                  </div>
                  <div aria-hidden="true" className="relative mt-2 hidden h-20 w-20 shrink-0 sm:block">
                    <div className="absolute left-1 top-6 h-12 w-12 rounded-[1.1rem] bg-[#bcd9fb] rotate-[-12deg]" />
                    <div className="absolute left-7 top-2 h-12 w-12 rounded-[1.1rem] bg-[#8acbbd] rotate-[12deg]" />
                    <div className="absolute left-5 top-7 h-12 w-12 rounded-[1.1rem] bg-[#f8cf91] rotate-[4deg]" />
                  </div>
                </div>
                <p className="mt-3 max-w-sm text-sm leading-6 text-[#617890]">The right support can turn a difficult subject into a new discovery — and small steps into real confidence.</p>
                <div className="mt-5 flex items-center gap-2">
                  <span className="h-1.5 flex-1 rounded-full bg-[#c4ddfa]"><span className="block h-1.5 w-2/3 rounded-full bg-[#3b83c7]" /></span>
                  <span className="text-xs font-semibold text-[#4f7194]">Keep growing</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-[1.35rem] border border-[#e1ebf5] bg-white p-4 sm:p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e3f5ef] text-lg text-[#368b79]">↗</div>
                  <h3 className="mt-3 font-semibold text-[#17324f]">Find your way</h3>
                  <p className="mt-1.5 text-xs leading-5 text-[#71849b]">Discover subjects and resources that fit your goals.</p>
                </div>
                <div className="rounded-[1.35rem] border border-[#e1ebf5] bg-white p-4 sm:p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff1df] text-lg text-[#b47732]">♡</div>
                  <h3 className="mt-3 font-semibold text-[#17324f]">Grow together</h3>
                  <p className="mt-1.5 text-xs leading-5 text-[#71849b]">Keep learners, teachers and families connected.</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-4 hidden items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-[0_12px_35px_rgba(38,75,115,0.13)] sm:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e3f5ef] text-[#368b79]">✦</span>
              <span><span className="block text-sm font-semibold text-[#17324f]">Made for progress</span><span className="mt-0.5 block text-xs text-[#71849b]">At every stage of the journey</span></span>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-28 border-y border-[#e7eef7] bg-white/75 px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold tracking-[0.2em] text-[#4386c4]">A BETTER WAY TO CONNECT</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.045em] text-[#17324f] sm:text-4xl">Education is a journey. No one should have to take it alone.</h2>
            <p className="mt-5 text-base leading-8 text-[#687d93]">BEMS brings the people and tools around learning into one welcoming space, so it’s easier to find support, share progress and keep moving forward.</p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {pathways.map((item) => (
              <article key={item.number} id={item.id} className="group scroll-mt-32 rounded-[1.6rem] border border-[#e1eaf5] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[#c4d9ef] hover:shadow-[0_18px_45px_rgba(38,75,115,0.08)] sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-[0.16em] text-[#8a9bb0]">{item.number}</span>
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl ${item.tone === "blue" ? "bg-[#eaf3ff] text-[#2c72b8]" : item.tone === "mint" ? "bg-[#e3f5ef] text-[#368b79]" : "bg-[#f0ebff] text-[#7966b5]"}`}>{item.icon}</span>
                </div>
                <p className="mt-7 text-[0.68rem] font-bold tracking-[0.16em] text-[#6d91b5]">{item.eyebrow}</p>
                <h3 className="mt-3 text-xl font-semibold leading-snug tracking-[-0.03em] text-[#17324f]">{item.title}</h3>
                <p className="mt-3 min-h-[5rem] text-sm leading-7 text-[#6a7f95]">{item.description}</p>
                <Link href={item.href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#2c72b8] transition group-hover:gap-3">
                  Get started <ArrowIcon />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:py-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#173f70] px-7 py-12 text-white sm:px-12 sm:py-16">
          <div aria-hidden="true" className="absolute -right-20 -top-32 h-80 w-80 rounded-full border-[48px] border-white/[0.06]" />
          <div aria-hidden="true" className="absolute bottom-[-7rem] right-[22%] h-56 w-56 rounded-full bg-[#2b6b9b]/40 blur-2xl" />
          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.2em] text-[#b7d7f7]">YOUR NEXT CHAPTER</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">There’s room for you here.</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#d6e6f5] sm:text-base">Whether you’re here to learn, teach or support a learner, your journey can start with one small step.</p>
            </div>
            <Link href="/signup" className="inline-flex shrink-0 items-center gap-3 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[#174a8b] transition hover:-translate-y-0.5 hover:bg-[#edf5ff]">
              Create an account <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e1eaf5] bg-white/70 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-[#71849b] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-[#38536e]">BRIGHT Education Management System</p>
            <p className="mt-1 text-xs">A clearer path forward, together.</p>
          </div>
          <div className="flex flex-wrap gap-5">
            <Link href="/login" className="transition hover:text-[#174a8b]">Sign in</Link>
            <Link href="/signup" className="transition hover:text-[#174a8b]">Register</Link>
          </div>
          <p className="text-xs">© 2026 BEMS</p>
        </div>
      </footer>
    </main>
  );
}
