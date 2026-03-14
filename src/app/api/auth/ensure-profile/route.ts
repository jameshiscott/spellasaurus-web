import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";

/**
 * POST /api/auth/ensure-profile
 * Creates a profile row for an authenticated user who doesn't have one yet.
 * Uses user_metadata (role, full_name) set during registration.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const serviceClient = createServiceClient();

  // Check if profile already exists
  const { data: existing } = await serviceClient
    .from(TABLES.USERS)
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ role: existing.role });
  }

  const meta = user.user_metadata ?? {};
  const role = meta.role ?? "parent";
  const fullName = meta.full_name ?? "";

  const { error: insertError } = await serviceClient.from(TABLES.USERS).insert({
    id: user.id,
    role,
    full_name: fullName,
    email: user.email ?? "",
    onboarding_complete: true,
  });

  if (insertError) {
    return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
  }

  return NextResponse.json({ role });
}
