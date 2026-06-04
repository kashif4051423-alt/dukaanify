import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase storage
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Unsplash (for product images)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Allow localhost for dev
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    // Image optimization settings (Next.js 16)
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  
  // Strict mode for better React dev experience
  reactStrictMode: true,

  // Enable experimental optimizations
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', 'zustand'],
    serverActions: {
      bodySizeLimit: '10mb', // Increase from default 1mb to 10mb for image uploads
    },
  },
  
  // ── Cache headers for better performance ──────────────────
  async headers() {
    // Only add cache headers in production
    if (process.env.NODE_ENV === 'production') {
      return [
        {
          source: '/store/:slug',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
          ],
        },
        {
          source: '/api/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, s-maxage=300, stale-while-revalidate=600',
            },
          ],
        },
        {
          source: '/_next/static/:path*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
      ]
    }
    return []
  },

  // Compression
  compress: true,
}

export default nextConfig
