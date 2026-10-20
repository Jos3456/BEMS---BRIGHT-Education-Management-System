
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type UserActionResult = {
  ok: boolean;
  message: string;
};

async function verifyAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email_confirmed_at) {
    return { supabase, ok: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.account_status !== "active") {
    return { supabase, ok: false };
  }

  const { data: roles, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  return {
    supabase,
    ok: !error && !!roles?.some((role) => role.role === "admin"),
  };
}

export async function setUserStatus(
  userId: string,
  status: "active" | "suspended",
): Promise<UserActionResult> {
  if (!userId || !["active", "suspended"].includes(status)) {
    return { ok: false, message: "Invalid account details." };
  }

  const { supabase, ok } = await verifyAdmin();

  if (!ok) {
    return {
      ok: false,
      message: "You are not authorized to manage users.",
    };
  }

  const { error } = await supabase.rpc("admin_set_user_status", {
    target_user_id: userId,
    new_status: status,
  });

  if (error) {
    console.error("User status update failed:", error.message);
    return {
      ok: false,
      message: "Could not update this account. Please try again.",
    };
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard");

  return {
    ok: true,
    message:
      status === "suspended"
        ? "Account suspended successfully."
        : "Account reactivated successfully.",
  };
}
