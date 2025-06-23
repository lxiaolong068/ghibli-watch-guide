/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    domains: ['image.tmdb.org'],
  },
  // TypeScript和ESLint错误已修复，移除忽略配置
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
  // 删除重定向配置
  // async redirects() {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/home',
  //       permanent: true,
  //     },
  //   ];
  // },
};

module.exports = nextConfig; 