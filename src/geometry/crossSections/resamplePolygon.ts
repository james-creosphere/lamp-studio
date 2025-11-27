import type { Point2D } from "./crossSectionTypes";

/**
 * Resamples a polygon to have a specific number of vertices.
 * Uses arc-length parameterization to distribute points evenly along the perimeter.
 * 
 * @param points - Array of 2D points defining the polygon in CCW order
 * @param targetVertexCount - Desired number of vertices in the output polygon
 * @returns New polygon with evenly-spaced vertices along the perimeter
 */
export function resamplePolygon(
  points: Point2D[],
  targetVertexCount: number
): Point2D[] {
  if (points.length === 0) return [];
  if (points.length === targetVertexCount) return [...points];
  if (targetVertexCount < 3) targetVertexCount = 3;

  // Step 1: Compute total perimeter length
  let totalPerimeter = 0;
  const edgeLengths: number[] = [];
  
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const dx = points[j].x - points[i].x;
    const dy = points[j].y - points[i].y;
    const edgeLength = Math.sqrt(dx * dx + dy * dy);
    edgeLengths.push(edgeLength);
    totalPerimeter += edgeLength;
  }

  if (totalPerimeter === 0) return [...points]; // Degenerate case

  // Step 2: Divide perimeter into N equal steps
  const stepSize = totalPerimeter / targetVertexCount;

  // Step 3: Walk edges and insert interpolated points
  const resampled: Point2D[] = [];
  let accumulatedLength = 0;
  let currentEdgeIndex = 0;

  for (let i = 0; i < targetVertexCount; i++) {
    const targetDistance = i * stepSize;

    // Advance to the edge containing the target distance
    while (
      currentEdgeIndex < edgeLengths.length &&
      accumulatedLength + edgeLengths[currentEdgeIndex] < targetDistance
    ) {
      accumulatedLength += edgeLengths[currentEdgeIndex];
      currentEdgeIndex++;
    }

    // Handle edge case: if we've exhausted all edges, use the last point
    if (currentEdgeIndex >= points.length) {
      resampled.push(points[points.length - 1]);
      continue;
    }

    // Calculate interpolation parameter t within the current edge
    const edgeStartDistance = accumulatedLength;
    const edgeLength = edgeLengths[currentEdgeIndex];
    
    let t: number;
    if (edgeLength === 0) {
      // Degenerate edge (zero length), use the start point
      t = 0;
    } else {
      t = (targetDistance - edgeStartDistance) / edgeLength;
      // Clamp t to [0, 1] to handle floating point precision issues
      t = Math.max(0, Math.min(1, t));
    }

    // Interpolate between edge start and end points
    const p1 = points[currentEdgeIndex];
    const p2 = points[(currentEdgeIndex + 1) % points.length];
    
    resampled.push({
      x: p1.x + t * (p2.x - p1.x),
      y: p1.y + t * (p2.y - p1.y)
    });
  }

  return resampled;
}

