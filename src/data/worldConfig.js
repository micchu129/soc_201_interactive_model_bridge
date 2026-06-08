export const GRID_SIZE = 13
export const TILE_WIDTH = 74
export const TILE_HEIGHT = 38

const roadCells = new Set()
for (let i = 0; i < GRID_SIZE; i += 1) {
  roadCells.add(`${i}-6`)
  roadCells.add(`6-${i}`)
}
;[[2, 3], [3, 3], [9, 9], [10, 9], [2, 9], [3, 9], [9, 3], [10, 3]].forEach(([x, y]) => roadCells.add(`${x}-${y}`))

const locations = {
  '1-1': 'home', '3-1': 'home', '5-1': 'home', '8-1': 'home', '10-1': 'shop',
  '1-4': 'home', '3-4': 'bar', '5-4': 'home', '8-4': 'club', '10-4': 'home',
  '1-8': 'hospital', '3-8': 'home', '5-8': 'bar', '8-8': 'home', '10-8': 'police',
  '1-11': 'home', '3-11': 'shop', '5-11': 'home', '8-11': 'bar', '10-11': 'home',
}

export const worldCells = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
  const x = index % GRID_SIZE
  const y = Math.floor(index / GRID_SIZE)
  return { x, y, type: locations[`${x}-${y}`] || (roadCells.has(`${x}-${y}`) ? 'road' : 'empty') }
})

export const agents = [
  { id: 1, x: 1.5, y: 2.1, category: 'casual', color: '#67e8f9' },
  { id: 2, x: 3.2, y: 4.2, category: 'student', color: '#c4b5fd' },
  { id: 3, x: 4.6, y: 6.1, category: 'casual', color: '#67e8f9' },
  { id: 4, x: 7.4, y: 5.2, category: 'vulnerable', color: '#fb7185', highlighted: true },
  { id: 5, x: 9.2, y: 3.8, category: 'student', color: '#c4b5fd' },
  { id: 6, x: 10.4, y: 7.3, category: 'casual', color: '#67e8f9' },
  { id: 7, x: 3.1, y: 9.8, category: 'vulnerable', color: '#fb7185' },
  { id: 8, x: 8.6, y: 9.1, category: 'student', color: '#c4b5fd' },
  { id: 9, x: 10.2, y: 10.5, category: 'casual', color: '#67e8f9' },
  { id: 10, x: 4.1, y: 2.3, category: 'student', color: '#c4b5fd' },
  { id: 11, x: 6.3, y: 8.7, category: 'casual', color: '#67e8f9' },
  { id: 12, x: 2.4, y: 7.1, category: 'vulnerable', color: '#fb7185' },
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
