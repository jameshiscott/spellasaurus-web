import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

    const service = createServiceClient();
    let dbQuery = service
      .from(TABLES.SCHOOLS)
      .select("id, name, address")
      .order("name")
      .limit(20);

    if (query.length > 0) {
      dbQuery = dbQuery.ilike("name", `%${query}%`);
    }

    const { data: schools, error } = await dbQuery;

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
