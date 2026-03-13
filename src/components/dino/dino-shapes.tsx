import type { DinoColors, DinoType } from './dino-types';

interface DinoBodyProps {
  type: DinoType;
  colors: DinoColors;
}

// ─── Individual dino renderers ───────────────────────────────────────────────

function TRex({ c }: { c: DinoColors }) {
  return (
    <g>
      {/* Chunky tail */}
      <path
        d="M38 130 Q22 118 12 108 Q8 114 14 122 Q24 132 38 140 Z"
        fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round"
      />
      {/* Big round body */}
      <ellipse cx="85" cy="128" rx="50" ry="46" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Round belly */}
      <ellipse cx="88" cy="138" rx="34" ry="30" fill={c.belly} stroke="none" />
      {/* Big chunky head */}
      <ellipse cx="140" cy="68" rx="38" ry="32" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Lower jaw - cute overbite */}
      <path
        d="M118 82 Q140 100 170 88 Q164 96 148 98 Q130 98 118 90 Z"
        fill={c.body} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round"
      />
      {/* Little teeth showing (overbite) */}
      <path d="M130 82 L130 88" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M140 84 L140 90" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M150 83 L150 89" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* Smile line */}
      <path d="M124 88 Q142 96 166 90" fill="none" stroke={c.outline} strokeWidth="2" strokeLinecap="round" />
      {/* Big kawaii eyes */}
      <circle cx="128" cy="58" r="14" fill="white" stroke={c.outline} strokeWidth="2.5" />
      <circle cx="132" cy="56" r="9" fill={c.eye} />
      <circle cx="136" cy="52" r="3.5" fill="white" />
      <circle cx="130" cy="60" r="1.5" fill="white" />
      <circle cx="156" cy="58" r="12" fill="white" stroke={c.outline} strokeWidth="2.5" />
      <circle cx="159" cy="56" r="7.5" fill={c.eye} />
      <circle cx="162" cy="53" r="3" fill="white" />
      <circle cx="157" cy="59" r="1.2" fill="white" />
      {/* Cute nostrils */}
      <circle cx="170" cy="68" r="2.5" fill={c.outline} />
      <circle cx="176" cy="68" r="2.5" fill={c.outline} />
      {/* Happy eyebrows */}
      <path d="M118 44 Q128 38 138 42" fill="none" stroke={c.outline} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M148 44 Q156 40 164 44" fill="none" stroke={c.outline} strokeWidth="2.5" strokeLinecap="round" />
      {/* Tiny adorable arms */}
      <path
        d="M110 110 Q100 102 96 96 Q102 98 108 106 Z"
        fill={c.body} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round"
      />
      <circle cx="95" cy="95" r="3" fill={c.body} stroke={c.outline} strokeWidth="1.5" />
      <path
        d="M116 114 Q108 106 104 100 Q110 102 114 110 Z"
        fill={c.body} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round"
      />
      <circle cx="103" cy="99" r="3" fill={c.body} stroke={c.outline} strokeWidth="1.5" />
      {/* Chunky left leg */}
      <path
        d="M62 166 Q56 178 52 190 Q60 192 66 184 Q70 192 78 190 Q74 178 70 166 Z"
        fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round"
      />
      <ellipse cx="64" cy="192" rx="14" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      {/* Chunky right leg */}
      <path
        d="M90 168 Q86 178 82 190 Q90 192 94 184 Q98 192 106 190 Q102 178 98 168 Z"
        fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round"
      />
      <ellipse cx="93" cy="192" rx="14" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      {/* Cheek blush */}
      <ellipse cx="168" cy="80" rx="6" ry="4" fill={c.belly} opacity="0.5" />
    </g>
  );
}

