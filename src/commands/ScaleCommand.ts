import { SnapshotCommand } from './SnapshotCommand.js';

export class ScaleCommand extends SnapshotCommand {
  constructor(private readonly id: string, private readonly value: string) { super(); }
  protected apply(editor: import('../core/Editor.js').Editor): string {
    const factor = Number(this.value);
    if (!Number.isFinite(factor) || factor <= 0) throw new Error('scale factor must be positive');
    const shape = editor.document.find(this.id); shape.scale(factor);
    return `${shape.tag}#${this.id} scaled by ${factor}`;
  }
}
