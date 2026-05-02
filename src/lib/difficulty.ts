export type Difficulty = 'casual' | 'standard' | 'challenge' | 'hardcore'

export type DifficultyConfig = {
  id: Difficulty
  name: string
  description: string
  startTiles: number
  // Probability that a spawned tile is tier 2 (Codon) instead of tier 1.
  tier2Chance: number
  // Probability that a spawned tile is tier 3 (Gene) — only after the player
  // has already reached at least Operon, otherwise it would be unmergeable.
  tier3Chance: number
  // History buffer cap; 0 disables undo entirely.
  undoSize: number
  // Score gap between powerup drops in Lab variant.
  powerupInterval: number
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  casual: {
    id: 'casual',
    name: 'Casual',
    description: 'Friendly. 5% Codon spawns, 10-move undo, fast powerup drops.',
    startTiles: 2,
    tier2Chance: 0.05,
    tier3Chance: 0,
    undoSize: 10,
    powerupInterval: 400,
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    description: 'The classic 2048 spawn ratio. Mid-sized undo. Default.',
    startTiles: 2,
    tier2Chance: 0.1,
    tier3Chance: 0,
    undoSize: 5,
    powerupInterval: 500,
  },
  challenge: {
    id: 'challenge',
    name: 'Challenge',
    description: 'More clutter. Four starting tiles, 20% Codon spawns, occasional Gene drops, two-move undo.',
    startTiles: 4,
    tier2Chance: 0.2,
    tier3Chance: 0.05,
    undoSize: 2,
    powerupInterval: 750,
  },
  hardcore: {
    id: 'hardcore',
    name: 'Hardcore',
    description: 'No safety net. Four starting tiles, 25% Codon and 7% Gene spawns, no undo.',
    startTiles: 4,
    tier2Chance: 0.25,
    tier3Chance: 0.07,
    undoSize: 0,
    powerupInterval: 1000,
  },
}

export const DEFAULT_DIFFICULTY: Difficulty = 'standard'

const STORAGE_KEY = 'codon-collider:difficulty-v1'

export function loadDifficulty(): Difficulty {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'casual' || v === 'challenge' || v === 'hardcore') return v
    return DEFAULT_DIFFICULTY
  } catch {
    return DEFAULT_DIFFICULTY
  }
}

export function saveDifficulty(d: Difficulty) {
  try {
    localStorage.setItem(STORAGE_KEY, d)
  } catch {
    // ignore
  }
}
