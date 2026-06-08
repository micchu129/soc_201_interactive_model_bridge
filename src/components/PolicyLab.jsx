import { useMemo, useState } from 'react'
import { calculateOutcomes, defaultPolicies } from '../utils/calculateOutcomes'
import DashboardCard from './DashboardCard'

const sliders = [
  ['tax', 'Alcohol tax / price'], ['regulation', 'Venue regulation'], ['enforcement', 'Enforcement intensity'],
  ['treatment', 'Treatment / prevention'], ['research', 'Research / data'],
]
const labels = {
  consumption: 'Average consumption', heavy: 'Heavy drinking', acute: 'Acute harm events',
  hospital: 'Hospital burden', police: 'Police burden', spending: 'Public spending',
  revenue: 'Tax revenue', inequality: 'Inequality burden', confidence: 'Data confidence',
}

export default function PolicyLab({ visible }) {
  const [policies, setPolicies] = useState(defaultPolicies)
  const outcomes = useMemo(() => calculateOutcomes(policies), [policies])
  return (
    <section className={`absolute inset-0 z-50 overflow-y-auto bg-[#05070df2] px-4 py-16 transition-opacity duration-700 lg:px-10 ${visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow uppercase tracking-[.35em] text-cyan-300">Scene 07 / Policy Lab</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-4xl font-light md:text-6xl">Change the system.</h2><p className="mt-2 max-w-2xl text-base text-slate-400">Explore how policy levers move outcomes across agents, networks, and institutions.</p></div><span className="rounded-full border border-emerald-300/20 bg-emerald-300/8 px-4 py-2 text-sm text-emerald-300">Live illustrative model</span></div>
        <div className="mt-8 grid gap-5 lg:grid-cols-[.78fr_1.4fr]">
          <div className="glass rounded-3xl p-6"><h3 className="mb-6 text-base uppercase tracking-[.22em] text-slate-300">Policy levers</h3>{sliders.map(([key, label]) => <label className="mb-6 block" key={key}><span className="mb-3 flex justify-between text-sm text-slate-300"><span>{label}</span><strong className="text-cyan-300">{policies[key]}</strong></span><input className="range" type="range" min="0" max="100" value={policies[key]} onChange={e => setPolicies({ ...policies, [key]: Number(e.target.value) })} /></label>)}</div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{Object.entries(outcomes).map(([key, data]) => <DashboardCard key={key} label={labels[key]} data={data} />)}</div>
        </div>
        <div className="mt-6 rounded-2xl border border-amber-300/30 bg-amber-300/8 p-4 text-sm text-amber-100"><strong>Prototype mode:</strong> outputs are illustrative and designed to explain model logic, not provide validated policy predictions.</div>
      </div>
    </section>
  )
}
