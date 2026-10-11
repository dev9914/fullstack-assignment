import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const stagingTarget = 'https://staging.fastor.ai'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Same-origin `/v1` in dev so the browser is not subject to staging CORS.
      // `secure: false` only affects Node→staging TLS (local cert trust); it does
      // not disable browser security or change the production API URL.
      '/v1': {
        target: stagingTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
