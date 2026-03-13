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

// ─── NEW Head items ─────────────────────────────────────────────────────────

export function Crown() {
  return (
    <g>
      <rect x="-14" y="-2" width="28" height="12" rx="2" fill="#FFD700" stroke="#D4AC0D" strokeWidth="1.5" />
      <polygon points="-14,-2 -14,-14 -7,-6" fill="#FFD700" stroke="#D4AC0D" strokeWidth="1" />
      <polygon points="0,-2 0,-18 7,-6 -7,-6" fill="#FFD700" stroke="#D4AC0D" strokeWidth="1" />
      <polygon points="14,-2 14,-14 7,-6" fill="#FFD700" stroke="#D4AC0D" strokeWidth="1" />
      <circle cx="-7" cy="-10" r="2.5" fill="#E74C3C" />
      <circle cx="0" cy="-14" r="2.5" fill="#3498DB" />
      <circle cx="7" cy="-10" r="2.5" fill="#2ECC71" />
    </g>
  );
}

export function PirateHat() {
  return (
    <g>
      <ellipse cx="0" cy="6" rx="20" ry="5" fill="#2C3E50" stroke="#1A252F" strokeWidth="1.5" />
      <path d="M-18,4 Q-20,-16 0,-20 Q20,-16 18,4" fill="#2C3E50" stroke="#1A252F" strokeWidth="1.5" />
      <path d="M-6,-8 L0,-14 L6,-8 L3,-8 L3,-2 L-3,-2 L-3,-8 Z" fill="white" />
      <rect x="-4" y="-6" width="8" height="4" rx="1" fill="white" />
    </g>
  );
}

export function VikingHelmet() {
  return (
    <g>
      <ellipse cx="0" cy="2" rx="16" ry="12" fill="#8B7355" stroke="#6B5210" strokeWidth="1.5" />
      <rect x="-16" y="0" width="32" height="6" rx="2" fill="#A0855B" stroke="#6B5210" strokeWidth="1" />
      {/* Horns */}
      <path d="M-14,-2 Q-24,-18 -18,-26" stroke="#F5CBA7" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M14,-2 Q24,-18 18,-26" stroke="#F5CBA7" strokeWidth="3" strokeLinecap="round" fill="none" />
    </g>
  );
}

export function FlowerCrown() {
  return (
    <g>
      <path d="M-16,2 Q-8,-6 0,-4 Q8,-6 16,2" stroke="#27AE60" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="-12" cy="-2" r="4" fill="#FF6B6B" stroke="#D63031" strokeWidth="0.8" />
      <circle cx="-4" cy="-6" r="4" fill="#FFD700" stroke="#E6B800" strokeWidth="0.8" />
      <circle cx="4" cy="-6" r="4" fill="#A29BFE" stroke="#6C5CE7" strokeWidth="0.8" />
      <circle cx="12" cy="-2" r="4" fill="#FF85A2" stroke="#E84393" strokeWidth="0.8" />
      <circle cx="-12" cy="-2" r="1.5" fill="#FFD700" />
      <circle cx="-4" cy="-6" r="1.5" fill="white" />
      <circle cx="4" cy="-6" r="1.5" fill="#FFD700" />
      <circle cx="12" cy="-2" r="1.5" fill="white" />
    </g>
  );
}

export function TopHat() {
  return (
    <g>
      <ellipse cx="0" cy="6" rx="18" ry="5" fill="#1A1A2E" stroke="#0D0D1A" strokeWidth="1.5" />
      <rect x="-12" y="-22" width="24" height="28" rx="2" fill="#2C2C54" stroke="#1A1A2E" strokeWidth="1.5" />
      <ellipse cx="0" cy="-22" rx="12" ry="4" fill="#3D3D6B" stroke="#1A1A2E" strokeWidth="1" />
      <rect x="-12" y="-2" width="24" height="4" rx="1" fill="#E74C3C" />
    </g>
  );
}

export function BaseballCap() {
  return (
    <g>
      <ellipse cx="0" cy="4" rx="16" ry="10" fill="#3498DB" stroke="#2980B9" strokeWidth="1.5" />
      <path d="M-10,6 Q-2,4 14,10 L18,6 Q2,0 -10,4 Z" fill="#2980B9" stroke="#2471A3" strokeWidth="1" />
      <rect x="-6" y="-4" width="12" height="6" rx="2" fill="white" opacity="0.3" />
      <text x="0" y="1" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">S</text>
    </g>
  );
}

export function ChefHat() {
  return (
    <g>
      <rect x="-12" y="-6" width="24" height="14" rx="2" fill="white" stroke="#BDC3C7" strokeWidth="1.5" />
      <circle cx="-6" cy="-14" r="8" fill="white" stroke="#BDC3C7" strokeWidth="1" />
      <circle cx="6" cy="-14" r="8" fill="white" stroke="#BDC3C7" strokeWidth="1" />
      <circle cx="0" cy="-18" r="8" fill="white" stroke="#BDC3C7" strokeWidth="1" />
      <rect x="-12" y="4" width="24" height="3" rx="1" fill="#BDC3C7" />
    </g>
  );
}

export function SantaHat() {
  return (
    <g>
      <polygon points="0,-30 -16,6 16,6" fill="#E74C3C" stroke="#C0392B" strokeWidth="1.5" strokeLinejoin="round" />
      <ellipse cx="0" cy="6" rx="18" ry="6" fill="white" stroke="#BDC3C7" strokeWidth="1" />
      <circle cx="4" cy="-28" r="5" fill="white" stroke="#BDC3C7" strokeWidth="0.8" />
      <path d="M-4,-20 Q0,-14 4,-20" stroke="white" strokeWidth="0.5" fill="none" />
    </g>
  );
}

