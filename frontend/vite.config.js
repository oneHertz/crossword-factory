import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  build: {
    outDir: 'build',
  },
  plugins: [react()],
  define: {
    // here is the main update
    global: 'globalThis',
  },
})