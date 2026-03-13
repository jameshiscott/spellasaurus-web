import type { EquipmentSlot } from './dino-types';

/**
 * SVG equipment overlays for dino avatar items.
 * Each component renders centered at (0, 0) within the 200×200 SVG viewBox.
 * The caller applies a `transform="translate(x, y)"` to position it.
 */

// ─── Head items ──────────────────────────────────────────────────────────────

export function PartyHat() {
  return (
    <g>
      <polygon
        points="0,-26 -12,6 12,6"
        fill="#FF6B6B"
        stroke="#D63031"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <ellipse cx="0" cy="6" rx="13" ry="4.5" fill="#FF8A80" stroke="#D63031" strokeWidth="1.5" />
      <circle cx="-4" cy="-2" r="2.5" fill="#FFD700" opacity="0.9" />
      <circle cx="5" cy="-9" r="2" fill="#74B9FF" opacity="0.9" />
      <circle cx="-2" cy="-16" r="1.8" fill="#A29BFE" opacity="0.9" />
      {/* Pom-pom on top */}
      <circle cx="0" cy="-28" r="4" fill="#FFD700" stroke="#E6B800" strokeWidth="1" />
    </g>
  );
}

export function WizardHat() {
  return (
    <g>
      <polygon
        points="0,-36 -14,6 14,6"
        fill="#6B46C1"
        stroke="#44337A"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <ellipse cx="0" cy="6" rx="18" ry="6" fill="#553C9A" stroke="#44337A" strokeWidth="1.5" />
      {/* Moon crescent */}
      <path d="M-4,-18 Q1,-26 6,-18 Q1,-14 -4,-18" fill="#B794F4" />
      {/* Stars */}
      <polygon
        points="0,-8 1.2,-5.5 4.8,-5.5 1.9,-3.7 2.8,-1 0,-2.5 -2.8,-1 -1.9,-3.7 -4.8,-5.5 -1.2,-5.5"
        fill="#FFD700"
        transform="translate(5,-8)"
      />
      <polygon
        points="0,-5 0.7,-3.4 2.9,-3.4 1.1,-2.3 1.7,0 0,-1.5 -1.7,0 -1.1,-2.3 -2.9,-3.4 -0.7,-3.4"
        fill="#B794F4"
        transform="translate(-5,-4)"
      />
    </g>
  );
}

// ─── Body items ──────────────────────────────────────────────────────────────

export function RainbowCape() {
  return (
    <g opacity="0.88">
      <path
        d="M-24,-18 L-28,20 Q-16,34 0,36 Q16,34 28,20 L24,-18 Z"
        fill="#FF6B6B"
        stroke="#D63031"
        strokeWidth="1"
      />
      <path
        d="M-18,-18 L-22,18 Q-12,30 0,32 Q12,30 22,18 L18,-18 Z"
        fill="#FFA502"
      />
      <path
        d="M-12,-18 L-14,16 Q-7,26 0,28 Q7,26 14,16 L12,-18 Z"
        fill="#74B9FF"
      />
      <path
        d="M-6,-18 L-7,14 Q0,22 7,14 L6,-18 Z"
        fill="#A29BFE"
      />
    </g>
  );
}

