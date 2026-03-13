import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";
import Link from "next/link";
import type { DinoType, DinoColor, EquipmentSlot } from "@/components/dino/dino-types";
import DinoAvatar from "@/components/dino/DinoAvatar";

export const dynamic = "force-dynamic";

export default async function ChildProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from(TABLES.USERS)
    .select("display_name, coin_balance, dino_type, dino_color, avatar_loadout")
    .eq("id", user!.id)
    .single();

  const { data: stats } = await supabase
    .from(TABLES.CHILD_STATS)
    .select("total_sessions, total_words, total_correct, weekly_coins")
    .eq("child_id", user!.id)
    .single();

  const { data: practiceSettings } = await supabase
    .from(TABLES.CHILD_PRACTICE_SETTINGS)
    .select("leaderboard_opt_in")
    .eq("child_id", user!.id)
    .single();

  // Fetch inventory to resolve item IDs → names for DinoAvatar
  const { data: inventory } = await supabase
    .from(TABLES.CHILD_INVENTORY)
    .select("item_id, shop_items(name, slot)")
    .eq("child_id", user!.id);

  const dinoType = (profile?.dino_type as DinoType | null) ?? "trex";
  const dinoColor = (profile?.dino_color as DinoColor | null) ?? "green";

  // Build loadout with item names (not UUIDs) for DinoAvatar
  const rawLoadout =
    (profile?.avatar_loadout as Record<string, string | null> | null) ?? {};
  const avatarLoadout = Object.fromEntries(
    Object.entries(rawLoadout)
      .filter(([, v]) => v !== null)
      .map(([slot, itemId]) => {
        const inv = inventory?.find((i) => i.item_id === itemId);
        const name =
          inv?.shop_items && !Array.isArray(inv.shop_items)
            ? inv.shop_items.name
            : "";
        return [slot, name];
      })
      .filter(([, name]) => name !== ""),
  ) as Partial<Record<EquipmentSlot, string>>;

  const accuracy =
    stats && stats.total_words > 0
      ? Math.round((stats.total_correct / stats.total_words) * 100)
      : null;

  return (
    <div className="pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">My Profile</h1>
        <Link href="/child" className="text-sm font-bold text-brand-500 hover:underline">
          ← Back
        </Link>
      </div>

      {/* Avatar card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm flex flex-col items-center gap-4">
        <DinoAvatar dinoType={dinoType} dinoColor={dinoColor} size="xl" loadout={avatarLoadout} animate />
        <div className="text-center">
          <h2 className="text-2xl font-black text-foreground">
            {profile?.display_name ?? "Explorer"}
          </h2>
          <p className="text-sm text-muted-foreground font-semibold mt-0.5">
            Spelling Explorer
          </p>
        </div>

        {/* Coin balance */}
        <div className="flex items-center gap-2 bg-warning/20 rounded-2xl px-5 py-2">
          <span className="text-xl">🪙</span>
          <span className="text-xl font-black text-yellow-800">
            {profile?.coin_balance ?? 0} coins
          </span>
        </div>

        {/* Links */}
        <div className="flex gap-3">
          <Link
            href="/child/shop"
            className="rounded-2xl bg-brand-500 text-white font-bold px-4 py-2 text-sm hover:bg-brand-600 transition-colors"
          >
            🛒 Shop
          </Link>
          <Link
            href="/child/wardrobe"
            className="rounded-2xl border-2 border-brand-500 text-brand-600 font-bold px-4 py-2 text-sm hover:bg-brand-50 transition-colors"
          >
            👗 Wardrobe
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <h3 className="text-lg font-black text-foreground mb-4">My Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            emoji="📝"
            label="Sessions"
            value={stats?.total_sessions ?? 0}
          />
          <StatCard
            emoji="📖"
            label="Words Practised"
            value={stats?.total_words ?? 0}
          />
          <StatCard
            emoji="✅"
            label="Accuracy"
            value={accuracy !== null ? `${accuracy}%` : "—"}
          />
          <StatCard
            emoji="🪙"
            label="Coins This Week"
            value={stats?.weekly_coins ?? 0}
          />
        </div>
      </div>

      {/* Leaderboard status */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-foreground">Leaderboard</p>
            <p className="text-sm text-muted-foreground font-semibold">
              {practiceSettings?.leaderboard_opt_in
                ? "You appear on the leaderboard"
                : "You are hidden from the leaderboard"}
            </p>
          </div>
          <Link
            href="/child/leaderboards"
            className="text-sm font-bold text-brand-500 hover:underline"
          >
            View →
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: number | string;
}) {
  return (
    <div className="bg-surface rounded-2xl p-4 text-center">
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="text-xl font-black text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground font-semibold mt-0.5">{label}</div>
    </div>
  );
}
