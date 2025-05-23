import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node', // or 'jsdom' if you need browser APIs
    globals: true, // to use describe, it, expect globally
    setupFiles: ['./src/mocks/vitest-setup.ts'], // Optional: if you need global setup for tests (e.g. MSW server setup)
  },
  resolve: {
    alias: {
      'agents/mcp': path.resolve(__dirname, './src/mocks/agents-mcp.ts'),
      // Add any other Cloudflare-specific or special path aliases here if they cause issues
    },
  },
});
