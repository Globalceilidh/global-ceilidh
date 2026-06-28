'use client'

// Camera is locked. Only the wall moves.
//
// Click + drag in any direction translates the wall: horizontal drag
// rotates the cylinder around its Y axis (yaw → rotationY), vertical
// drag slides the wall up/down the cylinder axis (yOffset). Both axes
// have natural inertia decay after release; both wrap (rotation via
// the cylinder's natural 2π wrap, yOffset via per-cell modulo in the
// gallery).
//
// `mouseUv` tracks the bare cursor position for the vortex shader so the
// background reacts to hover without click.

import { useRef, useState, useEffect, useCallback } from 'react'

const ROTATION_PER_PIXEL = 0.005
const Y_PER_PIXEL        = 0.018
const MOMENTUM_DECAY     = 0.94

export function useCylinderControls() {
  const [rotationY, setRotationY] = useState(0)
  const [yOffset, setYOffset]     = useState(0)
  const [mouseUv, setMouseUv]     = useState({ x: 0.5, y: 0.5 })
  const [isDragging, setIsDragging] = useState(false)

  const dragStateRef = useRef({
    active: false,
    lastX: 0,
    lastY: 0,
    velocityX: 0,
    velocityY: 0,
  })

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
          setYOffset((y) => y + ds.velocityY)
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

    // Drag right → wall moves right (rotation around +Y negative because
    // of the cylinder convention; matches earlier behaviour).
    const deltaYaw = -dx * ROTATION_PER_PIXEL
    // Drag down → wall moves down (yOffset positive shifts cells +Y,
    // which is "up" in world; so we negate dy to make down feel right).
    const deltaY   = -dy * Y_PER_PIXEL
    ds.velocityX = deltaYaw
    ds.velocityY = deltaY
    setRotationY((r) => r + deltaYaw)
    setYOffset((y) => y + deltaY)
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

  // `pitch` kept in the returned shape so CylinderClient's existing
  // <CameraPitch> prop wiring keeps compiling — value is always 0.
  return { rotationY, yOffset, pitch: 0, mouseUv, isDragging, bind }
}
