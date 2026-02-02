import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'

export default defineConfig({
  plugins: [
    react(),
    // Sentry plugin for source maps upload (only in production builds)
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: './docs/**',
      },
      // Only upload source maps in production builds
      disable: process.env.NODE_ENV !== 'production',
    }),
  ],
  base: '/', // Root path for custom domain
  build: {
    outDir: 'docs', // Deploy from docs folder instead of dist
    sourcemap: true, // Enable source maps for Sentry
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase-vendor': ['@supabase/supabase-js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 5173, // Use Vite's default port for consistency
    strictPort: false // Allow fallback to another port if 5173 is in use
  }
})
