"use client";

import React, { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import * as THREE from "three";

// Dynamic 3D Geometric Crystal Structure with Outer Glass & Inner Wireframe
function FloatingGeometricObject() {
  const outerMeshRef = useRef<THREE.Mesh>(null);
  const innerMeshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);

  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pointer = state.pointer;

    if (outerMeshRef.current) {
      // Base rotation + cursor raycast reaction
      outerMeshRef.current.rotation.x = t * 0.25 + pointer.y * 0.4;
      outerMeshRef.current.rotation.y = t * 0.35 + pointer.x * 0.4;
    }

    if (innerMeshRef.current) {
      innerMeshRef.current.rotation.x = -t * 0.4;
      innerMeshRef.current.rotation.y = -t * 0.5;
    }

    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.5) * 0.2;
      ringRef.current.rotation.y = t * 0.2;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -Math.PI / 4 + Math.cos(t * 0.4) * 0.2;
      ring2Ref.current.rotation.z = -t * 0.15;
    }
  });

  return (
    <group
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.08 : 1}
    >
      <Float speed={2} rotationIntensity={0.8} floatIntensity={1.2}>
        {/* Outer Glass Polyhedron */}
        <mesh ref={outerMeshRef} scale={1.8}>
          <icosahedronGeometry args={[1, 0]} />
          <meshPhysicalMaterial
            color="#6366f1"
            roughness={0.1}
            metalness={0.1}
            transmission={0.85}
            thickness={1.2}
            ior={1.5}
            reflectivity={0.9}
            clearcoat={1}
            clearcoatRoughness={0.1}
            transparent={true}
            opacity={0.75}
          />
        </mesh>

        {/* Inner Glowing Wireframe Core */}
        <mesh ref={innerMeshRef} scale={1.1}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial
            color={hovered ? "#4f46e5" : "#7c3aed"}
            wireframe={true}
            transparent={true}
            opacity={0.85}
          />
        </mesh>

        {/* Inner Pulsing Core Sphere */}
        <Sphere args={[0.5, 32, 32]}>
          <MeshDistortMaterial
            color="#4f46e5"
            speed={3}
            distort={0.4}
            radius={0.5}
            roughness={0.2}
          />
        </Sphere>

        {/* Orbital Ring 1 */}
        <group ref={ringRef}>
          <mesh>
            <torusGeometry args={[2.5, 0.02, 16, 100]} />
            <meshBasicMaterial color="#818cf8" transparent opacity={0.6} />
          </mesh>
          {/* Satellite bead on ring 1 */}
          <mesh position={[2.5, 0, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#4f46e5" emissive="#6366f1" emissiveIntensity={0.8} />
          </mesh>
        </group>

        {/* Orbital Ring 2 */}
        <group ref={ring2Ref}>
          <mesh>
            <torusGeometry args={[2.2, 0.015, 16, 100]} />
            <meshBasicMaterial color="#c084fc" transparent opacity={0.4} />
          </mesh>
          {/* Satellite bead on ring 2 */}
          <mesh position={[-2.2, 0, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={0.6} />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

// Surrounding Ambient Dust Particles in Light Theme
function Particles({ count = 80 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);

  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  });

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.getElapsedTime() * 0.03;
      points.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.02) * 0.05;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#6366f1"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

export default function HeroCanvas() {
  return (
    <div className="w-full h-full min-h-[420px] lg:min-h-[560px] relative pointer-events-auto">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          {/* Light Theme Studio Lighting Setup */}
          <ambientLight intensity={1.2} />
          <directionalLight position={[10, 15, 10]} intensity={1.8} color="#ffffff" />
          <pointLight position={[-8, -5, 5]} intensity={1.2} color="#818cf8" />
          <pointLight position={[6, -6, -4]} intensity={0.9} color="#c084fc" />

          {/* Interactive Floating Object */}
          <FloatingGeometricObject />

          {/* Background Micro Particles */}
          <Particles count={60} />
        </Suspense>
      </Canvas>
    </div>
  );
}
