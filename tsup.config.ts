import { defineConfig } from 'tsup';
import { copyFileSync } from 'fs';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',

  // Output settings
  outDir: 'dist',
  clean: true,

  // Minification and optimization
  minify: true,
  treeshake: {
    preset: 'smallest', // Aggressive tree shaking
    moduleSideEffects: false, // Assume no side effects
  },

  // Source maps only in development
  sourcemap: false,

  // Bundle settings
  splitting: true, // Enable code splitting for better caching
  bundle: true,

  // Keep shebang for CLI
  shims: true,

  // External dependencies (don't bundle them)
  // Heavy dependencies should stay external
  external: [
    'chalk',
    'commander',
    'execa',
    'fs-extra',
    'inquirer',
    'nunjucks',
    'openai',
    'ora',
    'cli-progress',
    'validate-npm-package-name',
  ],

  // TypeScript declaration files
  dts: true,

  // Skip node_modules
  skipNodeModulesBundle: true,

  // Copy package.json to dist for version reading
  onSuccess: async () => {
    copyFileSync('package.json', 'dist/package.json');
    console.log('✓ Copied package.json to dist/');
  },
});
