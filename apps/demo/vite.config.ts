import { defineConfig } from 'vite';
import { workspaceAliases } from '../../alias.config';

export default defineConfig({
  server: {
    hmr: {
      // Disable the Vite error overlay during E2E runs so it doesn't block clicks
      overlay: process.env.E2E !== '1',
    },
  },
  resolve: {
    alias: workspaceAliases as any,
  },
});
