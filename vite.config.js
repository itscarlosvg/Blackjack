import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      '1782b8f70e4d.ngrok-free.app',
      '.ngrok-free.app' // Permite cualquier subdominio de ngrok
    ]
  }
})