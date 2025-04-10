/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    domains: ['image.tmdb.org'],
  },
  // 在构建时忽略TypeScript错误
  typescript: {
    // !! 警告 !!
    // 在生产环境使用时，确保你的代码不会产生实际运行时错误
    ignoreBuildErrors: true,
  },
  // 在构建时忽略ESLint错误
  eslint: {
    // !! 警告 !!
    // 这仅推荐作为临时修复，理想情况下应该解决所有ESLint错误
    ignoreDuringBuilds: true,
  },
  // 使用独立输出模式，优化 Vercel 部署
  output: 'standalone',
  // 实验性配置
  experimental: {
    // 排除不需要的文件以减小部署大小
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-darwin-arm64',
        'node_modules/@swc/core-darwin-x64',
        'node_modules/@esbuild/darwin-arm64',
        'node_modules/@esbuild/darwin-x64',
      ],
    },
  },
};

module.exports = nextConfig; 