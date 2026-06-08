import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import { agents } from '../data/worldConfig'
import AgentProfile from './AgentProfile'
import IsometricWorld from './IsometricWorld'
import PolicyLab from './PolicyLab'

const setupStatus = ['Waiting for setup', 'Generating streets', 'Placing locations', 'World ready']
const populationStatus = ['No agents generated', 'Creating population', 'Assigning attributes', 'Population ready']
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

export default function ScrollStory() {
  const container = useRef(null)
  const [worldStage, setWorldStage] = useState(0)
  const [populationStage, setPopulationStage] = useState(0)
  const [progress, setProgress] = useState(0)
  const [selectedAgent, setSelectedAgent] = useState(3)
  const [movingAgents, setMovingAgents] = useState(() => agents.map(agent => ({ ...agent })))
  const { scrollYProgress } = useScroll({ target: container, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', setProgress)
  const heroOpacity = useTransform(scrollYProgress, [0, .08, .14], [1, .2, 0])
  const worldOpacity = useTransform(scrollYProgress, [.08, .18], [0, 1])
  const worldScale = useTransform(scrollYProgress, [.12, .38, .57], [2, 2, 4.8])
  const worldX = useTransform(scrollYProgress, [.38, .57], [0, 0])
  const worldY = useTransform(scrollYProgress, [.38, .57], [0, 0])
  const setupVisible = progress > .12 && progress < .34 && worldStage < 3
  const populationVisible = progress >= .29 && progress < .49 && populationStage < 3
  const profileVisible = progress >= .53 && progress < .73
  const networkVisible = progress >= .67 && progress < .84
  const policyVisible = progress >= .82
  const focusActive = progress >= .48 && progress < .82

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (populationStage < 1) return
      setMovingAgents(current => current.map(agent => ({
        ...agent,
        x: Math.min(12.1, Math.max(.9, agent.x + (Math.random() - .5) * 1.15)),
        y: Math.min(12.1, Math.max(.9, agent.y + (Math.random() - .5) * 1.15)),
      })))
    }, 1700)
    return () => window.clearInterval(interval)
  }, [populationStage])

  useEffect(() => {
    const maxProgress = worldStage < 3 ? .275 : populationStage < 3 ? .465 : 1
    if (progress <= maxProgress || !container.current) return
    const scrollRange = container.current.offsetHeight - window.innerHeight
    window.scrollTo({ top: scrollRange * maxProgress, behavior: 'smooth' })
  }, [progress, worldStage, populationStage])

  const setupWorld = async () => {
    if (worldStage) return
    for (const stage of [1, 2, 3]) { setWorldStage(stage); await wait(700) }
  }
  const generatePopulation = async () => {
    if (worldStage < 3 || populationStage) return
    for (const stage of [1, 2, 3]) { setPopulationStage(stage); await wait(700) }
  }

  return (
    <main ref={container} className="relative h-[600vh] bg-[#05070d]">
      <div className="stars story-shell sticky top-0 h-screen overflow-hidden bg-[radial-gradient(circle_at_50%_35%,#11233c_0%,#05070d_52%)]">
        <div className="eyebrow absolute inset-x-0 top-0 z-[70] flex items-center justify-between p-5 uppercase tracking-[.3em] text-slate-500"><span>SimARC / Model Bridge</span><span>{String(Math.min(7, Math.floor(progress * 8) + 1)).padStart(2, '0')} / 07</span></div>
        <motion.section style={{ opacity: heroOpacity, visibility: progress >= .15 ? 'hidden' : 'visible' }} className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-6 text-center">
          <div><p className="eyebrow mb-5 uppercase tracking-[.5em] text-cyan-300">Enter the model</p><h1 className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-[clamp(4rem,8vw,9rem)] font-extralight tracking-tight text-transparent">SimARC Bridge</h1><p className="mx-auto mt-6 max-w-3xl text-[clamp(1.1rem,1.5vw,1.7rem)] text-slate-300">A playable interface for translating alcohol models into policy conversations.</p><p className="eyebrow mt-14 uppercase tracking-[.35em] text-slate-500">Alcohol policy is a system problem.</p><div className="mx-auto mt-8 h-16 w-px bg-gradient-to-b from-cyan-300 to-transparent" /></div>
        </motion.section>

        <motion.div style={{ opacity: worldOpacity }} className="absolute inset-0">
          <IsometricWorld worldStage={worldStage} populationStage={populationStage} networkVisible={networkVisible} scale={worldScale} x={worldX} y={worldY} movingAgents={movingAgents} selectedAgent={selectedAgent} focusActive={focusActive} />
        </motion.div>

        <motion.section animate={{ opacity: setupVisible ? 1 : 0, x: setupVisible ? 0 : -30, scale: setupVisible ? 1 : .96, pointerEvents: setupVisible ? 'auto' : 'none' }} className="story-panel glass absolute bottom-7 left-5 z-40 rounded-3xl lg:bottom-auto lg:left-10 lg:top-1/2 lg:-translate-y-1/2">
          <p className="eyebrow uppercase tracking-[.3em] text-cyan-300">Initialize / World</p><h2 className="mt-3 text-[clamp(1.5rem,2vw,2.25rem)] font-light leading-tight">Before the model can simulate alcohol policy, it needs a world.</h2><p className="mt-3 text-sm text-slate-400">{setupStatus[worldStage]}</p><div className="my-5 flex gap-1">{[1,2,3].map(s => <div key={s} className={`h-1.5 flex-1 rounded ${worldStage >= s ? 'bg-cyan-300' : 'bg-white/10'}`} />)}</div><button onClick={setupWorld} disabled={worldStage > 0} className="w-full rounded-xl bg-cyan-300 px-5 py-4 text-base font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:bg-slate-700 disabled:text-slate-400">{worldStage === 0 ? 'Setup World' : 'Initializing...'}</button>
        </motion.section>

        <motion.section animate={{ opacity: populationVisible ? 1 : 0, x: populationVisible ? 0 : -30, scale: populationVisible ? 1 : .96, pointerEvents: populationVisible ? 'auto' : 'none' }} className="story-panel glass absolute bottom-7 left-5 z-40 rounded-3xl lg:bottom-auto lg:left-10 lg:top-1/2 lg:-translate-y-1/2">
          <p className="eyebrow uppercase tracking-[.3em] text-violet-300">Initialize / Agents</p><h2 className="mt-3 text-[clamp(1.5rem,2vw,2.25rem)] font-light leading-tight">It's a little empty here. Let's generate our population.</h2><p className="mt-3 text-sm text-slate-400">{populationStatus[populationStage]}</p><div className="my-5 flex gap-1">{[1,2,3].map(s => <div key={s} className={`h-1.5 flex-1 rounded ${populationStage >= s ? 'bg-violet-300' : 'bg-white/10'}`} />)}</div><button onClick={generatePopulation} disabled={worldStage < 3 || populationStage > 0} className="w-full rounded-xl bg-violet-300 px-5 py-4 text-base font-semibold text-slate-950 transition hover:bg-violet-200 disabled:bg-slate-700 disabled:text-slate-400">{worldStage < 3 ? 'Setup World First' : populationStage === 0 ? 'Generate Population' : 'Generating...'}</button>
        </motion.section>

        <AgentProfile visible={profileVisible} selectedAgent={selectedAgent} onPrevious={() => setSelectedAgent(index => (index - 1 + movingAgents.length) % movingAgents.length)} onNext={() => setSelectedAgent(index => (index + 1) % movingAgents.length)} />
        <motion.div animate={{ opacity: networkVisible ? 1 : 0 }} className="pointer-events-none absolute inset-x-5 bottom-8 z-40 mx-auto max-w-4xl">
          <div className="grid gap-2 md:grid-cols-3">{[['MICRO','Individual agents'],['MESO','Social + physical networks'],['MACRO','Institutions + policy']].map(([level,text]) => <div className="glass rounded-2xl p-4" key={level}><p className="text-xs tracking-[.25em] text-cyan-300">{level}</p><p className="mt-1 text-sm text-slate-300">{text}</p></div>)}</div>
        </motion.div>
        <PolicyLab visible={policyVisible} />
      </div>
    </main>
  )
}
