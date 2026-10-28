import type { Editor } from '../core/Editor.js';
import type { Command } from './Command.js';

export class History {
  private readonly undoStack: Command[] = [];
  private readonly redoStack: Command[] = [];
  private enabled = true;

  execute(command: Command, editor: Editor): string {
    const result = command.execute(editor);
    this.undoStack.push(command);
    this.redoStack.length = 0;
    this.enabled = true;
    return result;
  }

  undo(editor: Editor): string {
    if (!this.enabled) throw new Error('undo not allowed after io command');
    const command = this.undoStack.pop();
    if (!command) throw new Error('nothing to undo');
    command.undo(editor);
    this.redoStack.push(command);
    return 'undone';
  }

  redo(editor: Editor): string {
    if (!this.enabled) throw new Error('undo not allowed after io command');
    const command = this.redoStack.pop();
    if (!command) throw new Error('nothing to redo');
    const result = command.redo(editor);
    this.undoStack.push(command);
    return result;
  }

  disable(): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.enabled = false;
  }
}
