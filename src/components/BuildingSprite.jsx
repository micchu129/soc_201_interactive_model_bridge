import { motion } from 'framer-motion'
import { isoPosition } from '../data/worldConfig'

const styles = {
  home: ['#4f6f8f', 'H'],
  bar: ['#ec4899', 'BAR'],
  club: ['#8b5cf6', 'CLUB'],
  shop: ['#f59e0b', 'SHOP'],
  hospital: ['#22c55e', '+'],
  police: ['#3b82f6', 'P'],
}

export default function BuildingSprite({ cell }) {
  const pos = isoPosition(cell.x, cell.y)
  const [color, label] = styles[cell.type]
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: .6 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', delay: (cell.x + cell.y) * .045, stiffness: 130 }}
      className="absolute flex items-center justify-center text-[8px] font-black tracking-wider text-white"
      title={`${cell.type} — replaceable via /public/assets/buildings/`}
      style={{
        left: pos.left + 22, top: pos.top - 24, width: 32, height: 36,
        background: `linear-gradient(145deg, ${color}, #101827)`,
        border: `1px solid ${color}`, borderRadius: 4,
        boxShadow: `-8px 10px 18px rgba(0,0,0,.42), 0 0 15px ${color}45`,
      }}
    >{label}</motion.div>
  )
}
