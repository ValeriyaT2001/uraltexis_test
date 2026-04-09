import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { observer } from 'mobx-react-lite';
import { MineStore } from '../../stores/MineStore';
import { Horizon } from '../../models/Horizon';

const TunnelSection: React.FC<{
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
  radius: number;
}> = React.memo(({ start, end, color, radius }) => {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );
  
  return (
    <mesh position={center} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, length, 12]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
    </mesh>
  );
});

const NodePoint: React.FC<{ position: THREE.Vector3; color: string }> = React.memo(({ position, color }) => {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.4, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
    </mesh>
  );
});

const SceneContent: React.FC<{ store: MineStore }> = observer(({ store }) => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#c44569', '#f5cd79', '#a8e6cf'];
  
  const { sections, nodes, bounds } = useMemo(() => {
    const sectionsList: { start: THREE.Vector3; end: THREE.Vector3; color: string; radius: number }[] = [];
    const nodesMap = new Map<string, THREE.Vector3>();
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
    
    store.horizons.forEach((horizon: Horizon, idx: number) => {
      if (!horizon.visible) return;
      
      const horizonColor = colors[idx % colors.length];
      
      horizon.getVisibleExcavations().forEach(excavation => {
        excavation.sections.forEach(section => {
          const startPos = new THREE.Vector3(
            section.startNode.position.x,
            section.startNode.position.y,
            section.startNode.position.z
          );
          const endPos = new THREE.Vector3(
            section.endNode.position.x,
            section.endNode.position.y,
            section.endNode.position.z
          );
          
          sectionsList.push({
            start: startPos,
            end: endPos,
            color: horizonColor,
            radius: section.getRadius()
          });
          
          [startPos, endPos].forEach(pos => {
            minX = Math.min(minX, pos.x);
            maxX = Math.max(maxX, pos.x);
            minY = Math.min(minY, pos.y);
            maxY = Math.max(maxY, pos.y);
            minZ = Math.min(minZ, pos.z);
            maxZ = Math.max(maxZ, pos.z);
          });
          
          nodesMap.set(section.startNode.id, startPos);
          nodesMap.set(section.endNode.id, endPos);
        });
      });
    });
    
    return {
      sections: sectionsList,
      nodes: Array.from(nodesMap.entries()).map(([id, pos]) => ({ id, position: pos })),
      bounds: { minX, maxX, minY, maxY, minZ, maxZ }
    };
  }, [store.horizons.map(h => h.visible).join(','), store.horizons]);
  
  const center = useMemo(() => {
    if (sections.length === 0) return new THREE.Vector3(0, 0, 0);
    return new THREE.Vector3(
      (bounds.minX + bounds.maxX) / 2,
      (bounds.minY + bounds.maxY) / 2,
      (bounds.minZ + bounds.maxZ) / 2
    );
  }, [bounds, sections.length]);
  
  const range = useMemo(() => {
    if (sections.length === 0) return 100;
    return Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY, bounds.maxZ - bounds.minZ);
  }, [bounds, sections.length]);
  
  if (sections.length === 0) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    );
  }
  
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[center.x + 20, center.y + 30, center.z + 20]} intensity={1} />
      <pointLight position={[center.x - 20, center.y + 20, center.z - 20]} intensity={0.5} />
      <pointLight position={[center.x, center.y + 10, center.z]} intensity={0.3} color="#ffaa66" />
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        zoomSpeed={1.2}
        rotateSpeed={1}
        target={[center.x, center.y, center.z]}
      />
      
      <gridHelper args={[range, 20, '#666666', '#333333']} position={[center.x, bounds.minY - 10, center.z]} />
      <axesHelper args={[range * 0.3]} />
      
      {sections.map((section, index) => (
        <TunnelSection key={`section-${index}`} {...section} />
      ))}
      
      {nodes.map((node) => (
        <NodePoint key={`node-${node.id}`} position={node.position} color="#ffd700" />
      ))}
    </>
  );
});

export const MineScene: React.FC<{ store: MineStore }> = observer(({ store }) => {
  const { bounds } = useMemo(() => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
    
    store.horizons.forEach(horizon => {
      if (!horizon.visible) return;
      
      horizon.getVisibleExcavations().forEach(excavation => {
        excavation.sections.forEach(section => {
          const points = [section.startNode.position, section.endNode.position];
          points.forEach(pos => {
            minX = Math.min(minX, pos.x);
            maxX = Math.max(maxX, pos.x);
            minY = Math.min(minY, pos.y);
            maxY = Math.max(maxY, pos.y);
            minZ = Math.min(minZ, pos.z);
            maxZ = Math.max(maxZ, pos.z);
          });
        });
      });
    });
    
    if (minX === Infinity) {
      return { bounds: { minX: -50, maxX: 50, minY: -50, maxY: 50, minZ: -50, maxZ: 50 } };
    }
    
    return { bounds: { minX, maxX, minY, maxY, minZ, maxZ } };
  }, [store.horizons.map(h => h.visible).join(','), store.horizons]);
  
  const cameraPosition = useMemo(() => {
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    const centerZ = (bounds.minZ + bounds.maxZ) / 2;
    const range = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY, bounds.maxZ - bounds.minZ);
    const distance = Math.max(range * 1.2, 50);
    
    return [centerX + distance * 0.5, centerY + distance * 0.5, centerZ + distance];
  }, [bounds]);
  
  if (store.loading) {
    return (
      <div className="scene-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка модели шахты...</p>
      </div>
    );
  }
  
  if (store.error) {
    return (
      <div className="scene-error">
        <p>❌ {store.error}</p>
      </div>
    );
  }
  
  return (
    <Canvas camera={{ position: cameraPosition as [number, number, number], fov: 45, near: 0.1, far: 10000 }}>
      <SceneContent store={store} />
    </Canvas>
  );
});