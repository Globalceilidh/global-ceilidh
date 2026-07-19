'use client';

// app/boardroom/page.js — Global Ceilidh Boardroom, Milestone 1 (art pass).
//
// Restyled toward Scott's reference art (public/Global Ceilidh Boardroom
// North/South.png): a Highland bothy / taigh-cèilidh — stone walls, a timber
// gable roof with beams, a long communal table with benches, moody lamp-lit
// warmth, a sea-loch window, the frosted BOARD ROOM door, a whiteboard and a
// bodhrán on the walls. Camera sits at YOUR seat; switch seats and the room
// re-renders from that chair (per-viewer perspective). Milestone 2 swaps the
// placeholder occupants for chroma-keyed LiveKit video on the benches.

import { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const SEAT_COLORS = [
  '#C9A047', '#7FA6C9', '#C97F7F', '#8FB98F', '#B98FB9',
  '#C9A9A9', '#8FB9B9', '#C9B98F', '#A98FC9', '#B9A98F',
];

// Room dimensions (metres-ish). Ridge runs along X (the long table axis).
const HALF_X = 8;      // gable ends at x = ±8
const HALF_Z = 4.4;    // long walls at z = ±4.4
const EAVE_Y = 2.6;    // wall top / roof eaves
const RIDGE_Y = 4.2;   // roof ridge
const CENTER = new THREE.Vector3(0, 1.05, 0);
const EYE_Y = 1.28;

const WOOD = '#3A2616';
const STONE = '#B4AA92';
const STONE_LOW = '#2C2013';

// ── Procedural textures (canvas-drawn, no external files) ──────────────
// Not photoreal — that needs an artist-built model — but a real step up
// from flat colour: surface grain + tonal variation so stone reads as
// stone and wood as wood, with matching bump for relief under the lamps.
function makeStone() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d');
  x.fillStyle = '#B4AA92'; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 4000; i++) {
    const dark = Math.random() > 0.5;
    x.fillStyle = dark ? `rgba(70,58,44,${Math.random() * 0.14})` : `rgba(240,236,222,${Math.random() * 0.12})`;
    x.beginPath(); x.arc(Math.random() * 512, Math.random() * 512, Math.random() * 8 + 1, 0, 7); x.fill();
  }
  // faint mortar lines
  x.strokeStyle = 'rgba(40,32,22,0.18)'; x.lineWidth = 2;
  for (let gy = 64; gy < 512; gy += 90) {
    x.beginPath(); x.moveTo(0, gy + Math.random() * 8); x.lineTo(512, gy + Math.random() * 8); x.stroke();
  }
  return new THREE.CanvasTexture(c);
}
function makeWood(base) {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d');
  x.fillStyle = base; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 90; i++) {
    const y = Math.random() * 512;
    x.strokeStyle = `rgba(0,0,0,${Math.random() * 0.14})`; x.lineWidth = Math.random() * 2 + 0.4;
    x.beginPath(); x.moveTo(0, y);
    for (let px = 0; px <= 512; px += 16) x.lineTo(px, y + Math.sin(px / 38 + i) * 3);
    x.stroke();
  }
  for (let i = 0; i < 40; i++) {
    const y = Math.random() * 512;
    x.strokeStyle = `rgba(255,220,170,${Math.random() * 0.07})`; x.lineWidth = 1;
    x.beginPath(); x.moveTo(0, y);
    for (let px = 0; px <= 512; px += 20) x.lineTo(px, y + Math.sin(px / 50) * 2);
    x.stroke();
  }
  return new THREE.CanvasTexture(c);
}
let _TEX = null;
function tex() {
  if (_TEX) return _TEX;
  if (typeof document === 'undefined') return {};
  const cfg = (t, rx, ry) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return t; };
  _TEX = {
    stone: cfg(makeStone(), 3, 1.6),
    gable: cfg(makeStone(), 2, 1.6),
    floor: cfg(makeWood('#2A2013'), 10, 6),
    roof: cfg(makeWood('#241812'), 8, 2),
    tableTop: cfg(makeWood('#6A4526'), 5, 1),
    woodDark: cfg(makeWood('#3A2616'), 3, 2),
    bench: cfg(makeWood('#5A3D22'), 5, 1),
  };
  return _TEX;
}

