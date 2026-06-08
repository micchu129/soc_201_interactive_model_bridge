import { useEffect, useRef, useState } from 'react'
import { populationDefaults } from '../config/populationDefaults'
import { policyDefaults } from '../config/policyDefaults'
import { worldDefaults } from '../config/worldDefaults'
import { speedOptions } from '../simulation/clock'
import { advanceRender, createPopulation, createWorld, decisionTick } from '../simulation/engine'
import { applyPolicies } from '../simulation/policyRules'
import { validateOptions } from '../simulation/validation'
import AdvancedOptions from './AdvancedOptions'
import AdvancedWarning from './AdvancedWarning'
import CityScene from './CityScene'
import DetailsPanel from './DetailsPanel'
import PolicyConsole from './PolicyConsole'

const STORAGE_KEY = 'simarc-bridge-v2'
const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms))

const initialState = {
  mode: 'hero', worldStage: 0, populationStage: 0, world: createWorld(worldDefaults), agents: [],
  worldOptions: worldDefaults, populationOptions: populationDefaults, policies: policyDefaults,
  pendingPolicies: null, simMinutes: 0, speed: 0, calendar: { day: 'Saturday', week: 1, time: '00:00', weekend: true },
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return saved?.version === 2 ? saved.state : initialState
  } catch {
    return initialState
  }
}

