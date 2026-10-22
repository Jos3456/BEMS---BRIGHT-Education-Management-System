"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  assessmentTypeLabels,
  type ReportRow,
  type ResultRow,
  type StudentData,
  type UpcomingRow,
} from "./student-types";

type Section =
  | "home"
  | "grades"
  | "schedule"
  | "teachers"
  | "reports"
  | "classes"
  | "materials"
  | "papers"
  | "quiz"
  | "profile"
  | "all";

type HubItem = { id: Section; icon: string; title: string; detail: string; soon?: boolean };

const hubItems: HubItem[] = [
  { id: "grades", icon: "↗", title: "Grades & progress", detail: "Review your results" },
  { id: "schedule", icon: "▦", title: "Upcoming work", detail: "Deadlines and assessments" },
  { id: "teachers", icon: "♧", title: "My teachers", detail: "Who is helping you learn" },
  { id: "reports", icon: "▤", title: "Learning reports", detail: "Teacher summaries" },
  { id: "classes", icon: "▣", title: "Online classes", detail: "Lessons in one place", soon: true },
  { id: "materials", icon: "▥", title: "Study materials", detail: "Notes and revision guides" },
  { id: "papers", icon: "▧", title: "Past papers", detail: "Prepare for examinations" },
  { id: "quiz", icon: "✎", title: "Practice question", detail: "Test what you know" },
];

const navItems: { id: Section; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "grades", label: "Progress", icon: "↗" },
  { id: "schedule", label: "Upcoming", icon: "▦" },
  { id: "teachers", label: "Teachers", icon: "♧" },
  { id: "all", label: "Explore", icon: "☷" },
];

const exploreChildren: Section[] = ["reports", "classes", "materials", "papers", "quiz", "profile"];

const comingSoon: Record<"classes" | "materials" | "papers", { title: string; body: string }> = {
  classes: {
    title: "Online classes are not available yet",
    body: "When lesson booking and online classes are switched on, your lessons and join links will appear here.",
  },
  materials: {
    title: "Study materials are not available yet",
    body: "Official notes and revision guides will be published by BEMS administrators and shown here.",
  },
  papers: {
    title: "Past papers are not available yet",
    body: "Approved past papers will appear here once they have been added to the BEMS library.",
  },
};

const sectionTitles: Record<Section, string> = {
  home: "Your learning space",
  grades: "Grades & progress",
  schedule: "Upcoming work",
  teachers: "My teachers",
  reports: "Learning reports",
  classes: "Online classes",
  materials: "Study materials",
  papers: "Past papers",
  quiz: "Practice question",
  profile: "My profile",
  all: "Explore BEMS",
};

const sectionIntros: Record<Section, string> = {
  home: "",
  grades: "Marks and feedback your teachers have published.",
  schedule: "Assessments with a due date coming up.",
  teachers: "The teachers who have been assigned to support you.",
  reports: "Summaries your teachers have shared about your learning.",
  classes: "Find your subjects and lessons in one place.",
  materials: "Notes, revision guides and learning resources.",
  papers: "Practise with examination-style questions.",
  quiz: "Try a short question to check your understanding.",
  profile: "Your account information.",
  all: "Choose a section to continue your learning.",
};

function typeLabel(type: string) {
  return assessmentTypeLabels[type] ?? "Assessment";
}

function formatDate(iso: string | null, withYear = false) {
  if (!iso) return "";
  const date = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });
}

function daysUntil(iso: string) {
  const target = new Date(`${iso.slice(0, 10)}T00:00:00Z`).getTime();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });
  const start = new Date(`${today}T00:00:00Z`).getTime();
  return Math.round((target - start) / 86_400_000);
}

