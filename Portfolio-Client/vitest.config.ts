import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['zone.js', 'zone.js/testing', './src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
  },
});
