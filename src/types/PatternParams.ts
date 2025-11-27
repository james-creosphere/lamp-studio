export type PatternShape = "circle" | "square" | "triangle" | "hexagon" | "star" | "cross";

export interface PatternParams {
  shape: PatternShape;
  steps: number;           // Number of iterations/steps
  scaleStart: number;      // Initial scale
  scaleFactor: number;     // Scale multiplier per step
  rotationStart: number;   // Initial rotation in degrees
  rotationStep: number;    // Rotation increment per step in degrees
  driftX: number;          // X translation per step
  driftY: number;          // Y translation per step
  spiralAmount: number;    // Spiral rotation amount in degrees per step
  size: number;            // Base size of the shape
  inverted: boolean;       // Invert black and white colors
  // Shape-specific parameters
  starPoints?: number;     // Number of points for star (default 5)
  crossThickness?: number; // Thickness for cross shape
}

