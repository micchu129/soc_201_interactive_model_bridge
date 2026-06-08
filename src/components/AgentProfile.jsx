import { motion } from 'framer-motion'
import { highlightedAgent } from '../data/worldConfig'

export default function AgentProfile({ visible }) {
  const attributes = [
    ['Income', highlightedAgent.income], ['Vulnerability', highlightedAgent.vulnerability],
    ['Drinking habit', highlightedAgent.habit], ['Social influence', highlightedAgent.influence],
    ['Access to support', highlightedAgent.support], ['Current risk', highlightedAgent.risk],
  ]
  return (
    <motion.aside animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 35, pointerEvents: visible ? 'auto' : 'none' }} className="glass absolute right-5 top-20 z-40 w-[min(390px,calc(100vw-40px))] rounded-3xl p-5 lg:right-10 lg:top-1/2 lg:-translate-y-1/2">
      <div className="mb-4 flex items-center gap-3"><div className="h-12 w-12 rounded-full border-2 border-rose-300 bg-gradient-to-br from-rose-400 to-violet-700 shadow-[0_0_25px_#fb718580]" /><div><p className="text-xs uppercase tracking-[.28em] text-cyan-300">Agent 047</p><h3 className="text-xl font-semibold">{highlightedAgent.name}</h3></div></div>
      <p className="mb-4 text-sm text-slate-400">{highlightedAgent.archetype}</p>
      <div className="grid grid-cols-2 gap-2">{attributes.map(([label, value]) => <div className="rounded-xl border border-white/8 bg-white/4 p-2.5" key={label}><p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 text-xs text-slate-200">{value}</p></div>)}</div>
      <p className="mt-5 text-[10px] uppercase tracking-[.25em] text-violet-300">One-night timeline</p>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-300">{['Home', 'Venue', 'Decision', 'Outcome'].map((item, i) => <div key={item} className="flex items-center"><span className="rounded-full bg-cyan-400/15 px-2 py-1">{item}</span>{i < 3 && <span className="ml-1 text-cyan-400">→</span>}</div>)}</div>
    </motion.aside>
  )
}
