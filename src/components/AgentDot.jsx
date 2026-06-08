import { motion } from 'framer-motion'
import { isoPosition } from '../data/worldConfig'

export default function AgentDot({ agent, index, ready, selected }) {
  const pos = isoPosition(agent.x, agent.y)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, y: -15 }}
      animate={{ opacity: 1, scale: selected && ready ? 1.45 : 1, y: 0, left: pos.left + 27, top: pos.top - 17 }}
      transition={{ type: 'spring', delay: index * .03, left: { duration: 1.6 }, top: { duration: 1.6 } }}
      className="absolute z-30 flex h-7 w-5 flex-col items-center"
      style={{
        filter: selected ? `drop-shadow(0 0 8px ${agent.color}) drop-shadow(0 0 18px ${agent.color})` : `drop-shadow(0 0 5px ${agent.color})`,
      }}
    >
      <span className="h-2.5 w-2.5 rounded-full border border-white/80" style={{ background: agent.color }} />
      <span className="mt-px h-3.5 w-4 rounded-t-[7px] rounded-b-[4px] border border-white/70" style={{ background: agent.color }} />
    </motion.div>
  )
}
