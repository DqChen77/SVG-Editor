import { DOMParser } from '@xmldom/xmldom';
import type { Element } from '@xmldom/xmldom';
import { Group } from '../model/Group.js';
import { ShapeFactory } from '../model/ShapeFactory.js';
import { SvgDocument } from '../model/SvgDocument.js';

export interface ParsedSvg { document: SvgDocument; warnings: string[]; }

export class SvgParser {
  parse(source: string): ParsedSvg {
    const errors: string[] = [];
    const xml = new DOMParser({ onError: (level, message) => { if (level === 'error' || level === 'fatalError') errors.push(message); } }).parseFromString(source, 'image/svg+xml');
    if (errors.length || !xml.documentElement || xml.documentElement.tagName !== 'svg' || xml.getElementsByTagName('parsererror').length > 0) throw new Error('invalid SVG document');
    const root = xml.documentElement;
    const width = this.dimension(root.getAttribute('width'), 800);
    const height = this.dimension(root.getAttribute('height'), 600);
    const document = new SvgDocument(width, height);
    const warnings: string[] = [];
    const counters = new Map<string, number>();
    const reservedIds = new Set<string>();
    for (let i = 0; i < root.getElementsByTagName('*').length; i += 1) {
      const element = root.getElementsByTagName('*').item(i);
      const id = element?.getAttribute('id');
      if (id) reservedIds.add(id);
    }
    const factory = new ShapeFactory();
    const nextId = (tag: string, element: Element): string => {
      const explicit = element.getAttribute('id');
      if (explicit) return explicit;
      let index = (counters.get(tag) ?? 0) + 1;
      let id = `${tag}${index}`;
      while (document.has(id) || reservedIds.has(id)) id = `${tag}${++index}`;
      counters.set(tag, index);
      return id;
    };
    const visit = (element: Element, parent: Group | null): void => {
      const tag = element.tagName;
      if (!['rect', 'circle', 'ellipse', 'line', 'text', 'g'].includes(tag)) throw new Error(`unknown shape type: ${tag} (is the plugin loaded?)`);
      const shape = factory.fromElement(element, nextId(tag, element), warnings);
      document.insert(shape, parent);
      if (shape instanceof Group) for (let i = 0; i < element.childNodes.length; i += 1) {
        const child = element.childNodes.item(i);
        if (child && child.nodeType === 1) visit(child as Element, shape);
      }
    };
    for (let i = 0; i < root.childNodes.length; i += 1) {
      const child = root.childNodes.item(i);
      if (child && child.nodeType === 1) visit(child as Element, null);
    }
    return { document, warnings };
  }

  private dimension(value: string | null, fallback: number): number {
    if (!value) return fallback;
    const number = Number(value.replace(/px$/, ''));
    if (!Number.isFinite(number) || number <= 0) throw new Error('invalid canvas dimensions');
    return number;
  }
}
