import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";

/**
 * GET /api/arcade/leaderboard?gameId=...&scope=school|global
 * Returns top 20 scores for the game, either school-wide or global.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const gameId = request.nextUrl.searchParams.get("gameId");
    const scope = request.nextUrl.searchParams.get("scope") ?? "global";

    if (!gameId) {
      return NextResponse.json({ error: "gameId required" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = createServiceClient();

    if (scope === "school") {
      // Find the child's school via class_students → classes → school_id
      const { data: enrolment } = await serviceClient
        .from(TABLES.CLASS_STUDENTS)
        .select("class_id, classes(school_id)")
        .eq("child_id", user.id)
        .limit(1)
        .maybeSingle();

      // eslint-disable-next-line
      const schoolId = (enrolment as any)?.classes?.school_id;

      if (!schoolId) {
        // Not enrolled in any school — return empty
        return NextResponse.json({ scores: [] });
      }

      // Get all children in that school
      const { data: schoolClasses } = await serviceClient
        .from(TABLES.CLASSES)
        .select("id")
        .eq("school_id", schoolId);

      const classIds = schoolClasses?.map((c) => c.id) ?? [];

      if (classIds.length === 0) {
        return NextResponse.json({ scores: [] });
      }

      const { data: schoolStudents } = await serviceClient
        .from(TABLES.CLASS_STUDENTS)
        .select("child_id")
        .in("class_id", classIds);

      const childIds = [...new Set(schoolStudents?.map((s) => s.child_id) ?? [])];

      if (childIds.length === 0) {
        return NextResponse.json({ scores: [] });
      }

      // Get best score per child in this school for this game
      // eslint-disable-next-line
      const { data: scores } = await (serviceClient as any)
        .from(TABLES.ARCADE_HIGH_SCORES)
        .select("child_id, score, played_at")
        .eq("game_id", gameId)
        .in("child_id", childIds)
        .order("score", { ascending: false })
        .limit(50);

      // Dedupe to best per child
      const bestPerChild = dedupeTopScores(scores ?? []);

      // Fetch display names
      const topChildIds = bestPerChild.map((s: ScoreRow) => s.child_id);
      const { data: profiles } = await serviceClient
        .from(TABLES.USERS)
        .select("id, display_name, dino_type, dino_color")
        .in("id", topChildIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

      const leaderboard = bestPerChild.map((s: ScoreRow, i: number) => {
        const p = profileMap.get(s.child_id);
        return {
          rank: i + 1,
          childId: s.child_id,
          displayName: p?.display_name ?? "Unknown",
          dinoType: p?.dino_type ?? null,
          dinoColor: p?.dino_color ?? null,
          score: s.score,
          isMe: s.child_id === user.id,
        };
      });

      return NextResponse.json({ scores: leaderboard });
    }

    // Global leaderboard
    // eslint-disable-next-line
    const { data: scores } = await (serviceClient as any)
      .from(TABLES.ARCADE_HIGH_SCORES)
      .select("child_id, score, played_at")
      .eq("game_id", gameId)
      .order("score", { ascending: false })
      .limit(100);

    const bestPerChild = dedupeTopScores(scores ?? []);

    const topChildIds = bestPerChild.map((s: ScoreRow) => s.child_id);
    const { data: profiles } = await serviceClient
      .from(TABLES.USERS)
      .select("id, display_name, dino_type, dino_color")
      .in("id", topChildIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

    const leaderboard = bestPerChild.map((s: ScoreRow, i: number) => {
      const p = profileMap.get(s.child_id);
      return {
        rank: i + 1,
        childId: s.child_id,
        displayName: p?.display_name ?? "Unknown",
        dinoType: p?.dino_type ?? null,
        dinoColor: p?.dino_color ?? null,
        score: s.score,
        isMe: s.child_id === user.id,
      };
    });

    return NextResponse.json({ scores: leaderboard });
  } catch (error) {
    console.error("Error in arcade/leaderboard:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

interface ScoreRow {
  child_id: string;
  score: number;
  played_at: string;
}

/** Keep only the best score per child, return top 20. */
function dedupeTopScores(scores: ScoreRow[]): ScoreRow[] {
  const best = new Map<string, ScoreRow>();
  for (const s of scores) {
    const existing = best.get(s.child_id);
    if (!existing || s.score > existing.score) {
      best.set(s.child_id, s);
    }
  }
  return [...best.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}
