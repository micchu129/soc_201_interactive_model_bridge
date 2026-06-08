export const defaultPolicies = {
  tax: 42,
  regulation: 38,
  enforcement: 32,
  treatment: 46,
  research: 25,
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export function calculateOutcomes(p) {
  const prevention = p.tax * .16 + p.regulation * .13 + p.enforcement * .08 + p.treatment * .18
  const burdenReduction = p.treatment * .14 + p.regulation * .07 + p.enforcement * .08
  return {
    consumption: { value: `${clamp(12.4 - prevention * .045, 6, 14).toFixed(1)} L`, trend: 'per adult / year' },
    heavy: { value: `${clamp(24 - prevention * .16, 7, 28).toFixed(1)}%`, trend: 'heavy drinking rate' },
    acute: { value: Math.round(clamp(910 - prevention * 8.2, 250, 1100)).toLocaleString(), trend: 'events / year' },
    hospital: { value: `${Math.round(clamp(86 - burdenReduction * .48, 35, 95))}%`, trend: 'relative burden' },
    police: { value: `${Math.round(clamp(78 - (p.enforcement * .09 + prevention * .28), 38, 90))}%`, trend: 'relative burden' },
    spending: { value: `€${(18 + p.enforcement * .18 + p.treatment * .32 + p.research * .2).toFixed(1)}m`, trend: 'public spending' },
    revenue: { value: `€${(22 + p.tax * .52 - prevention * .08).toFixed(1)}m`, trend: 'estimated tax revenue' },
    inequality: { value: `${clamp(68 - p.treatment * .28 - p.regulation * .08, 31, 75).toFixed(0)}/100`, trend: 'inequality burden' },
    confidence: { value: `${Math.round(42 + p.research * .5)}%`, trend: 'data confidence' },
  }
}
