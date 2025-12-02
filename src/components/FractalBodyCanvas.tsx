import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { createFractalBody } from "../geometry/fractalBodyGenerator";
import type { InterpolatableShape } from "../geometry/crossSections/crossSectionTypes";

type Props = {
  polygons2D: (InterpolatableShape | null)[];
  height: number;
  twist: number;
  taper: number;
  normalize: boolean;
  easing?: (t: number) => number;
  enableHoles?: boolean;
  holeFrequency?: number;
  holeScale?: number;
};

/**
 * Calculates the bounding box of a geometry and returns center and scale
 */
function computeGeometryBounds(geometry: THREE.BufferGeometry): {
  center: THREE.Vector3;
  size: THREE.Vector3;
} {
  geometry.computeBoundingBox();
  const boundingBox = geometry.boundingBox;
  
  if (!boundingBox) {
    return {
      center: new THREE.Vector3(0, 0, 0),
      size: new THREE.Vector3(1, 1, 1)
    };
  }

  const center = new THREE.Vector3();
  boundingBox.getCenter(center);
  
  const size = new THREE.Vector3();
  boundingBox.getSize(size);

  return { center, size };
}

export function FractalBodyCanvas({
  polygons2D,
  height,
  twist,
  taper,
  normalize,
  easing,
  enableHoles = false,
  holeFrequency = 2,
  holeScale = 0.35
}: Props) {
  // Generate geometry using useMemo for performance
  const geometry = useMemo(() => {
    if (polygons2D.length === 0) {
      return null;
    }
    return createFractalBody({
      polygons2D,
      height,
      twist,
      taper,
      normalize,
      easing,
      enableHoles,
      holeFrequency,
      holeScale
    });
  }, [polygons2D, height, twist, taper, normalize, easing, enableHoles, holeFrequency, holeScale]);

  // Compute bounds for centering and scaling
  const { center, size } = useMemo(() => {
    if (!geometry) {
      return {
        center: new THREE.Vector3(0, 0, 0),
        size: new THREE.Vector3(1, 1, 1)
      };
    }
    return computeGeometryBounds(geometry);
  }, [geometry]);

  // Calculate camera distance based on geometry size
  const maxDimension = Math.max(size.x, size.y, size.z);
  const cameraDistance = maxDimension > 0 ? maxDimension * 2.5 : 200;

  if (!geometry) {
    return (
      <Canvas camera={{ position: [0, 0, 200], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[100, 100, 100]} intensity={1} />
        <OrbitControls />
      </Canvas>
    );
  }

  return (
    <Canvas
      camera={{
        position: [
          center.x + cameraDistance * 0.7,
          center.y + cameraDistance * 0.5,
          center.z + cameraDistance * 0.7
        ],
        fov: 45
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[100, 100, 100]} intensity={1} />

      {/* Render the fractal body geometry */}
      <mesh geometry={geometry} position={[-center.x, -center.y, -center.z]}>
        <meshStandardMaterial color="#646cff" />
      </mesh>

      {/* Grid helper for reference */}
      <gridHelper args={[maxDimension * 2, 20, "#888", "#ccc"]} />

      {/* Center point indicator */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[2, 8, 8]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>

      <OrbitControls />
    </Canvas>
  );
}

