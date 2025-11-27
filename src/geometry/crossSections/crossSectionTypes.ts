/**
 * Generic 2D point type
 */
export type Point2D = {
  x: number;
  y: number;
};

/**
 * Represents a 2D cross-section at a specific position along the height of a 3D shape.
 * 
 * @property points - Array of 2D points defining the cross-section outline
 * @property t - Normalized position along the height (0 = bottom, 1 = top)
 */
export type CrossSection2D = {
  points: Point2D[];
  t: number; // normalized 0..1 along height
};

/**
 * Represents a 2D shape that can be interpolated between other shapes.
 * 
 * @property points - Array of 2D points defining the shape outline
 * 
 * @note All shapes must have their vertices ordered counter-clockwise (CCW).
 *       This ensures consistent winding order for geometry operations and
 *       proper normal calculation.
 */
export type InterpolatableShape = {
  points: Point2D[];
};

