import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

const bodySchema = z.object({
  name: z.string().min(2, "School name must be at least 2 characters"),
  address: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }

    const { name, address } = parsed.data;

    // Verify authenticated school admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from(TABLES.USERS)
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== USER_ROLES.SCHOOL_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Insert the new school using service client
    const service = createServiceClient();
    const { data: newSchool, error: insertError } = await service
      .from(TABLES.SCHOOLS)
      .insert({
        name,
        address: address && address.trim().length > 0 ? address.trim() : null,
        admin_ids: [user.id],
      })
      .select("id")
      .single();

    if (insertError || !newSchool) {
      console.error("create-school insert error:", insertError);
      return NextResponse.json({ error: "Failed to create school" }, { status: 500 });
    }

    return NextResponse.json({ schoolId: newSchool.id }, { status: 201 });
  } catch (err) {
    console.error("create-school error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
