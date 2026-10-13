import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    const backendUrl = (process.env.BACKEND_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

    return [{
      source: '/api/backend/:path*',
      destination: `${backendUrl}/:path*`,
    }]
  },
}

export default nextConfig
