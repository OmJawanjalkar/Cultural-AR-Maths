import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  // appType:'spa' (the default) enables the HTML5 history-API fallback for
  // both the dev server and vite preview, so /ar/rangoli and /ar/sabzi always
  // serve index.html and let React Router handle the route client-side.
  appType: 'spa',
  server: {
    host: true,   // expose on LAN so mobile devices can connect
    https: true,  // required for camera (getUserMedia) on mobile browsers
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,   // rewrites Host header to localhost:5000
      },
    },
  },
  preview: {
    host: true,
    https: true,
    // Explicit history fallback for production preview builds
    historyApiFallback: true,
  },
})
