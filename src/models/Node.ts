// Node.ts - исправлен
import { makeAutoObservable } from 'mobx';

export interface IPoint3D {
  x: number;
  y: number;
  z: number;
}

export class Node {
  id: string;
  guid: string;
  position: IPoint3D;
  
  constructor(id: string, guid: string, x: number, y: number, z: number) {
    this.id = id;
    this.guid = guid;
    this.position = { x, y, z };
    makeAutoObservable(this);
  }
  
  distanceTo(other: Node): number {
    const dx = this.position.x - other.position.x;
    const dy = this.position.y - other.position.y;
    const dz = this.position.z - other.position.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  clone(): Node {
    return new Node(this.id, this.guid, this.position.x, this.position.y, this.position.z);
  }
}