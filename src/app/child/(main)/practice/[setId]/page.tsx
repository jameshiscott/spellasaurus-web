import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";
import PracticeSession from "@/components/child/PracticeSession";

interface PageProps {
  params: Promise<{ setId: string }>;
}

export default async function PracticePage({ params }: PageProps) {
  const { setId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const serviceClient = createServiceClient();

  // Verify access: check class membership (junction + legacy) or personal set
  const { data: classEnrolments } = await supabase
    .from(TABLES.CLASS_STUDENTS)
    .select("class_id")
    .eq("child_id", user.id);

  const classIds = classEnrolments?.map((e) => e.class_id) ?? [];

  let hasAccess = false;

  if (classIds.length > 0) {
    // Check junction table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: junctionAccess } = await (serviceClient as any)
      .from(TABLES.CLASS_SPELLING_SETS)
      .select("set_id")
      .eq("set_id", setId)
      .in("class_id", classIds)
      .limit(1);
    if (junctionAccess && junctionAccess.length > 0) hasAccess = true;

    // Check legacy class_id on spelling_sets
    if (!hasAccess) {
      const { data: legacyAccess } = await serviceClient
        .from(TABLES.SPELLING_SETS)
        .select("id")
        .eq("id", setId)
        .in("class_id", classIds)
        .limit(1);
      if (legacyAccess && legacyAccess.length > 0) hasAccess = true;
    }
  }

  if (!hasAccess) {
    const { data: personalAccess } = await serviceClient
      .from(TABLES.CHILD_PERSONAL_SETS)
      .select("id")
      .eq("child_id", user.id)
      .eq("set_id", setId)
      .limit(1);
    if (personalAccess && personalAccess.length > 0) hasAccess = true;
  }

  if (!hasAccess) notFound();

  // Get set info
  const { data: set, error: setError } = await serviceClient
    .from(TABLES.SPELLING_SETS)
    .select("id, name, week_number, week_start, type")
    .eq("id", setId)
    .single();

  if (setError || !set) notFound();

  // Get all words ordered by sort_order
  const { data: words } = await serviceClient
    .from(TABLES.SPELLING_WORDS)
    .select(
      "id, word, hint, ai_description, ai_example_sentence, ai_sentence_with_blank, audio_url"
    )
    .eq("set_id", setId)
    .order("sort_order", { ascending: true });

  // Get practice settings (defaults if none found)
  const { data: rawSettings } = await supabase
    .from(TABLES.CHILD_PRACTICE_SETTINGS)
    .select("play_tts_audio, show_description, show_example_sentence")
    .eq("child_id", user.id)
    .single();

  const settings = rawSettings ?? {
    play_tts_audio: true,
    show_description: true,
    show_example_sentence: true,
  };

  if (!words || words.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 text-center">
        <div className="text-5xl mb-4">📚</div>
        <h1 className="text-2xl font-black text-foreground mb-2">
          No words yet
        </h1>
        <p className="text-muted-foreground font-semibold mb-6">
          This set has no words yet. Ask your teacher to add some!
        </p>
        <Link
          href="/child/sets"
          className="bg-brand-500 text-white font-bold px-6 py-3 rounded-2xl hover:bg-brand-600 transition-colors"
        >
          Back to Sets
        </Link>
      </div>
    );
  }

  return (
    <PracticeSession
      setId={set.id}
      setName={set.name}
      childId={user.id}
      words={words}
      settings={settings}
    />
  );
}
