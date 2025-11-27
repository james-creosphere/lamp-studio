import type { PatternInstance } from "../geometry/pattern2D";
import type { InterpolatableShape } from "../geometry/crossSections/crossSectionTypes";
import { generateShapeVerticesForFill } from "../geometry/pattern2D";

/**
 * Converts pattern instances to InterpolatableShape array
 * Only includes black shapes (even indices) for the fractal body
 */
export function patternInstancesToInterpolatableShapes(
  instances: PatternInstance[]
): InterpolatableShape[] {
  return instances
    .filter((_, i) => i % 2 === 0) // Only black shapes (even indices)
    .map(instance => ({
      points: generateShapeVerticesForFill(instance)
    }));
}

