import { resolve } from 'node:path';

import { defineConfig } from 'vite';

export default defineConfig({
  base: './',

  build: {
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        game: resolve(import.meta.dirname, 'src/main.ts')
      },

      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'game') {
            return 'assets/game.js';
          }

          return 'assets/[name].js';
        },

        chunkFileNames: 'assets/[name].js',

        assetFileNames: (assetInfo) => {
          if (
            assetInfo.names?.some((name) =>
              name.endsWith('.css')
            )
          ) {
            return 'assets/game.css';
          }

          return 'assets/[name][extname]';
        }
      }
    }
  }
});