export function Tiara() {
  return (
    <g>
      <path d="M-16,4 Q-8,-2 0,-8 Q8,-2 16,4" stroke="#C0C0C0" strokeWidth="2.5" fill="none" />
      <path d="M-12,2 L-8,-6 L-4,0" stroke="#C0C0C0" strokeWidth="1.5" fill="#E8E8E8" />
      <path d="M-4,0 L0,-12 L4,0" stroke="#C0C0C0" strokeWidth="1.5" fill="#E8E8E8" />
      <path d="M4,0 L8,-6 L12,2" stroke="#C0C0C0" strokeWidth="1.5" fill="#E8E8E8" />
      <circle cx="0" cy="-12" r="2.5" fill="#FF69B4" stroke="#E84393" strokeWidth="0.8" />
      <circle cx="-8" cy="-6" r="1.8" fill="#74B9FF" />
      <circle cx="8" cy="-6" r="1.8" fill="#74B9FF" />
    </g>
  );
}

export function UnicornHorn() {
  return (
    <g>
      <polygon points="0,-34 -6,4 6,4" fill="#F8C8DC" stroke="#E84393" strokeWidth="1" strokeLinejoin="round" />
      <path d="M-4,-22 L4,-22" stroke="#A29BFE" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M-3,-14 L3,-14" stroke="#74B9FF" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M-5,-6 L5,-6" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M-2,-28 L2,-28" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="0" cy="-34" r="2" fill="#FFD700" opacity="0.8" />
    </g>
  );
}

// ─── NEW Body items ─────────────────────────────────────────────────────────

export function KnightArmour() {
  return (
    <g opacity="0.88">
      <ellipse cx="0" cy="2" rx="24" ry="28" fill="#95A5A6" stroke="#7F8C8D" strokeWidth="2" />
      <rect x="-14" y="-12" width="28" height="20" rx="4" fill="#BDC3C7" stroke="#95A5A6" strokeWidth="1.5" />
      <line x1="0" y1="-12" x2="0" y2="8" stroke="#7F8C8D" strokeWidth="1.5" />
      <line x1="-14" y1="-2" x2="14" y2="-2" stroke="#7F8C8D" strokeWidth="1.5" />
      <rect x="-16" y="-18" width="8" height="8" rx="2" fill="#95A5A6" stroke="#7F8C8D" strokeWidth="1" />
      <rect x="8" y="-18" width="8" height="8" rx="2" fill="#95A5A6" stroke="#7F8C8D" strokeWidth="1" />
    </g>
  );
}

export function SuperheroCape() {
  return (
    <g opacity="0.88">
      <path d="M-22,-18 L-30,28 Q0,36 30,28 L22,-18 Z" fill="#E74C3C" stroke="#C0392B" strokeWidth="1.5" />
      <path d="M-16,-18 L-22,22 Q0,28 22,22 L16,-18 Z" fill="#C0392B" />
      {/* Lightning bolt emblem */}
      <polygon points="-2,-10 4,-10 0,0 6,0 -4,14 0,4 -6,4" fill="#FFD700" stroke="#E6B800" strokeWidth="0.8" />
    </g>
  );
}

export function HawaiianShirt() {
  return (
    <g opacity="0.88">
      <ellipse cx="0" cy="4" rx="24" ry="26" fill="#FF7675" stroke="#D63031" strokeWidth="1.5" />
      <circle cx="-8" cy="-6" r="4" fill="#FFEAA7" opacity="0.7" />
      <circle cx="6" cy="2" r="3.5" fill="#55E6C1" opacity="0.7" />
      <circle cx="-4" cy="10" r="3" fill="#74B9FF" opacity="0.7" />
      <circle cx="10" cy="-8" r="2.5" fill="#FFEAA7" opacity="0.7" />
      <circle cx="-10" cy="6" r="2" fill="#FF6B6B" opacity="0.5" />
      <rect x="-3" y="-18" width="6" height="38" rx="2" fill="#FF7675" stroke="#D63031" strokeWidth="0.8" />
    </g>
  );
}

export function LabCoat() {
  return (
    <g opacity="0.88">
      <ellipse cx="0" cy="4" rx="24" ry="28" fill="white" stroke="#BDC3C7" strokeWidth="2" />
      <rect x="-3" y="-16" width="6" height="36" rx="2" fill="white" stroke="#BDC3C7" strokeWidth="0.8" />
      <rect x="-18" y="-8" width="10" height="8" rx="2" fill="#ECF0F1" stroke="#BDC3C7" strokeWidth="0.8" />
      <circle cx="-13" cy="-4" r="1.5" fill="#3498DB" />
      <circle cx="2" cy="4" r="1.5" fill="#BDC3C7" />
      <circle cx="2" cy="10" r="1.5" fill="#BDC3C7" />
    </g>
  );
}

export function PrincessDress() {
  return (
    <g opacity="0.88">
      <path d="M-12,-16 L-26,28 Q0,34 26,28 L12,-16 Z" fill="#FF85A2" stroke="#E84393" strokeWidth="1.5" />
      <ellipse cx="0" cy="-14" rx="14" ry="6" fill="#F8C8DC" stroke="#E84393" strokeWidth="1" />
      <circle cx="0" cy="-14" r="3" fill="#FFD700" stroke="#E6B800" strokeWidth="0.8" />
      <path d="M-20,18 Q0,24 20,18" stroke="#E84393" strokeWidth="0.8" fill="none" strokeDasharray="2,2" />
      <path d="M-22,24 Q0,30 22,24" stroke="#E84393" strokeWidth="0.8" fill="none" strokeDasharray="2,2" />
    </g>
  );
}

