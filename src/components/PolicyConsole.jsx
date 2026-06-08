import { useState } from 'react'
import { outcomesFromState } from '../simulation/engine'
import { speedOptions } from '../simulation/clock'

export default function PolicyConsole({ state, onApply, onSpeed }) {
  const [pending, setPending] = useState(state.policies)
  const outcomes = outcomesFromState(state)
  const history = state.history || []
  const chartPoints = history.map((point, index) => `${history.length <= 1 ? 0 : index / (history.length - 1) * 100},${48 - Math.min(46, point.consumption * 5)}`).join(' ')
  return <section className="macro-console">
    <div className="macro-playback"><div><strong>{state.calendar.time}</strong><span>{state.calendar.day} · Week {state.calendar.week}</span></div><div className="speed-controls">{speedOptions.map(speed => <button key={speed} className={state.speed === speed ? 'active' : ''} onClick={() => onSpeed(speed)}>{speed === 0 ? '❚❚' : speed === 1 ? '▶' : '▶'.repeat(speed === 2 ? 2 : speed === 4 ? 3 : 4)}</button>)}</div></div>
    <div className="policy-panel"><p className="kicker">Macro / Policy lab</p><h2>Apply an intervention</h2>{[['alcoholPrice', 2, 12], ['venueRegulation', 0, 100], ['treatmentAccess', 0, 100], ['prevention', 0, 100]].map(([key, min, max]) => <label className="policy-slider" key={key}><span>{key.replace(/([A-Z])/g, ' $1')} <strong>{pending[key]}</strong></span><input type="range" min={min} max={max} value={pending[key]} onChange={event => setPending({ ...pending, [key]: Number(event.target.value) })} /></label>)}<button className="button primary wide" onClick={() => onApply(pending)}>Apply policy</button></div>
    <div className="outcome-grid">{Object.entries(outcomes).map(([key, value]) => <div className="panel outcome" key={key}><p>{key.replace(/([A-Z])/g, ' $1')}</p><strong>{value}</strong></div>)}</div>
    <div className="panel history-chart"><div><p className="kicker">Output history</p><strong>Alcohol consumption</strong></div><svg viewBox="0 0 100 50" preserveAspectRatio="none"><path d="M0 48H100" /><polyline points={chartPoints || '0,48 100,48'} /></svg></div>
    <div className="disclaimer">Prototype mode: outputs illustrate model logic and are not validated policy predictions.</div>
  </section>
}
