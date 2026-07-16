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
      // Global Ceilidh Radio now lives at the top-level /radio (2026-07-15)
      // — cleaner share URL, and it's the "station website" set on the
      // Live365 App. It briefly lived under /AnTonn/radio (2026-07-05);
      // this 308 keeps any listener-directory or shared /AnTonn/radio
      // links working by sending them to the canonical /radio.
      {
        source: '/AnTonn/radio',
        destination: '/radio',
        permanent: true,
      },
    ];
  },
}
module.exports = nextConfig
