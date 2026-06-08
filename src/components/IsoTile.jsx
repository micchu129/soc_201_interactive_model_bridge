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
      className="absolute border"
      style={{
        width: TILE_WIDTH, height: TILE_HEIGHT, left: pos.left, top: pos.top,
        transform: 'rotateX(60deg) rotateZ(45deg)', transformOrigin: 'center',
        boxShadow: isRoad ? 'inset 0 0 14px rgba(34,211,238,.08)' : 'none',
      }}
    />
  )
}
