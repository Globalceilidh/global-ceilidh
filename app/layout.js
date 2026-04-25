import { Inter, Cinzel, EB_Garamond } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '../context/LanguageContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import MainWrapper from '../components/MainWrapper';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-cinzel' });
const ebGaramond = EB_Garamond({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'], variable: '--font-eb-garamond' });

export const metadata = {
  title: 'GlobalCeilidh.com — The Global Home of Scottish Gaelic Culture',
  description: 'Learn Scottish Gaelic, connect with the global diaspora, find events, and join the community. Fàilte gu GlobalCeilidh.com.',
  keywords: 'Scottish Gaelic, Gàidhlig, learn Gaelic, diaspora, Highland Games, ceilidh, GlobalCeilidh',
  openGraph: {
    title: 'GlobalCeilidh.com',
    description: 'The global home of Scottish Gaelic language, culture and community.',
    url: 'https://globalceilidh.com',
    siteName: 'GlobalCeilidh.com',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${cinzel.variable} ${ebGaramond.variable}`}>
        <body className={`${inter.className} bg-white text-gc-text antialiased`}>
          <LanguageProvider>
            <Navigation />
            <MainWrapper>{children}</MainWrapper>
            <Footer />
           </LanguageProvider>
	  <Analytics />
	 <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}