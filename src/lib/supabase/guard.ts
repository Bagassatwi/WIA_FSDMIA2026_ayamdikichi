import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type UserRole = "admin" | "petugas";

export async function requireRole(requiredRole: UserRole) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/login");
  }

  const userId = data.claims.sub;

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("role, is_active")
    .eq("id", userId)
    .single();

  if (profileError || !profile || !profile.is_active) {
    redirect("/login?error=akses-ditolak");
  }

  if (profile.role !== requiredRole) {
    redirect("/login?error=role-tidak-sesuai");
  }

  return profile;
}
