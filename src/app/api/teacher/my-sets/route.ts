import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

interface SetRow {
  id: string;
  name: string;
  class_id: string | null;
  week_start: string;
  week_number: number | null;
  is_active: boolean;
  active_from: string | null;
  created_at: string;
}

interface ClassLink {
  id: string;
  name: string;
}

interface SetWithDetails {
  id: string;
  name: string;
  weekStart: string;
  weekNumber: number | null;
  isActive: boolean;
  activeFrom: string | null;
  createdAt: string;
  classes: ClassLink[];
  practiceCount: number;
  wordCount: number;
}

export async function GET(): Promise<NextResponse> {
  try {
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

    // Fetch all sets created by this teacher — use service client to bypass RLS
    const { data: setsData, error: setsError } = await serviceClient
      .from(TABLES.SPELLING_SETS)
      .select("id, name, class_id, week_start, week_number, is_active, active_from, created_at")
      .eq("created_by", user.id)
      .eq("type", "class")
      .order("created_at", { ascending: false });

    if (setsError) {
      console.error("my-sets fetch error:", setsError);
      return NextResponse.json({ error: "Failed to fetch sets" }, { status: 500 });
    }

    const sets = (setsData ?? []) as SetRow[];

    if (sets.length === 0) {
      return NextResponse.json({ sets: [] });
    }

    const setIds = sets.map((s) => s.id);
    const homeClassIds = sets
      .map((s) => s.class_id)
      .filter((id): id is string => id !== null);

    // Fetch junction table links (additional classes)
    // eslint-disable-next-line
    const { data: junctionData } = await (serviceClient as any)
      .from(TABLES.CLASS_SPELLING_SETS)
      .select("set_id, class_id")
      .in("set_id", setIds);

    const junctionLinks = (junctionData ?? []) as { set_id: string; class_id: string }[];

    // Collect all class IDs we need names for
    const allClassIds = new Set<string>([
      ...homeClassIds,
      ...junctionLinks.map((j) => j.class_id),
    ]);

    // Fetch class names
    const classNameMap: Record<string, string> = {};
    if (allClassIds.size > 0) {
      const { data: classesData } = await serviceClient
        .from(TABLES.CLASSES)
        .select("id, name")
        .in("id", Array.from(allClassIds));

      for (const cls of classesData ?? []) {
        const c = cls as { id: string; name: string };
        classNameMap[c.id] = c.name;
      }
    }

    // Fetch practice session counts per set
    const { data: sessionCounts } = await serviceClient
      .from(TABLES.PRACTICE_SESSIONS)
      .select("set_id")
      .in("set_id", setIds);

    const practiceCountMap: Record<string, number> = {};
    for (const session of sessionCounts ?? []) {
      const s = session as { set_id: string };
      practiceCountMap[s.set_id] = (practiceCountMap[s.set_id] ?? 0) + 1;
    }

    // Fetch word counts per set
    const { data: wordRows } = await serviceClient
      .from(TABLES.SPELLING_WORDS)
      .select("set_id")
      .in("set_id", setIds);

    const wordCountMap: Record<string, number> = {};
    for (const w of wordRows ?? []) {
      const r = w as { set_id: string };
      wordCountMap[r.set_id] = (wordCountMap[r.set_id] ?? 0) + 1;
    }

    // Build junction map: setId -> classIds
    const junctionMap: Record<string, string[]> = {};
    for (const j of junctionLinks) {
      if (!junctionMap[j.set_id]) junctionMap[j.set_id] = [];
      junctionMap[j.set_id].push(j.class_id);
    }

    // Assemble response
    const result: SetWithDetails[] = sets.map((set) => {
      const classes: ClassLink[] = [];

      // Home class
      if (set.class_id && classNameMap[set.class_id]) {
        classes.push({ id: set.class_id, name: classNameMap[set.class_id] });
      }

      // Additional classes from junction table
      const additionalClassIds = junctionMap[set.id] ?? [];
      for (const cid of additionalClassIds) {
        if (classNameMap[cid] && cid !== set.class_id) {
          classes.push({ id: cid, name: classNameMap[cid] });
        }
      }

      return {
        id: set.id,
        name: set.name,
        weekStart: set.week_start,
        weekNumber: set.week_number,
        isActive: set.is_active,
        activeFrom: set.active_from,
        createdAt: set.created_at,
        classes,
        practiceCount: practiceCountMap[set.id] ?? 0,
        wordCount: wordCountMap[set.id] ?? 0,
      };
    });

    return NextResponse.json({ sets: result });
  } catch (err) {
    console.error("my-sets unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
