'use client';
import { usePathname } from 'next/navigation';

export default function MainWrapper({ children }) {
  const pathname = usePathname();
  const isFullscreen = pathname === '/sruth';
  return (
    <main className={isFullscreen ? '' : 'pt-16 min-h-screen'}>
      {children}
    </main>
  );
}
