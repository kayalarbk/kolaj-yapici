import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Göreli taban yolu: GitHub Pages'te depo adı ne olursa olsun çalışır
  base: './',
  plugins: [react()],
  server: { port: 5173 },
})
