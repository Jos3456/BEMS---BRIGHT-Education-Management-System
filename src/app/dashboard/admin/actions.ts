"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function reviewTeacherApplication(formData: FormData) {
  const applicationId = String(formData.get("application_id") ?? "").trim();
  const decision = String(formData.get("decision") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(applicationId)) {
    redirect("/dashboard/admin?review_error=invalid_application");
  }

  if (decision !== "approved" && decision !== "rejected") {
    redirect("/dashboard/admin?review_error=invalid_decision");
  }

  if (notes.length > 2000) {
    redirect("/dashboard/admin?review_error=notes_too_long");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || !user.email_confirmed_at) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("account_status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.account_status !== "active") {
    redirect("/login");
  }

  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (rolesError || !roles?.some((role) => role.role === "admin")) {
    redirect("/dashboard");
  }

  const { error } = await supabase.rpc("review_teacher_application", {
    application_id: applicationId,
    decision,
    notes: notes || null,
  });

  if (error) {
    redirect("/dashboard/admin?review_error=save_failed");
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard");
  redirect(`/dashboard/admin?review=${decision}`);
}
