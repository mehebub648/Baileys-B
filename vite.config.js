import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      fs: path.resolve(__dirname, 'fs-browser/index.js'),
      'fs/promises': path.resolve(__dirname, 'fs-browser/index.js')
    }
  },
  optimizeDeps: { 
    exclude: ['fs', 'fs/promises'] 
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      external: [
        // Node.js built-ins that should not be bundled
        'child_process',
        'os',
        'path',
        'crypto',
        'stream',
        'url',
        'events',
        'readline',
        'util'
      ]
    }
  }
});
