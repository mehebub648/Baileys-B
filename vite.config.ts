import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig({
  plugins: [
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports
      protocolImports: true,
      // Whether to polyfill specific globals
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Don't polyfill fs as we're using MongoDB instead
      exclude: ['fs'],
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['mongoose'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: false,
  },
  optimizeDeps: {
    exclude: ['libsignal', 'sharp', 'jimp'],
    include: ['mongoose', '@hapi/boom', 'async-mutex'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  resolve: {
    alias: {
      // Use browser-compatible exports
      '@baileys': path.resolve(__dirname, 'src/browser.ts'),
      // Polyfills for Node.js modules
      buffer: 'buffer',
      process: 'process/browser',
      util: 'util',
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      // Mock fs with empty module for browser
      fs: path.resolve(__dirname, 'src/mocks/fs.ts'),
      'fs/promises': path.resolve(__dirname, 'src/mocks/fs.ts'),
      child_process: path.resolve(__dirname, 'src/mocks/empty.ts'),
      readline: path.resolve(__dirname, 'src/mocks/empty.ts'),
    },
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
})
