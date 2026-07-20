'use client';

// app/rooms/[slug]/CeilidhStage.js
// The 2.5D theatrical Ceilidh Room. A photoreal background image is the set;
// each participant's live LiveKit feed sits at a fixed seat. Three render
// modes per seat:
//   • green screen ON  → WebGL chroma-key removes the green; the room shows
//     straight through behind them (no frame) — they're cut INTO the set.
//   • normal camera    → framed "portrait" tile.
//   • camera OFF       → just their nameplate; the empty chair/room shows.
// A per-person toggle broadcasts "I'm on a green screen" via LiveKit
// participant attributes, so every screen keys them the same way.

import { useEffect, useState, useMemo, useRef } from 'react';
import {
  useTracks, useParticipants, useSpeakingParticipants, useLocalParticipant,
  useRoomContext, VideoTrack, ControlBar,
} from '@livekit/components-react';
import { Track, RoomEvent } from 'livekit-client';
import { VirtualBackground } from '@livekit/track-processors';
import { getRoomStage } from './roomStages';

// A pixel-flat green the chroma key removes cleanly. Applied as a virtual
// background so nobody needs a physical green screen — one tap and the app's
// segmentation paints them onto green, then every screen keys it out.
function greenDataUrl() {
  const c = document.createElement('canvas'); c.width = c.height = 16;
  const x = c.getContext('2d'); x.fillStyle = '#00FF00'; x.fillRect(0, 0, 16, 16);
  return c.toDataURL('image/png');
}

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

function seatStyle(seat) {
  return {
    left: `${seat.x}%`, top: `${seat.y}%`, width: `${seat.width}%`,
    transform: `translate(-50%, -50%) perspective(700px) rotateY(${seat.rotation || 0}deg)`,
  };
}

// ── WebGL chroma key with temporal + spatial mask smoothing ────────────
// Two passes: KEY computes a feathered, spatially-blurred alpha from the
// green video AND blends it with the previous frame's alpha (temporal EMA)
// to stop the ML mask trembling; PRESENT draws the result to the visible
// canvas so the room shows through. Ping-pong FBOs hold the frame history.
function startChromaKey(video, canvas, onDebug) {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true });
  if (!gl) { onDebug?.({ webgl: 'NO-CONTEXT' }); return () => {}; }
  const compile = (type, src) => {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) onDebug?.({ webgl: 'SHADER-FAIL', log: gl.getShaderInfoLog(s) });
    return s;
  };
  const link = (vsSrc, fsSrc) => {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vsSrc));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fsSrc));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) onDebug?.({ webgl: 'LINK-FAIL', log: gl.getProgramInfoLog(p) });
    return p;
  };
  const VS = 'attribute vec2 pos; varying vec2 uv; void main(){ uv=(pos+1.0)/2.0; gl_Position=vec4(pos,0.0,1.0); }';
  // KEY: video is uploaded un-flipped, so sample it y-inverted. Feathered
  // 5-tap spatial key, then EMA with the previous frame's alpha.
  const KEY_FS = `precision mediump float; varying vec2 uv;
    uniform sampler2D videoTex; uniform sampler2D prevTex; uniform vec2 res; uniform float useHist;
    float keyAt(vec2 p){ vec4 c=texture2D(videoTex, vec2(p.x, 1.0-p.y)); float d=c.g-max(c.r,c.b); return 1.0-smoothstep(0.02,0.22,d); }
    void main(){
      vec2 o = 1.3/res;
      float a = keyAt(uv)*0.5
        + keyAt(uv+vec2(o.x,0.0))*0.125 + keyAt(uv-vec2(o.x,0.0))*0.125
        + keyAt(uv+vec2(0.0,o.y))*0.125 + keyAt(uv-vec2(0.0,o.y))*0.125;
      float pa = texture2D(prevTex, uv).a;
      a = mix(a, pa, useHist * 0.9);               // temporal smoothing (TEST: cranked high)
      vec4 c = texture2D(videoTex, vec2(uv.x, 1.0-uv.y));
      float d = c.g - max(c.r,c.b);
      float spill = clamp(d*1.6, 0.0, 1.0);
      c.g = mix(c.g, (c.r+c.b)*0.5, spill);
      gl_FragColor = vec4(c.rgb, a);
    }`;
  const PRESENT_FS = 'precision mediump float; varying vec2 uv; uniform sampler2D src; void main(){ gl_FragColor = texture2D(src, uv); }';

  const keyProg = link(VS, KEY_FS);
  const presentProg = link(VS, PRESENT_FS);
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const keyPos = gl.getAttribLocation(keyProg, 'pos');
  const presentPos = gl.getAttribLocation(presentProg, 'pos');
  const videoLoc = gl.getUniformLocation(keyProg, 'videoTex');
  const prevLoc = gl.getUniformLocation(keyProg, 'prevTex');
  const resLoc = gl.getUniformLocation(keyProg, 'res');
  const useHistLoc = gl.getUniformLocation(keyProg, 'useHist');
  const srcLoc = gl.getUniformLocation(presentProg, 'src');

  const setupTex = (t) => {
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  };
  const videoTex = gl.createTexture(); setupTex(videoTex);

  let fbos = null, W = 0, H = 0, ping = 0, frame = 0;
  const makeFbos = (w, h) => {
    const mk = () => {
      const t = gl.createTexture(); setupTex(t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      return { fb, tex: t };
    };
    fbos = [mk(), mk()];
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    W = w; H = h; frame = 0;
  };

  const px = new Uint8Array(4);
  let raf, stopped = false;
  const bindQuad = (posLoc) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  };
  const draw = () => {
    if (stopped) return;
    if (video.readyState >= 2 && video.videoWidth) {
      const w = video.videoWidth, h = video.videoHeight;
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      if (W !== w || H !== h) makeFbos(w, h);

      gl.bindTexture(gl.TEXTURE_2D, videoTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

      const cur = fbos[ping], prev = fbos[ping ^ 1];

      // KEY pass → cur FBO
      gl.bindFramebuffer(gl.FRAMEBUFFER, cur.fb);
      gl.viewport(0, 0, w, h);
      gl.useProgram(keyProg);
      bindQuad(keyPos);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, videoTex); gl.uniform1i(videoLoc, 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, prev.tex); gl.uniform1i(prevLoc, 1);
      gl.uniform2f(resLoc, w, h);
      gl.uniform1f(useHistLoc, frame < 2 ? 0.0 : 1.0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // PRESENT pass → visible canvas
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, w, h);
      gl.useProgram(presentProg);
      bindQuad(presentPos);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, cur.tex); gl.uniform1i(srcLoc, 0);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      ping ^= 1; frame++;
      if (onDebug && (frame % 30 === 0)) {
        gl.readPixels(3, 3, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
        onDebug({ webgl: 'OK', size: `${w}x${h}`, corner: [px[0], px[1], px[2], px[3]], hist: (useHistLoc !== null && prevLoc !== null) ? 'wired' : 'NULL', fbo: fbos ? 'yes' : 'no' });
      }
    } else if (onDebug && (frame++ % 60 === 0)) {
      onDebug({ webgl: 'OK', size: 'video-not-ready', ready: video.readyState });
    }
    raf = requestAnimationFrame(draw);
  };
  draw();
  return () => { stopped = true; cancelAnimationFrame(raf); };
}

