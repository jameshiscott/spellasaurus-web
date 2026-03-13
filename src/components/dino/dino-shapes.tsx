import type { DinoColors, DinoType } from './dino-types';

interface DinoBodyProps {
  type: DinoType;
  colors: DinoColors;
}

// ─── Individual dino renderers ───────────────────────────────────────────────

function TRex({ c }: { c: DinoColors }) {
  return (
    <g>
      {/* Tail */}
      <ellipse cx="45" cy="130" rx="30" ry="14" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M30 128 Q10 118 8 105 Q14 112 30 120 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      {/* Body */}
      <ellipse cx="105" cy="125" rx="52" ry="42" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Belly */}
      <ellipse cx="108" cy="132" rx="32" ry="26" fill={c.belly} stroke="none" />
      {/* Neck */}
      <path d="M118 88 Q128 72 135 60 Q145 50 150 55 Q148 65 140 75 Q132 85 122 92 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      {/* Head */}
      <ellipse cx="150" cy="60" rx="26" ry="20" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Snout lower jaw */}
      <path d="M138 68 Q148 78 168 72 Q162 80 148 80 Q136 80 134 72 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      {/* Smile teeth hint */}
      <path d="M140 72 Q148 76 162 72" fill="none" stroke={c.outline} strokeWidth="2" strokeLinecap="round" />
      <path d="M145 72 L145 76 M153 73 L153 77 M161 72 L160 75" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      {/* Eye */}
      <circle cx="153" cy="52" r="8" fill="white" stroke={c.outline} strokeWidth="2" />
      <circle cx="155" cy="51" r="5" fill={c.eye} />
      <circle cx="157" cy="49" r="1.5" fill="white" />
      {/* Nostril */}
      <circle cx="164" cy="60" r="2" fill={c.outline} />
      {/* Tiny arms */}
      <path d="M125 105 Q115 98 112 92 Q118 94 124 100 Z" fill={c.body} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M112 92 L108 88 M112 92 L116 87" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
      {/* Left leg */}
      <path d="M88 158 Q82 168 78 180 Q84 180 88 172 Q90 180 96 180 Q96 170 92 158 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M78 180 L74 184 M88 172 L84 184 M96 180 L100 184" stroke={c.claw} strokeWidth="2.5" strokeLinecap="round" />
      {/* Right leg */}
      <path d="M108 160 Q103 170 100 182 Q106 182 110 174 Q112 182 118 182 Q117 172 114 160 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M100 182 L96 186 M110 174 L106 186 M118 182 L122 186" stroke={c.claw} strokeWidth="2.5" strokeLinecap="round" />
      {/* Eyebrow (friendly arch) */}
      <path d="M147 45 Q153 41 160 44" fill="none" stroke={c.outline} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

