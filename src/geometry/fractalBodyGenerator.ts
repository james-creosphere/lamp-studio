import * as THREE from "three";
import type { InterpolatableShape } from "./crossSections/crossSectionTypes";
import { generateCrossSections } from "./crossSections/generateCrossSections";
import { loftCrossSections3D } from "./loft3D";

/**
 * Options for creating a fractal body from 2D polygons
 */
export interface FractalBodyOptions {
  polygons2D: InterpolatableShape[]; // from your 2D pattern generator
  height: number;
  twist?: number; // degrees of twist from base to tip
  taper?: number; // multiply radii by (1 - taper * t)
  normalize?: boolean; // if true, resample vertices to same count
  easing?: (t: number) => number; // optional curve for interpolation
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
 * 3. Loft cross sections into 3D geometry with twist and taper
 * 4. Return the finished BufferGeometry
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
    easing
  } = options;

  if (polygons2D.length === 0) {
    return new THREE.BufferGeometry();
  }

  // Step 1: Sort polygons by size (area)
  const polygonsWithAreas = polygons2D.map(polygon => ({
    polygon,
    area: calculateArea(polygon.points)
  }));

  // Sort from largest to smallest (bottom to top)
  polygonsWithAreas.sort((a, b) => b.area - a.area);

  const sortedPolygons: InterpolatableShape[] = polygonsWithAreas.map(
    ({ polygon }) => polygon
  );

  // Step 2: Pass them to generateCrossSections with normalizeVertexCount=normalize
  const crossSections = generateCrossSections({
    baseShapes: sortedPolygons,
    easing,
    normalizeVertexCount: normalize
  });

  // Step 3: Pass the resulting CrossSection2D[] into loftCrossSections3D
  const geometry = loftCrossSections3D({
    sections: crossSections,
    totalHeight: height,
    twistAmount: twist,
    taperAmount: taper,
    smoothNormals: true
  });

  // Step 4: Return the finished BufferGeometry
  return geometry;
}

