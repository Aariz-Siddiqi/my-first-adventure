import { useMemo } from 'react';
import * as THREE from 'three';

const ARENA_SIZE = 24;
const WALL_HEIGHT = 4;

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

// Interior obstacles
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

export default function Arena() {
  const half = ARENA_SIZE / 2;
  const h = WALL_HEIGHT / 2;

  const pillarPositions: [number, number, number][] = [
    [-8, 0, -8], [-8, 0, 0], [-8, 0, 8],
    [0, 0, -8], [0, 0, 8],
    [8, 0, -8], [8, 0, 0], [8, 0, 8],
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
    </group>
  );
}
