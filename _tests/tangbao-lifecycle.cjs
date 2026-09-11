// Run with: node --test _tests/tangbao-lifecycle.cjs
// The underscore directory keeps this development-only test out of Jekyll output.
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const rootPath = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(rootPath, 'assets/js/zy-and-i.js'), 'utf8');
const tangbaoSource = source.slice(source.indexOf('  function setupTangbao()'), source.indexOf('  function setupSweetNotes()'));

function fixture({ hidden = false, reducedMotion = false, width = 390 } = {}) {
  let now = 0, nextId = 0, seed = 42;
  const frames = new Map(), timers = new Map(), decoders = [], listeners = {};
  function element() {
    const classes = new Set();
    return {
      classList: {
        add(...names) { names.forEach(name => classes.add(name)); },
        remove(...names) { names.forEach(name => classes.delete(name)); },
        contains(name) { return classes.has(name); },
        toggle(name, active) { if (active) classes.add(name); else classes.delete(name); }
      },
      dataset: {}, style: {}, offsetWidth: 90, offsetHeight: 90, textContent: '',
      setAttribute() {}, addEventListener(name, callback) { this[name] = callback; },
      replaceChildren(child) { this.child = child; },
      getContext() { return { clearRect() {}, drawImage() {} }; }
    };
  }
  class Image {
    constructor() {
      Object.assign(this, element());
      this.src = 'http://localhost/images/zy-and-i/tangbao-frames/frame-22.webp';
      this.complete = true;
      this.naturalWidth = 256;
    }
    decode() { return new Promise(resolve => decoders.push(resolve)); }
  }
  const root = element(), bubble = element(), visual = element(), sprite = element(), initial = new Image();
  root.querySelector = selector => ({
    '.tangbao-witness__bubble': bubble, '.tangbao-witness__visual': visual,
    '.tangbao-witness__sprite': sprite, '.tangbao-witness__frame': initial
  })[selector];
  const document = {
    hidden, getElementById: () => root, createElement: element,
    addEventListener(name, callback) { listeners[name] = callback; }
  };
  const window = {
    innerWidth: width, innerHeight: 844, performance: { now: () => now },
    setTimeout(callback, delay) { timers.set(++nextId, { callback, due: now + Math.max(1, delay) }); return nextId; },
    clearTimeout(id) { timers.delete(id); },
    requestAnimationFrame(callback) { frames.set(++nextId, callback); return nextId; },
    cancelAnimationFrame(id) { frames.delete(id); }
  };
  const math = Object.create(Math);
  math.random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 2 ** 32; };
  vm.runInNewContext(tangbaoSource + '\nsetupTangbao();', {
    document, window, Image, reducedMotion, Math: math,
    Date: class extends Date { static now() { return 1800000000000 + now; } }
  });
  function advance(milliseconds) {
    const end = now + milliseconds;
    while (now < end) {
      const next = Math.min(end, now + 16);
      while (true) {
        const pending = [...timers.entries()].filter(([, timer]) => timer.due <= next).sort((a, b) => a[1].due - b[1].due)[0];
        if (!pending) break;
        now = pending[1].due;
        timers.delete(pending[0]);
        pending[1].callback();
      }
      now = next;
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach(callback => callback(now));
    }
  }
  return {
    root, bubble, visual, frames, timers, window, advance,
    hide() { document.hidden = true; listeners.visibilitychange(); },
    show() { document.hidden = false; listeners.visibilitychange(); },
    async ready() { decoders.forEach(resolve => resolve()); for (let i = 0; i < 6; i++) await Promise.resolve(); },
    until(action) {
      for (let i = 0; i < 120000; i += 16) {
        if (root.dataset.action === action) return;
        advance(16);
      }
      assert.fail('Action not reached: ' + action);
    },
    state() { return JSON.stringify([root.dataset, visual.child?.dataset, root.style, bubble.textContent, root.classList.contains('is-speaking'), root.classList.contains('is-facing-left')]); }
  };
}

