import type { PatternParams, PatternShape } from "../types/PatternParams";

export type Point2D = {
  x: number;
  y: number;
};

export type PatternInstance = {
  center: Point2D;
  rotation: number; // in radians
  scale: number;
  shape: PatternShape;
  size: number;
  starPoints?: number;
  crossThickness?: number;
};

/**
 * Generates a 2D pattern based on parameters
 */
export function generatePattern2D(params: PatternParams): PatternInstance[] {
  const {
    shape,
    steps,
    scaleStart,
    scaleFactor,
    rotationStart,
    rotationStep,
    driftX,
    driftY,
    spiralAmount,
    size,
    starPoints = 5,
    crossThickness = 0.2
  } = params;

  const instances: PatternInstance[] = [];

  let currentX = 0;
  let currentY = 0;
  let currentRotation = rotationStart;
  let currentScale = scaleStart;
  let spiralAngle = 0; // Track cumulative spiral rotation angle

  for (let i = 0; i < steps; i++) {
    instances.push({
      center: { x: currentX, y: currentY },
      rotation: (currentRotation * Math.PI) / 180, // Convert to radians
      scale: currentScale,
      shape,
      size,
      starPoints,
      crossThickness
    });

    // Calculate drift vector
    const driftDistance = Math.sqrt(driftX * driftX + driftY * driftY);
    const driftAngle = Math.atan2(driftY, driftX);
    
    // Apply spiral rotation to drift direction
    const spiralRad = (spiralAngle * Math.PI) / 180;
    const rotatedDriftAngle = driftAngle + spiralRad;
    
    // Calculate new position with rotated drift
    const newDriftX = driftDistance * Math.cos(rotatedDriftAngle);
    const newDriftY = driftDistance * Math.sin(rotatedDriftAngle);
    
    // Update for next iteration
    currentX += newDriftX;
    currentY += newDriftY;
    currentRotation += rotationStep;
    currentScale *= scaleFactor;
    spiralAngle += spiralAmount; // Increment spiral rotation
  }

  return instances;
}

/**
 * Generates vertices for a shape at a specific instance
 */
export function generateShapeVertices(instance: PatternInstance, segments: number = 32): Point2D[] {
  const { center, rotation, scale, shape, size, starPoints = 5, crossThickness = 0.2 } = instance;
  const scaledSize = size * scale;
  const vertices: Point2D[] = [];

  switch (shape) {
    case "circle": {
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        vertices.push({
          x: center.x + Math.cos(angle + rotation) * scaledSize,
          y: center.y + Math.sin(angle + rotation) * scaledSize
        });
      }
      break;
    }

    case "square": {
      const halfSize = scaledSize;
      vertices.push(
        { x: center.x + halfSize, y: center.y + halfSize },
        { x: center.x - halfSize, y: center.y + halfSize },
        { x: center.x - halfSize, y: center.y - halfSize },
        { x: center.x + halfSize, y: center.y - halfSize },
        { x: center.x + halfSize, y: center.y + halfSize } // Close the shape
      );
      // Apply rotation
      return vertices.map(v => rotatePoint(v, center, rotation));
    }

    case "triangle": {
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2 - Math.PI / 2 + rotation;
        vertices.push({
          x: center.x + Math.cos(angle) * scaledSize,
          y: center.y + Math.sin(angle) * scaledSize
        });
      }
      vertices.push(vertices[0]); // Close the shape
      break;
    }

    case "hexagon": {
      for (let i = 0; i <= 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + rotation;
        vertices.push({
          x: center.x + Math.cos(angle) * scaledSize,
          y: center.y + Math.sin(angle) * scaledSize
        });
      }
      break;
    }

    case "star": {
      const outerRadius = scaledSize;
      const innerRadius = scaledSize * 0.5;
      for (let i = 0; i <= starPoints * 2; i++) {
        const angle = (i / (starPoints * 2)) * Math.PI * 2 + rotation;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        vertices.push({
          x: center.x + Math.cos(angle) * radius,
          y: center.y + Math.sin(angle) * radius
        });
      }
      vertices.push(vertices[0]); // Close the shape
      break;
    }

    case "cross": {
      const thickness = scaledSize * crossThickness;
      const halfSize = scaledSize;
      // Horizontal bar
      vertices.push(
        { x: center.x - halfSize, y: center.y + thickness },
        { x: center.x + halfSize, y: center.y + thickness },
        { x: center.x + halfSize, y: center.y - thickness },
        { x: center.x - halfSize, y: center.y - thickness },
        { x: center.x - halfSize, y: center.y + thickness }
      );
      // Vertical bar
      vertices.push(
        { x: center.x - thickness, y: center.y - halfSize },
        { x: center.x + thickness, y: center.y - halfSize },
        { x: center.x + thickness, y: center.y + halfSize },
        { x: center.x - thickness, y: center.y + halfSize },
        { x: center.x - thickness, y: center.y - halfSize }
      );
      // Apply rotation
      return vertices.map(v => rotatePoint(v, center, rotation));
    }
  }

  return vertices;
}

/**
 * Generates vertices for a filled shape (without duplicate closing vertex)
 */
export function generateShapeVerticesForFill(instance: PatternInstance, segments: number = 32): Point2D[] {
  const vertices = generateShapeVertices(instance, segments);
  // Remove the duplicate closing vertex for filled shapes
  if (vertices.length > 0 && vertices[0].x === vertices[vertices.length - 1].x && 
      vertices[0].y === vertices[vertices.length - 1].y) {
    return vertices.slice(0, -1);
  }
  return vertices;
}

/**
 * Rotates a point around a center point
 */
function rotatePoint(point: Point2D, center: Point2D, angle: number): Point2D {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos
  };
}

