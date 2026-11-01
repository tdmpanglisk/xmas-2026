import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    commonjsOptions: {
      exclude: ['canvg']
    },
    rollupOptions: {
      external: ['canvg'],
      output: {
        globals: {
          canvg: 'canvg'
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['canvg']
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: "xmas-2026",  // Add this line
})
