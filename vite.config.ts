import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    host: true,
    port: Number(process.env.PORT) || 5173,
    strictPort: true,
  },
  ssr: {
    external: ['bun'],
  },
  optimizeDeps: {
    exclude: ['bun'],
  },
})

export default config
