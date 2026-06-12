import { useState } from 'react'

export default function AgentDirectory({ agents, onClose, onLocate, onFollow, onDetails }) {
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [stageFilter, setStageFilter] = useState('all')
  const stages = [...new Set(agents.map(agent => agent.stage))].sort((a, b) => Number(a) - Number(b))
  const filtered = agents
    .filter(agent => `${agent.name} ${agent.activity} ${agent.stage}`.toLowerCase().includes(query.trim().toLowerCase()))
    .filter(agent => stageFilter === 'all' || String(agent.stage) === stageFilter)
    .sort((a, b) => sortBy === 'stage'
      ? Number(a.stage) - Number(b.stage) || a.name.localeCompare(b.name)
      : a.name.localeCompare(b.name))

  return <aside className="panel directory-panel">
    <div className="section-heading"><div><p className="kicker">Population</p><h2>Agent directory</h2></div><button className="icon-button" onClick={onClose}>×</button></div>
    <div className="directory-tools">
      <input className="search-input" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search agents…" />
      <label><span>Sort by</span><select value={sortBy} onChange={event => setSortBy(event.target.value)}><option value="name">Name</option><option value="stage">Stage</option></select></label>
      <label><span>Stage</span><select value={stageFilter} onChange={event => setStageFilter(event.target.value)}><option value="all">All stages</option>{stages.map(stage => <option key={stage} value={String(stage)}>Stage {stage}</option>)}</select></label>
    </div>
    <p className="directory-count">{filtered.length} of {agents.length} agents</p>
    <div className="agent-list">
      {filtered.map(agent => <article key={agent.id}>
        <div className="agent-card-summary">
          <button className="agent-name" onClick={() => onDetails(agent.id)}>{agent.name}</button>
          <span><b>Stage {agent.stage}</b>{agent.activity}</span>
        </div>
        <div className="agent-card-actions">
          <button className="agent-details-action" onClick={() => onDetails(agent.id)}>Details</button>
          <button onClick={() => onLocate(agent.id)}>Locate</button>
          <button onClick={() => onFollow(agent.id)}>Follow</button>
        </div>
      </article>)}
      {filtered.length === 0 && <p className="directory-empty">No agents match the current search and stage filter.</p>}
    </div>
  </aside>
}
