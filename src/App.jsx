import { useState, useRef, useCallback } from 'react'
import DiceScene from './DiceScene'
import EditPanel from './EditPanel'
import styles from './App.module.css'

const DEFAULT_CHOICES = [
  { name: 'Tabla',             color: '#c9a84c' },
  { name: 'Steamhouse Lounge', color: '#7c9dbf' },
  { name: 'Office Bar',        color: '#a07cc5' },
]

function computeRanges(list) {
  const n    = list.length
  const base = Math.floor(120 / n)
  const rem  = 120 % n
  let cur = 1
  return list.map((c, i) => {
    const size = base + (i < rem ? 1 : 0)
    const range = { ...c, min: cur, max: cur + size - 1, rangeLabel: `${cur}–${cur + size - 1}` }
    cur += size
    return range
  })
}

export default function App() {
  const [choices, setChoices]     = useState(DEFAULT_CHOICES)
  const [rolling, setRolling]     = useState(false)
  const [result, setResult]       = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [showEdit, setShowEdit]   = useState(false)
  const [particles, setParticles] = useState([])
  const [displayNum, setDisplayNum] = useState('D120')
  const diceWrapRef = useRef(null)
  const countRef    = useRef(null)

  const spawnParticles = useCallback(() => {
    if (!diceWrapRef.current) return
    const rect = diceWrapRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width  / 2
    const cy = rect.top  + rect.height / 2
    const colors = choices.map(c => c.color).concat(['#f0d080', '#ffffff', '#4a9e8a'])

    const newP = Array.from({ length: 28 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2
      const dist  = 90 + Math.random() * 140
      return {
        id: Date.now() + i,
        x: cx, y: cy,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay:    Math.random() * 0.4,
        duration: 0.6 + Math.random() * 0.7,
      }
    })
    setParticles(newP)
    setTimeout(() => setParticles([]), 1400)
  }, [choices])

  const rollDice = useCallback(() => {
    if (rolling) return
    setRolling(true)
    setShowResult(false)
    setResult(null)
    spawnParticles()

    const roll = Math.floor(Math.random() * 120) + 1

    clearInterval(countRef.current)
    countRef.current = setInterval(() => {
      setDisplayNum(Math.floor(Math.random() * 120) + 1)
    }, 55)

    // Match the Three.js roll animation duration (~1800ms)
    setTimeout(() => {
      clearInterval(countRef.current)
      setDisplayNum(roll)
      setRolling(false)

      const ranged = computeRanges(choices)
      const picked = ranged.find(c => roll >= c.min && roll <= c.max)
      const idx    = ranged.indexOf(picked)

      setTimeout(() => {
        setResult({ ...picked, idx, roll })
        setShowResult(true)
      }, 200)
    }, 1850)
  }, [rolling, choices, spawnParticles])

  const ranged = computeRanges(choices)

  return (
    <div className={styles.page}>
      {/* Background glow */}
      <div className={styles.bgGlow} />

      <h1 className={styles.title}>D120</h1>
      <p className={styles.subtitle}>decision roller</p>

      {/* 3D Dice */}
      <div ref={diceWrapRef} className={styles.diceWrap}>
        <DiceScene rolling={rolling} onClick={rollDice} />

        {/* Number overlay */}
        <div className={styles.diceNumber}
          style={{ opacity: rolling ? 0.6 : 1 }}>
          {displayNum}
        </div>
      </div>

      {/* Result */}
      <div className={styles.resultArea}>
        <div className={`${styles.resultLabel} ${showResult ? styles.show : ''}`}>
          the fates have chosen
        </div>
        <div
          className={`${styles.resultName} ${showResult ? styles.show : ''}`}
          style={result ? {
            color: result.color,
            textShadow: `0 0 35px ${result.color}90, 0 0 70px ${result.color}40`,
          } : {}}
        >
          {result ? result.name : '—'}
        </div>
        <div className={`${styles.resultRange} ${showResult ? styles.show : ''}`}>
          {result ? `Rolled ${result.roll} · Range ${result.rangeLabel}` : ''}
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        {ranged.map((c, i) => (
          <div
            key={i}
            className={`${styles.legendItem} ${result?.idx === i ? styles.active : ''}`}
          >
            <div className={styles.legendDot} style={{ background: c.color }} />
            {c.name} ({c.rangeLabel})
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className={styles.btnRow}>
        <button className={styles.rollBtn} onClick={rollDice} disabled={rolling}>
          <span>Roll the Dice</span>
        </button>
        <button className={styles.editBtn} onClick={() => setShowEdit(true)}>
          Edit Choices
        </button>
      </div>

      {/* Particles */}
      <div className={styles.particles}>
        {particles.map(p => (
          <div
            key={p.id}
            className={styles.particle}
            style={{
              left: p.x,
              top:  p.y,
              background: p.color,
              '--tx': `${p.tx}px`,
              '--ty': `${p.ty}px`,
              animationDelay:    `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Edit panel */}
      {showEdit && (
        <EditPanel
          choices={choices}
          onSave={newChoices => { setChoices(newChoices); setShowEdit(false); setResult(null); setShowResult(false); setDisplayNum('D120') }}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  )
}