function Stegosaurus({ c }: { c: DinoColors }) {
  return (
    <g>
      {/* Tail with thagomizer spikes */}
      <path
        d="M30 140 Q16 132 8 126 Q14 136 28 146 Z"
        fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round"
      />
      {/* Thagomizer spikes */}
      <path d="M8 126 L2 114 Q6 118 10 124 Z" fill={c.belly} stroke={c.outline} strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 130 L4 120 Q10 124 14 132 Z" fill={c.belly} stroke={c.outline} strokeWidth="2" strokeLinejoin="round" />
      {/* Big round body */}
      <ellipse cx="90" cy="132" rx="62" ry="42" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Belly */}
      <ellipse cx="90" cy="142" rx="44" ry="26" fill={c.belly} stroke="none" />
      {/* Diamond-shaped plates on back - cute rounded */}
      <ellipse cx="48" cy="88" rx="8" ry="14" fill={c.belly} stroke={c.outline} strokeWidth="2.5" transform="rotate(-10 48 88)" />
      <ellipse cx="66" cy="78" rx="9" ry="16" fill={c.belly} stroke={c.outline} strokeWidth="2.5" transform="rotate(-5 66 78)" />
      <ellipse cx="86" cy="74" rx="10" ry="18" fill={c.belly} stroke={c.outline} strokeWidth="2.5" />
      <ellipse cx="106" cy="76" rx="10" ry="17" fill={c.belly} stroke={c.outline} strokeWidth="2.5" transform="rotate(5 106 76)" />
      <ellipse cx="124" cy="82" rx="9" ry="15" fill={c.belly} stroke={c.outline} strokeWidth="2.5" transform="rotate(10 124 82)" />
      {/* Cute round head */}
      <ellipse cx="160" cy="110" rx="24" ry="20" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Snout */}
      <ellipse cx="180" cy="116" rx="12" ry="10" fill={c.body} stroke={c.outline} strokeWidth="2.5" />
      {/* Big kawaii eye */}
      <circle cx="154" cy="104" r="10" fill="white" stroke={c.outline} strokeWidth="2.5" />
      <circle cx="157" cy="102" r="6" fill={c.eye} />
      <circle cx="160" cy="99" r="2.5" fill="white" />
      <circle cx="155" cy="105" r="1" fill="white" />
      {/* Smile */}
      <path d="M174 120 Q180 126 188 122" fill="none" stroke={c.outline} strokeWidth="2" strokeLinecap="round" />
      {/* Nostril */}
      <circle cx="188" cy="114" r="2" fill={c.outline} />
      {/* Cheek blush */}
      <ellipse cx="170" cy="122" rx="5" ry="3" fill={c.belly} opacity="0.5" />
      {/* Four stubby legs */}
      <ellipse cx="56" cy="174" rx="10" ry="16" fill={c.body} stroke={c.outline} strokeWidth="3" />
      <ellipse cx="56" cy="190" rx="12" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <ellipse cx="78" cy="174" rx="10" ry="16" fill={c.body} stroke={c.outline} strokeWidth="3" />
      <ellipse cx="78" cy="190" rx="12" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <ellipse cx="108" cy="174" rx="10" ry="16" fill={c.body} stroke={c.outline} strokeWidth="3" />
      <ellipse cx="108" cy="190" rx="12" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <ellipse cx="130" cy="174" rx="10" ry="16" fill={c.body} stroke={c.outline} strokeWidth="3" />
      <ellipse cx="130" cy="190" rx="12" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
    </g>
  );
}

function Triceratops({ c }: { c: DinoColors }) {
  return (
    <g>
      {/* Stubby tail */}
      <path
        d="M24 138 Q12 130 6 122 Q10 132 22 142 Z"
        fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round"
      />
      {/* Big round body */}
      <ellipse cx="80" cy="132" rx="58" ry="44" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Belly */}
      <ellipse cx="80" cy="142" rx="38" ry="28" fill={c.belly} stroke="none" />
      {/* Big round frill */}
      <circle cx="152" cy="72" r="36" fill={c.belly} stroke={c.outline} strokeWidth="3" />
      {/* Frill scallop details */}
      <circle cx="126" cy="52" r="6" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <circle cx="138" cy="40" r="6" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <circle cx="154" cy="36" r="6" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <circle cx="170" cy="40" r="6" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <circle cx="180" cy="52" r="6" fill={c.body} stroke={c.outline} strokeWidth="2" />
      {/* Round head in front of frill */}
      <ellipse cx="152" cy="92" rx="28" ry="24" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Beak-like snout */}
      <path
        d="M172 86 Q190 90 192 100 Q186 108 174 104 Z"
        fill={c.body} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round"
      />
      {/* Nose horn (cute and short) */}
      <ellipse cx="186" cy="88" rx="4" ry="8" fill={c.belly} stroke={c.outline} strokeWidth="2" transform="rotate(15 186 88)" />
      {/* Brow horns (stubby and cute) */}
      <ellipse cx="142" cy="72" rx="3" ry="10" fill={c.belly} stroke={c.outline} strokeWidth="2" transform="rotate(-10 142 72)" />
      <ellipse cx="162" cy="70" rx="3" ry="10" fill={c.belly} stroke={c.outline} strokeWidth="2" transform="rotate(10 162 70)" />
      {/* Big kawaii eyes */}
      <circle cx="142" cy="88" r="11" fill="white" stroke={c.outline} strokeWidth="2.5" />
      <circle cx="145" cy="86" r="7" fill={c.eye} />
      <circle cx="148" cy="83" r="2.8" fill="white" />
      <circle cx="143" cy="89" r="1" fill="white" />
      <circle cx="162" cy="88" r="9" fill="white" stroke={c.outline} strokeWidth="2.5" />
      <circle cx="164" cy="86" r="5.5" fill={c.eye} />
      <circle cx="166" cy="84" r="2.2" fill="white" />
      {/* Smile */}
      <path d="M174 102 Q182 108 190 104" fill="none" stroke={c.outline} strokeWidth="2" strokeLinecap="round" />
      {/* Nostril */}
      <circle cx="188" cy="96" r="2" fill={c.outline} />
      {/* Cheek blush */}
      <ellipse cx="172" cy="100" rx="5" ry="3" fill={c.belly} opacity="0.5" />
      {/* Four stubby legs */}
      <ellipse cx="46" cy="176" rx="12" ry="16" fill={c.body} stroke={c.outline} strokeWidth="3" />
      <ellipse cx="46" cy="192" rx="14" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <ellipse cx="72" cy="176" rx="12" ry="16" fill={c.body} stroke={c.outline} strokeWidth="3" />
      <ellipse cx="72" cy="192" rx="14" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <ellipse cx="100" cy="176" rx="12" ry="16" fill={c.body} stroke={c.outline} strokeWidth="3" />
      <ellipse cx="100" cy="192" rx="14" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <ellipse cx="120" cy="176" rx="12" ry="16" fill={c.body} stroke={c.outline} strokeWidth="3" />
      <ellipse cx="120" cy="192" rx="14" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
    </g>
  );
}

