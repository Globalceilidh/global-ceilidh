import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function MainLayout({ children }) {
  return (
    <>
      <Navigation />
      <main className="pt-16 min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
