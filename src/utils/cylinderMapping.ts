import * as THREE from "three";
import type { Point2D } from "../geometry/bloom2D";
import type { ShellParams } from "../types/LampParams";

/**
 * Maps a 2D point to a 3D point on the cylinder surface.
 * x coordinate is angle around cylinder (0 to 2π)
 * y coordinate is height along cylinder (centered at 0)
 */
export function map2DToCylinder(
  point2D: Point2D,
  shellParams: ShellParams,
  radius: number = shellParams.radius
): THREE.Vector3 {
  const { height } = shellParams;
  
  // x is already in radians (0 to 2π)
  const theta = point2D.x;
  
  // y is height, center it around 0
  const y = point2D.y;
  
  // Convert to 3D cylinder coordinates
  const x = radius * Math.cos(theta);
  const z = radius * Math.sin(theta);
  
  return new THREE.Vector3(x, y, z);
}

/**
 * Generates a 3D path on the cylinder surface from 2D points
 */
export function createCylinderPath(
  points2D: Point2D[],
  shellParams: ShellParams,
  radius: number = shellParams.radius
): THREE.Vector3[] {
  return points2D.map(point => map2DToCylinder(point, shellParams, radius));
}

/**
 * Creates a BufferGeometry from 3D points for rendering as a line
 */
export function createLineGeometry(points: THREE.Vector3[]): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(points.length * 3);
  
  points.forEach((point, i) => {
    positions[i * 3] = point.x;
    positions[i * 3 + 1] = point.y;
    positions[i * 3 + 2] = point.z;
  });
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  return geometry;
}

