import { useState } from 'react'

export default function TutorialOverlay({ step, stepNumber, totalSteps, ready, onNext, onSkip }) {
  const [confirmSkip, setConfirmSkip] = useState(false)
  return <section className="tutorial-overlay panel">
    <p className="kicker">Model tutorial · {stepNumber} / {totalSteps} · {step.mode}</p>
    <h2>{step.title}</h2>
    <p>{step.body}</p>
    <p className={`tutorial-action ${ready ? 'ready' : ''}`}>{step.action}</p>
    <div className="button-row">
      {!confirmSkip ? <button className="button secondary" onClick={() => setConfirmSkip(true)}>Skip tutorial</button> : <><button className="button secondary" onClick={() => setConfirmSkip(false)}>Keep tutorial</button><button className="button danger-button" onClick={onSkip}>Yes, skip</button></>}
      <button className="button primary" disabled={!ready} onClick={onNext}>{stepNumber === totalSteps ? 'Finish tutorial' : 'Next'}</button>
    </div>
  </section>
}
