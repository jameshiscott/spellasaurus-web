import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

const schema = z.object({
  displayName: z
    .string()
    .min(2)
    .max(30)
    .regex(
      /^[a-zA-Z0-9 _-]+$/,
      "Display name can only contain letters, numbers, spaces, underscores and hyphens"
    ),
  dinoType: z.enum([
    "trex",
    "stegosaurus",
    "triceratops",
    "brachiosaurus",
    "raptor",
    "ankylosaurus",
    "pterodactyl",
    "diplodocus",
    "spinosaurus",
    "parasaurolophus",
  ]),
  dinoColor: z.enum(["green", "blue", "purple", "orange", "pink"]),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Auth check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify child role
    const { data: profile, error: profileError } = await supabase
      .from(TABLES.USERS)
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== USER_ROLES.CHILD) {
      return NextResponse.json(
        { error: "Forbidden: child role required" },
        { status: 403 }
      );
    }

    // 2. Parse + validate body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { displayName, dinoType, dinoColor } = parsed.data;

    // 3. Case-insensitive display name uniqueness check
    const { data: existing, error: checkError } = await supabase
      .from(TABLES.USERS)
      .select("id")
      .ilike("display_name", displayName)
      .limit(1);

    if (checkError) {
      console.error("Display name check error:", checkError);
      return NextResponse.json(
        { error: "Failed to check display name availability" },
        { status: 500 }
      );
    }

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "Display name already taken" },
        { status: 409 }
      );
    }

    // 4. Write via service client (bypasses RLS)
    const serviceClient = createServiceClient();
    const { error: updateError } = await serviceClient
      .from(TABLES.USERS)
      .update({
        display_name: displayName,
        dino_type: dinoType,
        dino_color: dinoColor,
        onboarding_complete: true,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Onboarding update error:", updateError);
      return NextResponse.json(
        { error: "Failed to save onboarding data" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in complete-onboarding:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
