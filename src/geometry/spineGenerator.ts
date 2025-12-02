import * as THREE from "three";
import type { Point2D } from "./crossSections/crossSectionTypes";

/**
 * A spine segment point - defines position, thickness, and length
 */
export interface SpinePoint {
  position: THREE.Vector3; // 3D position
  radius: number;          // Thickness/radius at this point
  length: number;          // Length/height of this segment
  rotation: number;         // Rotation around Y axis (degrees)
}

/**
 * Options for generating a spine
 */
export interface SpineGeneratorOptions {
  steps: number;           // Number of segments
  startRadius: number;     // Starting radius/thickness
  endRadius: number;       // Ending radius/thickness
  totalHeight: number;     // Total height of the spine
  spiralAmount: number;    // Spiral rotation (degrees per step)
  driftX: number;          // X drift per step
  driftY: number;          // Z drift per step
  segmentLength: number;   // Length of each segment
  radiusVariation?: number; // Random variation in radius (0-1)
  removeFrequency?: number; // Remove every Nth segment (creates gaps)
}

/**
 * Generates spine points along a path
 */
export function generateSpinePoints(options: SpineGeneratorOptions): SpinePoint[] {
  const {
    steps,
    startRadius,
    endRadius,
    totalHeight,
    spiralAmount,
    driftX,
    driftY,
    segmentLength,
    radiusVariation = 0,
    removeFrequency = 0
  } = options;

  const points: SpinePoint[] = [];
  let currentX = 0;
  let currentY = 0;
  let currentZ = 0;
  let currentAngle = 0;

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1); // Normalized position 0..1
    
    // Skip this point if it should be removed
    if (removeFrequency > 0 && i % removeFrequency === 0) {
      continue;
    }

    // Calculate radius (interpolate from start to end)
    const baseRadius = startRadius + (endRadius - startRadius) * t;
    const variation = radiusVariation > 0 
      ? (Math.random() - 0.5) * radiusVariation * baseRadius 
      : 0;
    const radius = Math.max(0.1, baseRadius + variation);

    // Calculate position
    const position = new THREE.Vector3(currentX, currentY, currentZ);

    // Create spine point
    points.push({
      position,
      radius,
      length: segmentLength,
      rotation: currentAngle
    });

    // Update position for next point
    currentAngle += spiralAmount;
    const angleRad = (currentAngle * Math.PI) / 180;
    
    // Move forward along the spiral path
    currentX += driftX + Math.cos(angleRad) * segmentLength * 0.1;
    currentY += totalHeight / steps;
    currentZ += driftY + Math.sin(angleRad) * segmentLength * 0.1;
  }

  return points;
}

/**
 * Creates a 3D geometry from spine points
 * Each point becomes a ring, and rings are lofted together
 */
export function createSpineGeometry(points: SpinePoint[]): THREE.BufferGeometry {
  if (points.length === 0) {
    return new THREE.BufferGeometry();
  }

  const geometry = new THREE.BufferGeometry();
  const vertices: THREE.Vector3[] = [];
  const indices: number[] = [];

  // Generate cross-sections (rings) for each spine point
  const segments = 16; // Number of vertices per ring
  const rings: THREE.Vector3[][] = [];

  for (const point of points) {
    const ring: THREE.Vector3[] = [];
    const { position, radius, rotation } = point;
    const rotationRad = (rotation * Math.PI) / 180;

    // Generate ring vertices
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle + rotationRad) * radius;
      const z = Math.sin(angle + rotationRad) * radius;
      
      ring.push(
        new THREE.Vector3(
          position.x + x,
          position.y,
          position.z + z
        )
      );
    }
    
    rings.push(ring);
  }

  // Loft between adjacent rings
  for (let i = 0; i < rings.length - 1; i++) {
    const bottomRing = rings[i];
    const topRing = rings[i + 1];

    const vertexOffset = vertices.length;
    vertices.push(...bottomRing);
    vertices.push(...topRing);

    // Triangulate quads between rings
    for (let j = 0; j < segments; j++) {
      const nextJ = (j + 1) % segments;
      
      // Bottom triangle
      indices.push(
        vertexOffset + j,
        vertexOffset + segments + j,
        vertexOffset + nextJ
      );
      
      // Top triangle
      indices.push(
        vertexOffset + segments + j,
        vertexOffset + segments + nextJ,
        vertexOffset + nextJ
      );
    }
  }

  // Convert to Float32Array
  const positions = new Float32Array(vertices.length * 3);
  vertices.forEach((vertex, i) => {
    positions[i * 3] = vertex.x;
    positions[i * 3 + 1] = vertex.y;
    positions[i * 3 + 2] = vertex.z;
  });

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}


