import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

const ToggleSchema = z.object({
  setId: z.string().uuid(),
  isActive: z.boolean(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = ToggleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { setId, isActive } = parsed.data;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from(TABLES.USERS)
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== USER_ROLES.TEACHER) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const serviceClient = createServiceClient();

    // Verify teacher owns the set — use service client to bypass RLS
    const { data: set } = await serviceClient
      .from(TABLES.SPELLING_SETS)
      .select("id")
      .eq("id", setId)
      .eq("created_by", user.id)
      .single();

    if (!set) {
      return NextResponse.json(
        { error: "Set not found or not owned by you" },
        { status: 404 }
      );
    }
    const { error: updateError } = await serviceClient
      .from(TABLES.SPELLING_SETS)
      .update({ is_active: isActive })
      .eq("id", setId);

    if (updateError) {
      console.error("toggle-set-active update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update set" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, isActive });
  } catch (err) {
    console.error("toggle-set-active unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
