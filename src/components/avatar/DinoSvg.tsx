import type { DinoType, DinoColor, AvatarLoadout } from "./types";
import { DINO_COLOR_PALETTES, type DinoColorPalette } from "./dinoColorPalette";

export const SLOT_POSITIONS = {
  head:       { x: 100, y: 15,  width: 100, height: 60  },
  body:       { x: 100, y: 148, width: 120, height: 80  },
  eyes:       { x: 100, y: 62,  width: 80,  height: 40  },
  feet:       { x: 100, y: 200, width: 120, height: 30  },
  handheld:   { x: 170, y: 155, width: 50,  height: 50  },
  background: { x: 100, y: 110, width: 200, height: 220 },
  accessory:  { x: 100, y: 110, width: 200, height: 220 },
} as const;

interface DinoSvgProps {
  dinoType?: DinoType;
  dinoColor?: DinoColor;
  loadout?: AvatarLoadout;
  showBackground?: boolean;
  width?: number;
  height?: number;
}

// ─── Dino-type head feature variants ────────────────────────────────────────

function TRexFeatures({ p }: { p: DinoColorPalette }) {
  return (
    <>
      {/* Three classic triangular dorsal spines */}
      <path d="M 72 35 Q 68 18 75 14 Q 82 10 82 28" fill={p.spine} stroke={p.dark} strokeWidth={1} />
      <path d="M 97 26 Q 95 8 102 5 Q 109 2 108 22" fill={p.spine} stroke={p.dark} strokeWidth={1} />
      <path d="M 120 32 Q 120 15 126 13 Q 132 11 130 28" fill={p.spine} stroke={p.dark} strokeWidth={1} />
    </>
  );
}

function TriceratopsFeatures({ p }: { p: DinoColorPalette }) {
  return (
    <>
      {/* Neck frill — wide fan behind the head */}
      <ellipse cx="100" cy="58" rx="54" ry="38" fill={p.light} stroke={p.dark} strokeWidth={1} opacity={0.8} />
      <ellipse cx="100" cy="58" rx="44" ry="30" fill={p.main} stroke="none" />
      {/* Frill scallop details */}
      <circle cx="56"  cy="36" r="6" fill={p.belly} stroke={p.dark} strokeWidth={0.8} opacity={0.8} />
      <circle cx="72"  cy="24" r="7" fill={p.belly} stroke={p.dark} strokeWidth={0.8} opacity={0.8} />
      <circle cx="91"  cy="20" r="7" fill={p.belly} stroke={p.dark} strokeWidth={0.8} opacity={0.8} />
      <circle cx="109" cy="20" r="7" fill={p.belly} stroke={p.dark} strokeWidth={0.8} opacity={0.8} />
      <circle cx="128" cy="24" r="7" fill={p.belly} stroke={p.dark} strokeWidth={0.8} opacity={0.8} />
      <circle cx="144" cy="36" r="6" fill={p.belly} stroke={p.dark} strokeWidth={0.8} opacity={0.8} />
      {/* Central nose horn */}
      <path d="M 96 52 Q 100 28 104 52" fill={p.spine} stroke={p.dark} strokeWidth={1} strokeLinejoin="round" />
      {/* Left brow horn */}
      <path d="M 78 55 Q 70 38 76 55" fill={p.spine} stroke={p.dark} strokeWidth={1} strokeLinejoin="round" />
      {/* Right brow horn */}
      <path d="M 122 55 Q 130 38 124 55" fill={p.spine} stroke={p.dark} strokeWidth={1} strokeLinejoin="round" />
    </>
  );
}

function StegosaurusFeatures({ p }: { p: DinoColorPalette }) {
  return (
    <>
      {/* Large diamond plates rising from head/neck */}
      <path d="M 70 42 Q 64 20 72 12 Q 80 4 80 30" fill={p.spine} stroke={p.dark} strokeWidth={1.2} />
      <path d="M 92 30 Q 88 6 98 2 Q 108 -2 106 24" fill={p.spine} stroke={p.dark} strokeWidth={1.2} />
      <path d="M 116 36 Q 114 14 122 10 Q 130 6 128 30" fill={p.spine} stroke={p.dark} strokeWidth={1.2} />
      {/* Highlight on largest plate */}
      <path d="M 96 10 Q 99 4 102 10" stroke={p.light} strokeWidth={1} fill="none" opacity={0.6} />
    </>
  );
}

