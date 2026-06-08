import { motion } from 'framer-motion'
import { isoPosition, worldCells } from '../data/worldConfig'
import AgentDot from './AgentDot'
import BuildingSprite from './BuildingSprite'
import IsoTile from './IsoTile'

export default function IsometricWorld({ worldStage, populationStage, networkVisible, scale, x, y, movingAgents, selectedAgent, focusActive }) {
  const visibleBuildings = worldStage >= 2 ? worldCells.filter(cell => !['empty', 'road'].includes(cell.type)) : []
  const visibleAgents = populationStage >= 1 ? movingAgents.slice(0, populationStage === 1 ? 6 : movingAgents.length) : []
  const connections = [[3,4], [3,7], [3,10], [1,3], [4,8], [6,10]]
  const focus = isoPosition(movingAgents[selectedAgent].x, movingAgents[selectedAgent].y)

  return (
    <motion.div style={{ scale, x, y }} className="grid-glow absolute left-1/2 top-1/2 h-[700px] w-[1100px] -translate-x-1/2 -translate-y-1/2">
      <motion.div
        animate={{ x: focusActive ? -focus.left : 0, y: focusActive ? -(focus.top - 235) : 0 }}
        transition={{ type: 'spring', stiffness: 45, damping: 18 }}
        className="world-responsive-scale absolute inset-0"
      >
        <div className="absolute left-[550px] top-[70px]">
          {worldCells.map(cell => <IsoTile key={`${cell.x}-${cell.y}`} cell={cell} worldStage={worldStage} />)}
          {visibleBuildings.map(cell => <BuildingSprite key={`b-${cell.x}-${cell.y}`} cell={cell} />)}
          {networkVisible && connections.map(([a, b]) => {
            const one = isoPosition(movingAgents[a].x, movingAgents[a].y)
            const two = isoPosition(movingAgents[b].x, movingAgents[b].y)
            const length = Math.hypot(two.left - one.left, two.top - one.top)
            const angle = Math.atan2(two.top - one.top, two.left - one.left) * 180 / Math.PI
            return <motion.div key={`${a}-${b}`} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="absolute z-20 h-px origin-left bg-cyan-300/55" style={{ left: one.left + 36, top: one.top + 4, width: length, rotate: angle }} />
          })}
          {visibleAgents.map((agent, index) => <AgentDot key={agent.id} agent={agent} index={index} ready={populationStage >= 3} selected={index === selectedAgent} />)}
        </div>
      </motion.div>
    </motion.div>
  )
}
