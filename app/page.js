'use client';
import { useState } from 'react';
import SruthSignupModal from '@/components/SruthSignupModal';

export default function ComingSoon() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Fixed full-viewport overlay — covers nav/footer */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        backgroundColor: '#000',
        overflowY: 'auto',
      }}>
        <div style={{ position: 'relative' }}>
          <img
            src="/GC-Comingsoon_2.png"
            alt="sruth. — GlobalCeilidh is coming soon"
            style={{ width: '100%', display: 'block' }}
          />

          {/* ── Large "sruth." at top ── */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Sign up for Sruth"
            title="Sign up for sruth."
            style={{
              position: 'absolute',
              top: '3%', left: '13%',
              width: '74%', height: '20%',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          />

          {/* ── "t-srutha" in "A bheil sibh deiseil airson an t-srutha?" ── */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Sign up for Sruth"
            title="Sign up for sruth."
            style={{
              position: 'absolute',
              top: '61%', left: '62%',
              width: '28%', height: '10%',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          />

          {/* ── Small "sruth." in "Sign up for sruth." at bottom ── */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Sign up for Sruth"
            title="Sign up for sruth."
            style={{
              position: 'absolute',
              top: '80%', left: '52%',
              width: '20%', height: '7%',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          />
        </div>
      </div>

      {open && <SruthSignupModal onClose={() => setOpen(false)} />}
    </>
  );
}
