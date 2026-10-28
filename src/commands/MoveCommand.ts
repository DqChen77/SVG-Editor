import { SnapshotCommand } from './SnapshotCommand.js';

export class MoveCommand extends SnapshotCommand {
  constructor(private readonly id: string, private readonly dx: string, private readonly dy: string) { super(); }
  protected apply(editor: import('../core/Editor.js').Editor): string {
    const dx = Number(this.dx), dy = Number(this.dy);
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) throw new Error('invalid move delta');
    const shape = editor.document.find(this.id); shape.move(dx, dy);
    return shape.tag === 'g' ? `g#${this.id} moved by (${dx},${dy})` : `${shape.tag}#${this.id} moved by (${dx},${dy})`;
  }
}
