import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { ShellParams } from "../types/LampParams";

export function createCylinderShell(params: ShellParams) {
  const { height, radius, thickness } = params;

  // Outer cylinder
  const outer = new THREE.CylinderGeometry(radius, radius, height, 96, 1, true);
  // Inner cylinder
  const inner = new THREE.CylinderGeometry(radius - thickness, radius - thickness, height, 96, 1, true);

  // Reverse inner normals
  inner.scale(1, 1, -1);

  // Merge geometries
  const merged = mergeGeometries([outer, inner]);

  return merged;
}
