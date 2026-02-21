import { useState, useCallback, useEffect, useRef } from 'react';
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
  const [elapsedTime, setElapsedTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('neon-arena-best');
    return saved ? parseFloat(saved) : null;
  });
  const [gameStarted, setGameStarted] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number>(0);
  const finalTimeRef = useRef<number>(0);

  const score = collected.filter(Boolean).length;
  const won = score === COLLECTIBLE_DATA.length;

  // Timer loop
  useEffect(() => {
    if (!gameStarted || won) return;
    let running = true;
    const tick = () => {
      if (!running || !startTimeRef.current) return;
      const t = (performance.now() - startTimeRef.current) / 1000;
      setElapsedTime(t);
      finalTimeRef.current = t;
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(animFrameRef.current); };
  }, [gameStarted, won]);

  // Save best time on win
  useEffect(() => {
    if (won) {
      const time = finalTimeRef.current;
      if (bestTime === null || time < bestTime) {
        setBestTime(time);
        localStorage.setItem('neon-arena-best', time.toString());
      }
    }
  }, [won]);

  const handleCollect = useCallback((index: number) => {
    if (!gameStarted) {
      setGameStarted(true);
      startTimeRef.current = performance.now();
    }
    setCollected(prev => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  }, [gameStarted]);

  // Restart on R key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyR') {
        setCollected(new Array(COLLECTIBLE_DATA.length).fill(false));
        setElapsedTime(0);
        setGameStarted(false);
        startTimeRef.current = null;
        finalTimeRef.current = 0;
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

  // Track pointer lock
  useEffect(() => {
    const onChange = () => setIsLocked(!!document.pointerLockElement);
    document.addEventListener('pointerlockchange', onChange);
    return () => document.removeEventListener('pointerlockchange', onChange);
  }, []);

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      <HUD score={score} total={COLLECTIBLE_DATA.length} isLocked={isLocked} elapsedTime={elapsedTime} bestTime={bestTime} />
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