function Brachiosaurus({ c }: { c: DinoColors }) {
  return (
    <g>
      {/* Tail curving down */}
      <path
        d="M36 148 Q20 152 10 160 Q8 166 14 168 Q24 162 38 156 Z"
        fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round"
      />
      {/* Round body */}
      <ellipse cx="80" cy="142" rx="48" ry="38" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Belly */}
      <ellipse cx="80" cy="152" rx="32" ry="22" fill={c.belly} stroke="none" />
      {/* Long curving neck */}
      <path
        d="M102 112 Q118 80 130 50 Q136 30 140 18"
        stroke={c.body} strokeWidth="26" strokeLinecap="round" fill="none"
      />
      <path
        d="M102 112 Q118 80 130 50 Q136 30 140 18"
        stroke={c.outline} strokeWidth="3" strokeLinecap="round" fill="none"
      />
      {/* Neck belly stripe */}
      <path
        d="M108 112 Q122 82 134 50 Q138 34 142 22"
        stroke={c.belly} strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.6"
      />
      {/* Small cute head */}
      <ellipse cx="148" cy="18" rx="22" ry="16" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Gentle giant smile */}
      <path d="M156 24 Q162 30 170 26" fill="none" stroke={c.outline} strokeWidth="2" strokeLinecap="round" />
      {/* Big kawaii eye */}
      <circle cx="142" cy="12" r="9" fill="white" stroke={c.outline} strokeWidth="2.5" />
      <circle cx="145" cy="10" r="5.5" fill={c.eye} />
      <circle cx="148" cy="8" r="2.2" fill="white" />
      <circle cx="143" cy="13" r="1" fill="white" />
      {/* Nostril */}
      <circle cx="166" cy="16" r="2" fill={c.outline} />
      {/* Happy eyebrow */}
      <path d="M136 4 Q144 -2 152 4" fill="none" stroke={c.outline} strokeWidth="2.5" strokeLinecap="round" />
      {/* Cheek blush */}
      <ellipse cx="160" cy="22" rx="5" ry="3" fill={c.belly} opacity="0.5" />
      {/* Four tall pillar legs */}
      <ellipse cx="50" cy="176" rx="12" ry="20" fill={c.body} stroke={c.outline} strokeWidth="3" />
      <ellipse cx="50" cy="194" rx="14" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <ellipse cx="74" cy="176" rx="12" ry="20" fill={c.body} stroke={c.outline} strokeWidth="3" />
      <ellipse cx="74" cy="194" rx="14" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <ellipse cx="96" cy="176" rx="12" ry="20" fill={c.body} stroke={c.outline} strokeWidth="3" />
      <ellipse cx="96" cy="194" rx="14" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <ellipse cx="114" cy="176" rx="12" ry="20" fill={c.body} stroke={c.outline} strokeWidth="3" />
      <ellipse cx="114" cy="194" rx="14" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
    </g>
  );
}

