import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Bounds } from '@react-three/drei';
import { TShirtModel } from '../clothing-customizer/components/TShirtModel';

// Read-only 3D renderer for a CustomOrder design snapshot
// Props: { color: string, designImageUrl?: string }
export default function ReadOnlyDesignViewer({ color = '#ffffff', designImageUrl = null }) {
  return (
    <div style={{ width: '100%', height: 420, border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [5, 0, 5], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <pointLight position={[-5, 5, 5]} intensity={0.5} />

        <Bounds fit clip observe margin={1.2}>
          <TShirtModel
            selectedColor={color}
            chestDesignUrl={designImageUrl}
            position={[0, 0, 0]}
            scale={2}
          />
        </Bounds>

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          minDistance={2}
          maxDistance={8}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
          autoRotate={false}
          target={[0, 2.5, 0]}
        />
      </Canvas>
    </div>
  );
}