function BrachiosaurusFeatures({ p }: { p: DinoColorPalette }) {
  return (
    <>
      {/* Small rounded bumps along top of head — very gentle dino */}
      <ellipse cx="80"  cy="34" rx="7" ry="5" fill={p.light} stroke={p.dark} strokeWidth={0.8} />
      <ellipse cx="100" cy="28" rx="8" ry="6" fill={p.light} stroke={p.dark} strokeWidth={0.8} />
      <ellipse cx="120" cy="34" rx="7" ry="5" fill={p.light} stroke={p.dark} strokeWidth={0.8} />
      {/* Gentle nostril ridge — brachiosaurus had elevated nostrils */}
      <ellipse cx="100" cy="32" rx="10" ry="4" fill={p.main} stroke={p.dark} strokeWidth={0.8} opacity={0.6} />
    </>
  );
}

function RaptorFeatures({ p }: { p: DinoColorPalette }) {
  return (
    <>
      {/* Single swept-back cranial crest */}
      <path d="M 108 38 Q 118 20 138 16 Q 148 14 144 26 Q 134 28 122 40" fill={p.spine} stroke={p.dark} strokeWidth={1} strokeLinejoin="round" />
      {/* Crest highlight */}
      <path d="M 112 36 Q 122 22 136 20" stroke={p.light} strokeWidth={1} fill="none" opacity={0.6} strokeLinecap="round" />
      {/* Feather-like fringe detail on crest */}
      <path d="M 124 28 L 128 22 M 130 25 L 135 19 M 136 23 L 140 18" stroke={p.dark} strokeWidth={0.8} fill="none" opacity={0.5} strokeLinecap="round" />
    </>
  );
}

function AnkylosaurusFeatures({ p }: { p: DinoColorPalette }) {
  return (
    <>
      {/* Armoured head scutes — rows of rounded studs */}
      <circle cx="78"  cy="42" r="5.5" fill={p.spine} stroke={p.dark} strokeWidth={0.8} />
      <circle cx="93"  cy="34" r="6"   fill={p.spine} stroke={p.dark} strokeWidth={0.8} />
      <circle cx="109" cy="34" r="6"   fill={p.spine} stroke={p.dark} strokeWidth={0.8} />
      <circle cx="124" cy="42" r="5.5" fill={p.spine} stroke={p.dark} strokeWidth={0.8} />
      <circle cx="100" cy="28" r="5.5" fill={p.spine} stroke={p.dark} strokeWidth={0.8} />
      {/* Stud highlights */}
      <circle cx="93"  cy="32" r="2"   fill={p.light} opacity={0.5} />
      <circle cx="109" cy="32" r="2"   fill={p.light} opacity={0.5} />
      <circle cx="100" cy="26" r="2"   fill={p.light} opacity={0.5} />
    </>
  );
}

function DiplodocusFeatures({ p }: { p: DinoColorPalette }) {
  return (
    <>
      {/* Small rounded head bumps — diplodocus had a very small, flat head */}
      <ellipse cx="100" cy="34" rx="12" ry="4" fill={p.light} stroke={p.dark} strokeWidth={0.8} opacity={0.7} />
      {/* Two tiny rounded nubs */}
      <ellipse cx="90"  cy="30" rx="5"  ry="4" fill={p.light} stroke={p.dark} strokeWidth={0.8} />
      <ellipse cx="110" cy="30" rx="5"  ry="4" fill={p.light} stroke={p.dark} strokeWidth={0.8} />
    </>
  );
}

