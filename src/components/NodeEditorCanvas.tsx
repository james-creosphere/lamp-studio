/**
 * Canvas component that renders geometries from the node editor
 */

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { BufferGeometry } from "three";

type Props = {
  geometries: BufferGeometry[];
};

export function NodeEditorCanvas({ geometries }: Props) {
  // Compute bounding box for all geometries
  const { center, maxDimension } = useMemo(() => {
    if (geometries.length === 0) {
      return { center: new THREE.Vector3(0, 0, 0), maxDimension: 200 };
    }

    const boundingBox = new THREE.Box3();
    geometries.forEach(geom => {
      geom.computeBoundingBox();
      if (geom.boundingBox) {
        boundingBox.expandByBox(geom.boundingBox);
      }
    });

    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    const maxDimension = Math.max(size.x, size.y, size.z);

    return { center, maxDimension: maxDimension || 200 };
  }, [geometries]);

  const cameraDistance = maxDimension * 2.5;

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
      
      {geometries.map((geometry, index) => (
        <mesh
          key={index}
          geometry={geometry}
          position={[-center.x, -center.y, -center.z]}
        >
          <meshStandardMaterial color="#646cff" />
        </mesh>
      ))}
      
      <gridHelper args={[maxDimension * 2, 20, "#888", "#ccc"]} />
      <OrbitControls />
    </Canvas>
  );
}

