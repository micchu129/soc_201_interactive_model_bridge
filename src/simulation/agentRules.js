const drinkingModes = ['none', 'Just-A-Drink', "Let's Rock", 'Get-Smashed']
const DEFAULT_ALCOHOL_PRICE = 5
const DEFAULT_VENUE_REGULATION = 25
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function demandMultiplier(agent, policies, includeVenueRegulation = false) {
  const price = policies.alcoholPrice ?? DEFAULT_ALCOHOL_PRICE
  const regulation = policies.venueRegulation ?? DEFAULT_VENUE_REGULATION
  const priceEffect = clamp(1 - (price - DEFAULT_ALCOHOL_PRICE) * 0.045, 0.68, 1.14)
  const expectedSpend = Math.max(price, Math.max(1, agent.stage / 2) * price)
  const affordability = clamp(agent.cash / expectedSpend, 0.35, 1)
  const regulationEffect = includeVenueRegulation
    ? clamp(1 - (regulation - DEFAULT_VENUE_REGULATION) * 0.0035, 0.7, 1.09)
    : 1
  return priceEffect * affordability * regulationEffect
}

export function decideAction(agent, calendar, policies, venues) {
  if (agent.health < 35) return { activity: 'hospitalized', destination: venues.hospital[0] }
  if (agent.stage >= 6 && Math.random() < policies.treatmentAccess / 240) return { activity: 'seeking treatment', destination: venues.rehab[0] }
  const evening = Number(calendar.time.slice(0, 2)) >= 18 || Number(calendar.time.slice(0, 2)) < 4
  const hour = Number(calendar.time.slice(0, 2))
  if (hour >= 2 && hour < 8) return { activity: 'going home', destination: agent.home }
  const drinkChance = Math.max(0.01, (agent.stage * 0.06 + (calendar.weekend ? 0.18 : 0) - policies.prevention / 400) * demandMultiplier(agent, policies, true))
  if (evening && Math.random() < drinkChance) {
    const destination = agent.stage > 4 ? venues.club[agent.id % venues.club.length] : venues.bar[agent.id % venues.bar.length]
    return { activity: 'going to drink', destination }
  }
  if (Math.random() < (evening ? 0.18 : 0.08) * demandMultiplier(agent, policies)) return { activity: 'buying alcohol', destination: venues.shop[agent.id % venues.shop.length] }
  return { activity: 'going home', destination: agent.home }
}

export function applyArrival(agent, policies, simMinutes) {
  const activity = agent.intendedActivity || agent.activity
  if (activity === 'going to drink' || activity === 'buying alcohol') {
    const price = policies.alcoholPrice ?? DEFAULT_ALCOHOL_PRICE
    const baseUnits = Math.max(1, Math.round(agent.stage / 2))
    const adjustedUnits = baseUnits * clamp(1 - (price - DEFAULT_ALCOHOL_PRICE) * 0.035, 0.72, 1.12)
    const affordableUnits = agent.cash > 0 ? agent.cash / price : 0.5
    const units = Math.max(0.5, Math.round(Math.min(adjustedUnits, affordableUnits) * 2) / 2)
    return {
      ...agent,
      activity: activity === 'going to drink' ? 'drinking' : 'carrying alcohol',
      cash: Math.max(0, agent.cash - units * price),
      bac: Math.min(3, agent.bac + units * (agent.gender === 'F' ? 0.14 : 0.11)),
      weeklyUnits: agent.weeklyUnits + units,
      consumptionEvents: [...(agent.consumptionEvents || []), { minute: simMinutes, units }],
      health: Math.max(0, agent.health - Math.max(0, units - 2) * 0.4),
    }
  }
  if (activity === 'hospitalized') return { ...agent, activity: 'recovering', health: Math.min(100, agent.health + 8) }
  if (activity === 'seeking treatment') return { ...agent, activity: 'in treatment', stage: Math.max(1, agent.stage - 1), bac: 0 }
  return { ...agent, activity: 'resting', health: Math.min(100, agent.health + 0.2) }
}

export function updateStage(agent) {
  const thresholds = [0, 3, 6, 9, 13, 19, 26]
  let stage = agent.stage
  if (stage < 7 && agent.weeklyUnits > thresholds[stage]) stage += 1
  if (stage > 1 && agent.weeklyUnits < thresholds[stage - 1] * 0.6) stage -= 1
  return { ...agent, stage, useMode: drinkingModes[Math.min(3, Math.floor((stage - 1) / 2))], weeklyUnits: 0 }
}
