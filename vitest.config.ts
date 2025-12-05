import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: ['node_modules/**', 'dist/**', 'docs/**', 'tests/**', 'coverage/**', 'src/app.ts', 'src/server.ts', 'src/config/**', 'src/middleware/**', 'src/utils/**', 'src/models/dtos/**', 'src/db/**', 'src/**/cognito*', 'src/**/auth*', 'drizzle*'],
      reportsDirectory: './coverage',
    },
    testTimeout: 10000,
  },
});
