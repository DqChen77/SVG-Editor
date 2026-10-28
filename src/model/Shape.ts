import type { Document as XmlDocument, Element } from '@xmldom/xmldom';
import type { Group } from './Group.js';

export abstract class Shape {
  parent: Group | null = null;
  private readonly styles = new Map<string, string>();

  protected constructor(public readonly id: string, public readonly tag: string) {
    if (!id) throw new Error('id is required');
  }

  abstract clone(): Shape;
  abstract move(dx: number, dy: number): void;
  abstract scale(factor: number): void;
  protected abstract setGeometry(attr: string, value: string): boolean;
  protected abstract geometry(): string;
  protected abstract writeGeometry(element: Element): void;

  set(attr: string, value: string): void {
    if (['fill', 'stroke', 'stroke-width'].includes(attr)) {
      if (attr === 'stroke-width') Shape.number(value, attr, true);
      this.styles.set(attr, value);
    } else if (!this.setGeometry(attr, value)) {
      throw new Error(`unknown attribute: ${attr}`);
    }
  }

  protected copyStyles(to: Shape): void {
    for (const [key, value] of this.styles) to.styles.set(key, value);
  }

  protected styleSummary(): string {
    return [...this.styles].map(([key, value]) => ` ${key}=${value}`).join('');
  }

  summary(): string {
    return `${this.tag}#${this.id}${this.geometry() ? `  ${this.geometry()}` : ''}${this.styleSummary()}`;
  }

  details(): string {
    const parent = this.parent ? `g#${this.parent.id}` : 'svg';
    const lines = [`${this.tag}#${this.id}  parent=${parent}`];
    if (this.geometry()) lines.push(`  ${this.geometry()}`);
    for (const [key, value] of this.styles) lines.push(`  ${key}=${value}`);
    return lines.join('\n');
  }

  toElement(xml: XmlDocument): Element {
    const element = xml.createElement(this.tag);
    element.setAttribute('id', this.id);
    this.writeGeometry(element);
    for (const [key, value] of this.styles) element.setAttribute(key, value);
    return element;
  }

  protected static number(value: string, name: string, nonnegative = false): number {
    const result = Number(value);
    if (value.trim() === '' || !Number.isFinite(result) || (nonnegative && result < 0)) {
      throw new Error(`invalid ${name}: ${value}`);
    }
    return result;
  }
}
