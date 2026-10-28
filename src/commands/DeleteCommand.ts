import { SnapshotCommand } from './SnapshotCommand.js';

export class DeleteCommand extends SnapshotCommand {
  constructor(private readonly id: string) { super(); }
  protected apply(editor: import('../core/Editor.js').Editor): string {
    const shape = editor.document.find(this.id);
    const tag = shape.tag;
    editor.document.remove(shape);
    return `${tag}#${this.id} deleted`;
  }
}
