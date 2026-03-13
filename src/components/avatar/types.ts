export const AVATAR_SLOTS = ['head', 'body', 'eyes', 'feet', 'handheld', 'background', 'accessory'] as const;
export type AvatarSlot = typeof AVATAR_SLOTS[number];

export const DINO_TYPES = ['trex', 'triceratops', 'stegosaurus', 'brachiosaurus', 'raptor', 'ankylosaurus', 'diplodocus', 'spinosaurus', 'pterodactyl', 'parasaurolophus'] as const;
export type DinoType = typeof DINO_TYPES[number];

export const DINO_COLORS = ['green', 'blue', 'purple', 'orange', 'pink'] as const;
export type DinoColor = typeof DINO_COLORS[number];

export type AvatarLoadout = Partial<Record<AvatarSlot, string | null>>;

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface DinoAvatarProps {
  dinoType?: DinoType;
  dinoColor?: DinoColor;
  loadout?: AvatarLoadout;
  size?: AvatarSize;
  animated?: boolean;       // enables idle breathing animation
  showBackground?: boolean; // shows background circle (true by default)
  className?: string;
}
