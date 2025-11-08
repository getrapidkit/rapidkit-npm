import { defineConfig } from 'tsup';
import { copyFileSync } from 'fs';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node18',

  // Output settings
  outDir: 'dist',
  clean: true,

  // Minification and optimization
  minify: true,
  treeshake: true,

  // Source maps only in development
  sourcemap: false,

  // Bundle settings
  splitting: false,
  bundle: true,

  // Keep shebang for CLI
  shims: true,

  // External dependencies (don't bundle them)
  external: [
    'chalk',
    'commander',
    'execa',
    'fs-extra',
    'inquirer',
    'nunjucks',
    'ora',
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
