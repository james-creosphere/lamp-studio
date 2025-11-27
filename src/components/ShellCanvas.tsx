import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { createShell } from "../geometry/shellFactory";
import type { ShellParams } from "../types/LampParams";

type Props = {
  shell: ShellParams;
};

export function ShellCanvas({ shell }: Props) {
  const shellGeom = useMemo(() => createShell(shell), [shell]);

  return (
    <Canvas camera={{ position: [0, 150, 300], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[100, 200, 100]} intensity={1} />

      {/* Shell */}
      <mesh geometry={shellGeom!}>
        <meshStandardMaterial color="#dddddd" wireframe />
      </mesh>

      <OrbitControls />
    </Canvas>
  );
}

