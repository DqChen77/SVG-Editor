import type { Document as XmlDocument, Element } from '@xmldom/xmldom';
import { Shape } from './Shape.js';

export class Text extends Shape {
  constructor(id: string, private x: number, private y: number, private content: string) { super(id, 'text'); }
  clone(): Text { const copy = new Text(this.id, this.x, this.y, this.content); this.copyStyles(copy); return copy; }
  move(dx: number, dy: number): void { this.x += dx; this.y += dy; }
  scale(factor: number): void { this.x *= factor; this.y *= factor; }
  protected setGeometry(attr: string, value: string): boolean {
    if (attr === 'text') { this.content = value; return true; }
    if (attr !== 'x' && attr !== 'y') return false;
    const n = Shape.number(value, attr);
    if (attr === 'x') this.x = n; else this.y = n;
    return true;
  }
  protected geometry(): string { return `(${this.x},${this.y}) ${JSON.stringify(this.content)}`; }
  protected writeGeometry(e: Element): void { e.setAttribute('x', String(this.x)); e.setAttribute('y', String(this.y)); }
  override toElement(xml: XmlDocument): Element { const e = super.toElement(xml); e.appendChild(xml.createTextNode(this.content)); return e; }
}
