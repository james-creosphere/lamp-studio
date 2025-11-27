import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { ShellParams } from "../types/LampParams";

/**
 * Creates a hexagonal prism shell (hollow hexagon).
 * The radius parameter represents the radius of the circumscribed circle.
 */
export function createHexagonShell(params: ShellParams) {
  const { height, radius, thickness } = params;

  const outerRadius = radius;
  const innerRadius = Math.max(0.1, radius - thickness);

  // Create outer hexagon using CylinderGeometry with 6 segments
  // openEnded = true means no caps, just the sides
  const outer = new THREE.CylinderGeometry(outerRadius, outerRadius, height, 6, 1, true);
  
  // Create inner hexagon (hollow) - same approach as cylinder
  const inner = new THREE.CylinderGeometry(innerRadius, innerRadius, height, 6, 1, true);

  // Reverse inner normals to face inward (same as cylinder shell)
  inner.scale(1, 1, -1);

  // Merge geometries to create the shell
  const merged = mergeGeometries([outer, inner]);

  return merged;
}

