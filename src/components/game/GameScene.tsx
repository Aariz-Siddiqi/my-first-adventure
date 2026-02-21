import { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Player from './Player';
import Arena from './Arena';
import Collectible from './Collectible';
import Lighting from './Lighting';
import HUD from './HUD';

const COLLECTIBLE_DATA = [
  { position: [-5, 1.2, -5] as [number, number, number], color: '#00ffff' },
  { position: [5, 1.2, -5] as [number, number, number], color: '#ff00aa' },
  { position: [-5, 1.2, 5] as [number, number, number], color: '#8800ff' },
  { position: [5, 1.2, 5] as [number, number, number], color: '#ffcc00' },
  { position: [0, 1.2, -10] as [number, number, number], color: '#00ffff' },
  { position: [0, 1.2, 10] as [number, number, number], color: '#ff00aa' },
  { position: [-10, 1.2, 0] as [number, number, number], color: '#8800ff' },
  { position: [10, 1.2, 0] as [number, number, number], color: '#ffcc00' },
  { position: [4, 1.2, 0] as [number, number, number], color: '#00ffff' },
  { position: [-4, 1.2, 0] as [number, number, number], color: '#ff00aa' },
];

export default function GameScene() {
  const [collected, setCollected] = useState<boolean[]>(new Array(COLLECTIBLE_DATA.length).fill(false));
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 1.7, 0]);
  const [isLocked, setIsLocked] = useState(false);

  const score = collected.filter(Boolean).length;

  const handleCollect = useCallback((index: number) => {
    setCollected(prev => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  }, []);

  // Restart on R key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyR') {
        setCollected(new Array(COLLECTIBLE_DATA.length).fill(false));
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Track pointer lock
  useEffect(() => {
    const onChange = () => setIsLocked(!!document.pointerLockElement);
    document.addEventListener('pointerlockchange', onChange);
    return () => document.removeEventListener('pointerlockchange', onChange);
  }, []);

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      <HUD score={score} total={COLLECTIBLE_DATA.length} isLocked={isLocked} />
      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 100 }}
        style={{ background: '#060d1f' }}
      >
        <Lighting />
        <Arena />
        <Player onPositionUpdate={setPlayerPos} />
        {COLLECTIBLE_DATA.map((item, i) => (
          <Collectible
            key={i}
            position={item.position}
            color={item.color}
            collected={collected[i]}
            onCollect={() => handleCollect(i)}
            playerPosition={playerPos}
          />
        ))}
      </Canvas>
    </div>
  );
}
