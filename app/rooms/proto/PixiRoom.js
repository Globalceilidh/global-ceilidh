'use client';

// app/rooms/proto/PixiRoom.js
// PixiJS room-engine PROTOTYPE — proves the one thing DOM can't do cleanly:
// participants sitting *behind* foreground furniture (depth occlusion).
//
// Three layers, back to front:
//   1. background.png      — the room
//   2. participants        — (placeholder people here; LiveKit video textures next)
//   3. foreground.png      — the table, drawn ON TOP so people are masked behind it
//
// Everything is authored in the background image's native 1920×1080 space and
// scaled to "cover" the viewport, so the three layers + the seat map always
// line up regardless of screen size. Swap the two PNGs in /public/rooms/proto
// for your real art and the seats below for the real seat map — nothing else
// changes.
//
// Pixi is browser-only, so it's imported inside the effect (never on the
// server). This route is isolated; it can't affect the rest of the app.

import { useEffect, useRef } from 'react';

// Native authoring resolution — matches the placeholder PNGs.
const ROOM_W = 1920;
const ROOM_H = 1080;

// The seat map (Sol's JSON, inline for the prototype). x/y are in room space.
const SEATS = [
  { id: 1, x: 160,  y: 540 },
  { id: 2, x: 480,  y: 540 },
  { id: 3, x: 800,  y: 540 },
  { id: 4, x: 1120, y: 540 },
  { id: 5, x: 1440, y: 540 },
  { id: 6, x: 1760, y: 540 },
];

const SEAT_COLORS = [0x8a5a3c, 0x4c6b7a, 0x6b5a8a, 0x7a6b3c, 0x3c7a5a, 0x8a3c4c];

export default function PixiRoom() {
  const hostRef = useRef(null);

  useEffect(() => {
    let app;
    let cancelled = false;

    (async () => {
      const PIXI = await import('pixi.js');
      if (cancelled) return;

      app = new PIXI.Application();
      await app.init({
        background: '#0a0a0a',
        antialias: true,
        resizeTo: hostRef.current,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      });
      if (cancelled) { app.destroy(true); return; }
      hostRef.current.appendChild(app.canvas);

      const [bgTex, fgTex] = await Promise.all([
        PIXI.Assets.load('/rooms/proto/background.png'),
        PIXI.Assets.load('/rooms/proto/foreground.png'),
      ]);
      if (cancelled) { app.destroy(true); return; }

      // World container, authored in room space.
      const world = new PIXI.Container();
      app.stage.addChild(world);

      const bg = new PIXI.Sprite(bgTex);
      bg.width = ROOM_W; bg.height = ROOM_H;

      const people = new PIXI.Container();
      SEATS.forEach((seat, i) => {
        const person = makePerson(PIXI, seat.id, SEAT_COLORS[i % SEAT_COLORS.length]);
        person.position.set(seat.x, seat.y);
        people.addChild(person);
      });

      const fg = new PIXI.Sprite(fgTex);
      fg.width = ROOM_W; fg.height = ROOM_H;

      // Back-to-front: room → people → table. The table masks their lower half.
      world.addChild(bg, people, fg);

      // "Cover" the viewport and keep the world centred on resize.
      const layout = () => {
        const { width: cw, height: ch } = app.screen;
        const scale = Math.max(cw / ROOM_W, ch / ROOM_H);
        world.scale.set(scale);
        world.position.set((cw - ROOM_W * scale) / 2, (ch - ROOM_H * scale) / 2);
      };
      layout();
      app.renderer.on('resize', layout);
    })();

    return () => {
      cancelled = true;
      if (app) app.destroy(true, { children: true, texture: false });
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000' }}>
      <div ref={hostRef} style={{ position: 'absolute', inset: 0 }} />
      <div style={caption}>
        PixiJS room prototype — placeholder art. The numbered figures sit <em>behind</em> the
        table (foreground layer). Drop your real <code>background.png</code> / <code>foreground.png</code> in
        <code> /public/rooms/proto</code> to replace it.
      </div>
    </div>
  );
}

// A placeholder "person": head + body + seat number, drawn around the origin
// so the lower body falls behind the table band.
function makePerson(PIXI, n, color) {
  const c = new PIXI.Container();
  const body = new PIXI.Graphics();
  body.roundRect(-90, -80, 180, 340, 36).fill(color);
  const head = new PIXI.Graphics();
  head.circle(0, -150, 55).fill(0xdcae86);
  const label = new PIXI.Text({
    text: String(n),
    style: { fontFamily: 'system-ui, sans-serif', fontSize: 52, fontWeight: '700', fill: 0xffffff },
  });
  label.anchor.set(0.5);
  label.position.set(0, 30);
  c.addChild(body, head, label);
  return c;
}

const caption = {
  position: 'absolute', left: 16, right: 16, bottom: 16,
  fontFamily: '"IBM Plex Sans", system-ui, sans-serif', fontSize: 13, lineHeight: 1.5,
  color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.45)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 14px',
  maxWidth: 620, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
};
