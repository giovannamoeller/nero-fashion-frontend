import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Removido proxy pois agora consumimos API externa diretamente
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
