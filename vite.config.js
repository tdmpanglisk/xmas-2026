import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'docs',
    commonjsOptions: {
      exclude: ['canvg']
    },
    rollupOptions: {
      external: ['canvg']
    }
  },
  optimizeDeps: {
    exclude: ['canvg']
  }
})