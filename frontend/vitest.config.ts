import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        '.svelte-kit/**',
        'build/**',
        '**/*.d.ts',
        '**/*.config.{js,ts,cjs}',
        '**/+*.{js,ts}', // SvelteKit route files
        '**/*.svelte', // Svelte components (until component testing is set up)
      ],
      // Thresholds can be increased as test coverage improves
      thresholds: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
      },
    },
  },
});
