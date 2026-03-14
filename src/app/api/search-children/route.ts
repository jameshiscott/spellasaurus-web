import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

interface ChildResult {
  id: string;
  fullName: string;
  displayName: string | null;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") ?? "").trim();

    if (query.length < 2) {
      return NextResponse.json({ children: [] });
    }

    // Auth check — must be teacher or school_admin
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

    if (
      profile?.role !== USER_ROLES.TEACHER &&
      profile?.role !== USER_ROLES.SCHOOL_ADMIN
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const serviceClient = createServiceClient();

    // Get all child IDs already enrolled in any class
    const { data: enrolledRows } = await serviceClient
      .from(TABLES.CLASS_STUDENTS)
      .select("child_id");

    const enrolledIds = new Set(
      (enrolledRows ?? []).map((r) => (r as { child_id: string }).child_id)
    );

    // Search children by full_name or display_name using ilike
    const searchPattern = `%${query}%`;

    const { data: byFullName } = await serviceClient
      .from(TABLES.USERS)
      .select("id, full_name, display_name")
      .eq("role", USER_ROLES.CHILD)
      .ilike("full_name", searchPattern)
      .limit(20);

    const { data: byDisplayName } = await serviceClient
      .from(TABLES.USERS)
      .select("id, full_name, display_name")
      .eq("role", USER_ROLES.CHILD)
      .ilike("display_name", searchPattern)
      .limit(20);

    // Merge and deduplicate
    const seen = new Set<string>();
    const children: ChildResult[] = [];

    for (const row of [...(byFullName ?? []), ...(byDisplayName ?? [])]) {
      const r = row as { id: string; full_name: string; display_name: string | null };
      if (seen.has(r.id) || enrolledIds.has(r.id)) continue;
      seen.add(r.id);
      children.push({
        id: r.id,
        fullName: r.full_name,
        displayName: r.display_name,
      });
    }

    // Sort alphabetically and limit
    children.sort((a, b) => a.fullName.localeCompare(b.fullName));

    return NextResponse.json({ children: children.slice(0, 15) });
  } catch (err) {
    console.error("search-children error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
