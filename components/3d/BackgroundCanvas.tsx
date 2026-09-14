"use client";

import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function FloatingOrbs() {
  const group = useRef<THREE.Group>(null);

  const orbs = useMemo(() => {
    return [
      { position: [-6, 3, -4] as const, scale: 0.6, speed: 0.3, color: "#818cf8" },
      { position: [7, -4, -3] as const, scale: 0.8, speed: 0.2, color: "#c084fc" },
      { position: [-5, -6, -5] as const, scale: 0.5, speed: 0.25, color: "#93c5fd" },
      { position: [6, 5, -6] as const, scale: 0.7, speed: 0.15, color: "#a5b4fc" },
    ];
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = t * 0.02;
    }
  });

  return (
    <group ref={group}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.position} scale={orb.scale}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={orb.color}
            wireframe
            transparent
            opacity={0.25}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function BackgroundCanvas() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden opacity-60">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          <FloatingOrbs />
        </Suspense>
      </Canvas>
    </div>
  );
}
