import vue from '@vitejs/plugin-vue'
import vuejsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'

export default defineConfig({
  plugins: [vue(), vuejsx(), inspect()],
  build: {
    rollupOptions: {
      input: './index.html',
    },
  },
  resolve: {
    alias: [
      {
        find: 'arconify',
        replacement: '../src/main.ts',
      },
    ],
  },
})
