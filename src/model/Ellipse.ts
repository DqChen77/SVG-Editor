import type { Element } from '@xmldom/xmldom';
import { Shape } from './Shape.js';

export class Ellipse extends Shape {
  constructor(id: string, private cx: number, private cy: number, private rx: number, private ry: number) { super(id, 'ellipse'); if (![cx, cy, rx, ry].every(Number.isFinite) || rx < 0 || ry < 0) throw new Error('invalid ellipse radius'); }
  clone(): Ellipse { const copy = new Ellipse(this.id, this.cx, this.cy, this.rx, this.ry); this.copyStyles(copy); return copy; }
  move(dx: number, dy: number): void { this.cx += dx; this.cy += dy; }
  scale(factor: number): void { this.cx *= factor; this.cy *= factor; this.rx *= factor; this.ry *= factor; }
  protected setGeometry(attr: string, value: string): boolean {
    if (!['cx', 'cy', 'rx', 'ry'].includes(attr)) return false;
    const n = Shape.number(value, attr, attr === 'rx' || attr === 'ry');
    if (attr === 'cx') this.cx = n;
    if (attr === 'cy') this.cy = n;
    if (attr === 'rx') this.rx = n;
    if (attr === 'ry') this.ry = n;
    return true;
  }
  protected geometry(): string { return `cx=${this.cx} cy=${this.cy} rx=${this.rx} ry=${this.ry}`; }
  protected writeGeometry(e: Element): void { e.setAttribute('cx', String(this.cx)); e.setAttribute('cy', String(this.cy)); e.setAttribute('rx', String(this.rx)); e.setAttribute('ry', String(this.ry)); }
}
