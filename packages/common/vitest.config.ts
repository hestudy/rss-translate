import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => ({
  // Configure Vitest (https://vitest.dev/config/)
  test: {
    env: loadEnv(mode, process.cwd(), ''),
    testTimeout: 1000 * 60 * 5,
  },
}));
