import { fileURLToPath, URL } from 'node:url'
import path from 'path'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// @ts-ignore
import createSvgIcon from './vite/plugins/svg-icon'

// https://vite.dev/config/
export default defineConfig((config) => {
  console.log('config', config)
  const { mode, command } = config
  const env = loadEnv(mode, process.cwd());
  let build = {}
  console.log('process.argv', process.argv)
  if (process.argv.includes('package')) {
    build = {
      lib: {
        entry: path.resolve(__dirname, 'src/package/index.ts'),
        name: 'fe-chaaat',
        fileName: (format: string) => `index.${format}.js`
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
  return {
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
      createSvgIcon(command === 'build'),
    ],
    base: env.VITE_BASE_CONTEXT,
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
          target: 'http://218.22.24.55:10000/ai',
          // target:'http://10.161.3.174:3000/',
          // target:'http://localhost:3000/',
          changeOrigin: true,
          rewrite(path) {
            const reg = new RegExp('^' + env.VITE_BASE_URL, 'g')
            return path.replace(reg, '')
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
    build,
  }
})
