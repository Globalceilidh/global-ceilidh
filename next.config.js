/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
  },
  async rewrites() {
    return {
      // beforeFiles runs before Next.js tries to match any app/pages routes
      beforeFiles: [
        { source: '/sruth', destination: '/sruth-page.html' },
      ],
    };
  },
}
module.exports = nextConfig
