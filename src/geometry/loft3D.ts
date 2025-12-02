import * as THREE from "three";
import type { CrossSection2D, Point2D } from "./crossSections/crossSectionTypes";

/**
 * Options for lofting cross sections into 3D geometry
 */
export interface LoftOptions {
  sections: CrossSection2D[];
  totalHeight: number;
  twistAmount?: number; // degrees of twist from base to tip
  taperAmount?: number; // multiply radii by (1 - taper * t)
  smoothNormals?: boolean;
}

/**
 * Calculates the centroid (center point) of a polygon
 */
function calculateCentroid(points: Point2D[]): Point2D {
  if (points.length === 0) return { x: 0, y: 0 };
  
  let sumX = 0;
  let sumY = 0;
  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
  }
  
  return {
    x: sumX / points.length,
    y: sumY / points.length
  };
}

/**
 * Scales points relative to a center point
 */
function scalePointsRelativeToCenter(
  points: Point2D[],
  center: Point2D,
  scale: number
): Point2D[] {
  return points.map(point => ({
    x: center.x + (point.x - center.x) * scale,
    y: center.y + (point.y - center.y) * scale
  }));
}

/**
 * Rotates a 2D point around the origin (for Y-axis rotation in 3D)
 */
function rotatePoint2D(point: Point2D, angleRad: number): Point2D {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos
  };
}

/**
 * Converts 2D points to 3D vertices at a specific height
 */
function pointsTo3DVertices(points: Point2D[], y: number): THREE.Vector3[] {
  return points.map(point => new THREE.Vector3(point.x, y, point.y));
}

/**
 * Creates triangles for a quad between two sections
 * Assumes both sections have the same vertex count
 */
function triangulateQuad(
  bottomVertices: THREE.Vector3[],
  topVertices: THREE.Vector3[],
  vertexOffset: number
): number[] {
  const indices: number[] = [];
  const vertexCount = bottomVertices.length;

  for (let i = 0; i < vertexCount; i++) {
    const nextI = (i + 1) % vertexCount;
    
    // Bottom triangle: bottom[i], top[i], bottom[nextI]
    indices.push(
      vertexOffset + i,
      vertexOffset + vertexCount + i,
      vertexOffset + nextI
    );
    
    // Top triangle: top[i], top[nextI], bottom[nextI]
    indices.push(
      vertexOffset + vertexCount + i,
      vertexOffset + vertexCount + nextI,
      vertexOffset + nextI
    );
  }

  return indices;
}

/**
 * Creates a cap (fan of triangles) at the tip
 */
function createTipCap(
  vertices: THREE.Vector3[],
  vertexOffset: number
): { indices: number[]; centerVertex: THREE.Vector3 } {
  const indices: number[] = [];
  const vertexCount = vertices.length;
  const centerIndex = vertexOffset + vertexCount;

  // Add center vertex (average of all vertices)
  const center = new THREE.Vector3();
  for (const vertex of vertices) {
    center.add(vertex);
  }
  center.divideScalar(vertexCount);

  // Create fan triangles
  for (let i = 0; i < vertexCount; i++) {
    const nextI = (i + 1) % vertexCount;
    indices.push(centerIndex, vertexOffset + i, vertexOffset + nextI);
  }

  return { indices, centerVertex: center };
}

/**
 * Processes a 2D polygon (outer or hole) with taper and twist transformations
 */
function processPolygon(
  points: Point2D[],
  t: number,
  totalHeight: number,
  twistAmount: number,
  taperAmount: number
): THREE.Vector3[] {
  if (points.length === 0) return [];

  // Compute y-height
  const y = t * totalHeight;

  // Apply taper by scaling relative to centroid
  let processedPoints = [...points];
  if (taperAmount !== 0) {
    const centroid = calculateCentroid(points);
    const taperScale = 1 - taperAmount * t;
    processedPoints = scalePointsRelativeToCenter(
      processedPoints,
      centroid,
      taperScale
    );
  }

  // Apply twist by rotating around Y axis
  if (twistAmount !== 0) {
    const twistRad = (twistAmount * t * Math.PI) / 180;
    processedPoints = processedPoints.map(point =>
      rotatePoint2D(point, twistRad)
    );
  }

  // Convert to 3D vertices
  return pointsTo3DVertices(processedPoints, y);
}

/**
 * Lofts 2D cross sections into 3D geometry with support for outer polygons and holes
 */