function Raptor({ c }: { c: DinoColors }) {
  return (
    <g>
      {/* Stiff tail for balance */}
      <path
        d="M34 118 Q16 108 6 100 Q4 106 10 112 Q22 120 36 128 Z"
        fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round"
      />
      {/* Sleek body tilted forward */}
      <ellipse cx="82" cy="116" rx="46" ry="36" fill={c.body} stroke={c.outline} strokeWidth="3" transform="rotate(-15 82 116)" />
      {/* Belly */}
      <ellipse cx="86" cy="122" rx="28" ry="22" fill={c.belly} stroke="none" transform="rotate(-15 86 122)" />
      {/* Big head - cheeky expression */}
      <ellipse cx="142" cy="56" rx="32" ry="26" fill={c.body} stroke={c.outline} strokeWidth="3" transform="rotate(-5 142 56)" />
      {/* Snout */}
      <ellipse cx="170" cy="62" rx="14" ry="10" fill={c.body} stroke={c.outline} strokeWidth="2.5" />
      {/* Cheeky grin with teeth hints */}
      <path d="M158 66 Q168 74 182 68" fill="none" stroke={c.outline} strokeWidth="2" strokeLinecap="round" />
      <path d="M162 66 L162 70" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M170 68 L170 72" stroke="white" strokeWidth="2" strokeLinecap="round" />
      {/* Big mischievous kawaii eyes */}
      <circle cx="130" cy="48" r="13" fill="white" stroke={c.outline} strokeWidth="2.5" />
      <circle cx="134" cy="46" r="8" fill={c.eye} />
      <circle cx="138" cy="42" r="3.2" fill="white" />
      <circle cx="132" cy="49" r="1.2" fill="white" />
      <circle cx="152" cy="46" r="11" fill="white" stroke={c.outline} strokeWidth="2.5" />
      <circle cx="155" cy="44" r="6.5" fill={c.eye} />
      <circle cx="158" cy="41" r="2.5" fill="white" />
      {/* Cheeky angled eyebrows */}
      <path d="M120 36 Q130 30 140 36" fill="none" stroke={c.outline} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M146 36 Q154 32 162 38" fill="none" stroke={c.outline} strokeWidth="2.5" strokeLinecap="round" />
      {/* Nostril */}
      <circle cx="178" cy="58" r="2" fill={c.outline} />
      {/* Cheek blush */}
      <ellipse cx="166" cy="68" rx="5" ry="3" fill={c.belly} opacity="0.5" />
      {/* Small grabby arms */}
      <path
        d="M106 100 Q96 92 92 86"
        fill="none" stroke={c.body} strokeWidth="10" strokeLinecap="round"
      />
      <path
        d="M106 100 Q96 92 92 86"
        fill="none" stroke={c.outline} strokeWidth="2.5" strokeLinecap="round"
      />
      <circle cx="91" cy="85" r="4" fill={c.body} stroke={c.outline} strokeWidth="1.5" />
      {/* Standing leg */}
      <path
        d="M72 148 Q66 162 62 176 Q70 178 76 170 Q80 178 88 176 Q84 162 80 148 Z"
        fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round"
      />
      <ellipse cx="74" cy="178" rx="14" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      {/* Raised leg with sickle claw */}
      <path
        d="M96 140 Q110 130 120 122"
        stroke={c.body} strokeWidth="14" strokeLinecap="round" fill="none"
      />
      <path
        d="M96 140 Q110 130 120 122"
        stroke={c.outline} strokeWidth="3" strokeLinecap="round" fill="none"
      />
      {/* Sickle claw - distinctive */}
      <path
        d="M120 122 Q132 112 136 118 Q130 126 122 126 Z"
        fill={c.claw} stroke={c.outline} strokeWidth="2" strokeLinejoin="round"
      />
    </g>
  );
}

