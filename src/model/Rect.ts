import type { Element } from '@xmldom/xmldom';
import { Shape } from './Shape.js';

export class Rect extends Shape {
  constructor(id: string, private x: number, private y: number, private width: number, private height: number) {
    super(id, 'rect');
    if (![x, y, width, height].every(Number.isFinite) || width < 0 || height < 0) throw new Error('invalid rectangle geometry');
  }
  clone(): Rect { const copy = new Rect(this.id, this.x, this.y, this.width, this.height); this.copyStyles(copy); return copy; }
  move(dx: number, dy: number): void { this.x += dx; this.y += dy; }
  scale(factor: number): void { this.x *= factor; this.y *= factor; this.width *= factor; this.height *= factor; }
  protected setGeometry(attr: string, value: string): boolean {
    if (!['x', 'y', 'width', 'height'].includes(attr)) return false;
    const n = Shape.number(value, attr, attr === 'width' || attr === 'height');
    if (attr === 'x') this.x = n;
    if (attr === 'y') this.y = n;
    if (attr === 'width') this.width = n;
    if (attr === 'height') this.height = n;
    return true;
  }
  protected geometry(): string { return `x=${this.x} y=${this.y} w=${this.width} h=${this.height}`; }
  protected writeGeometry(e: Element): void { e.setAttribute('x', String(this.x)); e.setAttribute('y', String(this.y)); e.setAttribute('width', String(this.width)); e.setAttribute('height', String(this.height)); }
}