export function loftCrossSections3D(options: LoftOptions): THREE.BufferGeometry {
  const {
    sections,
    totalHeight,
    twistAmount = 0,
    taperAmount = 0,
    smoothNormals = true
  } = options;

  if (sections.length === 0) {
    return new THREE.BufferGeometry();
  }

  const geometry = new THREE.BufferGeometry();
  const vertices: THREE.Vector3[] = [];
  const indices: number[] = [];

  // Step 1: Process each section - store outer and holes separately
  const processedOuterSections: THREE.Vector3[][] = [];
  const processedHoleSections: THREE.Vector3[][][] = []; // [sectionIndex][holeIndex][vertices]

  for (const section of sections) {
    const { outer, holes, t } = section;

    // Process outer polygon
    const outerVertices = processPolygon(
      outer,
      t,
      totalHeight,
      twistAmount,
      taperAmount
    );
    processedOuterSections.push(outerVertices);

    // Process each hole polygon
    const sectionHoles: THREE.Vector3[][] = [];
    for (const hole of holes) {
      const holeVertices = processPolygon(
        hole,
        t,
        totalHeight,
        twistAmount,
        taperAmount
      );
      sectionHoles.push(holeVertices);
    }
    processedHoleSections.push(sectionHoles);
  }

  // Step 2: Create spine segments - only loft between immediately adjacent non-empty sections
  // This creates separate lofted segments with gaps between them when sections are removed
  for (let i = 0; i < processedOuterSections.length - 1; i++) {
    const bottomOuter = processedOuterSections[i];
    const topOuter = processedOuterSections[i + 1];

    // Skip if either section has no outer polygon (creates gap/opening)
    if (bottomOuter.length === 0 || topOuter.length === 0) {
      continue; // Skip lofting - this creates a gap between spine segments
    }

    // Only loft if sections are immediately adjacent (i+1 is the next section)
    // This creates a continuous spine segment
    const vertexOffset = vertices.length;
    vertices.push(...bottomOuter);
    vertices.push(...topOuter);

    // Triangulate quads between corresponding vertices to create the spine segment
    if (bottomOuter.length === topOuter.length) {
      const segmentIndices = triangulateQuad(
        bottomOuter,
        topOuter,
        vertexOffset
      );
      indices.push(...segmentIndices);
    } else if (bottomOuter.length !== topOuter.length) {
      console.warn(
        `Outer section ${i} and ${i + 1} have different vertex counts. ` +
        `Skipping triangulation.`
      );
    }
  }

  // Do NOT add caps - leave ends open to show the spiral spine structure

  // Step 3: Loft hole polygons independently (creating tube openings)
  // Find the maximum number of holes across all sections
  const maxHoles = Math.max(...processedHoleSections.map(holes => holes.length), 0);

  // Loft each hole index independently
  for (let holeIndex = 0; holeIndex < maxHoles; holeIndex++) {
    // Collect this hole from all sections (if it exists)
    const holeSections: THREE.Vector3[][] = [];
    for (let sectionIndex = 0; sectionIndex < processedHoleSections.length; sectionIndex++) {
      const sectionHoles = processedHoleSections[sectionIndex];
      if (holeIndex < sectionHoles.length) {
        holeSections.push(sectionHoles[holeIndex]);
      }
    }

    // Loft this hole as a tube (connecting adjacent sections)
    for (let i = 0; i < holeSections.length - 1; i++) {
      const bottomHole = holeSections[i];
      const topHole = holeSections[i + 1];

      // Add vertices for this hole segment
      const vertexOffset = vertices.length;
      vertices.push(...bottomHole);
      vertices.push(...topHole);

      // Triangulate quads to create tube walls
      // Note: Holes are CW, so we need to reverse winding for proper normals
      if (bottomHole.length === topHole.length && bottomHole.length > 0) {
        // Reverse the triangulation order for holes (CW winding)
        const vertexCount = bottomHole.length;
        for (let j = 0; j < vertexCount; j++) {
          const nextJ = (j + 1) % vertexCount;
          
          // Bottom triangle: bottom[j], bottom[nextJ], top[j] (reversed)
          indices.push(
            vertexOffset + j,
            vertexOffset + nextJ,
            vertexOffset + vertexCount + j
          );
          
          // Top triangle: top[j], bottom[nextJ], top[nextJ] (reversed)
          indices.push(
            vertexOffset + vertexCount + j,
            vertexOffset + nextJ,
            vertexOffset + vertexCount + nextJ
          );
        }
      }
    }

    // Do NOT cap holes - they remain open as continuous slits
  }

  // Convert vertices to Float32Array
  const positions = new Float32Array(vertices.length * 3);
  vertices.forEach((vertex, i) => {
    positions[i * 3] = vertex.x;
    positions[i * 3 + 1] = vertex.y;
    positions[i * 3 + 2] = vertex.z;
  });

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);

  // Step 4: Compute vertex normals unless smoothNormals=false
  if (smoothNormals) {
    geometry.computeVertexNormals();
  } else {
    geometry.computeFaceNormals();
  }

  return geometry;
}

/**
 * Calculates the area of a 3D polygon projected onto XZ plane
 */
function calculatePolygonArea(vertices: THREE.Vector3[]): number {
  if (vertices.length < 3) return 0;

  let area = 0;
  for (let i = 0; i < vertices.length; i++) {
    const j = (i + 1) % vertices.length;
    area += vertices[i].x * vertices[j].z;
    area -= vertices[j].x * vertices[i].z;
  }
  return Math.abs(area) / 2;
}

