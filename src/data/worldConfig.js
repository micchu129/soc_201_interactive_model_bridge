export const GRID_SIZE = 9
export const TILE_WIDTH = 74
export const TILE_HEIGHT = 38

const roadCells = new Set()
for (let i = 0; i < GRID_SIZE; i += 1) {
  roadCells.add(`${i}-4`)
  roadCells.add(`4-${i}`)
}
;[[1, 2], [2, 2], [6, 6], [7, 6]].forEach(([x, y]) => roadCells.add(`${x}-${y}`))

const locations = {
  '1-1': 'home', '2-1': 'home', '6-1': 'home', '7-1': 'shop',
  '1-3': 'home', '2-3': 'bar', '6-3': 'club', '7-3': 'home',
  '1-5': 'home', '2-5': 'home', '6-5': 'bar', '7-5': 'home',
  '1-7': 'hospital', '2-7': 'home', '6-7': 'police', '7-7': 'shop',
}

export const worldCells = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
  const x = index % GRID_SIZE
  const y = Math.floor(index / GRID_SIZE)
  return { x, y, type: locations[`${x}-${y}`] || (roadCells.has(`${x}-${y}`) ? 'road' : 'empty') }
})

export const agents = [
  { id: 1, x: 1.1, y: 1.5, category: 'casual', color: '#67e8f9' },
  { id: 2, x: 2.4, y: 3.2, category: 'student', color: '#c4b5fd' },
  { id: 3, x: 3.4, y: 4.1, category: 'casual', color: '#67e8f9' },
  { id: 4, x: 5.3, y: 3.8, category: 'vulnerable', color: '#fb7185', highlighted: true },
  { id: 5, x: 6.2, y: 3.1, category: 'student', color: '#c4b5fd' },
  { id: 6, x: 7.1, y: 5.2, category: 'casual', color: '#67e8f9' },
  { id: 7, x: 2.2, y: 6.4, category: 'vulnerable', color: '#fb7185' },
  { id: 8, x: 5.8, y: 6.2, category: 'student', color: '#c4b5fd' },
  { id: 9, x: 7.1, y: 7.1, category: 'casual', color: '#67e8f9' },
  { id: 10, x: 3.2, y: 1.7, category: 'student', color: '#c4b5fd' },
  { id: 11, x: 4.5, y: 5.7, category: 'casual', color: '#67e8f9' },
  { id: 12, x: 1.6, y: 4.6, category: 'vulnerable', color: '#fb7185' },
]

export const highlightedAgent = {
  name: 'Maya R.',
  archetype: 'High-risk vulnerable drinker',
  income: '€1,420 / month',
  vulnerability: 'High',
  habit: '3–5 nights / week',
  influence: 'Strong peer effect',
  support: 'Limited access',
  risk: 'Elevated',
}

export const isoPosition = (x, y) => ({
  left: (x - y) * TILE_WIDTH / 2,
  top: (x + y) * TILE_HEIGHT / 2,
})
