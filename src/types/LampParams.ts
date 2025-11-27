export interface BloomParams {
  steps: number;
  scaleStart: number;
  scaleFactor: number;
  rotationStep: number;
  driftX: number;
  driftY: number;
  baseRadius: number;
}

export type ShellShape = "cylinder" | "hexagon";

export interface ShellParams {
  shape: ShellShape;
  height: number;
  radius: number; // For cylinder: radius, for hexagon: radius of circumscribed circle
  thickness: number;
}
