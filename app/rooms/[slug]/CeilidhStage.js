'use client';

// app/rooms/[slug]/CeilidhStage.js
// The 2.5D theatrical Ceilidh Room. A photoreal background image is the set;
// each participant's live LiveKit feed sits in a framed "portrait" at a fixed
// seat, tilted into the room's perspective, with a nameplate and an
// active-speaker gold glow. Runs INSIDE <LiveKitRoom>, so the hooks have
// context. No Three.js — just LiveKit's <VideoTrack> placed in a custom
// layout. On phones it falls back to a clean carousel.

import { useEffect, useState, useMemo } from 'react';
import { useTracks, useParticipants, useSpeakingParticipants, VideoTrack } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { getRoomStage } from './roomStages';

function useIsMobile(bp = 760) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${bp}px)`);
    const on = () => setM(mq.matches);
    on(); mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [bp]);
  return m;
}

function initials(name) {
  return name.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

// One seated portrait: live video if we have a track, else initials.
function Portrait({ trackRef, name, isLocal, speaking }) {
  return (
    <div className={`cr-frame${speaking ? ' cr-speaking' : ''}`}>
      <div className="cr-video">
        {trackRef
          ? <VideoTrack trackRef={trackRef} />
          : <div className="cr-avatar">{initials(name)}</div>}
      </div>
      <div className="cr-name">{name}{isLocal ? ' (you)' : ''}</div>
    </div>
  );
}

export default function CeilidhStage({ slug }) {
  const config = getRoomStage(slug);
  const participants = useParticipants();
  const cameraTracks = useTracks([Track.Source.Camera], { onlySubscribed: false });
  const speakers = useSpeakingParticipants();
  const isMobile = useIsMobile();

  const speakingIds = useMemo(() => new Set(speakers.map((p) => p.identity)), [speakers]);
  const trackByIdentity = useMemo(() => {
    const m = {};
    cameraTracks.forEach((ref) => { if (ref.participant) m[ref.participant.identity] = ref; });
    return m;
  }, [cameraTracks]);

  const occupants = participants.map((p, i) => ({
    key: p.identity,
    seat: config.seats[i] || null,
    name: p.name || p.identity || 'Guest',
    isLocal: !!p.isLocal,
    trackRef: trackByIdentity[p.identity] || null,
    speaking: speakingIds.has(p.identity),
  }));

  if (isMobile) {
    return (
      <div className="cr-wrap cr-mobile" style={{ backgroundImage: `url("${config.background}")` }}>
        <div className="cr-scrim" />
        <div className="cr-carousel">
          {occupants.map((o) => (
            <div key={o.key} className="cr-cardholder"><Portrait {...o} /></div>
          ))}
        </div>
        <style>{CSS}</style>
      </div>
    );
  }

  return (
    <div className="cr-wrap">
      <div className="cr-stage" style={{ backgroundImage: `url("${config.background}")` }}>
        {occupants.map((o) => o.seat && (
          <div
            key={o.key}
            className="cr-seat"
            style={{
              left: `${o.seat.x}%`, top: `${o.seat.y}%`, width: `${o.seat.width}%`,
              transform: `translate(-50%, -50%) perspective(700px) rotateY(${o.seat.rotation || 0}deg)`,
            }}
          >
            <Portrait {...o} />
          </div>
        ))}
      </div>
      <style>{CSS}</style>
    </div>
  );
}

const CSS = `
.cr-wrap { position: absolute; inset: 0; background: #0B0805; display: flex;
  align-items: center; justify-content: center; overflow: hidden; }
.cr-stage { position: relative; aspect-ratio: 16 / 9;
  width: min(100vw, calc(100vh * 16 / 9)); max-height: 100vh;
  background-size: cover; background-position: center;
  box-shadow: 0 0 120px rgba(0,0,0,0.6) inset; }
.cr-seat { position: absolute; }
.cr-frame { display: flex; flex-direction: column; align-items: center; }
.cr-video { width: 100%; aspect-ratio: 4 / 3; overflow: hidden; border-radius: 4px;
  border: 5px solid #2a1c10;
  box-shadow: 0 10px 22px rgba(0,0,0,0.7), 0 2px 0 rgba(255,225,170,0.15) inset;
  background: linear-gradient(160deg, #3a2616, #1c120a); }
.cr-video video { width: 100%; height: 100%; object-fit: cover; display: block; }
.cr-avatar { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
  background: #1A3A2A; color: #F2ECDC; font-family: var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif;
  font-size: 2.4vw; letter-spacing: 0.05em; }
.cr-speaking .cr-video { border-color: #C9A047;
  box-shadow: 0 0 26px rgba(201,160,71,0.85), 0 10px 22px rgba(0,0,0,0.7); }
.cr-name { margin-top: 6px; padding: 3px 12px; border-radius: 999px;
  background: rgba(16,11,6,0.82); color: #F2ECDC; white-space: nowrap;
  font-family: "IBM Plex Sans", system-ui, sans-serif; font-size: 0.8vw; letter-spacing: 0.02em;
  border: 1px solid rgba(201,160,71,0.35); }

/* mobile carousel */
.cr-mobile { flex-direction: column; }
.cr-mobile .cr-scrim { position: absolute; inset: 0; background: rgba(11,8,5,0.72);
  background-size: cover; }
.cr-carousel { position: relative; z-index: 1; display: flex; gap: 14px; overflow-x: auto;
  width: 100%; padding: 20px 16px; align-items: center; }
.cr-cardholder { flex: 0 0 46%; max-width: 240px; }
.cr-mobile .cr-name { font-size: 13px; }
.cr-mobile .cr-avatar { font-size: 34px; }
`;
