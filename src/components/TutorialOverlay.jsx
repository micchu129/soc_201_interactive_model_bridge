import { useRef, useState } from 'react'

const durationLabel = minutes => {
  const hours = Math.ceil(minutes / 60)
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return [days && `${days} day${days === 1 ? '' : 's'}`, remainingHours && `${remainingHours} hour${remainingHours === 1 ? '' : 's'}`].filter(Boolean).join(' ') || 'less than 1 hour'
}

export default function TutorialOverlay({ step, stepNumber, totalSteps, ready, rewinding, demoMinutesRemaining, onMove, onNext, onSkip }) {
  const [position, setPosition] = useState({ x: 50, y: 72 })
  const [sheet, setSheet] = useState(1)
  const [confirmSkip, setConfirmSkip] = useState(false)
  const drag = useRef(null)
  const startDrag = event => {
    event.preventDefault()
    drag.current = { x: event.clientX, y: event.clientY, origin: position }
    event.currentTarget.setPointerCapture(event.pointerId)
    document.body.classList.add('panel-dragging')
  }
  const endDrag = () => { drag.current = null; document.body.classList.remove('panel-dragging') }
  const moveDrag = event => {
    if (!drag.current) return
    if (window.matchMedia('(max-width: 900px)').matches) {
      const delta = event.clientY - drag.current.y
      if (Math.abs(delta) > 35) setSheet(Math.max(0, Math.min(2, 1 + (delta > 0 ? -1 : 1))))
      onMove?.()
      return
    }
    setPosition({ x: Math.max(22, Math.min(78, drag.current.origin.x + (event.clientX - drag.current.x) / window.innerWidth * 100)), y: Math.max(8, Math.min(78, drag.current.origin.y + (event.clientY - drag.current.y) / window.innerHeight * 100)) })
    onMove?.()
  }
  return <section className={`tutorial-overlay panel sheet-${sheet}`} style={{ left: `${position.x}%`, top: `${position.y}%` }}>
    <div className="tutorial-drag drag-handle" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}><span className="move-grip">✥</span><p className="kicker">Model tutorial · {stepNumber} / {totalSteps} · {step.mode}</p></div>
    <h2>{rewinding ? 'Restoring the saved moment...' : step.title}</h2><p>{step.body}</p>{demoMinutesRemaining != null && !rewinding && <p className="tutorial-demo-status"><strong>Two-day demonstration running</strong><span>{durationLabel(demoMinutesRemaining)} remaining. Restoration starts automatically at the saved target.</span></p>}<p className={`tutorial-action ${ready ? 'ready' : ''}`}>{step.action}</p>
    <div className="tutorial-footer">{!step.auto && <button className="button primary" disabled={!ready} onClick={onNext}>{stepNumber === totalSteps ? 'Finish tutorial' : 'Next'}</button>}{confirmSkip ? <span className="skip-confirm"><button onClick={() => setConfirmSkip(false)}>Cancel</button><button onClick={onSkip}>Confirm skip</button></span> : <button className="tutorial-skip" onClick={() => setConfirmSkip(true)}>Skip tutorial</button>}</div>
  </section>
}