function Ankylosaurus({ c }: { c: DinoColors }) {
  return (
    <g>
      {/* Club tail */}
      <path
        d="M30 138 Q16 134 8 138"
        stroke={c.body} strokeWidth="12" strokeLinecap="round" fill="none"
      />
      <path
        d="M30 138 Q16 134 8 138"
        stroke={c.outline} strokeWidth="3" strokeLinecap="round" fill="none"
      />
      {/* Tail club ball */}
      <ellipse cx="6" cy="138" rx="10" ry="8" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Wide armoured dome body */}
      <ellipse cx="100" cy="130" rx="72" ry="44" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Shell dome pattern */}
      <ellipse cx="100" cy="118" rx="58" ry="28" fill={c.belly} stroke="none" opacity="0.35" />
      {/* Cute armour bumps on shell */}
      <circle cx="70" cy="110" r="8" fill={c.belly} stroke={c.outline} strokeWidth="1.5" opacity="0.7" />
      <circle cx="90" cy="104" r="9" fill={c.belly} stroke={c.outline} strokeWidth="1.5" opacity="0.7" />
      <circle cx="112" cy="102" r="9" fill={c.belly} stroke={c.outline} strokeWidth="1.5" opacity="0.7" />
      <circle cx="132" cy="106" r="8" fill={c.belly} stroke={c.outline} strokeWidth="1.5" opacity="0.7" />
      <circle cx="80" cy="122" r="7" fill={c.belly} stroke={c.outline} strokeWidth="1.5" opacity="0.6" />
      <circle cx="102" cy="118" r="7" fill={c.belly} stroke={c.outline} strokeWidth="1.5" opacity="0.6" />
      <circle cx="122" cy="120" r="7" fill={c.belly} stroke={c.outline} strokeWidth="1.5" opacity="0.6" />
      {/* Little side spikes along body */}
      <ellipse cx="38" cy="140" rx="4" ry="8" fill={c.belly} stroke={c.outline} strokeWidth="2" transform="rotate(-30 38 140)" />
      <ellipse cx="48" cy="148" rx="4" ry="7" fill={c.belly} stroke={c.outline} strokeWidth="2" transform="rotate(-20 48 148)" />
      <ellipse cx="152" cy="148" rx="4" ry="7" fill={c.belly} stroke={c.outline} strokeWidth="2" transform="rotate(20 152 148)" />
      <ellipse cx="162" cy="140" rx="4" ry="8" fill={c.belly} stroke={c.outline} strokeWidth="2" transform="rotate(30 162 140)" />
      {/* Small cute head */}
      <ellipse cx="174" cy="128" rx="22" ry="18" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Cute squinty eye */}
      <path d="M166 122 Q172 118 178 122" fill="none" stroke={c.outline} strokeWidth="3" strokeLinecap="round" />
      <circle cx="172" cy="122" r="4" fill={c.eye} />
      <circle cx="174" cy="120" r="1.5" fill="white" />
      {/* Little smile */}
      <path d="M180 132 Q186 138 194 134" fill="none" stroke={c.outline} strokeWidth="2" strokeLinecap="round" />
      {/* Nostril */}
      <circle cx="192" cy="126" r="2" fill={c.outline} />
      {/* Cheek blush */}
      <ellipse cx="184" cy="134" rx="4" ry="3" fill={c.belly} opacity="0.5" />
      {/* Four very short stubby legs */}
      <ellipse cx="62" cy="172" rx="10" ry="14" fill={c.body} stroke={c.outline} strokeWidth="3" />
      <ellipse cx="62" cy="186" rx="12" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <ellipse cx="88" cy="172" rx="10" ry="14" fill={c.body} stroke={c.outline} strokeWidth="3" />
      <ellipse cx="88" cy="186" rx="12" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <ellipse cx="116" cy="172" rx="10" ry="14" fill={c.body} stroke={c.outline} strokeWidth="3" />
      <ellipse cx="116" cy="186" rx="12" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <ellipse cx="142" cy="172" rx="10" ry="14" fill={c.body} stroke={c.outline} strokeWidth="3" />
      <ellipse cx="142" cy="186" rx="12" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
    </g>
  );
}

