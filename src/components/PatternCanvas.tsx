import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { generatePattern2D, generateShapeVertices, generateShapeVerticesForFill } from "../geometry/pattern2D";
import type { PatternParams } from "../types/PatternParams";

type Props = {
  pattern: PatternParams;
};

export function PatternCanvas({ pattern }: Props) {
  const patternInstances = useMemo(() => generatePattern2D(pattern), [pattern]);

  const shapeGeometries = useMemo(() => {
    return patternInstances.map((instance) => {
      // Create filled shape using Shape geometry
      const vertices = generateShapeVerticesForFill(instance);
      const shape = new THREE.Shape();
      
      if (vertices.length > 0) {
        shape.moveTo(vertices[0].x, vertices[0].y);
        for (let j = 1; j < vertices.length; j++) {
          shape.lineTo(vertices[j].x, vertices[j].y);
        }
        shape.lineTo(vertices[0].x, vertices[0].y); // Close the shape
      }
      
      return new THREE.ShapeGeometry(shape);
    });
  }, [patternInstances]);

  return (
    <Canvas camera={{ position: [0, 0, 200], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[100, 100, 100]} intensity={1} />

      {/* Grid background */}
      <gridHelper args={[300, 30, "#888", "#ccc"]} />

      {/* Render all shapes in order - each shape progressively closer to camera */}
      {shapeGeometries.map((geom, i) => {
        // Alternate: even indices are black, odd are white (inverted if pattern.inverted is true)
        const baseIsBlack = i % 2 === 0;
        const isBlack = pattern.inverted ? !baseIsBlack : baseIsBlack;
        // Each shape is 0.1 units closer to camera than the previous one
        // This ensures proper depth sorting while maintaining 2D appearance
        const zPosition = 0.1 + (i * 0.1);
        
        return (
          <mesh 
            key={`shape-${i}`} 
            geometry={geom} 
            position={[0, 0, zPosition]}
            renderOrder={i} // Render in sequence order
          >
            <meshBasicMaterial 
              color={isBlack ? "#000000" : "#ffffff"} 
              side={THREE.DoubleSide}
              depthWrite={true}
              depthTest={true}
            />
          </mesh>
        );
      })}

      {/* Center point indicator */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[2, 8, 8]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>

      <OrbitControls />
    </Canvas>
  );
}

