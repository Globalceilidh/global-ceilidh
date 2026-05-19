'use client';

import { useRef, useState } from 'react';

// Branded Sruth video wordplate for the archive header.
// Browsers block autoplay WITH sound, so: muted autoplay + loop (ambient),
// with a 🔊 toggle to enable audio. Falls back to the text wordmark if the
// video fails to load, so the page never breaks.
export default function Wordplate() {
  const videoRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [muted, setMuted] = useState(true);

  function toggleSound() {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    if (!next) {
      // Unmuting counts as a user gesture — ensure it's actually playing.
      v.play?.().catch(() => {});
    }
    setMuted(next);
  }

  if (failed) {
    return (
      <h1 style={{ fontSize: 36, margin: '0 0 8px', fontWeight: 700 }}>
        s<span style={{ textDecoration: 'underline' }}>ru</span>th.
      </h1>
    );
  }

  return (
    <div style={{ position: 'relative', margin: '0 0 12px', lineHeight: 0 }}>
      <video
        ref={videoRef}
        src="/sruth/sruth-wordplate.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onError={() => setFailed(true)}
        aria-label="Sruth"
        style={{
          display: 'block',
          width: '100%',
          maxWidth: 680,
          height: 'auto',
          borderRadius: 6,
        }}
      />
      <button
        type="button"
        onClick={toggleSound}
        aria-label={muted ? 'Unmute' : 'Mute'}
        style={{
          position: 'absolute',
          right: 10,
          bottom: 10,
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(0,0,0,0.45)',
          color: '#fff',
          fontSize: 15,
          cursor: 'pointer',
          lineHeight: '36px',
          padding: 0,
        }}
      >
        {muted ? '🔇' : '🔊'}
      </button>
    </div>
  );
}