function Pterodactyl({ c }: { c: DinoColors }) {
  return (
    <g>
      {/* Left wing */}
      <path
        d="M88 94 Q56 60 10 52 Q16 72 50 82 Q70 88 88 94"
        fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round"
      />
      <path
        d="M88 94 Q60 74 14 64 Q8 72 10 52"
        fill={c.belly} stroke="none" opacity="0.4"
      />
      {/* Left wing finger ridges */}
      <path d="M88 94 Q64 74 20 58" stroke={c.outline} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <path d="M88 94 Q66 80 28 68" stroke={c.outline} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      {/* Right wing */}
      <path
        d="M112 94 Q144 60 190 52 Q184 72 150 82 Q130 88 112 94"
        fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round"
      />
      <path
        d="M112 94 Q140 74 186 64 Q192 72 190 52"
        fill={c.belly} stroke="none" opacity="0.4"
      />
      {/* Right wing finger ridges */}
      <path d="M112 94 Q136 74 180 58" stroke={c.outline} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      <path d="M112 94 Q134 80 172 68" stroke={c.outline} strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
      {/* Round body */}
      <ellipse cx="100" cy="108" rx="24" ry="28" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Belly */}
      <ellipse cx="100" cy="114" rx="16" ry="18" fill={c.belly} stroke="none" />
      {/* Big cute head */}
      <ellipse cx="100" cy="62" rx="22" ry="18" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Head crest - swept back */}
      <path
        d="M86 52 Q82 28 90 20 Q96 18 98 30 Q96 44 90 54 Z"
        fill={c.belly} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round"
      />
      {/* Beak */}
      <path
        d="M84 68 Q100 80 116 68 Q118 60 100 56 Q82 60 84 68 Z"
        fill={c.body} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round"
      />
      {/* Smile */}
      <path d="M90 72 Q100 78 110 72" fill="none" stroke={c.outline} strokeWidth="2" strokeLinecap="round" />
      {/* Big kawaii eyes */}
      <circle cx="92" cy="58" r="9" fill="white" stroke={c.outline} strokeWidth="2.5" />
      <circle cx="95" cy="56" r="5.5" fill={c.eye} />
      <circle cx="98" cy="54" r="2.2" fill="white" />
      <circle cx="108" cy="58" r="7" fill="white" stroke={c.outline} strokeWidth="2.5" />
      <circle cx="110" cy="56" r="4" fill={c.eye} />
      <circle cx="112" cy="54" r="1.6" fill="white" />
      {/* Cheek blush */}
      <ellipse cx="114" cy="66" rx="4" ry="2.5" fill={c.belly} opacity="0.5" />
      {/* Dangling feet */}
      <path
        d="M90 134 Q88 146 86 156"
        stroke={c.body} strokeWidth="8" strokeLinecap="round" fill="none"
      />
      <path
        d="M90 134 Q88 146 86 156"
        stroke={c.outline} strokeWidth="2" strokeLinecap="round" fill="none"
      />
      <circle cx="85" cy="158" r="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <path
        d="M110 134 Q112 146 114 156"
        stroke={c.body} strokeWidth="8" strokeLinecap="round" fill="none"
      />
      <path
        d="M110 134 Q112 146 114 156"
        stroke={c.outline} strokeWidth="2" strokeLinecap="round" fill="none"
      />
      <circle cx="115" cy="158" r="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
    </g>
  );
}

function Diplodocus({ c }: { c: DinoColors }) {
  return (
    <g>
      {/* Long whip tail going down-right */}
      <path
        d="M130 142 Q152 152 170 166 Q180 176 186 188"
        stroke={c.body} strokeWidth="14" strokeLinecap="round" fill="none"
      />
      <path
        d="M130 142 Q152 152 170 166 Q180 176 186 188"
        stroke={c.outline} strokeWidth="3" strokeLinecap="round" fill="none"
      />
      {/* Tail tip */}
      <ellipse cx="187" cy="190" rx="4" ry="6" fill={c.body} stroke={c.outline} strokeWidth="2" />
      {/* Round body */}
      <ellipse cx="96" cy="140" rx="44" ry="34" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Belly */}
      <ellipse cx="96" cy="150" rx="30" ry="20" fill={c.belly} stroke="none" />
      {/* Long neck curving up-left */}
      <path
        d="M76 114 Q56 72 42 40 Q36 22 32 12"
        stroke={c.body} strokeWidth="20" strokeLinecap="round" fill="none"
      />
      <path
        d="M76 114 Q56 72 42 40 Q36 22 32 12"
        stroke={c.outline} strokeWidth="3" strokeLinecap="round" fill="none"
      />
      {/* Neck belly stripe */}
      <path
        d="M82 114 Q64 74 48 42 Q42 24 38 14"
        stroke={c.belly} strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.5"
      />
      {/* Tiny cute head */}
      <ellipse cx="30" cy="12" rx="18" ry="13" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Gentle smile */}
      <path d="M36 18 Q42 24 48 20" fill="none" stroke={c.outline} strokeWidth="2" strokeLinecap="round" />
      {/* Big kawaii eye (one side visible) */}
      <circle cx="24" cy="8" r="8" fill="white" stroke={c.outline} strokeWidth="2.5" />
      <circle cx="27" cy="6" r="5" fill={c.eye} />
      <circle cx="30" cy="4" r="2" fill="white" />
      <circle cx="25" cy="9" r="0.8" fill="white" />
      {/* Nostril */}
      <circle cx="44" cy="10" r="2" fill={c.outline} />
      {/* Happy eyebrow */}
      <path d="M18 0 Q26 -4 34 0" fill="none" stroke={c.outline} strokeWidth="2.5" strokeLinecap="round" />
      {/* Cheek blush */}
      <ellipse cx="40" cy="18" rx="4" ry="2.5" fill={c.belly} opacity="0.5" />
      {/* Four pillar legs */}
      <ellipse cx="68" cy="172" rx="10" ry="18" fill={c.body} stroke={c.outline} strokeWidth="3" />
      <ellipse cx="68" cy="190" rx="12" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <ellipse cx="88" cy="172" rx="10" ry="18" fill={c.body} stroke={c.outline} strokeWidth="3" />
      <ellipse cx="88" cy="190" rx="12" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <ellipse cx="108" cy="172" rx="10" ry="18" fill={c.body} stroke={c.outline} strokeWidth="3" />
      <ellipse cx="108" cy="190" rx="12" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <ellipse cx="126" cy="172" rx="10" ry="18" fill={c.body} stroke={c.outline} strokeWidth="3" />
      <ellipse cx="126" cy="190" rx="12" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
    </g>
  );
}

