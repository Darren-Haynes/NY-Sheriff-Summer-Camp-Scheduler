import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importX from 'eslint-plugin-import-x';

export default defineConfig([
  {
    ignores: ['dist', 'node_modules', '*.d.ts'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'import-x': importX,
    },
    rules: {
      'import-x/no-unresolved': 'error',
    },
  },
]);
