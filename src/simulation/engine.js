import { colors } from '../config/colors'
import { calendarFromMinutes } from './clock'
import { applyArrival, decideAction, updateStage } from './agentRules'
import { normalizeDistribution } from './validation'

const GRID = 13
const ROLLING_CONSUMPTION_MINUTES = 24 * 60
const road = value => value === 0 || value === GRID - 1 || value % 4 === 0
const key = (x, z) => `${x}-${z}`
const specialNames = {
  hospital: 'Northgate Hospital', rehab: 'Harbour Recovery Centre', police: 'Central Police Station',
  bar: 'Lantern Bar', club: 'Afterlight Club', shop: 'Bridge Bottle Shop',
}

export function createWorld(options) {
  const cells = []
  const lots = []
  for (let x = 0; x < GRID; x += 1) for (let z = 0; z < GRID; z += 1) {
    const isRoad = road(x) || road(z)
    cells.push({ x, z, type: isRoad ? 'road' : 'lot' })
    if (!isRoad) lots.push({ x, z })
  }
  const types = [
    ...Array(options.hospitals).fill('hospital'), ...Array(options.rehab).fill('rehab'),
    ...Array(options.police).fill('police'), ...Array(options.bars).fill('bar'),
    ...Array(options.clubs).fill('club'), ...Array(options.shops).fill('shop'),
  ]
  const selectedSpecials = types.map((type, index) => ({ ...lots[Math.floor((index + .5) * lots.length / types.length)], type, specialIndex: index }))
  const specialByCell = new Map(selectedSpecials.map(item => [key(item.x, item.z), item]))
  const typeCounts = {}
  const buildings = lots.map((lot, index) => {
    const special = specialByCell.get(key(lot.x, lot.z))
    const type = special?.type || 'home'
    typeCounts[type] = (typeCounts[type] || 0) + 1
    return {
      ...lot, id: `building-${index}`, type,
      name: type === 'home' ? `Residence ${String(typeCounts[type]).padStart(2, '0')}` : `${specialNames[type]} ${String(typeCounts[type]).padStart(2, '0')}`,
    }
  })
  const roadSet = new Set(cells.filter(cell => cell.type === 'road').map(cell => key(cell.x, cell.z)))
  const roadCells = cells.filter(cell => cell.type === 'road')
  const seed = roadCells.find(cell => cell.x === 4 && cell.z === 4) || roadCells[0]
  const revealOrder = roadRevealOrder(seed, roadSet)
  const roads = roadCells.map(cell => ({ ...cell, ...roadVariant(cell.x, cell.z, roadSet), revealIndex: revealOrder.get(key(cell.x, cell.z)) || 0 }))
  return { cells, buildings, roads, size: GRID }
}

function roadVariant(x, z, roadSet) {
  const neighbors = [
    roadSet.has(key(x, z - 1)), roadSet.has(key(x + 1, z)),
    roadSet.has(key(x, z + 1)), roadSet.has(key(x - 1, z)),
  ]
  const count = neighbors.filter(Boolean).length
  let variant = `end-${neighbors.map(Number).join('')}`
  if (count === 4) variant = 'cross'
  else if (count === 3) variant = `t-${neighbors.map(Number).join('')}`
  else if (count === 2 && neighbors[0] === neighbors[2]) variant = neighbors[0] ? 'vertical' : 'horizontal'
  else if (count === 2) variant = `corner-${neighbors.map(Number).join('')}`
  return { variant, connections: neighbors }
}

function roadRevealOrder(seed, roadSet) {
  const result = new Map([[key(seed.x, seed.z), 0]])
  const queue = [seed]
  while (queue.length) {
    const current = queue.shift()
    const nextDistance = result.get(key(current.x, current.z)) + 1
    for (const [dx, dz] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      const next = { x: current.x + dx, z: current.z + dz }
      const nextKey = key(next.x, next.z)
      if (roadSet.has(nextKey) && !result.has(nextKey)) { result.set(nextKey, nextDistance); queue.push(next) }
    }
  }
  return result
}

