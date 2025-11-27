import type { BloomParams } from "../types/LampParams";

export type Point2D = {
  x: number; // angle around cylinder (0 to 2π)
  y: number; // height along cylinder
};

/**
 * Generates a closed 2D bloom pattern that wraps around a cylinder.
 * Creates a spiral/pattern path that starts and ends at the same point.
 * x represents angle around cylinder (0 to 2π), y represents height.
 */
export function generateBloom2D(params: BloomParams): Point2D[] {
  const {
    steps,
    scaleStart,
    scaleFactor,
    rotationStep,
    driftX,
    driftY,
    baseRadius
  } = params;

  const points: Point2D[] = [];
  
  // Start position
  let angle = 0; // in degrees
  let height = 0;
  
  // Generate the path
  for (let i = 0; i <= steps; i++) {
    const t = i / steps; // 0 to 1
    
    // Calculate current scale and radius
    const scale = scaleStart * Math.pow(scaleFactor, i);
    const radius = baseRadius * scale;
    
    // Convert angle to radians and normalize to 0-2π
    let angleRad = (angle * Math.PI) / 180;
    angleRad = ((angleRad % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    
    // Add point at current position
    // Offset by radius to create the bloom shape
    const offsetAngle = angleRad + (radius / 50); // Scale radius for angle space
    const normalizedOffsetAngle = ((offsetAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    
    points.push({
      x: normalizedOffsetAngle,
      y: height
    });
    
    // Update for next iteration
    if (i < steps) {
      angle += rotationStep;
      angle += driftX; // driftX affects rotation
      height += driftY;
    }
  }
  
  // Calculate how much we need to adjust to close the loop
  const startAngle = points[0].x;
  const endAngle = points[points.length - 1].x;
  const startHeight = points[0].y;
  const endHeight = points[points.length - 1].y;
  
  // Adjust all points to ensure closure
  const angleDiff = startAngle - endAngle;
  const heightDiff = startHeight - endHeight;
  
  // Redistribute the difference across all points to create smooth closure
  for (let i = 0; i < points.length; i++) {
    const t = i / (points.length - 1);
    points[i].x = ((points[i].x + angleDiff * t) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
    points[i].y = points[i].y + heightDiff * t;
  }
  
  // Ensure the last point exactly matches the first
  if (points.length > 0) {
    points[points.length - 1] = { ...points[0] };
  }

  return points;
}


