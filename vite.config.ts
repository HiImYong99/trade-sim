import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@toss/tds-mobile', '@toss/tds-mobile-ait', '@emotion/react'],
  },
})
