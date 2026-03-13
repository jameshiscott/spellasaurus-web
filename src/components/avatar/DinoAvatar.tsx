"use client";

import { motion } from "framer-motion";
import { DinoSvg } from "./DinoSvg";
import type { DinoAvatarProps } from "./types";
import { cn } from "@/lib/utils";

const SIZE_MAP: Record<string, { px: number }> = {
  xs: { px: 48  },
  sm: { px: 80  },
  md: { px: 120 },
  lg: { px: 180 },
  xl: { px: 260 },
};

export function DinoAvatar({
  dinoType = "trex",
  dinoColor = "green",
  loadout = {},
  size = "md",
  animated = false,
  showBackground = true,
  className,
}: DinoAvatarProps) {
  const px = SIZE_MAP[size]?.px ?? 120;

  const content = (
    <DinoSvg
      dinoType={dinoType}
      dinoColor={dinoColor}
      loadout={loadout}
      showBackground={showBackground}
      width={px}
      height={px}
    />
  );

  if (animated) {
    return (
      <motion.div
        className={cn("inline-block select-none", className)}
        animate={{
          scaleY: [1, 1.03, 1],
          scaleX: [1, 0.98, 1],
          y: [0, -3, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ width: px, height: px }}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div
      className={cn("inline-block select-none", className)}
      style={{ width: px, height: px }}
    >
      {content}
    </div>
  );
}
