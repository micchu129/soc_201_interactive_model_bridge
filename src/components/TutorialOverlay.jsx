import { useState } from 'react'

const steps = [
  ['Micro', 'Follow individual agents as they travel, decide, and act.'],
  ['Meso', 'Zoom out to inspect shared places, routes, and social connections.'],
  ['Macro', 'Use the top-down policy lab to apply interventions and watch outcomes change.'],
]

export default function TutorialOverlay({ step, onNext, onSkip }) {
  const [confirmSkip, setConfirmSkip] = useState(false)
  return <section className="tutorial-overlay panel">
    <p className="kicker">Model tutorial · {step + 1} / 3</p>
    <h2>{steps[step][0]}</h2>
    <p>{steps[step][1]}</p>
    <div className="button-row">
      {step < 2 && (!confirmSkip ? <button className="button secondary" onClick={() => setConfirmSkip(true)}>Skip tutorial</button> : <><button className="button secondary" onClick={() => setConfirmSkip(false)}>Keep tutorial</button><button className="button danger-button" onClick={onSkip}>Yes, skip</button></>)}
      <button className="button primary" onClick={onNext}>{step === 2 ? 'Finish' : 'Next'}</button>
    </div>
  </section>
}
