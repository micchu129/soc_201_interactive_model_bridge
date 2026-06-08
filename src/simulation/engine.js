import { colors } from '../config/colors'
import { calendarFromMinutes } from './clock'
import { applyArrival, decideAction, updateStage } from './agentRules'
import { normalizeDistribution } from './validation'

const GRID = 13
const road = value => value === 0 || value === GRID - 1 || value % 4 === 0

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
  const buildings = lots.map((lot, index) => ({ ...lot, id: `building-${index}`, type: types[index] || 'home' }))
  const roads = cells.filter(cell => cell.type === 'road').map(cell => ({ ...cell, variant: roadVariant(cell.x, cell.z) }))
  return { cells, buildings, roads, size: GRID }
}

function roadVariant(x, z) {
  const horizontal = road(z)
  const vertical = road(x)
  if (horizontal && vertical) return 'cross'
  return horizontal ? 'horizontal' : 'vertical'
}

export function createPopulation(options, world) {
  const homes = world.buildings.filter(building => building.type === 'home')
  const distribution = normalizeDistribution(options.stageDistribution)
  return Array.from({ length: options.populationSize }, (_, index) => {
    const roll = (index + 0.5) / options.populationSize
    let cumulative = 0
    let stage = 1
    distribution.some((value, stageIndex) => { cumulative += value; stage = stageIndex + 1; return roll <= cumulative })
    const home = homes[index % homes.length]
    return {
      id: index, name: `Resident ${String(index + 1).padStart(3, '0')}`, gender: index / options.populationSize < options.femaleShare ? 'F' : 'M',
      age: 18 + (index * 7) % 48, weight: 55 + (index * 13) % 45, socialPosition: 1 + index % 25,
      cash: 120 + (index * 31) % 480, health: 72 + index % 28, sanity: 70 + (index * 3) % 30,
      stage, useMode: stage < 3 ? 'Just-A-Drink' : stage < 6 ? "Let's Rock" : 'Get-Smashed',
      bac: 0, weeklyUnits: 0, activity: 'at home', home, position: { x: home.x, z: home.z }, target: { x: home.x, z: home.z },
      progress: 1, speed: 0.35 + (index % 7) * 0.035, color: colors.agentStages[stage - 1],
    }
  })
}

export function decisionTick(state) {
  const calendar = calendarFromMinutes(state.simMinutes)
  const venues = state.world.buildings.reduce((groups, building) => {
    groups[building.type] ||= []
    groups[building.type].push(building)
    return groups
  }, {})
  let agents = state.agents.map(agent => {
    const aged = { ...agent, bac: Math.max(0, agent.bac - 0.15) }
    const decision = aged.progress < 1 ? null : decideAction(aged, calendar, state.policies, venues)
    return decision ? { ...aged, ...decision, target: decision.destination, progress: 0 } : aged
  })
  if (state.simMinutes > 0 && state.simMinutes % (7 * 1440) === 0) agents = agents.map(updateStage)
  return { ...state, agents, calendar }
}

export function advanceRender(state, simulatedMinutes) {
  const agents = state.agents.map(agent => {
    if (agent.progress >= 1) return agent
    const progress = Math.min(1, agent.progress + simulatedMinutes * agent.speed / 18)
    const position = {
      x: agent.position.x + (agent.target.x - agent.position.x) * progress,
      z: agent.position.z + (agent.target.z - agent.position.z) * progress,
    }
    const moved = { ...agent, position, progress }
    return progress >= 1 ? applyArrival({ ...moved, position: { x: agent.target.x, z: agent.target.z } }, state.policies) : moved
  })
  return { ...state, agents, simMinutes: state.simMinutes + simulatedMinutes, calendar: calendarFromMinutes(state.simMinutes + simulatedMinutes) }
}

export function outcomesFromState(state) {
  const agents = state.agents || []
  const average = key => agents.length ? agents.reduce((sum, agent) => sum + agent[key], 0) / agents.length : 0
  return {
    consumption: average('weeklyUnits').toFixed(1),
    highRisk: agents.filter(agent => agent.stage >= 5).length,
    hospital: agents.filter(agent => ['hospitalized', 'recovering'].includes(agent.activity)).length,
    treatment: agents.filter(agent => agent.activity === 'in treatment').length,
    averageHealth: average('health').toFixed(0),
    averageBac: average('bac').toFixed(2),
  }
}
