import { defineConfig } from 'vitest/config';
import { workspaceAliases } from './alias.config';

export default defineConfig({
  resolve: {
    alias: workspaceAliases as any,
  },
  test: {
    include: ['tests/**/*.spec.ts'],
    environment: 'jsdom',
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        // Goal: 80% (Audit recommendation)
        // Current: ~66%
        statements: 60,
        branches: 50,
        functions: 60,
        lines: 60,
      },
    },
  },
});
