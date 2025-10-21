// fs-browser/index.js  (CommonJS)
// Minimal, testable fs shim (readFile/writeFile + promises). Browser only.
function normalizeOptions(encodingOrOpts) {
  if (!encodingOrOpts) return {};
  if (typeof encodingOrOpts === 'string') return { encoding: encodingOrOpts };
  return encodingOrOpts;
}

function ensureUint8(data) {
  if (data instanceof Uint8Array) return data;
  if (typeof data === 'string') return new TextEncoder().encode(data);
  if (data instanceof Blob) return data;
  throw new TypeError('writeFile data must be string | Uint8Array | Blob');
}

function defaultAdapter() {
  if (typeof window === 'undefined') throw new Error('fs-browser: window is undefined');
  const pickOpen = async () => {
    if (window.showOpenFilePicker) {
      const [handle] = await window.showOpenFilePicker();
      return await handle.getFile();
    }
    const input = Object.assign(document.createElement('input'), { type: 'file' });
    const p = new Promise((resolve, reject) => {
      input.onchange = () => (input.files && input.files[0]) ? resolve(input.files[0]) : reject(new Error('No file selected'));
    });
    input.click();
    return p;
  };
  const pickSave = async (suggestedName) => {
    if (window.showSaveFilePicker) {
      return await window.showSaveFilePicker({ suggestedName });
    }
    // Fallback: emulate a handle that downloads
    return {
      async createWritable() {
        let url;
        return {
          async write(data) {
            const blob = data instanceof Blob ? data : new Blob([ensureUint8(data)]);
            url = URL.createObjectURL(blob);
            const a = Object.assign(document.createElement('a'), { href: url, download: suggestedName || 'download' });
            document.body.appendChild(a); a.click(); a.remove();
          },
          async close() { if (url) URL.revokeObjectURL(url); }
        };
      }
    };
  };
  return { pickOpen, pickSave };
}

function createFsBrowser(opts = {}) {
  const adapter = opts.adapter || defaultAdapter();

  async function readFileInternal(_path, options) {
    const opt = normalizeOptions(options);
    const file = await adapter.pickOpen();
    if (opt.encoding) return await file.text();
    return new Uint8Array(await file.arrayBuffer());
  }

  async function writeFileInternal(_path, data, options) {
    const opt = normalizeOptions(options);
    const handle = await adapter.pickSave(opt.suggestedName);
    const writable = await handle.createWritable();
    if (typeof data === 'string') {
      await writable.write(new Blob([data], { type: 'text/plain' }));
    } else if (data instanceof Blob) {
      await writable.write(data);
    } else {
      await writable.write(new Blob([ensureUint8(data)]));
    }
    await writable.close();
  }

  function readFile(path, options, callback) {
    if (typeof options === 'function') { callback = options; options = undefined; }
    (async () => {
      try { const out = await readFileInternal(path, options); callback && callback(null, out); }
      catch (err) { callback && callback(err); }
    })();
  }

  function writeFile(path, data, options, callback) {
    if (typeof options === 'function') { callback = options; options = undefined; }
    (async () => {
      try { await writeFileInternal(path, data, options); callback && callback(null); }
      catch (err) { callback && callback(err); }
    })();
  }

  const promises = {
    readFile: (path, options) => readFileInternal(path, options),
    writeFile: (path, data, options) => writeFileInternal(path, data, options)
  };

  const notSupported = (name) => () => { const e = new Error(`${name} is not supported in fs-browser`); e.code = 'ENOTSUP'; throw e; };

  return {
    readFile, writeFile, promises,
    readdir: notSupported('readdir'),
    mkdir: notSupported('mkdir'),
    stat: notSupported('stat'),
    existsSync: () => false,
    createReadStream: notSupported('createReadStream'),
    createWriteStream: notSupported('createWriteStream'),
    _create: createFsBrowser // for tests/advanced usage
  };
}

module.exports = createFsBrowser();
module.exports._create = createFsBrowser;
