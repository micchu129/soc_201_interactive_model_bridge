export default function AdvancedOptions({ type, values, onChange, onClose }) {
  const worldFields = [['bars', 1, 5], ['clubs', 1, 4], ['shops', 1, 5], ['hospitals', 1, 2], ['rehab', 1, 2], ['police', 1, 2]]
  const populationFields = [['populationSize', 30, 160], ['femaleShare', .2, .8], ['socialDensity', .1, .7]]
  const fields = type === 'world' ? worldFields : populationFields
  return <div className="modal-backdrop">
    <div className="panel options-card">
      <div className="section-heading"><div><p className="kicker">Advanced options</p><h2>{type === 'world' ? 'World parameters' : 'Population parameters'}</h2></div><button className="icon-button" onClick={onClose}>×</button></div>
      <div className="option-grid">{fields.map(([key, min, max]) => <label key={key}><span>{key.replace(/([A-Z])/g, ' $1')}</span><strong>{values[key]}</strong><input type="range" min={min} max={max} step={max <= 1 ? .05 : 1} value={values[key]} onChange={event => onChange({ ...values, [key]: Number(event.target.value) })} /></label>)}</div>
      {type === 'population' && <div><p className="kicker">Alcohol stages</p><div className="stacked-bar">{values.stageDistribution.map((value, index) => <span key={index} style={{ width: `${value * 100}%` }} title={`Stage ${index + 1}: ${Math.round(value * 100)}%`} />)}</div><p className="muted">Conservative default distribution across stages 1–7.</p></div>}
      <button className="button primary wide" onClick={onClose}>Apply options</button>
    </div>
  </div>
}
