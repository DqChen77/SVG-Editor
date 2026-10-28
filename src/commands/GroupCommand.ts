import { Group } from '../model/Group.js';
import { SnapshotCommand } from './SnapshotCommand.js';

export class GroupCommand extends SnapshotCommand {
  constructor(private readonly groupId: string, private readonly ids: string[]) { super(); }
  protected apply(editor: import('../core/Editor.js').Editor): string {
    if (!this.groupId || this.ids.length === 0) throw new Error('usage: group <newGid> <id1> <id2>...');
    if (editor.document.has(this.groupId)) throw new Error(`id already exists: ${this.groupId}`);
    const selected = this.ids.map(id => editor.document.find(id));
    const shapes = [...selected].sort((left, right) => left.parent === right.parent
      ? editor.document.index(left) - editor.document.index(right)
      : this.ids.indexOf(left.id) - this.ids.indexOf(right.id));
    for (const shape of shapes) for (const other of shapes) if (shape !== other && editor.document.contains(shape, other)) throw new Error(`cannot group a container into its own descendant: ${shape.id}`);
    const parent = shapes[0].parent;
    const indices = shapes.map(shape => editor.document.index(shape));
    const insertAt = Math.min(...indices);
    const group = new Group(this.groupId);
    editor.document.insert(group, parent, insertAt);
    for (const shape of shapes) editor.document.relocate(shape, group);
    return `g#${this.groupId} created with ${shapes.length} children`;
  }
}
