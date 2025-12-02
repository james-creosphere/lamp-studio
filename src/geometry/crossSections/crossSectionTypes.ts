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
 * @property outer - Array of 2D points defining the shell boundary (CCW order)
 * @property holes - Array of polygons, each defining a void region within the cross-section (CW order)
 * @property t - Normalized position along the height (0 = bottom, 1 = top)
 * 
 * @note 'outer' defines the shell boundary. 'holes' contains zero or more polygons that define void regions within the cross-section.
 *       Outer boundary should be ordered counter-clockwise (CCW), holes should be ordered clockwise (CW).
 */
export type CrossSection2D = {
  outer: Point2D[];
  holes: Point2D[][];
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

