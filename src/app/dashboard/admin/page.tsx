import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ApplicationReviewActions from "./application-review-actions";
import UserManagement from "./user-management";
import ResourcesManager from "./resources-manager";

export const instant = false;

type AdminDashboardPageProps = {
  searchParams: Promise<{
    review?: string;
    review_error?: string;
  }>;
};

export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  await connection();

  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email_confirmed_at) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, account_status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.account_status !== "active") {
    redirect("/login");
  }

  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (rolesError || !roles?.some((item) => item.role === "admin")) {
    redirect("/dashboard");
  }

  const [
    profilesCount,
    studentsCount,
    teachersCount,
    applicationsCount,
    pendingApplications,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("user_roles")
      .select("user_id", { count: "exact", head: true })
      .eq("role", "student"),
    supabase
      .from("user_roles")
      .select("user_id", { count: "exact", head: true })
      .eq("role", "teacher"),
    supabase
      .from("teacher_applications")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("teacher_applications")
      .select(
        "id, user_id, status, subjects, curricula, qualifications, experience, supporting_documents, submitted_at, created_at",
      )
      .in("status", [
        "submitted",
        "under_review",
        "additional_info_requested",
      ])
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const stats = [
    { label: "User profiles", value: profilesCount.count },
    { label: "Students", value: studentsCount.count },
    { label: "Teachers", value: teachersCount.count },
    { label: "Teacher applications", value: applicationsCount.count },
  ];

    const { data: userData, error: userLoadError } =
    await supabase.rpc("admin_list_users");

  const managedUsers = (userData ?? []) as {
    user_id: string;
    full_name: string | null;
    email: string | null;
    account_status: string;
    roles: string[];
    created_at: string;
  }[];

  const applicantIds = [
    ...new Set((pendingApplications.data ?? []).map((app) => app.user_id)),
  ];

  const { data: applicants } = applicantIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", applicantIds)
    : { data: [] };

  const applicantNames = new Map(
    (applicants ?? []).map((applicant) => [
      applicant.id,
      applicant.full_name || "Unnamed applicant",
    ]),
  );

  const countError = [
    profilesCount.error,
    studentsCount.error,
    teachersCount.error,
    applicationsCount.error,
  ].some(Boolean);

  const successMessage =
    params.review === "approved"
      ? "Application approved. The teacher role has been assigned."
      : params.review === "rejected"
        ? "Application rejected. Your review has been saved."
        : null;

  const errorMessages: Record<string, string> = {
    invalid_application: "That application ID is invalid. Refresh and try again.",
    invalid_decision: "Choose either approve or reject, then try again.",
    notes_too_long: "Review notes must be 2,000 characters or fewer.",
    save_failed:
      "The review could not be saved. Confirm the Supabase review_teacher_application function is installed, then try again.",
  };
  const errorMessage = params.review_error
    ? errorMessages[params.review_error]
    : null;

  return (
    <main className="min-h-screen bg-[#f7faff] p-6 text-[#17324f] sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#52749a]">
              BRIGHT Education
            </p>
            <h1 className="mt-1 text-3xl font-bold">Administration</h1>
            <p className="mt-2 text-sm text-[#71849b]">
              Welcome, {profile.full_name || "Administrator"}
            </p>
          </div>

          <a
            href="/dashboard"
            className="rounded-xl border border-[#dce7f3] bg-white px-4 py-2 text-sm font-semibold hover:bg-[#f0f6ff]"
          >
            Back to dashboard
          </a>
        </header>

        {successMessage && (
          <p
            role="status"
            className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
          >
            {successMessage}
          </p>
        )}

        {errorMessage && (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {errorMessage}
          </p>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-[#e1eaf5] bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-[#71849b]">{stat.label}</p>
              <p className="mt-3 text-3xl font-bold">{stat.value ?? "—"}</p>
            </article>
          ))}
        </section>

                <UserManagement
          users={managedUsers}
          loadError={!!userLoadError}
        />
        <ResourcesManager />

        {countError && (
          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Some totals could not be loaded. Check the table permissions and
            Supabase errors before relying on these figures.
          </p>
        )}

        <section className="mt-8 rounded-2xl border border-[#e1eaf5] bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-bold">Teacher applications</h2>
            <p className="mt-1 text-sm text-[#71849b]">
              Review applications that are submitted, under review, or awaiting
              additional information. The latest 10 are shown.
            </p>
          </div>

          {pendingApplications.error ? (
            <p className="mt-5 text-sm text-red-700">
              Could not load applications. Check the Supabase query and
              permissions.
            </p>
          ) : !pendingApplications.data?.length ? (
            <p className="mt-5 rounded-xl bg-[#f7faff] p-5 text-sm text-[#71849b]">
              No applications are currently awaiting review.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {pendingApplications.data.map((app) => (
                <article
                  key={app.id}
                  className="rounded-xl border border-[#e1eaf5] p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">
                        {applicantNames.get(app.user_id) ?? "Unknown applicant"}
                      </h3>
                      <p className="mt-1 text-sm text-[#71849b]">
                        {app.subjects?.length
                          ? app.subjects.join(", ")
                          : "No subjects listed"}
                      </p>
                      <p className="mt-1 text-sm text-[#71849b]">
                        Curricula:{" "}
                        {app.curricula?.length
                          ? app.curricula.join(", ")
                          : "Not specified"}
                      </p>
                    </div>

                    <span className="rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-semibold capitalize text-[#174a8b]">
                      {app.status.replaceAll("_", " ")}
                    </span>
                  </div>

                  <div className="mt-4 space-y-4 border-t border-[#e1eaf5] pt-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#71849b]">
                        Qualifications
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm">
                        {app.qualifications || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#71849b]">
                        Experience
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm">
                        {app.experience || "Not provided"}
                      </p>
                    </div>

                    <p className="text-xs text-[#71849b]">
                      Submitted:{" "}
                      {app.submitted_at
                        ? new Date(app.submitted_at).toLocaleDateString()
                        : "Not submitted"}
                    </p>
                  </div>

                  <ApplicationReviewActions applicationId={app.id} />
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
