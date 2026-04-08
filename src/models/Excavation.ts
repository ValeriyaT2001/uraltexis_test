import { makeAutoObservable } from 'mobx';
import { Section } from './Section';

export class Excavation {
  id: string;
  name: string;
  sections: Section[];
  visible: boolean;
  
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.sections = [];
    this.visible = true;
    makeAutoObservable(this);
  }
  
  // Добавление секции
  addSection(section: Section): void {
    this.sections.push(section);
  }
  
  // Удаление секции
  removeSection(sectionId: string): void {
    this.sections = this.sections.filter(s => s.id !== sectionId);
  }
  
  // Переключение видимости
  toggleVisibility(): void {
    this.visible = !this.visible;
  }
  
  // Установка видимости
  setVisible(visible: boolean): void {
    this.visible = visible;
  }
  
  // Получение общей длины выработки
  getTotalLength(): number {
    return this.sections.reduce((total, section) => total + section.length, 0);
  }
  
  // Получение количества секций
  getSectionsCount(): number {
    return this.sections.length;
  }
  
  // Получение информации о выработке
  getInfo(): string {
    return `${this.name}: ${this.getSectionsCount()} секций, общая длина ${this.getTotalLength().toFixed(2)} м`;
  }
}