function dueLabel(iso: string) {
  const days = daysUntil(iso);
  if (days <= 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

// Calm, non-alarming tones: the number is always shown, colour only supports it.
function tone(percentage: number | null) {
  if (percentage === null) return { bar: "bg-[#b9c7d6]", chip: "bg-[#eef2f6] text-[#52667b]" };
  if (percentage >= 70) return { bar: "bg-[#3fa58c]", chip: "bg-[#e3f5ef] text-[#247a6a]" };
  if (percentage >= 50) return { bar: "bg-[#4b94cf]", chip: "bg-[#eaf3ff] text-[#174a8b]" };
  return { bar: "bg-[#e0a43a]", chip: "bg-[#fff3dc] text-[#89601e]" };
}

function IconBox({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eaf3ff] text-lg font-semibold text-[#2c72b8] ${className}`}>
      {children}
    </span>
  );
}

function EmptyState({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-[#d5e3f2] bg-white/80 p-7 text-center sm:p-9">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf3ff] text-xl text-[#2c72b8]">{icon}</span>
      <h2 className="mt-4 text-lg font-semibold text-[#17324f]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#71849b]">{body}</p>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#e3ebf4]" role="img" aria-label={`${value} percent`}>
      <span className={`block h-full rounded-full ${tone(value).bar}`} style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
    </div>
  );
}

function ResultCard({ result }: { result: ResultRow }) {
  const t = tone(result.percentage);
  return (
    <li className="rounded-2xl border border-[#e1eaf5] bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-6 text-[#17324f]">{result.title}</p>
          <p className="mt-1 text-sm text-[#71849b]">
            {result.subject}
            {result.course ? ` · ${result.course}` : ""} · {typeLabel(result.type)}
            {result.date ? ` · ${formatDate(result.date, true)}` : ""}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {result.score !== null ? (
            <>
              <p className="text-lg font-semibold text-[#17324f]">
                {result.score}
                <span className="text-sm font-normal text-[#71849b]"> / {result.maxScore}</span>
              </p>
              <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${t.chip}`}>
                {result.percentage}%{result.grade ? ` · ${result.grade}` : ""}
              </span>
            </>
          ) : (
            <span className="rounded-full bg-[#eef2f6] px-2.5 py-1 text-xs font-semibold text-[#52667b]">Not scored</span>
          )}
        </div>
      </div>
      {result.percentage !== null && <div className="mt-3"><ProgressBar value={result.percentage} /></div>}
      {result.feedback && (
        <div className="mt-3 rounded-xl bg-[#f3f8ff] p-3.5">
          <p className="text-[0.65rem] font-bold tracking-[0.14em] text-[#4386c4]">TEACHER FEEDBACK</p>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-[#38536e]">{result.feedback}</p>
        </div>
      )}
    </li>
  );
}

function UpcomingCard({ item }: { item: UpcomingRow }) {
  const days = daysUntil(item.dueDate);
  return (
    <li className="flex items-center gap-4 rounded-2xl border border-[#e1eaf5] bg-white p-4">
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[#eaf3ff] text-[#174a8b]">
        <span className="text-[0.6rem] font-bold uppercase tracking-widest">
          {new Date(`${item.dueDate}T00:00:00Z`).toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })}
        </span>
        <span className="text-lg font-semibold leading-none">
          {new Date(`${item.dueDate}T00:00:00Z`).getUTCDate()}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-6">{item.title}</p>
        <p className="mt-0.5 text-sm text-[#71849b]">
          {item.subject}
          {item.course ? ` · ${item.course}` : ""} · {typeLabel(item.type)} · {item.maxScore} marks
        </p>
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${days <= 2 ? "bg-[#fff3dc] text-[#89601e]" : "bg-[#eef2f6] text-[#52667b]"}`}>
        {dueLabel(item.dueDate)}
      </span>
    </li>
  );
}

function ReportCard({ report }: { report: ReportRow }) {
  const blocks: [string, string | null][] = [
    ["SUMMARY", report.summary],
    ["STRENGTHS", report.strengths],
    ["AREAS TO IMPROVE", report.areasToImprove],
    ["TEACHER COMMENT", report.teacherComment],
  ];
  return (
    <li className="rounded-2xl border border-[#e1eaf5] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="font-semibold">{report.title}</h2>
        <p className="text-xs text-[#71849b]">
          {[report.period, report.publishedAt ? formatDate(report.publishedAt, true) : ""].filter(Boolean).join(" · ")}
        </p>
      </div>
      <div className="mt-4 space-y-4">
        {blocks.filter(([, text]) => text).map(([label, text]) => (
          <div key={label}>
            <p className="text-[0.65rem] font-bold tracking-[0.14em] text-[#4386c4]">{label}</p>
            <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-[#38536e]">{text}</p>
          </div>
        ))}
        {blocks.every(([, text]) => !text) && <p className="text-sm text-[#71849b]">This report has no written comments.</p>}
      </div>
    </li>
  );
}

export default function StudentDashboard({
  name,
  email,
  data,
  signOut,
}: {
  name: string;
  email: string;
  data: StudentData;
  signOut: () => Promise<void>;
}) {
  const [section, setSection] = useState<Section>("home");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizChecked, setQuizChecked] = useState(false);

  const firstName = (name || email.split("@")[0] || "Learner").trim().split(/\s+/)[0];
  const initial = (name || email || "S").trim().charAt(0).toUpperCase();

  const visibleResults = useMemo(
    () => (subjectFilter === "all" ? data.results : data.results.filter((r) => r.subject === subjectFilter)),
    [data.results, subjectFilter],
  );

  const nextUp = data.upcoming[0];
  const recent = data.results.slice(0, 3);

  function goTo(next: Section) {
    setSection(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function isActive(id: Section) {
    return section === id || (id === "all" && exploreChildren.includes(section));
  }

  const stats = [
    { icon: "✓", value: data.results.length ? String(data.results.length) : "—", label: "Results published" },
    { icon: "↗", value: data.overallAverage !== null ? `${data.overallAverage}%` : "—", label: "Average score" },
    { icon: "▦", value: data.upcoming.length ? String(data.upcoming.length) : "—", label: "Upcoming" },
  ];

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
            <button onClick={() => goTo("profile")} className="flex items-center gap-3 rounded-xl text-right transition hover:opacity-80" aria-label="Open my profile">
              <span className="hidden sm:block">
                <span className="block text-sm font-semibold">{name || "Learner"}</span>
                <span className="mt-0.5 block max-w-48 truncate text-xs text-[#71849b]">{email}</span>
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dcecff] font-bold text-[#174a8b]">{initial}</span>
            </button>
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
              <button key={item.id} onClick={() => goTo(item.id)} aria-current={isActive(item.id) ? "page" : undefined} className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${isActive(item.id) ? "bg-[#eaf3ff] text-[#174a8b]" : "text-[#62788e] hover:bg-[#f5f8fc] hover:text-[#174a8b]"}`}>
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
          {data.loadFailed && (
            <p role="alert" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Some of your learning records could not be loaded. Refresh the page to try again.
            </p>
          )}

          {section === "home" && (
            <>
              <section className="relative overflow-hidden rounded-[1.8rem] bg-gradient-to-br from-[#153d70] via-[#174a8b] to-[#2b72b8] px-6 py-7 text-white shadow-[0_18px_45px_rgba(23,74,139,0.16)] sm:px-9 sm:py-9">
                <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[36px] border-white/[0.07]" />
                <div aria-hidden="true" className="pointer-events-none absolute bottom-[-7rem] right-[20%] h-52 w-52 rounded-full bg-[#8acbbd]/15 blur-2xl" />
                <div className="relative max-w-2xl">
                  <p className="text-xs font-bold tracking-[0.2em] text-[#c9e0ff]">YOUR LEARNING JOURNEY</p>
                  <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl">Learn. Practise. <span className="text-[#c8f0e8]">Achieve more.</span></h1>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">
                    Good to have you here, {firstName}.{" "}
                    {nextUp
                      ? `Next up: ${nextUp.title} (${nextUp.subject}) — ${dueLabel(nextUp.dueDate).toLowerCase()}.`
                      : data.results.length
                        ? "Here is how your learning is going."
                        : "Your results, deadlines and teacher feedback will appear here as they are shared."}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button onClick={() => goTo("grades")} className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#174a8b] transition hover:-translate-y-0.5 hover:bg-[#edf5ff]">View my progress <span aria-hidden="true">→</span></button>
                    <button onClick={() => goTo("schedule")} className="rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">Upcoming work</button>
                  </div>
                </div>
              </section>

              <section className="mt-5 grid grid-cols-3 gap-3 sm:gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-[#e1eaf5] bg-white p-3 shadow-[0_8px_25px_rgba(32,70,110,0.03)] sm:p-5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eaf3ff] text-lg text-[#2c72b8] sm:h-10 sm:w-10">{stat.icon}</span>
                    <p className="mt-3 text-xl font-semibold sm:text-2xl">{stat.value}</p>
                    <p className="mt-1 text-[0.65rem] leading-4 text-[#71849b] sm:text-xs">{stat.label}</p>
                  </div>
                ))}
              </section>

              <div className="mt-8 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <section className="rounded-[1.5rem] border border-[#e1eaf5] bg-white p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold tracking-[0.16em] text-[#8a9bb0]">LATEST FROM YOUR TEACHERS</p>
                      <h2 className="mt-2 text-lg font-semibold">Recent results</h2>
                    </div>
                    {recent.length > 0 && <button onClick={() => goTo("grades")} className="text-sm font-semibold text-[#2c72b8] hover:underline">See all →</button>}
                  </div>
                  {recent.length === 0 ? (
                    <p className="mt-4 rounded-2xl bg-[#f7faff] p-4 text-sm leading-6 text-[#71849b]">No results have been published yet. When a teacher shares your marks, the latest ones will show here.</p>
                  ) : (
                    <ul className="mt-4 space-y-3">
                      {recent.map((r) => {
                        const t = tone(r.percentage);
                        return (
                          <li key={r.id} className="flex items-center gap-3 rounded-2xl bg-[#f7faff] p-4">
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold">{r.title}</p>
                              <p className="mt-0.5 truncate text-xs text-[#71849b]">{r.subject} · {typeLabel(r.type)}</p>
                            </div>
                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${t.chip}`}>
                              {r.percentage !== null ? `${r.percentage}%${r.grade ? ` · ${r.grade}` : ""}` : "Not scored"}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>

                <section className="rounded-[1.5rem] border border-[#dcebe8] bg-[#f1faf7] p-5 sm:p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg text-[#368b79]">▦</span>
                  <h2 className="mt-4 text-lg font-semibold">Coming up</h2>
                  {nextUp ? (
                    <>
                      <p className="mt-2 text-sm font-semibold text-[#2f5e55]">{nextUp.title}</p>
                      <p className="mt-1 text-sm leading-6 text-[#617d7a]">{nextUp.subject} · {typeLabel(nextUp.type)} · {formatDate(nextUp.dueDate, true)}</p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm leading-6 text-[#617d7a]">Nothing is due right now. Use the time to revise something you found tricky.</p>
                  )}
                  <button onClick={() => goTo("schedule")} className="mt-4 text-sm font-semibold text-[#247a6a] hover:underline">See upcoming work →</button>
                </section>
              </div>

              <section className="mt-8">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold tracking-[0.18em] text-[#4386c4]">MADE FOR YOU</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">Your learning hub</h2>
                  </div>
                  <button onClick={() => goTo("all")} className="text-sm font-semibold text-[#2c72b8] hover:underline">View all →</button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
                  {hubItems.map((item) => (
                    <button key={item.id} onClick={() => goTo(item.id)} className="group relative min-h-36 rounded-2xl border border-[#e1eaf5] bg-white p-4 text-left transition hover:-translate-y-1 hover:border-[#c2d9f1] hover:shadow-[0_14px_32px_rgba(32,70,110,0.07)] sm:p-5">
                      {item.soon && <span className="absolute right-3 top-3 rounded-full bg-[#eef2f6] px-2 py-0.5 text-[0.6rem] font-bold tracking-wider text-[#52667b]">SOON</span>}
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf3ff] text-lg font-semibold text-[#2c72b8] transition group-hover:bg-[#174a8b] group-hover:text-white">{item.icon}</span>
                      <span className="mt-4 block text-sm font-semibold leading-5">{item.title}</span>
                      <span className="mt-1.5 block text-xs leading-5 text-[#71849b]">{item.detail}</span>
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {section !== "home" && (
            <section>
              <button onClick={() => goTo("home")} className="inline-flex items-center gap-2 text-sm font-semibold text-[#2c72b8] hover:underline">← Dashboard</button>
              <div className="mt-5">
                <p className="text-xs font-bold tracking-[0.18em] text-[#4386c4]">YOUR LEARNING SPACE</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">{sectionTitles[section]}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#71849b]">{sectionIntros[section]}</p>
              </div>

              {section === "grades" && (
                <div className="mt-6">
                  {data.results.length === 0 ? (
                    <EmptyState icon="↗" title="Your results will appear here" body="No marks have been published yet. When your teacher publishes results, your scores, grades and feedback will be shown here." />
                  ) : (
                    <>
                      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                        <div className="rounded-[1.5rem] border border-[#e1eaf5] bg-white p-5 sm:p-6">
                          <p className="text-xs font-bold tracking-[0.16em] text-[#8a9bb0]">OVERALL</p>
                          <p className="mt-3 text-4xl font-semibold tracking-tight">{data.overallAverage !== null ? `${data.overallAverage}%` : "—"}</p>
                          <p className="mt-1 text-sm text-[#71849b]">Average across {data.subjects.reduce((n, s) => n + s.count, 0)} scored result{data.subjects.reduce((n, s) => n + s.count, 0) === 1 ? "" : "s"}</p>
                          <p className="mt-4 text-xs leading-5 text-[#8a9bb0]">This number summarises published marks only. It does not measure everything you can do.</p>
                        </div>
                        <div className="rounded-[1.5rem] border border-[#e1eaf5] bg-white p-5 sm:p-6">
                          <p className="text-xs font-bold tracking-[0.16em] text-[#8a9bb0]">BY SUBJECT</p>
                          {data.subjects.length === 0 ? (
                            <p className="mt-4 text-sm text-[#71849b]">Subject averages appear once scored results are published.</p>
                          ) : (
                            <ul className="mt-4 space-y-4">
                              {data.subjects.map((s) => (
                                <li key={s.subject}>
                                  <div className="flex items-baseline justify-between gap-3">
                                    <span className="text-sm font-semibold">{s.subject}</span>
                                    <span className="text-sm text-[#52667b]">{s.average}% <span className="text-xs text-[#8a9bb0]">· {s.count} result{s.count === 1 ? "" : "s"}</span></span>
                                  </div>
                                  <div className="mt-2"><ProgressBar value={s.average} /></div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold">All results</h2>
                        <label className="flex items-center gap-2 text-sm text-[#52667b]">
                          <span className="font-semibold">Subject</span>
                          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="rounded-xl border border-[#dce7f3] bg-white px-3 py-2 text-sm outline-none focus:border-[#2876bb] focus:ring-4 focus:ring-[#2876bb]/10">
                            <option value="all">All subjects</option>
                            {Array.from(new Set(data.results.map((r) => r.subject))).sort().map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </label>
                      </div>
                      <ul className="mt-3 space-y-3">
                        {visibleResults.map((r) => <ResultCard key={r.id} result={r} />)}
                      </ul>
                    </>
                  )}
                </div>
              )}

              {section === "schedule" && (
                <div className="mt-6">
                  {data.upcoming.length === 0 ? (
                    <EmptyState icon="▦" title="Nothing due right now" body="When a teacher publishes an assessment with a due date, it will appear here so you can plan ahead." />
                  ) : (
                    <ul className="space-y-3">{data.upcoming.map((item) => <UpcomingCard key={item.id} item={item} />)}</ul>
                  )}
                  <p className="mt-4 rounded-xl bg-[#eef5ff] px-4 py-3 text-xs leading-5 text-[#647d96]">This list shows assessment deadlines. Lesson times will be added when lesson booking is available.</p>
                </div>
              )}

              {section === "teachers" && (
                <div className="mt-6">
                  {data.teachers.length === 0 ? (
                    <EmptyState icon="♧" title="No teachers assigned yet" body="Once an administrator assigns a teacher to your subject, they will be listed here." />
                  ) : (
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {data.teachers.map((t) => (
                        <li key={t.id} className="flex items-center gap-4 rounded-2xl border border-[#e1eaf5] bg-white p-4 sm:p-5">
                          <IconBox>{(t.teacherName ?? "T").charAt(0).toUpperCase()}</IconBox>
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{t.teacherName ?? "Your teacher"}</p>
                            <p className="mt-0.5 truncate text-sm text-[#71849b]">{t.subject}{t.course ? ` · ${t.course}` : ""}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {section === "reports" && (
                <div className="mt-6">
                  {data.reports.length === 0 ? (
                    <EmptyState icon="▤" title="No reports yet" body="When a teacher publishes a learning report for you, you will find it here." />
                  ) : (
                    <ul className="space-y-3">{data.reports.map((r) => <ReportCard key={r.id} report={r} />)}</ul>
                  )}
                </div>
              )}

              
            {(section === "classes" || section === "materials" || section === "papers") && (
              <div className="mt-6">
                {section === "classes" ? (
                  <EmptyState
                    icon="▣"
                    title={comingSoon.classes.title}
                    body={comingSoon.classes.body}
                  />
                ) : (
                  (() => {
                    const resources = (data.resources ?? []).filter((resource) => {
                      const isPaper = /paper|exam/i.test(resource.category);
                      return section === "papers" ? isPaper : !isPaper;
                    });

                    return resources.length === 0 ? (
                      <EmptyState
                        icon="▥"
                        title={
                          section === "materials"
                            ? "No study materials yet"
                            : "No past papers yet"
                        }
                        body={
                          section === "materials"
                            ? "Published notes and revision guides will appear here when they are available."
                            : "Published past papers will appear here when they are available."
                        }
                      />
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {resources.map((resource) => (
                          <article
                            key={resource.id}
                            className="rounded-2xl border border-[var(--border)] p-5"
                          >
                            <p className="text-xs font-semibold uppercase tracking-wide opacity-60">
                              {resource.category || "Learning resource"}
                            </p>

                            <h3 className="mt-2 text-lg font-semibold">
                              {resource.title}
                            </h3>

                            <p className="mt-2 text-sm opacity-75">
                              {[resource.subject, resource.curriculum, resource.education_level]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>

                            {resource.description && (
                              <p className="mt-3 text-sm">{resource.description}</p>
                            )}

                            {resource.file_name && (
                              <p className="mt-3 break-words text-xs opacity-60">
                                File: {resource.file_name}
                              </p>
                            )}

                            {resource.signedUrl ? (
                              <a
                                href={resource.signedUrl}
                                target="_blank"
                                rel="noreferrer"
                                download
                                className="mt-4 inline-flex rounded-xl bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-[var(--background)]"
                              >
                                Download resource
                              </a>
                            ) : (
                              <p className="mt-4 text-sm opacity-70">
                                Download link unavailable. Please refresh and try again.
                              </p>
                            )}
                          </article>
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>
            )}


              {section === "quiz" && (
                <div className="mt-6 rounded-[1.5rem] border border-[#e1eaf5] bg-white p-5 sm:p-7">
                  <span className="inline-flex rounded-full bg-[#eaf3ff] px-3 py-1.5 text-xs font-semibold text-[#2c72b8]">SAMPLE QUESTION · NOT GRADED</span>
                  <h2 className="mt-5 text-lg font-semibold leading-7">Which habit helps build strong learning skills?</h2>
                  <div className="mt-4 space-y-3">
                    {["Studying only once before an exam", "Practising regularly and reviewing mistakes", "Avoiding difficult questions"].map((answer, index) => (
                      <button key={answer} onClick={() => { setSelectedAnswer(index); setQuizChecked(false); }} aria-pressed={selectedAnswer === index} className={`w-full rounded-xl border p-4 text-left text-sm transition ${selectedAnswer === index ? "border-[#2c72b8] bg-[#eaf3ff] text-[#174a8b]" : "border-[#e1eaf5] hover:border-[#b9d3ed]"}`}>
                        <span className="mr-3 font-semibold">{String.fromCharCode(65 + index)}.</span>{answer}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setQuizChecked(true)} className="mt-5 rounded-xl bg-[#174a8b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#10396d]">Check answer</button>
                  {quizChecked && (
                    <p role="status" className={`mt-4 rounded-xl p-4 text-sm leading-6 ${selectedAnswer === 1 ? "bg-[#e8f7ef] text-[#236b4b]" : "bg-[#fff6e5] text-[#89601e]"}`}>
                      {selectedAnswer === null ? "Choose an answer first." : selectedAnswer === 1 ? "Correct! Regular practice and reviewing mistakes help strengthen learning." : "Not quite. Try again: regular practice and reviewing mistakes help build strong learning skills."}
                    </p>
                  )}
                  <p className="mt-4 text-xs leading-5 text-[#8a9bb0]">This is a single practice question. Real quizzes from your teachers appear under Grades &amp; progress once published.</p>
                </div>
              )}

              {section === "profile" && (
                <div className="mt-6 rounded-[1.5rem] border border-[#e1eaf5] bg-white p-5 sm:p-7">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dcecff] text-xl font-bold text-[#174a8b]">{initial}</div>
                    <div className="min-w-0">
                      <h2 className="font-semibold">{name || "Learner"}</h2>
                      <p className="mt-1 truncate text-sm text-[#71849b]">{email}</p>
                    </div>
                  </div>
                  <dl className="mt-6 grid gap-4 border-t border-[#e1eaf5] pt-5 sm:grid-cols-2">
                    <div><dt className="text-xs font-bold tracking-[0.14em] text-[#8a9bb0]">ACCOUNT TYPE</dt><dd className="mt-1 text-sm font-semibold">Student</dd></div>
                    <div><dt className="text-xs font-bold tracking-[0.14em] text-[#8a9bb0]">TEACHERS</dt><dd className="mt-1 text-sm font-semibold">{data.teachers.length}</dd></div>
                  </dl>
                  <p className="mt-5 rounded-xl bg-[#eef5ff] px-4 py-3 text-xs leading-5 text-[#647d96]">Editing your profile and linking a parent or guardian will be added in a later step.</p>
                </div>
              )}

              {section === "all" && (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {[...hubItems, { id: "profile" as Section, icon: "○", title: "My profile", detail: "Your account details" }].map((item) => (
                    <button key={item.id} onClick={() => goTo(item.id)} className="relative rounded-2xl border border-[#e1eaf5] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#c2d9f1] hover:shadow-sm">
                      {"soon" in item && item.soon && <span className="absolute right-3 top-3 rounded-full bg-[#eef2f6] px-2 py-0.5 text-[0.6rem] font-bold tracking-wider text-[#52667b]">SOON</span>}
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf3ff] text-lg text-[#2c72b8]">{item.icon}</span>
                      <span className="mt-3 block text-sm font-semibold">{item.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-[#71849b]">{item.detail}</span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      <nav aria-label="Student navigation" className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-[#e1eaf5] bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => goTo(item.id)} aria-current={isActive(item.id) ? "page" : undefined} className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[0.65rem] font-semibold transition ${isActive(item.id) ? "text-[#174a8b]" : "text-[#8193a7]"}`}>
            <span className={`flex h-7 w-9 items-center justify-center rounded-xl text-lg ${isActive(item.id) ? "bg-[#eaf3ff]" : ""}`}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </main>
  );
}
