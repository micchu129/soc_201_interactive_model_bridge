import { useState } from 'react'
import { outcomesFromState } from '../simulation/engine'

export default function PolicyConsole({ state, onApply }) {
  const [pending, setPending] = useState(state.policies)
  const outcomes = outcomesFromState(state)
  return <section className="macro-console">
    <div className="panel policy-panel"><p className="kicker">Macro / Policy lab</p><h2>Apply an intervention</h2>{[['alcoholPrice', 2, 12], ['venueRegulation', 0, 100], ['treatmentAccess', 0, 100], ['prevention', 0, 100]].map(([key, min, max]) => <label className="policy-slider" key={key}><span>{key.replace(/([A-Z])/g, ' $1')} <strong>{pending[key]}</strong></span><input type="range" min={min} max={max} value={pending[key]} onChange={event => setPending({ ...pending, [key]: Number(event.target.value) })} /></label>)}<button className="button primary wide" onClick={() => onApply(pending)}>Apply policy</button></div>
    <div className="outcome-grid">{Object.entries(outcomes).map(([key, value]) => <div className="panel outcome" key={key}><p>{key.replace(/([A-Z])/g, ' $1')}</p><strong>{value}</strong></div>)}</div>
    <div className="disclaimer">Prototype mode: outputs illustrate model logic and are not validated policy predictions.</div>
  </section>
}
