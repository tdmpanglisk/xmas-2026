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