export function createPopulation(options, world) {
  const homes = world.buildings.filter(building => building.type === 'home')
  const venues = world.buildings.filter(building => ['bar', 'club', 'shop'].includes(building.type))
  const roads = world.roads
  const distribution = normalizeDistribution(options.stageDistribution)
  return Array.from({ length: options.populationSize }, (_, index) => {
    const roll = (index + 0.5) / options.populationSize
    let cumulative = 0
    let stage = 1
    distribution.some((value, stageIndex) => { cumulative += value; stage = stageIndex + 1; return roll <= cumulative })
    const home = homes[index % homes.length]
    const seedMode = index % 5
    const venue = venues[index % venues.length]
    const roadCell = roads[(index * 7) % roads.length]
    const base = {
      id: index, name: `Resident ${String(index + 1).padStart(3, '0')}`, gender: index / options.populationSize < options.femaleShare ? 'F' : 'M',
      age: 18 + (index * 7) % 48, weight: 55 + (index * 13) % 45, socialPosition: 1 + index % 25,
      cash: 120 + (index * 31) % 480, health: 72 + index % 28, sanity: 70 + (index * 3) % 30,
      stage, useMode: stage < 3 ? 'Just-A-Drink' : stage < 6 ? "Let's Rock" : 'Get-Smashed',
      bac: 0, weeklyUnits: 0, consumptionEvents: [], activity: 'at home', home, position: { x: home.x, z: home.z }, target: { x: home.x, z: home.z },
      route: [], routeIndex: 0, progress: 1, segmentStart: { x: home.x, z: home.z }, insideBuildingId: home.id, activityUntil: 0,
      departureDelay: index % 50, speed: 0.25 + (index % 7) * 0.025, color: colors.agentStages[stage - 1], highlighted: false,
      favoriteVenueId: venues[(index * 3 + stage) % venues.length].id,
      socialIds: [1, 7, 13].map(offset => (index + offset) % options.populationSize),
      neurotransmitters: {
        dopamine: 38 + (index * 11 + stage * 7) % 55,
        serotonin: 34 + (index * 7 + stage * 5) % 58,
        gaba: 30 + (index * 13 + stage * 4) % 62,
      },
    }
    if (seedMode === 0 || seedMode === 1) return base
    if (seedMode === 2) {
      const initialUnits = venue.type === 'shop' ? 0 : Math.max(1, Math.round(stage / 2))
      return { ...base, insideBuildingId: venue.id, position: { x: venue.x, z: venue.z }, segmentStart: { x: venue.x, z: venue.z }, activity: venue.type === 'shop' ? 'buying alcohol' : 'drinking', activityUntil: 25 + index % 40, weeklyUnits: initialUnits, consumptionEvents: initialUnits ? [{ minute: 0, units: initialUnits }] : [], bac: venue.type === 'shop' ? 0 : .08 + stage * .03 }
    }
    const target = nearestRoad(home)
    return { ...base, insideBuildingId: null, position: { x: roadCell.x, z: roadCell.z }, segmentStart: { x: roadCell.x, z: roadCell.z }, target, route: buildRoadRoute(roadCell, target, world), routeIndex: 0, progress: 0, intendedActivity: 'going home', destination: home, activity: 'travelling home', travelStart: 0 }
  })
}

export function decisionTick(state) {
  const calendar = calendarFromMinutes(state.simMinutes)
  const venues = groupVenues(state.world)
  let agents = state.agents.map(agent => {
    const aged = { ...agent, bac: Math.max(0, agent.bac - 0.15), consumptionEvents: recentConsumptionEvents(agent, state.simMinutes) }
    if (aged.route.length || state.simMinutes < aged.activityUntil) return aged
    return scheduleAgent(aged, state, calendar, venues)
  })
  if (state.simMinutes > 0 && state.simMinutes % (7 * 1440) === 0) agents = agents.map(updateStage)
  return { ...state, agents, calendar }
}