function SpinosaurusFeatures({ p }: { p: DinoColorPalette }) {
  return (
    <>
      {/* Large neural spine sail — the iconic feature */}
      <path d="M 72 38 Q 66 10 78 4 Q 84 1 84 26" fill={p.spine} stroke={p.dark} strokeWidth={1.2} />
      <path d="M 93 26 Q 91 2 100 -2 Q 109 -4 107 22" fill={p.spine} stroke={p.dark} strokeWidth={1.2} />
      <path d="M 116 30 Q 116 6 124 2 Q 132 -1 130 24" fill={p.spine} stroke={p.dark} strokeWidth={1.2} />
      {/* Sail membrane webbing between spines */}
      <path d="M 84 18 Q 92 10 107 14" stroke={p.light} strokeWidth={1.5} fill="none" opacity={0.5} strokeLinecap="round" />
      <path d="M 84 10 Q 93 4 107 8" stroke={p.light} strokeWidth={1} fill="none" opacity={0.4} strokeLinecap="round" />
      {/* Sail vein-like details */}
      <path d="M 78 20 L 84 6 M 100 16 L 100 2 M 122 20 L 126 6" stroke={p.dark} strokeWidth={0.6} fill="none" opacity={0.4} strokeLinecap="round" />
    </>
  );
}

function PterodactylFeatures({ p }: { p: DinoColorPalette }) {
  return (
    <>
      {/* Distinctive tall cranial crest — pterodactyl's most recognisable trait */}
      <path d="M 100 56 Q 96 38 100 20 Q 104 6 116 8 Q 126 10 120 24 Q 110 28 104 44" fill={p.spine} stroke={p.dark} strokeWidth={1} strokeLinejoin="round" />
      {/* Crest highlight streak */}
      <path d="M 102 48 Q 100 34 103 22 Q 106 12 113 12" stroke={p.light} strokeWidth={1} fill="none" opacity={0.6} strokeLinecap="round" />
      {/* Beak-like snout extension hint */}
      <ellipse cx="100" cy="82" rx="14" ry="6" fill={p.main} stroke={p.dark} strokeWidth={1} />
    </>
  );
}

function ParasaurolophusFeatures({ p }: { p: DinoColorPalette }) {
  return (
    <>
      {/* Long curved hollow tube crest sweeping rearward */}
      <path d="M 108 54 Q 124 40 146 28 Q 162 18 166 26 Q 168 34 152 38 Q 136 44 120 52" fill={p.spine} stroke={p.dark} strokeWidth={1.2} strokeLinejoin="round" />
      {/* Inner tube highlight — suggests hollow resonating chamber */}
      <path d="M 112 52 Q 128 38 148 28 Q 160 22 162 28" stroke={p.light} strokeWidth={1.5} fill="none" opacity={0.55} strokeLinecap="round" />
      {/* Tube tip detail */}
      <ellipse cx="165" cy="28" rx="5" ry="4" fill={p.spine} stroke={p.dark} strokeWidth={0.8} />
      {/* Small secondary ridge at base of crest */}
      <path d="M 106 58 Q 114 50 120 52" stroke={p.dark} strokeWidth={0.8} fill="none" opacity={0.4} strokeLinecap="round" />
    </>
  );
}

function DinoTypeFeatures({ dinoType, palette }: { dinoType: DinoType; palette: DinoColorPalette }) {
  switch (dinoType) {
    case "trex":           return <TRexFeatures p={palette} />;
    case "triceratops":    return <TriceratopsFeatures p={palette} />;
    case "stegosaurus":    return <StegosaurusFeatures p={palette} />;
    case "brachiosaurus":  return <BrachiosaurusFeatures p={palette} />;
    case "raptor":         return <RaptorFeatures p={palette} />;
    case "ankylosaurus":   return <AnkylosaurusFeatures p={palette} />;
    case "diplodocus":     return <DiplodocusFeatures p={palette} />;
    case "spinosaurus":    return <SpinosaurusFeatures p={palette} />;
    case "pterodactyl":    return <PterodactylFeatures p={palette} />;
    case "parasaurolophus":return <ParasaurolophusFeatures p={palette} />;
    default:               return <TRexFeatures p={palette} />;
  }
}

// ─── Body extras for certain types ───────────────────────────────────────────