function ChromaKeyVideo({ trackRef, onDebug }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const track = trackRef?.publication?.track;
    if (!track || !canvasRef.current) return;
    const video = document.createElement('video');
    video.muted = true; video.playsInline = true; video.autoplay = true;
    track.attach(video);
    const p = video.play?.(); if (p?.catch) p.catch(() => {});
    const stop = startChromaKey(video, canvasRef.current, onDebug);
    return () => { stop(); try { track.detach(video); } catch { /* gone */ } };
  }, [trackRef?.publication?.track]);
  return <canvas ref={canvasRef} className="cr-keyed" />;
}

function Portrait({ trackRef, name, isLocal, speaking }) {
  return (
    <div className={`cr-frame${speaking ? ' cr-speaking' : ''}`}>
      <div className="cr-video">
        {trackRef ? <VideoTrack trackRef={trackRef} /> : <div className="cr-avatar">{initials(name)}</div>}
      </div>
      <div className="cr-name">{name}{isLocal ? ' (you)' : ''}</div>
    </div>
  );
}

// One seat's content: green-key, framed, or name-only (camera off).
function SeatContent({ o, allowKey, onDebug }) {
  if (!o.camOn) {
    return <div className="cr-nameonly"><div className="cr-name">{o.name}{o.isLocal ? ' (you)' : ''}</div></div>;
  }
  if (allowKey && o.gs && o.trackRef) {
    return (
      <div className={`cr-keyedwrap${o.speaking ? ' cr-glow' : ''}`}>
        <ChromaKeyVideo trackRef={o.trackRef} onDebug={onDebug} />
        <div className="cr-name">{o.name}{o.isLocal ? ' (you)' : ''}</div>
      </div>
    );
  }
  return <Portrait {...o} />;
}

function StageControls({ gsOn, onToggleGs }) {
  return (
    <div className="cr-controls">
      <button className={`cr-gsbtn${gsOn ? ' cr-gsbtn-on' : ''}`} onClick={onToggleGs}
        title="One tap: replaces your background with green and drops you into the room">
        {gsOn ? '✓ In the room' : 'Sit in the room'}
      </button>
      <ControlBar variation="minimal" controls={{ microphone: true, camera: true, screenShare: true, leave: true, chat: false, settings: false }} />
    </div>
  );
}

