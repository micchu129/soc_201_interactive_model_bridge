export function applyPolicies(current, pending) {
  return { ...current, ...pending, appliedAt: Date.now() }
}
