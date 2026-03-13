import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";

export async function GET() {
  try {
    const service = createServiceClient();
    const { data: schools, error } = await service
      .from(TABLES.SCHOOLS)
      .select("id, name")
      .order("name");

    if (error) {
      console.error("schools/list fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch schools" }, { status: 500 });
    }

    return NextResponse.json({ schools: schools ?? [] }, { status: 200 });
  } catch (err) {
    console.error("schools/list error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
