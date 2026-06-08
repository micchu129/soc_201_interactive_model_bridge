import { motion } from 'framer-motion'
import { isoPosition } from '../data/worldConfig'

const styles = {
  home: ['#d9e4ec', 'HOME'],
  bar: ['#d9799d', 'BAR'],
  club: ['#9c89d9', 'CLUB'],
  shop: ['#d8ad62', 'SHOP'],
  hospital: ['#75ba9b', '+'],
  police: ['#789ed8', 'P'],
}

export default function BuildingSprite({ cell }) {
  const pos = isoPosition(cell.x, cell.y)
  const [color, label] = styles[cell.type]
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: .6 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', delay: (cell.x + cell.y) * .045, stiffness: 130 }}
      className="absolute"
      title={`${cell.type} — replaceable via /public/assets/buildings/`}
      style={{
        left: pos.left + 12, top: pos.top - 52, width: 50, height: 72,
        filter: `drop-shadow(-8px 12px 10px rgba(0,0,0,.42)) drop-shadow(0 0 8px ${color}35)`,
      }}
    >
      <svg viewBox="0 0 50 72" className="h-full w-full overflow-visible">
        <polygon points="25,0 48,12 25,24 2,12" fill={color} stroke="#eff7fb" strokeWidth="1" />
        <polygon points="2,12 25,24 25,70 2,58" fill="#8fa3b1" stroke="#d8e5ec" strokeWidth="1" />
        <polygon points="25,24 48,12 48,58 25,70" fill="#607787" stroke="#d8e5ec" strokeWidth="1" />
        <rect x="30" y="35" width="13" height="13" rx="2" fill={color} opacity=".9" />
        <text x="36.5" y="44" textAnchor="middle" fill="#f8fbfd" fontSize={label.length > 2 ? '5' : '8'} fontWeight="800">{label}</text>
        <path d="M7 29l13 7M7 38l13 7M7 47l13 7" stroke="#dce8ee" strokeWidth=".7" opacity=".45" />
      </svg>
    </motion.div>
  )
}
