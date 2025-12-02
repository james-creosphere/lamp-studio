import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { generatePattern2D } from "../geometry/pattern2D";
import { patternInstancesToInterpolatableShapes } from "../utils/patternToInterpolatable";
import { getEasingFunction } from "../utils/easing";
import { FractalBodyCanvas } from "./FractalBodyCanvas";
import { generateSpinePoints, createSpineGeometry } from "../geometry/spineGenerator";
import type { PatternParams } from "../types/PatternParams";

type Props = {
  pattern: PatternParams;
};

export function PatternCanvas({ pattern }: Props) {
  // Use spine mode if enabled
  const spineGeometry = useMemo(() => {
    if (!pattern.useSpineMode) return null;
    
    const spinePoints = generateSpinePoints({
      steps: pattern.steps,
      startRadius: pattern.startRadius,
      endRadius: pattern.endRadius,
      totalHeight: pattern.height,
      spiralAmount: pattern.spiralAmount,
      driftX: pattern.driftX,
      driftY: pattern.driftY,
      segmentLength: pattern.segmentLength,
      radiusVariation: pattern.radiusVariation,
      removeFrequency: pattern.removeShapes ? pattern.removeFrequency : 0
    });
    
    return createSpineGeometry(spinePoints);
  }, [
    pattern.useSpineMode,
    pattern.steps,
    pattern.startRadius,
    pattern.endRadius,
    pattern.height,
    pattern.spiralAmount,
    pattern.driftX,
    pattern.driftY,
    pattern.segmentLength,
    pattern.radiusVariation,
    pattern.removeShapes,
    pattern.removeFrequency
  ]);

  // Original pattern-based generation
  const patternInstances = useMemo(() => generatePattern2D(pattern), [pattern]);

  const polygons2D = useMemo(() => {
    return patternInstancesToInterpolatableShapes(
      patternInstances,
      pattern.removeShapes,
      pattern.removeFrequency
    );
  }, [patternInstances, pattern.removeShapes, pattern.removeFrequency]);

  const easingFunction = useMemo(() => {
    return getEasingFunction(pattern.easing);
  }, [pattern.easing]);

  // Render spine geometry if in spine mode
  if (pattern.useSpineMode && spineGeometry) {
    spineGeometry.computeBoundingBox();
    const boundingBox = spineGeometry.boundingBox;
    if (!boundingBox) {
      return (
        <Canvas camera={{ position: [0, 0, 200], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[100, 100, 100]} intensity={1} />
          <OrbitControls />
        </Canvas>
      );
    }
    
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    const maxDimension = Math.max(size.x, size.y, size.z);
    const cameraDistance = maxDimension > 0 ? maxDimension * 2.5 : 200;

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
        <mesh geometry={spineGeometry} position={[-center.x, -center.y, -center.z]}>
          <meshStandardMaterial color="#646cff" />
        </mesh>
        <gridHelper args={[maxDimension * 2, 20, "#888", "#ccc"]} />
        <OrbitControls />
      </Canvas>
    );
  }

  // Original pattern-based rendering
  return (
    <FractalBodyCanvas
      polygons2D={polygons2D}
      height={pattern.height}
      twist={pattern.twist}
      taper={pattern.taper}
      normalize={pattern.normalize}
      easing={easingFunction}
      enableHoles={pattern.enableHoles}
      holeFrequency={pattern.holeFrequency}
      holeScale={pattern.holeScale}
    />
  );
}

