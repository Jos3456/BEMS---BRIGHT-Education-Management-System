"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Section =
  | "home"
  | "classes"
  | "materials"
  | "papers"
  | "quiz"
  | "grades"
  | "schedule"
  | "teachers"
  | "profile"
  | "all";

type Item = {
  icon: string;
  title: string;
  detail: string;
};

const learningSections: { id: Section; icon: string; title: string; detail: string }[] = [
  { id: "classes", icon: "▣", title: "Online classes", detail: "Your lessons in one place" },
  { id: "materials", icon: "▤", title: "Study materials", detail: "Notes and revision guides" },
  { id: "papers", icon: "▧", title: "Past papers", detail: "Prepare for examinations" },
  { id: "quiz", icon: "✎", title: "Questions & quizzes", detail: "Test what you know" },
  { id: "grades", icon: "↗", title: "Grades & progress", detail: "Review your results" },
  { id: "schedule", icon: "▦", title: "Class schedule", detail: "See upcoming lessons" },
  { id: "teachers", icon: "♧", title: "Teachers & support", detail: "Find learning support" },
  { id: "profile", icon: "○", title: "My profile", detail: "Your account details" },
];

const demoClasses: Item[] = [
  { icon: "∑", title: "Mathematics", detail: "Lessons and class activities" },
  { icon: "⚗", title: "Science", detail: "Notes, demonstrations and revision" },
  { icon: "Aa", title: "English", detail: "Reading, writing and language skills" },
  { icon: "◎", title: "Social Studies", detail: "Topics and practice activities" },
];

const demoMaterials: Item[] = [
  { icon: "▤", title: "Revision notes", detail: "Sample study resource" },
  { icon: "▧", title: "Exam preparation guide", detail: "Sample learning resource" },
  { icon: "✦", title: "Study skills", detail: "Plan, practise and review" },
];

const demoPapers: Item[] = [
  { icon: "▧", title: "Mathematics — sample paper", detail: "Practice paper · Demo" },
  { icon: "▧", title: "English — sample paper", detail: "Practice paper · Demo" },
  { icon: "▧", title: "Science — sample paper", detail: "Practice paper · Demo" },
];

const navItems: { id: Section; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "classes", label: "Classes", icon: "▣" },
  { id: "papers", label: "Past papers", icon: "▧" },
  { id: "grades", label: "Progress", icon: "↗" },
  { id: "all", label: "Explore", icon: "☷" },
];

