import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // use Vite built-in tsconfig paths support
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8', // use built-in v8 coverage provider (no extra deps)
      reporter: ['text', 'lcov'],
      // Prevents Vitest and Playwright from overwriting each other
      reportsDirectory: './coverage/vitest',
    },
  },
});
