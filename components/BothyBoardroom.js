'use client';

// components/BothyBoardroom.js
// The shared 3D bothy boardroom scene (Highland taigh-cèilidh). Used both by
// the /boardroom preview and by the live Ceilidh Room 3D view. Takes an
// `occupants` list — each { seatIndex, name, videoEl } drops a live video
// (or a placeholder) onto that chair. Camera is an observer over the table by
// default; click a seat to sit in it (per-viewer perspective).

import { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const HALF_X = 8, HALF_Z = 4.4, EAVE_Y = 2.6, RIDGE_Y = 4.2;
const CENTER = new THREE.Vector3(0, 1.05, 0);
const EYE_Y = 1.28;
const OBSERVER = new THREE.Vector3(-6.6, 2.05, 0); // establishing view down the table
const WOOD = '#3A2616';

// ── procedural textures ───────────────────────────────────────────────
function makeStone() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d');
  x.fillStyle = '#B4AA92'; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 4000; i++) {
    const d = Math.random() > 0.5;
    x.fillStyle = d ? `rgba(70,58,44,${Math.random() * 0.14})` : `rgba(240,236,222,${Math.random() * 0.12})`;
    x.beginPath(); x.arc(Math.random() * 512, Math.random() * 512, Math.random() * 8 + 1, 0, 7); x.fill();
  }
  x.strokeStyle = 'rgba(40,32,22,0.18)'; x.lineWidth = 2;
  for (let gy = 64; gy < 512; gy += 90) { x.beginPath(); x.moveTo(0, gy); x.lineTo(512, gy + Math.random() * 8); x.stroke(); }
  return new THREE.CanvasTexture(c);
}
function makeWood(base) {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const x = c.getContext('2d');
  x.fillStyle = base; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 90; i++) {
    const y = Math.random() * 512; x.strokeStyle = `rgba(0,0,0,${Math.random() * 0.14})`; x.lineWidth = Math.random() * 2 + 0.4;
    x.beginPath(); x.moveTo(0, y); for (let px = 0; px <= 512; px += 16) x.lineTo(px, y + Math.sin(px / 38 + i) * 3); x.stroke();
  }
  return new THREE.CanvasTexture(c);
}
let _T = null;
function tex() {
  if (_T) return _T;
  if (typeof document === 'undefined') return {};
  const cfg = (t, rx, ry) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return t; };
  _T = {
    stone: cfg(makeStone(), 3, 1.6), gable: cfg(makeStone(), 2, 1.6),
    floor: cfg(makeWood('#2A2013'), 10, 6), roof: cfg(makeWood('#241812'), 8, 2),
    tableTop: cfg(makeWood('#6A4526'), 5, 1), woodDark: cfg(makeWood('#3A2616'), 3, 2),
    bench: cfg(makeWood('#5A3D22'), 5, 1),
  };
  return _T;
}

// Ten seats: four per bench, one at each gable end.
export function useSeats() {
  return useMemo(() => {
    const seats = [];
    const bx = [-3.3, -1.1, 1.1, 3.3];
    bx.forEach((x) => seats.push({ pos: [x, 0, -1.7], face: 0 }));
    bx.forEach((x) => seats.push({ pos: [x, 0, 1.7], face: Math.PI }));
    seats.push({ pos: [-5.4, 0, 0], face: Math.PI / 2 });
    seats.push({ pos: [5.4, 0, 0], face: -Math.PI / 2 });
    return seats.map((s, i) => ({ id: i + 1, ...s }));
  }, []);
}

