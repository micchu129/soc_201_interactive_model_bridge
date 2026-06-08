export default function DashboardCard({ label, data }) {
  return <div className="rounded-2xl border border-white/8 bg-white/[.035] p-4"><p className="eyebrow uppercase tracking-[.17em] text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{data.value}</p><p className="mt-1 text-xs text-cyan-300/70">{data.trend}</p></div>
}
