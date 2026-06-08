const drinkingModes = ['none', 'Just-A-Drink', "Let's Rock", 'Get-Smashed']

export function decideAction(agent, calendar, policies, venues) {
  if (agent.health < 35) return { activity: 'hospitalized', destination: venues.hospital[0] }
  if (agent.stage >= 6 && Math.random() < policies.treatmentAccess / 240) return { activity: 'seeking treatment', destination: venues.rehab[0] }
  const evening = Number(calendar.time.slice(0, 2)) >= 18 || Number(calendar.time.slice(0, 2)) < 4
  const drinkChance = Math.max(0.02, (agent.stage * 0.06 + (calendar.weekend ? 0.18 : 0) - policies.prevention / 400))
  if (evening && Math.random() < drinkChance) {
    const destination = agent.stage > 4 ? venues.club[agent.id % venues.club.length] : venues.bar[agent.id % venues.bar.length]
    return { activity: 'going to drink', destination }
  }
  if (Math.random() < 0.12) return { activity: 'buying alcohol', destination: venues.shop[agent.id % venues.shop.length] }
  return { activity: 'going home', destination: agent.home }
}

export function applyArrival(agent, policies) {
  if (agent.activity === 'going to drink' || agent.activity === 'buying alcohol') {
    const units = Math.max(1, Math.round(agent.stage / 2))
    return {
      ...agent,
      activity: agent.activity === 'going to drink' ? 'drinking' : 'carrying alcohol',
      cash: Math.max(0, agent.cash - units * policies.alcoholPrice),
      bac: Math.min(3, agent.bac + units * (agent.gender === 'F' ? 0.14 : 0.11)),
      weeklyUnits: agent.weeklyUnits + units,
      health: Math.max(0, agent.health - Math.max(0, units - 2) * 0.4),
    }
  }
  if (agent.activity === 'hospitalized') return { ...agent, activity: 'recovering', health: Math.min(100, agent.health + 8) }
  if (agent.activity === 'seeking treatment') return { ...agent, activity: 'in treatment', stage: Math.max(1, agent.stage - 1), bac: 0 }
  return { ...agent, activity: 'resting', health: Math.min(100, agent.health + 0.2) }
}

export function updateStage(agent) {
  const thresholds = [0, 3, 6, 9, 13, 19, 26]
  let stage = agent.stage
  if (stage < 7 && agent.weeklyUnits > thresholds[stage]) stage += 1
  if (stage > 1 && agent.weeklyUnits < thresholds[stage - 1] * 0.6) stage -= 1
  return { ...agent, stage, useMode: drinkingModes[Math.min(3, Math.floor((stage - 1) / 2))], weeklyUnits: 0 }
}
