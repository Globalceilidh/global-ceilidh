import './globals.css';
import ClientWrapper from '../components/ClientWrapper';

export const metadata = {
  title: 'GlobalCeilidh.com — The Global Home of Scottish Gaelic Culture',
  description: 'Learn Scottish Gaelic, connect with the global diaspora, find events, and join the community. Fàilte gu GlobalCeilidh.com.',
  keywords: 'Scottish Gaelic, Gàidhlig, learn Gaelic, diaspora, Highland Games, ceilidh, GlobalCeilidh',
  metadataBase: new URL('https://globalceilidh.com'),
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white antialiased">
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
