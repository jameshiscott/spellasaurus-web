import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";
import Link from "next/link";
import { AddWordToListForm } from "@/components/parent/AddWordToListForm";
import { AssignListButton } from "@/components/parent/AssignListButton";
import { DeleteWordButton } from "@/components/parent/DeleteWordButton";

interface Props {
  params: Promise<{ setId: string }>;
}

export default async function EditListPage({ params }: Props) {
  const { setId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const serviceClient = createServiceClient();

  // Verify ownership
  const { data: set } = await serviceClient
    .from(TABLES.SPELLING_SETS)
    .select("id, name")
    .eq("id", setId)
    .eq("created_by", user.id)
    .eq("type", "personal")
    .single();

  if (!set) redirect("/parent/lists");

  // All words for this set
  const { data: words } = await serviceClient
    .from(TABLES.SPELLING_WORDS)
    .select("id, word, hint, sort_order")
    .eq("set_id", setId)
    .order("sort_order", { ascending: true });

  // Assigned children
  const { data: assignments } = await serviceClient
    .from(TABLES.CHILD_PERSONAL_SETS)
    .select("users!child_personal_sets_child_id_fkey(id, full_name)")
    .eq("set_id", setId);

  const assignedChildren =
    assignments
      ?.map((a) => a.users)
      .filter(
        (c): c is { id: string; full_name: string } => c !== null
      ) ?? [];

  // Parent's children (for assign modal)
  const { data: childLinks } = await serviceClient
    .from(TABLES.PARENT_CHILDREN)
    .select("users!parent_children_child_id_fkey(id, full_name)")
    .eq("parent_id", user.id);

  const myChildren =
    childLinks
      ?.map((l) => l.users)
      .filter(
        (c): c is { id: string; full_name: string } => c !== null
      ) ?? [];

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/parent" className="hover:text-foreground font-semibold transition-colors">
          My Children
        </Link>
        <span>›</span>
        <Link
          href="/parent/lists"
          className="hover:text-foreground font-semibold transition-colors"
        >
          My Lists
        </Link>
        <span>›</span>
        <span className="text-foreground font-semibold">{set.name}</span>
      </nav>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-foreground">{set.name}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {words?.length ?? 0} {(words?.length ?? 0) === 1 ? "word" : "words"}
          </p>
        </div>
      </div>

      {/* Assigned children */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-border">
        <div className="flex items-center justify-between gap-4 mb-3">
          <p className="font-bold text-foreground">Assigned to</p>
          <AssignListButton
            setId={setId}
            currentChildIds={assignedChildren.map((c) => c.id)}
            availableChildren={myChildren.map((c) => ({
              id: c.id,
              full_name: c.full_name ?? "",
            }))}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {assignedChildren.length > 0 ? (
            assignedChildren.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#6C5CE7] bg-[#6C5CE7]/10 rounded-full px-3 py-1"
              >
                🦕 {c.full_name}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted-foreground font-semibold">
              Not assigned to any child yet
            </span>
          )}
        </div>
      </div>

      {/* Add word form */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-border">
        <h2 className="font-black text-foreground mb-4">Add a Word</h2>
        <AddWordToListForm setId={setId} />
      </div>

      {/* Word list */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-border">
        <h2 className="font-black text-foreground mb-4">
          Words ({words?.length ?? 0})
        </h2>
        {!words || words.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">📝</p>
            <p className="text-muted-foreground text-sm">
              No words yet — add the first one above!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {words.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between gap-4 rounded-xl bg-[#F8F6FF] px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-foreground">{w.word}</p>
                  {w.hint && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      Hint: {w.hint}
                    </p>
                  )}
                </div>
                <DeleteWordButton wordId={w.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
