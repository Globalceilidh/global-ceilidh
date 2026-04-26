'use client';
import dynamic from 'next/dynamic';

const SruthPage = dynamic(() => import('@/components/SruthPage'), { ssr: false });

export default function Page() {
  return <SruthPage />;
}
