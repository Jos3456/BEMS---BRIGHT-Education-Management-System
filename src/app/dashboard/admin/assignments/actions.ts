"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function requireActiveAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || !user.email_confirmed_at) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.account_status !== "active") redirect("/login");

  const { data: adminRole, error: roleError } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (roleError || !adminRole) redirect("/dashboard");

  return { supabase, user };
}

export async function assignLearnersToTeacher(formData: FormData) {
  const { supabase, user } = await requireActiveAdmin();
  const teacherId = String(formData.get("teacher_id") ?? "").trim();
  const subjectName = String(formData.get("subject_name") ?? "").trim();
  const courseName = String(formData.get("course_name") ?? "").trim();
  const learnerIds = [...new Set(
    formData.getAll("learner_ids").filter((value): value is string => typeof value === "string")
      .map((value) => value.trim()).filter(Boolean),
  )];

  if (
    !UUID_PATTERN.test(teacherId) ||
    !subjectName ||
    subjectName.length > 120 ||
    courseName.length > 120 ||
    learnerIds.length === 0 ||
    learnerIds.length > 100 ||
    learnerIds.some((id) => !UUID_PATTERN.test(id))
  ) {
    redirect("/dashboard/admin/assignments?error=invalid_form");
  }

  const { data: teacherRole, error: teacherRoleError } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("user_id", teacherId)
    .eq("role", "teacher")
    .maybeSingle();

  const { data: teacherProfile, error: teacherProfileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", teacherId)
    .eq("account_status", "active")
    .maybeSingle();

  if (teacherRoleError || teacherProfileError || !teacherRole || !teacherProfile) {
    redirect("/dashboard/admin/assignments?error=invalid_teacher");
  }

  const { data: studentRoles, error: studentRoleError } = await supabase
    .from("user_roles")
    .select("user_id")
    .in("user_id", learnerIds)
    .eq("role", "student");

  if (studentRoleError) redirect("/dashboard/admin/assignments?error=load_failed");

  const validStudentIds = [...new Set((studentRoles ?? []).map((item) => item.user_id))];
  const { data: activeProfiles, error: learnerProfileError } = await supabase
    .from("profiles")
    .select("id")
    .in("id", validStudentIds.length ? validStudentIds : ["00000000-0000-0000-0000-000000000000"])
    .eq("account_status", "active");

  if (learnerProfileError) redirect("/dashboard/admin/assignments?error=load_failed");

  const activeStudentIds = new Set((activeProfiles ?? []).map((item) => item.id));
  if (activeStudentIds.size !== learnerIds.length) {
    redirect("/dashboard/admin/assignments?error=invalid_learner");
  }

  let assigned = 0;
  let alreadyActive = 0;
  let failed = 0;

  for (const learnerId of learnerIds) {
    let existingQuery = supabase
      .from("teacher_learner_assignments")
      .select("id, status")
      .eq("teacher_id", teacherId)
      .eq("learner_id", learnerId)
      .eq("subject_name", subjectName);

    existingQuery = courseName
      ? existingQuery.eq("course_name", courseName)
      : existingQuery.is("course_name", null);

    const { data: existingRows, error: existingError } = await existingQuery.limit(1);
    if (existingError) {
      failed += 1;
      continue;
    }

    const existing = existingRows?.[0];
    if (existing?.status === "active") {
      alreadyActive += 1;
      continue;
    }

    if (existing) {
      const { error: updateError } = await supabase
        .from("teacher_learner_assignments")
        .update({ status: "active" })
        .eq("id", existing.id);

      if (updateError) {
        failed += 1;
        continue;
      }
    } else {
      const { error: insertError } = await supabase
        .from("teacher_learner_assignments")
        .insert({
          teacher_id: teacherId,
          learner_id: learnerId,
          subject_name: subjectName,
          course_name: courseName || null,
          status: "active",
          created_by: user.id,
        });

      if (insertError) {
        failed += 1;
        continue;
      }
    }

    assigned += 1;
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/assignments");
  revalidatePath("/dashboard/teacher/marks");
  const query = new URLSearchParams({
    saved: "1",
    assigned: String(assigned),
    existing: String(alreadyActive),
    failed: String(failed),
  });
  redirect(`/dashboard/admin/assignments?${query.toString()}`);
}

export async function setTeacherLearnerAssignmentStatus(formData: FormData) {
  const { supabase } = await requireActiveAdmin();
  const assignmentId = String(formData.get("assignment_id") ?? "").trim();
  const nextStatus = String(formData.get("next_status") ?? "").trim();

  if (!UUID_PATTERN.test(assignmentId) || !["active", "revoked"].includes(nextStatus)) {
    redirect("/dashboard/admin/assignments?error=invalid_form");
  }

  const { data: updated, error } = await supabase
    .from("teacher_learner_assignments")
    .update({ status: nextStatus })
    .eq("id", assignmentId)
    .select("id")
    .maybeSingle();

  if (error || !updated) redirect("/dashboard/admin/assignments?error=save_failed");

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/assignments");
  revalidatePath("/dashboard/teacher/marks");
  redirect(`/dashboard/admin/assignments?status=${nextStatus === "active" ? "reactivated" : "revoked"}`);
}
