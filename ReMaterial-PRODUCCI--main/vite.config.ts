import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const required: string[] = [
    'VITE_PRICE_BASIC_MONTHLY',
    'VITE_PRICE_BASIC_YEARLY',
    'VITE_PRICE_PREMIUM_MONTHLY',
    'VITE_PRICE_PREMIUM_YEARLY',
    'VITE_PRICE_PRO_PLUS_MONTHLY',
    'VITE_PRICE_PRO_PLUS_YEARLY',
    'VITE_PRICE_KEYWORD_EXTRA',
  ]

  const missing = required.filter((k) => !env[k])
  if (missing.length) {
    console.warn('[ENV WARNING] Faltan variables:', missing.join(', '))
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV || 'dev'),
    },
  }
})