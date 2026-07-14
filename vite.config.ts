import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tempoVitePlugin } from 'tempo-sdk'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
// GitHub Pages serves this project site from the /OrderApp/ subpath, so the
// production build needs base="/OrderApp/". Dev and the Tempo canvas stay at "/"
// so local tooling is unaffected.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/OrderApp/' : '/',
  plugins: [tempoVitePlugin(), react(), tailwindcss(), cloudflare()],
}))