export function advanceRender(state, simulatedMinutes) {
  const nextMinutes = state.simMinutes + simulatedMinutes
  const calendar = calendarFromMinutes(nextMinutes)
  const venues = groupVenues(state.world)
  const agents = state.agents.map(agent => {
    if (!agent.route.length) {
      if (nextMinutes >= agent.activityUntil) return scheduleAgent(agent, { ...state, simMinutes: nextMinutes }, calendar, venues, 0)
      return { ...agent, bac: Math.max(0, agent.bac - simulatedMinutes * .0012) }
    }
    if (state.simMinutes < (agent.travelStart || 0)) return agent
    const progress = Math.min(1, agent.progress + simulatedMinutes * agent.speed / 2.5)
    const segmentStart = agent.segmentStart || agent.position
    const position = {
      x: segmentStart.x + (agent.target.x - segmentStart.x) * progress,
      z: segmentStart.z + (agent.target.z - segmentStart.z) * progress,
    }
    if (progress < 1) return { ...agent, segmentStart, position, progress, activity: `travelling to ${agent.destination.type}` }
    const routeIndex = agent.routeIndex + 1
    if (routeIndex < agent.route.length) return { ...agent, position: agent.target, segmentStart: agent.target, routeIndex, target: agent.route[routeIndex], progress: 0 }
    const arrived = applyArrival({ ...agent, position: agent.target, route: [], routeIndex: 0, progress: 1 }, state.policies, nextMinutes)
    return { ...arrived, segmentStart: agent.target, insideBuildingId: agent.destination.id, activityUntil: nextMinutes + 35 + agent.id % 70 }
  })
  return { ...state, agents, simMinutes: nextMinutes, calendar }
}

function groupVenues(world) {
  return world.buildings.reduce((groups, building) => {
    groups[building.type] ||= []
    groups[building.type].push(building)
    return groups
  }, {})
}

function scheduleAgent(agent, state, calendar, venues, delay = agent.departureDelay) {
  const decision = decideAction(agent, calendar, state.policies, venues)
  if (!decision?.destination) return agent
  if (agent.insideBuildingId === decision.destination.id) return {
    ...agent,
    activity: decision.destination.type === 'home' ? 'resting at home' : agent.activity,
    activityUntil: state.simMinutes + 60,
  }
  const route = buildRoute(agent.position, decision.destination, state.world)
  return {
    ...agent, ...decision, intendedActivity: decision.activity, insideBuildingId: null, route, routeIndex: 0,
    segmentStart: agent.position, target: route[0] || decision.destination, progress: 0, travelStart: state.simMinutes + delay,
    activity: `preparing to travel to ${decision.destination.type}`,
  }
}

function nearestRoad(position) {
  let best = { x: 0, z: 0 }
  let distance = Infinity
  for (let x = 0; x < GRID; x += 1) for (let z = 0; z < GRID; z += 1) {
    if (!(road(x) || road(z))) continue
    const d = Math.abs(position.x - x) + Math.abs(position.z - z)
    if (d < distance) { distance = d; best = { x, z } }
  }
  return best
}

function buildRoadRoute(start, end, world) {
  const roadSet = new Set(world.roads.map(cell => key(cell.x, cell.z)))
  const queue = [start]
  const previous = new Map([[key(start.x, start.z), null]])
  while (queue.length) {
    const current = queue.shift()
    if (current.x === end.x && current.z === end.z) break
    for (const [dx, dz] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      const next = { x: current.x + dx, z: current.z + dz }
      const nextKey = key(next.x, next.z)
      if (roadSet.has(nextKey) && !previous.has(nextKey)) { previous.set(nextKey, current); queue.push(next) }
    }
  }
  const route = []
  let current = end
  while (current) { route.unshift(current); current = previous.get(key(current.x, current.z)) }
  return route
}

function buildRoute(from, destination, world) {
  const start = nearestRoad(from)
  const end = nearestRoad(destination)
  const route = buildRoadRoute(start, end, world)
  route.push({ x: destination.x, z: destination.z })
  return route.filter((point, index, all) => index === 0 || point.x !== all[index - 1].x || point.z !== all[index - 1].z)
}

export function outcomesFromState(state) {
  const agents = state.agents || []
  const average = key => agents.length ? agents.reduce((sum, agent) => sum + agent[key], 0) / agents.length : 0
  const rollingConsumption = agents.length
    ? agents.reduce((sum, agent) => sum + recentConsumptionEvents(agent, state.simMinutes).reduce((units, event) => units + event.units, 0), 0) / agents.length
    : 0
  return {
    consumption: rollingConsumption.toFixed(1),
    highRisk: agents.filter(agent => agent.stage >= 5).length,
    hospital: agents.filter(agent => ['hospitalized', 'recovering'].includes(agent.activity)).length,
    treatment: agents.filter(agent => agent.activity === 'in treatment').length,
    averageHealth: average('health').toFixed(0),
    averageBac: average('bac').toFixed(2),
  }
}

function recentConsumptionEvents(agent, simMinutes) {
  const cutoff = simMinutes - ROLLING_CONSUMPTION_MINUTES
  return (agent.consumptionEvents || []).filter(event => event.minute > cutoff && event.minute <= simMinutes)
}
