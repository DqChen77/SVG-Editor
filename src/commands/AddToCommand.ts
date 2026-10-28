import { SnapshotCommand } from './SnapshotCommand.js';

export class AddToCommand extends SnapshotCommand {
  constructor(private readonly groupId: string, private readonly id: string) { super(); }
  protected apply(editor: import('../core/Editor.js').Editor): string {
    const group = editor.document.container(this.groupId);
    const shape = editor.document.find(this.id);
    if (group === shape || editor.document.contains(shape, group)) throw new Error(`cannot group a container into its own descendant: ${this.groupId}`);
    editor.document.relocate(shape, group);
    return `${shape.tag}#${this.id} added to g#${this.groupId}`;
  }
}
