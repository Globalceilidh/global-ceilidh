import dynamic from 'next/dynamic';

const SruthClient = dynamic(() => import('../../components/SruthClient'), { ssr: false });

export default function Page() {
  return <SruthClient />;
}
