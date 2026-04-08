// Horizon.ts - исправлен
import { makeAutoObservable } from 'mobx';
import { Excavation } from './Excavation';

export class Horizon {
  id: string;
  guid: string;
  name: string;
  altitude: number;
  isMine: boolean;
  active: boolean;
  visible: boolean;
  sectionIds: string[];
  excavations: Excavation[];
  
  constructor(id: string, guid: string, name: string, altitude: number, isMine: boolean = true) {
    this.id = id;
    this.guid = guid;
    this.name = name;
    this.altitude = altitude;
    this.isMine = isMine;
    this.active = true;
    this.visible = true;
    this.sectionIds = [];
    this.excavations = [];
    makeAutoObservable(this);
  }
  
  setSectionIds(sectionIdsString: string): void {
    this.sectionIds = sectionIdsString.split(',').map(id => id.trim());
  }
  
  addExcavation(excavation: Excavation): void {
    this.excavations.push(excavation);
  }
  
  getVisibleExcavations(): Excavation[] {
    return this.excavations.filter(e => e.visible);
  }
  
  getInfo(): string {
    return `${this.name} (${this.altitude}м): ${this.excavations.length} выработок`;
  }
}