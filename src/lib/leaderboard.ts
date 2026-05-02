import { GAME_ID, leaderboard } from './leaderboard-client'

const CLIENT_ID_KEY = 'codon-collider:client-id-v1'
const DISPLAY_NAME_KEY = 'codon-collider:display-name-v1'
const PERSONAL_BEST_KEY = 'codon-collider:personal-bests-v1'

export type SeedKind = 'daily' | 'custom'
export type Variant = 'classic' | 'lab'

export type LeaderboardEntry = {
  rank: number
  client_id: string
  display_name: string
  score: number
  highest_tier: number
  move_count: number
  final_tiles: { row: number; col: number; tier: number }[]
  created_at: string
}

export type RankInfo = {
  rank: number
  total: number
  score: number
  highest_tier: number
  move_count: number
} | null

function makeUuid(): string {
  // Simple UUIDv4-ish; uses crypto if available, falls back otherwise.
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getClientId(): string {
  try {
    let id = localStorage.getItem(CLIENT_ID_KEY)
    if (!id) {
      id = makeUuid()
      localStorage.setItem(CLIENT_ID_KEY, id)
    }
    return id
  } catch {
    return 'anon-' + Math.random().toString(36).slice(2, 10)
  }
}

export function getDisplayName(): string | null {
  try {
    return localStorage.getItem(DISPLAY_NAME_KEY)
  } catch {
    return null
  }
}

export function setDisplayName(name: string): string {
  const trimmed = name.trim().slice(0, 24)
  try {
    localStorage.setItem(DISPLAY_NAME_KEY, trimmed)
  } catch {
    // ignore
  }
  return trimmed
}

type PersonalBests = Record<string, { score: number; submitted: boolean }>

function pbKey(variant: string, seedKind: SeedKind, seedId: string): string {
  return `${variant}/${seedKind}/${seedId}`
}

export function loadPersonalBests(): PersonalBests {
  try {
    const raw = localStorage.getItem(PERSONAL_BEST_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as PersonalBests
  } catch {
    return {}
  }
}

export function savePersonalBests(p: PersonalBests) {
  try {
    localStorage.setItem(PERSONAL_BEST_KEY, JSON.stringify(p))
  } catch {
    // ignore
  }
}

export function getPersonalBest(
  variant: string,
  seedKind: SeedKind,
  seedId: string,
): { score: number; submitted: boolean } {
  const all = loadPersonalBests()
  return all[pbKey(variant, seedKind, seedId)] ?? { score: 0, submitted: false }
}

export type SubmitResult =
  | { ok: true; submitted: boolean; reason?: string }
  | { ok: false; error: string }

// codon2048 has two distinguishing dimensions (variant + seedKind) but the
// shared schema only has one `mode` field. Combine them so the four buckets
// (classic-daily, classic-custom, lab-daily, lab-custom) stay separable.
function modeFor(variant: Variant, seedKind: SeedKind): string {
  return `${variant}-${seedKind}`
}

export async function submitScore(args: {
  variant: Variant
  seedKind: SeedKind
  seedId: string
  score: number
  highestTier: number
  moveCount: number
  finalTiles: { row: number; col: number; tier: number }[]
}): Promise<SubmitResult> {
  const name = getDisplayName()
  if (!name) {
    return { ok: true, submitted: false, reason: 'no display name set' }
  }
  const all = loadPersonalBests()
  const key = pbKey(args.variant, args.seedKind, args.seedId)
  const existing = all[key]
  if (existing && existing.score >= args.score) {
    return { ok: true, submitted: false, reason: 'not a personal best' }
  }

  const result = await leaderboard.submitScore({
    gameId: GAME_ID,
    mode: modeFor(args.variant, args.seedKind),
    seed: args.seedId,
    score: args.score,
    playerHandle: name,
    metadata: {
      clientId: getClientId(),
      highestTier: args.highestTier,
      moveCount: args.moveCount,
      finalTiles: args.finalTiles,
    },
  })

  if (!result.ok) {
    const msg =
      result.reason === 'rate_limited' ? 'Slow down — too many submissions.' :
      result.reason === 'invalid' ? 'Score rejected.' :
      result.reason === 'unconfigured' ? 'Leaderboard offline.' :
      'Network error.'
    return { ok: false, error: msg }
  }

  all[key] = { score: args.score, submitted: true }
  savePersonalBests(all)
  return { ok: true, submitted: true }
}

export type FetchResult<T> = { ok: true; data: T } | { ok: false; error: string }

export async function fetchLeaderboard(args: {
  variant: Variant
  seedKind: SeedKind
  seedId: string
  limit?: number
}): Promise<FetchResult<LeaderboardEntry[]>> {
  try {
    const entries = await leaderboard.getTopScores({
      gameId: GAME_ID,
      mode: modeFor(args.variant, args.seedKind),
      seed: args.seedId,
      limit: args.limit ?? 100,
    })

    // Collapse to one row per client (their best), matching the legacy RPC
    // which used `distinct on (client_id)`. The shared schema returns raw
    // submissions, so we dedupe here.
    const bestByClient = new Map<string, LeaderboardEntry>()
    for (const e of entries) {
      const meta = (e.metadata ?? {}) as Record<string, unknown>
      const clientId = typeof meta.clientId === 'string' ? meta.clientId : e.id
      const existing = bestByClient.get(clientId)
      const candidate: LeaderboardEntry = {
        rank: 0,
        client_id: clientId,
        display_name: e.player_handle,
        score: e.score,
        highest_tier: typeof meta.highestTier === 'number' ? meta.highestTier : 0,
        move_count: typeof meta.moveCount === 'number' ? meta.moveCount : 0,
        final_tiles: Array.isArray(meta.finalTiles)
          ? (meta.finalTiles as { row: number; col: number; tier: number }[])
          : [],
        created_at: e.created_at,
      }
      if (
        !existing ||
        candidate.score > existing.score ||
        (candidate.score === existing.score && candidate.move_count < existing.move_count)
      ) {
        bestByClient.set(clientId, candidate)
      }
    }

    const ranked = Array.from(bestByClient.values())
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        if (a.move_count !== b.move_count) return a.move_count - b.move_count
        return a.created_at.localeCompare(b.created_at)
      })
      .map((row, i) => ({ ...row, rank: i + 1 }))

    return { ok: true, data: ranked }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'network error' }
  }
}

export async function fetchMyRank(args: {
  variant: Variant
  seedKind: SeedKind
  seedId: string
}): Promise<RankInfo> {
  const pb = getPersonalBest(args.variant, args.seedKind, args.seedId)
  if (!pb.submitted || pb.score <= 0) return null

  // Pull a generous slice and resolve rank locally — the shared client's
  // getPlayerRank counts every submission, but our UI ranks unique players,
  // so we replicate the dedupe done in fetchLeaderboard.
  const board = await fetchLeaderboard({ ...args, limit: 500 })
  if (!board.ok) return null

  const myClientId = getClientId()
  const me = board.data.find((row) => row.client_id === myClientId)
  if (!me) return null

  return {
    rank: me.rank,
    total: board.data.length,
    score: me.score,
    highest_tier: me.highest_tier,
    move_count: me.move_count,
  }
}
