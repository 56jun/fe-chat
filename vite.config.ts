import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  console.log('env.VITE_BASE_URL', env.VITE_BASE_URL)

  return {
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
    base: './',
    define: {
      'process.env.VITE_BASE_URL': JSON.stringify(env.VITE_BASE_URL),
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://218.22.24.55:10000/',
          changeOrigin: true,
        },
        [env.VITE_BASE_URL]: {
          // target: 'https://zhgx.aihfgx.com/',
          // target:'http://2964pu8867.vicp.fun/',
          target:'https://zhgx.aihfgx.com/ai',
          changeOrigin: true,
          rewrite(path) {
            console.log('path',path)
            return path.replace(/\/deepseek/g, '')
          }
        },
      }
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
  }
})
