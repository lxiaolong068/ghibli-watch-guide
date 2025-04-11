import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'; // 需要安装 @vitejs/plugin-react
import tsconfigPaths from 'vite-tsconfig-paths'; // 需要安装 vite-tsconfig-paths

export default defineConfig({
  plugins: [
    // @ts-ignore - react plugin 可能与 vitest 类型不完全兼容，但通常能工作
    react(),
    tsconfigPaths(), // 使 Vitest 能够解析 tsconfig.json 中的路径别名 (例如 @/lib)
  ],
  test: {
    globals: true, // 允许全局使用 describe, it, expect 等
    environment: 'jsdom', // 使用 jsdom 模拟浏览器环境
    setupFiles: './vitest.setup.ts', // 指定测试设置文件 (可选，用于全局设置)
    // 如果需要，可以配置包含/排除模式
    // include: ['**/*.test.ts'],
    // exclude: ['node_modules/**'],
    // 模拟 CSS 模块等
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
  },
}); 