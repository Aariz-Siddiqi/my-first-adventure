import { useState, useCallback, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import Player from './Player';
import Arena, { GOAL_POSITION } from './Arena';
import Checkpoint from './Checkpoint';
import Obstacles from './Obstacles';
import Lighting from './Lighting';
import HUD from './HUD';

const BEST_KEY = 'sky-hop-best';

export default function GameScene() {
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 1.7, 0]);
  const [isLocked, setIsLocked] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(() => {
    const saved = localStorage.getItem(BEST_KEY);
    return saved ? parseFloat(saved) : null;
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [reached, setReached] = useState(false);
  const [falls, setFalls] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number>(0);
  const finalTimeRef = useRef<number>(0);

  // Start timer when locked & moving in
  useEffect(() => {
    if (isLocked && !gameStarted && !reached) {
      setGameStarted(true);
      startTimeRef.current = performance.now();
    }
  }, [isLocked, gameStarted, reached]);

  // Timer loop
  useEffect(() => {
    if (!gameStarted || reached) return;
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
  }, [gameStarted, reached]);

  // Save best time on win
  useEffect(() => {
    if (reached) {
      const time = finalTimeRef.current;
      if (bestTime === null || time < bestTime) {
        setBestTime(time);
        localStorage.setItem(BEST_KEY, time.toString());
      }
    }
  }, [reached]);

  const handleReach = useCallback(() => {
    setReached(prev => prev || true);
  }, []);

  const handleFall = useCallback(() => {
    setFalls(f => f + 1);
  }, []);

  const handleObstacleHit = useCallback(() => {
    setFalls(f => f + 1);
    setResetSignal(s => s + 1);
  }, []);

  // Restart on R
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyR') {
        setElapsedTime(0);
        setGameStarted(false);
        setReached(false);
        setFalls(0);
        startTimeRef.current = null;
        finalTimeRef.current = 0;
        setResetSignal(s => s + 1);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const onChange = () => setIsLocked(!!document.pointerLockElement);
    document.addEventListener('pointerlockchange', onChange);
    return () => document.removeEventListener('pointerlockchange', onChange);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: 'linear-gradient(180deg, #bde6ff 0%, #ffd6e8 100%)' }}>
      <HUD
        isLocked={isLocked}
        elapsedTime={elapsedTime}
        bestTime={bestTime}
        reached={reached}
        falls={falls}
      />
      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 200 }}
        style={{ background: 'transparent' }}
      >
        <Lighting />
        <Arena />
        <Player
          onPositionUpdate={setPlayerPos}
          onFall={handleFall}
          resetSignal={resetSignal}
        />
        <Checkpoint
          position={GOAL_POSITION}
          reached={reached}
          playerPosition={playerPos}
          onReach={handleReach}
        />
        <Obstacles playerPosition={playerPos} onHit={handleObstacleHit} />
      </Canvas>
    </div>
  );
}
