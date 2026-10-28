import type { Element } from '@xmldom/xmldom';
import { Circle } from './Circle.js';
import { Ellipse } from './Ellipse.js';
import { Group } from './Group.js';
import { Line } from './Line.js';
import { Rect } from './Rect.js';
import { Shape } from './Shape.js';
import { Text } from './Text.js';

export class ShapeFactory {
  create(type: string, id: string, args: string[]): Shape {
    switch (type) {
      case 'rect': return new Rect(id, this.num(args, 0, 'x'), this.num(args, 1, 'y'), this.num(args, 2, 'width', true), this.num(args, 3, 'height', true));
      case 'circle': return new Circle(id, this.num(args, 0, 'cx'), this.num(args, 1, 'cy'), this.num(args, 2, 'r', true));
      case 'ellipse': return new Ellipse(id, this.num(args, 0, 'cx'), this.num(args, 1, 'cy'), this.num(args, 2, 'rx', true), this.num(args, 3, 'ry', true));
      case 'line': return new Line(id, this.num(args, 0, 'x1'), this.num(args, 1, 'y1'), this.num(args, 2, 'x2'), this.num(args, 3, 'y2'));
      case 'text': return new Text(id, this.num(args, 0, 'x'), this.num(args, 1, 'y'), args[2] ?? '');
      case 'g': return new Group(id);
      default: throw new Error(`unknown shape type: ${type} (is the plugin loaded?)`);
    }
  }

  fromElement(element: Element, id: string, warnings: string[]): Shape {
    const attr = (name: string, fallback = '0'): string => element.getAttribute(name) || fallback;
    const type = element.tagName;
    let shape: Shape;
    switch (type) {
      case 'rect': shape = new Rect(id, Number(attr('x')), Number(attr('y')), Number(attr('width')), Number(attr('height'))); break;
      case 'circle': shape = new Circle(id, Number(attr('cx')), Number(attr('cy')), Number(attr('r'))); break;
      case 'ellipse': shape = new Ellipse(id, Number(attr('cx')), Number(attr('cy')), Number(attr('rx')), Number(attr('ry'))); break;
      case 'line': shape = new Line(id, Number(attr('x1')), Number(attr('y1')), Number(attr('x2')), Number(attr('y2'))); break;
      case 'text': shape = new Text(id, Number(attr('x')), Number(attr('y')), element.textContent || ''); break;
      case 'g': shape = new Group(id); break;
      default: throw new Error(`unknown shape type: ${type} (is the plugin loaded?)`);
    }
    for (const name of ['fill', 'stroke', 'stroke-width']) if (element.hasAttribute(name)) shape.set(name, element.getAttribute(name) as string);
    if (!element.hasAttribute('id')) warnings.push(`warning: assigned id ${id} to unnamed <${type}>`);
    return shape;
  }

  private num(args: string[], index: number, name: string, nonnegative = false): number {
    const value = args[index];
    if (value === undefined) throw new Error(`missing parameter: ${name}`);
    const number = Number(value);
    if (!Number.isFinite(number) || (nonnegative && number < 0)) throw new Error(`invalid ${name}: ${value}`);
    return number;
  }
}
