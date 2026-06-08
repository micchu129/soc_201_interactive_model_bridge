import { parameterMetadata } from '../config/parameters'

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value)))

export function validateOptions(options) {
  return Object.fromEntries(Object.entries(options).map(([key, value]) => {
    const meta = parameterMetadata[key]
    return [key, meta ? clamp(value, meta.min, meta.max) : value]
  }))
}

export function normalizeDistribution(values) {
  const sum = values.reduce((total, value) => total + Math.max(0, Number(value)), 0) || 1
  return values.map(value => Math.max(0, Number(value)) / sum)
}
