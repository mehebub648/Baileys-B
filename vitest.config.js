import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['fs-browser/__tests__/**/*.test.js'],
  },
});
