import RadioClient from './RadioClient';

// Share URL is the short /radio (308-redirects to /AnTonn/radio) so the
// canonical link across Facebook, iMessage, Twitter, LinkedIn ads etc.
// is memorable and podcast-recitable ("globalceilidh dot com slash
// radio").
const SHARE_URL = 'https://globalceilidh.com/radio';

// Purpose-built 1200x630 share card (Facebook's exact recommended size):
// the rèidio emblem — broadcast tower rising from the Sniomh swirl —
// centered on black, so the card reads as one seamless image with no
// letterboxing. Facebook renders the OG title beneath it. Kept separate
// from gc-radio-logo-wide.png, which is still used as the on-page logo.
const OG_IMAGE = '/radio/gc-radio-og.png';

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
        width: 1200,
        height: 630,
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
