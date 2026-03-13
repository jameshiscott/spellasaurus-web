"use client";

import { useState } from "react";
import { DinoAvatar } from "./DinoAvatar";
import { DINO_TYPES, DINO_COLORS } from "./types";
import type { DinoType, DinoColor } from "./types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface DinoAvatarPreviewProps {
  initialType?: DinoType;
  initialColor?: DinoColor;
  onSelect?: (type: DinoType, color: DinoColor) => void;
}

const DINO_COLOR_HEX: Record<DinoColor, string> = {
  green:  "#4CAF50",
  blue:   "#42A5F5",
  purple: "#AB47BC",
  orange: "#FFA726",
  pink:   "#EC407A",
};

const DINO_LABELS: Record<DinoType, string> = {
  trex:            "T-Rex",
  triceratops:     "Triceratops",
  stegosaurus:     "Stegosaurus",
  brachiosaurus:   "Brachiosaurus",
  raptor:          "Raptor",
  ankylosaurus:    "Ankylosaurus",
  diplodocus:      "Diplodocus",
  spinosaurus:     "Spinosaurus",
  pterodactyl:     "Pterodactyl",
  parasaurolophus: "Parasaurolophus",
};

export function DinoAvatarPreview({
  initialType = "trex",
  initialColor = "green",
  onSelect,
}: DinoAvatarPreviewProps) {
  const [selectedType, setSelectedType]   = useState<DinoType>(initialType);
  const [selectedColor, setSelectedColor] = useState<DinoColor>(initialColor);

  const handleSelect = (type: DinoType, color: DinoColor) => {
    setSelectedType(type);
    setSelectedColor(color);
    onSelect?.(type, color);
  };

  return (
    <div className="space-y-6">
      {/* Large animated preview */}
      <div className="flex justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedType}-${selectedColor}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <DinoAvatar
              dinoType={selectedType}
              dinoColor={selectedColor}
              size="xl"
              animated
              showBackground
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Name */}
      <p className="text-center text-xl font-black text-foreground">
        {DINO_LABELS[selectedType]}
      </p>

      {/* Colour picker */}
      <div>
        <p className="text-center text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wide">
          Pick a Colour
        </p>
        <div className="flex justify-center gap-3">
          {DINO_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleSelect(selectedType, color)}
              className={cn(
                "w-10 h-10 rounded-full border-4 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2",
                selectedColor === color
                  ? "border-foreground scale-110 shadow-lg"
                  : "border-transparent",
              )}
              style={{ backgroundColor: DINO_COLOR_HEX[color] }}
              aria-label={`${color} colour`}
            />
          ))}
        </div>
      </div>

      {/* Dino type grid */}
      <div>
        <p className="text-center text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wide">
          Pick a Dinosaur
        </p>
        <div className="grid grid-cols-5 gap-2">
          {DINO_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => handleSelect(type, selectedColor)}
              className={cn(
                "rounded-2xl p-1 transition-all hover:scale-105 focus:outline-none border-2",
                selectedType === type
                  ? "border-brand-500 bg-brand-50 shadow-md scale-105"
                  : "border-transparent bg-white hover:border-brand-200",
              )}
              aria-label={DINO_LABELS[type]}
              title={DINO_LABELS[type]}
            >
              <DinoAvatar
                dinoType={type}
                dinoColor={selectedColor}
                size="sm"
                showBackground={false}
              />
              <p className="text-[9px] font-bold text-center mt-1 text-muted-foreground leading-tight">
                {DINO_LABELS[type].split(" ")[0]}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
