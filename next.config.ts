import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Static export is only needed for production builds. Keeping it out of the
  // development server lets the local API rewrite work without a warning.
  ...(process.env.NODE_ENV === 'production' ? { output: 'export' as const } : {}),
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
