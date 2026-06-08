import { useEffect, useRef, useState } from 'react'
import { populationDefaults } from '../config/populationDefaults'
import { policyDefaults } from '../config/policyDefaults'
import { worldDefaults } from '../config/worldDefaults'
import { speedOptions } from '../simulation/clock'
import { advanceRender, createPopulation, createWorld, decisionTick, outcomesFromState } from '../simulation/engine'
import { applyPolicies } from '../simulation/policyRules'
import { validateOptions } from '../simulation/validation'
import AdvancedOptions from './AdvancedOptions'
import AdvancedWarning from './AdvancedWarning'
import AgentDirectory from './AgentDirectory'
import CityScene from './CityScene'
import DetailsPanel from './DetailsPanel'
import PolicyConsole from './PolicyConsole'
import TutorialOverlay from './TutorialOverlay'

const STORAGE_KEY = 'simarc-bridge-v4'
const FIXED_SIM_STEP = .25
const MAX_SIM_STEPS_PER_FRAME = 32
const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms))
const initialState = {
  mode: 'hero', worldStage: 0, populationStage: 0, world: createWorld(worldDefaults), agents: [],
  worldOptions: worldDefaults, populationOptions: populationDefaults, policies: policyDefaults,
  pendingPolicies: null, simMinutes: 0, speed: 0, calendar: { day: 'Saturday', week: 1, time: '00:00', period: 'Night', weekend: true }, history: [],
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return saved?.version === 4 ? saved.state : initialState
  } catch { return initialState }
}

