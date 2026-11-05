import playwright from 'eslint-plugin-playwright';
import babelParser from '@babel/eslint-parser';

/** E2E-only ESLint — enforces Playwright best practices mechanically. */
export default [
  {
    ignores: ['**/node_modules/**', 'playwright-report/**', 'test-results/**']
  },
  {
    files: ['e2e/**/*.{ts,tsx}'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-typescript']
        },
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      playwright
    },
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/no-networkidle': 'error'
    }
  }
];
