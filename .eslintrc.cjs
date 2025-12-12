module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    // Relax 'any' to warn only in tests
    '@typescript-eslint/no-explicit-any': ['warn', { 
      ignoreRestArgs: true,
      fixToUnknown: false,
    }],
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'no-console': 'off', // CLI needs console
    'prefer-const': 'error',
    'no-var': 'error',
  },
  overrides: [
    {
      // Allow 'any' in test files for mocking
      files: ['**/__tests__/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.js',
    'templates/',
    'test-workspace/',
    'coverage/',
  ],
};
