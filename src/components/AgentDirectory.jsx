import { useState } from 'react'

export default function AgentDirectory({ agents, onClose, onFind, onFollow, onHighlight, onDetails }) {
  const [query, setQuery] = useState('')
  const filtered = agents.filter(agent => `${agent.name} ${agent.activity} ${agent.stage}`.toLowerCase().includes(query.toLowerCase()))
  return <aside className="panel directory-panel">
    <div className="section-heading"><div><p className="kicker">Population</p><h2>Agent directory</h2></div><button className="icon-button" onClick={onClose}>×</button></div>
    <input className="search-input" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search agents…" />
    <div className="agent-list">{filtered.map(agent => <article key={agent.id}><div><strong>{agent.name}</strong><span>Stage {agent.stage} · {agent.activity}</span></div><div><button onClick={() => onFind(agent.id)}>Find</button><button onClick={() => onFollow(agent.id)}>Follow</button><button onClick={() => onHighlight(agent.id)}>Highlight</button><button onClick={() => onDetails(agent.id)}>Details</button></div></article>)}</div>
  </aside>
}
