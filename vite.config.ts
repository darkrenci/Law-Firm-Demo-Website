import { readFileSync, existsSync } from 'node:fs';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), {
      name: 'business-structured-data',
      transformIndexHtml() {
        const file = path.resolve(process.cwd(), 'public/business-schema.json');
        return existsSync(file) ? [{ tag: 'script', attrs: { type: 'application/ld+json', id: 'business-schema' }, children: readFileSync(file, 'utf8').replace(/</g, '\\u003c'), injectTo: 'head' as const }] : [];
      },
    }],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
