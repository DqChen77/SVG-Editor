import { readFileSync, writeFileSync } from 'node:fs';
import { AddToCommand } from '../commands/AddToCommand.js';
import { Command } from '../commands/Command.js';
import { CreateCommand } from '../commands/CreateCommand.js';
import { DeleteCommand } from '../commands/DeleteCommand.js';
import { GroupCommand } from '../commands/GroupCommand.js';
import { History } from '../commands/History.js';
import { MoveCommand } from '../commands/MoveCommand.js';
import { ScaleCommand } from '../commands/ScaleCommand.js';
import { SetCommand } from '../commands/SetCommand.js';
import { UngroupCommand } from '../commands/UngroupCommand.js';
import { ZOrderCommand } from '../commands/ZOrderCommand.js';
import { SvgParser } from '../io/SvgParser.js';
import { SvgSerializer } from '../io/SvgSerializer.js';
import { SvgDocument } from '../model/SvgDocument.js';
import { Tokenizer } from './Tokenizer.js';

export class Editor {
  document = new SvgDocument();
  private ready = false;
  private filePath?: string;
  private readonly history = new History();
  private readonly tokenizer = new Tokenizer();
  private readonly serializer = new SvgSerializer();
  private readonly parser = new SvgParser();

  replaceDocument(document: SvgDocument): void { this.document = document; }

  dispatch(line: string): string {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return '';
    try {
      const args = this.tokenizer.tokenize(trimmed);
      const name = args.shift();
      if (!name) return '';
      if (name === 'help') return this.help();
      if (name === 'init') return this.init(args);
      if (name === 'read') return this.read(args);
      if (name === 'save') return this.save(args);
      if (!this.ready) throw new Error("no document. use 'init' or 'read' first");
      if (name === 'canvas') return this.canvas(args);
      if (name === 'tree') return this.tree(args);
      if (name === 'show') return this.show(args);
      if (name === 'undo') return this.history.undo(this);
      if (name === 'redo') return this.history.redo(this);
      const command = this.command(name, args);
      return this.history.execute(command, this);
    } catch (error) {
      return `error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  private command(name: string, args: string[]): Command {
    switch (name) {
      case 'create': return new CreateCommand(args);
      case 'delete': if (args.length !== 1) throw new Error('usage: delete <id>'); return new DeleteCommand(args[0]);
      case 'move': if (args.length !== 3) throw new Error('usage: move <id> <dx> <dy>'); return new MoveCommand(args[0], args[1], args[2]);
      case 'scale': if (args.length !== 2) throw new Error('usage: scale <id> <factor>'); return new ScaleCommand(args[0], args[1]);
      case 'set': if (args.length < 3) throw new Error('usage: set <id> <attr> <value>'); return new SetCommand(args[0], args[1], args.slice(2).join(' '));
      case 'group': return new GroupCommand(args[0], args.slice(1));
      case 'ungroup': if (args.length !== 1) throw new Error('usage: ungroup <gid>'); return new UngroupCommand(args[0]);
      case 'addto': if (args.length !== 2) throw new Error('usage: addto <gid> <id>'); return new AddToCommand(args[0], args[1]);
      case 'front': if (args.length !== 1) throw new Error('usage: front <id>'); return new ZOrderCommand(args[0], true);
      case 'back': if (args.length !== 1) throw new Error('usage: back <id>'); return new ZOrderCommand(args[0], false);
      default: throw new Error(`unknown command: ${name}`);
    }
  }

  private init(args: string[]): string {
    if (args.length !== 0 && args.length !== 2) throw new Error('usage: init [w] [h]');
    const width = args.length ? Number(args[0]) : 800;
    const height = args.length ? Number(args[1]) : 600;
    this.document = new SvgDocument(width, height);
    this.ready = true;
    this.filePath = undefined;
    this.history.disable();
    return `canvas ${width}x${height} created`;
  }

  private read(args: string[]): string {
    if (args.length !== 1) throw new Error('usage: read <file.svg>');
    let source: string;
    try { source = readFileSync(args[0], 'utf8'); } catch { throw new Error(`cannot read file: ${args[0]}`); }
    let parsed;
    try { parsed = this.parser.parse(source); } catch { throw new Error(`cannot read file: ${args[0]}`); }
    this.document = parsed.document;
    this.ready = true;
    this.filePath = args[0];
    this.history.disable();
    return [...parsed.warnings, `read ${args[0]} (${parsed.document.count} elements)`].join('\n');
  }

  private save(args: string[]): string {
    if (!this.ready) throw new Error("no document. use 'init' or 'read' first");
    if (args.length > 1) throw new Error('usage: save [file.svg]');
    const path = args[0] || this.filePath;
    if (!path) throw new Error('no output path');
    try { writeFileSync(path, this.serializer.serialize(this.document), 'utf8'); } catch { throw new Error(`cannot write file: ${path}`); }
    this.filePath = path;
    this.history.disable();
    return `saved to ${path} (${this.document.count} elements)`;
  }

  private canvas(args: string[]): string {
    if (args.length === 0) return `canvas ${this.document?.width}x${this.document?.height}`;
    if (args.length !== 2) throw new Error('usage: canvas [w] [h]');
    const width = Number(args[0]), height = Number(args[1]);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) throw new Error('canvas dimensions must be positive');
    this.document.setCanvas(width, height); this.history.disable();
    return `canvas ${width}x${height}`;
  }

  private tree(args: string[]): string { if (args.length > 1) throw new Error('usage: tree [id]'); return this.document.tree(args[0]); }
  private show(args: string[]): string { if (args.length !== 1) throw new Error('usage: show <id>'); return this.document.find(args[0]).details(); }

  private help(): string {
    return ['init [w] [h]', 'read <file.svg>', 'save [file.svg]', 'canvas [w] [h]', 'create <type> <id> [params...] [in <gid>]', 'delete <id>', 'move <id> <dx> <dy>', 'scale <id> <factor>', 'set <id> <attr> <value>', 'group <newGid> <id1> <id2>...', 'ungroup <gid>', 'addto <gid> <id>', 'front/back <id>', 'tree [id]', 'show <id>', 'undo', 'redo', 'help'].join('\n');
  }
}
