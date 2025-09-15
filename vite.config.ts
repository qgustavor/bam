import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from "@tailwindcss/vite"

// https://vitejs.dev/config/
export default defineConfig({
  base: '/bam/',
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      manifest: {
        name: 'BAM!',
        short_name: 'BAM!',
        description: 'BAM! A Big-Ass Message Inspired Web App!',
        theme_color: '#111827',
        display: 'fullscreen'
      },
      pwaAssets: {
        image: 'public/logo.svg'
      }
    })
  ]
})
