import type { Element } from '@xmldom/xmldom';
import { Shape } from './Shape.js';

export class Line extends Shape {
  constructor(id: string, private x1: number, private y1: number, private x2: number, private y2: number) { super(id, 'line'); }
  clone(): Line { const copy = new Line(this.id, this.x1, this.y1, this.x2, this.y2); this.copyStyles(copy); return copy; }
  move(dx: number, dy: number): void { this.x1 += dx; this.y1 += dy; this.x2 += dx; this.y2 += dy; }
  scale(factor: number): void { this.x1 *= factor; this.y1 *= factor; this.x2 *= factor; this.y2 *= factor; }
  protected setGeometry(attr: string, value: string): boolean {
    if (!['x1', 'y1', 'x2', 'y2'].includes(attr)) return false;
    const n = Shape.number(value, attr);
    if (attr === 'x1') this.x1 = n;
    if (attr === 'y1') this.y1 = n;
    if (attr === 'x2') this.x2 = n;
    if (attr === 'y2') this.y2 = n;
    return true;
  }
  protected geometry(): string { return `(${this.x1},${this.y1}) -> (${this.x2},${this.y2})`; }
  protected writeGeometry(e: Element): void { e.setAttribute('x1', String(this.x1)); e.setAttribute('y1', String(this.y1)); e.setAttribute('x2', String(this.x2)); e.setAttribute('y2', String(this.y2)); }
}
