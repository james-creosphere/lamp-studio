import type { PatternInstance } from "../geometry/pattern2D";
import type { InterpolatableShape } from "../geometry/crossSections/crossSectionTypes";
import { generateShapeVerticesForFill } from "../geometry/pattern2D";

/**
 * Converts pattern instances to InterpolatableShape array
 * Only includes black shapes (even indices) for the fractal body
 * Optionally marks shapes for removal (returns null for removed shapes)
 */
export function patternInstancesToInterpolatableShapes(
  instances: PatternInstance[],
  removeShapes: boolean = false,
  removeFrequency: number = 2
): (InterpolatableShape | null)[] {
  // Filter to only black shapes (even indices)
  const blackShapes = instances.filter((_, i) => i % 2 === 0);
  
  // Return shapes, marking some as null if they should be removed
  return blackShapes.map((instance, i) => {
    if (removeShapes && i % removeFrequency === 0) {
      return null; // Mark for removal
    }
    return {
      points: generateShapeVerticesForFill(instance)
    };
  });
}

