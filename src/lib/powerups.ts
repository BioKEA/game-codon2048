import { GRID_SIZE, type Tile, tierLabel } from './game'
import type { Rng } from './seededRng'

export type PowerupType = 'enzyme' | 'polymerase' | 'centrifuge'

export type Powerup = {
  type: PowerupType
  id: string
}

export type PowerupMeta = {
  type: PowerupType
  name: string
  short: string
  description: string
  needsTarget: boolean
  // Tailwind classes
  bgClass: string
  borderClass: string
  textClass: string
  glowStyle: string
}

export const POWERUPS: Record<PowerupType, PowerupMeta> = {
  enzyme: {
    type: 'enzyme',
    name: 'Restriction Enzyme',
    short: 'Enzyme',
    description: 'Snip out one tile of your choice. The slot becomes empty.',
    needsTarget: true,
    bgClass: 'bg-gradient-to-br from-rose-400/35 to-rose-700/25',
    borderClass: 'border-rose-300/55',
    textClass: 'text-rose-50',
    glowStyle: '0 0 24px -2px rgba(251,113,133,0.6)',
  },
  polymerase: {
    type: 'polymerase',
    name: 'Polymerase',
    short: 'Polymerase',
    description: 'Promote one tile up a single tier. Codon → Gene, Gene → Operon, etc.',
    needsTarget: true,
    bgClass: 'bg-gradient-to-br from-amber-400/40 to-amber-700/28',
    borderClass: 'border-amber-300/60',
    textClass: 'text-amber-50',
    glowStyle: '0 0 26px -2px rgba(251,191,36,0.65)',
  },
  centrifuge: {
    type: 'centrifuge',
    name: 'Centrifuge',
    short: 'Centrifuge',
    description: 'Spin every same-tier pair on the board into a single merged tile, regardless of position.',
    needsTarget: false,
    bgClass: 'bg-gradient-to-br from-fuchsia-400/40 to-fuchsia-700/28',
    borderClass: 'border-fuchsia-300/60',
    textClass: 'text-fuchsia-50',
    glowStyle: '0 0 28px -2px rgba(232,121,249,0.65)',
  },
}

export const INVENTORY_SIZE = 3
export const SCORE_PER_DROP = 500

let nextPowerupId = 0
function makePowerupId() {
  return `p${nextPowerupId++}`
}

export function pickPowerupType(rng: Rng): PowerupType {
  const r = rng()
  if (r < 0.4) return 'enzyme'
  if (r < 0.75) return 'polymerase'
  return 'centrifuge'
}

export function rollPowerup(rng: Rng): Powerup {
  return { type: pickPowerupType(rng), id: makePowerupId() }
}

export type Inventory = (Powerup | null)[]

export function emptyInventory(): Inventory {
  return [null, null, null]
}

export function inventoryCount(inv: Inventory): number {
  return inv.filter((p) => p !== null).length
}

export function addToInventory(inv: Inventory, p: Powerup): Inventory {
  const next = inv.slice()
  for (let i = 0; i < INVENTORY_SIZE; i++) {
    if (next[i] === null) {
      next[i] = p
      return next
    }
  }
  return inv
}

export function removeFromInventory(inv: Inventory, slotIdx: number): Inventory {
  if (slotIdx < 0 || slotIdx >= INVENTORY_SIZE) return inv
  const next = inv.slice()
  next[slotIdx] = null
  return next
}

// ------ Tile operations ------

export type PowerupApplyResult = {
  tiles: Tile[]
  scoreGained: number
  mergedTiers: number[]
  newTiersUnlocked: number[]
  highestTierReached: number
}

export function applyEnzyme(
  tiles: Tile[],
  targetTileId: string,
  prevHighestTier: number,
): PowerupApplyResult {
  const next = tiles.filter((t) => !t.isAbsorbed && t.id !== targetTileId)
  return {
    tiles: next.map((t) => ({ ...t, isNew: false, isMerged: false })),
    scoreGained: 0,
    mergedTiers: [],
    newTiersUnlocked: [],
    highestTierReached: prevHighestTier,
  }
}

const TIER_SCORE_VALUES = [
  0, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192,
]

export function applyPolymerase(
  tiles: Tile[],
  targetTileId: string,
  prevHighestTier: number,
  rng: Rng,
): PowerupApplyResult {
  const next: Tile[] = []
  let scoreGained = 0
  let mergedTier: number | null = null
  let highestTierReached = prevHighestTier
  const newTiers: number[] = []

  for (const t of tiles) {
    if (t.isAbsorbed) continue
    if (t.id === targetTileId && t.tier < 13) {
      const newTier = t.tier + 1
      next.push({
        ...t,
        tier: newTier,
        label: tierLabel(newTier, rng),
        isMerged: true,
        isNew: false,
      })
      mergedTier = newTier
      scoreGained = TIER_SCORE_VALUES[newTier] ?? Math.pow(2, newTier)
      if (newTier > highestTierReached) {
        highestTierReached = newTier
        newTiers.push(newTier)
      }
    } else {
      next.push({ ...t, isNew: false, isMerged: false })
    }
  }

  return {
    tiles: next,
    scoreGained,
    mergedTiers: mergedTier !== null ? [mergedTier] : [],
    newTiersUnlocked: newTiers,
    highestTierReached,
  }
}

export function applyCentrifuge(
  tiles: Tile[],
  prevHighestTier: number,
  rng: Rng,
): PowerupApplyResult {
  // Group living tiles by tier.
  const living = tiles.filter((t) => !t.isAbsorbed)
  const byTier = new Map<number, Tile[]>()
  for (const t of living) {
    const arr = byTier.get(t.tier) ?? []
    arr.push(t)
    byTier.set(t.tier, arr)
  }

  const survivors: Tile[] = []
  const absorbed: Tile[] = []
  let scoreGained = 0
  const mergedTiers: number[] = []
  let highestTierReached = prevHighestTier
  const newTiers = new Set<number>()

  // Sort tile groups so merging is deterministic (top-left first).
  for (const [, group] of byTier) {
    group.sort((a, b) => a.row * GRID_SIZE + a.col - (b.row * GRID_SIZE + b.col))
    let i = 0
    while (i + 1 < group.length) {
      const survivor = group[i]
      const partner = group[i + 1]
      const mergedTier = survivor.tier + 1
      survivors.push({
        ...survivor,
        tier: mergedTier,
        label: tierLabel(mergedTier, rng),
        isMerged: true,
        isNew: false,
      })
      absorbed.push({
        ...partner,
        row: survivor.row,
        col: survivor.col,
        isAbsorbed: true,
        isNew: false,
        isMerged: false,
      })
      scoreGained += TIER_SCORE_VALUES[mergedTier] ?? Math.pow(2, mergedTier)
      mergedTiers.push(mergedTier)
      if (mergedTier > highestTierReached) {
        highestTierReached = mergedTier
        newTiers.add(mergedTier)
      }
      i += 2
    }
    // Odd one out stays as-is.
    if (i < group.length) {
      survivors.push({ ...group[i], isNew: false, isMerged: false })
    }
  }

  return {
    tiles: [...survivors, ...absorbed],
    scoreGained,
    mergedTiers,
    newTiersUnlocked: Array.from(newTiers).sort((a, b) => a - b),
    highestTierReached,
  }
}
