import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CheckpointProps {
  position: [number, number, number];
  reached: boolean;
  playerPosition: [number, number, number];
  onReach: () => void;
}

export default function Checkpoint({ position, reached, playerPosition, onReach }: CheckpointProps) {
  const flagRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (flagRef.current) {
      flagRef.current.rotation.y += delta * 0.6;
    }
    if (ringRef.current) {
      const s = 1 + Math.sin(Date.now() * 0.004) * 0.15;
      ringRef.current.scale.set(s, s, s);
    }
    if (reached) return;
    const dx = playerPosition[0] - position[0];
    const dy = playerPosition[1] - position[1];
    const dz = playerPosition[2] - position[2];
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < 2.2) onReach();
  });

  return (
    <group position={position}>
      {/* Glow ring on the ground */}
      <mesh ref={ringRef} position={[0, -0.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.8, 32]} />
        <meshStandardMaterial color="#fff35e" emissive="#fff35e" emissiveIntensity={1.2} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* Spinning flag */}
      <group ref={flagRef}>
        {/* Pole */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 2.4, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
        {/* Flag */}
        <mesh position={[0.7, 1.4, 0]} castShadow>
          <boxGeometry args={[1.4, 0.8, 0.06]} />
          <meshStandardMaterial color="#ff4d8d" emissive="#ff4d8d" emissiveIntensity={0.3} />
        </mesh>
        {/* Star on flag */}
        <mesh position={[0.7, 1.4, 0.04]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#fff35e" emissive="#fff35e" emissiveIntensity={1} />
        </mesh>
        {/* Top ball */}
        <mesh position={[0, 1.85, 0]} castShadow>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="#fff35e" emissive="#fff35e" emissiveIntensity={0.8} />
        </mesh>
      </group>

      <pointLight color="#fff35e" intensity={2} distance={10} position={[0, 1, 0]} />
    </group>
  );
}
