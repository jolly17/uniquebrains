import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/uniquebrains/', // Change this to match your repo name
  server: {
    port: 3000
  }
})