function Spinosaurus({ c }: { c: DinoColors }) {
  return (
    <g>
      {/* Tail */}
      <path
        d="M32 134 Q16 126 6 118 Q4 124 10 130 Q22 138 36 142 Z"
        fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round"
      />
      {/* Body */}
      <ellipse cx="84" cy="130" rx="52" ry="42" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Belly */}
      <ellipse cx="86" cy="140" rx="34" ry="26" fill={c.belly} stroke="none" />
      {/* Big sail on back - smooth connected curve */}
      <path
        d="M42 96 Q44 52 56 32 Q70 18 86 14 Q102 14 118 24 Q132 38 140 62 Q146 84 148 96"
        fill={c.belly} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round" opacity="0.8"
      />
      {/* Sail spine ridges */}
      <path d="M56 92 L56 36" stroke={c.outline} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M72 88 L72 20" stroke={c.outline} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M88 86 L88 14" stroke={c.outline} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M104 86 L104 16" stroke={c.outline} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M120 88 L120 28" stroke={c.outline} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M136 94 L136 52" stroke={c.outline} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      {/* Crocodile-like head - long narrow snout */}
      <ellipse cx="152" cy="100" rx="26" ry="20" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Long croc snout */}
      <path
        d="M168 92 Q188 94 194 100 Q192 108 188 110 Q176 108 168 106 Z"
        fill={c.body} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round"
      />
      {/* Teeth hints along jaw line */}
      <path d="M172 100 L172 104" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M180 100 L180 104" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M188 102 L188 106" stroke="white" strokeWidth="2" strokeLinecap="round" />
      {/* Smile */}
      <path d="M170 104 Q180 108 192 106" fill="none" stroke={c.outline} strokeWidth="1.5" strokeLinecap="round" />
      {/* Big kawaii eye */}
      <circle cx="148" cy="92" r="11" fill="white" stroke={c.outline} strokeWidth="2.5" />
      <circle cx="151" cy="90" r="7" fill={c.eye} />
      <circle cx="154" cy="87" r="2.8" fill="white" />
      <circle cx="149" cy="93" r="1" fill="white" />
      {/* Eyebrow */}
      <path d="M140 82 Q150 76 158 82" fill="none" stroke={c.outline} strokeWidth="2.5" strokeLinecap="round" />
      {/* Nostril */}
      <circle cx="190" cy="96" r="2" fill={c.outline} />
      {/* Cheek blush */}
      <ellipse cx="168" cy="108" rx="5" ry="3" fill={c.belly} opacity="0.5" />
      {/* Small arms */}
      <path
        d="M114 114 Q104 106 100 100"
        fill="none" stroke={c.body} strokeWidth="8" strokeLinecap="round"
      />
      <path
        d="M114 114 Q104 106 100 100"
        fill="none" stroke={c.outline} strokeWidth="2" strokeLinecap="round"
      />
      <circle cx="99" cy="99" r="3.5" fill={c.body} stroke={c.outline} strokeWidth="1.5" />
      {/* Chunky legs */}
      <path
        d="M66 164 Q60 176 56 188 Q64 190 70 182 Q74 190 82 188 Q78 176 74 164 Z"
        fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round"
      />
      <ellipse cx="68" cy="190" rx="14" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <path
        d="M92 166 Q88 176 84 188 Q92 190 96 182 Q100 190 108 188 Q104 176 100 166 Z"
        fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round"
      />
      <ellipse cx="95" cy="190" rx="14" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
    </g>
  );
}

