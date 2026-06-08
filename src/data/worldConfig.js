export const GRID_SIZE = 13
export const TILE_WIDTH = 74
export const TILE_HEIGHT = 38

const roadCells = new Set()
for (let x = 0; x < GRID_SIZE; x += 1) {
  for (let y = 0; y < GRID_SIZE; y += 1) {
    if (x % 4 === 0 || y % 4 === 0) roadCells.add(`${x}-${y}`)
  }
}

const locations = {
  '1-1': 'home', '2-1': 'home', '5-1': 'home', '6-1': 'shop', '9-1': 'home', '10-1': 'home',
  '1-2': 'home', '2-2': 'bar', '5-2': 'home', '6-2': 'home', '9-2': 'club', '10-2': 'home',
  '1-5': 'hospital', '2-5': 'home', '5-5': 'home', '6-5': 'bar', '9-5': 'home', '10-5': 'police',
  '1-6': 'home', '2-6': 'home', '5-6': 'shop', '6-6': 'home', '9-6': 'home', '10-6': 'home',
  '1-9': 'home', '2-9': 'bar', '5-9': 'home', '6-9': 'home', '9-9': 'shop', '10-9': 'home',
  '1-10': 'home', '2-10': 'home', '5-10': 'club', '6-10': 'home', '9-10': 'home', '10-10': 'home',
}

export const worldCells = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
  const x = index % GRID_SIZE
  const y = Math.floor(index / GRID_SIZE)
  const road = roadCells.has(`${x}-${y}`)
  return {
    x, y, type: locations[`${x}-${y}`] || (road ? 'road' : 'empty'),
    roadX: road && x % 4 === 0,
    roadY: road && y % 4 === 0,
  }
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