export default function StudentDashboard({
  name,
  email,
  signOut,
}: {
  name: string;
  email: string;
  signOut: () => Promise<void>;
}) {
  const [section, setSection] = useState<Section>("home");
  const [search, setSearch] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizChecked, setQuizChecked] = useState(false);
  const [notice, setNotice] = useState("");
  const [profileName, setProfileName] = useState(name || "");
  const firstName = (name || email.split("@")[0] || "Learner").trim().split(/\s+/)[0];
  const initial = (name || email || "S").trim().charAt(0).toUpperCase();

  const currentItems = useMemo(() => {
    const source = section === "classes" ? demoClasses : section === "materials" ? demoMaterials : section === "papers" ? demoPapers : [];
    const query = search.trim().toLowerCase();
    return source.filter((item) => (item.title + " " + item.detail).toLowerCase().includes(query));
  }, [section, search]);

  function goTo(next: Section) {
    setSection(next);
    setSearch("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openDemoItem(item: Item) {
    setNotice(`“${item.title}” is a preview item. Real lessons and resources will appear here once they are connected to BEMS.`);
  }

  function pageTitle() {
    const titles: Record<Section, string> = {
      home: "Your learning space",
      classes: "Online classes",
      materials: "Study materials",
      papers: "Past papers",
      quiz: "Quick practice quiz",
      grades: "Grades & progress",
      schedule: "Class schedule",
      teachers: "Teachers & support",
      profile: "My profile",
      all: "Explore BEMS",
    };
    return titles[section];
  }

  function renderResourceList(items: Item[]) {
    return (
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.title} className="flex items-center gap-3 rounded-2xl border border-[#e1eaf5] bg-white p-4 transition hover:border-[#b9d3ed]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eaf3ff] text-lg font-semibold text-[#2c72b8]">{item.icon}</div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#17324f]">{item.title}</p>
              <p className="mt-1 text-sm text-[#71849b]">{item.detail}</p>
            </div>
            <button onClick={() => openDemoItem(item)} className="rounded-xl bg-[#174a8b] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#10396d]">Open</button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#d5e3f2] bg-white/75 p-8 text-center">
            <p className="font-semibold text-[#38536e]">No matching items</p>
            <p className="mt-2 text-sm text-[#71849b]">Try a different search term.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7faff] text-[#17324f]">
      <header className="sticky top-0 z-30 border-b border-[#e1eaf5] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="BRIGHT Education home">
            <span className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-[#174a8b] text-lg font-bold text-white">B</span>
            <span>
              <span className="block text-sm font-bold tracking-[-0.03em] sm:text-base">BRIGHT Education</span>
              <span className="mt-0.5 block text-[0.62rem] tracking-[0.15em] text-[#71849b]">LEARN · TEACH · GROW</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{name || "Learner"}</p>
              <p className="mt-0.5 max-w-48 truncate text-xs text-[#71849b]">{email}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dcecff] font-bold text-[#174a8b]" title={name || email}>{initial}</div>
            <form action={signOut}>
              <button type="submit" className="rounded-xl border border-[#dce7f3] px-3 py-2 text-sm font-semibold text-[#38536e] transition hover:border-[#b8cee7] hover:bg-[#f3f8ff]">Sign out</button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 pb-28 pt-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8 lg:pb-10 lg:pt-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-[1.5rem] border border-[#e1eaf5] bg-white p-3 shadow-[0_8px_28px_rgba(32,70,110,0.04)]">
            <p className="px-3 pb-3 pt-2 text-[0.65rem] font-bold tracking-[0.18em] text-[#8a9bb0]">YOUR SPACE</p>
            {navItems.map((item) => (
              <button key={item.id} onClick={() => goTo(item.id)} className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${section === item.id || (item.id === "all" && ["materials", "quiz", "schedule", "teachers", "profile"].includes(section)) ? "bg-[#eaf3ff] text-[#174a8b]" : "text-[#62788e] hover:bg-[#f5f8fc] hover:text-[#174a8b]"}`}>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-base">{item.icon}</span>
                {item.label}
              </button>
            ))}
            <div className="mt-4 rounded-2xl bg-[#f0f7ff] p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg text-[#2c72b8]">✦</div>
              <p className="mt-3 text-sm font-semibold">Small steps matter.</p>
              <p className="mt-1 text-xs leading-5 text-[#71849b]">Keep showing up for your learning, one day at a time.</p>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          {section === "home" && (
            <>
              <section className="relative overflow-hidden rounded-[1.8rem] bg-gradient-to-br from-[#153d70] via-[#174a8b] to-[#2b72b8] px-6 py-7 text-white shadow-[0_18px_45px_rgba(23,74,139,0.16)] sm:px-9 sm:py-9">
                <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[36px] border-white/[0.07]" />
                <div aria-hidden="true" className="pointer-events-none absolute bottom-[-7rem] right-[20%] h-52 w-52 rounded-full bg-[#8acbbd]/15 blur-2xl" />
                <div className="relative max-w-2xl">
                  <p className="text-xs font-bold tracking-[0.2em] text-[#c9e0ff]">YOUR LEARNING JOURNEY</p>
                  <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl">Learn. Practise. <span className="text-[#c8f0e8]">Achieve more.</span></h1>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">Good to have you here, {firstName}. Your classes, learning materials, past papers and progress will live in one place.</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button onClick={() => goTo("classes")} className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#174a8b] transition hover:-translate-y-0.5 hover:bg-[#edf5ff]">Explore classes <span aria-hidden="true">→</span></button>
                    <button onClick={() => goTo("papers")} className="rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">Browse past papers</button>
                  </div>
                </div>
              </section>

              <section className="mt-5 grid grid-cols-3 gap-3 sm:gap-4">
                {[
                  { icon: "▤", value: "—", label: "Study resources" },
                  { icon: "✎", value: "—", label: "Practice quizzes" },
                  { icon: "↗", value: "—", label: "Your average" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-[#e1eaf5] bg-white p-3 shadow-[0_8px_25px_rgba(32,70,110,0.03)] sm:p-5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eaf3ff] text-lg text-[#2c72b8] sm:h-10 sm:w-10">{stat.icon}</span>
                    <p className="mt-3 text-xl font-semibold sm:text-2xl">{stat.value}</p>
                    <p className="mt-1 text-[0.65rem] leading-4 text-[#71849b] sm:text-xs">{stat.label}</p>
                  </div>
                ))}
              </section>

              <section className="mt-8">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold tracking-[0.18em] text-[#4386c4]">MADE FOR YOU</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">Your learning hub</h2>
                  </div>
                  <button onClick={() => goTo("all")} className="text-sm font-semibold text-[#2c72b8] hover:underline">View all →</button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {learningSections.map((item) => (
                    <button key={item.id} onClick={() => goTo(item.id)} className="group min-h-36 rounded-2xl border border-[#e1eaf5] bg-white p-4 text-left transition hover:-translate-y-1 hover:border-[#c2d9f1] hover:shadow-[0_14px_32px_rgba(32,70,110,0.07)] sm:p-5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf3ff] text-lg font-semibold text-[#2c72b8] transition group-hover:bg-[#174a8b] group-hover:text-white">{item.icon}</span>
                      <span className="mt-4 block text-sm font-semibold leading-5">{item.title}</span>
                      <span className="mt-1.5 block text-xs leading-5 text-[#71849b]">{item.detail}</span>
                    </button>
                  ))}
                </div>
              </section>

              <div className="mt-8 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <section className="rounded-[1.5rem] border border-[#e1eaf5] bg-white p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold tracking-[0.16em] text-[#8a9bb0]">PICK UP WHERE YOU LEFT OFF</p>
                      <h2 className="mt-2 text-lg font-semibold">Continue learning</h2>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e3f5ef] text-lg text-[#368b79]">↗</span>
                  </div>
                  <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#f7faff] p-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eaf3ff] text-xl text-[#2c72b8]">▤</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">Revision & practice</p>
                      <p className="mt-1 text-xs text-[#71849b]">A sample learning module</p>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#dce7f3]"><span className="block h-full w-2/5 rounded-full bg-[#4b94cf]" /></div>
                    </div>
                    <button onClick={() => goTo("materials")} className="rounded-xl bg-[#174a8b] px-3 py-2 text-xs font-semibold text-white hover:bg-[#10396d]">Explore</button>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-[#8a9bb0]">Preview only — your personal progress will appear when learning activities are connected.</p>
                </section>
                <section className="rounded-[1.5rem] border border-[#dcebe8] bg-[#f1faf7] p-5 sm:p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg text-[#368b79]">✦</span>
                  <h2 className="mt-4 text-lg font-semibold">A note for your journey</h2>
                  <p className="mt-2 text-sm leading-6 text-[#617d7a]">You do not have to learn everything at once. Explore a topic, ask questions and celebrate the progress you make.</p>
                  <button onClick={() => goTo("schedule")} className="mt-4 text-sm font-semibold text-[#247a6a] hover:underline">Plan your learning →</button>
                </section>
              </div>
            </>
          )}

          {section !== "home" && (
            <section>
              <button onClick={() => goTo("home")} className="inline-flex items-center gap-2 text-sm font-semibold text-[#2c72b8] hover:underline">← Dashboard</button>
              <div className="mt-5">
                <p className="text-xs font-bold tracking-[0.18em] text-[#4386c4]">YOUR LEARNING SPACE</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">{pageTitle()}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#71849b]">
                  {section === "classes" ? "Find your subjects and lessons in one place." :
                    section === "materials" ? "Notes, revision guides and learning resources." :
                    section === "papers" ? "Practise with examination-style questions." :
                    section === "quiz" ? "Try a short sample question to check your understanding." :
                    section === "grades" ? "Review marks and feedback shared by your teachers." :
                    section === "schedule" ? "Keep track of lessons and upcoming activities." :
                    section === "teachers" ? "Find guidance and learning support." :
                    section === "profile" ? "Your account information and personal details." :
                    "Choose a section to continue your learning."}
                </p>
              </div>

              {["classes", "materials", "papers"].includes(section) && (
                <>
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${section === "classes" ? "classes" : section === "materials" ? "materials" : "past papers"}…`} className="mt-5 w-full rounded-xl border border-[#dce7f3] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#9aabba] focus:border-[#2876bb] focus:ring-4 focus:ring-[#2876bb]/10" />
                  {renderResourceList(currentItems)}
                  <p className="mt-4 rounded-xl bg-[#eef5ff] px-4 py-3 text-xs leading-5 text-[#647d96]">These are preview items only. Official classes and resources will be supplied through the BEMS learning library.</p>
                </>
              )}

              {section === "quiz" && (
                <div className="mt-5 rounded-[1.5rem] border border-[#e1eaf5] bg-white p-5 sm:p-7">
                  <span className="inline-flex rounded-full bg-[#eaf3ff] px-3 py-1.5 text-xs font-semibold text-[#2c72b8]">SAMPLE QUESTION · 1 OF 1</span>
                  <h2 className="mt-5 text-lg font-semibold leading-7">Which habit helps build strong learning skills?</h2>
                  <div className="mt-4 space-y-3">
                    {[
                      "Studying only once before an exam",
                      "Practising regularly and reviewing mistakes",
                      "Avoiding difficult questions",
                    ].map((answer, index) => (
                      <button key={answer} onClick={() => { setSelectedAnswer(index); setQuizChecked(false); }} className={`w-full rounded-xl border p-4 text-left text-sm transition ${selectedAnswer === index ? "border-[#2c72b8] bg-[#eaf3ff] text-[#174a8b]" : "border-[#e1eaf5] hover:border-[#b9d3ed]"}`}>
                        <span className="mr-3 font-semibold">{String.fromCharCode(65 + index)}.</span>{answer}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setQuizChecked(true)} className="mt-5 rounded-xl bg-[#174a8b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#10396d]">Check answer</button>
                  {quizChecked && <p role="status" className={`mt-4 rounded-xl p-4 text-sm leading-6 ${selectedAnswer === 1 ? "bg-[#e8f7ef] text-[#236b4b]" : "bg-[#fff6e5] text-[#89601e]"}`}>{selectedAnswer === null ? "Choose an answer first." : selectedAnswer === 1 ? "Correct! Regular practice and reviewing mistakes help strengthen learning." : "Not quite. Try again: regular practice and reviewing mistakes help build strong learning skills."}</p>}
                </div>
              )}

              {section === "grades" && (
                <div className="mt-5 rounded-[1.5rem] border border-[#e1eaf5] bg-white p-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf3ff] text-xl text-[#2c72b8]">↗</span>
                  <h2 className="mt-4 text-lg font-semibold">Your results will appear here</h2>
                  <p className="mt-2 text-sm leading-6 text-[#71849b]">No official marks have been added yet. When your teacher publishes results, scores, grades and feedback will be shown here.</p>
                </div>
              )}

              {section === "schedule" && (
                <div className="mt-5 space-y-3">
                  {[
                    { day: "MON", title: "Study session", detail: "Time to be announced" },
                    { day: "WED", title: "Practice & revision", detail: "Time to be announced" },
                    { day: "FRI", title: "Weekly knowledge check", detail: "Time to be announced" },
                  ].map((item) => (
                    <div key={item.day} className="flex items-center gap-4 rounded-2xl border border-[#e1eaf5] bg-white p-4">
                      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[#eaf3ff] text-[#174a8b]"><span className="text-[0.6rem] font-bold tracking-widest">{item.day}</span><span className="text-lg">▦</span></div>
                      <div><p className="font-semibold">{item.title}</p><p className="mt-1 text-sm text-[#71849b]">{item.detail}</p></div>
                    </div>
                  ))}
                  <p className="rounded-xl bg-[#eef5ff] px-4 py-3 text-xs leading-5 text-[#647d96]">This is a sample schedule. Your actual lessons and times will appear when scheduling is connected.</p>
                </div>
              )}

              {section === "teachers" && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#e1eaf5] bg-white p-5"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eaf3ff] text-lg text-[#2c72b8]">♧</span><h2 className="mt-4 font-semibold">Teacher directory</h2><p className="mt-2 text-sm leading-6 text-[#71849b]">Approved teacher profiles will appear here once they are added to BEMS.</p></div>
                  <div className="rounded-2xl border border-[#e1eaf5] bg-white p-5"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e3f5ef] text-lg text-[#368b79]">✦</span><h2 className="mt-4 font-semibold">Learning support</h2><p className="mt-2 text-sm leading-6 text-[#71849b]">Support and contact options will be listed here when configured by BEMS.</p></div>
                </div>
              )}

              {section === "profile" && (
                <div className="mt-5 rounded-[1.5rem] border border-[#e1eaf5] bg-white p-5 sm:p-7">
                  <div className="flex items-center gap-4 border-b border-[#e1eaf5] pb-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dcecff] text-xl font-bold text-[#174a8b]">{initial}</div>
                    <div className="min-w-0"><h2 className="font-semibold">{name || "Learner"}</h2><p className="mt-1 truncate text-sm text-[#71849b]">{email}</p></div>
                  </div>
                  <label htmlFor="profileName" className="mt-5 block text-sm font-semibold">Display name</label>
                  <input id="profileName" value={profileName} onChange={(event) => setProfileName(event.target.value)} className="mt-2 w-full rounded-xl border border-[#dce7f3] bg-white px-4 py-3 text-sm outline-none focus:border-[#2876bb] focus:ring-4 focus:ring-[#2876bb]/10" />
                  <p className="mt-3 text-xs leading-5 text-[#8a9bb0]">Profile editing will be connected to your account settings in a later step.</p>
                  <button onClick={() => setNotice("Profile editing is a preview at the moment. Your saved account details have not been changed.")} className="mt-4 rounded-xl bg-[#174a8b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#10396d]">Preview changes</button>
                  {notice && <p role="status" className="mt-3 rounded-xl bg-[#eef5ff] p-3 text-sm text-[#38536e]">{notice}</p>}
                </div>
              )}

              {section === "all" && (
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {learningSections.map((item) => (
                    <button key={item.id} onClick={() => goTo(item.id)} className="rounded-2xl border border-[#e1eaf5] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#c2d9f1] hover:shadow-sm">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf3ff] text-lg text-[#2c72b8]">{item.icon}</span>
                      <span className="mt-3 block text-sm font-semibold">{item.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-[#71849b]">{item.detail}</span>
                    </button>
                  ))}
                </div>
              )}

              {notice && section !== "profile" && <p role="status" className="mt-4 rounded-xl border border-[#dce7f3] bg-white p-4 text-sm leading-6 text-[#38536e]">{notice}</p>}
            </section>
          )}
        </div>
      </div>

      <nav aria-label="Student navigation" className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-[#e1eaf5] bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => goTo(item.id)} className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[0.65rem] font-semibold transition ${section === item.id || (item.id === "all" && ["materials", "quiz", "schedule", "teachers", "profile"].includes(section)) ? "text-[#174a8b]" : "text-[#8193a7]"}`}>
            <span className={`flex h-7 w-9 items-center justify-center rounded-xl text-lg ${section === item.id ? "bg-[#eaf3ff]" : ""}`}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </main>
  );
}
