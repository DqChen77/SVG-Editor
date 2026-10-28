import { SnapshotCommand } from './SnapshotCommand.js';

export class ZOrderCommand extends SnapshotCommand {
  constructor(private readonly id: string, private readonly front: boolean) { super(); }
  protected apply(editor: import('../core/Editor.js').Editor): string {
    const shape = editor.document.find(this.id);
    const siblings = editor.document.siblings(shape);
    editor.document.relocate(shape, shape.parent, this.front ? siblings.length - 1 : 0);
    return `${shape.tag}#${this.id} moved to ${this.front ? 'front' : 'back'}`;
  }
}