function AnkylosaurusBodyStuds({ p }: { p: DinoColorPalette }) {
  // Scattered armour studs on the body
  return (
    <>
      <circle cx="80"  cy="142" r="4"   fill={p.spine} stroke={p.dark} strokeWidth={0.7} opacity={0.8} />
      <circle cx="100" cy="138" r="4.5" fill={p.spine} stroke={p.dark} strokeWidth={0.7} opacity={0.8} />
      <circle cx="120" cy="142" r="4"   fill={p.spine} stroke={p.dark} strokeWidth={0.7} opacity={0.8} />
      <circle cx="90"  cy="155" r="3.5" fill={p.spine} stroke={p.dark} strokeWidth={0.7} opacity={0.8} />
      <circle cx="110" cy="155" r="3.5" fill={p.spine} stroke={p.dark} strokeWidth={0.7} opacity={0.8} />
      {/* Stud highlights */}
      <circle cx="80"  cy="140" r="1.5" fill={p.light} opacity={0.5} />
      <circle cx="100" cy="136" r="1.8" fill={p.light} opacity={0.5} />
      <circle cx="120" cy="140" r="1.5" fill={p.light} opacity={0.5} />
    </>
  );
}

function PterodactylWings({ p }: { p: DinoColorPalette }) {
  // Wing-like arm extensions replacing the small arms
  return (
    <>
      {/* Left wing membrane */}
      <path d="M 52 138 Q 20 120 14 145 Q 10 162 36 165 Q 50 165 54 152"
        fill={p.main} stroke={p.dark} strokeWidth={1.2} strokeLinejoin="round" opacity={0.9} />
      {/* Left wing interior highlight */}
      <path d="M 50 142 Q 24 128 20 148 Q 18 160 38 162"
        fill={p.light} opacity={0.25} stroke="none" />
      {/* Right wing membrane */}
      <path d="M 148 138 Q 180 120 186 145 Q 190 162 164 165 Q 150 165 146 152"
        fill={p.main} stroke={p.dark} strokeWidth={1.2} strokeLinejoin="round" opacity={0.9} />
      {/* Right wing interior highlight */}
      <path d="M 150 142 Q 176 128 180 148 Q 182 160 162 162"
        fill={p.light} opacity={0.25} stroke="none" />
      {/* Wing membrane vein details */}
      <path d="M 52 142 Q 34 136 22 148" stroke={p.dark} strokeWidth={0.7} fill="none" opacity={0.35} strokeLinecap="round" />
      <path d="M 148 142 Q 166 136 178 148" stroke={p.dark} strokeWidth={0.7} fill="none" opacity={0.35} strokeLinecap="round" />
    </>
  );
}

// ─── Main SVG component ───────────────────────────────────────────────────────

