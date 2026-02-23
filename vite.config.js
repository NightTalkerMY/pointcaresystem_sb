import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['.ngrok-free.app'],
    host: true,       // Allows the server to be accessed externally (0.0.0.0)
    strictPort: true, // Ensures it always uses 5173 (doesn't switch if busy)
    port: 5173,
  },
})