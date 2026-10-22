// Shared types for the student dashboard. Kept free of server-only code so the
// client component can import them safely.

export type ResultRow = {
  id: string;
  title: string;
  subject: string;
  course: string | null;
  type: string;
  score: number | null;
  maxScore: number;
  percentage: number | null;
  grade: string | null;
  feedback: string | null;
  date: string | null; // ISO date (YYYY-MM-DD) or graded date
};

export type SubjectSummary = {
  subject: string;
  count: number;
  average: number;
};

export type UpcomingRow = {
  id: string;
  title: string;
  subject: string;
  course: string | null;
  type: string;
  dueDate: string; // ISO date (YYYY-MM-DD)
  maxScore: number;
};

export type TeacherRow = {
  id: string;
  teacherName: string | null;
  subject: string;
  course: string | null;
};

export type ReportRow = {
  id: string;
  title: string;
  period: string | null;
  summary: string | null;
  strengths: string | null;
  areasToImprove: string | null;
  teacherComment: string | null;
  publishedAt: string | null;
};

export type StudentResource = {
  id: string;
  title: string;
  category: string;
  description: string;
  curriculum: string;
  subject: string;
  education_level: string;
  file_name: string;
  file_size: number;
  signedUrl: string | null;
};

export type StudentData = {
  results: ResultRow[];
  subjects: SubjectSummary[];
  overallAverage: number | null;
  upcoming: UpcomingRow[];
  teachers: TeacherRow[];
  reports: ReportRow[];
  resources: StudentResource[];
  loadFailed: boolean;
};

export const emptyStudentData: StudentData = {
  results: [],
  subjects: [],
  overallAverage: null,
  upcoming: [],
  teachers: [],
  reports: [],
  resources: [],
  loadFailed: false,
};

export const assessmentTypeLabels: Record<string, string> = {
  quiz: "Quiz",
  assignment: "Assignment",
  cat: "CAT",
  exam: "Exam",
  project: "Project",
  practice: "Practice",
  other: "Other",
};
