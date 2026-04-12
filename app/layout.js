import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '../context/LanguageContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

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
      <html lang="en" className={inter.variable}>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className={`${inter.className} bg-white text-gc-text antialiased`}>
          <LanguageProvider>
            <Navigation />
            <main className="pt-16 min-h-screen">
              {children}
            </main>
            <Footer />
          </LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}