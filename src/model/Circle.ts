import type { Element } from '@xmldom/xmldom';
import { Shape } from './Shape.js';

export class Circle extends Shape {
  constructor(id: string, private cx: number, private cy: number, private r: number) { super(id, 'circle'); if (r < 0) throw new Error('invalid radius'); }
  clone(): Circle { const copy = new Circle(this.id, this.cx, this.cy, this.r); this.copyStyles(copy); return copy; }
  move(dx: number, dy: number): void { this.cx += dx; this.cy += dy; }
  scale(factor: number): void { this.cx *= factor; this.cy *= factor; this.r *= factor; }
  protected setGeometry(attr: string, value: string): boolean {
    if (!['cx', 'cy', 'r'].includes(attr)) return false;
    const n = Shape.number(value, attr, attr === 'r');
    if (attr === 'cx') this.cx = n;
    if (attr === 'cy') this.cy = n;
    if (attr === 'r') this.r = n;
    return true;
  }
  protected geometry(): string { return `cx=${this.cx} cy=${this.cy} r=${this.r}`; }
  protected writeGeometry(e: Element): void { e.setAttribute('cx', String(this.cx)); e.setAttribute('cy', String(this.cy)); e.setAttribute('r', String(this.r)); }
}
