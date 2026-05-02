import { fnv1a, mulberry32, type Rng } from './seededRng'
import { TIERS } from './tiers'

const LAUNCH_Y = 2026
const LAUNCH_M = 4
const LAUNCH_D = 27

// Daily date is in UTC so the global leaderboard for "today" is the same
// for every player on the planet — no timezone-specific seeds.
export function todayString(): string {
  const d = new Date()
  return formatDate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate())
}

function formatDate(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function previousDay(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() - 1)
  return formatDate(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate())
}

export function dayNumber(date: string): number {
  const [y, m, d] = date.split('-').map(Number)
  const target = Date.UTC(y, m - 1, d)
  const launch = Date.UTC(LAUNCH_Y, LAUNCH_M - 1, LAUNCH_D)
  const ms = target - launch
  return Math.floor(ms / (24 * 60 * 60 * 1000)) + 1
}

export function dailyRng(date: string, variant: string = 'classic'): Rng {
  return mulberry32(fnv1a(`codon-collider/${variant}/${date}`))
}

export type DailyResult = {
  date: string
  bestScore: number
  highestTier: number
  moveCount: number
  finalTiles: { row: number; col: number; tier: number }[]
  finishedAt: number
}

export type DailyResults = Record<string, DailyResult>

export type DailyResultsByVariant = {
  classic: DailyResults
  lab: DailyResults
}

const DAILY_KEY = 'codon-collider:daily-results-v1'
const DAILY_KEY_V2 = 'codon-collider:daily-results-v2'

export function loadDailyResults(): DailyResultsByVariant {
  try {
    const raw = localStorage.getItem(DAILY_KEY_V2)
    if (raw) return JSON.parse(raw) as DailyResultsByVariant
    // Migrate v1 (single bucket) into classic.
    const v1raw = localStorage.getItem(DAILY_KEY)
    if (v1raw) {
      const classic = JSON.parse(v1raw) as DailyResults
      return { classic, lab: {} }
    }
    return { classic: {}, lab: {} }
  } catch {
    return { classic: {}, lab: {} }
  }
}

export function saveDailyResults(r: DailyResultsByVariant) {
  try {
    localStorage.setItem(DAILY_KEY_V2, JSON.stringify(r))
  } catch {
    // ignore
  }
}

export function recordDailyAttempt(
  results: DailyResultsByVariant,
  variant: 'classic' | 'lab',
  date: string,
  attempt: {
    score: number
    highestTier: number
    moveCount: number
    finalTiles: { row: number; col: number; tier: number }[]
  },
): DailyResultsByVariant {
  const bucket = results[variant]
  const existing = bucket[date]
  const isBetter =
    !existing ||
    attempt.score > existing.bestScore ||
    attempt.highestTier > existing.highestTier
  if (!isBetter && existing) {
    return results
  }
  const updated: DailyResultsByVariant = {
    ...results,
    [variant]: {
      ...bucket,
      [date]: {
        date,
        bestScore: Math.max(attempt.score, existing?.bestScore ?? 0),
        highestTier: Math.max(attempt.highestTier, existing?.highestTier ?? 0),
        moveCount: attempt.moveCount,
        finalTiles: attempt.finalTiles,
        finishedAt: Date.now(),
      },
    },
  }
  saveDailyResults(updated)
  return updated
}

// Mark today as engaged (for streak counting) without writing a full result.
export function touchToday(
  results: DailyResultsByVariant,
  variant: 'classic' | 'lab',
  date: string,
): DailyResultsByVariant {
  if (results[variant][date]) return results
  const updated: DailyResultsByVariant = {
    ...results,
    [variant]: {
      ...results[variant],
      [date]: {
        date,
        bestScore: 0,
        highestTier: 0,
        moveCount: 0,
        finalTiles: [],
        finishedAt: Date.now(),
      },
    },
  }
  saveDailyResults(updated)
  return updated
}

export function computeStreak(
  results: DailyResultsByVariant,
  variant: 'classic' | 'lab',
  today: string,
): number {
  // Streak counts consecutive days played in EITHER variant — engaging
  // with the daily counts whether you picked classic or lab that day.
  const dates = new Set<string>([
    ...Object.keys(results.classic),
    ...Object.keys(results.lab),
  ])
  void variant
  if (dates.size === 0) return 0

  let cursor = today
  if (!dates.has(cursor)) {
    cursor = previousDay(cursor)
    if (!dates.has(cursor)) return 0
  }

  let count = 0
  while (dates.has(cursor)) {
    count++
    cursor = previousDay(cursor)
  }
  return count
}

const TIER_TO_EMOJI: Record<number, string> = {
  0: '⬛',
  1: '🟦',
  2: '🟩',
  3: '🟩',
  4: '🟦',
  5: '🟪',
  6: '🟪',
  7: '🟪',
  8: '🟪',
  9: '🟥',
  10: '🟧',
  11: '🟨',
  12: '🟨',
  13: '⬜',
}

export function buildShareString(args: {
  date: string
  variant: 'classic' | 'lab'
  score: number
  highestTier: number
  finalTiles: { row: number; col: number; tier: number }[]
  streak: number
}): string {
  const { date, variant, score, highestTier, finalTiles, streak } = args
  const grid: number[][] = Array.from({ length: 4 }, () => Array(4).fill(0))
  for (const t of finalTiles) {
    if (t.row >= 0 && t.row < 4 && t.col >= 0 && t.col < 4) {
      grid[t.row][t.col] = t.tier
    }
  }
  const gridText = grid
    .map((row) => row.map((tier) => TIER_TO_EMOJI[tier] ?? '⬛').join(''))
    .join('\n')

  const tierName = highestTier > 0 ? TIERS[highestTier].name : '—'
  const day = dayNumber(date)
  const variantLabel = variant === 'lab' ? ' · Lab' : ''
  const streakLine = streak > 1 ? `\nStreak: ${streak} 🔥` : ''

  return `Codon Collider · Day ${day}${variantLabel}\nScore: ${score.toLocaleString('en-US')} · ${tierName}\n\n${gridText}${streakLine}`
}
