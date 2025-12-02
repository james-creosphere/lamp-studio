import type { CrossSection2D, InterpolatableShape, Point2D } from "./crossSectionTypes";
import { resamplePolygon } from "./resamplePolygon";

/**
 * Options for generating cross sections
 */
export interface GenerateCrossSectionsOptions {
  baseShapes: (InterpolatableShape | null)[]; // ordered from largest to smallest, null = removed/empty
  easing?: (t: number) => number; // optional curve for interpolation
  normalizeVertexCount?: boolean; // if true, resample vertices
}

/**
 * Calculates the signed area of a polygon using the shoelace formula.
 * Positive area indicates counter-clockwise winding (CCW).
 */
function calculateArea(points: Point2D[]): number {
  if (points.length < 3) return 0;
  
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

/**
 * Calculates the perimeter length of a polygon
 */
function calculatePerimeter(points: Point2D[]): number {
  if (points.length < 2) return 0;
  
  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const dx = points[j].x - points[i].x;
    const dy = points[j].y - points[i].y;
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }
  return perimeter;
}


/**
 * Finds the maximum vertex count among all shapes
 */
function getMaxVertexCount(shapes: InterpolatableShape[]): number {
  return Math.max(...shapes.map(shape => shape.points.length), 0);
}

/**
 * Generates cross sections from base shapes.
 * 
 * @param options - Configuration options
 * @returns Array of cross sections with normalized t values (0 = bottom/largest, 1 = top/smallest)
 */
export function generateCrossSections(
  options: GenerateCrossSectionsOptions
): CrossSection2D[] {
  const {
    baseShapes,
    easing,
    normalizeVertexCount = false
  } = options;

  if (baseShapes.length === 0) {
    return [];
  }

  // Process shapes in original order (don't sort when removing shapes)
  // First, collect valid shapes and calculate max vertex count if normalizing
  const validShapes = baseShapes.filter((shape): shape is InterpolatableShape => shape !== null);
  
  if (validShapes.length === 0) {
    return [];
  }

  // Normalize vertex count if requested
  let processedShapes: InterpolatableShape[];
  if (normalizeVertexCount) {
    const maxVertexCount = getMaxVertexCount(validShapes);
    processedShapes = validShapes.map(shape => ({
      points: resamplePolygon(shape.points, maxVertexCount)
    }));
  } else {
    processedShapes = validShapes;
  }

  // Generate cross sections with normalized t values
  // Include empty sections for removed shapes to maintain spacing and create openings
  const n = baseShapes.length; // Use original count for t calculation
  const crossSections: CrossSection2D[] = [];
  
  let validShapeIndex = 0;
  for (let i = 0; i < baseShapes.length; i++) {
    const originalShape = baseShapes[i];
    
    // Normalize t to 0..1: i/(n-1)
    let t = n > 1 ? i / (n - 1) : 0;
    
    // Apply easing function if provided
    if (easing) {
      t = easing(t);
    }

    if (originalShape === null) {
      // Create empty section (no outer polygon) - this creates an opening
      crossSections.push({
        outer: [],
        holes: [],
        t
      });
    } else {
      // Use the processed shape (potentially normalized)
      crossSections.push({
        outer: processedShapes[validShapeIndex].points,
        holes: [],
        t
      });
      validShapeIndex++;
    }
  }

  return crossSections;
}

