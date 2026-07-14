import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tempoVitePlugin } from 'tempo-sdk'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tempoVitePlugin(), react(), tailwindcss()],
})
