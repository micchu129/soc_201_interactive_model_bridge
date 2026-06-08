export default function DetailsPanel({ building, agent, onClose }) {
  const item = agent || building
  if (!item) return null
  return <aside className="panel details-panel">
    <div className="section-heading"><div><p className="kicker">{agent ? 'Selected agent' : 'Selected building'}</p><h2>{agent ? agent.name : item.label}</h2></div><button className="icon-button" onClick={onClose}>×</button></div>
    {agent ? <div className="stat-grid">
      <span>Activity<strong>{agent.activity}</strong></span><span>Stage<strong>{agent.stage}</strong></span><span>BAC<strong>{agent.bac.toFixed(2)}</strong></span><span>Health<strong>{agent.health.toFixed(0)}</strong></span><span>Cash<strong>€{agent.cash.toFixed(0)}</strong></span><span>Use mode<strong>{agent.useMode}</strong></span>
    </div> : <div className="stat-grid"><span>Purpose<strong>{item.purpose}</strong></span><span>Capacity<strong>{item.capacity}</strong></span><span>Function<strong>{item.type}</strong></span><span>Status<strong>Operating</strong></span></div>}
  </aside>
}
