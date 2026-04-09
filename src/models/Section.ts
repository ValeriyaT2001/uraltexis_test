import { makeAutoObservable } from "mobx";
import { Node, type IPoint3D } from "./Node";

export class Section {
  readonly id: string;
  readonly guid: string;
  readonly startNode: Node;
  readonly endNode: Node;
  readonly thickness: number;
  readonly length: number;

  constructor(
    id: string,
    guid: string,
    startNode: Node,
    endNode: Node,
    thickness: number = 4,
  ) {
    this.id = id;
    this.guid = guid;
    this.startNode = startNode;
    this.endNode = endNode;
    this.thickness = thickness;
    this.length = this.calculateLength();
    makeAutoObservable(this);
  }

  private calculateLength(): number {
    return this.startNode.distanceTo(this.endNode);
  }

  getDirection(): IPoint3D {
    return {
      x: this.endNode.position.x - this.startNode.position.x,
      y: this.endNode.position.y - this.startNode.position.y,
      z: this.endNode.position.z - this.startNode.position.z,
    };
  }

  getCenter(): IPoint3D {
    return {
      x: (this.startNode.position.x + this.endNode.position.x) / 2,
      y: (this.startNode.position.y + this.endNode.position.y) / 2,
      z: (this.startNode.position.z + this.endNode.position.z) / 2,
    };
  }

  getRadius(): number {
    return this.thickness / 2;
  }

  getInfo(): string {
    return `Section ${this.id}: length=${this.length.toFixed(2)}м, thickness=${this.thickness}`;
  }
}
