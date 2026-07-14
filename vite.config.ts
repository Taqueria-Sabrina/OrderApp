import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tempoVitePlugin } from 'tempo-sdk'

// https://vite.dev/config/
// Served on the custom domain taqueriasabrina.com, which GitHub Pages serves at
// the ROOT (not the /OrderApp/ project subpath). So the build uses base="/" —
// clean asset paths + empty router basename. No proxy/worker in front; Pages
// serves the custom domain directly.
export default defineConfig({
  base: '/',
  plugins: [tempoVitePlugin(), react(), tailwindcss()],
})
