'use client'

// Drag-to-rotate interaction for the cylinder gallery. Captures mouse and
// touch input on a wrapper element. Horizontal drag rotates the cylinder
// around its Y axis; vertical drag pitches the camera up/down so the
// viewer can look at upper/lower rows of tiles. Both decay with momentum
// after release so the scene coasts instead of freezing mid-drag.
//
// Returns:
//   rotationY   — cylinder Y rotation in radians (yaw, drives gallery group)
//   pitch       — camera X rotation in radians, clamped to ±MAX_PITCH
//   mouseUv     — { x, y } in 0..1 (drives vortex shader's mouse uniform)
//   bind        — props to spread onto the wrapper div
//   isDragging  — boolean for cursor + UI affordances

import { useRef, useState, useEffect, useCallback } from 'react'

const ROTATION_PER_PIXEL = 0.005   // horizontal drag → yaw radians (FREE — full 360°)
const PITCH_PER_PIXEL    = 0.005   // vertical drag → pitch radians
const MOMENTUM_DECAY     = 0.94    // velocity multiplier per frame after release
// Sphere: pitch clamp generous because there are no caps, just polar
// thin bands beyond the tile rings. Past ~70° tiles get upside-down.
const MAX_PITCH = 1.25             // ~72°

export function useCylinderControls() {
  const [rotationY, setRotationY] = useState(0)
  const [pitch, setPitch] = useState(0)
  const [mouseUv, setMouseUv] = useState({ x: 0.5, y: 0.5 })
  const [isDragging, setIsDragging] = useState(false)

  const dragStateRef = useRef({
    active: false,
    lastX: 0,
    lastY: 0,
    velocityX: 0,
    velocityY: 0,
  })

  // Decay both yaw and pitch momentum after release. Pitch is clamped
  // so tiles never flip upside-down.
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const ds = dragStateRef.current
      if (!ds.active) {
        if (Math.abs(ds.velocityX) > 0.0001) {
          setRotationY((r) => r + ds.velocityX)
          ds.velocityX *= MOMENTUM_DECAY
        }
        if (Math.abs(ds.velocityY) > 0.0001) {
          setPitch((p) => clamp(p + ds.velocityY, -MAX_PITCH, MAX_PITCH))
          ds.velocityY *= MOMENTUM_DECAY
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const onPointerDown = useCallback((e) => {
    const ds = dragStateRef.current
    ds.active = true
    ds.lastX = e.clientX
    ds.lastY = e.clientY
    ds.velocityX = 0
    ds.velocityY = 0
    setIsDragging(true)
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMouseUv({
      x: (e.clientX - rect.left) / rect.width,
      y: 1 - (e.clientY - rect.top) / rect.height,
    })

    const ds = dragStateRef.current
    if (!ds.active) return
    const dx = e.clientX - ds.lastX
    ds.lastX = e.clientX
    ds.lastY = e.clientY

    // Camera is locked to the horizon — only horizontal drag does work.
    // Vertical drag is intentionally ignored (no pitch, no gyroscope).
    const deltaYaw = -dx * ROTATION_PER_PIXEL
    ds.velocityX = deltaYaw
    ds.velocityY = 0
    setRotationY((r) => r + deltaYaw)
  }, [])

  const onPointerUp = useCallback((e) => {
    const ds = dragStateRef.current
    ds.active = false
    setIsDragging(false)
    e.currentTarget.releasePointerCapture?.(e.pointerId)
  }, [])

  const bind = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onPointerLeave: () => {
      if (!dragStateRef.current.active) {
        setMouseUv({ x: 0.5, y: 0.5 })
      }
    },
    style: { touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab' },
  }

  return { rotationY, pitch, mouseUv, isDragging, bind }
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }
