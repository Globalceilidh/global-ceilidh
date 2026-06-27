'use client'

// Drag-to-rotate interaction for the cylinder gallery. Captures mouse and
// touch input on a wrapper element, translates X movement into Y-axis
// rotation, decays momentum to a stop. Also reports normalised mouse
// position for the vortex shader (which subtly tracks the cursor).
//
// Returns:
//   rotation     — current cylinder Y rotation in radians (drives gallery)
//   mouseUv      — { x, y } in 0..1 (drives vortex shader's mouse uniform)
//   bind         — props to spread onto the wrapper div
//   isDragging   — boolean for cursor + UI affordances

import { useRef, useState, useEffect, useCallback } from 'react'

const ROTATION_PER_PIXEL = 0.005   // how fast a drag rotates the cylinder
const MOMENTUM_DECAY = 0.94        // velocity multiplier per frame after release

export function useCylinderControls() {
  const [rotation, setRotation] = useState(0)
  const [mouseUv, setMouseUv] = useState({ x: 0.5, y: 0.5 })
  const [isDragging, setIsDragging] = useState(false)

  const dragStateRef = useRef({
    active: false,
    lastX: 0,
    velocity: 0,
  })

  // Decay momentum after release so the cylinder coasts to a stop rather
  // than freezing mid-drag.
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const ds = dragStateRef.current
      if (!ds.active && Math.abs(ds.velocity) > 0.0001) {
        setRotation((r) => r + ds.velocity)
        ds.velocity *= MOMENTUM_DECAY
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
    ds.velocity = 0
    setIsDragging(true)
    // Capture so we keep getting events even if pointer leaves the element
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMouseUv({
      x: (e.clientX - rect.left) / rect.width,
      // Y inverted to match shader expectation (top = 1, bottom = 0)
      y: 1 - (e.clientY - rect.top) / rect.height,
    })

    const ds = dragStateRef.current
    if (!ds.active) return
    const dx = e.clientX - ds.lastX
    ds.lastX = e.clientX
    const delta = -dx * ROTATION_PER_PIXEL  // negative so left-drag turns left
    ds.velocity = delta
    setRotation((r) => r + delta)
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
    onPointerLeave: (e) => {
      // Don't end the drag on leave — we have pointer capture. But do clear
      // the mouse-tracking uv when not dragging so the shader settles.
      if (!dragStateRef.current.active) {
        setMouseUv({ x: 0.5, y: 0.5 })
      }
    },
    style: { touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab' },
  }

  return { rotation, mouseUv, isDragging, bind }
}
