import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';

export default defineConfig({
  base: './',
  plugins: [stylex.vite(), react()],
  // Matches package.json browserslist; keeps light-dark() native instead of a media-query polyfill.
  build: { cssTarget: ['chrome123', 'edge123', 'firefox120', 'safari17.5'] },
});
