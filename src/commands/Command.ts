import type { Editor } from '../core/Editor.js';

export interface Command {
  execute(editor: Editor): string;
  undo(editor: Editor): void;
  redo(editor: Editor): string;
}