function World() {
  const slope = Math.atan2(RIDGE_Y - EAVE_Y, HALF_Z);
  const roofLen = Math.hypot(HALF_Z, RIDGE_Y - EAVE_Y);
  const midY = (EAVE_Y + RIDGE_Y) / 2;
  const S = THREE.DoubleSide, T = tex();
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[HALF_X * 2 + 1, HALF_Z * 2 + 1]} />
        <meshStandardMaterial map={T.floor} bumpMap={T.floor} bumpScale={0.03} color="#6A5238" roughness={0.95} />
      </mesh>
      {[-HALF_Z, HALF_Z].map((z) => (
        <group key={z}>
          <mesh position={[0, EAVE_Y / 2 + 0.5, z]} rotation={[0, z < 0 ? 0 : Math.PI, 0]}>
            <planeGeometry args={[HALF_X * 2, EAVE_Y + 1]} />
            <meshStandardMaterial map={T.stone} bumpMap={T.stone} bumpScale={0.04} roughness={0.98} side={S} />
          </mesh>
          <mesh position={[0, 0.45, z + (z < 0 ? 0.02 : -0.02)]} rotation={[0, z < 0 ? 0 : Math.PI, 0]}>
            <planeGeometry args={[HALF_X * 2, 0.9]} />
            <meshStandardMaterial map={T.woodDark} color="#8A7454" roughness={0.9} side={S} />
          </mesh>
        </group>
      ))}
      {[-HALF_X, HALF_X].map((x) => (
        <mesh key={x} position={[x, EAVE_Y / 2 + 0.5, 0]} rotation={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
          <planeGeometry args={[HALF_Z * 2, EAVE_Y + 1]} />
          <meshStandardMaterial map={T.gable} bumpMap={T.gable} bumpScale={0.04} roughness={0.98} side={S} />
        </mesh>
      ))}
      <mesh position={[0, midY, HALF_Z / 2]} rotation={[-(Math.PI / 2) + slope, 0, 0]}>
        <planeGeometry args={[HALF_X * 2 + 0.6, roofLen]} />
        <meshStandardMaterial map={T.roof} color="#B89A78" roughness={1} side={S} />
      </mesh>
      <mesh position={[0, midY, -HALF_Z / 2]} rotation={[(Math.PI / 2) - slope, 0, 0]}>
        <planeGeometry args={[HALF_X * 2 + 0.6, roofLen]} />
        <meshStandardMaterial map={T.roof} color="#B89A78" roughness={1} side={S} />
      </mesh>
      <mesh position={[0, RIDGE_Y, 0]}><boxGeometry args={[HALF_X * 2 + 0.6, 0.2, 0.2]} /><meshStandardMaterial map={T.woodDark} color="#8A7454" /></mesh>
      {[-6, -3, 0, 3, 6].map((x) => (
        <mesh key={x} position={[x, EAVE_Y + 0.05, 0]}><boxGeometry args={[0.16, 0.16, HALF_Z * 2]} /><meshStandardMaterial map={T.woodDark} color="#8A7454" /></mesh>
      ))}
      {/* door */}
      <group position={[HALF_X - 0.02, 1.35, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0, -0.04]}><boxGeometry args={[1.5, 2.7, 0.08]} /><meshStandardMaterial color={WOOD} /></mesh>
        <mesh><planeGeometry args={[1.15, 2.2]} /><meshStandardMaterial color="#CBD1CC" emissive="#AEB6B0" emissiveIntensity={0.5} /></mesh>
        <Text position={[0, 0.5, 0.02]} fontSize={0.16} color="#20302A" anchorX="center" anchorY="middle" textAlign="center" maxWidth={1.1}>
          GLOBAL CEILIDH{'\n'}BOARD ROOM
        </Text>
      </group>
      {/* whiteboard + bodhrán */}
      <group position={[0, 0, HALF_Z - 0.03]} rotation={[0, Math.PI, 0]}>
        <group position={[2.6, 1.85, 0]}>
          <mesh position={[0, 0, -0.02]}><boxGeometry args={[1.9, 1.3, 0.05]} /><meshStandardMaterial color="#6A583A" /></mesh>
          <mesh><planeGeometry args={[1.75, 1.15]} /><meshStandardMaterial color="#EEECE4" /></mesh>
        </group>
        <group position={[-2.8, 1.95, 0]}>
          <mesh><circleGeometry args={[0.52, 40]} /><meshStandardMaterial color="#CBA36B" /></mesh>
          <mesh position={[0, 0, 0.01]}><torusGeometry args={[0.52, 0.05, 12, 40]} /><meshStandardMaterial color={WOOD} /></mesh>
        </group>
      </group>
      <Text position={[-HALF_X + 0.05, 2.7, 0]} rotation={[0, Math.PI / 2, 0]} fontSize={0.32} color="#C9A047" anchorX="center" anchorY="middle" letterSpacing={0.12}>
        AN SEÒMAR BÙIRD
      </Text>
    </group>
  );
}

