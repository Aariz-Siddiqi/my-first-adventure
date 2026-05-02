import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface ObstacleData {
  // Center position the obstacle orbits/oscillates around
  center: [number, number, number];
  type: 'spinner' | 'slider';
  // For spinner: arm length. For slider: half-range along axis.
  range: number;
  speed: number;
  axis?: 'x' | 'z'; // for slider
  phase?: number;
  color?: string;
}

export const OBSTACLES: ObstacleData[] = [
  // Spinning bumpers on mid platforms
  { center: [4, 2.6, 11], type: 'spinner', range: 1.6, speed: 1.6, color: '#ff4d8d' },
  { center: [13, 3.8, 10], type: 'spinner', range: 1.4, speed: -2.0, color: '#c98bff' },
  { center: [10, 6.0, -4], type: 'spinner', range: 1.4, speed: 1.8, color: '#ff7eb6' },
  { center: [-7, 8.4, 0], type: 'spinner', range: 1.4, speed: -1.5, color: '#5ec8ff' },
  // Sliding spikes
  { center: [16, 4.4, 5], type: 'slider', range: 1.2, speed: 1.2, axis: 'z', color: '#ff4d8d' },
  { center: [-3, 10.8, 13], type: 'slider', range: 1.3, speed: 1.6, axis: 'x', phase: 1.0, color: '#ff4d8d' },
  { center: [-10, 9.2, 5], type: 'slider', range: 1.2, speed: 1.4, axis: 'x', color: '#ff7eb6' },
];

export const OBSTACLE_HIT_RADIUS = 0.9;

interface ObstaclesProps {
  playerPosition: [number, number, number];
  onHit: () => void;
}

// Compute obstacle world position at time t (seconds)
export function getObstaclePosition(o: ObstacleData, t: number): [number, number, number] {
  const phase = o.phase ?? 0;
  if (o.type === 'spinner') {
    const a = t * o.speed + phase;
    return [o.center[0] + Math.cos(a) * o.range, o.center[1], o.center[2] + Math.sin(a) * o.range];
  } else {
    const offset = Math.sin(t * o.speed + phase) * o.range;
    if (o.axis === 'z') return [o.center[0], o.center[1], o.center[2] + offset];
    return [o.center[0] + offset, o.center[1], o.center[2]];
  }
}

function Spinner({ data }: { data: ObstacleData }) {
  const groupRef = useRef<THREE.Group>(null);
  const ballRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pos = getObstaclePosition(data, t);
    if (ballRef.current) ballRef.current.position.set(pos[0], pos[1], pos[2]);
    if (groupRef.current) groupRef.current.rotation.y = t * data.speed + (data.phase ?? 0);
  });

  return (
    <group>
      {/* Center post */}
      <mesh position={[data.center[0], data.center[1] - 0.5, data.center[2]]}>
        <cylinderGeometry args={[0.12, 0.12, 1, 12]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Arm */}
      <group ref={groupRef} position={data.center}>
        <mesh position={[data.range / 2, 0, 0]}>
          <boxGeometry args={[data.range, 0.1, 0.1]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
      {/* Bumper ball */}
      <mesh ref={ballRef} castShadow>
        <sphereGeometry args={[0.55, 20, 20]} />
        <meshStandardMaterial color={data.color ?? '#ff4d8d'} emissive={data.color ?? '#ff4d8d'} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function Slider({ data }: { data: ObstacleData }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const pos = getObstaclePosition(data, state.clock.elapsedTime);
    if (ref.current) ref.current.position.set(pos[0], pos[1], pos[2]);
  });
  return (
    <mesh ref={ref} castShadow>
      <coneGeometry args={[0.55, 1.1, 6]} />
      <meshStandardMaterial color={data.color ?? '#ff4d8d'} emissive={data.color ?? '#ff4d8d'} emissiveIntensity={0.4} roughness={0.4} />
    </mesh>
  );
}

export default function Obstacles({ playerPosition, onHit }: ObstaclesProps) {
  const cooldown = useRef(0);

  useFrame((state, delta) => {
    cooldown.current = Math.max(0, cooldown.current - delta);
    if (cooldown.current > 0) return;
    const t = state.clock.elapsedTime;
    for (const o of OBSTACLES) {
      const p = getObstaclePosition(o, t);
      const dx = playerPosition[0] - p[0];
      const dy = playerPosition[1] - 0.8 - p[1]; // player center approx
      const dz = playerPosition[2] - p[2];
      if (dx * dx + dy * dy + dz * dz < OBSTACLE_HIT_RADIUS * OBSTACLE_HIT_RADIUS) {
        onHit();
        cooldown.current = 1.0;
        return;
      }
    }
  });

  const items = useMemo(() => OBSTACLES, []);
  return (
    <group>
      {items.map((o, i) => o.type === 'spinner' ? <Spinner key={i} data={o} /> : <Slider key={i} data={o} />)}
    </group>
  );
}
