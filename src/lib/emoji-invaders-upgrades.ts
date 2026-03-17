/** Upgrade catalog for Emoji Invaders arcade game. */

export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: "ship" | "guns" | "secondary";
  emoji: string;
  requires?: string; // ID of prerequisite upgrade
}

export const EMOJI_INVADERS_UPGRADES: UpgradeDef[] = [
  // ── Ship upgrades ──────────────────────────────────────
  {
    id: "ghost_ship",
    name: "Ghost Ship",
    description: "A clone ship mirrors your moves",
    cost: 75,
    category: "ship",
    emoji: "👻",
  },
  {
    id: "ghost_ship_2",
    name: "Ghost Ship II",
    description: "Two clone ships copy your moves",
    cost: 200,
    category: "ship",
    emoji: "👻",
    requires: "ghost_ship",
  },
  {
    id: "shield_1",
    name: "Shield",
    description: "Absorbs 1 hit at the start of each game",
    cost: 40,
    category: "ship",
    emoji: "🛡️",
  },
  {
    id: "shield_2",
    name: "Shield II",
    description: "Absorbs 2 hits at the start",
    cost: 100,
    category: "ship",
    emoji: "🛡️",
    requires: "shield_1",
  },
  {
    id: "shield_3",
    name: "Shield III",
    description: "Absorbs 3 hits at the start",
    cost: 250,
    category: "ship",
    emoji: "🛡️",
    requires: "shield_2",
  },

  // ── Gun upgrades ───────────────────────────────────────
  {
    id: "dual_guns",
    name: "Dual Guns",
    description: "Fire two bullets side by side",
    cost: 60,
    category: "guns",
    emoji: "🔫",
  },
  {
    id: "triple_guns",
    name: "Triple Guns",
    description: "Fire three spread bullets",
    cost: 150,
    category: "guns",
    emoji: "🔫",
    requires: "dual_guns",
  },

  // ── Secondary weapons ──────────────────────────────────
  {
    id: "missiles",
    name: "Missiles",
    description: "Tap to launch a missile from one corner",
    cost: 80,
    category: "secondary",
    emoji: "🚀",
  },
  {
    id: "missiles_dual",
    name: "Dual Missiles",
    description: "Tap to launch missiles from both corners",
    cost: 175,
    category: "secondary",
    emoji: "🚀",
    requires: "missiles",
  },
  {
    id: "missiles_auto",
    name: "Auto Missiles",
    description: "Missiles fire automatically when ready",
    cost: 300,
    category: "secondary",
    emoji: "🚀",
    requires: "missiles_dual",
  },
  {
    id: "laser",
    name: "Laser",
    description: "Tap to fire a piercing beam through all enemies in a line",
    cost: 80,
    category: "secondary",
    emoji: "⚡",
  },
  {
    id: "laser_auto",
    name: "Auto Laser",
    description: "Laser fires automatically every few seconds",
    cost: 200,
    category: "secondary",
    emoji: "⚡",
    requires: "laser",
  },
];

/** Look up an upgrade by ID. */
export function getUpgrade(id: string): UpgradeDef | undefined {
  return EMOJI_INVADERS_UPGRADES.find((u) => u.id === id);
}

/** Check if an upgrade's prerequisites are met given a set of owned IDs. */
export function canPurchase(upgradeId: string, ownedIds: Set<string>): boolean {
  if (ownedIds.has(upgradeId)) return false; // already owned
  const upgrade = getUpgrade(upgradeId);
  if (!upgrade) return false;
  if (upgrade.requires && !ownedIds.has(upgrade.requires)) return false;
  return true;
}
