/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { lingui } from '@lingui/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({
      plugins: ['@lingui/babel-plugin-lingui-macro'],
    }),
    lingui(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:6502',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