export function SpaceSuit() {
  return (
    <g opacity="0.88">
      <ellipse cx="0" cy="2" rx="26" ry="30" fill="#BDC3C7" stroke="#95A5A6" strokeWidth="2" />
      {/* Chest panel */}
      <rect x="-14" y="-10" width="28" height="18" rx="5" fill="#2C3E50" stroke="#1A252F" strokeWidth="1.5" />
      {/* Visor reflection */}
      <rect x="-10" y="-7" width="10" height="7" rx="2" fill="#3498DB" opacity="0.6" />
      {/* Buttons */}
      <circle cx="6" cy="-4" r="2.5" fill="#E74C3C" />
      <circle cx="6" cy="3" r="2.5" fill="#27AE60" />
      {/* Suit seams */}
      <line x1="-14" y1="10" x2="-18" y2="24" stroke="#95A5A6" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="10" x2="18" y2="24" stroke="#95A5A6" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

// ─── Eyes items ──────────────────────────────────────────────────────────────

export function StarGlasses() {
  return (
    <g>
      {/* Left star lens */}
      <polygon
        points="0,-8 1.9,-2.6 7.6,-2.5 3,1 4.7,6.5 0,3.2 -4.7,6.5 -3,1 -7.6,-2.5 -1.9,-2.6"
        fill="#FFD700"
        stroke="#E6B800"
        strokeWidth="1"
        transform="translate(-10,0)"
      />
      {/* Right star lens */}
      <polygon
        points="0,-8 1.9,-2.6 7.6,-2.5 3,1 4.7,6.5 0,3.2 -4.7,6.5 -3,1 -7.6,-2.5 -1.9,-2.6"
        fill="#FFD700"
        stroke="#E6B800"
        strokeWidth="1"
        transform="translate(10,0)"
      />
      {/* Bridge */}
      <line x1="-3" y1="0" x2="3" y2="0" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round" />
      {/* Side arms */}
      <line x1="-17" y1="0" x2="-22" y2="2" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="17" y1="0" x2="22" y2="2" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round" />
      {/* Sparkles */}
      <circle cx="-7" cy="-6" r="1.5" fill="white" opacity="0.9" />
      <circle cx="13" cy="-5" r="1.5" fill="white" opacity="0.9" />
    </g>
  );
}

// ─── Background items ────────────────────────────────────────────────────────

export function EnchantedForest() {
  return (
    <g>
      {/* Green tint on background circle */}
      <circle cx="0" cy="0" r="92" fill="#2D5A27" opacity="0.12" />
      {/* Simple trees at edges */}
      <g transform="translate(-60, 55)">
        <rect x="-2" y="0" width="4" height="8" rx="1" fill="#8B6914" />
        <polygon points="0,-14 -8,2 8,2" fill="#27AE60" stroke="#1E8449" strokeWidth="1" />
        <polygon points="0,-8 -6,4 6,4" fill="#2ECC71" stroke="#27AE60" strokeWidth="1" />
      </g>
      <g transform="translate(60, 55)">
        <rect x="-2" y="0" width="4" height="8" rx="1" fill="#8B6914" />
        <polygon points="0,-14 -8,2 8,2" fill="#27AE60" stroke="#1E8449" strokeWidth="1" />
        <polygon points="0,-8 -6,4 6,4" fill="#2ECC71" stroke="#27AE60" strokeWidth="1" />
      </g>
      {/* Mushrooms */}
      <g transform="translate(-30, 72)">
        <rect x="-1.5" y="0" width="3" height="5" rx="1" fill="#F5CBA7" />
        <ellipse cx="0" cy="-1" rx="6" ry="4" fill="#E74C3C" stroke="#C0392B" strokeWidth="0.8" />
        <circle cx="-2" cy="-2" r="1.2" fill="white" opacity="0.8" />
        <circle cx="2" cy="0" r="1" fill="white" opacity="0.8" />
      </g>
      <g transform="translate(30, 72)">
        <rect x="-1.5" y="0" width="3" height="5" rx="1" fill="#F5CBA7" />
        <ellipse cx="0" cy="-1" rx="5" ry="3.5" fill="#E74C3C" stroke="#C0392B" strokeWidth="0.8" />
        <circle cx="-1.5" cy="-1.5" r="1" fill="white" opacity="0.8" />
        <circle cx="2" cy="0.5" r="0.8" fill="white" opacity="0.8" />
      </g>
      {/* Fireflies */}
      <circle cx="-50" cy="-30" r="3" fill="#F9CA24" opacity="0.7" />
      <circle cx="50" cy="-20" r="2.5" fill="#F9CA24" opacity="0.6" />
      <circle cx="-20" cy="30" r="2" fill="#F9CA24" opacity="0.5" />
      <circle cx="40" cy="40" r="2.5" fill="#F9CA24" opacity="0.6" />
      <circle cx="0" cy="-50" r="2" fill="#F9CA24" opacity="0.5" />
    </g>
  );
}

// ─── Handheld items ──────────────────────────────────────────────────────────

export function GoldenWand() {
  return (
    <g>
      {/* Wand shaft */}
      <rect
        x="-2.5"
        y="-4"
        width="5"
        height="30"
        rx="2.5"
        fill="#F6D860"
        stroke="#D4AC0D"
        strokeWidth="1.5"
        transform="rotate(-25)"
      />
      {/* Handle grip */}
      <rect
        x="-3.5"
        y="16"
        width="7"
        height="10"
        rx="3"
        fill="#8B6914"
        stroke="#6B5210"
        strokeWidth="1"
        transform="rotate(-25)"
      />
      {/* Star tip */}
      <polygon
        points="0,-6 1.4,-2 5.7,-1.9 2.3,0.7 3.5,4.9 0,2.4 -3.5,4.9 -2.3,0.7 -5.7,-1.9 -1.4,-2"
        fill="#FFD700"
        stroke="#E6B800"
        strokeWidth="0.8"
        transform="translate(-7,-17)"
      />
      {/* Sparkles */}
      <circle cx="-4" cy="-22" r="2" fill="white" opacity="0.85" />
      <circle cx="-12" cy="-12" r="1.5" fill="#F9CA24" opacity="0.7" />
    </g>
  );
}

// ─── Feet items ──────────────────────────────────────────────────────────────

export function GenericFeet() {
  return (
    <g>
      {/* Left shoe */}
      <ellipse cx="-10" cy="2" rx="8" ry="5" fill="#E74C3C" stroke="#C0392B" strokeWidth="1.5" />
      <ellipse cx="-13" cy="0" rx="5" ry="3" fill="#E74C3C" stroke="#C0392B" strokeWidth="1" />
      {/* Right shoe */}
      <ellipse cx="10" cy="2" rx="8" ry="5" fill="#E74C3C" stroke="#C0392B" strokeWidth="1.5" />
      <ellipse cx="13" cy="0" rx="5" ry="3" fill="#E74C3C" stroke="#C0392B" strokeWidth="1" />
      {/* Laces */}
      <path d="M-12,0 L-8,0" stroke="white" strokeWidth="1" strokeLinecap="round" />
      <path d="M8,0 L12,0" stroke="white" strokeWidth="1" strokeLinecap="round" />
    </g>
  );
}

// ─── Accessory items ─────────────────────────────────────────────────────────

export function ChampionMedal() {
  return (
    <g>
      {/* Ribbon V-shape */}
      <path d="M-6,-16 L-8,-2 L0,2 L8,-2 L6,-16 Z" fill="#E74C3C" stroke="#C0392B" strokeWidth="1" />
      <path d="M-3,-16 L0,-10 L3,-16" fill="#C0392B" />
      {/* Medal disc */}
      <circle cx="0" cy="8" r="12" fill="#F6D860" stroke="#D4AC0D" strokeWidth="2" />
      <circle cx="0" cy="8" r="9" fill="#FFD700" stroke="#D4AC0D" strokeWidth="1" />
      {/* Star in center */}
      <polygon
        points="0,-5 1.2,-1.6 4.8,-1.5 1.9,0.6 2.9,4 0,2 -2.9,4 -1.9,0.6 -4.8,-1.5 -1.2,-1.6"
        fill="#D4AC0D"
        transform="translate(0,8)"
      />
    </g>
  );
}

// ─── Item name → component lookup ────────────────────────────────────────────

const ITEM_RENDERERS: Record<string, () => JSX.Element> = {
  'Party Hat': PartyHat,
  'Wizard Hat': WizardHat,
  'Rainbow Cape': RainbowCape,
  'Space Suit': SpaceSuit,
  'Star Glasses': StarGlasses,
  'Enchanted Forest': EnchantedForest,
  'Golden Wand': GoldenWand,
  'Champion Medal': ChampionMedal,
};

/**
 * Fallback renderers by slot — used when we don't recognise the item name.
 * Shows a generic coloured badge so the user still sees *something*.
 */
const SLOT_FALLBACK_COLORS: Record<EquipmentSlot, string> = {
  head: '#FF6B6B',
  body: '#74B9FF',
  eyes: '#FFD700',
  feet: '#E74C3C',
  handheld: '#F6D860',
  background: '#27AE60',
  accessory: '#A29BFE',
};

const SLOT_FALLBACK_EMOJI: Record<EquipmentSlot, string> = {
  head: '🎩',
  body: '👕',
  eyes: '👓',
  feet: '👟',
  handheld: '🪄',
  background: '🌅',
  accessory: '⭐',
};

function FallbackBadge({ slot }: { slot: EquipmentSlot }) {
  const color = SLOT_FALLBACK_COLORS[slot];
  return (
    <g>
      <circle cx="0" cy="0" r="10" fill={color} stroke="white" strokeWidth="2" opacity="0.85" />
      <text x="0" y="5" textAnchor="middle" fontSize="12">
        {SLOT_FALLBACK_EMOJI[slot]}
      </text>
    </g>
  );
}

/**
 * Render equipment for a given slot and item name.
 * Returns null if nothing should be rendered.
 */
export function EquipmentLayer({
  slot,
  itemName,
}: {
  slot: EquipmentSlot;
  itemName: string;
}) {
  const Renderer = ITEM_RENDERERS[itemName];
  if (Renderer) return <Renderer />;

  // Unknown item — show a generic badge
  if (slot === 'feet') return <GenericFeet />;
  return <FallbackBadge slot={slot} />;
}
