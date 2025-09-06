import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5200,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        // do not rewrite; backend uses context-path /api
        // rewrite: (path) => path,
      },
    },
  },
})
