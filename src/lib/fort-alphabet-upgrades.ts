/** Upgrade catalog for Fort Alphabet arcade game. */

export interface FortUpgradeDef {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: "towers" | "base" | "special";
  emoji: string;
  requires?: string;
}

export const FORT_ALPHABET_UPGRADES: FortUpgradeDef[] = [
  // ── Tower upgrades ───────────────────────────────────────────
  {
    id: "better_pencils",
    name: "Sharp Pencils",
    description: "Pencil Turrets deal 50% more damage",
    cost: 40,
    category: "towers",
    emoji: "✏️",
  },
  {
    id: "super_rubber",
    name: "Super Rubber",
    description: "Rubber Cannons fire 30% faster and deal more damage",
    cost: 60,
    category: "towers",
    emoji: "🔴",
  },
  {
    id: "sticky_glue",
    name: "Sticky Glue",
    description: "Glue Traps slow enemies even more",
    cost: 35,
    category: "towers",
    emoji: "💧",
  },
  {
    id: "mega_dictionary",
    name: "Mega Dictionary",
    description: "Dictionary Towers deal 50% more damage",
    cost: 80,
    category: "towers",
    emoji: "📖",
  },

  // ── Base upgrades ────────────────────────────────────────────
  {
    id: "reinforced_base",
    name: "Reinforced Base",
    description: "Start each level with 2 extra lives",
    cost: 100,
    category: "base",
    emoji: "🏠",
  },
  {
    id: "extra_gold",
    name: "Piggy Bank",
    description: "Start each level with 20 extra gold",
    cost: 50,
    category: "base",
    emoji: "🐷",
  },

  // ── Special towers (unlock) ──────────────────────────────────
  {
    id: "eraser_mines",
    name: "Eraser Mines",
    description: "Unlock the Eraser Mine — a one-use explosive trap",
    cost: 60,
    category: "special",
    emoji: "🧹",
  },
  {
    id: "ink_blaster",
    name: "Ink Blaster",
    description: "Unlock the Ink Blaster — splash damage to groups",
    cost: 80,
    category: "special",
    emoji: "🖊️",
  },
  {
    id: "ruler_sniper",
    name: "Ruler Sniper",
    description: "Unlock the Ruler Sniper — huge range and damage",
    cost: 100,
    category: "special",
    emoji: "📏",
    requires: "ink_blaster",
  },
  {
    id: "bookworm_burrow",
    name: "Bookworm Burrow",
    description: "Unlock Bookworm Burrow — spawns bouncing worms",
    cost: 120,
    category: "special",
    emoji: "🐛",
    requires: "eraser_mines",
  },
];

/** Look up an upgrade by ID. */
export function getFortUpgrade(id: string): FortUpgradeDef | undefined {
  return FORT_ALPHABET_UPGRADES.find((u) => u.id === id);
}

/** Check if an upgrade's prerequisites are met given a set of owned IDs. */
export function canPurchaseFort(upgradeId: string, ownedIds: Set<string>): boolean {
  if (ownedIds.has(upgradeId)) return false;
  const upgrade = getFortUpgrade(upgradeId);
  if (!upgrade) return false;
  if (upgrade.requires && !ownedIds.has(upgrade.requires)) return false;
  return true;
}
