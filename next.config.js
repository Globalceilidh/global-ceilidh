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
  async redirects() {
    return [
      // Global Ceilidh Radio moved under An Tonn 2026-07-05. The old
      // /radio URL was set as the "station website" on the Live365 App
      // and may be tapped from listener directories. 308 preserves
      // method and is permanent so search engines migrate the canonical.
      {
        source: '/radio',
        destination: '/AnTonn/radio',
        permanent: true,
      },
    ];
  },
}
module.exports = nextConfig
