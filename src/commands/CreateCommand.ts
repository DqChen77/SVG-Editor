import { ShapeFactory } from '../model/ShapeFactory.js';
import { SnapshotCommand } from './SnapshotCommand.js';

export class CreateCommand extends SnapshotCommand {
  constructor(private readonly args: string[]) { super(); }
  protected apply(editor: import('../core/Editor.js').Editor): string {
    const [type, id, ...rest] = this.args;
    if (!type || !id) throw new Error('usage: create <type> <id> [params...]');
    if (editor.document.has(id)) throw new Error(`id already exists: ${id}`);
    const inIndex = rest.indexOf('in');
    const params = inIndex < 0 ? rest : rest.slice(0, inIndex);
    const parentId = inIndex < 0 ? undefined : rest[inIndex + 1];
    if (inIndex >= 0 && (!parentId || inIndex !== rest.length - 2)) throw new Error('invalid in clause');
    const counts: Record<string, number> = { rect: 4, circle: 3, ellipse: 4, line: 4, text: 3, g: 0 };
    const required = counts[type];
    if (required !== undefined && (params.length < required || params.length > required + (type === 'text' || type === 'g' ? 0 : 1))) throw new Error(`invalid parameters for ${type}`);
    const shape = new ShapeFactory().create(type, id, params);
    const color = params[required];
    if (color) shape.set(type === 'line' ? 'stroke' : 'fill', color);
    const parent = parentId ? editor.document.container(parentId) : null;
    editor.document.insert(shape, parent);
    return parent ? `${type}#${id} created in g#${parent.id}` : `${type}#${id} created`;
  }
}
