import { redirect, notFound } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";
import ResultsScreen from "@/components/child/ResultsScreen";

interface PageProps {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ quip?: string }>;
}

interface WordResult {
  wordId: string;
  word: string;
  userAnswer?: string;
  wasCorrect: boolean;
  timeTakenMs: number;
  coinsEarned?: number;
  isFasterThanAvg?: boolean;
}

function isWordResultArray(value: unknown): value is WordResult[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as Record<string, unknown>).wordId === "string" &&
      typeof (item as Record<string, unknown>).word === "string" &&
      typeof (item as Record<string, unknown>).wasCorrect === "boolean" &&
      typeof (item as Record<string, unknown>).timeTakenMs === "number"
  );
}

export default async function ResultsPage({ params, searchParams }: PageProps) {
  const { sessionId } = await params;
  const { quip: roundingQuip } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch the session — must belong to this child
  const { data: session, error: sessionError } = await supabase
    .from(TABLES.PRACTICE_SESSIONS)
    .select(
      "id, set_id, correct_count, total_words, coins_awarded, completed_at, word_results"
    )
    .eq("id", sessionId)
    .eq("child_id", user.id)
    .single();

  if (sessionError || !session) notFound();

  // Fetch display name
  const { data: profile } = await supabase
    .from(TABLES.USERS)
    .select("display_name")
    .eq("id", user.id)
    .single();

  const serviceClient = createServiceClient();

  // Fetch word streak from child_stats
  const { data: childStats } = await serviceClient
    .from(TABLES.CHILD_STATS)
    .select("current_word_streak, best_word_streak")
    .eq("child_id", user.id)
    .single();

  // Check if this session is the fastest ever for the set
  const { data: fastestSession } = await serviceClient
    .from(TABLES.PRACTICE_SESSIONS)
    .select("id, time_taken_ms")
    .eq("child_id", user.id)
    .eq("set_id", session.set_id)
    .order("time_taken_ms", { ascending: true })
    .limit(1)
    .maybeSingle();

  const isFastestEverSet = fastestSession?.id === session.id;

  const wordResults = isWordResultArray(session.word_results)
    ? session.word_results
    : [];

  return (
    <ResultsScreen
      session={{
        id: session.id,
        set_id: session.set_id,
        correct_count: session.correct_count,
        total_words: session.total_words,
        coins_awarded: session.coins_awarded,
        completed_at: session.completed_at,
        word_results: wordResults,
      }}
      displayName={profile?.display_name ?? "there"}
      currentWordStreak={childStats?.current_word_streak ?? 0}
      bestWordStreak={childStats?.best_word_streak ?? 0}
      isFastestEverSet={isFastestEverSet}
      roundingQuip={roundingQuip ?? null}
    />
  );
}
