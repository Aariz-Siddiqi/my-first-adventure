import * as THREE from 'three';
import { useMemo } from 'react';

export interface PlatformData {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}

// A path of floating platforms leading up to a goal
export const PLATFORMS: PlatformData[] = [
  // Start pad
  { position: [0, 0.5, 0], size: [8, 1, 8], color: '#7ed957' },
  // Stepping platforms - gentle climb
  { position: [0, 1, 7], size: [4, 1, 4], color: '#ffb84d' },
  { position: [4, 1.6, 11], size: [3.5, 1, 3.5], color: '#ff7eb6' },
  { position: [9, 2.2, 13], size: [3, 1, 3], color: '#7ed957' },
  { position: [13, 2.8, 10], size: [3, 1, 3], color: '#5ec8ff' },
  { position: [16, 3.4, 5], size: [3, 1, 3], color: '#c98bff' },
  { position: [14, 4.2, 0], size: [3, 1, 3], color: '#ffb84d' },
  { position: [10, 5.0, -4], size: [3, 1, 3], color: '#ff7eb6' },
  { position: [4, 5.8, -6], size: [3.5, 1, 3.5], color: '#7ed957' },
  { position: [-2, 6.6, -4], size: [3, 1, 3], color: '#5ec8ff' },
  { position: [-7, 7.4, 0], size: [3, 1, 3], color: '#c98bff' },
  { position: [-10, 8.2, 5], size: [3, 1, 3], color: '#ffb84d' },
  { position: [-8, 9.0, 10], size: [3, 1, 3], color: '#ff7eb6' },
  { position: [-3, 9.8, 13], size: [3, 1, 3], color: '#7ed957' },
  // Goal pad
  { position: [3, 10.5, 16], size: [6, 1, 6], color: '#fff35e' },
];

export const GOAL_POSITION: [number, number, number] = [3, 11.5, 16];

function Platform({ data }: { data: PlatformData }) {
  const { position, size, color } = data;
  return (
    <group>
      <mesh position={position} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.05} />
      </mesh>
      {/* Soft top accent */}
      <mesh position={[position[0], position[1] + size[1] / 2 + 0.01, position[2]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size[0] * 0.95, size[2] * 0.95]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function Cloud({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh><sphereGeometry args={[1.2, 16, 16]} /><meshStandardMaterial color="#ffffff" roughness={1} /></mesh>
      <mesh position={[1.1, -0.2, 0]}><sphereGeometry args={[0.9, 16, 16]} /><meshStandardMaterial color="#ffffff" roughness={1} /></mesh>
      <mesh position={[-1.1, -0.2, 0]}><sphereGeometry args={[0.9, 16, 16]} /><meshStandardMaterial color="#ffffff" roughness={1} /></mesh>
      <mesh position={[0.4, 0.5, 0.2]}><sphereGeometry args={[0.9, 16, 16]} /><meshStandardMaterial color="#ffffff" roughness={1} /></mesh>
    </group>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]} receiveShadow>
      <planeGeometry args={[400, 400]} />
      <meshStandardMaterial color="#7ed957" roughness={1} />
    </mesh>
  );
}

export default function Arena() {
  const clouds = useMemo<[number, number, number, number][]>(() => [
    [-25, 8, -15, 1.4],
    [22, 12, -10, 1.1],
    [-18, 14, 18, 1.6],
    [25, 6, 22, 1.2],
    [0, 16, -25, 1.5],
    [30, 10, 5, 1.3],
    [-30, 9, 8, 1.2],
  ], []);

  return (
    <group>
      <Ground />
      {PLATFORMS.map((p, i) => <Platform key={i} data={p} />)}
      {clouds.map(([x, y, z, s], i) => <Cloud key={i} position={[x, y, z]} scale={s} />)}
    </group>
  );
}
