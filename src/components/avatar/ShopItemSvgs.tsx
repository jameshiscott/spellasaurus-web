import React from 'react';

type SvgRenderer = (w: number, h: number) => React.ReactNode;

const svgMap: Record<string, SvgRenderer> = {
  // ===================== HATS (head) =====================

  // Party Hat
  'a1b2c3d4-0001-0000-0000-000000000001': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="32,4 12,58 52,58" fill="#FF6B9D" stroke="#E84583" strokeWidth="2" />
      <circle cx="24" cy="36" r="3" fill="#FFD93D" />
      <circle cx="36" cy="28" r="3" fill="#6BCB77" />
      <circle cx="28" cy="48" r="3" fill="#4D96FF" />
      <circle cx="40" cy="42" r="3" fill="#FFD93D" />
      <circle cx="32" cy="4" r="4" fill="#FFD93D" />
      <line x1="12" y1="58" x2="52" y2="58" stroke="#E84583" strokeWidth="3" />
    </svg>
  ),

  // Wizard Hat
  'a1b2c3d4-0002-0000-0000-000000000002': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="32,2 8,52 56,52" fill="#5B4BA0" stroke="#3D2D7A" strokeWidth="2" />
      <rect x="4" y="52" width="56" height="8" rx="3" fill="#5B4BA0" stroke="#3D2D7A" strokeWidth="2" />
      <polygon points="20,30 22,26 24,30 22,28" fill="#FFD93D" />
      <polygon points="38,18 40,14 42,18 40,16" fill="#FFD93D" />
      <polygon points="30,42 32,38 34,42 32,40" fill="#FFD93D" />
      <circle cx="44" cy="36" r="2" fill="#FFD93D" />
      <circle cx="26" cy="22" r="1.5" fill="#FFD93D" />
    </svg>
  ),

  // Crown
  'a1b2c3d4-0009-0000-0000-000000000009': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="6,50 12,20 22,36 32,10 42,36 52,20 58,50" fill="#FFD93D" stroke="#E6A800" strokeWidth="2" />
      <rect x="6" y="50" width="52" height="10" rx="2" fill="#FFD93D" stroke="#E6A800" strokeWidth="2" />
      <circle cx="32" cy="10" r="3" fill="#FF4444" />
      <circle cx="12" cy="20" r="3" fill="#4D96FF" />
      <circle cx="52" cy="20" r="3" fill="#4D96FF" />
      <circle cx="22" cy="54" r="3" fill="#FF4444" />
      <circle cx="42" cy="54" r="3" fill="#FF4444" />
    </svg>
  ),

  // Pirate Hat
  'a1b2c3d4-0010-0000-0000-000000000010': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="48" rx="28" ry="8" fill="#2D2D2D" stroke="#1A1A1A" strokeWidth="2" />
      <path d="M10,48 Q10,16 32,12 Q54,16 54,48" fill="#2D2D2D" stroke="#1A1A1A" strokeWidth="2" />
      <circle cx="32" cy="32" r="8" fill="white" />
      <circle cx="30" cy="30" r="2" fill="#2D2D2D" />
      <circle cx="34" cy="30" r="2" fill="#2D2D2D" />
      <path d="M28,34 Q32,38 36,34" stroke="#2D2D2D" strokeWidth="1.5" fill="none" />
      <line x1="24" y1="28" x2="20" y2="24" stroke="white" strokeWidth="2" />
      <line x1="40" y1="28" x2="44" y2="24" stroke="white" strokeWidth="2" />
    </svg>
  ),

  // Viking Helmet
  'a1b2c3d4-0011-0000-0000-000000000011': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12,40 Q12,20 32,16 Q52,20 52,40 L52,50 L12,50 Z" fill="#8B8B8B" stroke="#666" strokeWidth="2" />
      <rect x="28" y="16" width="8" height="34" fill="#A0A0A0" stroke="#666" strokeWidth="1" />
      <path d="M12,32 Q4,20 2,6" stroke="#C4A35A" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M52,32 Q60,20 62,6" stroke="#C4A35A" strokeWidth="4" fill="none" strokeLinecap="round" />
      <rect x="12" y="44" width="40" height="6" rx="2" fill="#A0A0A0" stroke="#666" strokeWidth="1" />
    </svg>
  ),

  // Flower Crown
  'a1b2c3d4-0012-0000-0000-000000000012': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8,38 Q8,28 32,24 Q56,28 56,38" fill="none" stroke="#4CAF50" strokeWidth="4" />
      <circle cx="14" cy="34" r="6" fill="#FF6B9D" /><circle cx="14" cy="34" r="3" fill="#FFD93D" />
      <circle cx="26" cy="28" r="6" fill="#FF4444" /><circle cx="26" cy="28" r="3" fill="#FFD93D" />
      <circle cx="38" cy="28" r="6" fill="#9B59B6" /><circle cx="38" cy="28" r="3" fill="#FFD93D" />
      <circle cx="50" cy="34" r="6" fill="#4D96FF" /><circle cx="50" cy="34" r="3" fill="#FFD93D" />
      <circle cx="32" cy="24" r="6" fill="#FF9800" /><circle cx="32" cy="24" r="3" fill="#FFD93D" />
    </svg>
  ),

  // Top Hat
  'a1b2c3d4-0013-0000-0000-000000000013': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="8" width="28" height="38" rx="3" fill="#2D2D2D" stroke="#1A1A1A" strokeWidth="2" />
      <ellipse cx="32" cy="46" rx="28" ry="8" fill="#2D2D2D" stroke="#1A1A1A" strokeWidth="2" />
      <ellipse cx="32" cy="8" rx="14" ry="4" fill="#3D3D3D" stroke="#1A1A1A" strokeWidth="1" />
      <rect x="18" y="38" width="28" height="6" fill="#FF4444" />
    </svg>
  ),

  // Baseball Cap
  'a1b2c3d4-0014-0000-0000-000000000014': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10,40 Q10,20 32,16 Q54,20 54,40 Z" fill="#4D96FF" stroke="#2D6FD9" strokeWidth="2" />
      <path d="M10,40 L58,40 Q60,44 58,48 L6,48 Q4,44 6,40 Z" fill="#4D96FF" stroke="#2D6FD9" strokeWidth="2" />
      <path d="M54,40 Q62,42 60,50 L54,48" fill="#2D6FD9" stroke="#2156A6" strokeWidth="1" />
      <text x="32" y="34" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">S</text>
      <circle cx="32" cy="16" r="3" fill="#4D96FF" stroke="#2D6FD9" strokeWidth="1" />
    </svg>
  ),

  // Chef Hat
  'a1b2c3d4-0015-0000-0000-000000000015': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="28" width="32" height="28" fill="white" stroke="#DDD" strokeWidth="2" />
      <circle cx="22" cy="22" r="12" fill="white" stroke="#DDD" strokeWidth="2" />
      <circle cx="42" cy="22" r="12" fill="white" stroke="#DDD" strokeWidth="2" />
      <circle cx="32" cy="16" r="12" fill="white" stroke="#DDD" strokeWidth="2" />
      <rect x="16" y="28" width="32" height="28" fill="white" stroke="#DDD" strokeWidth="1" />
    </svg>
  ),

  // Santa Hat
  'a1b2c3d4-0016-0000-0000-000000000016': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8,50 Q16,14 50,8" fill="#E53935" stroke="#C62828" strokeWidth="2" />
      <path d="M8,50 L56,50 Q56,42 50,42 L14,42 Q10,42 8,50 Z" fill="#E53935" stroke="#C62828" strokeWidth="2" />
      <rect x="6" y="46" width="52" height="10" rx="5" fill="white" stroke="#DDD" strokeWidth="1" />
      <circle cx="50" cy="8" r="6" fill="white" stroke="#DDD" strokeWidth="1" />
    </svg>
  ),

  // Tiara
  'a1b2c3d4-0017-0000-0000-000000000017': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6,48 L14,30 L24,40 L32,18 L40,40 L50,30 L58,48 Z" fill="#C0C0C0" stroke="#999" strokeWidth="2" />
      <rect x="6" y="48" width="52" height="8" rx="2" fill="#C0C0C0" stroke="#999" strokeWidth="2" />
      <circle cx="32" cy="22" r="4" fill="#FF69B4" />
      <circle cx="22" cy="36" r="3" fill="#64B5F6" />
      <circle cx="42" cy="36" r="3" fill="#64B5F6" />
      <circle cx="14" cy="34" r="2" fill="#FF69B4" />
      <circle cx="50" cy="34" r="2" fill="#FF69B4" />
    </svg>
  ),

  // Unicorn Horn
  'a1b2c3d4-0018-0000-0000-000000000018': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="32,2 24,58 40,58" fill="url(#unicornGrad)" stroke="#D4A0E0" strokeWidth="2" />
      <line x1="26" y1="46" x2="38" y2="46" stroke="#FFD93D" strokeWidth="2" />
      <line x1="27" y1="36" x2="37" y2="36" stroke="#FF6B9D" strokeWidth="2" />
      <line x1="28" y1="26" x2="36" y2="26" stroke="#6BCB77" strokeWidth="2" />
      <line x1="29" y1="16" x2="35" y2="16" stroke="#4D96FF" strokeWidth="2" />
      <defs>
        <linearGradient id="unicornGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD93D" />
          <stop offset="25%" stopColor="#FF6B9D" />
          <stop offset="50%" stopColor="#9B59B6" />
          <stop offset="75%" stopColor="#4D96FF" />
          <stop offset="100%" stopColor="#6BCB77" />
        </linearGradient>
      </defs>
    </svg>
  ),

  // ===================== BODY (outfits) =====================

  // Rainbow Cape
  'a1b2c3d4-0003-0000-0000-000000000003': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20,8 L16,58 Q32,64 48,58 L44,8 Z" fill="url(#rainbowCape)" stroke="#C0392B" strokeWidth="1" />
      <circle cx="22" cy="8" r="4" fill="#FFD93D" stroke="#E6A800" strokeWidth="1" />
      <circle cx="42" cy="8" r="4" fill="#FFD93D" stroke="#E6A800" strokeWidth="1" />
      <defs>
        <linearGradient id="rainbowCape" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF4444" />
          <stop offset="17%" stopColor="#FF9800" />
          <stop offset="33%" stopColor="#FFD93D" />
          <stop offset="50%" stopColor="#6BCB77" />
          <stop offset="67%" stopColor="#4D96FF" />
          <stop offset="83%" stopColor="#5B4BA0" />
          <stop offset="100%" stopColor="#9B59B6" />
        </linearGradient>
      </defs>
    </svg>
  ),

  // Space Suit
  'a1b2c3d4-0004-0000-0000-000000000004': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="8" width="36" height="48" rx="10" fill="#D0D0D0" stroke="#999" strokeWidth="2" />
      <rect x="20" y="14" width="24" height="20" rx="6" fill="#87CEEB" stroke="#6BB3D9" strokeWidth="2" />
      <circle cx="20" cy="46" r="4" fill="#FFD93D" />
      <circle cx="32" cy="46" r="4" fill="#FF4444" />
      <circle cx="44" cy="46" r="4" fill="#4D96FF" />
      <rect x="10" y="24" width="6" height="16" rx="3" fill="#D0D0D0" stroke="#999" strokeWidth="1" />
      <rect x="48" y="24" width="6" height="16" rx="3" fill="#D0D0D0" stroke="#999" strokeWidth="1" />
    </svg>
  ),

  // Knight Armour
  'a1b2c3d4-0019-0000-0000-000000000019': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16,12 L16,48 Q16,56 32,58 Q48,56 48,48 L48,12 Q32,8 16,12 Z" fill="#B0B0B0" stroke="#888" strokeWidth="2" />
      <path d="M24,18 L24,36 Q24,42 32,44 Q40,42 40,36 L40,18 Q32,16 24,18 Z" fill="#C8C8C8" stroke="#999" strokeWidth="1" />
      <line x1="32" y1="18" x2="32" y2="44" stroke="#999" strokeWidth="1" />
      <line x1="24" y1="30" x2="40" y2="30" stroke="#999" strokeWidth="1" />
      <rect x="10" y="16" width="8" height="20" rx="3" fill="#B0B0B0" stroke="#888" strokeWidth="1" />
      <rect x="46" y="16" width="8" height="20" rx="3" fill="#B0B0B0" stroke="#888" strokeWidth="1" />
    </svg>
  ),

  // Superhero Cape
  'a1b2c3d4-0020-0000-0000-000000000020': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18,8 L10,58 Q32,64 54,58 L46,8 Z" fill="#E53935" stroke="#C62828" strokeWidth="2" />
      <polygon points="32,22 28,34 24,34 30,40 28,52 32,46 36,52 34,40 40,34 36,34" fill="#FFD93D" />
    </svg>
  ),

  // Hawaiian Shirt
  'a1b2c3d4-0021-0000-0000-000000000021': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14,10 L8,20 L14,24 L14,56 L50,56 L50,24 L56,20 L50,10 L40,14 Q32,18 24,14 Z" fill="#FF9800" stroke="#E68900" strokeWidth="2" />
      <circle cx="22" cy="30" r="4" fill="#FF6B9D" /><circle cx="22" cy="30" r="2" fill="#FFD93D" />
      <circle cx="38" cy="22" r="4" fill="#FF4444" /><circle cx="38" cy="22" r="2" fill="#FFD93D" />
      <circle cx="28" cy="46" r="4" fill="#9B59B6" /><circle cx="28" cy="46" r="2" fill="#FFD93D" />
      <circle cx="44" cy="40" r="4" fill="#4D96FF" /><circle cx="44" cy="40" r="2" fill="#FFD93D" />
      <path d="M30,10 Q32,16 34,10" stroke="#E68900" strokeWidth="1" fill="none" />
    </svg>
  ),

  // Lab Coat
  'a1b2c3d4-0022-0000-0000-000000000022': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16,10 L8,20 L16,24 L16,58 L48,58 L48,24 L56,20 L48,10 L40,14 Q32,18 24,14 Z" fill="white" stroke="#CCC" strokeWidth="2" />
      <rect x="20" y="30" width="8" height="8" rx="1" fill="#EEE" stroke="#CCC" strokeWidth="1" />
      <rect x="20" y="44" width="8" height="8" rx="1" fill="#EEE" stroke="#CCC" strokeWidth="1" />
      <circle cx="42" cy="34" r="2" fill="#4D96FF" />
      <circle cx="42" cy="42" r="2" fill="#4D96FF" />
      <line x1="32" y1="14" x2="32" y2="58" stroke="#DDD" strokeWidth="1" />
    </svg>
  ),

  // Princess Dress
  'a1b2c3d4-0023-0000-0000-000000000023': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24,8 L20,30 L6,58 L58,58 L44,30 L40,8 Z" fill="#FF69B4" stroke="#E84583" strokeWidth="2" />
      <path d="M24,8 Q32,12 40,8" fill="#E84583" />
      <rect x="26" y="20" width="12" height="14" rx="2" fill="#FF85C8" stroke="#E84583" strokeWidth="1" />
      <circle cx="26" cy="46" r="2" fill="#FFD93D" />
      <circle cx="32" cy="50" r="2" fill="#FFD93D" />
      <circle cx="38" cy="46" r="2" fill="#FFD93D" />
      <circle cx="20" cy="54" r="2" fill="#FFD93D" />
      <circle cx="44" cy="54" r="2" fill="#FFD93D" />
    </svg>
  ),

  // Ninja Outfit
  'a1b2c3d4-0024-0000-0000-000000000024': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="8" width="36" height="50" rx="4" fill="#2D2D2D" stroke="#1A1A1A" strokeWidth="2" />
      <rect x="10" y="16" width="10" height="24" rx="3" fill="#2D2D2D" stroke="#1A1A1A" strokeWidth="1" />
      <rect x="44" y="16" width="10" height="24" rx="3" fill="#2D2D2D" stroke="#1A1A1A" strokeWidth="1" />
      <rect x="18" y="28" width="28" height="4" fill="#8B0000" />
      <line x1="32" y1="12" x2="32" y2="56" stroke="#3D3D3D" strokeWidth="1" />
    </svg>
  ),

  // Football Kit
  'a1b2c3d4-0025-0000-0000-000000000025': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16,8 L8,18 L16,22 L16,38 L48,38 L48,22 L56,18 L48,8 Z" fill="#4D96FF" stroke="#2D6FD9" strokeWidth="2" />
      <rect x="18" y="38" width="28" height="20" rx="2" fill="#4D96FF" stroke="#2D6FD9" strokeWidth="2" />
      <text x="32" y="30" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">10</text>
      <line x1="18" y1="38" x2="46" y2="38" stroke="white" strokeWidth="2" />
    </svg>
  ),

  // Scuba Suit
  'a1b2c3d4-0026-0000-0000-000000000026': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="8" width="36" height="50" rx="8" fill="#1A237E" stroke="#0D1642" strokeWidth="2" />
      <circle cx="32" cy="20" r="10" fill="#87CEEB" stroke="#FFD93D" strokeWidth="3" />
      <rect x="22" y="38" width="20" height="4" rx="2" fill="#FFD93D" />
      <circle cx="10" cy="30" r="6" fill="#FFD93D" stroke="#E6A800" strokeWidth="1" />
      <rect x="10" y="16" width="6" height="20" rx="3" fill="#1A237E" stroke="#0D1642" strokeWidth="1" />
      <rect x="48" y="16" width="6" height="20" rx="3" fill="#1A237E" stroke="#0D1642" strokeWidth="1" />
    </svg>
  ),

  // ===================== EYES =====================

  // Star Glasses
  'a1b2c3d4-0005-0000-0000-000000000005': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="16,26 12,36 6,36 10,42 8,52 16,46 24,52 22,42 26,36 20,36" fill="#FFD93D" stroke="#E6A800" strokeWidth="1.5" />
      <polygon points="48,26 44,36 38,36 42,42 40,52 48,46 56,52 54,42 58,36 52,36" fill="#FFD93D" stroke="#E6A800" strokeWidth="1.5" />
      <line x1="26" y1="38" x2="38" y2="38" stroke="#E6A800" strokeWidth="2" />
      <line x1="6" y1="38" x2="2" y2="36" stroke="#E6A800" strokeWidth="2" />
      <line x1="58" y1="38" x2="62" y2="36" stroke="#E6A800" strokeWidth="2" />
    </svg>
  ),

  // Heart Glasses
  'a1b2c3d4-0027-0000-0000-000000000027': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8,34 Q8,26 16,26 Q22,26 22,34 L16,44 L10,34 Z" fill="#FF69B4" stroke="#E84583" strokeWidth="2" />
      <path d="M8,34 Q8,26 16,26" fill="none" />
      <path d="M42,34 Q42,26 50,26 Q56,26 56,34 L50,44 L44,34 Z" fill="#FF69B4" stroke="#E84583" strokeWidth="2" />
      <line x1="22" y1="34" x2="42" y2="34" stroke="#E84583" strokeWidth="2" />
      <line x1="8" y1="34" x2="2" y2="32" stroke="#E84583" strokeWidth="2" />
      <line x1="56" y1="34" x2="62" y2="32" stroke="#E84583" strokeWidth="2" />
    </svg>
  ),

  // Monocle
  'a1b2c3d4-0028-0000-0000-000000000028': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="28" r="14" fill="none" stroke="#C4A35A" strokeWidth="3" />
      <circle cx="32" cy="28" r="11" fill="rgba(135,206,235,0.2)" stroke="#C4A35A" strokeWidth="1" />
      <line x1="32" y1="42" x2="28" y2="60" stroke="#C4A35A" strokeWidth="2" />
    </svg>
  ),

  // 3D Glasses
  'a1b2c3d4-0029-0000-0000-000000000029': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="24" width="24" height="18" rx="3" fill="#FF4444" fillOpacity="0.6" stroke="#CC0000" strokeWidth="2" />
      <rect x="36" y="24" width="24" height="18" rx="3" fill="#4D96FF" fillOpacity="0.6" stroke="#2D6FD9" strokeWidth="2" />
      <line x1="28" y1="33" x2="36" y2="33" stroke="#333" strokeWidth="3" />
      <line x1="4" y1="30" x2="0" y2="28" stroke="#333" strokeWidth="2" />
      <line x1="60" y1="30" x2="64" y2="28" stroke="#333" strokeWidth="2" />
    </svg>
  ),

  // Aviator Goggles
  'a1b2c3d4-0030-0000-0000-000000000030': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="32" rx="14" ry="12" fill="#87CEEB" fillOpacity="0.4" stroke="#8B6914" strokeWidth="3" />
      <ellipse cx="44" cy="32" rx="14" ry="12" fill="#87CEEB" fillOpacity="0.4" stroke="#8B6914" strokeWidth="3" />
      <line x1="34" y1="30" x2="30" y2="30" stroke="#8B6914" strokeWidth="3" />
      <line x1="6" y1="28" x2="2" y2="24" stroke="#8B6914" strokeWidth="2" />
      <line x1="58" y1="28" x2="62" y2="24" stroke="#8B6914" strokeWidth="2" />
      <path d="M2,24 Q32,18 62,24" fill="none" stroke="#8B6914" strokeWidth="2" />
    </svg>
  ),

  // Pixel Sunglasses
  'a1b2c3d4-0031-0000-0000-000000000031': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="22" width="8" height="8" fill="#111" />
      <rect x="10" y="22" width="8" height="8" fill="#111" />
      <rect x="18" y="22" width="8" height="8" fill="#111" />
      <rect x="2" y="30" width="8" height="8" fill="#111" />
      <rect x="10" y="30" width="8" height="8" fill="#111" />
      <rect x="18" y="30" width="8" height="8" fill="#111" />
      <rect x="26" y="22" width="12" height="8" fill="#333" />
      <rect x="38" y="22" width="8" height="8" fill="#111" />
      <rect x="46" y="22" width="8" height="8" fill="#111" />
      <rect x="54" y="22" width="8" height="8" fill="#111" />
      <rect x="38" y="30" width="8" height="8" fill="#111" />
      <rect x="46" y="30" width="8" height="8" fill="#111" />
      <rect x="54" y="30" width="8" height="8" fill="#111" />
      <rect x="10" y="30" width="8" height="8" fill="#222" />
      <rect x="46" y="30" width="8" height="8" fill="#222" />
    </svg>
  ),

  // Round Specs
  'a1b2c3d4-0032-0000-0000-000000000032': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="32" r="12" fill="rgba(200,220,255,0.2)" stroke="#555" strokeWidth="2.5" />
      <circle cx="44" cy="32" r="12" fill="rgba(200,220,255,0.2)" stroke="#555" strokeWidth="2.5" />
      <line x1="32" y1="32" x2="32" y2="32" stroke="#555" strokeWidth="2.5" />
      <path d="M32,30 Q36,28 32,32" fill="none" stroke="#555" strokeWidth="2" />
      <line x1="8" y1="30" x2="2" y2="28" stroke="#555" strokeWidth="2" />
      <line x1="56" y1="30" x2="62" y2="28" stroke="#555" strokeWidth="2" />
    </svg>
  ),

  // Cat Eye Glasses
  'a1b2c3d4-0033-0000-0000-000000000033': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4,28 L4,40 Q4,44 10,44 L22,44 Q28,44 28,38 L28,32 Q28,24 22,24 L6,24 Q4,24 2,20 Z" fill="#FF69B4" fillOpacity="0.3" stroke="#FF69B4" strokeWidth="2.5" />
      <path d="M36,28 L36,40 Q36,44 42,44 L54,44 Q60,44 60,38 L60,32 Q60,24 54,24 L38,24 Q36,24 34,20 Z" fill="#FF69B4" fillOpacity="0.3" stroke="#FF69B4" strokeWidth="2.5" />
      <line x1="28" y1="34" x2="36" y2="34" stroke="#FF69B4" strokeWidth="2" />
    </svg>
  ),

  // Eye Patch
  'a1b2c3d4-0034-0000-0000-000000000034': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="12" x2="42" y2="44" stroke="#333" strokeWidth="3" />
      <line x1="54" y1="12" x2="42" y2="24" stroke="#333" strokeWidth="3" />
      <ellipse cx="36" cy="36" rx="14" ry="12" fill="#2D2D2D" stroke="#1A1A1A" strokeWidth="2" />
      <circle cx="40" cy="34" r="3" fill="#C4A35A" />
    </svg>
  ),

  // ===================== FEET =====================

  // Roller Skates
  'a1b2c3d4-0035-0000-0000-000000000035': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10,12 L10,40 L54,40 L54,28 Q54,12 38,12 Z" fill="#FF4444" stroke="#CC0000" strokeWidth="2" />
      <rect x="8" y="40" width="48" height="6" rx="2" fill="#DDD" stroke="#999" strokeWidth="1" />
      <circle cx="16" cy="52" r="5" fill="#FFD93D" stroke="#E6A800" strokeWidth="2" />
      <circle cx="32" cy="52" r="5" fill="#FFD93D" stroke="#E6A800" strokeWidth="2" />
      <circle cx="48" cy="52" r="5" fill="#FFD93D" stroke="#E6A800" strokeWidth="2" />
    </svg>
  ),

  // Flippers
  'a1b2c3d4-0036-0000-0000-000000000036': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16,16 L16,36 L4,56 Q24,62 44,56 L44,36 L44,16 Z" fill="#4CAF50" stroke="#388E3C" strokeWidth="2" />
      <ellipse cx="24" cy="52" rx="20" ry="6" fill="#66BB6A" stroke="#388E3C" strokeWidth="1" />
      <rect x="16" y="16" width="28" height="10" rx="3" fill="#66BB6A" stroke="#388E3C" strokeWidth="1" />
    </svg>
  ),

  // Cowboy Boots
  'a1b2c3d4-0037-0000-0000-000000000037': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18,6 L18,44 L8,44 L8,54 L50,54 L50,44 L38,44 L38,6 Z" fill="#8B4513" stroke="#5D2E06" strokeWidth="2" />
      <rect x="18" y="6" width="20" height="8" fill="#A0522D" stroke="#5D2E06" strokeWidth="1" />
      <line x1="18" y1="20" x2="38" y2="20" stroke="#5D2E06" strokeWidth="1.5" />
      <polygon points="28,22 26,28 30,28" fill="#C4A35A" />
      <rect x="8" y="48" width="42" height="6" rx="2" fill="#6B3410" />
    </svg>
  ),

  // Bunny Slippers
  'a1b2c3d4-0038-0000-0000-000000000038': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="44" rx="24" ry="14" fill="#FF9EC4" stroke="#E84583" strokeWidth="2" />
      <ellipse cx="22" cy="18" rx="6" ry="16" fill="#FF9EC4" stroke="#E84583" strokeWidth="2" />
      <ellipse cx="42" cy="18" rx="6" ry="16" fill="#FF9EC4" stroke="#E84583" strokeWidth="2" />
      <ellipse cx="22" cy="18" rx="3" ry="10" fill="#FFB6D9" />
      <ellipse cx="42" cy="18" rx="3" ry="10" fill="#FFB6D9" />
      <circle cx="24" cy="38" r="3" fill="#333" />
      <circle cx="40" cy="38" r="3" fill="#333" />
      <ellipse cx="32" cy="44" rx="4" ry="3" fill="#FF69B4" />
    </svg>
  ),

  // Trainers
  'a1b2c3d4-0039-0000-0000-000000000039': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12,24 L12,44 L4,44 L4,52 L56,52 L56,36 Q56,24 40,24 Z" fill="white" stroke="#CCC" strokeWidth="2" />
      <path d="M20,32 Q32,28 44,36" stroke="#FF4444" strokeWidth="3" fill="none" />
      <rect x="4" y="46" width="52" height="6" rx="2" fill="#DDD" />
      <rect x="12" y="24" width="12" height="8" rx="2" fill="#EEE" stroke="#CCC" strokeWidth="1" />
    </svg>
  ),

  // Moon Boots
  'a1b2c3d4-0040-0000-0000-000000000040': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14,6 L14,46 L6,46 L6,58 L58,58 L58,46 L44,46 L44,6 Z" fill="#C0C0C0" stroke="#999" strokeWidth="2" />
      <rect x="14" y="14" width="30" height="6" fill="#DDD" stroke="#999" strokeWidth="1" />
      <rect x="14" y="26" width="30" height="6" fill="#DDD" stroke="#999" strokeWidth="1" />
      <rect x="14" y="38" width="30" height="6" fill="#DDD" stroke="#999" strokeWidth="1" />
      <rect x="6" y="50" width="52" height="8" rx="3" fill="#A0A0A0" stroke="#888" strokeWidth="1" />
    </svg>
  ),

  // ===================== HANDHELD =====================

  // Golden Wand
  'a1b2c3d4-0007-0000-0000-000000000007': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="12" y1="56" x2="42" y2="16" stroke="#C4A35A" strokeWidth="4" strokeLinecap="round" />
      <line x1="12" y1="56" x2="42" y2="16" stroke="#FFD93D" strokeWidth="2" strokeLinecap="round" />
      <polygon points="46,8 44,14 38,14 42,18 40,24 46,20 52,24 50,18 54,14 48,14" fill="#FFD93D" stroke="#E6A800" strokeWidth="1" />
      <circle cx="38" cy="10" r="2" fill="#FFD93D" />
      <circle cx="52" cy="6" r="1.5" fill="#FFD93D" />
      <circle cx="54" cy="18" r="1.5" fill="#FFD93D" />
    </svg>
  ),

  // Magic Sword
  'a1b2c3d4-0041-0000-0000-000000000041': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="29" y="4" width="6" height="36" rx="2" fill="#87CEEB" stroke="#4D96FF" strokeWidth="2" />
      <polygon points="29,4 32,0 35,4" fill="#B0E0FF" stroke="#4D96FF" strokeWidth="1" />
      <rect x="20" y="40" width="24" height="6" rx="2" fill="#C4A35A" stroke="#8B6914" strokeWidth="2" />
      <rect x="28" y="46" width="8" height="14" rx="2" fill="#8B4513" stroke="#5D2E06" strokeWidth="2" />
      <circle cx="32" cy="43" r="2" fill="#FF4444" />
      <line x1="32" y1="6" x2="32" y2="38" stroke="#B0E0FF" strokeWidth="1" strokeOpacity="0.6" />
    </svg>
  ),

  // Bouquet
  'a1b2c3d4-0042-0000-0000-000000000042': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="24,36 32,60 40,36" fill="#4CAF50" />
      <rect x="28" y="36" width="8" height="24" fill="#4CAF50" />
      <path d="M22,36 Q20,40 24,42 L40,42 Q44,40 42,36 Z" fill="#FFB6D9" />
      <circle cx="24" cy="22" r="8" fill="#FF69B4" /><circle cx="24" cy="22" r="4" fill="#FFD93D" />
      <circle cx="40" cy="22" r="8" fill="#FF4444" /><circle cx="40" cy="22" r="4" fill="#FFD93D" />
      <circle cx="32" cy="14" r="8" fill="#9B59B6" /><circle cx="32" cy="14" r="4" fill="#FFD93D" />
      <circle cx="20" cy="32" r="6" fill="#FF9800" /><circle cx="20" cy="32" r="3" fill="#FFD93D" />
      <circle cx="44" cy="32" r="6" fill="#4D96FF" /><circle cx="44" cy="32" r="3" fill="#FFD93D" />
    </svg>
  ),

  // Lollipop
  'a1b2c3d4-0043-0000-0000-000000000043': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="32" y1="38" x2="32" y2="62" stroke="#DDD" strokeWidth="4" strokeLinecap="round" />
      <circle cx="32" cy="22" r="18" fill="#FF69B4" stroke="#E84583" strokeWidth="2" />
      <path d="M32,4 A18,18 0 0,1 50,22" fill="none" stroke="white" strokeWidth="4" />
      <path d="M32,10 A12,12 0 0,1 44,22" fill="none" stroke="#FFD93D" strokeWidth="4" />
      <path d="M32,16 A6,6 0 0,1 38,22" fill="none" stroke="#9B59B6" strokeWidth="4" />
    </svg>
  ),

  // Paintbrush
  'a1b2c3d4-0044-0000-0000-000000000044': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="28" y="26" width="8" height="34" rx="2" fill="#C4A35A" stroke="#8B6914" strokeWidth="1" />
      <rect x="26" y="24" width="12" height="6" rx="1" fill="#999" stroke="#777" strokeWidth="1" />
      <path d="M26,24 Q28,4 32,2 Q36,4 38,24 Z" fill="#FF4444" />
      <path d="M28,20 Q30,6 32,4" stroke="#FF9800" strokeWidth="2" fill="none" />
      <path d="M34,20 Q34,10 32,4" stroke="#4D96FF" strokeWidth="2" fill="none" />
    </svg>
  ),

  // Telescope
  'a1b2c3d4-0045-0000-0000-000000000045': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="26" width="44" height="12" rx="6" fill="#C4A35A" stroke="#8B6914" strokeWidth="2" />
      <circle cx="8" cy="32" r="8" fill="#8B6914" stroke="#5D2E06" strokeWidth="2" />
      <circle cx="8" cy="32" r="5" fill="#87CEEB" fillOpacity="0.4" />
      <rect x="48" y="28" width="10" height="8" rx="2" fill="#C4A35A" stroke="#8B6914" strokeWidth="1" />
      <rect x="24" y="24" width="8" height="16" rx="2" fill="#B08D3A" stroke="#8B6914" strokeWidth="1" />
    </svg>
  ),

  // Shield
  'a1b2c3d4-0046-0000-0000-000000000046': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32,4 L8,16 L8,36 Q8,56 32,62 Q56,56 56,36 L56,16 Z" fill="#4D96FF" stroke="#2D6FD9" strokeWidth="2" />
      <path d="M32,10 L14,20 L14,36 Q14,52 32,56 Q50,52 50,36 L50,20 Z" fill="#2D6FD9" />
      <polygon points="32,18 28,30 20,30 26,38 24,48 32,42 40,48 38,38 44,30 36,30" fill="#FFD93D" />
    </svg>
  ),

  // ===================== BACKGROUNDS =====================

  // Enchanted Forest
  'a1b2c3d4-0006-0000-0000-000000000006': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#1B4332" />
      <rect x="0" y="48" width="64" height="16" fill="#2D6A4F" />
      <polygon points="10,48 16,20 22,48" fill="#2D6A4F" />
      <polygon points="30,48 38,12 46,48" fill="#1B4332" stroke="#2D6A4F" strokeWidth="1" />
      <polygon points="48,48 54,24 60,48" fill="#2D6A4F" />
      <ellipse cx="14" cy="54" rx="5" ry="4" fill="#FF4444" /><circle cx="14" cy="52" r="1.5" fill="white" />
      <ellipse cx="42" cy="56" rx="4" ry="3" fill="#FF9800" /><circle cx="42" cy="55" r="1" fill="white" />
      <circle cx="8" cy="16" r="2" fill="#FFD93D" fillOpacity="0.8" />
      <circle cx="28" cy="8" r="1.5" fill="#FFD93D" fillOpacity="0.6" />
      <circle cx="50" cy="14" r="2" fill="#FFD93D" fillOpacity="0.7" />
      <circle cx="56" cy="36" r="1.5" fill="#FFD93D" fillOpacity="0.5" />
    </svg>
  ),

  // Space Galaxy
  'a1b2c3d4-0047-0000-0000-000000000047': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#0D0D2B" />
      <ellipse cx="32" cy="32" rx="28" ry="14" fill="#2A1050" fillOpacity="0.6" transform="rotate(-20 32 32)" />
      <ellipse cx="32" cy="32" rx="20" ry="8" fill="#4A1080" fillOpacity="0.4" transform="rotate(-20 32 32)" />
      <circle cx="10" cy="10" r="1.5" fill="white" /><circle cx="50" cy="8" r="1" fill="white" />
      <circle cx="56" cy="28" r="1.5" fill="white" /><circle cx="8" cy="44" r="1" fill="white" />
      <circle cx="44" cy="52" r="1.5" fill="white" /><circle cx="20" cy="56" r="1" fill="white" />
      <circle cx="36" cy="14" r="1" fill="#FFD93D" /><circle cx="16" cy="26" r="1" fill="#FF69B4" />
      <circle cx="52" cy="42" r="1" fill="#87CEEB" /><circle cx="28" cy="48" r="1" fill="#FFD93D" />
    </svg>
  ),

  // Underwater Ocean
  'a1b2c3d4-0048-0000-0000-000000000048': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#1565C0" />
      <rect x="0" y="52" width="64" height="12" fill="#0D47A1" />
      <path d="M4,54 Q6,48 8,54 Q10,58 12,54" stroke="#4CAF50" strokeWidth="3" fill="none" />
      <path d="M24,56 Q26,46 28,56 Q30,60 32,50" stroke="#4CAF50" strokeWidth="3" fill="none" />
      <path d="M50,54 Q52,44 54,54 Q56,58 58,52" stroke="#66BB6A" strokeWidth="3" fill="none" />
      <circle cx="12" cy="16" r="3" fill="rgba(255,255,255,0.3)" />
      <circle cx="40" cy="24" r="4" fill="rgba(255,255,255,0.2)" />
      <circle cx="24" cy="36" r="2.5" fill="rgba(255,255,255,0.25)" />
      <circle cx="52" cy="12" r="2" fill="rgba(255,255,255,0.3)" />
      <circle cx="34" cy="8" r="1.5" fill="rgba(255,255,255,0.2)" />
    </svg>
  ),

  // Candy Land
  'a1b2c3d4-0049-0000-0000-000000000049': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#FFB6D9" />
      <rect x="0" y="48" width="64" height="16" fill="#FF9EC4" />
      <rect x="10" y="24" width="4" height="30" rx="2" fill="white" />
      <path d="M12,24 Q12,16 8,16 Q4,16 4,22 Q4,28 12,24" fill="#FF4444" />
      <path d="M12,24 Q12,16 16,16 Q20,16 20,22 Q20,28 12,24" fill="white" />
      <rect x="44" y="28" width="4" height="26" rx="2" fill="white" />
      <path d="M46,28 Q46,20 42,20 Q38,20 38,26 Q38,32 46,28" fill="#4D96FF" />
      <path d="M46,28 Q46,20 50,20 Q54,20 54,26 Q54,32 46,28" fill="white" />
      <circle cx="30" cy="52" r="5" fill="#FF4444" /><circle cx="54" cy="54" r="4" fill="#6BCB77" />
      <circle cx="40" cy="50" r="3" fill="#FFD93D" /><circle cx="18" cy="54" r="3" fill="#9B59B6" />
    </svg>
  ),

  // Snowy Mountain
  'a1b2c3d4-0050-0000-0000-000000000050': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#B3E5FC" />
      <rect x="0" y="50" width="64" height="14" fill="white" />
      <polygon points="0,50 20,16 40,50" fill="#78909C" />
      <polygon points="20,16 14,28 26,28" fill="white" />
      <polygon points="24,50 48,8 64,50" fill="#90A4AE" />
      <polygon points="48,8 40,24 56,24" fill="white" />
      <circle cx="8" cy="12" r="2" fill="white" /><circle cx="16" cy="8" r="1.5" fill="white" />
      <circle cx="52" cy="16" r="1.5" fill="white" /><circle cx="36" cy="6" r="1" fill="white" />
      <circle cx="58" cy="30" r="2" fill="white" /><circle cx="4" cy="36" r="1.5" fill="white" />
    </svg>
  ),

  // Rainbow Sky
  'a1b2c3d4-0051-0000-0000-000000000051': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#87CEEB" />
      <path d="M0,48 Q32,0 64,48" fill="none" stroke="#FF4444" strokeWidth="4" />
      <path d="M4,48 Q32,6 60,48" fill="none" stroke="#FF9800" strokeWidth="4" />
      <path d="M8,48 Q32,12 56,48" fill="none" stroke="#FFD93D" strokeWidth="4" />
      <path d="M12,48 Q32,18 52,48" fill="none" stroke="#6BCB77" strokeWidth="4" />
      <path d="M16,48 Q32,24 48,48" fill="none" stroke="#4D96FF" strokeWidth="4" />
      <path d="M20,48 Q32,30 44,48" fill="none" stroke="#9B59B6" strokeWidth="4" />
      <ellipse cx="8" cy="48" rx="10" ry="6" fill="white" />
      <ellipse cx="56" cy="48" rx="10" ry="6" fill="white" />
    </svg>
  ),

  // Volcano Island
  'a1b2c3d4-0052-0000-0000-000000000052': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#87CEEB" />
      <rect x="0" y="48" width="64" height="16" fill="#1565C0" />
      <polygon points="16,48 32,12 48,48" fill="#795548" />
      <polygon points="26,20 32,12 38,20" fill="#BF360C" />
      <circle cx="30" cy="14" r="3" fill="#FF9800" fillOpacity="0.7" />
      <circle cx="34" cy="10" r="4" fill="#FF5722" fillOpacity="0.5" />
      <circle cx="32" cy="6" r="3" fill="#FF9800" fillOpacity="0.4" />
      <polygon points="4,48 10,38 16,48" fill="#4CAF50" />
      <polygon points="48,48 54,36 60,48" fill="#4CAF50" />
      <ellipse cx="8" cy="48" rx="10" ry="4" fill="#FFD93D" />
      <ellipse cx="56" cy="48" rx="10" ry="4" fill="#FFD93D" />
    </svg>
  ),

  // ===================== ACCESSORIES =====================

  // Champion Medal
  'a1b2c3d4-0008-0000-0000-000000000008': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="22,4 18,24 32,24 28,4" fill="#4D96FF" />
      <polygon points="36,4 32,24 46,24 42,4" fill="#FF4444" />
      <circle cx="32" cy="38" r="18" fill="#FFD93D" stroke="#E6A800" strokeWidth="3" />
      <circle cx="32" cy="38" r="13" fill="#FFC107" stroke="#E6A800" strokeWidth="1" />
      <polygon points="32,26 29,34 22,34 28,38 26,46 32,42 38,46 36,38 42,34 35,34" fill="#FFD93D" />
    </svg>
  ),

  // Bow Tie
  'a1b2c3d4-0053-0000-0000-000000000053': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="32,28 8,14 8,50 32,36" fill="#FF4444" stroke="#CC0000" strokeWidth="2" />
      <polygon points="32,28 56,14 56,50 32,36" fill="#FF4444" stroke="#CC0000" strokeWidth="2" />
      <circle cx="32" cy="32" r="6" fill="#CC0000" stroke="#990000" strokeWidth="2" />
    </svg>
  ),

  // Scarf
  'a1b2c3d4-0054-0000-0000-000000000054': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8,16 Q32,24 56,16 Q56,28 56,30 Q32,38 8,30 Z" fill="#4D96FF" stroke="#2D6FD9" strokeWidth="2" />
      <rect x="40" y="30" width="14" height="28" rx="3" fill="#4D96FF" stroke="#2D6FD9" strokeWidth="2" />
      <line x1="40" y1="40" x2="54" y2="40" stroke="#2D6FD9" strokeWidth="1.5" />
      <line x1="40" y1="48" x2="54" y2="48" stroke="#2D6FD9" strokeWidth="1.5" />
      <rect x="42" y="58" width="3" height="4" fill="#4D96FF" />
      <rect x="47" y="58" width="3" height="4" fill="#4D96FF" />
      <rect x="52" y="58" width="3" height="4" fill="#4D96FF" />
    </svg>
  ),

  // Backpack
  'a1b2c3d4-0055-0000-0000-000000000055': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="14" width="40" height="44" rx="8" fill="#FF4444" stroke="#CC0000" strokeWidth="2" />
      <rect x="20" y="8" width="24" height="12" rx="6" fill="#FF4444" stroke="#CC0000" strokeWidth="2" />
      <rect x="18" y="32" width="28" height="18" rx="4" fill="#CC0000" />
      <rect x="28" y="32" width="8" height="10" rx="2" fill="#FFD93D" />
      <path d="M16,24 Q12,24 12,28" stroke="#CC0000" strokeWidth="3" fill="none" />
      <path d="M48,24 Q52,24 52,28" stroke="#CC0000" strokeWidth="3" fill="none" />
    </svg>
  ),

  // Wings
  'a1b2c3d4-0056-0000-0000-000000000056': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32,32 Q16,8 4,16 Q0,24 8,32 Q4,28 2,36 Q0,44 12,40 Q6,42 8,48 Q12,52 20,44 Z" fill="white" stroke="#DDD" strokeWidth="1.5" />
      <path d="M32,32 Q48,8 60,16 Q64,24 56,32 Q60,28 62,36 Q64,44 52,40 Q58,42 56,48 Q52,52 44,44 Z" fill="white" stroke="#DDD" strokeWidth="1.5" />
      <path d="M32,32 Q20,16 10,22" fill="none" stroke="#EEE" strokeWidth="1" />
      <path d="M32,32 Q44,16 54,22" fill="none" stroke="#EEE" strokeWidth="1" />
    </svg>
  ),

  // Necklace
  'a1b2c3d4-0057-0000-0000-000000000057': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12,12 Q12,44 32,52 Q52,44 52,12" fill="none" stroke="#C4A35A" strokeWidth="3" />
      <circle cx="32" cy="52" r="8" fill="#C4A35A" stroke="#8B6914" strokeWidth="2" />
      <circle cx="32" cy="52" r="5" fill="#FF4444" />
      <circle cx="32" cy="52" r="2" fill="#FF6B6B" />
    </svg>
  ),

  // Tail Bow
  'a1b2c3d4-0058-0000-0000-000000000058': (w, h) => (
    <svg width={w} height={h} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="32,28 8,16 8,48 32,36" fill="#FF69B4" stroke="#E84583" strokeWidth="2" />
      <polygon points="32,28 56,16 56,48 32,36" fill="#FF69B4" stroke="#E84583" strokeWidth="2" />
      <circle cx="32" cy="32" r="5" fill="#E84583" stroke="#C62D6A" strokeWidth="2" />
      <path d="M32,37 L28,56" stroke="#FF69B4" strokeWidth="3" strokeLinecap="round" />
      <path d="M32,37 L36,56" stroke="#FF69B4" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
};

/**
 * Renders an inline SVG for a shop item.
 * Returns null if the itemId is not recognised.
 */
export function renderShopItemSvg(
  itemId: string,
  width: number,
  height: number,
): React.ReactNode {
  const renderer = svgMap[itemId];
  if (!renderer) return null;
  return renderer(width, height);
}
