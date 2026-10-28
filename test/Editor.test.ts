import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { Editor } from '../src/core/Editor.js';

test('nested shapes move and scale as one composite; undo restores the whole tree', () => {
  const editor = new Editor();
  assert.equal(editor.dispatch('init 400 200'), 'canvas 400x200 created');
  assert.equal(editor.dispatch('create g flow'), 'g#flow created');
  assert.equal(editor.dispatch('create rect r 10 20 30 40 red in flow'), 'rect#r created in g#flow');
  assert.equal(editor.dispatch('create circle c 5 6 7 blue in flow'), 'circle#c created in g#flow');
  editor.dispatch('move flow 2 3');
  assert.match(editor.dispatch('tree'), /rect#r  x=12 y=23 w=30 h=40 fill=red/);
  editor.dispatch('scale flow 2');
  assert.match(editor.dispatch('tree'), /circle#c  cx=14 cy=18 r=14 fill=blue/);
  editor.dispatch('undo');
  assert.match(editor.dispatch('tree'), /circle#c  cx=7 cy=9 r=7 fill=blue/);
  editor.dispatch('undo');
  assert.match(editor.dispatch('tree'), /rect#r  x=10 y=20 w=30 h=40 fill=red/);
  editor.dispatch('redo');
  assert.match(editor.dispatch('tree'), /rect#r  x=12 y=23 w=30 h=40 fill=red/);
  editor.dispatch('create g next');
  assert.equal(editor.dispatch('redo'), 'error: nothing to redo');
});

test('failed edits leave the document and history unchanged', () => {
  const editor = new Editor();
  editor.dispatch('init');
  editor.dispatch('create g a');
  editor.dispatch('create g b in a');
  editor.dispatch('create rect r 0 0 10 10 in b');
  const before = editor.dispatch('tree');
  assert.equal(editor.dispatch('addto b a'), 'error: cannot group a container into its own descendant: b');
  assert.equal(editor.dispatch('set r bogus x'), 'error: unknown attribute: bogus');
  assert.equal(editor.dispatch('create rect r 1 2 3 4'), 'error: id already exists: r');
  assert.equal(editor.dispatch('scale r 0'), 'error: scale factor must be positive');
  assert.equal(editor.dispatch('tree'), before);
  editor.dispatch('undo');
  assert.doesNotMatch(editor.dispatch('tree'), /rect#r/);
});

test('group, ungroup, and z-order preserve child order', () => {
  const editor = new Editor();
  editor.dispatch('init');
  editor.dispatch('create g outer');
  editor.dispatch('create rect a 0 0 1 1 in outer');
  editor.dispatch('create rect b 0 0 1 1 in outer');
  editor.dispatch('create rect c 0 0 1 1 in outer');
  assert.equal(editor.dispatch('group pair a b'), 'g#pair created with 2 children');
  assert.match(editor.dispatch('tree'), /g#pair[\s\S]*rect#a[\s\S]*rect#b[\s\S]*rect#c/);
  assert.equal(editor.dispatch('ungroup pair'), 'g#pair ungrouped');
  assert.doesNotMatch(editor.dispatch('tree'), /g#pair/);
  editor.dispatch('front a');
  assert.match(editor.dispatch('tree'), /rect#b[\s\S]*rect#c[\s\S]*rect#a/);
  editor.dispatch('back a');
  assert.match(editor.dispatch('tree'), /rect#a[\s\S]*rect#b[\s\S]*rect#c/);
});

test('SVG round trip assigns missing ids and IO resets history', () => {
  const dir = mkdtempSync(join(tmpdir(), 'svg-cli-'));
  try {
    const input = join(dir, 'input.svg');
    const output = join(dir, 'output.svg');
    writeFileSync(input, '<svg width="400" height="200"><g id="scene"><rect x="1" y="2" width="3" height="4"/><text id="title" x="5" y="6">A &amp; B</text></g></svg>');
    const editor = new Editor();
    assert.match(editor.dispatch(`read ${input}`), /warning: assigned id rect1 to unnamed <rect>/);
    assert.match(editor.dispatch('tree'), /rect#rect1/);
    editor.dispatch('set title text "Hello world"');
    assert.equal(editor.dispatch(`save ${output}`), `saved to ${output} (3 elements)`);
    assert.equal(editor.dispatch('undo'), 'error: undo not allowed after io command');
    assert.match(readFileSync(output, 'utf8'), /<text id="title" x="5" y="6">Hello world<\/text>/);
    assert.match(editor.dispatch(`read ${output}`), /read .* \(3 elements\)/);
    assert.match(editor.dispatch('tree'), /Hello world/);
    const before = editor.dispatch('tree');
    writeFileSync(input, '<svg><rect></svg>');
    assert.equal(editor.dispatch(`read ${input}`), `error: cannot read file: ${input}`);
    assert.equal(editor.dispatch('tree'), before);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