function Lamps() {
  return (
    <group>
      {[-2.6, 2.6].map((x) => (
        <group key={x} position={[x, 2.5, 0]}>
          <mesh><coneGeometry args={[0.28, 0.28, 24, 1, true]} /><meshStandardMaterial color="#1A1A1A" side={THREE.DoubleSide} /></mesh>
          <mesh position={[0, -0.02, 0]}><sphereGeometry args={[0.08, 16, 16]} /><meshStandardMaterial color="#FFD9A0" emissive="#FFC070" emissiveIntensity={2} /></mesh>
          <pointLight position={[0, -0.1, 0]} intensity={0.9} distance={9} decay={2} color="#FFB86B" />
        </group>
      ))}
      <pointLight position={[-5.6, 1.3, -3.6]} intensity={0.5} distance={5} color="#FFB060" />
      <pointLight position={[5.6, 1.3, 3.6]} intensity={0.5} distance={5} color="#FFB060" />
    </group>
  );
}

function TableAndBenches() {
  const T = tex();
  return (
    <group>
      <mesh position={[0, 1.0, 0]} receiveShadow castShadow>
        <boxGeometry args={[9.2, 0.12, 1.9]} />
        <meshStandardMaterial map={T.tableTop} color="#9A7048" roughness={0.5} />
      </mesh>
      {[-3.8, 3.8].map((x) => (
        <mesh key={x} position={[x, 0.47, 0]}><boxGeometry args={[0.5, 0.9, 1.5]} /><meshStandardMaterial map={T.woodDark} color="#7A6446" /></mesh>
      ))}
      {[-1.7, 1.7].map((z) => (
        <mesh key={z} position={[0, 0.5, z]}><boxGeometry args={[8.4, 0.1, 0.5]} /><meshStandardMaterial map={T.bench} color="#8A6242" /></mesh>
      ))}
    </group>
  );
}

