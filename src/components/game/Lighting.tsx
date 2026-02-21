export default function Lighting() {
  return (
    <>
      <ambientLight intensity={0.15} color="#1a1a3e" />
      <directionalLight
        position={[10, 15, 10]}
        intensity={0.3}
        color="#4488ff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* Neon accent lights */}
      <pointLight position={[-10, 3, -10]} color="#00ffff" intensity={3} distance={20} />
      <pointLight position={[10, 3, 10]} color="#ff00aa" intensity={3} distance={20} />
      <pointLight position={[0, 3, 0]} color="#8800ff" intensity={2} distance={15} />
      {/* Fog */}
      <fog attach="fog" args={['#060d1f', 5, 35]} />
    </>
  );
}
