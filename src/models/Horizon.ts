import { makeAutoObservable } from 'mobx';
import { Excavation } from './Excavation';

export class Horizon {
  id: string;
  name: string;
  level: number;
  excavations: Excavation[];
  
  constructor(id: string, name: string, level: number) {
    this.id = id;
    this.name = name;
    this.level = level;
    this.excavations = [];
    makeAutoObservable(this);
  }
  
  // Добавление выработки
  addExcavation(excavation: Excavation): void {
    this.excavations.push(excavation);
  }
  
  // Удаление выработки
  removeExcavation(excavationId: string): void {
    this.excavations = this.excavations.filter(e => e.id !== excavationId);
  }
  
  // Получение выработки по ID
  getExcavationById(excavationId: string): Excavation | undefined {
    return this.excavations.find(e => e.id === excavationId);
  }
  
  // Получение всех видимых выработок
  getVisibleExcavations(): Excavation[] {
    return this.excavations.filter(e => e.visible);
  }
  
  // Получение общего количества секций на горизонте
  getTotalSectionsCount(): number {
    return this.excavations.reduce((total, exc) => total + exc.getSectionsCount(), 0);
  }
  
  // Получение общей длины всех выработок на горизонте
  getTotalLength(): number {
    return this.excavations.reduce((total, exc) => total + exc.getTotalLength(), 0);
  }
  
  // Получение информации о горизонте
  getInfo(): string {
    return `${this.name} (${this.level} м): ${this.excavations.length} выработок, ${this.getTotalSectionsCount()} секций`;
  }
}