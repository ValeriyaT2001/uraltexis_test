import { makeAutoObservable } from 'mobx';

export interface IPoint3D {
  x: number;
  y: number;
  z: number;
}

export class Node {
  id: string;
  position: IPoint3D;
  
  constructor(id: string, x: number, y: number, z: number) {
    this.id = id;
    this.position = { x, y, z };
    makeAutoObservable(this);
  }
  
  // Метод для получения расстояния до другой точки
  distanceTo(other: Node): number {
    const dx = this.position.x - other.position.x;
    const dy = this.position.y - other.position.y;
    const dz = this.position.z - other.position.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  // Метод для получения копии узла
  clone(): Node {
    return new Node(this.id, this.position.x, this.position.y, this.position.z);
  }
  
  // Метод для обновления позиции
  updatePosition(x: number, y: number, z: number): void {
    this.position = { x, y, z };
  }
}