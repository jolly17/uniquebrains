import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Root path for custom domain
  build: {
    outDir: 'docs' // Deploy from docs folder instead of dist
  },
  server: {
    port: 3000
  }
})
