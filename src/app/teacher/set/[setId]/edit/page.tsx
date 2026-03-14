import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";
import AddWordForm from "@/components/teacher/AddWordForm";
import WordCard from "@/components/teacher/WordCard";
import { ManageSetClasses } from "@/components/teacher/ManageSetClasses";

interface EditSetPageProps {
  params: Promise<{ setId: string }>;
}

interface SpellingSet {
  id: string;
  name: string;
  week_start: string;
  week_number: number | null;
  class_id: string | null;
  is_active: boolean;
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

interface ClassOption {
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

  // Use service client to bypass RLS
  const serviceClient = createServiceClient();

  const { data: setData } = await serviceClient
    .from(TABLES.SPELLING_SETS)
    .select("id, name, week_start, week_number, class_id, is_active")
    .eq("id", setId)
    .eq("created_by", user.id)
    .single();

  if (!setData) redirect("/teacher");

  const spellingSet = setData as SpellingSet;

  const { data: wordsData } = await serviceClient
    .from(TABLES.SPELLING_WORDS)
    .select(
      "id, word, hint, ai_description, ai_example_sentence, ai_sentence_with_blank, audio_url, ai_generated_at, sort_order"
    )
    .eq("set_id", setId)
    .order("sort_order", { ascending: true });

  const words: SpellingWord[] = (wordsData ?? []) as SpellingWord[];

  // Fetch all classes the teacher owns (for the class assignment UI)
  const { data: teacherClasses } = await serviceClient
    .from(TABLES.CLASSES)
    .select("id, name")
    .eq("teacher_id", user.id)
    .order("name");

  const allClasses: ClassOption[] = (teacherClasses ?? []) as ClassOption[];

  // Get currently linked classes: home class + junction table
  const linkedClassIds: string[] = [];
  if (spellingSet.class_id) {
    linkedClassIds.push(spellingSet.class_id);
  }

  // eslint-disable-next-line
  const { data: junctionData } = await (serviceClient as any)
    .from(TABLES.CLASS_SPELLING_SETS)
    .select("class_id")
    .eq("set_id", setId);

  const junctionClassIds = (junctionData ?? []).map(
    (j: { class_id: string }) => j.class_id
  );
  for (const cid of junctionClassIds) {
    if (!linkedClassIds.includes(cid)) {
      linkedClassIds.push(cid);
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <Link href="/teacher" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
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
              {" · "}
              <span className={spellingSet.is_active ? "text-green-600" : "text-orange-600"}>
                {spellingSet.is_active ? "Active" : "Inactive"}
              </span>
            </p>
          </div>
          {spellingSet.week_number != null && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-brand-500 text-white">
              Week {spellingSet.week_number}
            </span>
          )}
        </div>
      </div>

      {/* Class assignment section */}
      <ManageSetClasses
        setId={spellingSet.id}
        homeClassId={spellingSet.class_id}
        linkedClassIds={linkedClassIds}
        allClasses={allClasses}
      />

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
      <Link
        href="/teacher"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}
