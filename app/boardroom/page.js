'use client';

// app/boardroom/page.js — Global Ceilidh Boardroom, Milestone 1.
//
// A real 3D boardroom rendered in R3F. Your camera sits at YOUR chair;
// every other seat holds a placeholder "person". Switch seats and the whole
// room re-renders from that chair — that's the per-viewer perspective, the
// thing you can't get anywhere else. Milestone 2 swaps the placeholders for
// live (chroma-keyed) LiveKit video. This route is a standalone preview so
// we can iterate the scene without touching the working /rooms flow.

import { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// Warm, distinct colours so each placeholder seat reads apart.
const SEAT_COLORS = [
  '#C9A047', '#7FA6C9', '#C97F7F', '#8FB98F', '#B98FB9',
  '#C9A9A9', '#8FB9B9', '#C9B98F', '#A98FC9', '#B9A98F',
];

const CENTER = new THREE.Vector3(0, 1.0, 0);
const EYE_Y = 1.35;

// Ten chairs: four down each long side of the table, one at each end.
function useSeats() {
  return useMemo(() => {
    const seats = [];
    const longX = [-2.4, -0.8, 0.8, 2.4];
    longX.forEach((x) => seats.push({ pos: [x, 0, -1.95], face: 0 }));            // near long side
    longX.forEach((x) => seats.push({ pos: [x, 0, 1.95], face: Math.PI }));        // far long side
    seats.push({ pos: [-3.95, 0, 0], face: Math.PI / 2 });                          // head
    seats.push({ pos: [3.95, 0, 0], face: -Math.PI / 2 });                          // foot
    return seats.map((s, i) => ({ id: i + 1, color: SEAT_COLORS[i % SEAT_COLORS.length], ...s }));
  }, []);
}

// A placeholder occupant: a blocky figure that shows real 3D perspective
// from every chair (its sides read differently across the table) + a label.
function Occupant({ seat }) {
  return (
    <group position={[seat.pos[0], 0, seat.pos[2]]} rotation={[0, seat.face, 0]}>
      {/* body */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <boxGeometry args={[0.62, 0.95, 0.34]} />
        <meshStandardMaterial color={seat.color} roughness={0.6} />
      </mesh>
      {/* head */}
      <mesh position={[0, 1.98, 0]} castShadow>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial color={seat.color} roughness={0.5} />
      </mesh>
      {/* chair back, behind the figure (away from centre) */}
      <mesh position={[0, 1.15, -0.32]}>
        <boxGeometry args={[0.7, 1.1, 0.08]} />
        <meshStandardMaterial color="#2A1D12" roughness={0.8} />
      </mesh>
      <Text
        position={[0, 2.45, 0]}
        fontSize={0.22}
        color="#F2ECDC"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.012}
        outlineColor="#1A3A2A"
      >
        {`Seat ${seat.id}`}
      </Text>
    </group>
  );
}

function Table() {
  return (
    <group>
      {/* top */}
      <mesh position={[0, 1.02, 0]} receiveShadow castShadow>
        <boxGeometry args={[7, 0.14, 2.8]} />
        <meshStandardMaterial color="#5A3A22" roughness={0.35} metalness={0.05} />
      </mesh>
      {/* pedestal */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[5.4, 0.9, 1.3]} />
        <meshStandardMaterial color="#3A2616" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Room() {
  return (
    <group>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#2E2013" roughness={0.9} />
      </mesh>
      {/* ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4.2, 0]}>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color="#1A140D" roughness={1} />
      </mesh>
      {/* walls */}
      <mesh position={[0, 2.1, -6.5]}>
        <planeGeometry args={[18, 4.2]} />
        <meshStandardMaterial color="#E7DEC9" roughness={0.95} />
      </mesh>
      <mesh position={[0, 2.1, 6.5]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[18, 4.2]} />
        <meshStandardMaterial color="#DBD1B8" roughness={0.95} />
      </mesh>
      <mesh position={[-8.5, 2.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[14, 4.2]} />
        <meshStandardMaterial color="#DED4BD" roughness={0.95} />
      </mesh>
      <mesh position={[8.5, 2.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[14, 4.2]} />
        <meshStandardMaterial color="#DED4BD" roughness={0.95} />
      </mesh>
      {/* branding on the back wall */}
      <Text
        position={[0, 2.7, -6.42]}
        fontSize={0.6}
        color="#C9A047"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.12}
      >
        GLOBAL CEILIDH
      </Text>
      <Text
        position={[0, 2.0, -6.42]}
        fontSize={0.22}
        color="#1A3A2A"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.28}
      >
        AN SEÒMAR BÙIRD
      </Text>
      {/* hanging light fixture over the table */}
      <mesh position={[0, 3.4, 0]}>
        <boxGeometry args={[4, 0.12, 0.6]} />
        <meshStandardMaterial color="#C9A047" emissive="#C9A047" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

// Camera control: sit at the chosen seat, look toward the table, and let the
// mouse pan the gaze a little (parallax) so it feels like looking around from
// your chair — without leaving it.
function Rig({ seat }) {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const tmp = useMemo(() => ({
    pos: new THREE.Vector3(),
    dir: new THREE.Vector3(),
    right: new THREE.Vector3(),
    target: new THREE.Vector3(),
    up: new THREE.Vector3(0, 1, 0),
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
  const mySeat = seats[selected];
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 4]} intensity={0.5} castShadow />
      <pointLight position={[0, 3.2, 0]} intensity={0.8} color="#FBE7B8" distance={14} />
      <Room />
      <Table />
      {seats.map((s, i) => (i === selected ? null : <Occupant key={s.id} seat={s} />))}
      <Rig seat={mySeat} />
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
        camera={{ fov: 55, position: [seats[0].pos[0], EYE_Y, seats[0].pos[2]], near: 0.1, far: 100 }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <color attach="background" args={['#0E0A06']} />
        <Scene seats={seats} selected={selected} />
      </Canvas>

      <div style={titleBox}>
        <div style={titleMain}>Global Ceilidh Boardroom</div>
        <div style={titleSub}>Milestone 1 · you’re in Seat {selected + 1} — move your mouse to look around</div>
      </div>

      <div style={seatBar}>
        <span style={seatBarLabel}>Sit in:</span>
        {seats.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setSelected(i)}
            style={i === selected ? seatBtnOn : seatBtnOff}
          >
            {s.id}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── overlay styles ────────────────────────────────────────────────────
const wrap = { position: 'fixed', inset: 0, background: '#0E0A06', overflow: 'hidden' };
const titleBox = {
  position: 'absolute', top: 20, left: 22, color: '#F2ECDC', pointerEvents: 'none',
};
const titleMain = {
  fontFamily: 'var(--font-bebas-neue), "Bebas Neue", Impact, sans-serif',
  fontSize: 30, letterSpacing: '0.08em', lineHeight: 1,
};
const titleSub = {
  fontFamily: '"IBM Plex Sans", system-ui, sans-serif', fontSize: 13,
  color: '#C9A047', marginTop: 6,
};
const seatBar = {
  position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)',
  display: 'flex', alignItems: 'center', gap: 8,
  background: 'rgba(20,14,8,0.72)', border: '1px solid rgba(201,160,71,0.4)',
  borderRadius: 999, padding: '10px 16px', backdropFilter: 'blur(6px)',
};
const seatBarLabel = {
  fontFamily: '"IBM Plex Sans", system-ui, sans-serif', fontSize: 12,
  letterSpacing: 1, textTransform: 'uppercase', color: '#9A8B6E', marginRight: 4,
};
const seatBtnBase = {
  width: 34, height: 34, borderRadius: '50%', cursor: 'pointer',
  fontFamily: '"IBM Plex Mono", monospace', fontSize: 14, border: '1px solid #6B5A38',
};
const seatBtnOff = { ...seatBtnBase, background: 'transparent', color: '#C9B98F' };
const seatBtnOn = { ...seatBtnBase, background: '#C9A047', color: '#1A140D', borderColor: '#C9A047', fontWeight: 700 };
