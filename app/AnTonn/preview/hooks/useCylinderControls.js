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

const ROTATION_PER_PIXEL = 0.005   // horizontal drag → yaw radians
const PITCH_PER_PIXEL    = 0.005   // vertical drag → pitch radians (was 0.004 — bumped a touch)
const MOMENTUM_DECAY     = 0.94    // velocity multiplier per frame after release
// No clamp on pitch — Scott explicitly wants full 360° vertical, same as
// horizontal. Camera flips upside-down past ±90° which is intentional;
// the marble-inside feel is the goal.

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

  // Decay both yaw and pitch momentum after release. No clamp on pitch —
  // full freedom to spin all the way around vertically.
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
          setPitch((p) => p + ds.velocityY)
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
    const dy = e.clientY - ds.lastY
    ds.lastX = e.clientX
    ds.lastY = e.clientY

    const deltaYaw = -dx * ROTATION_PER_PIXEL  // left-drag turns left
    const deltaPitch = -dy * PITCH_PER_PIXEL    // drag down → look down (negative pitch)
    ds.velocityX = deltaYaw
    ds.velocityY = deltaPitch
    setRotationY((r) => r + deltaYaw)
    setPitch((p) => p + deltaPitch)
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
