import RadioClient from './RadioClient';

// Share URL is the short /radio (308-redirects to /AnTonn/radio) so the
// canonical link across Facebook, iMessage, Twitter, LinkedIn ads etc.
// is memorable and podcast-recitable ("globalceilidh dot com slash
// radio").
const SHARE_URL = 'https://globalceilidh.com/radio';

// OG image resolution is a bit above Facebook's recommended 1200x630
// (we ship 1495x1052 — the existing wide-tile art). Facebook will
// letterbox in feed but it looks correct in the preview card. Swap in
// a purpose-built 1200x630 hero later without touching this file.
const OG_IMAGE = '/radio/gc-radio-logo-wide.png';

export const metadata = {
  title: 'Global Cèilidh Rèidio · Rèidio Ceilidh Cruinne',
  description:
    'Scottish Gaelic music streaming around the world. Tap in — the ceilidh is on.',
  alternates: {
    canonical: SHARE_URL,
  },
  openGraph: {
    title: 'Global Cèilidh Rèidio · Live',
    description:
      'Scottish Gaelic music streaming around the world. Tap in — the ceilidh is on.',
    url: SHARE_URL,
    siteName: 'GlobalCeilidh.com',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: OG_IMAGE,
        width: 1495,
        height: 1052,
        alt: 'Global Cèilidh Rèidio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Cèilidh Rèidio · Live',
    description:
      'Scottish Gaelic music streaming around the world. Tap in — the ceilidh is on.',
    images: [OG_IMAGE],
  },
};

export default function RadioPage() {
  return <RadioClient />;
}
