import Link from 'next/link';
import { getPublishedIssues, padded } from './data';

// ISR: re-read Supabase at most every 5 min. A real send writes html_archive,
// so the new issue appears here within the window — no rebuild, no redeploy.
// On error the previously rendered page is served (stale-while-revalidate).
export const revalidate = 300;

export const metadata = {
  title: 'Sruth — Archive',
  description:
    'Back issues of Sruth, the daily current for the Scottish Gael — and anyone eavesdropping.',
};

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default async function SruthArchive() {
  const issues = await getPublishedIssues();

  return (
    <main
      style={{
        maxWidth: 680,
        margin: '0 auto',
        padding: '64px 24px 96px',
        fontFamily: 'Georgia, serif',
        color: '#111',
      }}
    >
      <header style={{ marginBottom: 40 }}>
        <p
          style={{
            fontSize: 12,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#8B6914',
            margin: '0 0 10px',
          }}
        >
          Archive
        </p>
        <h1 style={{ fontSize: 36, margin: '0 0 8px', fontWeight: 700 }}>
          s<span style={{ textDecoration: 'underline' }}>ru</span>th.
        </h1>
        <p style={{ fontStyle: 'italic', color: '#555', margin: 0, fontSize: 16 }}>
          A daily current for the Scottish Gael — and anyone eavesdropping.
        </p>
      </header>

      {issues.length === 0 ? (
        <p style={{ color: '#888', fontStyle: 'italic' }}>
          The archive is being prepared. Please check back shortly.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {issues.map((issue) => (
            <li key={issue.slug} style={{ borderTop: '1px solid #E8DCC8' }}>
              <Link
                href={`/sruth/archive/${issue.slug}`}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 16,
                  padding: '20px 4px',
                  color: '#111',
                  textDecoration: 'none',
                }}
              >
                <span style={{ fontSize: 20, fontWeight: 700 }}>
                  Nº {padded(issue.number)}
                </span>
                <span
                  style={{ fontSize: 13, color: '#8B6914', whiteSpace: 'nowrap' }}
                >
                  {formatDate(issue.sentAt)} →
                </span>
              </Link>
            </li>
          ))}
          <li style={{ borderTop: '1px solid #E8DCC8' }} />
        </ul>
      )}
    </main>
  );
}
