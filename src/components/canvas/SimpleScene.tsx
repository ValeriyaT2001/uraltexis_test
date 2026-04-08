import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Horizon } from '../../models/Horizon';
import { MineFactory } from '../../models/MineFactory';

// Компонент для отрисовки туннеля из секции
const TunnelSection: React.FC<{ 
  start: { x: number; y: number; z: number }; 
  end: { x: number; y: number; z: number }; 
  color: string;
  isVertical: boolean;
}> = ({ start, end, color, isVertical }) => {
  const startVec = new THREE.Vector3(start.x, start.y, start.z);
  const endVec = new THREE.Vector3(end.x, end.y, end.z);
  const direction = new THREE.Vector3().subVectors(endVec, startVec);
  const length = direction.length();
  const center = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
  
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );
  
  // Разный радиус для вертикальных и горизонтальных туннелей
  const radius = isVertical ? 0.4 : 0.3;
  
  return (
    <mesh position={center} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, length, 8]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
    </mesh>
  );
};

// Компонент для узла
const NodePoint: React.FC<{ position: { x: number; y: number; z: number }; color: string }> = ({ position, color }) => {
  return (
    <>
      <mesh position={[position.x, position.y, position.z]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <pointLight position={[position.x, position.y, position.z]} intensity={0.4} distance={3} color="#ffaa44" />
    </>
  );
};

const SimpleScene: React.FC = () => {
  const [horizons, setHorizons] = useState<Horizon[]>([]);
  
  useEffect(() => {
    // Загружаем тестовые данные
    const testData = MineFactory.createTestData();
    setHorizons(testData);
    MineFactory.logStatistics(testData);
  }, []);
  
  // Собираем все секции и узлы из горизонтов
  const allSections: { start: any; end: any; color: string; isVertical: boolean; visible: boolean }[] = [];
  const allNodes: Map<string, { position: any; color: string }> = new Map();
  
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'];
  
  horizons.forEach((horizon, idx) => {
    const horizonColor = colors[idx % colors.length];
    
    horizon.excavations.forEach(excavation => {
      if (!excavation.visible) return;
      
      excavation.sections.forEach(section => {
        allSections.push({
          start: section.startNode.position,
          end: section.endNode.position,
          color: horizonColor,
          isVertical: section.isVertical(),
          visible: excavation.visible
        });
        
        // Добавляем узлы
        if (!allNodes.has(section.startNode.id)) {
          allNodes.set(section.startNode.id, {
            position: section.startNode.position,
            color: '#ffd700'
          });
        }
        if (!allNodes.has(section.endNode.id)) {
          allNodes.set(section.endNode.id, {
            position: section.endNode.position,
            color: '#ffd700'
          });
        }
      });
    });
  });
  
  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0a1a' }}>
      <Canvas
        camera={{
          position: [15, 12, 15],
          fov: 50
        }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-5, 5, -5]} intensity={0.5} />
        <pointLight position={[0, 10, 0]} intensity={0.3} color="#ffaa66" />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          zoomSpeed={1.2}
          rotateSpeed={1}
        />
        
        <gridHelper args={[20, 20, '#888888', '#444444']} position={[0, -0.5, 0]} />
        <axesHelper args={[8]} />
        
        {/* Отрисовка всех секций */}
        {allSections.map((section, index) => (
          section.visible && (
            <TunnelSection
              key={`section-${index}`}
              start={section.start}
              end={section.end}
              color={section.color}
              isVertical={section.isVertical}
            />
          )
        ))}
        
        {/* Отрисовка всех узлов */}
        {Array.from(allNodes.values()).map((node, index) => (
          <NodePoint
            key={`node-${index}`}
            position={node.position}
            color={node.color}
          />
        ))}
      </Canvas>
      
      {/* Информационная панель */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        pointerEvents: 'none',
        zIndex: 100,
        borderLeft: '3px solid #ffd700'
      }}>
        <div><strong>📊 Статистика шахты</strong></div>
        <div>🏔️ Горизонтов: {horizons.length}</div>
        <div>🛤️ Выработок: {horizons.reduce((sum, h) => sum + h.excavations.length, 0)}</div>
        <div>🔗 Секций: {allSections.length}</div>
        <div>💎 Узлов: {allNodes.size}</div>
        <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.7 }}>
          🖱️ Мышь: вращение | ПКМ: панорамирование | Скролл: zoom
        </div>
      </div>
      
      {/* Легенда */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '11px',
        pointerEvents: 'none',
        zIndex: 100
      }}>
        <div><strong>🎨 Легенда</strong></div>
        {horizons.map((horizon, idx) => (
          <div key={horizon.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <div style={{ width: '20px', height: '4px', background: colors[idx % colors.length], borderRadius: '2px' }}></div>
            <span>{horizon.name}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <div style={{ width: '12px', height: '12px', background: '#ffd700', borderRadius: '50%' }}></div>
          <span>Узлы соединения</span>
        </div>
      </div>
    </div>
  );
};

export default SimpleScene;