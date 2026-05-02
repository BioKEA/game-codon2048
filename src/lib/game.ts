import { TIERS } from './tiers'
import type { Rng } from './seededRng'

export const GRID_SIZE = 4

export type Direction = 'up' | 'down' | 'left' | 'right'

export type Tile = {
  id: string
  tier: number
  row: number
  col: number
  label: string
  isNew?: boolean
  isMerged?: boolean
  isAbsorbed?: boolean
}

let nextId = 0
function makeId() {
  return `t${nextId++}`
}

const NUCLEOTIDE_BASES = ['A', 'T', 'G', 'C'] as const

function randomNucleotide(rng: Rng): string {
  return NUCLEOTIDE_BASES[Math.floor(rng() * 4)]
}

function randomCodon(rng: Rng): string {
  return randomNucleotide(rng) + randomNucleotide(rng) + randomNucleotide(rng)
}

export function tierLabel(tier: number, rng: Rng = Math.random): string {
  if (tier === 1) return randomNucleotide(rng)
  if (tier === 2) return randomCodon(rng)
  return TIERS[tier]?.defaultLabel ?? '?'
}

export function emptyCells(tiles: Tile[]): Array<{ row: number; col: number }> {
  const occupied = new Set<string>()
  for (const t of tiles) {
    if (t.isAbsorbed) continue
    occupied.add(`${t.row},${t.col}`)
  }
  const cells: Array<{ row: number; col: number }> = []
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!occupied.has(`${r},${c}`)) cells.push({ row: r, col: c })
    }
  }
  return cells
}

export type SpawnRules = {
  tier2Chance?: number
  tier3Chance?: number
  // Tier 3 spawns only happen once the player has reached this tier or higher,
  // so the player has somewhere to merge them.
  tier3Unlock?: number
  highestTierReached?: number
}

export function spawnTile(
  tiles: Tile[],
  rng: Rng = Math.random,
  rules: SpawnRules = {},
): Tile | null {
  const empty = emptyCells(tiles)
  if (empty.length === 0) return null
  const cell = empty[Math.floor(rng() * empty.length)]
  const t2 = rules.tier2Chance ?? 0.1
  const t3 = rules.tier3Chance ?? 0
  const tier3OK =
    t3 > 0 && (rules.highestTierReached ?? 0) >= (rules.tier3Unlock ?? 4)
  const r = rng()
  let tier: number
  if (tier3OK && r < t3) tier = 3
  else if (r < t3 + t2) tier = 2
  else tier = 1
  return {
    id: makeId(),
    tier,
    row: cell.row,
    col: cell.col,
    label: tierLabel(tier, rng),
    isNew: true,
  }
}

export function initialTiles(
  rng: Rng = Math.random,
  count: number = 2,
  rules: SpawnRules = {},
): Tile[] {
  const tiles: Tile[] = []
  for (let i = 0; i < count; i++) {
    const t = spawnTile(tiles, rng, rules)
    if (t) tiles.push(t)
  }
  return tiles
}

export type MoveResult = {
  tiles: Tile[]
  scoreGained: number
  didMove: boolean
  highestTierReached: number
  newTiersUnlocked: number[]
  mergedTiers: number[]
}

export function moveTiles(
  tiles: Tile[],
  direction: Direction,
  prevHighestTier: number,
  rng: Rng = Math.random,
): MoveResult {
  const survivors: Tile[] = []
  const absorbed: Tile[] = []
  let scoreGained = 0
  let didMove = false
  let highestTierReached = prevHighestTier
  const newTiers = new Set<number>()
  const mergedTiers: number[] = []

  const isHorizontal = direction === 'left' || direction === 'right'
  const isReverse = direction === 'right' || direction === 'down'

  for (let lane = 0; lane < GRID_SIZE; lane++) {
    const laneTiles = tiles
      .filter((t) => !t.isAbsorbed && (isHorizontal ? t.row === lane : t.col === lane))
      .sort((a, b) => {
        const ap = isHorizontal ? a.col : a.row
        const bp = isHorizontal ? b.col : b.row
        return isReverse ? bp - ap : ap - bp
      })

    let writeIdx = 0
    let lastSurvivor: Tile | null = null
    let lastMergeable = false

    for (const tile of laneTiles) {
      if (lastSurvivor && lastMergeable && lastSurvivor.tier === tile.tier) {
        const mergedTier = lastSurvivor.tier + 1
        lastSurvivor.tier = mergedTier
        lastSurvivor.label = tierLabel(mergedTier, rng)
        lastSurvivor.isMerged = true
        lastSurvivor.isNew = false
        absorbed.push({
          ...tile,
          row: lastSurvivor.row,
          col: lastSurvivor.col,
          isAbsorbed: true,
          isNew: false,
          isMerged: false,
        })
        scoreGained += TIERS[mergedTier]?.scoreValue ?? Math.pow(2, mergedTier)
        mergedTiers.push(mergedTier)
        if (mergedTier > highestTierReached) {
          highestTierReached = mergedTier
          newTiers.add(mergedTier)
        }
        lastMergeable = false
        didMove = true
      } else {
        let newRow: number
        let newCol: number
        if (isHorizontal) {
          newRow = lane
          newCol = isReverse ? GRID_SIZE - 1 - writeIdx : writeIdx
        } else {
          newRow = isReverse ? GRID_SIZE - 1 - writeIdx : writeIdx
          newCol = lane
        }
        if (tile.row !== newRow || tile.col !== newCol) didMove = true
        const survivor: Tile = {
          ...tile,
          row: newRow,
          col: newCol,
          isNew: false,
          isMerged: false,
        }
        survivors.push(survivor)
        lastSurvivor = survivor
        lastMergeable = true
        writeIdx++
      }
    }
  }

  return {
    tiles: [...survivors, ...absorbed],
    scoreGained,
    didMove,
    highestTierReached,
    newTiersUnlocked: Array.from(newTiers).sort((a, b) => a - b),
    mergedTiers,
  }
}

export function isGameOver(tiles: Tile[]): boolean {
  const active = tiles.filter((t) => !t.isAbsorbed)
  if (active.length < GRID_SIZE * GRID_SIZE) return false
  const grid: (Tile | null)[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(null),
  )
  for (const t of active) grid[t.row][t.col] = t
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const t = grid[r][c]
      if (!t) return false
      if (c + 1 < GRID_SIZE && grid[r][c + 1]?.tier === t.tier) return false
      if (r + 1 < GRID_SIZE && grid[r + 1][c]?.tier === t.tier) return false
    }
  }
  return true
}
