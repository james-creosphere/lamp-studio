export type PatternShape = "circle" | "square" | "triangle" | "hexagon" | "star" | "cross";

export type EasingType = "linear" | "easeOut" | "easeInOut";

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
  // Fractal body parameters
  height: number;          // Height of the 3D body (0-400)
  twist: number;           // Twist amount in degrees (0-720)
  taper: number;           // Taper amount (0-1)
  normalize: boolean;      // Normalize vertex count
  easing: EasingType;      // Easing function type
  // Hole parameters
  enableHoles: boolean;    // Enable hole generation
  holeFrequency: number;   // Frequency of holes (1-5)
  holeScale: number;       // Scale of holes (0.1-0.9)
  // Shell opening parameters
  removeShapes: boolean;   // Remove alternating shapes to create openings
  removeFrequency: number; // Frequency of shape removal (1-5)
  // Spine generation mode
  useSpineMode: boolean;   // Use spine-based generation instead of pattern-based
  startRadius: number;     // Starting radius/thickness for spine
  endRadius: number;       // Ending radius/thickness for spine
  segmentLength: number;   // Length of each spine segment
  radiusVariation: number; // Random variation in radius (0-1)
  // Shape-specific parameters
  starPoints?: number;     // Number of points for star (default 5)
  crossThickness?: number; // Thickness for cross shape
}

