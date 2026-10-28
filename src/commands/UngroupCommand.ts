import { Group } from '../model/Group.js';
import { SnapshotCommand } from './SnapshotCommand.js';

export class UngroupCommand extends SnapshotCommand {
  constructor(private readonly id: string) { super(); }
  protected apply(editor: import('../core/Editor.js').Editor): string {
    const group = editor.document.find(this.id);
    if (!(group instanceof Group)) throw new Error(`not a container: ${this.id}`);
    if (!group.parent) throw new Error(`cannot ungroup top-level container: ${this.id}`);
    const parent = group.parent;
    const index = editor.document.index(group);
    const children = [...group.children];
    editor.document.remove(group);
    for (const child of children) editor.document.insert(child, parent, index + children.indexOf(child));
    return `g#${this.id} ungrouped`;
  }
}
