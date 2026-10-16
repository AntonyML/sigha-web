import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  poweredByHeader: false,
  ...(process.env.NODE_ENV === 'development'
    ? {
        async rewrites() {
          const backendUrl = (process.env.BACKEND_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

          return [{
            source: '/api/backend/:path*',
            destination: `${backendUrl}/:path*`,
          }]
        },
      }
    : {}),
}

export default nextConfig
