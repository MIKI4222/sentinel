import { defineConfig } from 'vitest/config';
// Vitest 2 uses Vite 5 internally. Do not cast the Vite 8 React plugin to any.
// Automatic JSX transform comes from tsconfig.app.json; no React plugin is needed for these tests.
export default defineConfig({ test: { environment: 'jsdom', setupFiles: ['./vitest.setup.ts'], include: ['src/**/*.test.{ts,tsx}'], globals: true, restoreMocks: true } });
