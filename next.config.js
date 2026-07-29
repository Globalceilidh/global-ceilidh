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
      // The An Tonn "flip" (2026-07-28): the constellation was promoted from
      // /AnTonn/test to /AnTonn, and each vertical sandbox to its live route.
      // Old /test URLs redirect so nothing shared breaks.
      { source: '/AnTonn/test', destination: '/AnTonn', permanent: true },
      { source: '/AnTonn/ceol/test', destination: '/AnTonn/ceol', permanent: true },
      { source: '/AnTonn/bhidio/test', destination: '/AnTonn/bhidio', permanent: true },
      { source: '/AnTonn/leabhraichean/test', destination: '/AnTonn/leabhraichean', permanent: true },
      { source: '/AnTonn/podcraoladh/test', destination: '/AnTonn/podcraoladh', permanent: true },
    ];
  },
}
module.exports = nextConfig
