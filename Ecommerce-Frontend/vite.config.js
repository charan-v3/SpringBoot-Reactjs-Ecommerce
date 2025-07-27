import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,  // Single consistent frontend port
    host: true,  // Allow external connections
    open: true,  // Auto-open browser
    strictPort: true  // Fail if port is not available instead of trying others
  },
  preview: {
    port: 3000,  // Production preview port
    host: true,
    strictPort: true
  }
})