export default function ModelBridge() {
  const [state, setState] = useState(loadState)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [advancedType, setAdvancedType] = useState(null)
  const [warningFor, setWarningFor] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const lastFrame = useRef(0)
  const lastDecisionBoundary = useRef(Math.floor(state.simMinutes / 120))

  useEffect(() => {
    const id = window.setTimeout(() => localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, state })), 180)
    return () => window.clearTimeout(id)
  }, [state])

  useEffect(() => {
    let frame
    const loop = now => {
      const elapsedSeconds = lastFrame.current ? Math.min(.1, (now - lastFrame.current) / 1000) : 0
      lastFrame.current = now
      if (state.speed > 0 && state.agents.length) {
        setState(current => {
          let next = advanceRender(current, elapsedSeconds * current.speed)
          const boundary = Math.floor(next.simMinutes / 120)
          if (boundary > lastDecisionBoundary.current) {
            lastDecisionBoundary.current = boundary
            if (next.pendingPolicies) next = { ...next, policies: applyPolicies(next.policies, next.pendingPolicies), pendingPolicies: null }
            next = decisionTick(next)
          }
          return next
        })
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [state.speed, state.agents.length])

  const openAdvanced = type => {
    if (localStorage.getItem('simarc-dismiss-advanced-warning') === 'true') setAdvancedType(type)
    else setWarningFor(type)
  }

  const proceedAdvanced = dismiss => {
    if (dismiss) localStorage.setItem('simarc-dismiss-advanced-warning', 'true')
    setAdvancedType(warningFor)
    setWarningFor(null)
  }

  const generateWorld = async () => {
    setState(current => ({ ...current, mode: 'generation', world: createWorld(validateOptions(current.worldOptions)), worldStage: 0 }))
    for (const stage of [1, 2, 3, 4]) {
      await wait(780)
      setState(current => ({ ...current, worldStage: stage }))
    }
    await wait(650)
    setState(current => ({ ...current, mode: 'population' }))
  }

  const generatePopulation = async () => {
    setState(current => ({ ...current, populationStage: 1 }))
    await wait(650)
    setState(current => ({ ...current, agents: createPopulation(current.populationOptions, current.world), populationStage: 2 }))
    await wait(900)
    setState(current => decisionTick({ ...current, mode: 'micro', speed: 1 }))
  }

  const resetEverything = () => {
    localStorage.removeItem(STORAGE_KEY)
    setSelectedAgent(null)
    setSelectedBuilding(null)
    setState(initialState)
  }

  const restartSimulation = () => setState(current => decisionTick({ ...current, agents: createPopulation(current.populationOptions, current.world), simMinutes: 0, speed: 1, mode: 'micro' }))
  const generationLabels = ['Preparing model', 'Paving roads', 'Laying foundations', 'Zoning land', 'Raising structures']
  const detailAgent = state.agents.find(agent => agent.id === selectedAgent)
  const activeMode = ['micro', 'meso', 'macro'].includes(state.mode) ? state.mode : 'overview'

  return <main className="app-shell">
    <div className="canvas-layer"><CityScene world={state.world} worldStage={state.worldStage} agents={state.agents} populationStage={state.populationStage} mode={activeMode} selectedAgent={selectedAgent} onSelectAgent={id => { setSelectedAgent(id); setSelectedBuilding(null); setState(current => ({ ...current, mode: 'micro' })) }} onSelectBuilding={building => { setSelectedBuilding(building); setSelectedAgent(null) }} /></div>

    <header className="topbar"><button className="brand" onClick={() => setState(current => ({ ...current, mode: 'hero' }))}>SIMARC / MODEL BRIDGE</button>{state.worldStage > 0 && <div className="mode-nav">{['micro', 'meso', 'macro'].map(mode => <button key={mode} className={state.mode === mode ? 'active' : ''} disabled={!state.agents.length} onClick={() => { setSelectedAgent(null); setState(current => ({ ...current, mode })) }}>{mode}</button>)}</div>}<button className="icon-button" onClick={() => setMenuOpen(!menuOpen)}>⚙</button></header>

    {state.mode === 'hero' && <section className="hero-overlay"><p className="kicker">Enter the model</p><h1>SimARC Bridge</h1><p>A playable interface for translating alcohol models into policy conversations.</p><div className="button-row centered"><button className="button primary" onClick={state.worldStage > 0 ? () => setState(current => ({ ...current, mode: current.agents.length ? 'micro' : 'population' })) : generateWorld}>{state.worldStage > 0 ? 'Resume model' : 'Initialize model'}</button>{state.worldStage === 0 && <button className="button secondary" onClick={() => openAdvanced('world')}>Advanced options</button>}</div></section>}

    {state.mode === 'generation' && <section className="center-control panel"><p className="kicker">World initialization</p><h2>{generationLabels[state.worldStage]}</h2><div className="progress"><span style={{ width: `${state.worldStage / 4 * 100}%` }} /></div><p className="muted">Building a stable city context for the agent model.</p></section>}

    {state.mode === 'population' && <section className="center-control panel"><p className="kicker">Population initialization</p><h2>{state.populationStage ? 'Assigning agents…' : 'Generate the population'}</h2><p>Populate homes, social groups, and alcohol-stage distributions.</p><div className="button-row centered"><button className="button primary" disabled={state.populationStage > 0} onClick={generatePopulation}>Generate population</button><button className="button secondary" disabled={state.populationStage > 0} onClick={() => openAdvanced('population')}>Advanced options</button></div></section>}

    {['micro', 'meso'].includes(state.mode) && <section className="mode-caption panel"><p className="kicker">{state.mode} layer</p><h2>{state.mode === 'micro' ? 'Follow individual lives' : 'See networks and shared places'}</h2><p>{state.mode === 'micro' ? 'Click an agent to enter follow-cam and inspect their current state.' : 'Orbit the city to understand how routes, venues, and groups connect.'}</p></section>}

    {state.mode === 'macro' && <PolicyConsole state={state} onApply={policies => setState(current => ({ ...current, pendingPolicies: policies }))} />}
    <DetailsPanel building={selectedBuilding} agent={detailAgent} onClose={() => { setSelectedAgent(null); setSelectedBuilding(null) }} />

    {state.agents.length > 0 && state.mode !== 'hero' && <footer className="sim-controls panel"><div><strong>{state.calendar.day}</strong><span>Week {state.calendar.week} · {state.calendar.time}</span></div><div className="speed-controls">{speedOptions.map(speed => <button key={speed} className={state.speed === speed ? 'active' : ''} onClick={() => setState(current => ({ ...current, speed }))}>{speed === 0 ? 'Pause' : `${speed}×`}</button>)}</div></footer>}

    {menuOpen && <aside className="panel settings-menu"><div className="section-heading"><h2>Model settings</h2><button className="icon-button" onClick={() => setMenuOpen(false)}>×</button></div><button onClick={restartSimulation}>Restart simulation</button><button onClick={() => setState(current => ({ ...current, agents: [], populationStage: 0, mode: 'population', speed: 0 }))}>Regenerate population</button><button className="danger" onClick={resetEverything}>Reset everything</button></aside>}
    {warningFor && <AdvancedWarning onBack={() => setWarningFor(null)} onProceed={proceedAdvanced} />}
    {advancedType && <AdvancedOptions type={advancedType} values={advancedType === 'world' ? state.worldOptions : state.populationOptions} onChange={values => setState(current => ({ ...current, [advancedType === 'world' ? 'worldOptions' : 'populationOptions']: values }))} onClose={() => setAdvancedType(null)} />}
  </main>
}
