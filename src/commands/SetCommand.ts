import { SnapshotCommand } from './SnapshotCommand.js';

export class SetCommand extends SnapshotCommand {
  constructor(private readonly id: string, private readonly attr: string, private readonly value: string) { super(); }
  protected apply(editor: import('../core/Editor.js').Editor): string {
    const shape = editor.document.find(this.id); shape.set(this.attr, this.value);
    return `${shape.tag}#${this.id} updated: ${this.attr}=${JSON.stringify(this.value)}`;
  }
}
