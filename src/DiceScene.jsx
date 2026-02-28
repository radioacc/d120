import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'
import MarbleDice from './MarbleDice'

export default function DiceScene({ rolling, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 280,
        height: 280,
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {/* Ambient base light */}
          <ambientLight intensity={0.4} color="#b8d4c8" />

          {/* Key light — warm top-left like the reference photo */}
          <directionalLight
            position={[-3, 4, 3]}
            intensity={2.2}
            color="#ffffff"
            castShadow
          />

          {/* Fill light — cool right side */}
          <directionalLight
            position={[4, -1, 2]}
            intensity={0.6}
            color="#a0c8ff"
          />

          {/* Rim light — teal backlight glow */}
          <pointLight
            position={[0, -3, -4]}
            intensity={1.2}
            color="#40c896"
          />

          {/* Subtle warm bounce from below */}
          <pointLight
            position={[0, -4, 2]}
            intensity={0.3}
            color="#c9a84c"
          />

          {/* HDR-like environment for reflections */}
          <Environment preset="studio" />

          {/* The dice */}
          <MarbleDice rolling={rolling} />

          {/* Soft shadow pool underneath */}
          <ContactShadows
            position={[0, -2.2, 0]}
            opacity={0.5}
            scale={5}
            blur={2.5}
            far={4}
            color="#000820"
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
