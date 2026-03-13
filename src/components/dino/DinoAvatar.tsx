'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DinoBody } from './dino-shapes';
import { EquipmentLayer } from './equipment-shapes';
import {
  ATTACHMENT_POINTS,
  COLOR_THEMES,
  type DinoColor,
  type DinoType,
  type EquipmentSlot,
} from './dino-types';

interface DinoAvatarProps {
  dinoType: DinoType;
  dinoColor: DinoColor;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loadout?: Partial<Record<EquipmentSlot, string>>;
  animate?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<DinoAvatarProps['size']>, string> = {
  sm: 'w-12 h-12',   // 48px
  md: 'w-24 h-24',   // 96px
  lg: 'w-40 h-40',   // 160px
  xl: 'w-60 h-60',   // 240px
};

/**
 * Render order for equipment slots.
 * Background goes behind the dino; everything else goes on top.
 */
const FOREGROUND_SLOTS: EquipmentSlot[] = [
  'body',
  'feet',
  'handheld',
  'accessory',
  'head',
  'eyes',
];

export default function DinoAvatar({
  dinoType,
  dinoColor,
  size = 'md',
  loadout,
  animate = true,
  className,
}: DinoAvatarProps) {
  const colors = COLOR_THEMES[dinoColor];
  const sizeClass = SIZE_CLASSES[size];
  const points = ATTACHMENT_POINTS[dinoType];

  return (
    <motion.div
      initial={animate ? { scale: 0.5, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'relative inline-flex items-center justify-center',
        sizeClass,
        className,
      )}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        aria-hidden="true"
      >
        {/* Background circle */}
        <circle cx="100" cy="100" r="95" fill={colors.belly} />

        {/* Background equipment (rendered behind dino) */}
        {loadout?.background && (
          <g transform={`translate(${points.background[0]}, ${points.background[1]})`}>
            <EquipmentLayer slot="background" itemName={loadout.background} />
          </g>
        )}

        {/* Dino body */}
        <DinoBody type={dinoType} colors={colors} />

        {/* Foreground equipment (rendered on top of dino) */}
        {FOREGROUND_SLOTS.map((slot) => {
          const itemName = loadout?.[slot];
          if (!itemName) return null;
          const [x, y] = points[slot];
          return (
            <g key={slot} transform={`translate(${x}, ${y})`}>
              <EquipmentLayer slot={slot} itemName={itemName} />
            </g>
          );
        })}
      </svg>
    </motion.div>
  );
}
