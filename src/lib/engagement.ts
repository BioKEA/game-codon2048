// Engagement tracking — decides when to show the support nudge.
//
// The nudge fires AFTER the user has clearly enjoyed the game enough to
// justify the ask. Multiple OR'd thresholds so it triggers via the path
// the player actually takes:
//   • 5+ games completed (game-over fired)
//   • 15+ minutes total play time (rough — counts foreground time)
//   • Reached Cell (T7) at least once AND played on 2+ different days
//
// Show frequency: at most every 7 days, 3 lifetime impressions, never
// after opting out.

const STORAGE_KEY = 'codon-collider:engagement-v1'

const DAY_MS = 24 * 60 * 60 * 1000
const SHOW_INTERVAL_MS = 7 * DAY_MS
const MAX_IMPRESSIONS = 3
const GAMES_THRESHOLD = 5
const TIME_THRESHOLD_MS = 15 * 60 * 1000
const TIER_THRESHOLD = 7 // Cell

export type EngagementStats = {
  firstSeenAt: number
  gamesCompleted: number
  totalPlayTimeMs: number
  hasReachedTier7: boolean
  daysActive: string[] // unique day-strings
  lastShownAt: number | null
  dismissCount: number
  optedOut: boolean
}

function freshStats(): EngagementStats {
  return {
    firstSeenAt: Date.now(),
    gamesCompleted: 0,
    totalPlayTimeMs: 0,
    hasReachedTier7: false,
    daysActive: [],
    lastShownAt: null,
    dismissCount: 0,
    optedOut: false,
  }
}

function dayString(t: number): string {
  const d = new Date(t)
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`
}

export function loadEngagement(): EngagementStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const fresh = freshStats()
      saveEngagement(fresh)
      return fresh
    }
    const parsed = JSON.parse(raw) as Partial<EngagementStats>
    return {
      ...freshStats(),
      ...parsed,
      daysActive: parsed.daysActive ?? [],
    }
  } catch {
    return freshStats()
  }
}

export function saveEngagement(s: EngagementStats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    // ignore
  }
}

export function recordGameCompletion(stats: EngagementStats): EngagementStats {
  const next = { ...stats, gamesCompleted: stats.gamesCompleted + 1 }
  ensureDayLogged(next)
  saveEngagement(next)
  return next
}

export function recordTimeTick(stats: EngagementStats, ms: number): EngagementStats {
  const next = { ...stats, totalPlayTimeMs: stats.totalPlayTimeMs + ms }
  ensureDayLogged(next)
  saveEngagement(next)
  return next
}

export function recordTierReached(stats: EngagementStats, tier: number): EngagementStats {
  if (tier < TIER_THRESHOLD || stats.hasReachedTier7) return stats
  const next = { ...stats, hasReachedTier7: true }
  saveEngagement(next)
  return next
}

function ensureDayLogged(stats: EngagementStats): void {
  const today = dayString(Date.now())
  if (!stats.daysActive.includes(today)) {
    stats.daysActive.push(today)
    // Cap the list so it doesn't grow unbounded — only the count matters.
    if (stats.daysActive.length > 30) {
      stats.daysActive = stats.daysActive.slice(-30)
    }
  }
}

export function recordNudgeShown(stats: EngagementStats): EngagementStats {
  const next = { ...stats, lastShownAt: Date.now() }
  saveEngagement(next)
  return next
}

export function recordNudgeDismissed(
  stats: EngagementStats,
  optOut: boolean,
): EngagementStats {
  const next = {
    ...stats,
    dismissCount: stats.dismissCount + 1,
    optedOut: stats.optedOut || optOut,
  }
  saveEngagement(next)
  return next
}

export function shouldShowNudge(stats: EngagementStats): boolean {
  if (stats.optedOut) return false
  if (stats.dismissCount >= MAX_IMPRESSIONS) return false
  if (stats.lastShownAt && Date.now() - stats.lastShownAt < SHOW_INTERVAL_MS) {
    return false
  }
  const enoughGames = stats.gamesCompleted >= GAMES_THRESHOLD
  const enoughTime = stats.totalPlayTimeMs >= TIME_THRESHOLD_MS
  const cellAcrossDays = stats.hasReachedTier7 && stats.daysActive.length >= 2
  return enoughGames || enoughTime || cellAcrossDays
}
