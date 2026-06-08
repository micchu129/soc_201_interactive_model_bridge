import { motion } from 'framer-motion'
import { isoPosition } from '../data/worldConfig'

export default function AgentDot({ agent, index, ready }) {
  const pos = isoPosition(agent.x, agent.y)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, y: -15 }}
      animate={{ opacity: 1, scale: agent.highlighted && ready ? 1.7 : 1, y: 0 }}
      transition={{ type: 'spring', delay: index * .07 }}
      className="absolute z-30 h-3 w-3 rounded-full border-2 border-white/80"
      style={{
        left: pos.left + 31, top: pos.top - 2, background: agent.color,
        boxShadow: agent.highlighted ? `0 0 8px 4px ${agent.color}, 0 0 28px 12px ${agent.color}70` : `0 0 9px ${agent.color}`,
      }}
    />
  )
}
