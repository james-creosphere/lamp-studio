import * as THREE from "three";
import type { InterpolatableShape, Point2D } from "./crossSections/crossSectionTypes";
import { generateCrossSections } from "./crossSections/generateCrossSections";
import { addAlternatingHoles } from "./crossSections/addAlternatingHoles";
import { loftCrossSections3D } from "./loft3D";

/**
 * Options for creating a fractal body from 2D polygons
 */
export interface FractalBodyOptions {
  polygons2D: (InterpolatableShape | null)[]; // from your 2D pattern generator, null = removed shape
  height: number;
  twist?: number; // degrees of twist from base to tip
  taper?: number; // multiply radii by (1 - taper * t)
  normalize?: boolean; // if true, resample vertices to same count
  easing?: (t: number) => number; // optional curve for interpolation
  enableHoles?: boolean; // if true, add holes to sections
  holeFrequency?: number; // e.g., 2 means every 2nd section has holes
  holeScale?: number; // 0.2-0.6 scaling for hole size
}

/**
 * Calculates the area of a polygon using the shoelace formula
 */
function calculateArea(points: { x: number; y: number }[]): number {
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
 * Creates a 3D fractal body from 2D polygons
 * 
 * Steps:
 * 1. Sort polygons by size (area)
 * 2. Generate cross sections with optional vertex normalization
 * 3. Add alternating holes if enabled
 * 4. Loft cross sections into 3D geometry with twist and taper
 * 5. Return the finished BufferGeometry
 */
export function createFractalBody(
  options: FractalBodyOptions
): THREE.BufferGeometry {
  const {
    polygons2D,
    height,
    twist = 0,
    taper = 0,
    normalize = false,
    easing,
    enableHoles = false,
    holeFrequency = 2,
    holeScale = 0.35
  } = options;

  // Check if there are any valid (non-null) polygons
  const hasValidPolygons = polygons2D.some(p => p !== null);
  if (!hasValidPolygons) {
    return new THREE.BufferGeometry();
  }

  // Step 1: Pass polygons directly (preserve order when removing shapes)
  // Note: polygons2D may contain null values for removed shapes
  let crossSections = generateCrossSections({
    baseShapes: polygons2D,
    easing,
    normalizeVertexCount: normalize
  });

  // Step 3: Add alternating holes if enabled
  if (enableHoles) {
    // Create hole pattern based on frequency
    const holePattern = (index: number): boolean => {
      return index % holeFrequency === 0;
    };

    // Create hole shape generator with specified scale
    const holeShapeGenerator = (outer: Point2D[], t: number): Point2D[] => {
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

      // Use holeScale for consistent sizing (clamp to 0.2-0.6 range)
      const scaleFactor = Math.max(0.2, Math.min(0.6, holeScale));

      // Create scaled-down polygon centered at centroid
      // Keep the same vertex count as outer
      return outer.map(point => ({
        x: centroid.x + (point.x - centroid.x) * scaleFactor,
        y: centroid.y + (point.y - centroid.y) * scaleFactor
      }));
    };

    crossSections = addAlternatingHoles({
      sections: crossSections,
      holePattern,
      holeShapeGenerator
    });
  }

  // Step 4: Pass the resulting CrossSection2D[] into loftCrossSections3D
  const geometry = loftCrossSections3D({
    sections: crossSections,
    totalHeight: height,
    twistAmount: twist,
    taperAmount: taper,
    smoothNormals: true
  });

  // Step 5: Return the finished BufferGeometry
  return geometry;
}

