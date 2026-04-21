import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  // dev 代理目标：默认指向当前真实后端，可通过 VITE_API_PROXY_TARGET 覆盖
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://64.81.113.152:8888'

  return {
    plugins: [uni()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV ?? mode),
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/uni.scss";`,
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      // H5 dev：把 /api、/v1 全部转发到真实后端，绕开浏览器跨域
      // 小程序端不走这里（uni.request 直接打 VITE_API_BASE_URL）
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/v1': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
