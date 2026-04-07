import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

const SimpleScene: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100%', background: '#1a1a2e' }}>
      <Canvas
        camera={{
          position: [5, 5, 5],
          fov: 50
        }}
      >
        {/* Простое освещение */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {/* Управление камерой - можно вращать и приближать */}
        <OrbitControls />
        
        {/* Простой куб для теста */}
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="orange" />
        </mesh>
        
        {/* Вспомогательная сетка */}
        <gridHelper args={[10, 10]} />
        
        {/* Оси координат */}
        <axesHelper args={[5]} />
      </Canvas>
    </div>
  );
};

export default SimpleScene;