function Stegosaurus({ c }: { c: DinoColors }) {
  return (
    <g>
      {/* Plates on back */}
      <polygon points="65,98 58,62 72,98" fill={c.belly} stroke={c.outline} strokeWidth="2.5" />
      <polygon points="82,90 74,50 90,90" fill={c.belly} stroke={c.outline} strokeWidth="2.5" />
      <polygon points="100,86 93,44 108,86" fill={c.belly} stroke={c.outline} strokeWidth="2.5" />
      <polygon points="118,90 111,50 125,90" fill={c.belly} stroke={c.outline} strokeWidth="2.5" />
      <polygon points="134,98 128,62 140,98" fill={c.belly} stroke={c.outline} strokeWidth="2.5" />
      {/* Tail */}
      <path d="M48 138 Q28 128 16 118 Q22 130 36 140 Q42 148 50 148 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      {/* Tail spike */}
      <path d="M16 118 L6 108 L20 116 Z" fill={c.belly} stroke={c.outline} strokeWidth="2" />
      {/* Body */}
      <ellipse cx="105" cy="130" rx="60" ry="38" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Belly strip */}
      <ellipse cx="105" cy="138" rx="40" ry="22" fill={c.belly} stroke="none" />
      {/* Neck */}
      <path d="M148 112 Q162 100 168 88 Q172 78 168 72" fill="none" stroke="none" />
      <ellipse cx="158" cy="98" rx="14" ry="20" fill={c.body} stroke={c.outline} strokeWidth="3" transform="rotate(-20 158 98)" />
      {/* Head */}
      <ellipse cx="166" cy="76" rx="20" ry="15" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Snout */}
      <ellipse cx="180" cy="80" rx="10" ry="8" fill={c.body} stroke={c.outline} strokeWidth="2.5" />
      {/* Smile */}
      <path d="M174 82 Q180 86 186 83" fill="none" stroke={c.outline} strokeWidth="2" strokeLinecap="round" />
      {/* Eye */}
      <circle cx="162" cy="72" r="7" fill="white" stroke={c.outline} strokeWidth="2" />
      <circle cx="164" cy="71" r="4" fill={c.eye} />
      <circle cx="165" cy="70" r="1.2" fill="white" />
      {/* Nostril */}
      <circle cx="178" cy="76" r="1.8" fill={c.outline} />
      {/* Front legs */}
      <path d="M148 156 Q144 168 141 180 Q147 180 150 172 Q153 180 158 178 Q156 168 153 156 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M141 180 L138 184 M150 172 L148 184 M158 178 L161 184" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
      {/* Back legs */}
      <path d="M72 156 Q68 168 65 180 Q71 180 74 172 Q76 180 82 178 Q80 168 77 156 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M65 180 L62 184 M74 172 L72 184 M82 178 L85 184" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
      {/* Front-right leg */}
      <path d="M128 156 Q124 168 121 180 Q127 180 130 172 Q132 180 138 178 Q136 168 133 156 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M121 180 L118 184 M130 172 L128 184 M138 178 L141 184" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
      {/* Back-right leg */}
      <path d="M52 156 Q48 168 45 180 Q51 180 54 172 Q56 180 62 178 Q60 168 57 156 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M45 180 L42 184 M54 172 L52 184 M62 178 L65 184" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Triceratops({ c }: { c: DinoColors }) {
  return (
    <g>
      {/* Tail */}
      <path d="M48 130 Q28 125 16 115 Q24 125 38 134 Q44 142 52 142 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      {/* Body */}
      <ellipse cx="105" cy="130" rx="58" ry="40" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Belly */}
      <ellipse cx="105" cy="138" rx="38" ry="24" fill={c.belly} stroke="none" />
      {/* Neck frill */}
      <ellipse cx="152" cy="95" rx="28" ry="24" fill={c.belly} stroke={c.outline} strokeWidth="3" />
      {/* Frill detail bumps */}
      <circle cx="138" cy="76" r="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <circle cx="150" cy="72" r="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <circle cx="163" cy="74" r="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      <circle cx="174" cy="80" r="5" fill={c.body} stroke={c.outline} strokeWidth="2" />
      {/* Neck */}
      <ellipse cx="150" cy="110" rx="18" ry="16" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Head */}
      <ellipse cx="158" cy="112" rx="26" ry="20" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Snout / beak */}
      <path d="M176 108 Q190 112 188 120 Q182 124 172 120 Z" fill={c.body} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round" />
      {/* Smile */}
      <path d="M178 118 Q182 122 188 120" fill="none" stroke={c.outline} strokeWidth="2" strokeLinecap="round" />
      {/* Nose horn */}
      <path d="M186 108 L192 92 L194 108 Z" fill={c.belly} stroke={c.outline} strokeWidth="2" strokeLinejoin="round" />
      {/* Left brow horn */}
      <path d="M153 96 L150 76 L158 96 Z" fill={c.belly} stroke={c.outline} strokeWidth="2" strokeLinejoin="round" />
      {/* Right brow horn */}
      <path d="M166 94 L166 74 L173 94 Z" fill={c.belly} stroke={c.outline} strokeWidth="2" strokeLinejoin="round" />
      {/* Eye */}
      <circle cx="158" cy="108" r="8" fill="white" stroke={c.outline} strokeWidth="2" />
      <circle cx="160" cy="107" r="5" fill={c.eye} />
      <circle cx="162" cy="105" r="1.5" fill="white" />
      {/* Nostril */}
      <circle cx="184" cy="114" r="2" fill={c.outline} />
      {/* Four legs */}
      <path d="M148 158 Q144 170 141 182 Q147 182 150 174 Q152 182 158 180 Q156 170 153 158 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M141 182 L138 186 M150 174 L148 186 M158 180 L161 186" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
      <path d="M122 160 Q118 172 115 184 Q121 184 124 176 Q126 184 132 182 Q130 172 127 160 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M115 184 L112 188 M124 176 L122 188 M132 182 L135 188" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
      <path d="M72 160 Q68 172 65 184 Q71 184 74 176 Q76 184 82 182 Q80 172 77 160 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M65 184 L62 188 M74 176 L72 188 M82 182 L85 188" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
      <path d="M48 158 Q44 170 41 182 Q47 182 50 174 Q52 182 58 180 Q56 170 53 158 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M41 182 L38 186 M50 174 L48 186 M58 180 L61 186" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Brachiosaurus({ c }: { c: DinoColors }) {
  return (
    <g>
      {/* Tail */}
      <path d="M50 138 Q32 140 18 148 Q14 156 20 158 Q34 150 50 148 Q58 155 62 162 Q70 156 62 144 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      {/* Body */}
      <ellipse cx="100" cy="140" rx="50" ry="34" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Belly */}
      <ellipse cx="100" cy="148" rx="32" ry="20" fill={c.belly} stroke="none" />
      {/* Long S-curve neck */}
      <path d="M118 114 Q130 90 122 60 Q116 36 108 22" fill="none" stroke={c.outline} strokeWidth="3" strokeLinecap="round" />
      {/* Neck body (thick path) */}
      <path d="M112 116 Q124 94 118 64 Q112 40 102 24 Q114 20 120 44 Q128 72 134 98 Q136 112 124 120 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      {/* Head */}
      <ellipse cx="108" cy="20" rx="18" ry="13" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Snout */}
      <ellipse cx="124" cy="22" rx="10" ry="7" fill={c.body} stroke={c.outline} strokeWidth="2.5" />
      {/* Smile */}
      <path d="M118 25 Q124 29 130 26" fill="none" stroke={c.outline} strokeWidth="2" strokeLinecap="round" />
      {/* Eye */}
      <circle cx="102" cy="16" r="7" fill="white" stroke={c.outline} strokeWidth="2" />
      <circle cx="104" cy="15" r="4" fill={c.eye} />
      <circle cx="106" cy="13" r="1.2" fill="white" />
      {/* Nostril */}
      <circle cx="128" cy="19" r="1.8" fill={c.outline} />
      {/* Four legs */}
      <path d="M118 164 Q114 174 111 186 Q117 186 120 178 Q122 186 128 184 Q126 174 123 164 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M111 186 L108 190 M120 178 L118 190 M128 184 L131 190" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
      <path d="M96 166 Q92 176 89 188 Q95 188 98 180 Q100 188 106 186 Q104 176 101 166 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M89 188 L86 192 M98 180 L96 192 M106 186 L109 192" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
      <path d="M72 164 Q68 174 65 186 Q71 186 74 178 Q76 186 82 184 Q80 174 77 164 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M65 186 L62 190 M74 178 L72 190 M82 184 L85 190" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
      <path d="M52 162 Q48 172 45 184 Q51 184 54 176 Q56 184 62 182 Q60 172 57 162 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M45 184 L42 188 M54 176 L52 188 M62 182 L65 188" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Raptor({ c }: { c: DinoColors }) {
  return (
    <g>
      {/* Stiff counter-balance tail going back-right */}
      <path d="M60 120 Q40 110 24 104 Q18 108 22 112 Q36 116 54 126 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      {/* Body - leaning forward */}
      <ellipse cx="108" cy="118" rx="46" ry="34" fill={c.body} stroke={c.outline} strokeWidth="3" transform="rotate(-20 108 118)" />
      {/* Belly */}
      <ellipse cx="110" cy="122" rx="28" ry="20" fill={c.belly} stroke="none" transform="rotate(-20 110 122)" />
      {/* Neck */}
      <path d="M128 92 Q140 78 145 64" fill="none" stroke="none" />
      <ellipse cx="138" cy="80" rx="14" ry="18" fill={c.body} stroke={c.outline} strokeWidth="3" transform="rotate(-30 138 80)" />
      {/* Head - large */}
      <ellipse cx="150" cy="60" rx="28" ry="20" fill={c.body} stroke={c.outline} strokeWidth="3" transform="rotate(-10 150 60)" />
      {/* Lower jaw */}
      <path d="M132 66 Q148 76 168 70 Q162 80 148 80 Q134 80 130 72 Z" fill={c.body} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round" />
      {/* Teeth hint */}
      <path d="M136 70 Q148 74 164 70" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M140 70 L139 74 M148 71 L147 75 M156 71 L155 74" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      {/* Eye */}
      <circle cx="148" cy="54" r="9" fill="white" stroke={c.outline} strokeWidth="2" />
      <circle cx="150" cy="53" r="5.5" fill={c.eye} />
      <circle cx="152" cy="51" r="1.5" fill="white" />
      {/* Nostril */}
      <circle cx="163" cy="60" r="2" fill={c.outline} />
      {/* Eyebrow */}
      <path d="M143 47 Q150 43 157 46" fill="none" stroke={c.outline} strokeWidth="2.5" strokeLinecap="round" />
      {/* Small arms */}
      <path d="M130 108 Q122 100 118 94 Q124 96 130 104 Z" fill={c.body} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M118 94 L114 90 M118 94 L122 89" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
      {/* Standing leg */}
      <path d="M108 148 Q104 160 100 174 Q106 174 110 166 Q112 174 118 172 Q116 160 113 148 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M100 174 L96 178 M110 166 L107 178 M118 172 L122 178" stroke={c.claw} strokeWidth="2.5" strokeLinecap="round" />
      {/* Raised leg with sickle claw */}
      <path d="M120 140 Q132 132 138 126" stroke={c.body} strokeWidth="12" strokeLinecap="round" fill="none" />
      <path d="M120 140 Q132 132 138 126" stroke={c.outline} strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Sickle claw */}
      <path d="M138 126 Q148 118 152 122 Q148 130 140 130 Z" fill={c.claw} stroke={c.outline} strokeWidth="2" strokeLinejoin="round" />
      {/* Toe claws on standing leg */}
      <path d="M96 178 L92 182 M107 178 L105 183 M122 178 L126 182" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Ankylosaurus({ c }: { c: DinoColors }) {
  return (
    <g>
      {/* Club tail */}
      <path d="M52 132 Q36 128 26 132 Q22 140 30 144 Q40 148 52 144 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="24" cy="138" r="12" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Main armoured body - wide dome */}
      <ellipse cx="110" cy="130" rx="65" ry="44" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Shell dome highlight */}
      <ellipse cx="110" cy="118" rx="52" ry="28" fill={c.belly} stroke="none" opacity="0.4" />
      {/* Armour spikes along body outline */}
      <polygon points="62,92 56,74 68,92" fill={c.belly} stroke={c.outline} strokeWidth="2" />
      <polygon points="80,84 76,66 86,84" fill={c.belly} stroke={c.outline} strokeWidth="2" />
      <polygon points="100,80 97,62 105,80" fill={c.belly} stroke={c.outline} strokeWidth="2" />
      <polygon points="120,80 117,62 125,80" fill={c.belly} stroke={c.outline} strokeWidth="2" />
      <polygon points="140,84 136,66 146,84" fill={c.belly} stroke={c.outline} strokeWidth="2" />
      <polygon points="156,92 152,74 162,92" fill={c.belly} stroke={c.outline} strokeWidth="2" />
      {/* Armour plates texture - bumps */}
      <circle cx="90" cy="110" r="8" fill={c.belly} stroke={c.outline} strokeWidth="1.5" opacity="0.7" />
      <circle cx="110" cy="104" r="8" fill={c.belly} stroke={c.outline} strokeWidth="1.5" opacity="0.7" />
      <circle cx="130" cy="110" r="8" fill={c.belly} stroke={c.outline} strokeWidth="1.5" opacity="0.7" />
      <circle cx="100" cy="122" r="7" fill={c.belly} stroke={c.outline} strokeWidth="1.5" opacity="0.6" />
      <circle cx="120" cy="122" r="7" fill={c.belly} stroke={c.outline} strokeWidth="1.5" opacity="0.6" />
      {/* Head - small and wide, pointing right */}
      <ellipse cx="164" cy="128" rx="22" ry="16" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Snout */}
      <path d="M178 122 Q192 128 188 136 Q180 140 172 136 Z" fill={c.body} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round" />
      {/* Smile */}
      <path d="M178 134 Q183 138 188 136" fill="none" stroke={c.outline} strokeWidth="2" strokeLinecap="round" />
      {/* Eye */}
      <circle cx="158" cy="123" r="7" fill="white" stroke={c.outline} strokeWidth="2" />
      <circle cx="160" cy="122" r="4" fill={c.eye} />
      <circle cx="161" cy="120" r="1.2" fill="white" />
      {/* Nostril */}
      <circle cx="186" cy="129" r="2" fill={c.outline} />
      {/* Four short legs */}
      <path d="M148 166 Q145 174 143 182 Q148 182 150 176 Q152 182 157 180 Q155 174 153 166 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M143 182 L140 185 M150 176 L149 185 M157 180 L160 185" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
      <path d="M122 170 Q119 178 117 186 Q122 186 124 180 Q126 186 131 184 Q129 178 127 170 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M117 186 L114 189 M124 180 L123 189 M131 184 L134 189" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
      <path d="M88 170 Q85 178 83 186 Q88 186 90 180 Q92 186 97 184 Q95 178 93 170 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M83 186 L80 189 M90 180 L89 189 M97 184 L100 189" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
      <path d="M62 166 Q59 174 57 182 Q62 182 64 176 Q66 182 71 180 Q69 174 67 166 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M57 182 L54 185 M64 176 L63 185 M71 180 L74 185" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Pterodactyl({ c }: { c: DinoColors }) {
  return (
    <g>
      {/* Left wing */}
      <path d="M100 95 Q70 60 20 50 Q30 70 60 82 Q80 88 100 95" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M100 95 Q72 80 24 72 Q14 80 20 50" fill={c.belly} stroke="none" opacity="0.5" />
      {/* Wing membrane lines left */}
      <path d="M100 95 Q76 76 30 62" stroke={c.outline} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M100 95 Q78 82 38 74" stroke={c.outline} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      {/* Right wing */}
      <path d="M100 95 Q130 60 180 50 Q170 70 140 82 Q120 88 100 95" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M100 95 Q128 80 176 72 Q186 80 180 50" fill={c.belly} stroke="none" opacity="0.5" />
      {/* Wing membrane lines right */}
      <path d="M100 95 Q124 76 170 62" stroke={c.outline} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M100 95 Q122 82 162 74" stroke={c.outline} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      {/* Body */}
      <ellipse cx="100" cy="110" rx="22" ry="30" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Belly */}
      <ellipse cx="100" cy="116" rx="13" ry="18" fill={c.belly} stroke="none" />
      {/* Neck */}
      <ellipse cx="100" cy="82" rx="12" ry="14" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Head */}
      <ellipse cx="100" cy="64" rx="18" ry="14" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Head crest */}
      <path d="M88 56 Q95 36 102 56" fill={c.belly} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round" />
      {/* Beak - pointed */}
      <path d="M88 68 Q100 76 112 68 L116 58 Q100 54 84 58 Z" fill={c.body} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round" />
      {/* Smile */}
      <path d="M90 70 Q100 74 110 70" fill="none" stroke={c.outline} strokeWidth="1.5" strokeLinecap="round" />
      {/* Eye */}
      <circle cx="94" cy="60" r="7" fill="white" stroke={c.outline} strokeWidth="2" />
      <circle cx="96" cy="59" r="4" fill={c.eye} />
      <circle cx="98" cy="57" r="1.2" fill="white" />
      {/* Nostril */}
      <circle cx="110" cy="62" r="1.8" fill={c.outline} />
      {/* Feet */}
      <path d="M90 138 Q86 148 83 158 Q88 158 91 150 Q93 158 98 156 Q96 148 94 138 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M83 158 L80 162 M91 150 L89 162 M98 156 L101 162" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
      <path d="M106 138 Q102 148 99 158 Q104 158 107 150 Q109 158 114 156 Q112 148 110 138 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M99 158 L96 162 M107 150 L105 162 M114 156 L117 162" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Diplodocus({ c }: { c: DinoColors }) {
  return (
    <g>
      {/* Long thin tail going down-right */}
      <path d="M136 140 Q158 150 176 164 Q184 172 186 180" stroke={c.body} strokeWidth="14" strokeLinecap="round" fill="none" />
      <path d="M136 140 Q158 150 176 164 Q184 172 186 180" stroke={c.outline} strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Tail tip */}
      <path d="M183 178 Q188 186 186 192 Q181 188 180 180 Z" fill={c.body} stroke={c.outline} strokeWidth="2" strokeLinejoin="round" />
      {/* Body */}
      <ellipse cx="100" cy="138" rx="46" ry="32" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Belly */}
      <ellipse cx="100" cy="146" rx="30" ry="18" fill={c.belly} stroke="none" />
      {/* Long neck going up-left */}
      <path d="M84 114 Q68 80 60 46 Q56 30 60 18" stroke={c.body} strokeWidth="18" strokeLinecap="round" fill="none" />
      <path d="M84 114 Q68 80 60 46 Q56 30 60 18" stroke={c.outline} strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Belly side of neck */}
      <path d="M90 114 Q76 82 70 48 Q66 32 66 18 Q60 18 56 30 Q52 46 56 58 Q62 90 80 118 Z" fill={c.belly} stroke="none" opacity="0.6" />
      {/* Head - small */}
      <ellipse cx="60" cy="18" rx="16" ry="11" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Snout */}
      <ellipse cx="74" cy="20" rx="9" ry="6" fill={c.body} stroke={c.outline} strokeWidth="2.5" />
      {/* Smile */}
      <path d="M68 23 Q74 27 80 24" fill="none" stroke={c.outline} strokeWidth="1.8" strokeLinecap="round" />
      {/* Eye */}
      <circle cx="54" cy="14" r="7" fill="white" stroke={c.outline} strokeWidth="2" />
      <circle cx="56" cy="13" r="4" fill={c.eye} />
      <circle cx="58" cy="11" r="1.2" fill="white" />
      {/* Nostril */}
      <circle cx="77" cy="17" r="1.8" fill={c.outline} />
      {/* Four legs */}
      <path d="M116 162 Q112 172 109 184 Q115 184 118 176 Q120 184 126 182 Q124 172 121 162 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M109 184 L106 188 M118 176 L116 188 M126 182 L129 188" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
      <path d="M96 164 Q92 174 89 186 Q95 186 98 178 Q100 186 106 184 Q104 174 101 164 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M89 186 L86 190 M98 178 L96 190 M106 184 L109 190" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
      <path d="M72 162 Q68 172 65 184 Q71 184 74 176 Q76 184 82 182 Q80 172 77 162 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M65 184 L62 188 M74 176 L72 188 M82 182 L85 188" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
      <path d="M52 160 Q48 170 45 182 Q51 182 54 174 Q56 182 62 180 Q60 170 57 160 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M45 182 L42 186 M54 174 L52 186 M62 180 L65 186" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Spinosaurus({ c }: { c: DinoColors }) {
  return (
    <g>
      {/* Tail */}
      <path d="M52 130 Q34 124 20 116 Q16 122 22 126 Q38 134 54 140 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      {/* Body */}
      <ellipse cx="105" cy="128" rx="52" ry="40" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Belly */}
      <ellipse cx="106" cy="136" rx="32" ry="24" fill={c.belly} stroke="none" />
      {/* Sail - connected spines on back */}
      <path d="M70 94 L62 42 L76 94" fill={c.belly} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M85 88 L80 34 L92 88" fill={c.belly} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M100 84 L97 28 L108 84" fill={c.belly} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M115 86 L114 32 L124 86" fill={c.belly} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M128 92 L130 44 L138 92" fill={c.belly} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round" />
      {/* Sail connecting membrane */}
      <path d="M62 42 Q80 34 97 28 Q114 32 130 44" fill="none" stroke={c.outline} strokeWidth="2" strokeLinecap="round" />
      {/* Neck */}
      <ellipse cx="142" cy="100" rx="16" ry="20" fill={c.body} stroke={c.outline} strokeWidth="3" transform="rotate(-15 142 100)" />
      {/* Head - long narrow jaws */}
      <ellipse cx="156" cy="76" rx="22" ry="14" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Upper jaw - long snout */}
      <path d="M140 72 Q162 64 184 68 Q186 74 182 78 Q162 74 140 80 Z" fill={c.body} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round" />
      {/* Lower jaw */}
      <path d="M140 80 Q162 76 182 80 Q180 88 162 86 Q144 88 140 80 Z" fill={c.body} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round" />
      {/* Smile */}
      <path d="M144 80 Q162 84 180 80" fill="none" stroke={c.outline} strokeWidth="1.5" strokeLinecap="round" />
      {/* Teeth */}
      <path d="M148 78 L147 82 M157 76 L156 80 M166 76 L165 80 M175 77 L174 81" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      {/* Eye */}
      <circle cx="148" cy="72" r="8" fill="white" stroke={c.outline} strokeWidth="2" />
      <circle cx="150" cy="71" r="5" fill={c.eye} />
      <circle cx="152" cy="69" r="1.5" fill="white" />
      {/* Nostril */}
      <circle cx="175" cy="67" r="2" fill={c.outline} />
      {/* Small arms */}
      <path d="M128 112 Q118 104 114 98 Q120 100 127 108 Z" fill={c.body} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M114 98 L110 94 M114 98 L118 93" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
      {/* Legs */}
      <path d="M96 160 Q92 172 88 184 Q94 184 98 176 Q100 184 106 182 Q104 172 101 160 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M88 184 L84 188 M98 176 L96 188 M106 182 L110 188" stroke={c.claw} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M116 162 Q112 172 109 184 Q115 184 118 176 Q120 184 126 182 Q124 172 121 162 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M109 184 L105 188 M118 176 L116 188 M126 182 L130 188" stroke={c.claw} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

