import type { EasingType } from "../types/PatternParams";

/**
 * Easing functions for interpolation
 */
export const easingFunctions: Record<EasingType, (t: number) => number> = {
  linear: (t: number) => t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t: number) => 
    t < 0.5 
      ? 2 * t * t 
      : 1 - Math.pow(-2 * t + 2, 2) / 2
};

/**
 * Gets an easing function by type
 */
export function getEasingFunction(type: EasingType): (t: number) => number {
  return easingFunctions[type];
}

