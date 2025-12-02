import type { CrossSection2D, Point2D } from "./crossSectionTypes";

/**
 * Options for adding alternating holes to cross sections
 */
export interface AddAlternatingHolesOptions {
  sections: CrossSection2D[];
  holePattern?: (index: number) => boolean; // determines which sections get holes
  holeShapeGenerator?: (outer: Point2D[], t: number) => Point2D[]; // returns polygon for a hole
}

/**
 * Default hole pattern: every other section gets a hole (even indices)
 */
function defaultHolePattern(index: number): boolean {
  return index % 2 === 0;
}

/**
 * Default hole shape generator: creates a scaled-down version of the outer shape
 * 
 * - Shrinks the outer polygon to 25-40% of its size around centroid
 * - Keeps the same vertex count as outer
 * - Returns the hole polygon
 */
function defaultHoleShapeGenerator(outer: Point2D[], t: number): Point2D[] {
  if (outer.length === 0) return [];

  // Calculate centroid
  let sumX = 0;
  let sumY = 0;
  for (const point of outer) {
    sumX += point.x;
    sumY += point.y;
  }
  const centroid = {
    x: sumX / outer.length,
    y: sumY / outer.length
  };

  // Scale factor: 25% at top (t=1), 40% at bottom (t=0)
  // Linear interpolation: scale = 0.40 - (0.40 - 0.25) * t = 0.40 - 0.15 * t
  const scaleFactor = 0.40 - 0.15 * t;

  // Create scaled-down polygon centered at centroid
  // Keep the same vertex count as outer
  return outer.map(point => ({
    x: centroid.x + (point.x - centroid.x) * scaleFactor,
    y: centroid.y + (point.y - centroid.y) * scaleFactor
  }));
}

/**
 * Adds alternating holes to cross sections based on a pattern.
 * 
 * For each section where holePattern(index) returns true:
 * - Calls holeShapeGenerator(outer, t) to generate a hole polygon
 * - Adds that polygon to section.holes
 * 
 * @param options - Configuration options
 * @returns Updated array of cross sections with holes added
 */
export function addAlternatingHoles(
  options: AddAlternatingHolesOptions
): CrossSection2D[] {
  const {
    sections,
    holePattern = defaultHolePattern,
    holeShapeGenerator = defaultHoleShapeGenerator
  } = options;

  // Create a new array with updated sections
  return sections.map((section, index) => {
    // Check if this section should have a hole
    if (holePattern(index)) {
      // Generate hole polygon
      const holePolygon = holeShapeGenerator(section.outer, section.t);

      // Create new section with hole added
      return {
        ...section,
        holes: [...section.holes, holePolygon]
      };
    }

    // Return section unchanged if no hole pattern matches
    return section;
  });
}

