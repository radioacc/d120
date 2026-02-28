import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Generate a marble-like texture procedurally on a canvas
function createMarbleTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  // Deep teal base
  const base = ctx.createLinearGradient(0, 0, size, size)
  base.addColorStop(0.0, '#0d3d30')
  base.addColorStop(0.3, '#1a5c4a')
  base.addColorStop(0.6, '#2d7a65')
  base.addColorStop(0.8, '#1a4a5c')
  base.addColorStop(1.0, '#0a2030')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, size, size)

  // Marble veins — multiple sinusoidal streaks
  function vein(x0, y0, x1, y1, color, alpha, width) {
    const grad = ctx.createLinearGradient(x0, y0, x1, y1)
    grad.addColorStop(0,   `rgba(${color},0)`)
    grad.addColorStop(0.3, `rgba(${color},${alpha})`)
    grad.addColorStop(0.7, `rgba(${color},${alpha * 0.7})`)
    grad.addColorStop(1,   `rgba(${color},0)`)
    ctx.beginPath()
    ctx.strokeStyle = grad
    ctx.lineWidth = width
    ctx.moveTo(x0, y0)
    // Wavy bezier
    ctx.bezierCurveTo(
      x0 + (x1 - x0) * 0.3 + (Math.random() - 0.5) * 80,
      y0 + (y1 - y0) * 0.2 + (Math.random() - 0.5) * 80,
      x0 + (x1 - x0) * 0.7 + (Math.random() - 0.5) * 80,
      y0 + (y1 - y0) * 0.8 + (Math.random() - 0.5) * 80,
      x1, y1
    )
    ctx.stroke()
  }

  // Light teal veins
  for (let i = 0; i < 12; i++) {
    vein(
      Math.random() * size, Math.random() * size,
      Math.random() * size, Math.random() * size,
      '100,200,170', 0.35 + Math.random() * 0.25,
      1 + Math.random() * 3
    )
  }
  // Blue-teal deep veins
  for (let i = 0; i < 8; i++) {
    vein(
      Math.random() * size, Math.random() * size,
      Math.random() * size, Math.random() * size,
      '60,130,160', 0.3 + Math.random() * 0.2,
      1 + Math.random() * 2
    )
  }
  // Dark shadow veins
  for (let i = 0; i < 6; i++) {
    vein(
      Math.random() * size, Math.random() * size,
      Math.random() * size, Math.random() * size,
      '10,40,30', 0.5,
      2 + Math.random() * 4
    )
  }
  // Bright highlight wisps
  for (let i = 0; i < 5; i++) {
    vein(
      Math.random() * size, Math.random() * size,
      Math.random() * size, Math.random() * size,
      '180,240,210', 0.15 + Math.random() * 0.15,
      0.5 + Math.random() * 1.5
    )
  }

  // Add numbers scattered across the texture
  ctx.font = 'bold 14px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const nums = [1,7,12,18,23,29,34,38,44,50,55,61,67,72,76,81,88,92,97,103,108,114,119,120]
  nums.forEach(n => {
    const x = 20 + Math.random() * (size - 40)
    const y = 20 + Math.random() * (size - 40)
    // Gold glow
    ctx.shadowColor = 'rgba(201,168,76,0.8)'
    ctx.shadowBlur = 6
    ctx.fillStyle = '#c9a84c'
    ctx.fillText(String(n), x, y)
    ctx.shadowBlur = 0
  })

  // Subtle noise overlay for realism
  const imageData = ctx.getImageData(0, 0, size, size)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 18
    data[i]     = Math.max(0, Math.min(255, data[i]     + noise))
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
  }
  ctx.putImageData(imageData, 0, 0)

  return new THREE.CanvasTexture(canvas)
}

// Generate a normal map for surface bump detail
function createNormalMap() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  // Neutral normal (pointing outward)
  ctx.fillStyle = '#8080ff'
  ctx.fillRect(0, 0, size, size)

  // Add subtle bump noise
  const imageData = ctx.getImageData(0, 0, size, size)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 30
    data[i]     = Math.max(0, Math.min(255, 128 + n))
    data[i + 1] = Math.max(0, Math.min(255, 128 + n))
    data[i + 2] = 255
    data[i + 3] = 255
  }
  ctx.putImageData(imageData, 0, 0)

  return new THREE.CanvasTexture(canvas)
}

export default function MarbleDice({ rolling, onRollComplete }) {
  const meshRef = useRef()
  const rollStartRef = useRef(null)
  const rollDurationRef = useRef(1800)
  const startQuatRef = useRef(new THREE.Quaternion())
  const endQuatRef = useRef(new THREE.Quaternion())
  const idleTimeRef = useRef(0)

  const { marbleTexture, normalMap } = useMemo(() => ({
    marbleTexture: createMarbleTexture(),
    normalMap: createNormalMap(),
  }), [])

  // When rolling starts, generate a random target rotation
  useEffect(() => {
    if (rolling) {
      rollStartRef.current = performance.now()
      startQuatRef.current.copy(meshRef.current.quaternion)

      // Random end rotation — multiple full spins + random final orientation
      const spins = 4 + Math.random() * 3
      const axis = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize()
      const endRot = new THREE.Euler(
        Math.random() * Math.PI * 2 * spins,
        Math.random() * Math.PI * 2 * spins,
        Math.random() * Math.PI * 2 * spins
      )
      endQuatRef.current.setFromEuler(endRot)
    }
  }, [rolling])

  useFrame((state) => {
    if (!meshRef.current) return
    const mesh = meshRef.current
    const now = performance.now()

    if (rolling && rollStartRef.current !== null) {
      const elapsed = now - rollStartRef.current
      const duration = rollDurationRef.current
      const t = Math.min(elapsed / duration, 1)

      // Custom easing: fast start, dramatic slow finish
      const eased = t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2

      mesh.quaternion.slerpQuaternions(startQuatRef.current, endQuatRef.current, eased)

      if (t >= 1) {
        rollStartRef.current = null
      }
    } else {
      // Idle: gentle continuous slow rotation
      idleTimeRef.current += 0.004
      mesh.rotation.y += 0.003
      mesh.rotation.x = Math.sin(idleTimeRef.current) * 0.04
    }
  })

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <sphereGeometry args={[1.5, 128, 128]} />
      <meshStandardMaterial
        map={marbleTexture}
        normalMap={normalMap}
        normalScale={[0.15, 0.15]}
        roughness={0.25}
        metalness={0.08}
        envMapIntensity={1.2}
      />
    </mesh>
  )
}