function Parasaurolophus({ c }: { c: DinoColors }) {
  return (
    <g>
      {/* Tail */}
      <path
        d="M30 138 Q14 130 6 120 Q4 128 10 134 Q22 142 34 146 Z"
        fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round"
      />
      {/* Round body */}
      <ellipse cx="82" cy="132" rx="52" ry="42" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Belly */}
      <ellipse cx="84" cy="142" rx="34" ry="26" fill={c.belly} stroke="none" />
      {/* Big round head */}
      <ellipse cx="152" cy="72" rx="26" ry="22" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Distinctive backwards-sweeping crest */}
      <path
        d="M140 58 Q134 36 126 22 Q122 14 118 10 Q114 8 112 14 Q116 26 122 38 Q128 48 136 56"
        fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round"
      />
      {/* Crest stripe */}
      <path
        d="M138 56 Q132 36 124 22 Q120 14 118 12"
        fill="none" stroke={c.belly} strokeWidth="4" strokeLinecap="round" opacity="0.6"
      />
      {/* Duck bill snout */}
      <path
        d="M168 68 Q186 66 190 74 Q188 84 180 88 Q168 88 162 80 Z"
        fill={c.body} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round"
      />
      {/* Smile */}
      <path d="M170 82 Q178 88 188 84" fill="none" stroke={c.outline} strokeWidth="2" strokeLinecap="round" />
      {/* Big kawaii eyes */}
      <circle cx="144" cy="64" r="12" fill="white" stroke={c.outline} strokeWidth="2.5" />
      <circle cx="147" cy="62" r="7.5" fill={c.eye} />
      <circle cx="150" cy="59" r="3" fill="white" />
      <circle cx="145" cy="65" r="1.2" fill="white" />
      <circle cx="164" cy="66" r="10" fill="white" stroke={c.outline} strokeWidth="2.5" />
      <circle cx="166" cy="64" r="6" fill={c.eye} />
      <circle cx="168" cy="62" r="2.4" fill="white" />
      {/* Happy eyebrow */}
      <path d="M136 54 Q146 48 156 54" fill="none" stroke={c.outline} strokeWidth="2.5" strokeLinecap="round" />
      {/* Nostril */}
      <circle cx="184" cy="72" r="2" fill={c.outline} />
      {/* Cheek blush */}
      <ellipse cx="176" cy="82" rx="5" ry="3" fill={c.belly} opacity="0.5" />
      {/* Small cute arms */}
      <path
        d="M112 112 Q102 104 98 98"
        fill="none" stroke={c.body} strokeWidth="8" strokeLinecap="round"
      />
      <path
        d="M112 112 Q102 104 98 98"
        fill="none" stroke={c.outline} strokeWidth="2" strokeLinecap="round"
      />
      <circle cx="97" cy="97" r="3.5" fill={c.body} stroke={c.outline} strokeWidth="1.5" />
      {/* Two chunky bipedal legs */}
      <path
        d="M64 166 Q58 178 54 190 Q62 192 68 184 Q72 192 80 190 Q76 178 72 166 Z"
        fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round"
      />
      <ellipse cx="66" cy="192" rx="14" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <path
        d="M92 168 Q88 178 84 190 Q92 192 96 184 Q100 192 108 190 Q104 178 100 168 Z"
        fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round"
      />
      <ellipse cx="95" cy="192" rx="14" ry="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
    </g>
  );
}

// ─── Router ──────────────────────────────────────────────────────────────────

export function DinoBody({ type, colors }: DinoBodyProps) {
  const c = colors;
  switch (type) {
    case 'trex':
      return <TRex c={c} />;
    case 'stegosaurus':
      return <Stegosaurus c={c} />;
    case 'triceratops':
      return <Triceratops c={c} />;
    case 'brachiosaurus':
      return <Brachiosaurus c={c} />;
    case 'raptor':
      return <Raptor c={c} />;
    case 'ankylosaurus':
      return <Ankylosaurus c={c} />;
    case 'pterodactyl':
      return <Pterodactyl c={c} />;
    case 'diplodocus':
      return <Diplodocus c={c} />;
    case 'spinosaurus':
      return <Spinosaurus c={c} />;
    case 'parasaurolophus':
      return <Parasaurolophus c={c} />;
    default: {
      const _exhaustive: never = type;
      return null;
    }
  }
}
