import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";
import Link from "next/link";
import { PracticeSettingsForm } from "@/components/parent/PracticeSettingsForm";

interface Props {
  params: Promise<{ childId: string }>;
}

export default async function ChildSettingsPage({ params }: Props) {
  const { childId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify parent owns child
  const { data: ownership } = await supabase
    .from(TABLES.PARENT_CHILDREN)
    .select("id")
    .eq("parent_id", user.id)
    .eq("child_id", childId)
    .single();

  if (!ownership) redirect("/parent");

  // Child name
  const { data: child } = await supabase
    .from(TABLES.USERS)
    .select("full_name")
    .eq("id", childId)
    .single();

  if (!child) redirect("/parent");

  // Practice settings (use defaults if none exist)
  const { data: rawSettings } = await supabase
    .from(TABLES.CHILD_PRACTICE_SETTINGS)
    .select("play_tts_audio, show_description, show_example_sentence, leaderboard_opt_in, keyboard_layout")
    .eq("child_id", childId)
    .maybeSingle() as { data: { play_tts_audio: boolean; show_description: boolean; show_example_sentence: boolean; leaderboard_opt_in: boolean; keyboard_layout: string } | null };

  const settings = {
    play_tts_audio: rawSettings?.play_tts_audio ?? true,
    show_description: rawSettings?.show_description ?? true,
    show_example_sentence: rawSettings?.show_example_sentence ?? true,
    leaderboard_opt_in: rawSettings?.leaderboard_opt_in ?? false,
    keyboard_layout: (rawSettings?.keyboard_layout as "qwerty" | "abc") ?? "qwerty",
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/parent" className="hover:text-foreground font-semibold transition-colors">
          My Children
        </Link>
        <span>›</span>
        <Link
          href={`/parent/child/${childId}`}
          className="hover:text-foreground font-semibold transition-colors"
        >
          {child.full_name}
        </Link>
        <span>›</span>
        <span className="text-foreground font-semibold">Practice Settings</span>
      </nav>

      <div>
        <h1 className="text-2xl font-black text-foreground">Practice Settings</h1>
        <p className="text-muted-foreground mt-1">
          Customise how {child.full_name} experiences spelling practice.
        </p>
      </div>

      <PracticeSettingsForm
        childId={childId}
        childName={child.full_name ?? "your child"}
        settings={settings}
      />
    </div>
  );
}
