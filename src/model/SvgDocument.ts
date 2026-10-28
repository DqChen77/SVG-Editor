import { Group } from './Group.js';
import { Shape } from './Shape.js';

export class SvgDocument {
  private readonly roots: Shape[] = [];
  private readonly byId = new Map<string, Shape>();

  constructor(public width: number = 800, public height: number = 600) {
    this.setCanvas(width, height);
  }

  get children(): readonly Shape[] { return this.roots; }
  get count(): number { return this.byId.size; }
  has(id: string): boolean { return this.byId.has(id); }
  find(id: string): Shape { const shape = this.byId.get(id); if (!shape) throw new Error(`no such shape: ${id}`); return shape; }

  container(id: string): Group {
    const shape = this.byId.get(id);
    if (!shape) throw new Error(`no such container: ${id}`);
    if (!(shape instanceof Group)) throw new Error(`not a container: ${id}`);
    return shape;
  }

  setCanvas(width: number, height: number): void {
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) throw new Error('canvas dimensions must be positive');
    this.width = width;
    this.height = height;
  }

  siblings(shape: Shape): Shape[] {
    return shape.parent ? [...shape.parent.children] : [...this.roots];
  }

  index(shape: Shape): number { return this.siblings(shape).indexOf(shape); }

  insert(shape: Shape, parent: Group | null = null, index?: number): void {
    this.visit(shape, node => { if (this.byId.has(node.id)) throw new Error(`id already exists: ${node.id}`); });
    this.visit(shape, node => this.byId.set(node.id, node));
    if (parent) parent.insert(shape, index);
    else { this.roots.splice(index ?? this.roots.length, 0, shape); shape.parent = null; }
  }

  remove(shape: Shape): number {
    const index = this.index(shape);
    if (shape.parent) shape.parent.remove(shape);
    else this.roots.splice(index, 1);
    this.visit(shape, node => this.byId.delete(node.id));
    return index;
  }

  relocate(shape: Shape, parent: Group | null, index?: number): void {
    if (parent && this.contains(shape, parent)) throw new Error(`cannot group a container into its own descendant: ${shape.id}`);
    this.remove(shape);
    this.insert(shape, parent, index);
  }

  contains(ancestor: Shape, candidate: Shape): boolean {
    for (let p: Shape | null = candidate; p; p = p.parent) if (p === ancestor) return true;
    return false;
  }

  visit(shape: Shape, action: (shape: Shape) => void): void {
    action(shape);
    if (shape instanceof Group) for (const child of shape.children) this.visit(child, action);
  }

  clone(): SvgDocument {
    const copy = new SvgDocument(this.width, this.height);
    for (const root of this.roots) copy.insert(root.clone());
    return copy;
  }

  tree(id?: string): string {
    const lines = id ? [] : [`svg (${this.width}x${this.height})`];
    const roots = id ? [this.find(id)] : this.roots;
    const append = (shape: Shape, prefix: string, last: boolean, top = false): void => {
      lines.push(`${top ? '' : `${prefix}${last ? '└── ' : '├── '}`}${shape.summary()}`);
      if (shape instanceof Group) shape.children.forEach((child, i) => append(child, top ? '' : `${prefix}${last ? '    ' : '│   '}`, i === shape.children.length - 1));
    };
    roots.forEach((root, i) => append(root, '', i === roots.length - 1, Boolean(id)));
    return lines.join('\n');
  }
}