export default function ModelBridge() {
  const [state, setState] = useState(loadState)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [highlightedAgent, setHighlightedAgent] = useState(null)
  const [highlightedBuilding, setHighlightedBuilding] = useState(null)
  const [followedAgent, setFollowedAgent] = useState(null)
  const [findTarget, setFindTarget] = useState(null)
  const [detailAnchor, setDetailAnchor] = useState({ x: 50, y: 50 })
  const [panel, setPanel] = useState(null)
  const [tutorialEnabled, setTutorialEnabled] = useState(() => localStorage.getItem('simarc-tutorial-enabled') !== 'false')
  const [tutorialStep, setTutorialStep] = useState(null)
  const [dismissedCaptions, setDismissedCaptions] = useState(() => JSON.parse(localStorage.getItem('simarc-dismissed-captions') || '{}'))
  const [uiScale, setUiScale] = useState(() => Number(localStorage.getItem('simarc-ui-scale-v2')) || 1)
  const [cameraResetKey, setCameraResetKey] = useState(0)
  const [cameraPreset, setCameraPreset] = useState(null)
  const [generationProgress, setGenerationProgress] = useState(() => state.worldStage >= 4 ? 1 : 0)
  const lastFrame = useRef(0)
  const simulationAccumulator = useRef(0)
  const lastDecisionBoundary = useRef(Math.floor(state.simMinutes / 120))

  useEffect(() => {
    const id = window.setTimeout(() => localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 4, state })), 180)
    return () => window.clearTimeout(id)
  }, [state])
  useEffect(() => {
    localStorage.setItem('simarc-ui-scale-v2', String(uiScale))
    document.documentElement.style.setProperty('--ui-scale', uiScale)
  }, [uiScale])
  useEffect(() => {
    let frame
    const loop = now => {
      const elapsed = lastFrame.current ? Math.min(.1, (now - lastFrame.current) / 1000) : 0
      lastFrame.current = now
      if (state.speed > 0 && state.agents.length) setState(current => {
        simulationAccumulator.current += elapsed * current.speed
        let next = current
        let steps = 0
        while (simulationAccumulator.current >= FIXED_SIM_STEP && steps < MAX_SIM_STEPS_PER_FRAME) {
          next = advanceRender(next, FIXED_SIM_STEP)
          simulationAccumulator.current -= FIXED_SIM_STEP
          steps += 1
          const boundary = Math.floor(next.simMinutes / 120)
          if (boundary > lastDecisionBoundary.current) {
            lastDecisionBoundary.current = boundary
            if (next.pendingPolicies) next = { ...next, policies: applyPolicies(next.policies, next.pendingPolicies), pendingPolicies: null }
            next = decisionTick(next)
            next = { ...next, history: [...(next.history || []), { minute: next.simMinutes, consumption: Number(outcomesFromState(next).consumption) }].slice(-80) }
          }
        }
        return next
      })
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [state.speed, state.agents.length])
  useEffect(() => { if (state.speed === 0) simulationAccumulator.current = 0 }, [state.speed])

  const closePanels = () => setPanel(null)
  const clearSelection = () => { setSelectedAgent(null); setSelectedBuilding(null); setFollowedAgent(null); setHighlightedAgent(null); setHighlightedBuilding(null) }
  const openAdvanced = type => {
    closePanels()
    setPanel(localStorage.getItem('simarc-dismiss-advanced-warning') === 'true' ? `advanced-${type}` : `warning-${type}`)
  }
  const proceedAdvanced = dismiss => {
    if (dismiss) localStorage.setItem('simarc-dismiss-advanced-warning', 'true')
    setPanel(panel.replace('warning-', 'advanced-'))
  }
  const generateWorld = async () => {
    closePanels()
    setState(current => ({ ...current, mode: 'generation', world: createWorld(validateOptions(current.worldOptions)), worldStage: 0 }))
    setGenerationProgress(0)
    const started = performance.now()
    await new Promise(resolve => {
      const animate = now => {
        const progress = Math.min(1, (now - started) / 10000)
        setGenerationProgress(progress)
        setState(current => ({ ...current, worldStage: progress < .28 ? 1 : progress < .48 ? 2 : progress < .68 ? 3 : 4 }))
        if (progress < 1) requestAnimationFrame(animate)
        else resolve()
      }
      requestAnimationFrame(animate)
    })
    await wait(350)
    setState(current => ({ ...current, mode: 'population' }))
  }
  const generatePopulation = async () => {
    closePanels()
    setState(current => ({ ...current, populationStage: 1 }))
    await wait(900)
    setState(current => ({ ...current, agents: createPopulation(current.populationOptions, current.world), populationStage: 2 }))
    await wait(1500)
    setState(current => decisionTick({ ...current, mode: 'micro', speed: 1 }))
    setCameraResetKey(key => key + 1)
    if (tutorialEnabled) setTutorialStep(0)
  }
  const changeMode = mode => {
    closePanels()
    setFollowedAgent(null)
    setFindTarget(null)
    setCameraPreset(null)
    setTutorialStep(null)
    setCameraResetKey(key => key + 1)
    setState(current => ({ ...current, mode }))
  }
  const resetEverything = () => {
    localStorage.removeItem(STORAGE_KEY)
    closePanels(); clearSelection(); setGenerationProgress(0); setCameraResetKey(key => key + 1); setState(initialState)
  }
  const restartSimulation = () => {
    closePanels(); setCameraResetKey(key => key + 1)
    setState(current => decisionTick({ ...current, agents: createPopulation(current.populationOptions, current.world), simMinutes: 0, speed: 1, mode: 'micro' }))
  }
  const nextTutorial = () => {
    if (tutorialStep === 2) { setTutorialStep(null); changeMode('micro'); return }
    const next = tutorialStep + 1
    setTutorialStep(next)
    setCameraResetKey(key => key + 1)
    setState(current => ({ ...current, mode: ['micro', 'meso', 'macro'][next] }))
  }

  const detailAgent = state.agents.find(agent => agent.id === selectedAgent)
  const activeMode = ['micro', 'meso', 'macro'].includes(state.mode) ? state.mode : 'overview'
  const occupants = selectedBuilding ? state.agents.filter(agent => agent.insideBuildingId === selectedBuilding.id) : []
  const residents = selectedBuilding?.type === 'home' ? state.agents.filter(agent => agent.home.id === selectedBuilding.id) : []
  const labels = ['Preparing model', 'Paving roads', 'Laying foundations', 'Zoning land', 'Raising structures']
  const dismissCaption = mode => {
    const next = { ...dismissedCaptions, [mode]: true }
    setDismissedCaptions(next)
    localStorage.setItem('simarc-dismissed-captions', JSON.stringify(next))
  }
  const selectAgent = id => {
    const agent = state.agents.find(item => item.id === id)
    setPanel(null); setFollowedAgent(null); setSelectedAgent(id); setSelectedBuilding(null); setHighlightedAgent(id); setHighlightedBuilding(agent?.insideBuildingId || null)
  }
  const selectBuilding = building => { setPanel(null); setFollowedAgent(null); setSelectedAgent(null); setSelectedBuilding(building); setHighlightedBuilding(building?.id || null) }
  const followAgent = id => { setPanel(null); setSelectedAgent(id); setSelectedBuilding(null); setHighlightedAgent(id); setFollowedAgent(id); setFindTarget(null); setState(current => ({ ...current, mode: 'micro' })) }
  const findAgent = id => {
    const agent = state.agents.find(item => item.id === id)
    const building = agent?.insideBuildingId ? state.world.buildings.find(item => item.id === agent.insideBuildingId) : null
    if (!agent) return
    setFollowedAgent(null); setSelectedAgent(id); setSelectedBuilding(null); setHighlightedAgent(id); setHighlightedBuilding(building?.id || null)
    setFindTarget({ x: building?.x ?? agent.position.x, z: building?.z ?? agent.position.z, key: Date.now() }); setCameraPreset('custom'); setCameraResetKey(key => key + 1)
  }

  return <main className={`app-shell ${state.mode === 'macro' ? 'macro-layout' : ''}`}>
    <div className={`canvas-layer ${state.mode === 'macro' ? 'macro-canvas' : ''}`}><CityScene world={state.world} generationProgress={generationProgress} agents={state.agents} populationStage={state.populationStage} mode={activeMode} cameraPreset={cameraPreset} selectedAgent={selectedAgent} selectedBuilding={selectedBuilding} followedAgent={followedAgent} highlightedAgent={highlightedAgent} highlightedBuilding={highlightedBuilding} findTarget={findTarget} simMinutes={state.simMinutes} cameraResetKey={cameraResetKey} onCustomView={() => setCameraPreset('custom')} onAnchorChange={setDetailAnchor} onSelectAgent={selectAgent} onSelectBuilding={selectBuilding} /></div>
    <header className="topbar"><button className="brand" onClick={() => changeMode('hero')}>SIMARC / MODEL BRIDGE</button>{['micro', 'meso', 'macro'].includes(state.mode) && tutorialStep == null && <div className="mode-nav">{['micro', 'meso', 'macro'].map(mode => <button key={mode} className={state.mode === mode ? 'active' : ''} onClick={() => changeMode(mode)}>{mode}</button>)}</div>}<button className="icon-button" onClick={() => { closePanels(); setPanel('settings') }}>⚙</button></header>

    {state.mode === 'hero' && <section className="hero-overlay"><p className="kicker">Enter the model</p><h1>SimARC Bridge</h1><p>A playable interface for translating alcohol models into policy conversations.</p><button className="button primary" onClick={state.worldStage > 0 ? () => changeMode(state.agents.length ? 'micro' : 'population') : generateWorld}>{state.worldStage > 0 ? 'Resume model' : 'Initialize model'}</button>{state.worldStage === 0 && <button className="advanced-link" onClick={() => openAdvanced('world')}>Advanced options</button>}</section>}
    {state.mode === 'generation' && <section className="center-control panel"><p className="kicker">World initialization</p><h2>{labels[state.worldStage]}</h2><div className="progress"><span style={{ width: `${generationProgress * 100}%` }} /></div><p className="muted">Building a stable city context for the agent model.</p></section>}
    {state.mode === 'population' && <section className="center-control panel"><p className="kicker">Population initialization</p><h2>{state.populationStage ? 'Assigning agents…' : 'Generate the population'}</h2><p>Populate homes, streets, venues, and alcohol-stage distributions.</p><label className="check-row centered-check"><input type="checkbox" checked={tutorialEnabled} onChange={event => { setTutorialEnabled(event.target.checked); localStorage.setItem('simarc-tutorial-enabled', String(event.target.checked)) }} /> Tutorial after generation</label><button className="button primary" disabled={state.populationStage > 0} onClick={generatePopulation}>Generate population</button><button className="advanced-link" disabled={state.populationStage > 0} onClick={() => openAdvanced('population')}>Advanced options</button></section>}
    {tutorialStep == null && ['micro', 'meso'].includes(state.mode) && !dismissedCaptions[state.mode] && <section className="mode-caption panel"><button className="caption-close" onClick={() => dismissCaption(state.mode)}>×</button><p className="kicker">{state.mode} layer</p><h2>{state.mode === 'micro' ? 'Follow individual lives' : 'See networks and shared places'}</h2><p>{state.mode === 'micro' ? 'Click an agent to inspect their current state.' : 'Orbit the city to understand shared routes and places.'}</p></section>}
    {state.mode === 'macro' && <PolicyConsole state={state} onSpeed={speed => setState(current => ({ ...current, speed }))} onApply={policies => setState(current => ({ ...current, pendingPolicies: policies }))} />}
    {panel == null && state.mode !== 'macro' && <DetailsPanel building={selectedBuilding} agent={detailAgent} anchor={detailAnchor} occupants={occupants} residents={residents} onSelectAgent={selectAgent} onFollowAgent={followAgent} onClose={() => { setSelectedAgent(null); setSelectedBuilding(null) }} />}
    {state.worldStage > 0 && state.mode !== 'hero' && state.mode !== 'macro' && <nav className="camera-presets panel" aria-label="Camera views">
      <span>Views</span>
      {[['default', 'Default', '◇'], ['street', 'Street', '▥'], ['top', 'Top', '▦'], ['custom', 'Custom', '✥']].map(([preset, label, icon]) => <button key={preset} className={(cameraPreset || 'default') === preset ? 'active' : ''} title={label} disabled={preset === 'custom'} onClick={() => { setFollowedAgent(null); setFindTarget(null); setCameraPreset(preset === 'default' ? null : preset); setCameraResetKey(key => key + 1) }}><b>{icon}</b><small>{label}</small></button>)}
    </nav>}

    {state.agents.length > 0 && state.mode !== 'hero' && state.mode !== 'macro' && <footer className="sim-controls panel"><div><strong>{state.calendar.time}</strong><span>{state.calendar.day} · Week {state.calendar.week} · {state.calendar.period}</span></div><div className="speed-controls">{speedOptions.map(speed => <button key={speed} className={state.speed === speed ? 'active' : ''} onClick={() => setState(current => ({ ...current, speed }))}>{speed === 0 ? '❚❚' : speed === 1 ? '▶' : `${speed}×`}</button>)}</div></footer>}
    {state.agents.length > 0 && state.mode !== 'hero' && state.mode !== 'macro' && <button className="directory-button panel" onClick={() => { closePanels(); setPanel('directory') }}>☷ Agent Directory</button>}
    {state.worldStage > 0 && state.mode !== 'hero' && <button className="help-button panel" onClick={() => { closePanels(); setPanel('camera-help') }}>?</button>}

    {panel === 'settings' && <aside className="panel settings-menu"><div className="section-heading"><h2>Model settings</h2><button className="icon-button" onClick={closePanels}>×</button></div><label className="scale-control"><span>UI scale <strong>{Math.round(uiScale * 100)}%</strong></span><input type="range" min=".75" max="1.5" step=".05" value={uiScale} onChange={event => setUiScale(Number(event.target.value))} /></label><button onClick={restartSimulation}>Restart simulation</button><button onClick={() => { closePanels(); setState(current => ({ ...current, agents: [], populationStage: 0, mode: 'population', speed: 0 })) }}>Regenerate population</button><button className="danger" onClick={resetEverything}>Reset everything</button></aside>}
    {panel === 'camera-help' && <aside className="panel camera-help"><div className="section-heading"><h2>Camera controls</h2><button className="icon-button" onClick={closePanels}>×</button></div><p><strong>Left drag</strong> orbit</p><p><strong>Right drag</strong> pan</p><p><strong>Scroll</strong> zoom</p><p><strong>W A S D</strong> move within the city bounds</p><p>Manual movement activates the <strong>Custom</strong> view.</p><p><strong>Micro</strong> follows individual lives. <strong>Meso</strong> reveals networks. <strong>Macro</strong> opens the policy lab.</p><button className="button secondary wide" onClick={() => { setDismissedCaptions({}); localStorage.removeItem('simarc-dismissed-captions'); closePanels() }}>Restore mode tips</button></aside>}
    {panel === 'directory' && <AgentDirectory agents={state.agents} onClose={closePanels} onFind={findAgent} onFollow={followAgent} onHighlight={id => { setHighlightedBuilding(null); setHighlightedAgent(current => current === id ? null : id) }} onDetails={selectAgent} />}
    {tutorialStep != null && <TutorialOverlay step={tutorialStep} onNext={nextTutorial} onSkip={() => { setTutorialStep(null); changeMode('micro') }} />}
    {panel?.startsWith('warning-') && <AdvancedWarning onBack={closePanels} onProceed={proceedAdvanced} />}
    {panel?.startsWith('advanced-') && <AdvancedOptions type={panel.replace('advanced-', '')} values={panel.endsWith('world') ? state.worldOptions : state.populationOptions} onChange={values => setState(current => ({ ...current, [panel.endsWith('world') ? 'worldOptions' : 'populationOptions']: values }))} onClose={closePanels} />}
  </main>
}
