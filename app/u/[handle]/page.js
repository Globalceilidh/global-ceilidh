// app/u/[handle]/page.js
// Personal page ("Duilleag-cèilidh") — the public identity shell every
// later social feature (posts, follows, the globe pin) hangs off. Server
// component: fetch by handle, 404 if missing/not onboarded. Shell only
// for now — the wall/feed comes with gc_posts.

import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '../../../lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LEVEL_LABEL = {
  beginner: 'Neach-tòiseachaidh · Beginner',
  intermediate: 'Meadhanach · Intermediate',
  fluent: 'Fileanta · Fluent',
  advanced: 'Adhartach · Advanced',
};

async function getProfile(handleParam) {
  const handle = String(handleParam || '').toLowerCase();
  const { data } = await supabaseAdmin
    .from('gc_profiles')
    .select('*')
    .eq('handle', handle)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const p = await getProfile(handle);
  if (!p || !p.onboarded_at) return { title: 'Not found · Global Ceilidh' };
  const name = p.display_name || `@${p.handle}`;
  return {
    title: `${name} · Global Ceilidh`,
    description: p.bio || `${name} on Global Ceilidh.`,
    robots: { index: false, follow: false }, // pre-launch — don't index profiles yet
  };
}

export default async function ProfilePage({ params }) {
  const { handle } = await params;
  const p = await getProfile(handle);
  if (!p || !p.onboarded_at) notFound();

  const { userId } = await auth();
  const isOwner = userId && userId === p.clerk_user_id;

  const name = p.display_name || `@${p.handle}`;
  const initials = (p.display_name || p.handle || '?')
    .split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

  return (
    <main style={wrap}>
      <div style={card}>
        {isOwner && (
          <a href="/welcome" style={editLink}>Deasaich · Edit</a>
        )}

        <div style={avatarWrap}>
          {p.avatar_url
            ? <img src={p.avatar_url} alt={name} style={avatarImg} />
            : <div style={avatarFallback}>{initials}</div>}
        </div>

        <h1 style={nameStyle}>{name}</h1>
        <p style={handleStyle}>@{p.handle}</p>

        <div style={metaRow}>
          {p.region && <span style={metaPill}>📍 {p.region}</span>}
          {p.gaidhlig_level && LEVEL_LABEL[p.gaidhlig_level] && (
            <span style={metaPill}>{LEVEL_LABEL[p.gaidhlig_level]}</span>
          )}
        </div>

        {p.bio && <p style={bioStyle}>{p.bio}</p>}

        {p.gaidhlig_note && (
          <p style={{ ...bioStyle, fontStyle: 'italic', color: '#6B4E1F', marginTop: 12 }}>
            “{p.gaidhlig_note}”
          </p>
        )}

        {p.interests?.length > 0 && (
          <Block label="Ùidhean · Interests">
            <div style={chipRow}>
              {p.interests.map((it) => <span key={it} style={chip}>{it}</span>)}
            </div>
          </Block>
        )}

        {(p.ancestral_places?.length > 0 || p.clan_family_names?.length > 0) && (
          <Block label="Freumhan · Roots">
            {p.ancestral_places?.length > 0 && (
              <p style={rootLine}>
                <span style={rootLabel}>Àiteachan · Places</span>
                {p.ancestral_places.join(' · ')}
              </p>
            )}
            {p.clan_family_names?.length > 0 && (
              <p style={rootLine}>
                <span style={rootLabel}>Cinnidhean · Names</span>
                {p.clan_family_names.join(' · ')}
              </p>
            )}
          </Block>
        )}

        {/* The wall/feed lands here next (gc_posts). */}
        <div style={wallPlaceholder}>
          {isOwner
            ? 'Tha do bhalla a’ tighinn a dh’aithghearr · Your wall is coming soon.'
            : 'Chan eil postaichean fhathast · No posts yet.'}
        </div>
      </div>
    </main>
  );
}

function Block({ label, children }) {
  return (
    <section style={blockWrap}>
      <h2 style={blockLabel}>{label}</h2>
      {children}
    </section>
  );
}

// ── styles ────────────────────────────────────────────────────────────

const wrap = {
  minHeight: '100dvh',
  background: '#F5F0E8',
  display: 'flex',
  justifyContent: 'center',
  padding: '48px 20px',
  fontFamily: 'Georgia, serif',
};
const card = {
  position: 'relative',
  width: '100%',
  maxWidth: 560,
  background: '#FFFFFF',
  borderRadius: 12,
  padding: '40px 30px 34px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxSizing: 'border-box',
};
const editLink = {
  position: 'absolute', top: 16, right: 18,
  fontFamily: '"IBM Plex Sans", system-ui, sans-serif', fontSize: 12, fontWeight: 600,
  letterSpacing: 0.4, color: '#6B4E1F', textDecoration: 'none',
  border: '1px solid #E7DEC9', borderRadius: 999, padding: '5px 12px',
};
const avatarWrap = { width: 108, height: 108, marginBottom: 14 };
const avatarImg = {
  width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover',
  border: '3px solid #E7DEC9',
};
const avatarFallback = {
  width: '100%', height: '100%', borderRadius: '50%',
  background: '#1A3A2A', color: '#F2ECDC',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
  fontSize: 40, letterSpacing: '0.05em',
};
const nameStyle = {
  fontFamily: '"Fraunces", "EB Garamond", Georgia, serif',
  fontStyle: 'italic', fontWeight: 700, fontSize: 30, color: '#1A3A2A',
  margin: 0, textAlign: 'center',
};
const handleStyle = {
  fontFamily: '"IBM Plex Mono", monospace', fontSize: 14, color: '#8B6914', margin: '4px 0 0',
};
const metaRow = { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', margin: '16px 0 0' };
const metaPill = {
  fontFamily: '"IBM Plex Sans", system-ui, sans-serif', fontSize: 13, color: '#3A2A0C',
  background: '#F5F0E8', border: '1px solid #E7DEC9', borderRadius: 999, padding: '5px 14px',
};
const bioStyle = {
  fontFamily: '"IBM Plex Sans", system-ui, sans-serif', fontSize: 15, lineHeight: 1.55,
  color: '#3A3A3A', textAlign: 'center', margin: '20px 0 0', maxWidth: 440,
};
const blockWrap = { width: '100%', marginTop: 26, borderTop: '1px solid #F0E8D8', paddingTop: 20 };
const blockLabel = {
  fontFamily: '"IBM Plex Sans", system-ui, sans-serif', fontSize: 12, fontWeight: 700,
  letterSpacing: 1, textTransform: 'uppercase', color: '#1A3A2A', margin: '0 0 12px',
};
const chipRow = { display: 'flex', flexWrap: 'wrap', gap: 8 };
const chip = {
  fontFamily: '"IBM Plex Sans", system-ui, sans-serif', fontSize: 13, color: '#3A2A0C',
  background: '#FFFDF9', border: '1px solid #D8CDB8', borderRadius: 999, padding: '6px 14px',
};
const rootLine = {
  fontFamily: '"IBM Plex Sans", system-ui, sans-serif', fontSize: 14, color: '#3A3A3A',
  margin: '0 0 8px', display: 'flex', gap: 10, flexWrap: 'wrap',
};
const rootLabel = {
  fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
  color: '#8B6914', minWidth: 118,
};
const wallPlaceholder = {
  width: '100%', marginTop: 26, padding: '28px 20px', textAlign: 'center',
  borderTop: '1px solid #F0E8D8',
  fontFamily: '"IBM Plex Sans", system-ui, sans-serif', fontSize: 14, color: '#9A8B6E',
};