export default function CeilidhStage({ slug }) {
  const config = getRoomStage(slug);
  const participants = useParticipants();
  const cameraTracks = useTracks([Track.Source.Camera], { onlySubscribed: false });
  const speakers = useSpeakingParticipants();
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const isMobile = useIsMobile();

  // Re-render when someone flips their green-screen attribute or (un)mutes.
  const [, bump] = useState(0);
  useEffect(() => {
    if (!room) return;
    const h = () => bump((n) => n + 1);
    room.on(RoomEvent.ParticipantAttributesChanged, h);
    room.on(RoomEvent.TrackMuted, h);
    room.on(RoomEvent.TrackUnmuted, h);
    return () => {
      room.off(RoomEvent.ParticipantAttributesChanged, h);
      room.off(RoomEvent.TrackMuted, h);
      room.off(RoomEvent.TrackUnmuted, h);
    };
  }, [room]);

  const [dbg, setDbg] = useState(null);
  // Local source of truth for your own green-screen state — so your view
  // keys immediately, independent of the attribute round-trip to the server
  // (which also propagates it to everyone else).
  const [myGs, setMyGs] = useState(false);
  const speakingIds = useMemo(() => new Set(speakers.map((p) => p.identity)), [speakers]);
  const trackByIdentity = useMemo(() => {
    const m = {};
    cameraTracks.forEach((ref) => { if (ref.participant) m[ref.participant.identity] = ref; });
    return m;
  }, [cameraTracks]);

  const localGs = myGs;

  const occupants = participants.map((p) => ({
    key: p.identity,
    name: p.name || p.identity || 'Guest',
    isLocal: !!p.isLocal,
    camOn: !!p.isCameraEnabled,
    // For yourself, trust the toggle directly (no attribute round-trip lag).
    gs: p.isLocal ? localGs : (p.attributes?.greenscreen === 'on'),
    trackRef: trackByIdentity[p.identity] || null,
    speaking: speakingIds.has(p.identity),
  }));
  const localOcc = occupants.find((o) => o.isLocal);
  const toggleGs = async () => {
    if (!localParticipant) return;
    const turningOn = !myGs;
    setMyGs(turningOn); // local view keys immediately
    const track = localParticipant.getTrackPublication(Track.Source.Camera)?.track;
    try {
      if (track) {
        if (turningOn) await track.setProcessor(VirtualBackground(greenDataUrl()));
        else await track.stopProcessor();
      }
    } catch (e) { console.error('green-screen processor failed', e); }
    try {
      const attrs = { ...(localParticipant.attributes || {}) };
      attrs.greenscreen = turningOn ? 'on' : 'off';
      await localParticipant.setAttributes(attrs);
    } catch (e) { console.error('setAttributes failed', e); }
    bump((n) => n + 1);
  };

  if (isMobile) {
    return (
      <div className="cr-wrap cr-mobile" style={{ backgroundImage: `url("${config.background}")` }}>
        <div className="cr-scrim" />
        <div className="cr-carousel">
          {occupants.map((o) => (
            <div key={o.key} className="cr-cardholder"><SeatContent o={o} allowKey={false} /></div>
          ))}
        </div>
        <StageControls gsOn={localGs} onToggleGs={toggleGs} />
        <style>{CSS}</style>
      </div>
    );
  }

  return (
    <div className="cr-wrap">
      <div className="cr-stage" style={{ backgroundImage: `url("${config.background}")` }}>
        {config.seats.map((seat, i) => {
          const o = occupants[i];
          return (
            <div key={i} className="cr-seat" style={seatStyle(seat)}>
              {o ? <SeatContent o={o} allowKey onDebug={o.isLocal ? setDbg : undefined} /> : <div className="cr-ghost">Seat {i + 1}</div>}
            </div>
          );
        })}

        {config.whiteboard && config.agenda && (
          <div
            className="cr-whiteboard"
            style={{
              left: `${config.whiteboard.x}%`, top: `${config.whiteboard.y}%`,
              width: `${config.whiteboard.width}%`,
              transform: `translate(-50%, -50%) perspective(800px) rotateY(${config.whiteboard.rotation || 0}deg)`,
            }}
          >
            <div className="cr-wb-title">{config.agenda.title}</div>
            <ol className="cr-wb-list">
              {config.agenda.items.map((it, i) => <li key={i}>{it}</li>)}
            </ol>
          </div>
        )}
      </div>
      {localOcc && (
        <div className="cr-dbg">
          you → gs:{String(localOcc.gs)} cam:{String(localOcc.camOn)} track:{String(!!localOcc.trackRef)} path:{!localOcc.camOn ? 'name' : (localOcc.gs && localOcc.trackRef ? 'KEYED' : 'framed')}
          {dbg ? ` | keyer:${dbg.webgl} ${dbg.size || ''} ${dbg.corner ? `rgba(${dbg.corner.join(',')})` : ''} ${dbg.hist ? `hist:${dbg.hist}` : ''} ${dbg.fbo ? `fbo:${dbg.fbo}` : ''} ${dbg.log || ''}` : ' | keyer:—'}
        </div>
      )}
      <StageControls gsOn={localGs} onToggleGs={toggleGs} />
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

/* keyed (green-screen) portrait — no frame, room shows through */
.cr-keyedwrap { display: flex; flex-direction: column; align-items: center; }
.cr-keyed { width: 100%; height: auto; display: block;
  filter: drop-shadow(0 8px 10px rgba(0,0,0,0.55)); }
.cr-glow .cr-keyed { filter: drop-shadow(0 0 14px rgba(201,160,71,0.9)); }

/* camera-off — name over the empty chair */
.cr-nameonly { display: flex; justify-content: center; align-items: center; min-height: 40px; }

.cr-name { margin-top: 6px; padding: 3px 12px; border-radius: 999px;
  background: rgba(16,11,6,0.82); color: #F2ECDC; white-space: nowrap;
  font-family: "IBM Plex Sans", system-ui, sans-serif; font-size: 0.8vw; letter-spacing: 0.02em;
  border: 1px solid rgba(201,160,71,0.35); }

.cr-ghost { width: 100%; aspect-ratio: 4 / 3; display: flex; align-items: center; justify-content: center;
  border: 2px dashed rgba(201,160,71,0.55); border-radius: 4px; color: rgba(242,236,220,0.72);
  background: rgba(11,8,5,0.28); font-family: "IBM Plex Sans", system-ui, sans-serif;
  font-size: 0.85vw; letter-spacing: 0.04em; text-transform: uppercase; }

/* temporary keyer diagnostic */
.cr-dbg { position: absolute; top: 12px; left: 12px; z-index: 20;
  font-family: ui-monospace, monospace; font-size: 12px; color: #9EE39E;
  background: rgba(0,0,0,0.8); padding: 6px 10px; border-radius: 6px;
  border: 1px solid rgba(158,227,158,0.4); max-width: 90vw; }

/* the agenda, written on the room's whiteboard */
.cr-whiteboard { position: absolute; background: rgba(240,238,230,0.9);
  border-radius: 2px; padding: 0.8% 1%; box-shadow: 0 3px 14px rgba(0,0,0,0.4);
  transform-origin: center; }
.cr-wb-title { font-family: "IBM Plex Sans", system-ui, sans-serif; font-weight: 700;
  color: #1A3A2A; font-size: 0.7vw; letter-spacing: 0.02em; margin-bottom: 0.4vw;
  padding-bottom: 0.2vw; border-bottom: 1px solid rgba(26,58,42,0.35); }
.cr-wb-list { margin: 0; padding-left: 1.1vw; color: #283a22; list-style: decimal;
  font-family: "IBM Plex Sans", system-ui, sans-serif; font-size: 0.6vw; line-height: 1.55; }
.cr-wb-list li { margin-bottom: 0.12vw; }

/* control bar — always reachable, floating over the set */
.cr-controls { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
  z-index: 8; display: flex; align-items: center; gap: 10px;
  background: rgba(16,11,6,0.78); border: 1px solid rgba(201,160,71,0.4);
  border-radius: 999px; padding: 4px 8px; backdrop-filter: blur(8px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.5); }
.cr-controls .lk-control-bar { border: none; background: transparent; padding: 0; }
.cr-gsbtn { cursor: pointer; border-radius: 999px; padding: 8px 14px; white-space: nowrap;
  font-family: "IBM Plex Sans", system-ui, sans-serif; font-size: 12px; letter-spacing: 0.3px;
  border: 1px solid rgba(201,160,71,0.5); background: transparent; color: #E6DCC6; }
.cr-gsbtn-on { background: #3BA55D; border-color: #3BA55D; color: #0B140D; font-weight: 700; }

/* mobile carousel */
.cr-mobile { flex-direction: column; }
.cr-mobile .cr-scrim { position: absolute; inset: 0; background: rgba(11,8,5,0.72); background-size: cover; }
.cr-carousel { position: relative; z-index: 1; display: flex; gap: 14px; overflow-x: auto;
  width: 100%; padding: 20px 16px; align-items: center; }
.cr-cardholder { flex: 0 0 46%; max-width: 240px; }
.cr-mobile .cr-name { font-size: 13px; }
.cr-mobile .cr-avatar { font-size: 34px; }
`;
