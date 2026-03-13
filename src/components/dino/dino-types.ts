export const DINO_TYPES = [
  'trex',
  'stegosaurus',
  'triceratops',
  'brachiosaurus',
  'raptor',
  'ankylosaurus',
  'pterodactyl',
  'diplodocus',
  'spinosaurus',
  'parasaurolophus',
] as const;

export type DinoType = (typeof DINO_TYPES)[number];

export const DINO_COLORS = ['green', 'blue', 'purple', 'orange', 'pink'] as const;
export type DinoColor = (typeof DINO_COLORS)[number];

export const EQUIPMENT_SLOTS = [
  'head',
  'body',
  'eyes',
  'feet',
  'handheld',
  'background',
  'accessory',
] as const;
export type EquipmentSlot = (typeof EQUIPMENT_SLOTS)[number];

export interface DinoColors {
  body: string;
  outline: string;
  belly: string;
  eye: string;
  claw: string;
}

export const COLOR_THEMES: Record<DinoColor, DinoColors> = {
  green: {
    body: '#4CAF50',
    outline: '#2E7D32',
    belly: '#A5D6A7',
    eye: '#1B5E20',
    claw: '#1B5E20',
  },
  blue: {
    body: '#42A5F5',
    outline: '#1565C0',
    belly: '#BBDEFB',
    eye: '#0D47A1',
    claw: '#0D47A1',
  },
  purple: {
    body: '#AB47BC',
    outline: '#6A1B9A',
    belly: '#E1BEE7',
    eye: '#4A148C',
    claw: '#4A148C',
  },
  orange: {
    body: '#FF7043',
    outline: '#BF360C',
    belly: '#FFCCBC',
    eye: '#7F3B00',
    claw: '#7F3B00',
  },
  pink: {
    body: '#EC407A',
    outline: '#880E4F',
    belly: '#FCE4EC',
    eye: '#560027',
    claw: '#560027',
  },
};

export const DINO_DISPLAY_NAMES: Record<DinoType, string> = {
  trex: 'T-Rex',
  stegosaurus: 'Stegosaurus',
  triceratops: 'Triceratops',
  brachiosaurus: 'Brachiosaurus',
  raptor: 'Raptor',
  ankylosaurus: 'Ankylosaurus',
  pterodactyl: 'Pterodactyl',
  diplodocus: 'Diplodocus',
  spinosaurus: 'Spinosaurus',
  parasaurolophus: 'Parasaurolophus',
};

export const DINO_COLOR_LABELS: Record<DinoColor, string> = {
  green: 'Green',
  blue: 'Blue',
  purple: 'Purple',
  orange: 'Orange',
  pink: 'Pink',
};

/**
 * Attachment points for each equipment slot on each dino type.
 * Coordinates are absolute within the 200×200 SVG viewBox.
 * The "background" slot uses (100, 100) — the centre of the background circle.
 */
export const ATTACHMENT_POINTS: Record<
  DinoType,
  Record<EquipmentSlot, [number, number]>
> = {
  trex: {
    head: [140, 36],
    body: [85, 128],
    eyes: [142, 58],
    feet: [78, 192],
    handheld: [96, 96],
    background: [100, 100],
    accessory: [88, 138],
  },
  stegosaurus: {
    head: [160, 92],
    body: [90, 132],
    eyes: [154, 104],
    feet: [92, 190],
    handheld: [130, 174],
    background: [100, 100],
    accessory: [90, 142],
  },
  triceratops: {
    head: [152, 56],
    body: [80, 132],
    eyes: [152, 88],
    feet: [83, 192],
    handheld: [120, 176],
    background: [100, 100],
    accessory: [80, 142],
  },
  brachiosaurus: {
    head: [148, 4],
    body: [80, 142],
    eyes: [142, 12],
    feet: [82, 194],
    handheld: [114, 116],
    background: [100, 100],
    accessory: [80, 152],
  },
  raptor: {
    head: [142, 32],
    body: [82, 116],
    eyes: [140, 48],
    feet: [74, 178],
    handheld: [92, 86],
    background: [100, 100],
    accessory: [86, 122],
  },
  ankylosaurus: {
    head: [174, 112],
    body: [100, 130],
    eyes: [172, 122],
    feet: [102, 186],
    handheld: [142, 172],
    background: [100, 100],
    accessory: [100, 136],
  },
  pterodactyl: {
    head: [100, 42],
    body: [100, 108],
    eyes: [100, 58],
    feet: [100, 158],
    handheld: [100, 94],
    background: [100, 100],
    accessory: [100, 114],
  },
  diplodocus: {
    head: [30, 0],
    body: [96, 140],
    eyes: [24, 8],
    feet: [97, 190],
    handheld: [76, 114],
    background: [100, 100],
    accessory: [96, 150],
  },
  spinosaurus: {
    head: [152, 78],
    body: [84, 130],
    eyes: [148, 92],
    feet: [82, 190],
    handheld: [100, 100],
    background: [100, 100],
    accessory: [86, 140],
  },
  parasaurolophus: {
    head: [152, 50],
    body: [82, 132],
    eyes: [154, 64],
    feet: [80, 192],
    handheld: [98, 98],
    background: [100, 100],
    accessory: [84, 142],
  },
};
