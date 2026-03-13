import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

const ResetPasswordSchema = z.object({
  childId: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const parsed = ResetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { childId, newPassword } = parsed.data;

    // Auth check
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

    if (profile?.role !== USER_ROLES.PARENT) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify parent owns child
    const { data: ownership } = await supabase
      .from(TABLES.PARENT_CHILDREN)
      .select("id")
      .eq("parent_id", user.id)
      .eq("child_id", childId)
      .single();

    if (!ownership) {
      return NextResponse.json(
        { error: "Child not found or not owned by you" },
        { status: 404 }
      );
    }

    // Reset password via service role
    const serviceClient = createServiceClient();
    const { error: updateError } =
      await serviceClient.auth.admin.updateUserById(childId, {
        password: newPassword,
      });

    if (updateError) {
      console.error("reset-child-password error:", updateError);
      return NextResponse.json(
        { error: "Failed to reset password" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("reset-child-password unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
