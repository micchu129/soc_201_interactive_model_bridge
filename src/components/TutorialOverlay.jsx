import { useRef, useState } from 'react'

export default function TutorialOverlay({ step, stepNumber, totalSteps, ready, rewinding, onMove, onNext, onSkip }) {
  const [position, setPosition] = useState({ x: 50, y: 72 })
  const [sheet, setSheet] = useState(1)
  const drag = useRef(null)
  const startDrag = event => { drag.current = { x: event.clientX, y: event.clientY, origin: position }; event.currentTarget.setPointerCapture(event.pointerId) }
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
    <div className="tutorial-drag drag-handle" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={() => { drag.current = null }}><span className="move-grip">↕</span><p className="kicker">Model tutorial · {stepNumber} / {totalSteps} · {step.mode}</p></div>
    <h2>{rewinding ? 'Rewinding to midday...' : step.title}</h2><p>{step.body}</p><p className={`tutorial-action ${ready ? 'ready' : ''}`}>{step.action}</p>
    <div className="tutorial-footer">{!step.auto && <button className="button primary" disabled={!ready} onClick={onNext}>{stepNumber === totalSteps ? 'Finish tutorial' : 'Next'}</button>}<button className="tutorial-skip" onClick={onSkip}>Skip tutorial</button></div>
  </section>
}