// A seat: live video plane if we have a videoEl, else a lit nameplate.
function Seat({ seat, occupant }) {
  const videoTex = useMemo(() => {
    if (!occupant?.videoEl) return null;
    const t = new THREE.VideoTexture(occupant.videoEl);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [occupant?.videoEl]);

  useEffect(() => () => { if (videoTex) videoTex.dispose(); }, [videoTex]);

  if (!occupant) {
    // empty chair — a low stool block so the seat reads as available
    return (
      <mesh position={[seat.pos[0], 0.62, seat.pos[2]]}>
        <boxGeometry args={[0.44, 0.24, 0.44]} />
        <meshStandardMaterial color="#4A3524" roughness={0.8} />
      </mesh>
    );
  }

  return (
    <group position={[seat.pos[0], 0, seat.pos[2]]} rotation={[0, seat.face, 0]}>
      {/* framed live feed */}
      <mesh position={[0, 1.5, 0.02]}>
        <planeGeometry args={[0.92, 0.62]} />
        {videoTex
          ? <meshBasicMaterial map={videoTex} toneMapped={false} />
          : <meshStandardMaterial color="#243024" emissive="#243024" emissiveIntensity={0.3} />}
      </mesh>
      {/* wood frame */}
      <mesh position={[0, 1.5, 0]}><boxGeometry args={[1.02, 0.72, 0.06]} /><meshStandardMaterial color={WOOD} roughness={0.8} /></mesh>
      {/* little warm key light on the face */}
      <pointLight position={[0, 1.7, 0.5]} intensity={0.35} distance={2.2} color="#FFE0B0" />
      <Text position={[0, 1.08, 0.05]} fontSize={0.15} color="#F2ECDC" anchorX="center" anchorY="middle" outlineWidth={0.01} outlineColor="#120C06">
        {occupant.name}{occupant.isLocal ? ' (you)' : ''}
      </Text>
    </group>
  );
}

function Rig({ target }) {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const tmp = useMemo(() => ({ pos: new THREE.Vector3(), dir: new THREE.Vector3(), right: new THREE.Vector3(), tgt: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0) }), []);
  useEffect(() => {
    const onMove = (e) => { mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1; mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1; };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
  useFrame(() => {
    tmp.pos.set(target[0], target[1], target[2]);
    camera.position.lerp(tmp.pos, 0.1);
    tmp.dir.subVectors(CENTER, camera.position).normalize();
    tmp.right.crossVectors(tmp.dir, tmp.up).normalize();
    tmp.tgt.copy(CENTER).addScaledVector(tmp.right, mouse.current.x * 1.6).addScaledVector(tmp.up, -mouse.current.y * 0.8);
    camera.lookAt(tmp.tgt);
  });
  return null;
}

// occupants: [{ seatIndex, name, videoEl, isLocal }]
export default function BothyCanvas({ occupants = [] }) {
  const seats = useSeats();
  const [seatIdx, setSeatIdx] = useState(null); // null = observer
  const bySeat = useMemo(() => {
    const m = {};
    occupants.forEach((o) => { if (o.seatIndex != null) m[o.seatIndex] = o; });
    return m;
  }, [occupants]);

  const target = seatIdx == null
    ? [OBSERVER.x, OBSERVER.y, OBSERVER.z]
    : [seats[seatIdx].pos[0], EYE_Y, seats[seatIdx].pos[2]];

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0B0805' }}>
      <Canvas shadows camera={{ fov: 58, position: [OBSERVER.x, OBSERVER.y, OBSERVER.z], near: 0.1, far: 100 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.08 }}
        style={{ position: 'absolute', inset: 0 }}>
        <color attach="background" args={['#0B0805']} />
        <fog attach="fog" args={['#0B0805', 10, 24]} />
        <ambientLight intensity={0.34} color="#FFE6C4" />
        <directionalLight position={[-6, 5, -3]} intensity={0.25} color="#AEC4D0" />
        <World />
        <TableAndBenches />
        <Lamps />
        {seats.map((s, i) => (
          // don't draw your own feed on your chair when you're sitting in it
          seatIdx === i ? null : <Seat key={s.id} seat={s} occupant={bySeat[i]} />
        ))}
        <Rig target={target} />
      </Canvas>

      <div style={bar}>
        <button style={seatIdx == null ? onBtn : offBtn} onClick={() => setSeatIdx(null)}>Observer</button>
        {seats.map((s, i) => (
          <button key={s.id} style={seatIdx === i ? onBtn : offBtn} onClick={() => setSeatIdx(i)}>{s.id}</button>
        ))}
      </div>
    </div>
  );
}

const bar = {
  position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
  display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', maxWidth: '92vw', justifyContent: 'center',
  background: 'rgba(20,14,8,0.72)', border: '1px solid rgba(201,160,71,0.4)', borderRadius: 999, padding: '8px 14px', backdropFilter: 'blur(6px)',
};
const btnBase = { minWidth: 32, height: 32, padding: '0 10px', borderRadius: 999, cursor: 'pointer', fontFamily: '"IBM Plex Mono", monospace', fontSize: 13, border: '1px solid #6B5A38' };
const offBtn = { ...btnBase, background: 'transparent', color: '#C9B98F' };
const onBtn = { ...btnBase, background: '#C9A047', color: '#1A140D', borderColor: '#C9A047', fontWeight: 700 };
