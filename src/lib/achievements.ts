export type AchievementId =
  | 'first-spark'
  | 'sequencer'
  | 'cellular'
  | 'multicellular'
  | 'speciation'
  | 'earth-day'
  | 'biome-builder'
  | 'gaia'
  | 'documented'
  | 'efficient'
  | 'lab-veteran'
  | 'devoted'
  | 'expedition'
  | 'sandbox'
  | 'high-score-5k'
  | 'high-score-10k'

export type Achievement = {
  id: AchievementId
  name: string
  description: string
  // Tailwind icon color classes for the badge.
  accent: 'cyan' | 'emerald' | 'fuchsia' | 'amber' | 'rose' | 'violet'
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-spark',
    name: 'First Spark',
    description: 'Make your first merge.',
    accent: 'cyan',
  },
  {
    id: 'sequencer',
    name: 'Sequencer',
    description: 'Reach Genome (Tier 6) in any run.',
    accent: 'violet',
  },
  {
    id: 'cellular',
    name: 'Cellular Life',
    description: 'Reach Cell (Tier 7).',
    accent: 'fuchsia',
  },
  {
    id: 'multicellular',
    name: 'Multicellular',
    description: 'Reach Organism (Tier 8).',
    accent: 'rose',
  },
  {
    id: 'speciation',
    name: 'Speciation',
    description: 'Reach Species (Tier 9).',
    accent: 'rose',
  },
  {
    id: 'earth-day',
    name: 'Earth Day',
    description: 'Assemble a complete Ecosystem (Tier 11).',
    accent: 'amber',
  },
  {
    id: 'biome-builder',
    name: 'Biome Builder',
    description: 'Push past Ecosystem to a Biome (Tier 12).',
    accent: 'amber',
  },
  {
    id: 'gaia',
    name: 'Gaia',
    description: 'Reach Biosphere (Tier 13). The whole envelope.',
    accent: 'amber',
  },
  {
    id: 'documented',
    name: 'Fully Documented',
    description: 'Discover every tier from Nucleotide to Biosphere.',
    accent: 'emerald',
  },
  {
    id: 'efficient',
    name: 'Efficient Synthesis',
    description: 'Reach Ecosystem in fewer than 250 moves.',
    accent: 'cyan',
  },
  {
    id: 'lab-veteran',
    name: 'Lab Veteran',
    description: 'Complete 5 daily challenges in Lab variant.',
    accent: 'fuchsia',
  },
  {
    id: 'devoted',
    name: 'Daily Devotion',
    description: 'Maintain a 7-day streak.',
    accent: 'rose',
  },
  {
    id: 'expedition',
    name: 'Expedition',
    description: 'Maintain a 30-day streak.',
    accent: 'amber',
  },
  {
    id: 'sandbox',
    name: 'Sandbox',
    description: 'Play a custom seed.',
    accent: 'cyan',
  },
  {
    id: 'high-score-5k',
    name: 'Five Thousand',
    description: 'Score 5,000 points in a single run.',
    accent: 'emerald',
  },
  {
    id: 'high-score-10k',
    name: 'Ten Thousand',
    description: 'Score 10,000 points in a single run.',
    accent: 'amber',
  },
]

export type UnlockedAchievements = Partial<Record<AchievementId, number>>

const STORAGE_KEY = 'codon-collider:achievements-v1'
const STATS_KEY = 'codon-collider:lifetime-stats-v1'

export function loadUnlocked(): UnlockedAchievements {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as UnlockedAchievements
  } catch {
    return {}
  }
}

export function saveUnlocked(u: UnlockedAchievements) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
  } catch {
    // ignore
  }
}

export type LifetimeStats = {
  labDailiesCompleted: number
  highestScoreEver: number
  hasPlayedCustomSeed: boolean
}

export function loadStats(): LifetimeStats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (!raw) return { labDailiesCompleted: 0, highestScoreEver: 0, hasPlayedCustomSeed: false }
    const parsed = JSON.parse(raw) as Partial<LifetimeStats>
    return {
      labDailiesCompleted: parsed.labDailiesCompleted ?? 0,
      highestScoreEver: parsed.highestScoreEver ?? 0,
      hasPlayedCustomSeed: parsed.hasPlayedCustomSeed ?? false,
    }
  } catch {
    return { labDailiesCompleted: 0, highestScoreEver: 0, hasPlayedCustomSeed: false }
  }
}

export function saveStats(s: LifetimeStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(s))
  } catch {
    // ignore
  }
}

export type AchievementContext = {
  highestTier: number
  scoreThisRun: number
  moveCount: number
  variant: 'classic' | 'lab'
  mode: 'endless' | 'daily' | 'custom'
  isOver: boolean
  discoveredTierCount: number
  streak: number
  stats: LifetimeStats
}

export function evaluateAchievements(
  ctx: AchievementContext,
  current: UnlockedAchievements,
): AchievementId[] {
  const newlyUnlocked: AchievementId[] = []
  function unlock(id: AchievementId) {
    if (!current[id]) newlyUnlocked.push(id)
  }

  if (ctx.scoreThisRun > 0) unlock('first-spark')
  if (ctx.highestTier >= 6) unlock('sequencer')
  if (ctx.highestTier >= 7) unlock('cellular')
  if (ctx.highestTier >= 8) unlock('multicellular')
  if (ctx.highestTier >= 9) unlock('speciation')
  if (ctx.highestTier >= 11) unlock('earth-day')
  if (ctx.highestTier >= 12) unlock('biome-builder')
  if (ctx.highestTier >= 13) unlock('gaia')
  if (ctx.discoveredTierCount >= 13) unlock('documented')
  if (ctx.highestTier >= 11 && ctx.moveCount > 0 && ctx.moveCount < 250) {
    unlock('efficient')
  }
  if (ctx.stats.labDailiesCompleted >= 5) unlock('lab-veteran')
  if (ctx.streak >= 7) unlock('devoted')
  if (ctx.streak >= 30) unlock('expedition')
  if (ctx.stats.hasPlayedCustomSeed) unlock('sandbox')
  if (ctx.scoreThisRun >= 5000 || ctx.stats.highestScoreEver >= 5000) {
    unlock('high-score-5k')
  }
  if (ctx.scoreThisRun >= 10000 || ctx.stats.highestScoreEver >= 10000) {
    unlock('high-score-10k')
  }

  return newlyUnlocked
}
