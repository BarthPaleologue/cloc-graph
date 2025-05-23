import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/explicit-function-return-type': ['warn', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      
      // General code quality rules
      'no-console': 'off', // We're building a CLI tool that uses console
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always', {'null': 'ignore'}],
    },
  },
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**']
  }
];