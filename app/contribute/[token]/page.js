// Public per-contributor upload page. The [token] is the contributor's
// personal credential (see sruth-backend gc_contributors) — no Clerk
// account needed. Must stay outside the pre-launch cookie gate; /contribute
// is added to middleware.js PUBLIC_PREFIXES.

import ContributeClient from './ContributeClient';

export const metadata = {
  title: 'Submit to Global Ceilidh',
  description: 'Share your Gàidhlig video or music with the Global Ceilidh community.',
  robots: { index: false, follow: false }, // personal links — keep them out of search
};

export default async function Page({ params }) {
  const { token } = await params;
  return <ContributeClient token={token} />;
}
