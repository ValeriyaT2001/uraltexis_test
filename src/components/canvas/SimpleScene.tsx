import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Компонент для отрисовки туннеля (цилиндр между двумя точками)
const Tunnel: React.FC<{ start: [number, number, number]; end: [number, number, number]; color: string }> = ({ start, end, color }) => {
  // Вычисляем направление и длину
  const startVec = new THREE.Vector3(start[0], start[1], start[2]);
  const endVec = new THREE.Vector3(end[0], end[1], end[2]);
  const direction = new THREE.Vector3().subVectors(endVec, startVec);
  const length = direction.length();
  const center = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
  
  // Поворачиваем цилиндр в нужном направлении
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );
  
  return (
    <mesh position={center} quaternion={quaternion}>
      <cylinderGeometry args={[0.3, 0.3, length, 8]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
    </mesh>
  );
};

// Компонент для узла (сфера)
const Node: React.FC<{ position: [number, number, number]; color: string }> = ({ position, color }) => {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </mesh>
  );
};

const SimpleScene: React.FC = () => {
  // Определим несколько точек для туннелей (имитация выработок)
  const tunnels = [
    { start: [-3, 0, 0], end: [0, 0, 0], color: '#ff6b6b' },    // Туннель 1
    { start: [0, 0, 0], end: [3, 0, 0], color: '#4ecdc4' },      // Туннель 2
    { start: [0, 0, 0], end: [0, 2, 0], color: '#45b7d1' },       // Туннель 3 (вверх)
    { start: [0, 2, 0], end: [2, 2, 2], color: '#96ceb4' },       // Туннель 4 (диагональ)
    { start: [-2, 1, -1], end: [-3, 0, 0], color: '#ffeaa7' },    // Туннель 5
  ];

  // Узлы (места соединения туннелей)
  const nodes = [
    { position: [-3, 0, 0] as [number, number, number], color: '#ffd700' },
    { position: [0, 0, 0] as [number, number, number], color: '#ffd700' },
    { position: [3, 0, 0] as [number, number, number], color: '#ffd700' },
    { position: [0, 2, 0] as [number, number, number], color: '#ffd700' },
    { position: [2, 2, 2] as [number, number, number], color: '#ffd700' },
    { position: [-2, 1, -1] as [number, number, number], color: '#ffd700' },
  ];

  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0a1a' }}>
      <Canvas
        camera={{
          position: [8, 6, 8],
          fov: 50
        }}
      >
        {/* Освещение */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-5, 5, -5]} intensity={0.5} />
        <pointLight position={[0, 5, 0]} intensity={0.3} color="#ffaa66" />
        
        {/* Управление камерой */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          zoomSpeed={1.2}
          rotateSpeed={1}
        />
        
        {/* Вспомогательная сетка */}
        <gridHelper args={[15, 20, '#888888', '#444444']} position={[0, -0.5, 0]} />
        
        {/* Оси координат (опционально, для ориентации) */}
        <axesHelper args={[5]} />
        
        {/* Отрисовка всех туннелей */}
        {tunnels.map((tunnel, index) => (
          <Tunnel
            key={`tunnel-${index}`}
            start={tunnel.start}
            end={tunnel.end}
            color={tunnel.color}
          />
        ))}
        
        {/* Отрисовка всех узлов */}
        {nodes.map((node, index) => (
          <Node
            key={`node-${index}`}
            position={node.position}
            color={node.color}
          />
        ))}
        
        {/* Добавим небольшой эффект свечения вокруг узлов (точки света) */}
        {nodes.map((node, index) => (
          <pointLight
            key={`light-${index}`}
            position={node.position}
            intensity={0.5}
            distance={2}
            color="#ffaa44"
          />
        ))}
      </Canvas>
      
      {/* Простая информация на экране */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        pointerEvents: 'none',
        zIndex: 100
      }}>
        <div>🖱️ Мышь: вращение | ПКМ: панорамирование | Скролл: zoom</div>
        <div>🎨 Цветные цилиндры - туннели | ✨ Золотые сферы - узлы</div>
      </div>
    </div>
  );
};

export default SimpleScene;