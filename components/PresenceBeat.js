'use client';

// components/PresenceBeat.js
// Site-wide presence heartbeat. Mounted once in the root layout, it POSTs a
// tiny beat to /api/presence/beat on load and every 60s while the tab is
// visible (and again the moment it becomes visible). That's what powers the
// "N on site" number in the admin. Renders nothing; failures are ignored so
// it can never affect the page.
//
// 60s (paired with a 90s "active" window in /api/metrics/live) keeps Vercel
// invocations low — it's the main cost dial if traffic ever grows.

import { useEffect } from 'react';

export default function PresenceBeat() {
  useEffect(() => {
    let sid;
    try {
      sid = localStorage.getItem('gc_sid');
      if (!sid) {
        sid = (globalThis.crypto?.randomUUID?.() || String(Math.random()).slice(2) + Date.now());
        localStorage.setItem('gc_sid', sid);
      }
    } catch {
      sid = String(Math.random()).slice(2) + Date.now();
    }

    const beat = () => {
      if (document.visibilityState !== 'visible') return;
      fetch('/api/presence/beat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid }),
        keepalive: true,
      }).catch(() => {});
    };

    beat();
    const id = setInterval(beat, 60_000);
    const onVis = () => { if (document.visibilityState === 'visible') beat(); };
    document.addEventListener('visibilitychange', onVis);

    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVis); };
  }, []);

  return null;
}
