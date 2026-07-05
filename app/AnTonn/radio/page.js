import RadioClient from './RadioClient';

export const metadata = {
  title: 'Global Ceilidh Radio · Rèidio Ceilidh Cruinne',
  description: 'Global Ceilidh Radio — Scottish Gaelic music, culture and community, streaming around the world via Live365.',
  openGraph: {
    title: 'Global Ceilidh Radio',
    description: 'Scottish Gaelic music, culture and community — streaming globally.',
    url: 'https://globalceilidh.com/radio',
    siteName: 'GlobalCeilidh.com',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RadioPage() {
  return <RadioClient />;
}
