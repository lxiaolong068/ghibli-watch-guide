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
};

module.exports = nextConfig; 