import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";
import Link from "next/link";
import { CreateListButton } from "@/components/parent/CreateListButton";
import { AssignListButton } from "@/components/parent/AssignListButton";

export default async function ParentListsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // All personal spelling sets created by this parent
  const { data: sets } = await supabase
    .from(TABLES.SPELLING_SETS)
    .select("id, name, created_at")
    .eq("created_by", user.id)
    .eq("type", "personal")
    .order("created_at", { ascending: false });

  // For each set: word count + assigned children
  const setsWithDetails = await Promise.all(
    (sets ?? []).map(async (s) => {
      const [{ count: wordCount }, { data: assignments }] = await Promise.all([
        supabase
          .from(TABLES.SPELLING_WORDS)
          .select("id", { count: "exact", head: true })
          .eq("set_id", s.id),
        supabase
          .from(TABLES.CHILD_PERSONAL_SETS)
          .select("users!child_personal_sets_child_id_fkey(id, full_name)")
          .eq("set_id", s.id),
      ]);

      const assignedChildren =
        assignments
          ?.map((a) => a.users)
          .filter(
            (c): c is { id: string; full_name: string } => c !== null
          ) ?? [];

      return {
        ...s,
        wordCount: wordCount ?? 0,
        assignedChildren,
      };
    })
  );

  // Parent's children (for assign modal)
  const { data: childLinks } = await supabase
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Personal Word Lists</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Create custom spelling lists and assign them to your children.
          </p>
        </div>
        <CreateListButton parentId={user.id} />
      </div>

      {/* Lists */}
      {setsWithDetails.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border p-14 text-center">
          <p className="text-5xl mb-4">📋</p>
          <p className="font-bold text-lg text-foreground">No personal lists yet</p>
          <p className="text-muted-foreground text-sm mt-1 mb-6">
            Create a word list to supplement your child&apos;s school spelling.
          </p>
          <CreateListButton parentId={user.id} />
        </div>
      ) : (
        <div className="space-y-4">
          {setsWithDetails.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-border"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="font-black text-foreground text-lg truncate">{s.name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {s.wordCount} {s.wordCount === 1 ? "word" : "words"}
                  </p>

                  {/* Assigned children chips */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {s.assignedChildren.length > 0 ? (
                      s.assignedChildren.map((c) => (
                        <span
                          key={c.id}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#6C5CE7] bg-[#6C5CE7]/10 rounded-full px-3 py-1"
                        >
                          🦕 {c.full_name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground font-semibold">
                        Not assigned to any child
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/parent/lists/${s.id}/edit`}
                    className="rounded-xl border-2 border-border font-bold px-4 py-2 text-sm hover:bg-[#F8F6FF] transition-colors"
                  >
                    Edit Words
                  </Link>
                  <AssignListButton
                    setId={s.id}
                    currentChildIds={s.assignedChildren.map((c) => c.id)}
                    availableChildren={myChildren.map((c) => ({
                      id: c.id,
                      full_name: c.full_name ?? "",
                    }))}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
