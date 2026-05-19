import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedIssues, getIssueBySlug, padded } from '../data';

// ISR + on-demand: known issues are prerendered; a brand-new issue (new slug)
// renders on first hit and is then cached. So Issue 3 needs no redeploy.
export const revalidate = 300;

export async function generateStaticParams() {
  const issues = await getPublishedIssues();
  return issues.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const issue = await getIssueBySlug(slug);
  if (!issue) return {};
  return {
    title: `Sruth · Nº ${padded(issue.number)} — Archive`,
    description: `Sruth back issue Nº ${padded(issue.number)}.`,
  };
}

const BAR_HEIGHT = 52;

export default async function SruthIssuePage({ params }) {
  const { slug } = await params;
  const issue = await getIssueBySlug(slug);
  if (!issue || !issue.html) notFound();

  const num = padded(issue.number);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          height: BAR_HEIGHT,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '0 20px',
          borderBottom: '1px solid #E8DCC8',
          background: '#FCFCFC',
          fontFamily: 'Georgia, serif',
        }}
      >
        <Link
          href="/sruth/archive"
          style={{ color: '#8B6914', textDecoration: 'none', fontSize: 14 }}
        >
          ← Archive
        </Link>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>
          Sruth · Nº {num}
        </span>
        <span style={{ width: 56 }} />
      </header>

      <iframe
        srcDoc={issue.html}
        title={`Sruth Nº ${num}`}
        style={{ flex: 1, width: '100%', border: 'none', display: 'block' }}
      />
    </div>
  );
}
