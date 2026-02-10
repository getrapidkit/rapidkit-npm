import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'src/__tests__/**',
        'src/index.ts',
        'src/workspace.ts',
        'src/doctor.ts', // New feature, tests in progress
        'src/commands/**', // CLI command handlers (interactive, hard to unit test)
        'src/ai/embeddings-manager.ts', // Interactive embeddings generation (file I/O and prompts)
      ],
    },
  },
});