// Ten seats: four along each bench, one at each gable end.
function useSeats() {
  return useMemo(() => {
    const seats = [];
    const benchX = [-3.3, -1.1, 1.1, 3.3];
    benchX.forEach((x) => seats.push({ pos: [x, 0, -1.7], face: 0 }));
    benchX.forEach((x) => seats.push({ pos: [x, 0, 1.7], face: Math.PI }));
    seats.push({ pos: [-5.4, 0, 0], face: Math.PI / 2 });
    seats.push({ pos: [5.4, 0, 0], face: -Math.PI / 2 });
    return seats.map((s, i) => ({ id: i + 1, color: SEAT_COLORS[i % SEAT_COLORS.length], ...s }));
  }, []);
}

function Occupant({ seat }) {
  return (
    <group position={[seat.pos[0], 0, seat.pos[2]]} rotation={[0, seat.face, 0]}>
      <mesh position={[0, 1.28, 0]} castShadow>
        <boxGeometry args={[0.6, 0.9, 0.32]} />
        <meshStandardMaterial color={seat.color} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.88, 0]} castShadow>
        <sphereGeometry args={[0.19, 24, 24]} />
        <meshStandardMaterial color={seat.color} roughness={0.5} />
      </mesh>
      <Text position={[0, 2.3, 0]} fontSize={0.2} color="#F2ECDC" anchorX="center" anchorY="middle"
        outlineWidth={0.012} outlineColor="#120C06">
        {`Seat ${seat.id}`}
      </Text>
    </group>
  );
}

