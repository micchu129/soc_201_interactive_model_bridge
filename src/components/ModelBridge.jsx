import { useEffect, useRef, useState } from 'react'
import { populationDefaults } from '../config/populationDefaults'
import { policyDefaults } from '../config/policyDefaults'
import { tutorialSteps } from '../config/tutorialSteps'
import { worldDefaults } from '../config/worldDefaults'
import { calendarFromMinutes, speedOptions } from '../simulation/clock'
import { advanceRender, createPopulation, createWorld, decisionTick, historySampleFromState } from '../simulation/engine'
import { applyPolicies } from '../simulation/policyRules'
import { validateOptions } from '../simulation/validation'
import AdvancedOptions from './AdvancedOptions'
import AdvancedWarning from './AdvancedWarning'
import AgentDirectory from './AgentDirectory'
import CityScene from './CityScene'
import DetailsPanel from './DetailsPanel'
import PolicyConsole from './PolicyConsole'
import SlidingToggleGroup from './SlidingToggleGroup'
import TutorialOverlay from './TutorialOverlay'

const IS_DEV_PREVIEW = window.location.pathname.includes('/dev/')
const storageKey = key => `simarc-${IS_DEV_PREVIEW ? 'dev-' : ''}${key}`
const STORAGE_KEY = storageKey('bridge-v4')
const STORAGE_VERSION = 6
const INITIAL_SIM_MINUTES = 360
const UI_SCALE_BASELINE = .75
const FIXED_SIM_STEP = .25
const MAX_SIM_STEPS_PER_FRAME = 32
const HISTORY_LIMIT = 30 * 12
const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms))
const initialState = {
  mode: 'hero', worldStage: 0, populationStage: 0, world: createWorld(worldDefaults), agents: [],
  worldOptions: worldDefaults, populationOptions: populationDefaults, policies: policyDefaults,
  pendingPolicies: null, simMinutes: INITIAL_SIM_MINUTES, speed: 0, calendar: calendarFromMinutes(INITIAL_SIM_MINUTES), history: [],
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (![4, 5, STORAGE_VERSION].includes(saved?.version)) return initialState
    const workplaces = (saved.state.world?.buildings || []).filter(building => ['hospital', 'rehab', 'police', 'shop', 'bar', 'club'].includes(building.type))
    return {
      ...saved.state,
      calendar: calendarFromMinutes(saved.state.simMinutes ?? INITIAL_SIM_MINUTES),
      history: saved.version === STORAGE_VERSION ? saved.state.history || [] : [],
      agents: (saved.state.agents || []).map((agent, index) => ({
        ...agent, consumptionEvents: agent.consumptionEvents || [],
        workplaceId: agent.workplaceId || workplaces[(index * 5 + agent.stage) % workplaces.length]?.id,
      })),
    }
  } catch { return initialState }
}

