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
    head: [150, 38],
    body: [105, 125],
    eyes: [153, 52],
    feet: [98, 180],
    handheld: [112, 90],
    background: [100, 100],
    accessory: [110, 132],
  },
  stegosaurus: {
    head: [166, 60],
    body: [105, 130],
    eyes: [162, 72],
    feet: [105, 182],
    handheld: [148, 156],
    background: [100, 100],
    accessory: [105, 135],
  },
  triceratops: {
    head: [158, 88],
    body: [105, 130],
    eyes: [158, 108],
    feet: [110, 184],
    handheld: [148, 156],
    background: [100, 100],
    accessory: [105, 132],
  },
  brachiosaurus: {
    head: [108, 6],
    body: [100, 140],
    eyes: [102, 16],
    feet: [85, 184],
    handheld: [120, 116],
    background: [100, 100],
    accessory: [100, 148],
  },
  raptor: {
    head: [150, 38],
    body: [108, 118],
    eyes: [148, 54],
    feet: [108, 174],
    handheld: [118, 94],
    background: [100, 100],
    accessory: [108, 128],
  },
  ankylosaurus: {
    head: [164, 110],
    body: [110, 128],
    eyes: [158, 123],
    feet: [105, 182],
    handheld: [148, 156],
    background: [100, 100],
    accessory: [110, 132],
  },
  pterodactyl: {
    head: [100, 44],
    body: [100, 110],
    eyes: [94, 60],
    feet: [98, 156],
    handheld: [100, 95],
    background: [100, 100],
    accessory: [100, 118],
  },
  diplodocus: {
    head: [60, 4],
    body: [100, 138],
    eyes: [54, 14],
    feet: [95, 184],
    handheld: [84, 114],
    background: [100, 100],
    accessory: [100, 146],
  },
  spinosaurus: {
    head: [156, 62],
    body: [105, 128],
    eyes: [148, 72],
    feet: [105, 184],
    handheld: [115, 100],
    background: [100, 100],
    accessory: [106, 135],
  },
  parasaurolophus: {
    head: [152, 60],
    body: [105, 130],
    eyes: [148, 72],
    feet: [105, 184],
    handheld: [118, 104],
    background: [100, 100],
    accessory: [106, 133],
  },
};
