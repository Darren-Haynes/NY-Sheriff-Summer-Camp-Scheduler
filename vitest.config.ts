import { defineConfig } from 'vitest/config';
import { coverageConfigDefaults } from 'vitest/config'; // Import defaults

export default defineConfig({
  resolve: {
    // use Vite built-in tsconfig paths support
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['test/unit/**/*.test.ts', 'test/integration/**/*.test.ts'],
    // The scheduler runs up to 1000 randomized passes per roster, so integration tests
    // legitimately take several seconds (the default 5s timeout is too tight).
    testTimeout: 60_000,
    // The engine logs heavily on every run; printing it slows tests down and buries failures.
    // Re-enable with `npx vitest run --silent=false` when debugging.
    silent: true,
    coverage: {
      provider: 'v8', // use built-in v8 coverage provider (no extra deps)
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage/vitest',
      exclude: [
        ...coverageConfigDefaults.exclude, // Preserves default exclusions (node_modules, etc.)
        'src/main/print-logs.ts',          // Your specific file
       ],
    },
  },
});
