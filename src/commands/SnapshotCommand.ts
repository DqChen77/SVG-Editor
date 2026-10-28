import type { Editor } from '../core/Editor.js';
import type { SvgDocument } from '../model/SvgDocument.js';
import type { Command } from './Command.js';

export abstract class SnapshotCommand implements Command {
  private before?: SvgDocument;
  private after?: SvgDocument;
  private result = '';

  execute(editor: import('../core/Editor.js').Editor): string {
    this.before = editor.document.clone();
    try {
      this.result = this.apply(editor);
      this.after = editor.document.clone();
      return this.result;
    } catch (error) {
      editor.replaceDocument(this.before);
      throw error;
    }
  }

  undo(editor: import('../core/Editor.js').Editor): void {
    if (!this.before) throw new Error('nothing to undo');
    editor.replaceDocument(this.before.clone());
  }

  redo(editor: import('../core/Editor.js').Editor): string {
    if (!this.after) throw new Error('nothing to redo');
    editor.replaceDocument(this.after.clone());
    return this.result;
  }

  protected abstract apply(editor: import('../core/Editor.js').Editor): string;
}
