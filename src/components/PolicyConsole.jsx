import { useState } from 'react'
import { outcomesFromState } from '../simulation/engine'
import { speedOptions } from '../simulation/clock'

const windows = { '24 hours': 1440, '7 days': 10080, '30 days': 43200 }
const stageColors = ['#80d8ee', '#a9d77b', '#e2ca70', '#e7a45f', '#e47768', '#b879c9', '#e35b76']
const pointsFor = (values, max) => values.map((value, index) => `${values.length <= 1 ? 0 : index / (values.length - 1) * 100},${48 - value / max * 44}`).join(' ')

export default function PolicyConsole({ state, onApply, onSpeed, tutorialHighlight }) {
  const [pending, setPending] = useState(state.policies)
  const [windowLabel, setWindowLabel] = useState('24 hours')
  const outcomes = outcomesFromState(state)
  const history = (state.history || []).filter(point => point.minute > state.simMinutes - windows[windowLabel])
  const consumption = history.map(point => point.intervalConsumption || 0)
  const chartMax = Math.max(1, ...consumption)
  const stageMax = Math.max(1, ...history.flatMap(point => point.stages || []))
  return <section className="macro-console">
    <div className="macro-playback"><div><strong>{state.calendar.time}</strong><span>Day {String(state.calendar.dayNumber).padStart(3, '0')} · {state.calendar.day} · Week {state.calendar.week} · {state.calendar.period}</span></div><div className="speed-controls">{speedOptions.map(speed => <button key={speed} className={state.speed === speed ? 'active' : ''} onClick={() => onSpeed(speed)}>{speed === 0 ? '❚❚' : speed === 1 ? '▶' : `${speed}×`}</button>)}</div></div>
    <div className="policy-panel"><p className="kicker">Macro / Policy lab</p><h2>Apply an intervention</h2>{[['alcoholPrice', 2, 12], ['venueRegulation', 0, 100], ['treatmentAccess', 0, 100], ['prevention', 0, 100]].map(([key, min, max]) => <label className={`policy-slider ${tutorialHighlight === key ? 'tutorial-highlight' : ''}`} key={key}><span>{key.replace(/([A-Z])/g, ' $1')} <strong>{pending[key]}</strong></span><input type="range" min={min} max={max} value={pending[key]} onChange={event => setPending({ ...pending, [key]: Number(event.target.value) })} /></label>)}<button className="button primary wide" onClick={() => onApply(pending)}>Apply policy</button></div>
    <div className={`outcome-grid ${tutorialHighlight === 'outcomes' ? 'tutorial-highlight' : ''}`}>{Object.entries(outcomes).map(([key, value]) => <div className="panel outcome" key={key}><p>{key.replace(/([A-Z])/g, ' $1')}</p><strong>{value}</strong></div>)}</div>
    <div className="history-tabs">{Object.keys(windows).map(label => <button key={label} className={label === windowLabel ? 'active' : ''} onClick={() => setWindowLabel(label)}>{label}</button>)}</div>
    <div className="panel history-chart"><div><p className="kicker">Alcohol consumption · two-hour intervals</p><strong>{outcomes.consumption} rolling units / resident</strong></div><svg viewBox="0 0 100 50" preserveAspectRatio="none"><path d="M0 48H100" /><g className="tick-lines">{history.map((point, index) => <path key={point.minute} d={`M${history.length <= 1 ? 0 : index / (history.length - 1) * 100} 46V50`} />)}</g><polyline points={pointsFor(consumption, chartMax) || '0,48 100,48'} /></svg></div>
    <div className="panel history-chart stage-chart"><div><p className="kicker">Alcohol stage distribution</p><span className="stage-legend">{stageColors.map((color, index) => <i key={color} style={{ color }}>Stage {index + 1}</i>)}</span></div><svg viewBox="0 0 100 50" preserveAspectRatio="none"><path d="M0 48H100" />{stageColors.map((color, stage) => <polyline key={color} style={{ stroke: color }} points={pointsFor(history.map(point => point.stages?.[stage] || 0), stageMax)} />)}</svg></div>
    <div className="disclaimer">Prototype mode: outputs illustrate model logic and are not validated policy predictions.</div>
  </section>
}
