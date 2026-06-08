import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
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
  const { scrollYProgress } = useScroll({ target: container, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', setProgress)
  const heroOpacity = useTransform(scrollYProgress, [0, .1, .18], [1, .25, 0])
  const worldOpacity = useTransform(scrollYProgress, [.08, .18], [0, 1])
  const worldScale = useTransform(scrollYProgress, [.38, .57], [1, 2.2])
  const worldX = useTransform(scrollYProgress, [.38, .57], [0, -190])
  const worldY = useTransform(scrollYProgress, [.38, .57], [0, 40])
  const setupVisible = progress > .12 && progress < .34
  const populationVisible = progress >= .29 && progress < .46
  const profileVisible = progress >= .53 && progress < .73
  const networkVisible = progress >= .67 && progress < .84
  const policyVisible = progress >= .82

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
      <div className="stars sticky top-0 h-screen overflow-hidden bg-[radial-gradient(circle_at_50%_35%,#11233c_0%,#05070d_52%)]">
        <div className="absolute inset-x-0 top-0 z-[70] flex items-center justify-between p-5 text-[10px] uppercase tracking-[.3em] text-slate-500"><span>SimARC / Model Bridge</span><span>{String(Math.min(7, Math.floor(progress * 8) + 1)).padStart(2, '0')} / 07</span></div>
        <motion.section style={{ opacity: heroOpacity }} className="absolute inset-0 z-30 flex items-center justify-center px-6 text-center">
          <div><p className="mb-5 text-xs uppercase tracking-[.5em] text-cyan-300">Enter the model</p><h1 className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-6xl font-extralight tracking-tight text-transparent md:text-8xl">SimARC Bridge</h1><p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">A playable interface for translating alcohol models into policy conversations.</p><p className="mt-14 text-xs uppercase tracking-[.35em] text-slate-500">Alcohol policy is a system problem.</p><div className="mx-auto mt-8 h-16 w-px bg-gradient-to-b from-cyan-300 to-transparent" /></div>
        </motion.section>

        <motion.div style={{ opacity: worldOpacity }} className="absolute inset-0">
          <IsometricWorld worldStage={worldStage} populationStage={populationStage} networkVisible={networkVisible} scale={worldScale} x={worldX} y={worldY} />
        </motion.div>

        <motion.section animate={{ opacity: setupVisible ? 1 : 0, x: setupVisible ? 0 : -30, pointerEvents: setupVisible ? 'auto' : 'none' }} className="glass absolute bottom-7 left-5 z-40 w-[min(420px,calc(100vw-40px))] rounded-3xl p-5 lg:bottom-auto lg:left-10 lg:top-1/2 lg:-translate-y-1/2">
          <p className="text-[10px] uppercase tracking-[.3em] text-cyan-300">Initialize / World</p><h2 className="mt-3 text-2xl font-light">Before the model can simulate alcohol policy, it needs a world.</h2><p className="mt-3 text-xs text-slate-400">{setupStatus[worldStage]}</p><div className="my-4 flex gap-1">{[1,2,3].map(s => <div key={s} className={`h-1 flex-1 rounded ${worldStage >= s ? 'bg-cyan-300' : 'bg-white/10'}`} />)}</div><button onClick={setupWorld} disabled={worldStage > 0} className="w-full rounded-xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:bg-slate-700 disabled:text-slate-400">{worldStage === 0 ? 'Setup World' : worldStage === 3 ? 'World Ready' : 'Initializing...'}</button>
        </motion.section>

        <motion.section animate={{ opacity: populationVisible ? 1 : 0, x: populationVisible ? 0 : -30, pointerEvents: populationVisible ? 'auto' : 'none' }} className="glass absolute bottom-7 left-5 z-40 w-[min(420px,calc(100vw-40px))] rounded-3xl p-5 lg:bottom-auto lg:left-10 lg:top-1/2 lg:-translate-y-1/2">
          <p className="text-[10px] uppercase tracking-[.3em] text-violet-300">Initialize / Agents</p><h2 className="mt-3 text-2xl font-light">It's a little empty here. Let's generate our population.</h2><p className="mt-3 text-xs text-slate-400">{populationStatus[populationStage]}</p><div className="my-4 flex gap-1">{[1,2,3].map(s => <div key={s} className={`h-1 flex-1 rounded ${populationStage >= s ? 'bg-violet-300' : 'bg-white/10'}`} />)}</div><button onClick={generatePopulation} disabled={worldStage < 3 || populationStage > 0} className="w-full rounded-xl bg-violet-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-200 disabled:bg-slate-700 disabled:text-slate-400">{worldStage < 3 ? 'Setup World First' : populationStage === 0 ? 'Generate Population' : populationStage === 3 ? 'Population Ready' : 'Generating...'}</button>
        </motion.section>

        <AgentProfile visible={profileVisible} />
        <motion.div animate={{ opacity: networkVisible ? 1 : 0 }} className="pointer-events-none absolute inset-x-5 bottom-8 z-40 mx-auto max-w-4xl">
          <div className="grid gap-2 md:grid-cols-3">{[['MICRO','Individual agents'],['MESO','Social + physical networks'],['MACRO','Institutions + policy']].map(([level,text]) => <div className="glass rounded-2xl p-4" key={level}><p className="text-xs tracking-[.25em] text-cyan-300">{level}</p><p className="mt-1 text-sm text-slate-300">{text}</p></div>)}</div>
        </motion.div>
        <PolicyLab visible={policyVisible} />
      </div>
    </main>
  )
}
