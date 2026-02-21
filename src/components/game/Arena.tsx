import { useMemo } from 'react';
import * as THREE from 'three';

const ARENA_SIZE = 48;
const WALL_HEIGHT = 4;

export interface PlatformData {
  position: [number, number, number];
  size: [number, number, number]; // width, height, depth
}

export const PLATFORMS: PlatformData[] = [
  // Low platforms (height ~1.2)
  { position: [-12, 0.6, -12], size: [4, 1.2, 4] },
  { position: [12, 0.6, -12], size: [4, 1.2, 4] },
  { position: [-12, 0.6, 12], size: [4, 1.2, 4] },
  { position: [12, 0.6, 12], size: [4, 1.2, 4] },
  // Medium platforms (height ~2)
  { position: [0, 1, -6], size: [5, 2, 3] },
  { position: [0, 1, 6], size: [5, 2, 3] },
  { position: [-6, 1, 0], size: [3, 2, 5] },
  { position: [6, 1, 0], size: [3, 2, 5] },
  // Tall platforms (height ~3)
  { position: [-18, 1.5, 0], size: [4, 3, 4] },
  { position: [18, 1.5, 0], size: [4, 3, 4] },
  { position: [0, 1.5, -18], size: [4, 3, 4] },
  { position: [0, 1.5, 18], size: [4, 3, 4] },
  // Stepping stones
  { position: [-3, 0.4, -14], size: [2.5, 0.8, 2.5] },
  { position: [3, 0.8, -16], size: [2.5, 1.6, 2.5] },
  { position: [14, 0.4, 3], size: [2.5, 0.8, 2.5] },
  { position: [16, 0.8, -3], size: [2.5, 1.6, 2.5] },
];

function GridFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[ARENA_SIZE, ARENA_SIZE]} />
      <meshStandardMaterial
        color="#0a1628"
        emissive="#00ffff"
        emissiveIntensity={0.02}
      />
    </mesh>
  );
}

function GridLines() {
  const lines = useMemo(() => {
    const positions: number[] = [];
    const half = ARENA_SIZE / 2;
    const step = 2;
    for (let i = -half; i <= half; i += step) {
      positions.push(i, 0.01, -half, i, 0.01, half);
      positions.push(-half, 0.01, i, half, 0.01, i);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  return (
    <lineSegments geometry={lines}>
      <lineBasicMaterial color="#00ffff" opacity={0.12} transparent />
    </lineSegments>
  );
}

function Wall({ position, rotation, width }: { position: [number, number, number]; rotation?: [number, number, number]; width: number }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={[width, WALL_HEIGHT, 0.2]} />
      <meshStandardMaterial
        color="#0d1f3c"
        emissive="#00ffff"
        emissiveIntensity={0.05}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

function Pillar({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={[position[0], WALL_HEIGHT / 2, position[2]]} castShadow>
      <boxGeometry args={[1.2, WALL_HEIGHT, 1.2]} />
      <meshStandardMaterial
        color="#0d1f3c"
        emissive="#ff00aa"
        emissiveIntensity={0.08}
      />
    </mesh>
  );
}

function Platform({ data }: { data: PlatformData }) {
  const { position, size } = data;
  return (
    <group>
      <mesh position={position} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color="#0d1f3c"
          emissive="#8800ff"
          emissiveIntensity={0.12}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      {/* Edge glow line on top */}
      <mesh position={[position[0], position[1] + size[1] / 2 + 0.02, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size[0] - 0.1, size[2] - 0.1]} />
        <meshStandardMaterial
          color="#1a0a2e"
          emissive="#8800ff"
          emissiveIntensity={0.15}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

export default function Arena() {
  const half = ARENA_SIZE / 2;
  const h = WALL_HEIGHT / 2;

  const pillarPositions: [number, number, number][] = [
    [-16, 0, -16], [-16, 0, 0], [-16, 0, 16],
    [-8, 0, -8], [-8, 0, 8],
    [0, 0, -16], [0, 0, 16],
    [8, 0, -8], [8, 0, 8],
    [16, 0, -16], [16, 0, 0], [16, 0, 16],
  ];

  return (
    <group>
      <GridFloor />
      <GridLines />
      {/* Walls */}
      <Wall position={[0, h, -half]} width={ARENA_SIZE} />
      <Wall position={[0, h, half]} width={ARENA_SIZE} />
      <Wall position={[-half, h, 0]} rotation={[0, Math.PI / 2, 0]} width={ARENA_SIZE} />
      <Wall position={[half, h, 0]} rotation={[0, Math.PI / 2, 0]} width={ARENA_SIZE} />
      {/* Pillars */}
      {pillarPositions.map((pos, i) => (
        <Pillar key={i} position={pos} />
      ))}
      {/* Platforms */}
      {PLATFORMS.map((p, i) => (
        <Platform key={`platform-${i}`} data={p} />
      ))}
    </group>
  );
}
