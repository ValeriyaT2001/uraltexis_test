// Excavation.ts - исправлен
import { makeAutoObservable } from 'mobx';
import { Section } from './Section';

export class Excavation {
  id: string;
  guid: string;
  name: string;
  objectId: string;
  excavationType: string;
  sectionIds: string[];
  sections: Section[];
  visible: boolean;
  
  constructor(id: string, guid: string, name: string, objectId: string, excavationType: string) {
    this.id = id;
    this.guid = guid;
    this.name = name;
    this.objectId = objectId;
    this.excavationType = excavationType;
    this.sectionIds = [];
    this.sections = [];
    this.visible = true;
    makeAutoObservable(this);
  }
  
  setSectionIds(sectionIdsString: string): void {
    this.sectionIds = sectionIdsString.split(',').map(id => id.trim());
  }
  
  addSection(section: Section): void {
    this.sections.push(section);
  }
  
  toggleVisibility(): void {
    this.visible = !this.visible;
  }
  
  getTotalLength(): number {
    return this.sections.reduce((total, section) => total + section.length, 0);
  }
  
  getInfo(): string {
    return `${this.name}: ${this.sections.length} секций, длина ${this.getTotalLength().toFixed(2)}м`;
  }
}