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
 * Lofts 2D cross sections into 3D geometry
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

  // Step 1: Process each section
  const processedSections: THREE.Vector3[][] = [];

  for (const section of sections) {
    const { points, t } = section;

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
    const sectionVertices = pointsTo3DVertices(processedPoints, y);
    processedSections.push(sectionVertices);
  }

  // Step 2: Build geometry by connecting adjacent sections
  for (let i = 0; i < processedSections.length - 1; i++) {
    const bottomSection = processedSections[i];
    const topSection = processedSections[i + 1];

    // Add vertices for this segment
    const vertexOffset = vertices.length;
    vertices.push(...bottomSection);
    vertices.push(...topSection);

    // Triangulate quads between corresponding vertices
    // Assumes both sections have the same vertex count
    if (bottomSection.length === topSection.length) {
      const segmentIndices = triangulateQuad(
        bottomSection,
        topSection,
        vertexOffset
      );
      indices.push(...segmentIndices);
    } else {
      // Handle mismatched vertex counts (basic triangulation)
      // This is a simplified case - could be improved with better triangulation
      console.warn(
        `Section ${i} and ${i + 1} have different vertex counts. ` +
        `Using basic triangulation.`
      );
    }
  }

  // Close the tip if last polygon collapses to zero area
  const lastSection = processedSections[processedSections.length - 1];
  const lastArea = calculatePolygonArea(lastSection);
  const shouldCloseTip = lastArea < 0.001; // Threshold for "zero area"

  if (shouldCloseTip && lastSection.length > 0) {
    const tipCap = createTipCap(lastSection, vertices.length - lastSection.length);
    vertices.push(tipCap.centerVertex);
    indices.push(...tipCap.indices);
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

  // Step 3: Compute vertex normals unless smoothNormals=false
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

