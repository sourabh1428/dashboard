import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'; 
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/automation': 'http://localhost:8080',
      '/api': 'http://localhost:8080',
      '/users': 'http://localhost:8080',
      '/events': 'http://localhost:8080',
      '/track': 'http://localhost:8080',
      '/auth': 'http://localhost:8080',
      '/admin': 'http://localhost:8080',
      '/whatsapp': 'http://localhost:8080',
      '/campaign': 'http://localhost:8080'
    }
  }
})
