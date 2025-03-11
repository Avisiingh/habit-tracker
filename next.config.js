/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  swcMinify: true,
  
  // Reduce bundle size
  compress: true,
  
  // Optimize images
  images: {
    domains: ['avatars.githubusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Production optimizations
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'framer-motion'],
  },

  // Disable static exports
  output: 'standalone',
}

module.exports = nextConfig 