export function DinoSvg({
  dinoType = "trex",
  dinoColor = "green",
  loadout = {},
  showBackground = true,
  width = 120,
  height = 120,
}: DinoSvgProps) {
  const p = DINO_COLOR_PALETTES[dinoColor] ?? DINO_COLOR_PALETTES.green;
  const isPterodactyl = dinoType === "pterodactyl";

  return (
    <svg
      viewBox="0 0 200 220"
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <defs>
        {/* Radial gradient for body depth */}
        <radialGradient id={`bodyGrad-${dinoColor}`} cx="40%" cy="35%" r="60%">
          <stop offset="0%"   stopColor={p.light} stopOpacity={0.6} />
          <stop offset="100%" stopColor={p.main}  stopOpacity={0}   />
        </radialGradient>
        {/* Drop shadow filter */}
        <filter id={`shadow-${dinoColor}`} x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor={p.dark} floodOpacity={0.25} />
        </filter>
        {/* Soft inner glow for eyes */}
        <radialGradient id={`eyeGrad-${dinoColor}`} cx="35%" cy="30%" r="65%">
          <stop offset="0%"   stopColor={p.light} stopOpacity={0.8} />
          <stop offset="100%" stopColor={p.eye}   stopOpacity={1}   />
        </radialGradient>
      </defs>

      {/* ── Layer 1: Background circle ── */}
      {showBackground && (
        <circle cx={100} cy={110} r={95} fill={p.bgCircle} />
      )}

      {/* ── Layer 2: Tail ── */}
      <path
        d="M 130 160 Q 165 155 170 135 Q 175 115 155 108"
        fill={p.main}
        stroke={p.dark}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Tail highlight stripe */}
      <path
        d="M 133 157 Q 162 150 166 134 Q 170 120 156 112"
        fill="none"
        stroke={p.light}
        strokeWidth={1}
        strokeLinecap="round"
        opacity={0.45}
      />

      {/* ── Layer 3: Body ── */}
      <ellipse
        cx={100} cy={148} rx={58} ry={52}
        fill={p.main}
        stroke={p.dark}
        strokeWidth={1.5}
        filter={`url(#shadow-${dinoColor})`}
      />
      {/* Body radial highlight overlay */}
      <ellipse
        cx={100} cy={148} rx={58} ry={52}
        fill={`url(#bodyGrad-${dinoColor})`}
      />

      {/* ── Layer 4: Belly highlight ── */}
      <ellipse cx={100} cy={155} rx={36} ry={38} fill={p.belly} />
      {/* Belly sheen */}
      <ellipse cx={96} cy={142} rx={20} ry={22} fill="white" opacity={0.07} />

      {/* ── Layer 5: Body texture spots ── */}
      <circle cx={82}  cy={138} r={5}   fill={p.dark} opacity={0.15} />
      <circle cx={108} cy={132} r={4}   fill={p.dark} opacity={0.12} />
      <circle cx={94}  cy={155} r={3.5} fill={p.dark} opacity={0.10} />

      {/* ── Ankylosaurus body studs (before legs so legs overlap) ── */}
      {dinoType === "ankylosaurus" && <AnkylosaurusBodyStuds p={p} />}

      {/* ── Layer 6: Left leg ── */}
      <path
        d="M 62 185 Q 55 200 50 208 Q 62 210 68 205 Q 73 197 72 186"
        fill={p.main}
        stroke={p.dark}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Left leg highlight */}
      <path
        d="M 64 186 Q 58 200 54 207"
        fill="none"
        stroke={p.light}
        strokeWidth={1}
        strokeLinecap="round"
        opacity={0.4}
      />

      {/* ── Layer 7: Right leg ── */}
      <path
        d="M 138 185 Q 145 200 150 208 Q 138 210 132 205 Q 127 197 128 186"
        fill={p.main}
        stroke={p.dark}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Right leg highlight */}
      <path
        d="M 136 186 Q 142 200 146 207"
        fill="none"
        stroke={p.light}
        strokeWidth={1}
        strokeLinecap="round"
        opacity={0.4}
      />

      {/* ── Layer 8 & 9: Arms — replaced by wings for pterodactyl ── */}
      {isPterodactyl ? (
        <PterodactylWings p={p} />
      ) : (
        <>
          {/* Left arm */}
          <path
            d="M 50 142 Q 36 148 34 158 Q 36 166 44 163 Q 52 158 53 149"
            fill={p.main}
            stroke={p.dark}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          {/* Left arm highlight */}
          <path
            d="M 50 144 Q 40 150 38 158"
            fill="none"
            stroke={p.light}
            strokeWidth={1}
            strokeLinecap="round"
            opacity={0.4}
          />
          {/* Right arm */}
          <path
            d="M 150 142 Q 164 148 166 158 Q 164 166 156 163 Q 148 158 147 149"
            fill={p.main}
            stroke={p.dark}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          {/* Right arm highlight */}
          <path
            d="M 150 144 Q 160 150 162 158"
            fill="none"
            stroke={p.light}
            strokeWidth={1}
            strokeLinecap="round"
            opacity={0.4}
          />
        </>
      )}

      {/* ── Layer 10: Neck ── */}
      <ellipse
        cx={100} cy={100}
        rx={dinoType === "brachiosaurus" || dinoType === "diplodocus" ? 26 : 28}
        ry={dinoType === "brachiosaurus" || dinoType === "diplodocus" ? 26 : 22}
        fill={p.main}
        stroke={p.dark}
        strokeWidth={1.5}
      />

      {/* ── Layer 11: Head ── */}
      <ellipse
        cx={100} cy={68} rx={46} ry={42}
        fill={p.main}
        stroke={p.dark}
        strokeWidth={1.5}
        filter={`url(#shadow-${dinoColor})`}
      />

      {/* ── Layer 12: Head top highlight ── */}
      <ellipse cx={100} cy={52} rx={32} ry={20} fill={p.light} opacity={0.35} />
      {/* Secondary specular gleam */}
      <ellipse cx={90} cy={46} rx={12} ry={7} fill="white" opacity={0.12} />

      {/* ── Layer 13: Dino-type head features (spines, horns, crests, etc.) ── */}
      <DinoTypeFeatures dinoType={dinoType} palette={p} />

      {/* ── Layer 14 & 15: Eye whites ── */}
      <ellipse cx={78}  cy={62} rx={16} ry={17} fill="white" stroke={p.dark} strokeWidth={1.5} />
      <ellipse cx={122} cy={62} rx={16} ry={17} fill="white" stroke={p.dark} strokeWidth={1.5} />

      {/* ── Layer 16 & 17: Irises ── */}
      <ellipse cx={80}  cy={63} rx={11} ry={12} fill={`url(#eyeGrad-${dinoColor})`} />
      <ellipse cx={124} cy={63} rx={11} ry={12} fill={`url(#eyeGrad-${dinoColor})`} />

      {/* ── Layer 18 & 19: Pupils ── */}
      <ellipse cx={81}  cy={64} rx={6} ry={7} fill="#1a1a1a" />
      <ellipse cx={125} cy={64} rx={6} ry={7} fill="#1a1a1a" />
      {/* Tiny deep-black pupil centre for depth */}
      <ellipse cx={81}  cy={65} rx={3} ry={3.5} fill="#000" />
      <ellipse cx={125} cy={65} rx={3} ry={3.5} fill="#000" />

      {/* ── Layer 20: Eye highlights ── */}
      <circle cx={76}  cy={59} r={3.5} fill="white" />
      <circle cx={120} cy={59} r={3.5} fill="white" />
      <circle cx={78}  cy={62} r={1.5} fill="white" opacity={0.7} />
      <circle cx={122} cy={62} r={1.5} fill="white" opacity={0.7} />

      {/* ── Layer 21: Nostrils ── */}
      <ellipse cx={92}  cy={76} rx={3.5} ry={2.5} fill={p.dark} opacity={0.3} />
      <ellipse cx={108} cy={76} rx={3.5} ry={2.5} fill={p.dark} opacity={0.3} />

      {/* ── Layer 22: Smile ── */}
      <path
        d="M 80 84 Q 100 96 120 84"
        stroke={p.dark}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        opacity={0.6}
      />
      {/* Mouth corner dimples */}
      <circle cx={80}  cy={84} r={2} fill={p.dark} opacity={0.2} />
      <circle cx={120} cy={84} r={2} fill={p.dark} opacity={0.2} />

      {/* ── Layer 23: Cheek blushes ── */}
      <ellipse cx={60}  cy={75} rx={10} ry={7} fill="#FF6B6B" opacity={0.20} />
      <ellipse cx={140} cy={75} rx={10} ry={7} fill="#FF6B6B" opacity={0.20} />

      {/* ── Loadout item overlays ── */}
      {loadout && Object.entries(loadout).map(([slot, itemId]) => {
        if (!itemId) return null;
        const pos = SLOT_POSITIONS[slot as keyof typeof SLOT_POSITIONS];
        if (!pos) return null;
        // Placeholder rect — real items would render their own SVG/image here
        return (
          <rect
            key={slot}
            x={pos.x - pos.width / 2}
            y={pos.y - pos.height / 2}
            width={pos.width}
            height={pos.height}
            fill="none"
            stroke="rgba(255,255,0,0.4)"
            strokeWidth={1}
            strokeDasharray="4 2"
          />
        );
      })}
    </svg>
  );
}
