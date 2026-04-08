import { makeAutoObservable } from 'mobx';
import { Node } from './Node';

export class Section {
  id: string;
  startNode: Node;
  endNode: Node;
  length: number;
  
  constructor(id: string, startNode: Node, endNode: Node) {
    this.id = id;
    this.startNode = startNode;
    this.endNode = endNode;
    this.length = this.calculateLength();
    makeAutoObservable(this);
  }
  
  // Вычисление длины секции
  private calculateLength(): number {
    return this.startNode.distanceTo(this.endNode);
  }
  
  // Получение направления секции
  getDirection(): IPoint3D {
    return {
      x: this.endNode.position.x - this.startNode.position.x,
      y: this.endNode.position.y - this.startNode.position.y,
      z: this.endNode.position.z - this.startNode.position.z
    };
  }
  
  // Получение центра секции
  getCenter(): IPoint3D {
    return {
      x: (this.startNode.position.x + this.endNode.position.x) / 2,
      y: (this.startNode.position.y + this.endNode.position.y) / 2,
      z: (this.startNode.position.z + this.endNode.position.z) / 2
    };
  }
  
  // Проверка, является ли секция вертикальной
  isVertical(): boolean {
    return Math.abs(this.startNode.position.y - this.endNode.position.y) > 
           Math.abs(this.startNode.position.x - this.endNode.position.x) &&
           Math.abs(this.startNode.position.y - this.endNode.position.y) > 
           Math.abs(this.startNode.position.z - this.endNode.position.z);
  }
  
  // Получение длины в метрах (для информации)
  getLengthInMeters(): string {
    return `${this.length.toFixed(2)} м`;
  }
}