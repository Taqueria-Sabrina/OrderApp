import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tempoVitePlugin } from 'tempo-sdk'

// https://vite.dev/config/
// The app is served at the clean root of taqueriasabrina.com, so it builds with
// base="/" (clean asset paths + router basename). GitHub Pages physically hosts
// the files under /OrderApp/, and the Cloudflare worker in front of the domain
// prepends that prefix when fetching the origin — the browser only ever sees
// root paths. See cloudflare-worker.js.
export default defineConfig({
  base: '/',
  plugins: [tempoVitePlugin(), react(), tailwindcss()],
})
