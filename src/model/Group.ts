import type { Document as XmlDocument, Element } from '@xmldom/xmldom';
import { Shape } from './Shape.js';

export class Group extends Shape {
  private readonly items: Shape[] = [];
  constructor(id: string) { super(id, 'g'); }
  get children(): readonly Shape[] { return this.items; }
  insert(shape: Shape, index = this.items.length): void { this.items.splice(index, 0, shape); shape.parent = this; }
  remove(shape: Shape): number { const i = this.items.indexOf(shape); if (i < 0) throw new Error(`no such shape: ${shape.id}`); this.items.splice(i, 1); shape.parent = null; return i; }
  clone(): Group { const copy = new Group(this.id); this.copyStyles(copy); for (const child of this.items) copy.insert(child.clone()); return copy; }
  move(dx: number, dy: number): void { for (const child of this.items) child.move(dx, dy); }
  scale(factor: number): void { for (const child of this.items) child.scale(factor); }
  protected setGeometry(_attr: string, _value: string): boolean { return false; }
  protected geometry(): string { return ''; }
  protected writeGeometry(_e: Element): void { }
  override toElement(xml: XmlDocument): Element { const e = super.toElement(xml); for (const child of this.items) e.appendChild(child.toElement(xml)); return e; }
}
