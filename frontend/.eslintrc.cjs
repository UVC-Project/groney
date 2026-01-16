module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    extraFileExtensions: ['.svelte'],
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
  rules: {
    // Code Quality Rules (Requirement 2.2 - Team Standards)
    'complexity': ['warn', { max: 15 }], // Cyclomatic complexity threshold
    'max-depth': ['warn', { max: 5 }], // Maximum nesting depth
    'max-lines-per-function': ['warn', { max: 150, skipBlankLines: true, skipComments: true }],
    'max-params': ['warn', { max: 5 }], // Maximum function parameters
    'no-duplicate-imports': 'warn',
    'no-unused-expressions': 'warn',
    'no-var': 'error',
    'eqeqeq': ['warn', 'always'], // Require === and !==
    'no-empty': 'warn',
    'no-useless-escape': 'warn',
    'no-mixed-spaces-and-tabs': 'warn',
    
    // TypeScript specific
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
  },
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
      extends: ['plugin:svelte/recommended'],
      rules: {
        // Svelte 5 uses $props() which requires let declarations
        'prefer-const': 'off',
        // Svelte components may have unused vars for props/exports
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^(\\$|_)' }],
        // Accessibility rules as warnings (to be fixed incrementally)
        'svelte/no-unused-svelte-ignore': 'warn',
        // A11y rules from svelte plugin - warn instead of error for existing code
        'svelte/valid-compile': ['error', { ignoreWarnings: true }],
        // Disable strict a11y rules that need incremental fixing
        'svelte/a11y-click-events-have-key-events': 'off',
        'svelte/a11y-no-noninteractive-element-interactions': 'off',
        'svelte/a11y-no-noninteractive-tabindex': 'off',
        'svelte/a11y-label-has-associated-control': 'off',
        'svelte/a11y-interactive-supports-focus': 'off',
        'svelte/a11y-no-static-element-interactions': 'off',
        'svelte/a11y-role-has-required-aria-props': 'off',
      },
    },
    {
      // Relaxed rules for test files
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        'max-lines-per-function': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
  ignorePatterns: ['*.cjs', '.svelte-kit/**', 'build/**', 'node_modules/**', 'coverage/**'],
};
