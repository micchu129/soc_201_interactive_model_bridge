import { useRef, useState } from 'react'

const durationLabel = minutes => `${Math.max(0, Math.ceil(minutes / 60))} simulated hours remaining`

export default function TutorialOverlay({ step, stepNumber, totalSteps, ready, autoAdvance, countdown, progress, rewinding, demoMinutesRemaining, onAutoAdvance, onCompleteAction, onMove, onPrevious, onNext, onSkip }) {
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
  const demoProgress = demoMinutesRemaining == null ? null : (2880 - demoMinutesRemaining) / 2880
  return <section className={`tutorial-overlay panel sheet-${sheet}`} style={{ left: `${position.x}%`, top: `${position.y}%` }}>
    <div className="tutorial-drag drag-handle" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}><span className="move-grip">✥</span><p className="kicker">Model tutorial · {stepNumber} / {totalSteps} · {step.mode}</p></div>
    <h2>{rewinding ? 'Restoring your saved snapshot…' : step.title}</h2>
    <p>{step.body}</p>
    {step.instruction && <p className="tutorial-instruction">{step.instruction}</p>}
    {step.disclaimer && <p className="tutorial-disclaimer">{step.disclaimer}</p>}
    {step.progress === 'orbit' && <div className="tutorial-practice"><span>Orbit practice</span><div className="progress"><span style={{ width: `${progress * 100}%` }} /></div></div>}
    {demoMinutesRemaining != null && !rewinding && <div className="tutorial-demo-status"><strong>Demonstration running: watch how agents, locations, and outcomes change over simulated time.</strong><span>Day {demoProgress < .5 ? 1 : 2} of 2 · {durationLabel(demoMinutesRemaining)}</span><div className="progress"><span style={{ width: `${demoProgress * 100}%` }} /></div></div>}
    <p className={`tutorial-action ${ready ? 'ready' : ''}`}><b>{ready ? '✓' : '→'}</b><span>{step.action}</span>{countdown != null && <small>Continuing in {countdown}…</small>}</p>
    {step.manualComplete && !ready && <button className="button secondary tutorial-complete-button" onClick={() => onCompleteAction(step.requirement)}>Mark reviewed</button>}
    {!step.final && <label className="check-row tutorial-auto"><input type="checkbox" checked={autoAdvance} onChange={event => onAutoAdvance(event.target.checked)} /> Auto-advance completed actions</label>}
    <div className="tutorial-footer">
      <span className="tutorial-navigation"><button className="button secondary" disabled={stepNumber === 1} onClick={onPrevious}>Previous</button><button className="button primary" disabled={!ready} onClick={onNext}>{step.final ? 'Finish tutorial' : 'Next'}</button></span>
      {!step.final && (confirmSkip ? <span className="skip-confirm"><button onClick={() => setConfirmSkip(false)}>Cancel</button><button onClick={onSkip}>Confirm skip</button></span> : <button className="tutorial-skip" onClick={() => setConfirmSkip(true)}>Skip tutorial</button>)}
    </div>
  </section>
}
