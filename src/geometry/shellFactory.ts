import * as THREE from "three";
import type { ShellParams } from "../types/LampParams";
import { createCylinderShell } from "./cylinderShell";
import { createHexagonShell } from "./hexagonShell";

/**
 * Factory function to create shell geometry based on shape type
 */
export function createShell(params: ShellParams): THREE.BufferGeometry {
  switch (params.shape) {
    case "cylinder":
      return createCylinderShell(params);
    case "hexagon":
      return createHexagonShell(params);
    default:
      return createCylinderShell(params);
  }
}


