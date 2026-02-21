import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CollectibleProps {
  position: [number, number, number];
  color: string;
  collected: boolean;
  onCollect: () => void;
  playerPosition: [number, number, number];
}

export default function Collectible({ position, color, collected, onCollect, playerPosition }: CollectibleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((_, delta) => {
    if (collected || !meshRef.current) return;
    meshRef.current.rotation.y += delta * 2;
    meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.003) * 0.3;

    // Check distance to player
    const dx = playerPosition[0] - position[0];
    const dz = playerPosition[2] - position[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < 1.5) {
      onCollect();
    }
  });

  if (collected) return null;

  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <pointLight ref={lightRef} color={color} intensity={2} distance={6} />
    </group>
  );
}
