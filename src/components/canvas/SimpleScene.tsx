import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Horizon } from '../../models/Horizon';
import { XmlParser } from '../../services/XmlParser';

// Компонент для отрисовки туннеля
const TunnelSection: React.FC<{ 
  start: { x: number; y: number; z: number }; 
  end: { x: number; y: number; z: number }; 
  color: string;
  radius: number;
}> = ({ start, end, color, radius }) => {
  const startVec = new THREE.Vector3(start.x, start.y, start.z);
  const endVec = new THREE.Vector3(end.x, end.y, end.z);
  const direction = new THREE.Vector3().subVectors(endVec, startVec);
  const length = direction.length();
  const center = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
  
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );
  
  return (
    <mesh position={center} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, length, 12]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.6} />
    </mesh>
  );
};

// Компонент для узла
const NodePoint: React.FC<{ position: { x: number; y: number; z: number }; color: string }> = ({ position, color }) => {
  return (
    <mesh position={[position.x, position.y, position.z]}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </mesh>
  );
};

export const SimpleScene: React.FC = () => {
  const [horizons, setHorizons] = useState<Horizon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await XmlParser.parseXmlFile('/MIM_Scheme.xml');
        setHorizons(data);
        XmlParser.logStatistics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a1a', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <div>📁 Загрузка данных шахты...</div>
          <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>Парсинг XML (windows-1251)</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a1a', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <div>❌ Ошибка: {error}</div>
          <div style={{ fontSize: '12px', marginTop: '10px' }}>Проверьте наличие файла MIM_Scheme.xml в папке public</div>
        </div>
      </div>
    );
  }

  // Собираем все секции для отображения
  const allSegments: { start: any; end: any; color: string; radius: number; visible: boolean }[] = [];
  const allNodes: Map<string, { position: any; color: string }> = new Map();
  
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#c44569', '#f5cd79'];
  
  horizons.forEach((horizon, idx) => {
    const horizonColor = colors[idx % colors.length];
    
    horizon.excavations.forEach(excavation => {
      if (!excavation.visible) return;
      
      excavation.sections.forEach(section => {
        allSegments.push({
          start: section.startNode.position,
          end: section.endNode.position,
          color: horizonColor,
          radius: section.getRadius(),
          visible: true
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

  // Вычисляем границы сцены для настройки камеры
  const allPoints = allSegments.flatMap(s => [s.start, s.end]);
  const minX = Math.min(...allPoints.map(p => p.x));
  const maxX = Math.max(...allPoints.map(p => p.x));
  const minY = Math.min(...allPoints.map(p => p.y));
  const maxY = Math.max(...allPoints.map(p => p.y));
  const minZ = Math.min(...allPoints.map(p => p.z));
  const maxZ = Math.max(...allPoints.map(p => p.z));
  
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;
  const range = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
  const cameraDistance = range * 1.2;

  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0a1a' }}>
      <Canvas
        camera={{
          position: [centerX + cameraDistance * 0.6, centerY + cameraDistance * 0.6, centerZ + cameraDistance],
          fov: 50
        }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[centerX + 10, centerY + 20, centerZ + 10]} intensity={1} />
        <pointLight position={[centerX - 10, centerY + 10, centerZ - 10]} intensity={0.5} />
        <pointLight position={[centerX, centerY + 5, centerZ]} intensity={0.3} color="#ffaa66" />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          zoomSpeed={1.2}
          rotateSpeed={1}
          target={[centerX, centerY, centerZ]}
        />
        
        <gridHelper args={[range, 20, '#888888', '#444444']} position={[centerX, minY - 10, centerZ]} />
        <axesHelper args={[range * 0.3]} />
        
        {allSegments.map((segment, index) => (
          <TunnelSection
            key={`section-${index}`}
            start={segment.start}
            end={segment.end}
            color={segment.color}
            radius={segment.radius}
          />
        ))}
        
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
        background: 'rgba(0,0,0,0.85)',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        pointerEvents: 'none',
        zIndex: 100,
        borderLeft: '3px solid #4ecdc4',
        maxWidth: '300px'
      }}>
        <div><strong>📊 Статистика шахты</strong></div>
        <div>🏔️ Горизонтов: {horizons.length}</div>
        <div>🛤️ Выработок: {horizons.reduce((sum, h) => sum + h.excavations.length, 0)}</div>
        <div>🔗 Секций: {allSegments.length}</div>
        <div>💎 Узлов: {allNodes.size}</div>
        <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.7 }}>
          📐 Диапазон: X[{minX.toFixed(0)}..{maxX.toFixed(0)}] Y[{minY.toFixed(0)}..{maxY.toFixed(0)}]
        </div>
      </div>
    </div>
  );
};

export default SimpleScene;