export default function ModelBridge() {
  const [state, setState] = useState(loadState)
  const [selectedAgent, setSelectedAgent] = useState(() => JSON.parse(localStorage.getItem(storageKey('tutorial-session-v1')) || 'null')?.selectedAgent ?? null)
  const [selectedBuilding, setSelectedBuilding] = useState(() => JSON.parse(localStorage.getItem(storageKey('tutorial-session-v1')) || 'null')?.selectedBuilding ?? null)
  const [highlightedAgent, setHighlightedAgent] = useState(null)
  const [highlightedBuilding, setHighlightedBuilding] = useState(null)
  const [followedAgent, setFollowedAgent] = useState(null)
  const [findTarget, setFindTarget] = useState(null)
  const [detailAnchor, setDetailAnchor] = useState({ x: 50, y: 50 })
  const [panel, setPanel] = useState(null)
  const [tutorialEnabled, setTutorialEnabled] = useState(() => localStorage.getItem(storageKey('tutorial-enabled')) !== 'false')
  const [savedTutorial] = useState(() => JSON.parse(localStorage.getItem(storageKey('tutorial-session-v1')) || 'null'))
  const [tutorialStep, setTutorialStep] = useState(() => savedTutorial?.step ?? null)
  const [tutorialActions, setTutorialActions] = useState(() => savedTutorial?.actions || {})
  const [dismissedCaptions, setDismissedCaptions] = useState(() => JSON.parse(localStorage.getItem(storageKey('dismissed-captions')) || '{}'))
  const [uiScale, setUiScale] = useState(() => {
    const current = Number(localStorage.getItem(storageKey('ui-scale-v4')))
    if (current) return current
    const legacy = Number(localStorage.getItem(storageKey('ui-scale-v3')))
    return legacy ? legacy / UI_SCALE_BASELINE : 1
  })
  const [clockFormat, setClockFormat] = useState(() => localStorage.getItem(storageKey('clock-format')) || '24h')
  const [skipGenerationAnimation, setSkipGenerationAnimation] = useState(false)
  const [networkCategory, setNetworkCategory] = useState('all')
  const [restorePhase, setRestorePhase] = useState(null)
  const [cameraResetKey, setCameraResetKey] = useState(0)
  const [cameraPreset, setCameraPreset] = useState(null)
  const [generationProgress, setGenerationProgress] = useState(() => state.worldStage >= 4 ? 1 : 0)
  const lastFrame = useRef(0)
  const simulationAccumulator = useRef(0)
  const lastDecisionBoundary = useRef(Math.floor(state.simMinutes / 120))
  const simMinutesRef = useRef(state.simMinutes)
  const tutorialSnapshot = useRef(savedTutorial?.snapshot || null)
  const demoTarget = useRef(savedTutorial?.demoTarget || null)
  const skipGenerationRef = useRef(false)

  const tutorial = tutorialStep == null ? null : tutorialSteps[tutorialStep]
  const noteTutorialAction = action => setTutorialActions(current => ({ ...current, [action]: true }))
  const clearSelection = () => { setSelectedAgent(null); setSelectedBuilding(null); setFollowedAgent(null); setHighlightedAgent(null); setHighlightedBuilding(null) }
  const closePanels = () => { setPanel(null); noteTutorialAction('close-panel') }
  function finishTutorial() {
    setTutorialStep(null); setTutorialActions({ 'unlock-agent': true, 'unlock-building': true })
    setHighlightedAgent(null); setHighlightedBuilding(null); setState(current => ({ ...current, speed: 1 }))
  }

  useEffect(() => {
    const id = window.setTimeout(() => localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, state })), 180)
    return () => window.clearTimeout(id)
  }, [state])
  useEffect(() => {
    localStorage.setItem(storageKey('ui-scale-v4'), String(uiScale))
    document.documentElement.style.setProperty('--ui-scale', uiScale * UI_SCALE_BASELINE)
  }, [uiScale])
  useEffect(() => { localStorage.setItem(storageKey('clock-format'), clockFormat) }, [clockFormat])
  useEffect(() => {
    localStorage.setItem(storageKey('tutorial-session-v1'), JSON.stringify({ step: tutorialStep, actions: tutorialActions, snapshot: tutorialSnapshot.current, demoTarget: demoTarget.current, selectedAgent, selectedBuilding }))
  }, [tutorialStep, tutorialActions, selectedAgent, selectedBuilding])
  useEffect(() => { simMinutesRef.current = state.simMinutes }, [state.simMinutes])
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
            next = { ...next, history: [...(next.history || []), historySampleFromState(next, next.simMinutes - 120)].slice(-HISTORY_LIMIT) }
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
  useEffect(() => {
    if (!tutorial?.auto || !tutorialActions[tutorial.requirement]) return
    const id = window.setTimeout(() => {
      if (tutorial.requirement === 'settings') setPanel(null)
      if (tutorialStep === tutorialSteps.length - 1) finishTutorial()
      else setTutorialStep(current => current + 1)
    }, 850)
    return () => window.clearTimeout(id)
  }, [tutorial, tutorialActions, tutorialStep])
  useEffect(() => {
    if (!tutorialActions['speed-demo-running'] || !demoTarget.current || !tutorialSnapshot.current) return
    if (simMinutesRef.current < demoTarget.current) return
    setState(current => ({ ...current, speed: 0 }))
    setTutorialActions(current => ({ ...current, 'speed-demo-running': false, 'rewind-running': true }))
    setRestorePhase(3)
    let frame = 3
    const rewind = window.setInterval(() => {
      frame -= 1
      setRestorePhase(frame)
      if (frame <= 0) {
        window.clearInterval(rewind)
        setState({ ...tutorialSnapshot.current, speed: 0 })
        demoTarget.current = null
        setRestorePhase(null)
        setTutorialActions(current => ({ ...current, 'speed-demo': true, 'rewind-running': false }))
      }
    }, 500)
    return () => window.clearInterval(rewind)
  }, [tutorialActions])

  const generateWorld = async () => {
    closePanels()
    skipGenerationRef.current = skipGenerationAnimation
    setState(current => ({ ...current, mode: 'generation', world: createWorld(validateOptions(current.worldOptions)), worldStage: 0 }))
    setGenerationProgress(0)
    const started = performance.now()
    await new Promise(resolve => {
      const animate = now => {
        const progress = skipGenerationRef.current ? 1 : Math.min(1, (now - started) / 10000)
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
    setState(current => {
      const populated = decisionTick({ ...current, mode: 'micro', speed: tutorialEnabled ? 0 : 1, simMinutes: INITIAL_SIM_MINUTES, calendar: calendarFromMinutes(INITIAL_SIM_MINUTES), history: [] })
      return { ...populated, history: [historySampleFromState(populated, INITIAL_SIM_MINUTES)] }
    })
    setCameraResetKey(key => key + 1)
    if (tutorialEnabled) { setTutorialActions({}); setTutorialStep(0) }
  }
  const changeMode = mode => {
    closePanels(); setFollowedAgent(null); setFindTarget(null); setCameraPreset(null); setCameraResetKey(key => key + 1)
    setState(current => ({ ...current, mode })); noteTutorialAction(mode)
  }
  const resetEverything = () => {
    Object.keys(localStorage).filter(key => key.startsWith('simarc-')).forEach(key => localStorage.removeItem(key))
    tutorialSnapshot.current = null; demoTarget.current = null; skipGenerationRef.current = false
    simulationAccumulator.current = 0; lastDecisionBoundary.current = Math.floor(INITIAL_SIM_MINUTES / 120)
    closePanels(); clearSelection(); setTutorialStep(null); setTutorialActions({}); setDismissedCaptions({}); setUiScale(1); setSkipGenerationAnimation(false); setNetworkCategory('all'); setRestorePhase(null); setGenerationProgress(0); setCameraPreset(null); setFindTarget(null); setCameraResetKey(key => key + 1); setState({ ...initialState, history: [historySampleFromState(initialState, INITIAL_SIM_MINUTES)] })
  }
  const restartSimulation = () => {
    closePanels(); setCameraResetKey(key => key + 1)
    setState(current => {
      const restarted = decisionTick({ ...current, agents: createPopulation(current.populationOptions, current.world), simMinutes: INITIAL_SIM_MINUTES, calendar: calendarFromMinutes(INITIAL_SIM_MINUTES), history: [], speed: 1, mode: 'micro' })
      return { ...restarted, history: [historySampleFromState(restarted, INITIAL_SIM_MINUTES)] }
    })
  }
  const nextTutorial = () => tutorialStep === tutorialSteps.length - 1 ? finishTutorial() : setTutorialStep(step => step + 1)
  const setSpeed = speed => {
    if (speed === 128 && tutorial?.requirement === 'speed-demo' && !tutorialActions['speed-demo-running']) {
      tutorialSnapshot.current = structuredClone({ ...state, speed: 0 })
      demoTarget.current = state.simMinutes + 2880
      setCameraPreset(null); setCameraResetKey(key => key + 1)
      setTutorialActions(current => ({ ...current, 'speed-demo-running': true }))
    }
    setState(current => ({ ...current, speed }))
    noteTutorialAction(speed === 0 ? 'pause' : 'play')
  }
  const openAdvanced = type => { closePanels(); setPanel(localStorage.getItem(storageKey('dismiss-advanced-warning')) === 'true' ? `advanced-${type}` : `warning-${type}`) }
  const proceedAdvanced = dismiss => { if (dismiss) localStorage.setItem(storageKey('dismiss-advanced-warning'), 'true'); setPanel(panel.replace('warning-', 'advanced-')) }
  const selectAgent = id => {
    if (tutorial && !tutorialActions['unlock-agent'] && tutorial.requirement !== 'agent') return
    const agent = state.agents.find(item => item.id === id)
    setPanel(null); setFollowedAgent(null); setSelectedAgent(id); setSelectedBuilding(null); setHighlightedAgent(id); setHighlightedBuilding(agent?.insideBuildingId || null)
    noteTutorialAction(state.mode === 'meso' ? 'meso-agent' : 'agent'); noteTutorialAction('unlock-agent')
  }
  const selectBuilding = building => {
    if (!building) { clearSelection(); return }
    if (tutorial && !tutorialActions['unlock-building'] && tutorial.requirement !== 'building') return
    setPanel(null); setFollowedAgent(null); setSelectedAgent(null); setSelectedBuilding(building); setHighlightedBuilding(building.id)
    noteTutorialAction(state.mode === 'meso' ? 'meso-building' : 'building'); noteTutorialAction('unlock-building')
  }
  const followAgent = id => { setPanel(null); setSelectedAgent(id); setSelectedBuilding(null); setHighlightedAgent(id); setFollowedAgent(id); setFindTarget(null); setState(current => ({ ...current, mode: 'micro' })) }
  const findAgent = id => {
    const agent = state.agents.find(item => item.id === id)
    const building = agent?.insideBuildingId ? state.world.buildings.find(item => item.id === agent.insideBuildingId) : null
    if (!agent) return
    setFollowedAgent(null); setSelectedAgent(id); setSelectedBuilding(null); setHighlightedAgent(id); setHighlightedBuilding(building?.id || null)
    setFindTarget({ x: building?.x ?? agent.position.x, z: building?.z ?? agent.position.z, key: Date.now() }); setCameraPreset('custom'); setCameraResetKey(key => key + 1)
  }

  const detailAgent = state.agents.find(agent => agent.id === selectedAgent)
  const tutorialFriends = detailAgent ? (detailAgent.socialIds || []).map(id => state.agents.find(agent => agent.id === id)).filter(Boolean) : []
  const tutorialNetwork = detailAgent ? [detailAgent, ...tutorialFriends] : []
  const tutorialHighlightedAgents = tutorial?.highlight === 'friends' ? tutorialFriends.map(agent => agent.id) : []
  const tutorialHighlightedBuildings = tutorial?.highlight === 'friends' ? tutorialFriends.map(agent => agent.insideBuildingId).filter(Boolean)
    : tutorial?.highlight === 'homes' ? tutorialNetwork.map(agent => agent.home?.id).filter(Boolean)
      : tutorial?.highlight === 'workplaces' ? tutorialNetwork.map(agent => agent.workplaceId).filter(Boolean)
        : tutorial?.highlight === 'gatherings' ? tutorialNetwork.map(agent => agent.favoriteVenueId).filter(Boolean) : []
  const tutorialReady = !tutorial?.requirement || Boolean(tutorialActions[tutorial.requirement])
  const activeMode = ['micro', 'meso', 'macro'].includes(state.mode) ? state.mode : 'overview'
  const occupants = selectedBuilding ? state.agents.filter(agent => agent.insideBuildingId === selectedBuilding.id) : []
  const residents = selectedBuilding?.type === 'home' ? state.agents.filter(agent => agent.home.id === selectedBuilding.id) : []
  const labels = ['Preparing model', 'Paving roads', 'Laying foundations', 'Zoning land', 'Raising structures']
  const displayCalendar = calendarFromMinutes(state.simMinutes)
  const displayTime = clockFormat === '24h' ? displayCalendar.time : (() => {
    const [hours, minutes] = displayCalendar.time.split(':').map(Number)
    return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`
  })()
  const speedControlItems = speedOptions.map(speed => ({
    value: speed,
    label: speed === 0 ? '❚❚' : speed === 1 ? '▶' : `${speed}×`,
    disabled: tutorial != null && (
      tutorial.requirement === 'speed-demo' ? speed !== 128 :
        tutorial.requirement === 'play' ? speed !== 1 :
          tutorial.requirement === 'pause' ? speed !== 0 : true
    ),
  }))
  const dismissCaption = mode => { const next = { ...dismissedCaptions, [mode]: true }; setDismissedCaptions(next); localStorage.setItem(storageKey('dismissed-captions'), JSON.stringify(next)) }

  return <main className={`app-shell ${state.mode === 'macro' ? 'macro-layout' : ''}`}>
    {IS_DEV_PREVIEW && <div className="dev-preview-banner">DEV PREVIEW</div>}
    <div className={`canvas-layer ${state.mode === 'macro' ? 'macro-canvas' : ''}`}><CityScene world={state.world} generationProgress={generationProgress} agents={state.agents} populationStage={state.populationStage} mode={activeMode} cameraPreset={cameraPreset} selectedAgent={selectedAgent} selectedBuilding={selectedBuilding} followedAgent={followedAgent} highlightedAgent={highlightedAgent} highlightedBuilding={highlightedBuilding} highlightedAgents={tutorialHighlightedAgents} highlightedBuildings={tutorialHighlightedBuildings} findTarget={findTarget} simMinutes={state.simMinutes} cameraResetKey={cameraResetKey} onCustomView={() => { setCameraPreset('custom'); noteTutorialAction('camera-manual') }} onAnchorChange={setDetailAnchor} onNetworkCategory={category => { setNetworkCategory(category); noteTutorialAction(`network-${category}`) }} onSelectAgent={selectAgent} onSelectBuilding={selectBuilding} /></div>
    <header className="topbar"><button className="brand" onClick={() => changeMode('hero')}>SIMARC / MODEL BRIDGE <span className="beta-badge">BETA</span></button><button className="icon-button" onClick={() => { closePanels(); setPanel('settings'); noteTutorialAction('settings') }}>⚙</button></header>
    {['micro', 'meso', 'macro'].includes(state.mode) && <SlidingToggleGroup className="mode-nav" buttonClassName="mode-nav-button" ariaLabel="Model views" items={[{ value: 'micro', label: 'micro' }, { value: 'meso', label: 'meso' }, { value: 'macro', label: 'macro' }]} value={state.mode} onChange={changeMode} />}

    {state.mode === 'hero' && <section className="hero-overlay"><p className="kicker">Enter the model</p><h1>SimARC Bridge</h1><p>A playable interface for translating alcohol models into policy conversations.</p><label className="check-row centered-check"><input type="checkbox" checked={skipGenerationAnimation} onChange={event => setSkipGenerationAnimation(event.target.checked)} /> Skip generation animation</label><button className="button primary" onClick={state.worldStage > 0 ? () => changeMode(state.agents.length ? 'micro' : 'population') : generateWorld}>{state.worldStage > 0 ? 'Resume model' : 'Initialize model'}</button>{state.worldStage === 0 && <button className="advanced-link" onClick={() => openAdvanced('world')}>Advanced options</button>}</section>}
    {state.mode === 'generation' && <section className="center-control panel"><p className="kicker">World initialization</p><h2>{labels[state.worldStage]}</h2><div className="progress"><span style={{ width: `${generationProgress * 100}%` }} /></div><p className="muted">Building a stable city context for the agent model.</p><button className="advanced-link" onClick={() => { skipGenerationRef.current = true; setSkipGenerationAnimation(true) }}>Skip animation</button></section>}
    {state.mode === 'population' && <section className="center-control panel"><p className="kicker">Population initialization</p><h2>{state.populationStage ? 'Assigning agents...' : 'Generate the population'}</h2><p>Populate homes, streets, venues, and alcohol-stage distributions.</p><label className="check-row centered-check"><input type="checkbox" checked={tutorialEnabled} onChange={event => { setTutorialEnabled(event.target.checked); localStorage.setItem(storageKey('tutorial-enabled'), String(event.target.checked)) }} /> Tutorial after generation</label><button className="button primary" disabled={state.populationStage > 0} onClick={generatePopulation}>Generate population</button><button className="advanced-link" disabled={state.populationStage > 0} onClick={() => openAdvanced('population')}>Advanced options</button></section>}
    {tutorialStep == null && ['micro', 'meso'].includes(state.mode) && !dismissedCaptions[state.mode] && <section className="mode-caption panel"><button className="caption-close" onClick={() => dismissCaption(state.mode)}>×</button><p className="kicker">{state.mode} layer</p><h2>{state.mode === 'micro' ? 'Follow individual lives' : 'See networks and shared places'}</h2><p>{state.mode === 'micro' ? 'Click an agent to inspect their current state.' : 'Orbit the city to understand shared routes and places.'}</p></section>}
    {state.mode === 'macro' && <PolicyConsole state={{ ...state, calendar: displayCalendar }} clockTimeLabel={displayTime} onToggleClockFormat={() => setClockFormat(current => current === '24h' ? '12h' : '24h')} tutorialHighlight={tutorial?.mode === 'macro' ? tutorial.highlight : null} onSpeed={setSpeed} onApply={policies => { setState(current => ({ ...current, pendingPolicies: policies })); noteTutorialAction('policy') }} />}
    {panel == null && state.mode !== 'macro' && <DetailsPanel building={selectedBuilding} agent={detailAgent} agents={state.agents} buildings={state.world.buildings} mode={state.mode} networkCategory={networkCategory} anchor={detailAnchor} occupants={occupants} residents={residents} onSelectAgent={selectAgent} onSelectBuilding={selectBuilding} onFollowAgent={followAgent} onMove={() => noteTutorialAction('move-panel')} onClose={() => { noteTutorialAction(selectedAgent ? 'close-agent' : 'close-building'); clearSelection() }} />}
    {state.worldStage > 0 && state.mode !== 'hero' && state.mode !== 'macro' && <nav className="camera-presets panel" aria-label="Camera views"><span>Views</span>{[['default', 'Default', '◇'], ['street', 'Street', '▥'], ['top', 'Top', '▦'], ['custom', 'Custom', '✥']].map(([preset, label, icon]) => <button key={preset} className={(cameraPreset || 'default') === preset ? 'active' : ''} title={label} disabled={preset === 'custom'} onClick={() => { setFollowedAgent(null); setFindTarget(null); setCameraPreset(preset === 'default' ? null : preset); setCameraResetKey(key => key + 1); noteTutorialAction('camera-preset') }}><b>{icon}</b><small>{label}</small></button>)}</nav>}
    {state.agents.length > 0 && state.mode !== 'hero' && state.mode !== 'macro' && <div className="time-control-stack"><section className="date-strip panel"><strong>Day {String(displayCalendar.dayNumber).padStart(3, '0')}</strong><div className="date-metadata"><span>{displayCalendar.day}</span><i>·</i><span>{displayCalendar.period}</span><i>·</i><span>Week {displayCalendar.week}</span></div></section><footer className="sim-controls panel"><button className="clock-display" title={`Switch to ${clockFormat === '24h' ? '12-hour' : '24-hour'} time`} onClick={() => setClockFormat(current => current === '24h' ? '12h' : '24h')}>{displayTime}</button><SlidingToggleGroup className="speed-controls" buttonClassName="speed-toggle-button" ariaLabel="Simulation speed" items={speedControlItems} value={state.speed} onChange={setSpeed} /></footer><button className="directory-button panel" onClick={() => { closePanels(); setPanel('directory'); noteTutorialAction('directory') }}>☷ Agent Directory</button></div>}
    {state.worldStage > 0 && state.mode !== 'hero' && <button className="help-button panel" onClick={() => { closePanels(); setPanel('camera-help'); noteTutorialAction('help') }}>?</button>}

    {panel === 'settings' && <aside className="panel settings-menu"><div className="section-heading"><h2>Model settings</h2><button className="icon-button" onClick={closePanels}>×</button></div><label className="scale-control"><span>UI scale <strong>{Math.round(uiScale * 100)}%</strong></span><input type="range" min=".75" max="1.5" step=".05" value={uiScale} onChange={event => setUiScale(Number(event.target.value))} /></label>{state.agents.length > 0 && <button onClick={() => { closePanels(); setState(current => ({ ...current, speed: 0 })); setTutorialActions({}); setTutorialStep(0); changeMode('micro') }}>Start guided tutorial</button>}<button onClick={restartSimulation}>Restart simulation</button><button onClick={() => { closePanels(); setState(current => ({ ...current, agents: [], populationStage: 0, mode: 'population', speed: 0 })) }}>Regenerate population</button><button className="danger" onClick={resetEverything}>Reset everything</button><details className="about-details"><summary>About this beta</summary><p><strong>Bridge v0.3.0-beta.3</strong><br />SimARC 2.2 · NetLogo 7.0.3</p><p>Creative interface-friendly decisions simplify, omit, and add behavior relative to the source model. Outputs remain illustrative and are not validated policy predictions.</p></details></aside>}
    {panel === 'camera-help' && <aside className="panel camera-help"><div className="section-heading"><h2>Camera controls</h2><button className="icon-button" onClick={closePanels}>×</button></div><p><strong>Left drag</strong> orbit</p><p><strong>Right drag</strong> pan</p><p><strong>Scroll</strong> zoom</p><p><strong>W A S D</strong> move within the city bounds</p><p>Manual movement activates the <strong>Custom</strong> view.</p><p><strong>Micro</strong> follows individual lives. <strong>Meso</strong> reveals networks. <strong>Macro</strong> opens the policy lab.</p><button className="button secondary wide" onClick={() => { setDismissedCaptions({}); localStorage.removeItem(storageKey('dismissed-captions')); closePanels() }}>Restore mode tips</button></aside>}
    {panel === 'directory' && <AgentDirectory agents={state.agents} onClose={closePanels} onFind={findAgent} onFollow={followAgent} onHighlight={id => { setHighlightedBuilding(null); setHighlightedAgent(current => current === id ? null : id) }} onDetails={selectAgent} />}
    {tutorial && <TutorialOverlay step={tutorial} stepNumber={tutorialStep + 1} totalSteps={tutorialSteps.length} ready={tutorialReady} rewinding={tutorialActions['rewind-running']} onMove={() => noteTutorialAction('move-panel')} onNext={nextTutorial} onSkip={finishTutorial} />}
    {restorePhase != null && <div className="restore-overlay"><strong>Restoring snapshot</strong><span>{restorePhase}</span></div>}
    {panel?.startsWith('warning-') && <AdvancedWarning onBack={closePanels} onProceed={proceedAdvanced} />}
    {panel?.startsWith('advanced-') && <AdvancedOptions type={panel.replace('advanced-', '')} values={panel.endsWith('world') ? state.worldOptions : state.populationOptions} onChange={values => setState(current => ({ ...current, [panel.endsWith('world') ? 'worldOptions' : 'populationOptions']: values }))} onClose={closePanels} />}
  </main>
}
