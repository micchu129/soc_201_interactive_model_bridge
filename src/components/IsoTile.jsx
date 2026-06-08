import { motion } from 'framer-motion'
import { TILE_HEIGHT, TILE_WIDTH, isoPosition } from '../data/worldConfig'

export default function IsoTile({ cell, worldStage }) {
  const pos = isoPosition(cell.x, cell.y)
  const isRoad = cell.type === 'road' && worldStage >= 1
  return (
    <motion.div
      initial={false}
      animate={{ backgroundColor: isRoad ? '#172436' : '#0a1420', borderColor: isRoad ? '#284d62' : '#132638' }}
      transition={{ duration: .45, delay: isRoad ? (cell.x + cell.y) * .035 : 0 }}
      className="absolute"
      style={{
        width: TILE_WIDTH, height: TILE_HEIGHT, left: pos.left, top: pos.top,
      }}
    >
      <svg viewBox={`0 0 ${TILE_WIDTH} ${TILE_HEIGHT}`} className="h-full w-full overflow-visible">
        <polygon
          points={`${TILE_WIDTH / 2},0 ${TILE_WIDTH},${TILE_HEIGHT / 2} ${TILE_WIDTH / 2},${TILE_HEIGHT} 0,${TILE_HEIGHT / 2}`}
          fill={isRoad ? '#172535' : '#102030'}
          stroke={isRoad ? '#365369' : '#29445a'}
          strokeWidth="1.2"
        />
        {isRoad && cell.roadX && <line x1={TILE_WIDTH / 2} y1="4" x2={TILE_WIDTH / 2} y2={TILE_HEIGHT - 4} stroke="#9bb7c9" strokeWidth="1" strokeDasharray="4 5" opacity=".55" />}
        {isRoad && cell.roadY && <line x1="8" y1={TILE_HEIGHT / 2} x2={TILE_WIDTH - 8} y2={TILE_HEIGHT / 2} stroke="#9bb7c9" strokeWidth="1" strokeDasharray="5 5" opacity=".55" />}
      </svg>
    </motion.div>
  )
}
