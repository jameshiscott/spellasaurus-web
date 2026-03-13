import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId");

    if (!schoolId) {
      return NextResponse.json({ error: "schoolId is required" }, { status: 400 });
    }

    // Require authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    // Fetch classes for the school using service client
    const service = createServiceClient();
    const { data: classes, error } = await service
      .from(TABLES.CLASSES)
      .select("id, name, school_year")
      .eq("school_id", schoolId)
      .order("name");

    if (error) {
      console.error("schools/classes fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
    }

    return NextResponse.json({ classes: classes ?? [] }, { status: 200 });
  } catch (err) {
    console.error("schools/classes error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
