'use client';

import { cn } from '@/lib/utils';
import DinoAvatar from './DinoAvatar';
import {
  DINO_DISPLAY_NAMES,
  DINO_TYPES,
  type DinoColor,
  type DinoType,
} from './dino-types';

interface DinoTypePickerProps {
  value: DinoType;
  color: DinoColor;
  onChange: (type: DinoType) => void;
}

export default function DinoTypePicker({
  value,
  color,
  onChange,
}: DinoTypePickerProps) {
  return (
    <div
      className="grid grid-cols-4 gap-2 p-1"
      role="radiogroup"
      aria-label="Choose your dinosaur type"
    >
      {DINO_TYPES.map((type) => {
        const isSelected = type === value;
        return (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(type)}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-2xl border-2 cursor-pointer',
              'transition-all duration-200 select-none',
              'focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-400',
              isSelected
                ? 'ring-4 ring-brand-500 bg-brand-50 scale-110 border-brand-400'
                : 'ring-2 ring-transparent hover:ring-brand-200 border-transparent bg-white hover:bg-brand-50',
            )}
          >
            <DinoAvatar
              dinoType={type}
              dinoColor={color}
              size="sm"
              animate={false}
            />
            <span
              className={cn(
                'text-xs font-semibold font-nunito text-center leading-tight',
                isSelected ? 'text-brand-700' : 'text-gray-600',
              )}
            >
              {DINO_DISPLAY_NAMES[type]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
