// fs-browser/__tests__/fs-browser.test.js  (Vitest)
import { describe, it, expect, vi } from 'vitest';
import fsBrowserFactory from '../index.js';

function makeAdapter(initialText = 'hello', capture = {}) {
  const blob = new Blob([initialText], { type: 'text/plain' });
  const file = {
    name: 'test.txt',
    type: 'text/plain',
    size: blob.size,
    text: async () => initialText,
    arrayBuffer: async () => {
      const encoder = new TextEncoder();
      return encoder.encode(initialText).buffer;
    }
  };
  capture.writes = [];
  return {
    pickOpen: vi.fn(async () => file),
    pickSave: vi.fn(async (suggestedName) => {
      capture.suggestedName = suggestedName;
      return {
        createWritable: async () => ({
          write: async (data) => { capture.writes.push(data); },
          close: async () => {}
        })
      };
    })
  };
}

describe('fs-browser basic', () => {
  it('promises.readFile utf8', async () => {
    const cap = {};
    const fs = fsBrowserFactory._create({ adapter: makeAdapter('abc', cap) });
    const text = await fs.promises.readFile('ignored.txt', 'utf8');
    expect(text).toBe('abc');
    expect(cap.writes.length).toBe(0);
  });

  it('promises.readFile binary', async () => {
    const fs = fsBrowserFactory._create({ adapter: makeAdapter('\u0000\u0001') });
    const bin = await fs.promises.readFile('x.bin');
    expect(bin).toBeInstanceOf(Uint8Array);
    expect(bin.length).toBeGreaterThan(0);
  });

  it('promises.writeFile string + suggestedName', async () => {
    const cap = {};
    const fs = fsBrowserFactory._create({ adapter: makeAdapter('', cap) });
    await fs.promises.writeFile('out.txt', 'content', { suggestedName: 'out.txt' });
    expect(cap.suggestedName).toBe('out.txt');
  });

  it('writeFile callback Uint8Array', async () => {
    const cap = {};
    const fs = fsBrowserFactory._create({ adapter: makeAdapter('', cap) });
    const buf = new Uint8Array([1, 2, 3]);
    await new Promise((resolve, reject) =>
      fs.writeFile('out.bin', buf, (e) => e ? reject(e) : resolve())
    );
    expect(cap.writes.length).toBe(1);
  });

  it('readFile callback style', async () => {
    const fs = fsBrowserFactory._create({ adapter: makeAdapter('xyz') });
    const out = await new Promise((resolve, reject) =>
      fs.readFile('any', 'utf8', (e, data) => e ? reject(e) : resolve(data))
    );
    expect(out).toBe('xyz');
  });

  it('propagates errors', async () => {
    const bad = { pickOpen: async () => { throw new Error('boom'); }, pickSave: async () => { throw new Error('boom'); } };
    const fs = fsBrowserFactory._create({ adapter: bad });
    await expect(fs.promises.readFile('x', 'utf8')).rejects.toThrow('boom');
    await expect(fs.promises.writeFile('x', 'y')).rejects.toThrow('boom');
  });
});
