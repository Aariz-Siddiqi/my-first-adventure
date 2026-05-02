export default function Lighting() {
  return (
    <>
      <ambientLight intensity={0.7} color="#ffffff" />
      <hemisphereLight args={['#bde6ff', '#7ed957', 0.6]} />
      <directionalLight
        position={[15, 25, 10]}
        intensity={1.2}
        color="#fff5d6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <fog attach="fog" args={['#bde6ff', 40, 120]} />
    </>
  );
}
