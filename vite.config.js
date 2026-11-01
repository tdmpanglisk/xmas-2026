import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isVercel = !!env.VERCEL
  const isLocalhost = command === 'serve'

  // Local dev and Vercel need root routing; GitHub Pages production needs the subfolder prefix
  const baseFolder = (isVercel || isLocalhost) ? '/' : '/xmas-2026/'

  return {
    plugins: [react()],
    base: baseFolder,  
    build: {
      // Vercel expects 'dist', GitHub Pages uses 'docs'
      outDir: isVercel ? 'dist' : 'docs',     
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
  }
})
