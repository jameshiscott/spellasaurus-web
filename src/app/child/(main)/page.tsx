import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";
import Link from "next/link";
import DinoAvatar from "@/components/dino/DinoAvatar";
import type { DinoType, DinoColor, EquipmentSlot } from "@/components/dino/dino-types";

export default async function ChildHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from(TABLES.USERS)
    .select("display_name, coin_balance, dino_type, dino_color, avatar_loadout")
    .eq("id", user!.id)
    .single();

  // Fetch inventory to resolve loadout item names for DinoAvatar
  const { data: inventory } = await supabase
    .from(TABLES.CHILD_INVENTORY)
    .select("item_id, shop_items(name)")
    .eq("child_id", user!.id);

  const dinoType = (profile?.dino_type as DinoType | null) ?? "trex";
  const dinoColor = (profile?.dino_color as DinoColor | null) ?? "green";
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

  // Fetch this week's assigned sets (class sets + personal sets)
  const serviceClient = createServiceClient();

  const { data: classEnrolments } = await supabase
    .from(TABLES.CLASS_STUDENTS)
    .select("class_id")
    .eq("child_id", user!.id);

  const classIds = classEnrolments?.map((e) => e.class_id) ?? [];

  let classSets: Array<{ id: string; name: string; week_start: string; type: string }> = [];
  if (classIds.length > 0) {
    // Junction table links
    // eslint-disable-next-line
    const { data: junctionLinks } = await (serviceClient as any)
      .from(TABLES.CLASS_SPELLING_SETS)
      .select("set_id")
      .in("class_id", classIds);

    const junctionSetIds: string[] = (junctionLinks ?? []).map(
      (l: { set_id: string }) => l.set_id
    );

    // Legacy sets with class_id directly on spelling_sets
    const { data: legacySets } = await serviceClient
      .from(TABLES.SPELLING_SETS)
      .select("id")
      .in("class_id", classIds)
      .eq("type", "class")
      .eq("is_active", true);

    const legacySetIds = (legacySets ?? []).map((s) => s.id);

    // Merge and dedupe
    const allSetIds = [...new Set([...junctionSetIds, ...legacySetIds])];

    if (allSetIds.length > 0) {
      const { data: sets } = await serviceClient
        .from(TABLES.SPELLING_SETS)
        .select("id, name, week_start, type")
        .in("id", allSetIds)
        .eq("is_active", true)
        .order("week_start", { ascending: false })
        .limit(5);

      classSets = (sets ?? []) as typeof classSets;
    }
  }

  const { data: personalSetLinks } = await serviceClient
    .from(TABLES.CHILD_PERSONAL_SETS)
    .select("set_id, spelling_sets(id, name, type)")
    .eq("child_id", user!.id)
    .limit(5);

  const personalSets = personalSetLinks?.map((l) => l.spelling_sets).filter(Boolean) ?? [];
  const allSets = [...(classSets ?? []), ...personalSets];

  return (
    <div className="pt-6 space-y-6">
      {/* Greeting */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <DinoAvatar
            dinoType={dinoType}
            dinoColor={dinoColor}
            size="md"
            loadout={avatarLoadout}
            animate={false}
          />
          <div>
            <h1 className="text-2xl font-black text-foreground">
              Hi {profile?.display_name ?? "there"}! 👋
            </h1>
            <p className="text-muted-foreground font-semibold">
              Let&apos;s practise spelling!
            </p>
          </div>
        </div>
      </div>

      {/* Coin balance */}
      <div className="bg-warning/20 rounded-2xl px-5 py-3 flex items-center gap-3">
        <span className="text-2xl">🪙</span>
        <div>
          <p className="text-xs font-bold text-yellow-700 uppercase tracking-wide">Coins</p>
          <p className="text-2xl font-black text-yellow-800">
            {profile?.coin_balance ?? 0}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Link
            href="/child/shop"
            className="text-xs font-bold text-yellow-700 bg-white rounded-xl px-3 py-1 hover:bg-yellow-50"
          >
            Shop
          </Link>
          <Link
            href="/child/wardrobe"
            className="text-xs font-bold text-yellow-700 bg-white rounded-xl px-3 py-1 hover:bg-yellow-50"
          >
            Wardrobe
          </Link>
        </div>
      </div>

      {/* This week's sets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-foreground">This Week&apos;s Sets</h2>
          <Link
            href="/child/sets"
            className="text-sm font-bold text-brand-500 hover:underline"
          >
            See all
          </Link>
        </div>

        {allSets.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-muted-foreground font-semibold">
            No spelling sets yet. Ask your teacher or parent to add some!
          </div>
        ) : (
          <div className="space-y-3">
            {allSets.slice(0, 4).map((set) => (
              <Link
                key={set.id}
                href={`/child/practice/${set.id}`}
                className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-brand-300 border-2 border-transparent transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground">{set.name}</p>
                    <p className="text-xs text-muted-foreground capitalize font-semibold">
                      {set.type === "class" ? "Class set" : "Personal set"}
                    </p>
                  </div>
                  <span className="text-brand-500 text-xl">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          href="/child/profile"
          className="bg-white rounded-2xl p-4 shadow-sm text-center hover:shadow-md transition-all"
        >
          <div className="text-2xl mb-1">👤</div>
          <p className="font-bold text-sm text-foreground">Profile</p>
        </Link>
        <Link
          href="/child/arcade"
          className="bg-white rounded-2xl p-4 shadow-sm text-center hover:shadow-md transition-all"
        >
          <div className="text-2xl mb-1">🕹️</div>
          <p className="font-bold text-sm text-foreground">Arcade</p>
        </Link>
        <Link
          href="/child/leaderboards"
          className="bg-white rounded-2xl p-4 shadow-sm text-center hover:shadow-md transition-all"
        >
          <div className="text-2xl mb-1">🏆</div>
          <p className="font-bold text-sm text-foreground">Leaderboard</p>
        </Link>
      </div>
    </div>
  );
}
