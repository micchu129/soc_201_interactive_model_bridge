export const SIM_MINUTES_PER_DECISION_TICK = 120
export const speedOptions = [0, 1, 4, 12]

export function calendarFromMinutes(totalMinutes) {
  const dayIndex = Math.floor(totalMinutes / 1440)
  const minuteOfDay = totalMinutes % 1440
  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const hours = String(Math.floor(minuteOfDay / 60)).padStart(2, '0')
  const minutes = String(Math.floor(minuteOfDay % 60)).padStart(2, '0')
  return {
    day: days[dayIndex % 7],
    week: Math.floor(dayIndex / 7) + 1,
    time: `${hours}:${minutes}`,
    weekend: dayIndex % 7 === 0 || dayIndex % 7 === 1 || (dayIndex % 7 === 6 && minuteOfDay >= 1080),
  }
}