function TableAndBenches() {
  const T = tex();
  return (
    <group>
      {/* long plank table */}
      <mesh position={[0, 1.0, 0]} receiveShadow castShadow>
        <boxGeometry args={[9.2, 0.12, 1.9]} />
        <meshStandardMaterial map={T.tableTop} bumpMap={T.tableTop} bumpScale={0.02} color="#9A7048" roughness={0.5} />
      </mesh>
      {/* trestle legs */}
      {[-3.8, 3.8].map((x) => (
        <mesh key={x} position={[x, 0.47, 0]}>
          <boxGeometry args={[0.5, 0.9, 1.5]} />
          <meshStandardMaterial map={T.woodDark} color="#7A6446" roughness={0.8} />
        </mesh>
      ))}
      {/* benches down each long side */}
      {[-1.7, 1.7].map((z) => (
        <mesh key={z} position={[0, 0.5, z]} castShadow>
          <boxGeometry args={[8.4, 0.1, 0.5]} />
          <meshStandardMaterial map={T.bench} bumpMap={T.bench} bumpScale={0.02} color="#8A6242" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// A loch window punched into a long wall.
function Window({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[2.4, 1.5]} />
        <meshStandardMaterial color="#9DB9C4" emissive="#8AA9B6" emissiveIntensity={0.75} />
      </mesh>
      {/* far hills strip */}
      <mesh position={[0, -0.35, 0.01]}>
        <planeGeometry args={[2.4, 0.5]} />
        <meshStandardMaterial color="#48583C" emissive="#3C4A32" emissiveIntensity={0.3} />
      </mesh>
      {/* frame */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[2.6, 1.7, 0.08]} />
        <meshStandardMaterial color={WOOD} roughness={0.9} />
      </mesh>
      {/* mullion cross */}
      <mesh position={[0, 0, 0.05]}><boxGeometry args={[0.06, 1.5, 0.06]} /><meshStandardMaterial color={WOOD} /></mesh>
      <mesh position={[0, 0, 0.05]}><boxGeometry args={[2.4, 0.06, 0.06]} /><meshStandardMaterial color={WOOD} /></mesh>
    </group>
  );
}

// A framed picture / poster — the wall-collage, gestured.
function Frame({ position, rotation, w = 0.6, h = 0.8, color = '#8A7A5A' }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, 0.02]}><boxGeometry args={[w + 0.08, h + 0.08, 0.04]} /><meshStandardMaterial color={WOOD} roughness={0.8} /></mesh>
      <mesh position={[0, 0, 0.045]}><planeGeometry args={[w, h]} /><meshStandardMaterial color={color} roughness={0.7} /></mesh>
    </group>
  );
}

function Room() {
  // roof slope geometry
  const slope = Math.atan2(RIDGE_Y - EAVE_Y, HALF_Z);
  const roofLen = Math.hypot(HALF_Z, RIDGE_Y - EAVE_Y);
  const midY = (EAVE_Y + RIDGE_Y) / 2;

  const S = THREE.DoubleSide;
  const T = tex();
  return (
    <group>
      {/* floor — worn flagstone/board */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[HALF_X * 2 + 1, HALF_Z * 2 + 1]} />
        <meshStandardMaterial map={T.floor} bumpMap={T.floor} bumpScale={0.03} color="#6A5238" roughness={0.95} />
      </mesh>

      {/* long stone walls (z = ±HALF_Z) with a dark wood wainscot */}
      {[-HALF_Z, HALF_Z].map((z) => (
        <group key={z}>
          <mesh position={[0, EAVE_Y / 2 + 0.5, z]} rotation={[0, z < 0 ? 0 : Math.PI, 0]}>
            <planeGeometry args={[HALF_X * 2, EAVE_Y + 1]} />
            <meshStandardMaterial map={T.stone} bumpMap={T.stone} bumpScale={0.04} color="#FFFFFF" roughness={0.98} side={S} />
          </mesh>
          <mesh position={[0, 0.45, z + (z < 0 ? 0.02 : -0.02)]} rotation={[0, z < 0 ? 0 : Math.PI, 0]}>
            <planeGeometry args={[HALF_X * 2, 0.9]} />
            <meshStandardMaterial map={T.woodDark} bumpMap={T.woodDark} bumpScale={0.03} color="#8A7454" roughness={0.9} side={S} />
          </mesh>
        </group>
      ))}

      {/* gable end walls (x = ±HALF_X) */}
      {[-HALF_X, HALF_X].map((x) => (
        <mesh key={x} position={[x, EAVE_Y / 2 + 0.5, 0]} rotation={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
          <planeGeometry args={[HALF_Z * 2, EAVE_Y + 1]} />
          <meshStandardMaterial map={T.gable} bumpMap={T.gable} bumpScale={0.04} color="#FFFFFF" roughness={0.98} side={S} />
        </mesh>
      ))}

      {/* gable timber roof — two slopes + ridge + tie beams */}
      <mesh position={[0, midY, HALF_Z / 2]} rotation={[-(Math.PI / 2) + slope, 0, 0]}>
        <planeGeometry args={[HALF_X * 2 + 0.6, roofLen]} />
        <meshStandardMaterial map={T.roof} bumpMap={T.roof} bumpScale={0.05} color="#B89A78" roughness={1} side={S} />
      </mesh>
      <mesh position={[0, midY, -HALF_Z / 2]} rotation={[(Math.PI / 2) - slope, 0, 0]}>
        <planeGeometry args={[HALF_X * 2 + 0.6, roofLen]} />
        <meshStandardMaterial map={T.roof} bumpMap={T.roof} bumpScale={0.05} color="#B89A78" roughness={1} side={S} />
      </mesh>
      <mesh position={[0, RIDGE_Y, 0]}>
        <boxGeometry args={[HALF_X * 2 + 0.6, 0.2, 0.2]} />
        <meshStandardMaterial map={T.woodDark} color="#8A7454" roughness={0.9} />
      </mesh>
      {[-6, -3, 0, 3, 6].map((x) => (
        <mesh key={x} position={[x, EAVE_Y + 0.05, 0]}>
          <boxGeometry args={[0.16, 0.16, HALF_Z * 2]} />
          <meshStandardMaterial map={T.woodDark} color="#8A7454" roughness={0.9} />
        </mesh>
      ))}

      {/* frosted BOARD ROOM door on the far gable end (x = +HALF_X) */}
      <group position={[HALF_X - 0.02, 1.35, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0, -0.04]}><boxGeometry args={[1.5, 2.7, 0.08]} /><meshStandardMaterial color={WOOD} roughness={0.85} /></mesh>
        <mesh><planeGeometry args={[1.15, 2.2]} /><meshStandardMaterial color="#CBD1CC" emissive="#AEB6B0" emissiveIntensity={0.5} roughness={0.4} /></mesh>
        <Text position={[0, 0.55, 0.02]} fontSize={0.17} color="#20302A" anchorX="center" anchorY="middle" letterSpacing={0.05} textAlign="center" maxWidth={1.1}>
          GLOBAL CEILIDH{'\n'}BOARD ROOM
        </Text>
        <Text position={[0, -0.15, 0.02]} fontSize={0.085} color="#3A4A42" anchorX="center" anchorY="middle" textAlign="center" maxWidth={1.0}>
          QUIET PLEASE — MEETING IN PROGRESS
        </Text>
      </group>

      {/* whiteboard + bodhrán on the near long wall (z = +HALF_Z) */}
      <group position={[0, 0, HALF_Z - 0.03]} rotation={[0, Math.PI, 0]}>
        <group position={[2.6, 1.85, 0]}>
          <mesh position={[0, 0, -0.02]}><boxGeometry args={[1.9, 1.3, 0.05]} /><meshStandardMaterial color="#6A583A" /></mesh>
          <mesh><planeGeometry args={[1.75, 1.15]} /><meshStandardMaterial color="#EEECE4" roughness={0.5} /></mesh>
        </group>
        {/* bodhrán */}
        <group position={[-2.8, 1.95, 0]}>
          <mesh><circleGeometry args={[0.52, 40]} /><meshStandardMaterial color="#CBA36B" roughness={0.85} /></mesh>
          <mesh position={[0, 0, 0.01]}><torusGeometry args={[0.52, 0.05, 12, 40]} /><meshStandardMaterial color={WOOD} /></mesh>
          <mesh position={[0, 0, 0.02]}><boxGeometry args={[0.9, 0.05, 0.05]} /><meshStandardMaterial color={WOOD} /></mesh>
        </group>
      </group>

      {/* loch windows on the long walls */}
      <Window position={[-3.6, 1.7, -HALF_Z + 0.04]} rotation={[0, 0, 0]} />
      <Window position={[3.4, 1.7, HALF_Z - 0.04]} rotation={[0, Math.PI, 0]} />

      {/* scattered framed pictures — the living wall */}
      <Frame position={[-5.2, 1.9, -HALF_Z + 0.05]} rotation={[0, 0, 0]} w={0.7} h={0.55} color="#5B6E7A" />
      <Frame position={[-1.2, 2.1, -HALF_Z + 0.05]} rotation={[0, 0, 0]} w={0.5} h={0.65} color="#7A6A4A" />
      <Frame position={[1.6, 1.85, -HALF_Z + 0.05]} rotation={[0, 0, 0]} w={0.55} h={0.55} color="#6E5E44" />
      <Frame position={[5.0, 1.95, -HALF_Z + 0.05]} rotation={[0, 0, 0]} w={0.6} h={0.75} color="#4A5A3A" />
      <Frame position={[-5.0, 1.7, HALF_Z - 0.05]} rotation={[0, Math.PI, 0]} w={0.6} h={0.7} color="#6B5B44" />
      <Frame position={[5.2, 2.0, HALF_Z - 0.05]} rotation={[0, Math.PI, 0]} w={0.55} h={0.6} color="#5B6E7A" />

      {/* GC branding, carved on the near gable end (x = -HALF_X) */}
      <Text position={[-HALF_X + 0.05, 2.7, 0]} rotation={[0, Math.PI / 2, 0]} fontSize={0.34}
        color="#C9A047" anchorX="center" anchorY="middle" letterSpacing={0.12}>
        AN SEÒMAR BÙIRD
      </Text>
    </group>
  );
}

function Lamps() {
  return (
    <group>
      {/* two pendant lamps over the table */}
      {[-2.6, 2.6].map((x) => (
        <group key={x} position={[x, 2.5, 0]}>
          <mesh position={[0, 0.35, 0]}><cylinderGeometry args={[0.02, 0.02, 0.7]} /><meshStandardMaterial color="#111" /></mesh>
          <mesh><coneGeometry args={[0.28, 0.28, 24, 1, true]} /><meshStandardMaterial color="#1A1A1A" side={THREE.DoubleSide} /></mesh>
          <mesh position={[0, -0.02, 0]}><sphereGeometry args={[0.08, 16, 16]} /><meshStandardMaterial color="#FFD9A0" emissive="#FFC070" emissiveIntensity={2} /></mesh>
          <pointLight position={[0, -0.1, 0]} intensity={0.9} distance={9} decay={2} color="#FFB86B" castShadow />
        </group>
      ))}
      {/* warm desk-lamp glows near the side counters */}
      <pointLight position={[-5.6, 1.3, -3.6]} intensity={0.5} distance={5} color="#FFB060" />
      <pointLight position={[5.6, 1.3, 3.6]} intensity={0.5} distance={5} color="#FFB060" />
    </group>
  );
}

function Rig({ seat }) {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const tmp = useMemo(() => ({
    pos: new THREE.Vector3(), dir: new THREE.Vector3(),
    right: new THREE.Vector3(), target: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0),
  }), []);

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame(() => {
    tmp.pos.set(seat.pos[0], EYE_Y, seat.pos[2]);
    camera.position.lerp(tmp.pos, 0.12);
    tmp.dir.subVectors(CENTER, camera.position).normalize();
    tmp.right.crossVectors(tmp.dir, tmp.up).normalize();
    tmp.target.copy(CENTER)
      .addScaledVector(tmp.right, mouse.current.x * 1.8)
      .addScaledVector(tmp.up, -mouse.current.y * 0.9);
    camera.lookAt(tmp.target);
  });
  return null;
}

function Scene({ seats, selected }) {
  return (
    <>
      <ambientLight intensity={0.32} color="#FFE6C4" />
      <directionalLight position={[-6, 5, -3]} intensity={0.25} color="#AEC4D0" />
      <Room />
      <TableAndBenches />
      <Lamps />
      {seats.map((s, i) => (i === selected ? null : <Occupant key={s.id} seat={s} />))}
      <Rig seat={seats[selected]} />
    </>
  );
}

export default function BoardroomPage() {
  const seats = useSeats();
  const [selected, setSelected] = useState(0);

  return (
    <div style={wrap}>
      <Canvas
        shadows
        camera={{ fov: 58, position: [seats[0].pos[0], EYE_Y, seats[0].pos[2]], near: 0.1, far: 100 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.08 }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <color attach="background" args={['#0B0805']} />
        <fog attach="fog" args={['#0B0805', 9, 22]} />
        <Scene seats={seats} selected={selected} />
      </Canvas>

      {/* cinematic vignette — darkens the corners for depth */}
      <div style={vignette} />

      <div style={titleBox}>
        <div style={titleMain}>Global Ceilidh Boardroom</div>
        <div style={titleSub}>An Seòmar Bùird · you’re in Seat {selected + 1} — move your mouse to look around</div>
      </div>

      <div style={seatBar}>
        <span style={seatBarLabel}>Sit in:</span>
        {seats.map((s, i) => (
          <button key={s.id} onClick={() => setSelected(i)} style={i === selected ? seatBtnOn : seatBtnOff}>
            {s.id}
          </button>
        ))}
      </div>
    </div>
  );
}

const wrap = { position: 'fixed', inset: 0, background: '#0B0805', overflow: 'hidden' };
const vignette = {
  position: 'absolute', inset: 0, pointerEvents: 'none',
  background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)',
};
const titleBox = { position: 'absolute', top: 20, left: 22, color: '#F2ECDC', pointerEvents: 'none' };
const titleMain = { fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif', fontSize: 30, letterSpacing: '0.08em', lineHeight: 1 };
const titleSub = { fontFamily: '"IBM Plex Sans", system-ui, sans-serif', fontSize: 13, color: '#C9A047', marginTop: 6 };
const seatBar = {
  position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)',
  display: 'flex', alignItems: 'center', gap: 8,
  background: 'rgba(20,14,8,0.72)', border: '1px solid rgba(201,160,71,0.4)',
  borderRadius: 999, padding: '10px 16px', backdropFilter: 'blur(6px)',
};
const seatBarLabel = { fontFamily: '"IBM Plex Sans", system-ui, sans-serif', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: '#9A8B6E', marginRight: 4 };
const seatBtnBase = { width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', fontFamily: '"IBM Plex Mono", monospace', fontSize: 14, border: '1px solid #6B5A38' };
const seatBtnOff = { ...seatBtnBase, background: 'transparent', color: '#C9B98F' };
const seatBtnOn = { ...seatBtnBase, background: '#C9A047', color: '#1A140D', borderColor: '#C9A047', fontWeight: 700 };
