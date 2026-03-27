'use client';
import { LanguageProvider } from '../context/LanguageContext';
import Navigation from './Navigation';
import Footer from './Footer';

export default function ClientWrapper({ children }) {
  return (
    <LanguageProvider>
      <Navigation />
      <main className="pt-16 min-h-screen">
        {children}
      </main>
      <Footer />
    </LanguageProvider>
  );
}
