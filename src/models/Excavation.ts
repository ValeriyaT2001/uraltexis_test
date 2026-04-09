import { makeAutoObservable } from "mobx";
import { Section } from "./Section";

export class Excavation {
  readonly id: string;
  readonly guid: string;
  readonly name: string;
  readonly objectId: string;
  readonly excavationType: string;
  private _sections: Section[] = [];
  visible: boolean = true;

  constructor(
    id: string,
    guid: string,
    name: string,
    objectId: string,
    excavationType: string,
  ) {
    this.id = id;
    this.guid = guid;
    this.name = name || `Выработка ${id}`;
    this.objectId = objectId;
    this.excavationType = excavationType;
    makeAutoObservable(this);
  }

  get sections(): Section[] {
    return this._sections;
  }

  addSection(section: Section): void {
    this._sections.push(section);
  }

  toggleVisibility(): void {
    this.visible = !this.visible;
  }

  getTotalLength(): number {
    return this._sections.reduce((total, section) => total + section.length, 0);
  }

  getInfo(): string {
    return `${this.name}: ${this._sections.length} секций, ${this.getTotalLength().toFixed(0)}м`;
  }
}
