import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";
import ResultsScreen from "@/components/child/ResultsScreen";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

interface WordResult {
  wordId: string;
  word: string;
  userAnswer?: string;
  wasCorrect: boolean;
  timeTakenMs: number;
  coinsEarned?: number;
  isFasterThanAvg?: boolean;
  isFastestEver?: boolean;
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

export default async function ResultsPage({ params }: PageProps) {
  const { sessionId } = await params;

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

  // Fetch coin balance and display name
  const { data: profile } = await supabase
    .from(TABLES.USERS)
    .select("coin_balance, display_name")
    .eq("id", user.id)
    .single();

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
      newBalance={profile?.coin_balance ?? 0}
      displayName={profile?.display_name ?? "there"}
    />
  );
}
