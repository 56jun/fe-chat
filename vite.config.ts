import { fileURLToPath, URL } from 'node:url'
import path from 'path'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// @ts-ignore
import createSvgIcon from './vite/plugins/svg-icon'

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd());
  console.log('env.VITE_BASE_URL', env)

  return {
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
      createSvgIcon(command === 'build'),
    ],
    base: './',
    define: {
      'process.env': JSON.stringify(env),
    },
    server: {
      host: true,
      open: true,
      proxy: {
        '/api': {
          target: 'http://218.22.24.55:10000/',
          changeOrigin: true,
        },
        [env.VITE_BASE_URL]: {
          // target:'http://2964pu8867.vicp.fun/',
          // target:'https://zhgx.aihfgx.com/ai',
          // target:'http://10.161.3.174:3000/',
          target:'http://localhost:3000/',
          changeOrigin: true,
          rewrite(path) {
            console.log('path',path.replace(/\/deepseek/g, ''))
            return path.replace(/\/deepseek/g, '')
          }
        },
      }
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
        // '@': './src'
      },
    },
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/package/index.ts'),
        name: 'fe-chaaat',
        fileName: (format) => `index.${format}.js`
      },
      rollupOptions: {
        // 确保外部化处理那些你不想打包进库的依赖
        external: ['vue'],
        output: {
          // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
          globals: {
            vue: 'Vue'
          }
        },
      }
    }
  }
})
