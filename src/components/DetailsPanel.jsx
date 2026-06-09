import { useRef, useState } from 'react'

export default function DetailsPanel({ building, agent, agents = [], buildings = [], mode = 'micro', occupants = [], residents = [], onClose, onSelectAgent, onSelectBuilding, onFollowAgent, anchor = { x: 50, y: 50 } }) {
  const item = agent || building
  const [position, setPosition] = useState({ x: 60, y: 18 })
  const drag = useRef(null)
  if (!item) return null
  const startDrag = event => {
    drag.current = { x: event.clientX, y: event.clientY, origin: position }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const moveDrag = event => {
    if (!drag.current) return
    const x = drag.current.origin.x + (event.clientX - drag.current.x) / window.innerWidth * 100
    const y = drag.current.origin.y + (event.clientY - drag.current.y) / window.innerHeight * 100
    setPosition({ x: Math.max(17, Math.min(83, x)), y: Math.max(2, Math.min(78, y)) })
  }
  const friends = agent ? (agent.socialIds || []).map(id => agents.find(person => person.id === id)).filter(Boolean) : []
  const domicile = agent ? buildings.find(place => place.id === agent.home?.id) : null
  const workplace = agent ? buildings.find(place => place.id === agent.workplaceId) : null
  const gatheringPlace = agent ? buildings.find(place => place.id === agent.favoriteVenueId) : null
  const relationButton = (place, fallback) => <button disabled={!place} onClick={() => place && onSelectBuilding({ ...place, label: place.type, purpose: fallback, capacity: 0 })}>{place?.name || 'Not assigned'}</button>
  return <>
    <svg className="detail-connector"><line x1={`${anchor.x}%`} y1={`${anchor.y}%`} x2={`${position.x}%`} y2={`${position.y}%`} /></svg>
    <aside className="panel details-panel" style={{ left: `${position.x}%`, top: `${position.y}%` }}>
      <div className="section-heading">
        <div className="drag-handle" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={() => { drag.current = null }}><p className="kicker">{agent ? 'Selected agent' : item.label}</p><h2>{agent ? agent.name : building.name}</h2></div><button className="icon-button" onPointerDown={event => event.stopPropagation()} onClick={event => { event.stopPropagation(); onClose() }}>×</button>
      </div>
      {agent && mode === 'meso' ? <>
        <p className="kicker list-heading">Social network</p>
        <div className="occupant-list">{friends.map(friend => <button key={friend.id} onClick={() => onSelectAgent(friend.id)}><i style={{ background: friend.color }} />{friend.name}<span>{friend.insideBuildingId ? 'At a place' : 'Travelling'}</span></button>)}</div>
        <p className="kicker list-heading">Domicile</p>
        <div className="relation-list">{relationButton(domicile, 'Home and recovery')}</div>
        <p className="kicker list-heading">Work</p>
        <div className="relation-list">{relationButton(workplace, 'Workplace')}</div>
        <p className="kicker list-heading">Favorite gathering place</p>
        <div className="relation-list">{relationButton(gatheringPlace, 'Social gathering place')}</div>
      </> : agent ? <>
        <div className="stat-grid"><span>Activity<strong>{agent.activity}</strong></span><span>Stage<strong>{agent.stage}</strong></span><span>BAC<strong>{agent.bac.toFixed(2)}</strong></span><span>Health<strong>{agent.health.toFixed(0)}</strong></span><span>Cash<strong>€{agent.cash.toFixed(0)}</strong></span><span>Location<strong>{agent.insideBuildingId ? 'Inside building' : 'Travelling'}</strong></span></div>
        <p className="kicker list-heading">Neurotransmitters</p>
        <div className="neuro-grid">{Object.entries(agent.neurotransmitters || { dopamine: 50, serotonin: 50, gaba: 50 }).map(([name, value]) => <label key={name}><span>{name}<strong>{value}</strong></span><i><b style={{ width: `${value}%` }} /></i></label>)}</div>
        <button className="button primary wide" onClick={() => onFollowAgent(agent.id)}>Zoom and follow</button>
      </> : <>
        <div className="stat-grid"><span>Purpose<strong>{item.purpose}</strong></span><span>Capacity<strong>{item.capacity}</strong></span><span>Occupants<strong>{occupants.length}</strong></span><span>Status<strong>Operating</strong></span></div>
        <p className="kicker list-heading">{building.type === 'home' ? 'Who lives here' : 'Current occupants'}</p>
        <div className="occupant-list">{(building.type === 'home' ? residents : occupants).map(person => <button key={person.id} onClick={() => onSelectAgent(person.id)}><i style={{ background: person.color }} />{person.name}<span>{person.insideBuildingId === building.id ? 'Present' : 'Away'}</span></button>)}</div>
      </>}
    </aside>
  </>
}
