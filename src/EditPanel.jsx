import { useState, useEffect } from 'react'
import styles from './EditPanel.module.css'

const PALETTE = [
  '#c9a84c','#7c9dbf','#a07cc5','#7cbf95','#bf7c7c',
  '#7cb5bf','#bf9a7c','#9abf7c','#bf7cb0','#7c8abf',
  '#bfb87c','#7cbfb8',
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

export default function EditPanel({ choices, onSave, onClose }) {
  const [draft, setDraft] = useState(choices.map(c => ({ ...c })))

  useEffect(() => {
    setDraft(choices.map(c => ({ ...c })))
  }, [choices])

  const ranged = computeRanges(draft)

  function changeCount(delta) {
    const n = draft.length + delta
    if (n < 2 || n > 12) return
    if (delta > 0) {
      setDraft([...draft, { name: `Choice ${n}`, color: PALETTE[n - 1] || '#888888' }])
    } else {
      setDraft(draft.slice(0, -1))
    }
  }

  function updateName(i, val) {
    const next = [...draft]
    next[i] = { ...next[i], name: val }
    setDraft(next)
  }

  function updateColor(i, val) {
    const next = [...draft]
    next[i] = { ...next[i], color: val }
    setDraft(next)
  }

  function handleSave() {
    onSave(draft.map((c, i) => ({
      ...c,
      name: c.name.trim() || `Choice ${i + 1}`,
    })))
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.panel}>
        <div className={styles.cornerTL} />
        <div className={styles.cornerBR} />

        <div className={styles.panelTitle}>Configure Choices</div>
        <div className={styles.panelSub}>name each option &amp; set how many fate decides between</div>

        {/* Count */}
        <div className={styles.countRow}>
          <span className={styles.countLabel}>Number of choices</span>
          <div className={styles.countControls}>
            <button className={styles.countBtn} onClick={() => changeCount(-1)} disabled={draft.length <= 2}>−</button>
            <span className={styles.countVal}>{draft.length}</span>
            <button className={styles.countBtn} onClick={() => changeCount(1)}  disabled={draft.length >= 12}>+</button>
          </div>
        </div>

        {/* List */}
        <div className={styles.list}>
          {ranged.map((c, i) => (
            <div key={i} className={styles.row}>
              <span className={styles.rowNum}>{i + 1}</span>
              <div className={styles.swatch} style={{ background: c.color }}>
                <input
                  type="color"
                  value={c.color}
                  onChange={e => updateColor(i, e.target.value)}
                  className={styles.colorInput}
                />
              </div>
              <input
                className={styles.nameInput}
                type="text"
                value={c.name}
                maxLength={40}
                placeholder={`Choice ${i + 1}`}
                onChange={e => updateName(i, e.target.value)}
              />
              <span className={styles.badge}>{c.rangeLabel}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleSave}><span>Apply</span></button>
        </div>
      </div>
    </div>
  )
}
