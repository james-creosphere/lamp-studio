import type { CrossSection2D, InterpolatableShape, Point2D } from "./crossSectionTypes";
import { resamplePolygon } from "./resamplePolygon";

/**
 * Options for generating cross sections
 */
export interface GenerateCrossSectionsOptions {
  baseShapes: InterpolatableShape[]; // ordered from largest to smallest
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

  // Create array with shapes and their areas for sorting
  const shapesWithAreas = baseShapes.map(shape => ({
    shape,
    area: calculateArea(shape.points)
  }));

  // Sort shapes from largest to smallest area (bottom to top)
  // Largest area = bottom (t=0), smallest area = top (t=1)
  shapesWithAreas.sort((a, b) => b.area - a.area);

  // Normalize vertex count if requested
  let processedShapes: InterpolatableShape[];
  if (normalizeVertexCount) {
    const maxVertexCount = getMaxVertexCount(baseShapes);
    processedShapes = shapesWithAreas.map(({ shape }) => ({
      points: resamplePolygon(shape.points, maxVertexCount)
    }));
  } else {
    processedShapes = shapesWithAreas.map(({ shape }) => shape);
  }

  // Generate cross sections with normalized t values
  const n = processedShapes.length;
  const crossSections: CrossSection2D[] = processedShapes.map((shape, i) => {
    // Normalize t to 0..1: i/(n-1)
    // When n=1, t=0; when n>1, first shape (i=0) has t=0, last shape (i=n-1) has t=1
    let t = n > 1 ? i / (n - 1) : 0;
    
    // Apply easing function if provided
    if (easing) {
      t = easing(t);
    }

    return {
      points: shape.points,
      t
    };
  });

  return crossSections;
}