function Parasaurolophus({ c }: { c: DinoColors }) {
  return (
    <g>
      {/* Tail */}
      <path d="M52 134 Q34 126 20 116 Q16 124 24 130 Q40 138 56 144 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      {/* Body */}
      <ellipse cx="105" cy="130" rx="52" ry="40" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Belly */}
      <ellipse cx="106" cy="138" rx="33" ry="25" fill={c.belly} stroke="none" />
      {/* Neck */}
      <ellipse cx="138" cy="98" rx="16" ry="22" fill={c.body} stroke={c.outline} strokeWidth="3" transform="rotate(-10 138 98)" />
      {/* Head */}
      <ellipse cx="152" cy="76" rx="22" ry="17" fill={c.body} stroke={c.outline} strokeWidth="3" />
      {/* Head crest - long curved sweep backwards */}
      <path d="M140 64 Q148 42 160 30 Q172 20 178 28 Q172 36 164 44 Q154 54 148 66 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      {/* Crest detail */}
      <path d="M144 62 Q150 44 162 32" fill="none" stroke={c.belly} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      {/* Duck-bill snout */}
      <path d="M164 74 Q180 72 184 78 Q182 86 174 88 Q162 88 158 82 Z" fill={c.body} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round" />
      {/* Smile */}
      <path d="M162 84 Q172 88 182 85" fill="none" stroke={c.outline} strokeWidth="2" strokeLinecap="round" />
      {/* Eye */}
      <circle cx="148" cy="72" r="8" fill="white" stroke={c.outline} strokeWidth="2" />
      <circle cx="150" cy="71" r="5" fill={c.eye} />
      <circle cx="152" cy="69" r="1.5" fill="white" />
      {/* Nostril */}
      <circle cx="178" cy="76" r="2" fill={c.outline} />
      {/* Eyebrow */}
      <path d="M143 65 Q150 61 157 64" fill="none" stroke={c.outline} strokeWidth="2.5" strokeLinecap="round" />
      {/* Small arms */}
      <path d="M126 112 Q118 104 114 98 Q120 100 126 108 Z" fill={c.body} stroke={c.outline} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M114 98 L110 94 M114 98 L118 93" stroke={c.claw} strokeWidth="2" strokeLinecap="round" />
      {/* Two legs */}
      <path d="M96 160 Q92 172 88 184 Q94 184 98 176 Q100 184 106 182 Q104 172 101 160 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M88 184 L84 188 M98 176 L96 188 M106 182 L110 188" stroke={c.claw} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M116 162 Q112 172 109 184 Q115 184 118 176 Q120 184 126 182 Q124 172 121 162 Z" fill={c.body} stroke={c.outline} strokeWidth="3" strokeLinejoin="round" />
      <path d="M109 184 L105 188 M118 176 L116 188 M126 182 L130 188" stroke={c.claw} strokeWidth="2.5" strokeLinecap="round" />
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
