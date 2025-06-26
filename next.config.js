/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    domains: ['image.tmdb.org'],
  },
  // TypeScript and ESLint errors fixed, ignore configuration removed
  // Experimental configuration
  experimental: {
    // Exclude unnecessary files to reduce deployment size
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-darwin-arm64',
        'node_modules/@swc/core-darwin-x64',
        'node_modules/@esbuild/darwin-arm64',
        'node_modules/@esbuild/darwin-x64',
      ],
    },
  },
  // Redirect configuration removed
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