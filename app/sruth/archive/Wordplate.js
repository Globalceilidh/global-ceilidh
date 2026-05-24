'use client';

import { useRef, useState } from 'react';

// Branded Sruth video wordplate for the archive header.
// Browsers block autoplay WITH sound, so: muted autoplay + loop (ambient),
// with a 🔊 toggle to enable audio. Falls back to the text wordmark if the
// video fails to load, so the page never breaks.
//
// Source file is 1920×1920 (square 1:1) with cream letterbox bars baked into
// the top and bottom. The wrapper enforces a wider visible aspect ratio;
// object-fit:cover scales the square video to fill that ratio so the bars
// overflow and are clipped. Nudge these two constants by ±1–2 if the bars
// don't mask off cleanly.
const TOP_CROP_PCT = 21;
const BOTTOM_CROP_PCT = 21;
const VISIBLE_PCT = 100 - TOP_CROP_PCT - BOTTOM_CROP_PCT;

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
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: 680,
      margin: '0 auto 12px',
      // Visible band aspect = source-width : (source-height × VISIBLE_PCT).
      // Source is square, so this simplifies to 1 / (VISIBLE_PCT/100).
      aspectRatio: `1 / ${VISIBLE_PCT / 100}`,
      overflow: 'hidden',
      borderRadius: 6,
      lineHeight: 0,
      background: '#000',  // shows behind during the first paint frame
    }}>
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
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          border: 0,
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