test('switching tabs before decode never starts duplicate animation loops', async () => {
  const f = fixture();
  f.hide(); f.show();
  assert.equal(f.frames.size, 0);
  await f.ready();
  for (let i = 0; i < 5; i++) {
    assert.equal(f.frames.size, 1);
    f.hide();
    assert.equal(f.frames.size, 0);
    assert.equal(f.timers.size, 0);
    f.advance(10000); f.show(); f.advance(16);
  }
  assert.equal(f.frames.size, 1);
});

test('decode finishing in the background waits until the page is visible', async () => {
  const f = fixture({ hidden: true });
  await f.ready();
  f.advance(10000);
  assert.equal(f.frames.size, 0);
  assert.equal(f.timers.size, 0);
  assert.equal(f.root.dataset.action, undefined);
  f.show();
  assert.equal(f.frames.size, 1);
  assert.equal(f.root.dataset.scene, 'stroll');
  assert.ok(['turn', 'trot'].includes(f.root.dataset.action));
});

test('hidden time preserves action, frame, position and remaining speech time', async () => {
  const control = fixture(), paused = fixture();
  await control.ready(); await paused.ready();
  control.root.click(); paused.root.click();
  control.advance(1150); paused.advance(1150);
  assert.equal(paused.root.classList.contains('is-speaking'), true);
  const state = paused.state();
  paused.hide(); paused.advance(60000);
  assert.equal(paused.state(), state);
  assert.equal(paused.timers.size, 0);
  paused.show();
  // After resuming, both instances follow the same visible-time trajectory.
  for (let i = 0; i < 700; i++) {
    control.advance(16); paused.advance(16);
    assert.equal(paused.state(), control.state());
  }
});

test('a pending click pose and turn flip resume with their original delays', async () => {
  for (const phase of ['click', 'turn']) {
    const control = fixture(), paused = fixture();
    await control.ready(); await paused.ready();
    if (phase === 'click') {
      control.until('trot'); paused.until('trot');
      control.root.click(); paused.root.click();
    }
    else { control.until('turn'); paused.until('turn'); }
    control.advance(100); paused.advance(100);
    paused.hide(); paused.advance(30000); paused.show();
    for (let i = 0; i < 200; i++) {
      control.advance(16); paused.advance(16);
      assert.equal(paused.state(), control.state());
    }
  }
});

test('early and repeated clicks keep one movement loop and reach celebration', async () => {
  const f = fixture();
  f.root.click(); f.advance(100);
  assert.equal(f.frames.size, 0);
  await f.ready();
  for (let i = 0; i < 10; i++) { f.root.click(); f.advance(100); }
  f.until('celebrate');
  const displayed = new Set();
  while (f.root.dataset.action === 'celebrate') {
    displayed.add(f.visual.child.dataset.frame);
    f.advance(16);
    assert.equal(f.frames.size, 1);
  }
  assert.deepEqual([...displayed].sort(), ['22', '30', '31']);
  for (const frame of displayed) assert.ok(fs.existsSync(path.join(rootPath, `images/zy-and-i/tangbao-frames/frame-${frame}.webp`)));
});

test('reduced motion stays still while speech also pauses in the background', () => {
  const f = fixture({ reducedMotion: true });
  f.root.click(); f.advance(1000); f.hide(); f.advance(60000);
  assert.equal(f.root.classList.contains('is-speaking'), true);
  assert.equal(f.frames.size, 0);
  assert.equal(f.timers.size, 0);
  f.show(); f.advance(8000);
  assert.equal(f.root.classList.contains('is-speaking'), false);
  assert.equal(f.frames.size, 0);
});

test('desktop and mobile scenes stay within bounds with one loop', async () => {
  const actions = new Set();
  for (const width of [390, 1280]) {
    const f = fixture({ width }); await f.ready();
    for (let i = 0; i < 37500; i++) {
      f.advance(16);
      actions.add(f.root.dataset.action);
      assert.equal(f.frames.size, 1);
      const [, x, y] = f.root.style.transform.match(/translate3d\(([-.\d]+)px,([-.\d]+)px/);
      assert.ok(+x >= 8 && +x <= width - 98 && +y >= 8 && +y <= 746);
    }
  }
  assert.equal(actions.size, 17, 'exercise every action, including leap and boundary turn');
});
