import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
   server: {
    host: true, // or use '0.0.0.0' for more control
    port: 8000, // or any port you prefer
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          mantine: ['@mantine/core', '@mantine/hooks'],
          aggrid: ['ag-grid-community', 'ag-grid-enterprise', 'ag-grid-react'],
          mobx: ['mobx', 'mobx-react-lite'],
          d3: ['d3-dsv'],
          plotly: ['plotly.js', 'react-plotly.js'],
        },
      },
    },
  },
})
