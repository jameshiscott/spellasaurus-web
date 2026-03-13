'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  COLOR_THEMES,
  DINO_COLOR_LABELS,
  DINO_COLORS,
  type DinoColor,
} from './dino-types';

interface DinoColorPickerProps {
  value: DinoColor;
  onChange: (color: DinoColor) => void;
}

export default function DinoColorPicker({ value, onChange }: DinoColorPickerProps) {
  return (
    <div
      className="flex flex-row items-start gap-4 flex-wrap justify-center"
      role="radiogroup"
      aria-label="Choose your dinosaur colour"
    >
      {DINO_COLORS.map((color) => {
        const isSelected = color === value;
        const theme = COLOR_THEMES[color];
        return (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(color)}
            className={cn(
              'flex flex-col items-center gap-2 cursor-pointer group',
              'focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-400 rounded-full',
            )}
          >
            <motion.div
              animate={{ scale: isSelected ? 1.15 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className={cn(
                'w-12 h-12 rounded-full border-4 transition-all duration-200',
                isSelected
                  ? 'ring-4 ring-offset-2 ring-brand-500 shadow-lg'
                  : 'ring-2 ring-offset-1 ring-transparent group-hover:ring-brand-300 group-hover:ring-offset-2',
              )}
              style={{
                backgroundColor: theme.body,
                borderColor: theme.outline,
              }}
              aria-hidden="true"
            />
            <span
              className={cn(
                'text-xs font-semibold font-nunito transition-colors duration-200',
                isSelected ? 'text-brand-700' : 'text-gray-500',
              )}
            >
              {DINO_COLOR_LABELS[color]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
