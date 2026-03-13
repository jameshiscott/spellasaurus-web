import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";
import AddWordForm from "@/components/teacher/AddWordForm";
import WordCard from "@/components/teacher/WordCard";

interface EditSetPageProps {
  params: Promise<{ setId: string }>;
}

interface SpellingSet {
  id: string;
  name: string;
  week_start: string;
  week_number: number | null;
  class_id: string | null;
}

interface SpellingWord {
  id: string;
  word: string;
  hint: string | null;
  ai_description: string | null;
  ai_example_sentence: string | null;
  ai_sentence_with_blank: string | null;
  audio_url: string | null;
  ai_generated_at: string | null;
  sort_order: number;
}

interface ClassData {
  id: string;
  name: string;
}

export default async function EditSetPage({ params }: EditSetPageProps) {
  const { setId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: setData } = await supabase
    .from(TABLES.SPELLING_SETS)
    .select("id, name, week_start, week_number, class_id")
    .eq("id", setId)
    .eq("created_by", user.id)
    .single();

  if (!setData) redirect("/teacher");

  const spellingSet = setData as SpellingSet;

  const { data: wordsData } = await supabase
    .from(TABLES.SPELLING_WORDS)
    .select(
      "id, word, hint, ai_description, ai_example_sentence, ai_sentence_with_blank, audio_url, ai_generated_at, sort_order"
    )
    .eq("set_id", setId)
    .order("sort_order", { ascending: true });

  const words: SpellingWord[] = (wordsData ?? []) as SpellingWord[];

  // Fetch class info if class_id exists
  let classData: ClassData | null = null;
  if (spellingSet.class_id) {
    const { data: cls } = await supabase
      .from(TABLES.CLASSES)
      .select("id, name")
      .eq("id", spellingSet.class_id)
      .single();
    classData = cls as ClassData | null;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <Link href="/teacher" className="hover:text-foreground transition-colors">
          My Classes
        </Link>
        {classData && (
          <>
            <span>›</span>
            <Link
              href={`/teacher/class/${classData.id}`}
              className="hover:text-foreground transition-colors"
            >
              {classData.name}
            </Link>
            <span>›</span>
            <Link
              href={`/teacher/class/${classData.id}/sets`}
              className="hover:text-foreground transition-colors"
            >
              Sets
            </Link>
          </>
        )}
        <span>›</span>
        <span className="text-foreground font-semibold">
          {spellingSet.name} · Edit
        </span>
      </nav>

      {/* Set header card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-foreground">{spellingSet.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {spellingSet.week_number != null
                ? `Week ${spellingSet.week_number}`
                : spellingSet.week_start}{" "}
              · {words.length} {words.length === 1 ? "word" : "words"}
            </p>
          </div>
          {spellingSet.week_number != null && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-brand-500 text-white">
              Week {spellingSet.week_number}
            </span>
          )}
        </div>
      </div>

      {/* Add word form */}
      <AddWordForm setId={setId} />

      {/* Word list */}
      {words.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📖</div>
          <p className="text-muted-foreground font-semibold">
            No words yet — add your first word above
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {words.map((word) => (
            <WordCard key={word.id} word={word} />
          ))}
        </div>
      )}

      {/* Back link */}
      {classData && (
        <Link
          href={`/teacher/class/${classData.id}/sets`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Sets
        </Link>
      )}
    </div>
  );
}
