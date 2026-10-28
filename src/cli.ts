import { createInterface } from 'node:readline';
import { Editor } from './core/Editor.js';

const editor = new Editor();
console.log("svg-editor 0.1 — type 'help' for commands");
const input = createInterface({ input: process.stdin, output: process.stdout, prompt: 'svg> ' });
input.prompt();
input.on('line', line => {
  const output = editor.dispatch(line);
  if (output) console.log(output);
  input.prompt();
});