export function NinjaOutfit() {
  return (
    <g opacity="0.88">
      <ellipse cx="0" cy="2" rx="22" ry="26" fill="#2C3E50" stroke="#1A252F" strokeWidth="2" />
      <rect x="-18" y="-4" width="36" height="4" rx="1" fill="#E74C3C" />
      <line x1="-8" y1="-8" x2="8" y2="-8" stroke="#34495E" strokeWidth="1.5" />
      <line x1="-6" y1="4" x2="6" y2="4" stroke="#34495E" strokeWidth="1.5" />
      <line x1="14" y1="-4" x2="24" y2="-10" stroke="#E74C3C" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

export function FootballKit() {
  return (
    <g opacity="0.88">
      <ellipse cx="0" cy="2" rx="22" ry="26" fill="#3498DB" stroke="#2980B9" strokeWidth="1.5" />
      <rect x="-10" y="-10" width="20" height="14" rx="3" fill="white" stroke="#BDC3C7" strokeWidth="1" />
      <text x="0" y="2" textAnchor="middle" fontSize="10" fill="#3498DB" fontWeight="bold">10</text>
      <line x1="-14" y1="10" x2="14" y2="10" stroke="#2980B9" strokeWidth="1.5" />
    </g>
  );
}

export function ScubaSuit() {
  return (
    <g opacity="0.88">
      <ellipse cx="0" cy="2" rx="24" ry="28" fill="#2C3E50" stroke="#1A252F" strokeWidth="2" />
      <rect x="-10" y="-14" width="20" height="14" rx="4" fill="#F39C12" stroke="#E67E22" strokeWidth="1.5" />
      <circle cx="-4" cy="-8" r="3" fill="#3498DB" opacity="0.6" />
      <circle cx="4" cy="-8" r="3" fill="#3498DB" opacity="0.6" />
      <ellipse cx="10" cy="-20" rx="5" ry="8" fill="#7F8C8D" stroke="#636E72" strokeWidth="1" />
      <ellipse cx="-10" cy="-20" rx="5" ry="8" fill="#7F8C8D" stroke="#636E72" strokeWidth="1" />
    </g>
  );
}

// ─── NEW Eyes items ─────────────────────────────────────────────────────────

export function HeartGlasses() {
  return (
    <g>
      <path d="M-14,-4 Q-14,-10 -10,-10 Q-6,-10 -6,-4 Q-6,2 -10,6 Q-14,2 -14,-4 Z" fill="#FF6B6B" stroke="#D63031" strokeWidth="1" />
      <path d="M6,-4 Q6,-10 10,-10 Q14,-10 14,-4 Q14,2 10,6 Q6,2 6,-4 Z" fill="#FF6B6B" stroke="#D63031" strokeWidth="1" />
      <line x1="-6" y1="-2" x2="6" y2="-2" stroke="#D63031" strokeWidth="2" strokeLinecap="round" />
      <line x1="-14" y1="-2" x2="-20" y2="0" stroke="#D63031" strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="-2" x2="20" y2="0" stroke="#D63031" strokeWidth="2" strokeLinecap="round" />
      <circle cx="-8" cy="-6" r="1.5" fill="white" opacity="0.7" />
      <circle cx="12" cy="-6" r="1.5" fill="white" opacity="0.7" />
    </g>
  );
}

export function Monocle() {
  return (
    <g>
      <circle cx="8" cy="0" r="9" fill="none" stroke="#D4AC0D" strokeWidth="2.5" />
      <circle cx="8" cy="0" r="7" fill="#FFF9E6" opacity="0.3" />
      <line x1="8" y1="9" x2="4" y2="24" stroke="#D4AC0D" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="5" cy="-4" r="1.5" fill="white" opacity="0.6" />
    </g>
  );
}

export function ThreeDGlasses() {
  return (
    <g>
      <rect x="-18" y="-6" width="14" height="12" rx="2" fill="#3498DB" stroke="#2980B9" strokeWidth="1.5" />
      <rect x="4" y="-6" width="14" height="12" rx="2" fill="#E74C3C" stroke="#C0392B" strokeWidth="1.5" />
      <rect x="-4" y="-2" width="8" height="4" rx="1" fill="white" stroke="#BDC3C7" strokeWidth="1" />
      <line x1="-18" y1="0" x2="-24" y2="2" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="18" y1="0" x2="24" y2="2" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

export function AviatorGoggles() {
  return (
    <g>
      <ellipse cx="-10" cy="0" rx="10" ry="8" fill="#F5CBA7" stroke="#8B6914" strokeWidth="2" />
      <ellipse cx="10" cy="0" rx="10" ry="8" fill="#F5CBA7" stroke="#8B6914" strokeWidth="2" />
      <ellipse cx="-10" cy="0" rx="7" ry="5.5" fill="#74B9FF" opacity="0.5" />
      <ellipse cx="10" cy="0" rx="7" ry="5.5" fill="#74B9FF" opacity="0.5" />
      <rect x="-2" y="-2" width="4" height="4" rx="1" fill="#8B6914" />
      <line x1="-20" y1="0" x2="-24" y2="-2" stroke="#8B6914" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="20" y1="0" x2="24" y2="-2" stroke="#8B6914" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

export function PixelSunglasses() {
  return (
    <g>
      <rect x="-18" y="-4" width="6" height="6" fill="#1A1A2E" />
      <rect x="-12" y="-4" width="6" height="6" fill="#1A1A2E" />
      <rect x="6" y="-4" width="6" height="6" fill="#1A1A2E" />
      <rect x="12" y="-4" width="6" height="6" fill="#1A1A2E" />
      <rect x="-6" y="-2" width="12" height="2" fill="#1A1A2E" />
      <rect x="-18" y="-6" width="36" height="2" fill="#1A1A2E" />
      <line x1="-18" y1="-4" x2="-24" y2="-2" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="18" y1="-4" x2="24" y2="-2" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

export function RoundSpecs() {
  return (
    <g>
      <circle cx="-10" cy="0" r="8" fill="none" stroke="#8B6914" strokeWidth="2" />
      <circle cx="10" cy="0" r="8" fill="none" stroke="#8B6914" strokeWidth="2" />
      <circle cx="-10" cy="0" r="6" fill="#FFF9E6" opacity="0.2" />
      <circle cx="10" cy="0" r="6" fill="#FFF9E6" opacity="0.2" />
      <line x1="-2" y1="0" x2="2" y2="0" stroke="#8B6914" strokeWidth="2" strokeLinecap="round" />
      <line x1="-18" y1="0" x2="-22" y2="2" stroke="#8B6914" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="0" x2="22" y2="2" stroke="#8B6914" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

export function CatEyeGlasses() {
  return (
    <g>
      <path d="M-18,-6 L-16,-10 Q-10,-8 -4,-6 L-4,4 Q-10,6 -18,4 Z" fill="#E84393" stroke="#B83280" strokeWidth="1.5" />
      <path d="M4,-6 L16,-10 Q18,-8 18,4 Q10,6 4,4 Z" fill="#E84393" stroke="#B83280" strokeWidth="1.5" />
      <line x1="-4" y1="-2" x2="4" y2="-2" stroke="#B83280" strokeWidth="2" strokeLinecap="round" />
      <line x1="-18" y1="-2" x2="-22" y2="0" stroke="#B83280" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="-2" x2="22" y2="0" stroke="#B83280" strokeWidth="2" strokeLinecap="round" />
      <circle cx="-12" cy="-4" r="1.5" fill="white" opacity="0.5" />
      <circle cx="10" cy="-4" r="1.5" fill="white" opacity="0.5" />
    </g>
  );
}

export function EyePatch() {
  return (
    <g>
      <ellipse cx="-8" cy="0" rx="9" ry="7" fill="#2C3E50" stroke="#1A252F" strokeWidth="1.5" />
      <line x1="-8" y1="-7" x2="14" y2="-14" stroke="#2C3E50" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="-8" y1="7" x2="-14" y2="14" stroke="#2C3E50" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M-12,-2 L-6,-2 L-6,2 L-10,2 Z" fill="#FFD700" opacity="0.8" />
    </g>
  );
}

// ─── NEW Feet items ─────────────────────────────────────────────────────────

export function RollerSkates() {
  return (
    <g>
      {/* Left skate */}
      <rect x="-20" y="-4" width="14" height="8" rx="3" fill="#FF6B6B" stroke="#D63031" strokeWidth="1.5" />
      <circle cx="-18" cy="6" r="2.5" fill="#FFD700" stroke="#E6B800" strokeWidth="1" />
      <circle cx="-13" cy="6" r="2.5" fill="#FFD700" stroke="#E6B800" strokeWidth="1" />
      <circle cx="-8" cy="6" r="2.5" fill="#FFD700" stroke="#E6B800" strokeWidth="1" />
      {/* Right skate */}
      <rect x="6" y="-4" width="14" height="8" rx="3" fill="#FF6B6B" stroke="#D63031" strokeWidth="1.5" />
      <circle cx="8" cy="6" r="2.5" fill="#FFD700" stroke="#E6B800" strokeWidth="1" />
      <circle cx="13" cy="6" r="2.5" fill="#FFD700" stroke="#E6B800" strokeWidth="1" />
      <circle cx="18" cy="6" r="2.5" fill="#FFD700" stroke="#E6B800" strokeWidth="1" />
    </g>
  );
}

export function Flippers() {
  return (
    <g>
      <path d="M-20,0 Q-26,-4 -30,2 Q-26,8 -20,4 Z" fill="#2ECC71" stroke="#27AE60" strokeWidth="1.5" />
      <ellipse cx="-14" cy="2" rx="8" ry="5" fill="#27AE60" stroke="#1E8449" strokeWidth="1.5" />
      <path d="M6,0 Q12,-4 16,2 Q12,8 6,4 Z" fill="#2ECC71" stroke="#27AE60" strokeWidth="1.5" />
      <ellipse cx="12" cy="2" rx="8" ry="5" fill="#27AE60" stroke="#1E8449" strokeWidth="1.5" />
    </g>
  );
}

export function CowboyBoots() {
  return (
    <g>
      {/* Left boot */}
      <rect x="-20" y="-6" width="12" height="12" rx="2" fill="#8B6914" stroke="#6B5210" strokeWidth="1.5" />
      <rect x="-22" y="4" width="16" height="4" rx="1" fill="#6B5210" stroke="#503C0D" strokeWidth="1" />
      <line x1="-18" y1="-2" x2="-10" y2="-2" stroke="#A0855B" strokeWidth="1" />
      {/* Right boot */}
      <rect x="8" y="-6" width="12" height="12" rx="2" fill="#8B6914" stroke="#6B5210" strokeWidth="1.5" />
      <rect x="6" y="4" width="16" height="4" rx="1" fill="#6B5210" stroke="#503C0D" strokeWidth="1" />
      <line x1="10" y1="-2" x2="18" y2="-2" stroke="#A0855B" strokeWidth="1" />
    </g>
  );
}

export function BunnySlippers() {
  return (
    <g>
      {/* Left slipper */}
      <ellipse cx="-12" cy="2" rx="10" ry="6" fill="#F8C8DC" stroke="#E84393" strokeWidth="1" />
      <ellipse cx="-16" cy="-8" rx="3" ry="7" fill="#F8C8DC" stroke="#E84393" strokeWidth="1" />
      <ellipse cx="-10" cy="-8" rx="3" ry="7" fill="#F8C8DC" stroke="#E84393" strokeWidth="1" />
      <circle cx="-12" cy="0" r="2" fill="#FF85A2" />
      <circle cx="-14" cy="-2" r="1" fill="#1A1A2E" />
      <circle cx="-10" cy="-2" r="1" fill="#1A1A2E" />
      {/* Right slipper */}
      <ellipse cx="12" cy="2" rx="10" ry="6" fill="#F8C8DC" stroke="#E84393" strokeWidth="1" />
      <ellipse cx="8" cy="-8" rx="3" ry="7" fill="#F8C8DC" stroke="#E84393" strokeWidth="1" />
      <ellipse cx="14" cy="-8" rx="3" ry="7" fill="#F8C8DC" stroke="#E84393" strokeWidth="1" />
      <circle cx="12" cy="0" r="2" fill="#FF85A2" />
      <circle cx="10" cy="-2" r="1" fill="#1A1A2E" />
      <circle cx="14" cy="-2" r="1" fill="#1A1A2E" />
    </g>
  );
}

export function Trainers() {
  return (
    <g>
      {/* Left trainer */}
      <ellipse cx="-12" cy="2" rx="10" ry="6" fill="white" stroke="#BDC3C7" strokeWidth="1.5" />
      <path d="M-20,0 Q-14,-4 -4,0" stroke="#E74C3C" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="-18" y="4" width="16" height="3" rx="1" fill="#2C3E50" />
      {/* Right trainer */}
      <ellipse cx="12" cy="2" rx="10" ry="6" fill="white" stroke="#BDC3C7" strokeWidth="1.5" />
      <path d="M4,0 Q10,-4 20,0" stroke="#E74C3C" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="4" y="4" width="16" height="3" rx="1" fill="#2C3E50" />
    </g>
  );
}

export function MoonBoots() {
  return (
    <g>
      {/* Left boot */}
      <rect x="-20" y="-8" width="14" height="18" rx="4" fill="#BDC3C7" stroke="#95A5A6" strokeWidth="1.5" />
      <rect x="-22" y="6" width="18" height="5" rx="2" fill="#7F8C8D" stroke="#636E72" strokeWidth="1" />
      <line x1="-18" y1="-4" x2="-8" y2="-4" stroke="#95A5A6" strokeWidth="1.5" />
      <line x1="-18" y1="0" x2="-8" y2="0" stroke="#95A5A6" strokeWidth="1.5" />
      {/* Right boot */}
      <rect x="6" y="-8" width="14" height="18" rx="4" fill="#BDC3C7" stroke="#95A5A6" strokeWidth="1.5" />
      <rect x="4" y="6" width="18" height="5" rx="2" fill="#7F8C8D" stroke="#636E72" strokeWidth="1" />
      <line x1="8" y1="-4" x2="18" y2="-4" stroke="#95A5A6" strokeWidth="1.5" />
      <line x1="8" y1="0" x2="18" y2="0" stroke="#95A5A6" strokeWidth="1.5" />
    </g>
  );
}

// ─── NEW Handheld items ─────────────────────────────────────────────────────

export function MagicSword() {
  return (
    <g>
      <rect x="-2" y="-28" width="4" height="30" rx="1" fill="#BDC3C7" stroke="#95A5A6" strokeWidth="1" transform="rotate(-15)" />
      <polygon points="0,-32 -3,-28 3,-28" fill="#BDC3C7" stroke="#95A5A6" strokeWidth="0.8" transform="rotate(-15)" />
      <rect x="-8" y="0" width="16" height="4" rx="1.5" fill="#D4AC0D" stroke="#B8960C" strokeWidth="1" transform="rotate(-15)" />
      <rect x="-2.5" y="4" width="5" height="8" rx="2" fill="#8B6914" stroke="#6B5210" strokeWidth="1" transform="rotate(-15)" />
      <line x1="-1" y1="-24" x2="-1" y2="-6" stroke="#74B9FF" strokeWidth="1" opacity="0.6" transform="rotate(-15)" />
      <circle cx="2" cy="-20" r="1.5" fill="#74B9FF" opacity="0.7" transform="rotate(-15)" />
    </g>
  );
}

export function Bouquet() {
  return (
    <g>
      <rect x="-2" y="6" width="4" height="16" rx="2" fill="#27AE60" stroke="#1E8449" strokeWidth="1" />
      <circle cx="0" cy="-2" r="5" fill="#E74C3C" stroke="#C0392B" strokeWidth="0.8" />
      <circle cx="-7" cy="2" r="4.5" fill="#FF85A2" stroke="#E84393" strokeWidth="0.8" />
      <circle cx="7" cy="2" r="4.5" fill="#FFD700" stroke="#E6B800" strokeWidth="0.8" />
      <circle cx="-4" cy="-7" r="4" fill="#A29BFE" stroke="#6C5CE7" strokeWidth="0.8" />
      <circle cx="4" cy="-7" r="4" fill="#FF7675" stroke="#D63031" strokeWidth="0.8" />
      <circle cx="0" cy="-2" r="2" fill="#FFD700" />
      <circle cx="-7" cy="2" r="1.5" fill="white" />
      <circle cx="7" cy="2" r="1.5" fill="white" />
    </g>
  );
}

export function Lollipop() {
  return (
    <g>
      <rect x="-1.5" y="4" width="3" height="22" rx="1.5" fill="#F5CBA7" stroke="#D4A574" strokeWidth="1" />
      <circle cx="0" cy="-4" r="10" fill="#FF6B6B" stroke="#D63031" strokeWidth="1.5" />
      <path d="M-6,-8 Q0,-2 6,-8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M-8,-2 Q0,4 8,-2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="-3" cy="-7" r="1.5" fill="white" opacity="0.7" />
    </g>
  );
}

export function Paintbrush() {
  return (
    <g>
      <rect x="-2" y="-2" width="4" height="26" rx="1" fill="#D4A574" stroke="#A0855B" strokeWidth="1" transform="rotate(-20)" />
      <rect x="-2.5" y="18" width="5" height="6" rx="1" fill="#8B6914" stroke="#6B5210" strokeWidth="0.8" transform="rotate(-20)" />
      <ellipse cx="0" cy="-6" rx="5" ry="6" fill="#E74C3C" stroke="#C0392B" strokeWidth="1" transform="rotate(-20)" />
      <circle cx="-2" cy="-8" r="2" fill="#FFD700" opacity="0.6" transform="rotate(-20)" />
      <circle cx="2" cy="-4" r="1.5" fill="#3498DB" opacity="0.6" transform="rotate(-20)" />
    </g>
  );
}

export function Telescope() {
  return (
    <g>
      <rect x="-3" y="-14" width="6" height="30" rx="2" fill="#8B6914" stroke="#6B5210" strokeWidth="1.5" transform="rotate(-30)" />
      <ellipse cx="0" cy="-16" rx="5" ry="3" fill="#6B5210" stroke="#503C0D" strokeWidth="1" transform="rotate(-30)" />
      <ellipse cx="0" cy="-16" rx="3.5" ry="2" fill="#74B9FF" opacity="0.5" transform="rotate(-30)" />
      <rect x="-4" y="4" width="8" height="4" rx="1" fill="#A0855B" stroke="#8B6914" strokeWidth="0.8" transform="rotate(-30)" />
      <circle cx="1" cy="-16" r="1" fill="white" opacity="0.7" transform="rotate(-30)" />
    </g>
  );
}

export function Shield() {
  return (
    <g>
      <path d="M0,-18 L-16,-8 L-14,10 Q0,22 14,10 L16,-8 Z" fill="#3498DB" stroke="#2980B9" strokeWidth="2" />
      <path d="M0,-12 L-10,-4 L-8,8 Q0,16 8,8 L10,-4 Z" fill="#2980B9" />
      <polygon points="0,-8 2,-2 6,-2 3,1 4,6 0,3 -4,6 -3,1 -6,-2 -2,-2" fill="#FFD700" />
      <circle cx="0" cy="-14" r="2" fill="#FFD700" stroke="#E6B800" strokeWidth="0.5" />
    </g>
  );
}

// ─── NEW Background items ───────────────────────────────────────────────────

export function SpaceGalaxy() {
  return (
    <g>
      <circle cx="0" cy="0" r="92" fill="#0D0D2B" opacity="0.15" />
      <circle cx="-40" cy="-30" r="2" fill="white" opacity="0.8" />
      <circle cx="50" cy="-40" r="1.5" fill="white" opacity="0.7" />
      <circle cx="-60" cy="20" r="1.8" fill="white" opacity="0.6" />
      <circle cx="30" cy="50" r="1.5" fill="white" opacity="0.7" />
      <circle cx="-20" cy="-60" r="2" fill="white" opacity="0.8" />
      <circle cx="60" cy="10" r="1.2" fill="white" opacity="0.5" />
      <circle cx="-50" cy="50" r="1.5" fill="white" opacity="0.6" />
      <circle cx="20" cy="-20" r="10" fill="#6C5CE7" opacity="0.15" />
      <circle cx="-30" cy="30" r="8" fill="#E84393" opacity="0.12" />
      <ellipse cx="0" cy="0" rx="70" ry="20" fill="#A29BFE" opacity="0.06" transform="rotate(-30)" />
      <polygon points="0,-4 1,-1.3 4,-1.2 1.5,0.4 2.2,3 0,1.5 -2.2,3 -1.5,0.4 -4,-1.2 -1,-1.3" fill="#FFD700" opacity="0.8" transform="translate(40,-20)" />
      <polygon points="0,-3 0.8,-1 3,-0.9 1.2,0.3 1.7,2.3 0,1.2 -1.7,2.3 -1.2,0.3 -3,-0.9 -0.8,-1" fill="#FFD700" opacity="0.7" transform="translate(-55,-10)" />
    </g>
  );
}

export function UnderwaterOcean() {
  return (
    <g>
      <circle cx="0" cy="0" r="92" fill="#0984E3" opacity="0.1" />
      <path d="M-80,60 Q-60,52 -40,60 Q-20,68 0,60 Q20,52 40,60 Q60,68 80,60" stroke="#74B9FF" strokeWidth="2" fill="none" opacity="0.3" />
      <path d="M-80,70 Q-60,62 -40,70 Q-20,78 0,70 Q20,62 40,70 Q60,78 80,70" stroke="#74B9FF" strokeWidth="1.5" fill="none" opacity="0.2" />
      <circle cx="-40" cy="40" r="3" fill="#74B9FF" opacity="0.4" />
      <circle cx="-36" cy="32" r="2" fill="#74B9FF" opacity="0.3" />
      <circle cx="-42" cy="26" r="1.5" fill="#74B9FF" opacity="0.25" />
      <g transform="translate(40,50)">
        <rect x="-1" y="0" width="2" height="8" rx="1" fill="#27AE60" opacity="0.5" />
        <path d="M-4,-4 Q0,-8 4,-4 Q0,0 -4,-4" fill="#2ECC71" opacity="0.4" />
      </g>
      <g transform="translate(-50,55)">
        <rect x="-1" y="0" width="2" height="6" rx="1" fill="#27AE60" opacity="0.4" />
        <path d="M-3,-3 Q0,-6 3,-3 Q0,0 -3,-3" fill="#2ECC71" opacity="0.35" />
      </g>
      <ellipse cx="50" cy="-30" rx="6" ry="4" fill="#FFEAA7" opacity="0.2" />
    </g>
  );
}

export function CandyLand() {
  return (
    <g>
      <circle cx="0" cy="0" r="92" fill="#FFEAA7" opacity="0.08" />
      <g transform="translate(-50,50)">
        <rect x="-3" y="-20" width="6" height="20" rx="3" fill="white" />
        <path d="M-3,-20 Q3,-26 3,-20" fill="#E74C3C" />
        <rect x="-3" y="-16" width="6" height="4" fill="#E74C3C" />
        <rect x="-3" y="-8" width="6" height="4" fill="#E74C3C" />
      </g>
      <g transform="translate(50,50)">
        <rect x="-3" y="-18" width="6" height="18" rx="3" fill="white" />
        <path d="M-3,-18 Q3,-24 3,-18" fill="#2ECC71" />
        <rect x="-3" y="-14" width="6" height="4" fill="#2ECC71" />
        <rect x="-3" y="-6" width="6" height="4" fill="#2ECC71" />
      </g>
      <circle cx="-20" cy="-40" r="6" fill="#FF6B6B" opacity="0.3" />
      <circle cx="30" cy="-30" r="5" fill="#A29BFE" opacity="0.3" />
      <circle cx="0" cy="30" r="4" fill="#FFEAA7" opacity="0.4" />
      <circle cx="-40" cy="0" r="3.5" fill="#74B9FF" opacity="0.3" />
      <circle cx="50" cy="10" r="4" fill="#FF85A2" opacity="0.3" />
    </g>
  );
}

export function SnowyMountain() {
  return (
    <g>
      <circle cx="0" cy="0" r="92" fill="#DFE6E9" opacity="0.1" />
      <polygon points="-70,70 -30,-20 10,70" fill="#636E72" opacity="0.2" />
      <polygon points="-30,-20 -40,0 -20,0" fill="white" opacity="0.3" />
      <polygon points="-10,70 30,-30 70,70" fill="#636E72" opacity="0.25" />
      <polygon points="30,-30 20,-10 40,-10" fill="white" opacity="0.35" />
      <circle cx="-50" cy="-20" r="2" fill="white" opacity="0.5" />
      <circle cx="-30" cy="10" r="1.5" fill="white" opacity="0.4" />
      <circle cx="10" cy="-10" r="2" fill="white" opacity="0.45" />
      <circle cx="40" cy="20" r="1.5" fill="white" opacity="0.4" />
      <circle cx="60" cy="-15" r="1" fill="white" opacity="0.35" />
      <circle cx="-20" cy="40" r="1.8" fill="white" opacity="0.4" />
    </g>
  );
}

export function RainbowSky() {
  return (
    <g>
      <circle cx="0" cy="0" r="92" fill="#FFEAA7" opacity="0.06" />
      <path d="M-70,40 Q0,-30 70,40" stroke="#E74C3C" strokeWidth="3" fill="none" opacity="0.25" />
      <path d="M-65,40 Q0,-24 65,40" stroke="#F39C12" strokeWidth="3" fill="none" opacity="0.25" />
      <path d="M-60,40 Q0,-18 60,40" stroke="#F1C40F" strokeWidth="3" fill="none" opacity="0.25" />
      <path d="M-55,40 Q0,-12 55,40" stroke="#2ECC71" strokeWidth="3" fill="none" opacity="0.25" />
      <path d="M-50,40 Q0,-6 50,40" stroke="#3498DB" strokeWidth="3" fill="none" opacity="0.25" />
      <path d="M-45,40 Q0,0 45,40" stroke="#9B59B6" strokeWidth="3" fill="none" opacity="0.25" />
      <ellipse cx="-40" cy="50" rx="18" ry="8" fill="white" opacity="0.2" />
      <ellipse cx="40" cy="50" rx="16" ry="7" fill="white" opacity="0.18" />
      <circle cx="60" cy="-50" r="12" fill="#F1C40F" opacity="0.15" />
    </g>
  );
}

export function VolcanoIsland() {
  return (
    <g>
      <circle cx="0" cy="0" r="92" fill="#E17055" opacity="0.06" />
      <polygon points="-40,70 0,-10 40,70" fill="#636E72" opacity="0.25" />
      <polygon points="-10,-10 0,-30 10,-10" fill="#D63031" opacity="0.3" />
      <circle cx="-4" cy="-24" r="3" fill="#E74C3C" opacity="0.5" />
      <circle cx="3" cy="-28" r="2" fill="#F39C12" opacity="0.4" />
      <circle cx="0" cy="-20" r="2.5" fill="#F39C12" opacity="0.45" />
      <ellipse cx="0" cy="70" rx="60" ry="12" fill="#27AE60" opacity="0.2" />
      <path d="M-80,75 Q-60,68 -40,75 Q-20,82 0,75 Q20,68 40,75 Q60,82 80,75" stroke="#0984E3" strokeWidth="2" fill="none" opacity="0.2" />
    </g>
  );
}

// ─── NEW Accessory items ────────────────────────────────────────────────────

export function BowTie() {
  return (
    <g>
      <polygon points="-12,-6 0,0 -12,6" fill="#E74C3C" stroke="#C0392B" strokeWidth="1" />
      <polygon points="12,-6 0,0 12,6" fill="#E74C3C" stroke="#C0392B" strokeWidth="1" />
      <circle cx="0" cy="0" r="3" fill="#C0392B" stroke="#A93226" strokeWidth="0.8" />
    </g>
  );
}

export function Scarf() {
  return (
    <g>
      <path d="M-16,-4 Q0,-8 16,-4 Q18,0 16,4 Q0,0 -16,4 Q-18,0 -16,-4 Z" fill="#3498DB" stroke="#2980B9" strokeWidth="1.5" />
      <rect x="12" y="2" width="6" height="18" rx="2" fill="#3498DB" stroke="#2980B9" strokeWidth="1" />
      <line x1="12" y1="8" x2="18" y2="8" stroke="#2980B9" strokeWidth="1" />
      <line x1="12" y1="14" x2="18" y2="14" stroke="#2980B9" strokeWidth="1" />
      <rect x="12" y="18" width="6" height="3" rx="1" fill="#2980B9" />
    </g>
  );
}

export function Backpack() {
  return (
    <g>
      <rect x="-12" y="-14" width="24" height="28" rx="5" fill="#E74C3C" stroke="#C0392B" strokeWidth="2" />
      <rect x="-8" y="-6" width="16" height="10" rx="3" fill="#C0392B" stroke="#A93226" strokeWidth="1" />
      <ellipse cx="0" cy="-6" rx="4" ry="2" fill="#D4AC0D" />
      <path d="M-12,-6 Q-16,-6 -16,-10 Q-16,-14 -12,-14" stroke="#C0392B" strokeWidth="2" fill="none" />
      <path d="M12,-6 Q16,-6 16,-10 Q16,-14 12,-14" stroke="#C0392B" strokeWidth="2" fill="none" />
    </g>
  );
}

export function Wings() {
  return (
    <g opacity="0.8">
      {/* Left wing */}
      <path d="M-4,-4 Q-30,-20 -34,-4 Q-30,4 -20,8 Q-12,4 -4,0 Z" fill="#DFE6E9" stroke="#BDC3C7" strokeWidth="1" />
      <path d="M-4,-2 Q-24,-14 -28,-2 Q-24,4 -16,6 Q-10,3 -4,0 Z" fill="white" stroke="#BDC3C7" strokeWidth="0.5" />
      {/* Right wing */}
      <path d="M4,-4 Q30,-20 34,-4 Q30,4 20,8 Q12,4 4,0 Z" fill="#DFE6E9" stroke="#BDC3C7" strokeWidth="1" />
      <path d="M4,-2 Q24,-14 28,-2 Q24,4 16,6 Q10,3 4,0 Z" fill="white" stroke="#BDC3C7" strokeWidth="0.5" />
    </g>
  );
}

export function Necklace() {
  return (
    <g>
      <path d="M-14,-6 Q-14,8 0,12 Q14,8 14,-6" stroke="#D4AC0D" strokeWidth="2" fill="none" />
      <circle cx="0" cy="12" r="4" fill="#E74C3C" stroke="#C0392B" strokeWidth="1" />
      <polygon points="0,8 2,12 -2,12" fill="#D4AC0D" />
      <circle cx="0" cy="12" r="1.5" fill="#FF6B6B" opacity="0.7" />
    </g>
  );
}

export function TailBow() {
  return (
    <g>
      <polygon points="-10,-5 0,0 -10,5" fill="#FF85A2" stroke="#E84393" strokeWidth="1" />
      <polygon points="10,-5 0,0 10,5" fill="#FF85A2" stroke="#E84393" strokeWidth="1" />
      <circle cx="0" cy="0" r="2.5" fill="#E84393" stroke="#B83280" strokeWidth="0.8" />
      <rect x="-1.5" y="2" width="3" height="10" rx="1" fill="#FF85A2" stroke="#E84393" strokeWidth="0.8" />
      <rect x="-1.5" y="2" width="3" height="10" rx="1" fill="#E84393" stroke="#B83280" strokeWidth="0.8" transform="rotate(15)" />
    </g>
  );
}

// ─── Item name → component lookup ────────────────────────────────────────────

const ITEM_RENDERERS: Record<string, () => JSX.Element> = {
  // Existing items
  'Party Hat': PartyHat,
  'Wizard Hat': WizardHat,
  'Rainbow Cape': RainbowCape,
  'Space Suit': SpaceSuit,
  'Star Glasses': StarGlasses,
  'Enchanted Forest': EnchantedForest,
  'Golden Wand': GoldenWand,
  'Champion Medal': ChampionMedal,
  // New head items
  'Crown': Crown,
  'Pirate Hat': PirateHat,
  'Viking Helmet': VikingHelmet,
  'Flower Crown': FlowerCrown,
  'Top Hat': TopHat,
  'Baseball Cap': BaseballCap,
  'Chef Hat': ChefHat,
  'Santa Hat': SantaHat,
  'Tiara': Tiara,
  'Unicorn Horn': UnicornHorn,
  // New body items
  'Knight Armour': KnightArmour,
  'Superhero Cape': SuperheroCape,
  'Hawaiian Shirt': HawaiianShirt,
  'Lab Coat': LabCoat,
  'Princess Dress': PrincessDress,
  'Ninja Outfit': NinjaOutfit,
  'Football Kit': FootballKit,
  'Scuba Suit': ScubaSuit,
  // New eyes items
  'Heart Glasses': HeartGlasses,
  'Monocle': Monocle,
  '3D Glasses': ThreeDGlasses,
  'Aviator Goggles': AviatorGoggles,
  'Pixel Sunglasses': PixelSunglasses,
  'Round Specs': RoundSpecs,
  'Cat Eye Glasses': CatEyeGlasses,
  'Eye Patch': EyePatch,
  // New feet items
  'Roller Skates': RollerSkates,
  'Flippers': Flippers,
  'Cowboy Boots': CowboyBoots,
  'Bunny Slippers': BunnySlippers,
  'Trainers': Trainers,
  'Moon Boots': MoonBoots,
  // New handheld items
  'Magic Sword': MagicSword,
  'Bouquet': Bouquet,
  'Lollipop': Lollipop,
  'Paintbrush': Paintbrush,
  'Telescope': Telescope,
  'Shield': Shield,
  // New background items
  'Space Galaxy': SpaceGalaxy,
  'Underwater Ocean': UnderwaterOcean,
  'Candy Land': CandyLand,
  'Snowy Mountain': SnowyMountain,
  'Rainbow Sky': RainbowSky,
  'Volcano Island': VolcanoIsland,
  // New accessory items
  'Bow Tie': BowTie,
  'Scarf': Scarf,
  'Backpack': Backpack,
  'Wings': Wings,
  'Necklace': Necklace,
  'Tail Bow': TailBow,
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
