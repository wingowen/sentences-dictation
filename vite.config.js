/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: false
  },
  build: {
    // 启用代码分割
    splitChunks: true,
    // 生成source map，方便调试
    sourcemap: true,
    // 优化构建输出
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // 自动分割代码
        manualChunks: {
          // 语音功能相关
          'speech': [
            './src/services/speechService.js',
            './src/services/externalSpeechService.js',
            './src/hooks/useSpeechVoices.js',
            './src/hooks/useSpeechPlayback.js'
          ],
          // 闪卡功能相关
          'flashcard': [
            './src/components/FlashcardApp.jsx',
            './src/components/FlashcardManager.jsx',
            './src/components/FlashcardLearner.jsx',
            './src/components/FlashcardStats.jsx',
            './src/services/flashcardService.js'
          ],
          // 词汇功能相关
          'vocabulary': [
            './src/components/VocabularyApp.jsx',
            './src/components/VocabularyReview.jsx',
            './src/services/vocabularyService.js'
          ],
          // 数据服务相关
          'data': [
            './src/services/dataService.js',
            './src/services/cacheService.js',
            './src/services/pronunciationService.js',
            './src/hooks/useSentences.js',
            './src/hooks/usePracticeStats.js',
            './src/hooks/usePracticeProgress.js'
          ],
          // UI组件相关
          'ui': [
            './src/components/ResultModal.jsx',
            './src/components/DataSourceSelection.jsx',
            './src/components/PracticeStats.jsx',
            './src/components/PhoneticsSection.jsx',
            './src/components/PageSkeleton.jsx',
            './src/components/LoadingIndicator.jsx'
          ],
          // 认证相关
          'auth': [
            './src/services/firebase.js',
            './src/components/LoginModal.jsx'
          ],
          // 工具库
          'utils': [
            './src/utils/contractionMap.js',
            './src/utils/debounce.js',
            './src/utils/errors.js'
          ],
          // React和核心库
          'vendor': ['react', 'react-dom'],
          // 第三方库
          'third-party': ['@notionhq/client', 'axios', 'cheerio']
        },
        // 配置chunk命名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // 增加chunk大小警告限制，因为我们现在有了更好的分割
    chunkSizeWarningLimit: 500
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        'cypress/',
        '**/*.config.*',
        'src/main.jsx',
        'src/vite-env.d.ts'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    }
  }
})