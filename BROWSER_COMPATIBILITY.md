# Browser Compatibility Guide

This project has been configured to work in browser environments using Vite and a custom `fs-browser` module.

## Overview

The main challenge for running Baileys in the browser is the Node.js `fs` (filesystem) module. We've created a browser-compatible shim called `fs-browser` that uses the File System Access API to prompt users for file access.

## Components

### 1. fs-browser Module

Located in `fs-browser/`, this module provides:
- `readFile()` / `writeFile()` - Callback-based API
- `promises.readFile()` / `promises.writeFile()` - Promise-based API
- File picker dialogs for reading/writing files
- Fallback support for browsers without File System Access API

### 2. Vite Configuration

The `vite.config.js` file:
- Aliases `fs` and `fs/promises` to the `fs-browser` module
- Configures build settings for browser targeting
- Excludes Node.js built-in modules from bundling

### 3. Browser Example

The `index.html` file provides a basic UI for:
- Connecting to WhatsApp
- Sending messages
- Viewing activity logs

## Usage

### Development Mode

Run the development server:

```bash
npm run dev
```

This starts Vite's dev server at http://localhost:5173/

### Build for Production

Build the browser bundle:

```bash
npm run build:browser
```

The output will be in the `dist/` directory.

### Preview Production Build

After building, preview the production bundle:

```bash
npm run preview
```

## Testing

Run the fs-browser module tests:

```bash
npm run test:browser
```

These tests use Vitest with jsdom environment to verify the fs-browser module works correctly.

## How It Works

### File Operations

When your code calls `fs.promises.readFile()` or `fs.promises.writeFile()`:

1. **In Node.js**: Standard filesystem operations work as usual
2. **In Browser**: Users are prompted to select a file (read) or save location (write)

### Supported APIs

The fs-browser module supports:
- ✅ `readFile()` - with callback
- ✅ `writeFile()` - with callback
- ✅ `promises.readFile()` - returns Promise
- ✅ `promises.writeFile()` - returns Promise
- ❌ `createReadStream()` - throws "not supported" error
- ❌ `createWriteStream()` - throws "not supported" error
- ❌ `readdir()`, `mkdir()`, `stat()` - throw "not supported" errors

### Browser Compatibility

The File System Access API is supported in:
- Chrome/Edge 86+
- Opera 72+

For older browsers, the module falls back to:
- `<input type="file">` for reading files
- Automatic downloads for writing files

## Limitations

1. **Streaming**: The fs-browser module doesn't support streams. Operations that use `createReadStream()` or `createWriteStream()` will fail.

2. **File System Operations**: Operations like `readdir()`, `mkdir()`, and `stat()` are not supported in the browser.

3. **User Interaction**: All file operations require user interaction (clicking buttons, selecting files). This is a browser security requirement.

4. **Node.js Built-ins**: Some Node.js built-in modules may not work in the browser. Check the Vite configuration for externalized modules.

## Future Enhancements

Potential improvements:
- OPFS (Origin Private File System) support for `mkdir`/`readdir` operations
- IndexedDB integration for persistent storage
- Better stream polyfills
- Progressive Web App (PWA) capabilities

## Troubleshooting

### "fs is not supported"

Make sure you're running through Vite (`npm run dev` or `npm run build:browser`), not directly with Node.js.

### File picker doesn't appear

Check browser console for errors. Ensure the File System Access API is available or that fallbacks are working.

### Build errors

Check that all dependencies are installed:

```bash
npm install
```

## Contributing

When adding features that use filesystem operations:
1. Test in both Node.js and browser environments
2. Use `fs.promises` API (not callbacks) for better compatibility
3. Handle "not supported" errors gracefully
4. Update tests in `fs-browser/__tests__/`
