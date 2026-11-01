import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  // Automatically uses root for Vercel deployments, and the subfolder for GitHub Pages
  base: process.env.VERCEL ? "/" : "/xmas-2026/",  
  build: {
    outDir: 'docs',     
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
