import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: "/xmas-2026/",  // Keeps asset paths aligned with your repo
  build: {
    outDir: 'docs',     // Tells Vite to output files to 'docs' instead of 'dist'
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
