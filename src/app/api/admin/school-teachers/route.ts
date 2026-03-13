import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId");

    if (!schoolId) {
      return NextResponse.json({ error: "schoolId is required" }, { status: 400 });
    }

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

    // Verify admin owns this school
    const { data: school } = await supabase
      .from(TABLES.SCHOOLS)
      .select("id")
      .eq("id", schoolId)
      .contains("admin_ids", [user.id])
      .single();

    if (!school) {
      return NextResponse.json(
        { error: "School not found or access denied" },
        { status: 403 }
      );
    }

    // Fetch teachers in this school ordered by name
    const { data: teachers, error: fetchError } = await supabase
      .from(TABLES.USERS)
      .select("id, full_name, email")
      .eq("role", USER_ROLES.TEACHER)
      .eq("school_id", schoolId)
      .order("full_name");

    if (fetchError) {
      console.error("school-teachers fetch error:", fetchError);
      return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 });
    }

    return NextResponse.json({ teachers: teachers ?? [] }, { status: 200 });
  } catch (err) {
    console.error("admin/school-teachers GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
