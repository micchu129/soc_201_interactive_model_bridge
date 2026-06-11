import { useEffect, useRef, useState } from 'react'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

export default function DetailsPanel({ building, agent, agents = [], buildings = [], mode = 'micro', networkCategory = 'all', occupants = [], residents = [], onClose, onSelectAgent, onSelectBuilding, onFollowAgent, onMove, anchor = { x: 50, y: 50 } }) {
  const item = agent || building
  const [position, setPosition] = useState({ x: 62, y: 16 })
  const [sheet, setSheet] = useState(1)
  const [panelBounds, setPanelBounds] = useState(null)
  const drag = useRef(null)
  const panelRef = useRef(null)
  const mobile = window.matchMedia('(max-width: 900px)').matches

  useEffect(() => {
    if (mobile || !panelRef.current) return
    const update = () => setPanelBounds(panelRef.current.getBoundingClientRect())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [mobile, position, item])

  if (!item) return null
  const startDrag = event => {
    event.preventDefault()
    drag.current = { x: event.clientX, y: event.clientY, origin: position, sheet }
    event.currentTarget.setPointerCapture(event.pointerId)
    document.body.classList.add('panel-dragging')
  }
  const endDrag = () => {
    drag.current = null
    document.body.classList.remove('panel-dragging')
  }
  const moveDrag = event => {
    if (!drag.current) return
    if (mobile) {
      const delta = event.clientY - drag.current.y
      if (Math.abs(delta) > 45) setSheet(clamp(drag.current.sheet + (delta > 0 ? -1 : 1), 0, 2))
    } else {
      setPosition({
        x: clamp(drag.current.origin.x + (event.clientX - drag.current.x) / window.innerWidth * 100, 18, 82),
        y: clamp(drag.current.origin.y + (event.clientY - drag.current.y) / window.innerHeight * 100, 2, 72),
      })
    }
    onMove?.()
  }
  const anchorPx = { x: anchor.x / 100 * window.innerWidth, y: anchor.y / 100 * window.innerHeight }
  const edgeCandidates = panelBounds ? [
    { x: panelBounds.left, y: clamp(anchorPx.y, panelBounds.top, panelBounds.bottom) },
    { x: panelBounds.right, y: clamp(anchorPx.y, panelBounds.top, panelBounds.bottom) },
    { x: clamp(anchorPx.x, panelBounds.left, panelBounds.right), y: panelBounds.top },
    { x: clamp(anchorPx.x, panelBounds.left, panelBounds.right), y: panelBounds.bottom },
  ] : [anchorPx]
  const panelEdge = edgeCandidates.reduce((nearest, edge) => Math.hypot(edge.x - anchorPx.x, edge.y - anchorPx.y) < Math.hypot(nearest.x - anchorPx.x, nearest.y - anchorPx.y) ? edge : nearest)
  const corner = 4
  const bendY = anchorPx.y + (panelEdge.y >= anchorPx.y ? corner * 2 : -corner * 2)
  const path = `M ${anchorPx.x} ${anchorPx.y} L ${anchorPx.x} ${bendY} Q ${anchorPx.x} ${panelEdge.y} ${anchorPx.x + (panelEdge.x > anchorPx.x ? corner : -corner)} ${panelEdge.y} L ${panelEdge.x} ${panelEdge.y}`
  const friends = agent ? (agent.socialIds || []).map(id => agents.find(person => person.id === id)).filter(Boolean) : []
  const domicile = agent ? buildings.find(place => place.id === agent.home?.id) : null
  const workplace = agent ? buildings.find(place => place.id === agent.workplaceId) : null
  const gatheringPlace = agent ? buildings.find(place => place.id === agent.favoriteVenueId) : null
  const relationButton = (place, fallback) => <button disabled={!place} onClick={() => place && onSelectBuilding({ ...place, label: place.type, purpose: fallback, capacity: 0 })}>{place?.name || 'Not assigned'}</button>

  return <>
    {!mobile && panelBounds && <svg className="detail-connector"><path d={path} /></svg>}
    <aside ref={panelRef} className={`panel details-panel sheet-${sheet}`} style={mobile ? undefined : { left: `${position.x}%`, top: `${position.y}%` }}>
      <div className="section-heading drag-handle" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
        <span className="move-grip" aria-hidden="true">✥</span><div><p className="kicker">{agent ? 'Selected agent' : item.label}</p><h2>{agent ? agent.name : building.name}</h2></div><button className="icon-button" onPointerDown={event => event.stopPropagation()} onClick={event => { event.stopPropagation(); onClose() }}>×</button>
      </div>
      {agent && mode === 'meso' ? <>
        <section className={networkCategory === 'social' ? 'network-section-active' : ''}><p className="kicker list-heading">Social network</p><div className="occupant-list">{friends.map(friend => <button key={friend.id} onClick={() => onSelectAgent(friend.id)}><i style={{ background: friend.color }} />{friend.name}<span>{friend.insideBuildingId ? 'At a place' : 'Travelling'}</span></button>)}</div></section>
        <section className={networkCategory === 'locations' ? 'network-section-active' : ''}><p className="kicker list-heading">Domicile</p><div className="relation-list">{relationButton(domicile, 'Home and recovery')}</div><p className="kicker list-heading">Work</p><div className="relation-list">{relationButton(workplace, 'Workplace')}</div><p className="kicker list-heading">Favorite gathering place</p><div className="relation-list">{relationButton(gatheringPlace, 'Social gathering place')}</div></section>
      </> : agent ? <>
        <div className="stat-grid"><span>Activity<strong>{agent.activity}</strong></span><span>Stage<strong>{agent.stage}</strong></span><span>BAC<strong>{agent.bac.toFixed(2)}</strong></span><span>Health<strong>{agent.health.toFixed(0)}</strong></span><span>Cash<strong>€{agent.cash.toFixed(0)}</strong></span><span>Location<strong>{agent.insideBuildingId ? 'Inside building' : 'Travelling'}</strong></span></div>
        <p className="kicker list-heading">Neurotransmitters</p><div className="neuro-grid">{Object.entries(agent.neurotransmitters || { dopamine: 50, serotonin: 50, gaba: 50 }).map(([name, value]) => <label key={name}><span>{name}<strong>{value}</strong></span><i><b style={{ width: `${value}%` }} /></i></label>)}</div>
        <button className="button primary wide" onClick={() => onFollowAgent(agent.id)}>Zoom and follow</button>
      </> : <>
        <div className="stat-grid"><span>Purpose<strong>{item.purpose}</strong></span><span>Capacity<strong>{item.capacity}</strong></span><span>Occupants<strong>{occupants.length}</strong></span><span>Status<strong>Operating</strong></span></div>
        <p className="kicker list-heading">{building.type === 'home' ? 'Who lives here' : 'Current occupants'}</p><div className="occupant-list">{(building.type === 'home' ? residents : occupants).map(person => <button key={person.id} onClick={() => onSelectAgent(person.id)}><i style={{ background: person.color }} />{person.name}<span>{person.insideBuildingId === building.id ? 'Present' : 'Away'}</span></button>)}</div>
      </>}
    </aside>
  </>
}
