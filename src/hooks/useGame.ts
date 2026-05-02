import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  type Direction,
  type Tile,
  initialTiles,
  isGameOver,
  moveTiles,
  spawnTile,
} from '@/lib/game'
import {
  computeStreak,
  dailyRng,
  loadDailyResults,
  recordDailyAttempt,
  todayString,
  touchToday,
  type DailyResultsByVariant,
} from '@/lib/daily'
import { TIERS } from '@/lib/tiers'
import {
  DIFFICULTIES,
  type Difficulty,
  DEFAULT_DIFFICULTY,
} from '@/lib/difficulty'
import { fnv1a, mulberry32, type Rng } from '@/lib/seededRng'
import {
  applyCentrifuge,
  applyEnzyme,
  applyPolymerase,
  emptyInventory,
  inventoryCount,
  rollPowerup,
  type Inventory,
  type Powerup,
  POWERUPS,
} from '@/lib/powerups'
import {
  playCentrifuge,
  playDiscovery,
  playEnzyme,
  playMerge,
  playMove,
  playPolymerase,
} from '@/lib/sound'

export type GameMode = 'endless' | 'daily' | 'custom'
export type GameVariant = 'classic' | 'lab'

const STORAGE_KEY = 'codon-collider:v1'
const DISCOVERIES_KEY = 'codon-collider:discoveries-v1'
const ANIMATION_MS = 160

type Persisted = {
  best: number
  bestLab?: number
}

export type Discovery = {
  moveCount: number
  firstReachedAt: number
}

export type Discoveries = Record<number, Discovery>

type Snapshot = {
  tiles: Tile[]
  score: number
  highestTier: number
  moveCount: number
  combo: number
  inventory: Inventory
  nextDropAt: number
  pendingDrops: number
}

const MAX_COMBO_MULT = 5
let nextScoreEventId = 0
const SCORE_EVENT_LIFE_MS = 900

function loadPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { best: 0, bestLab: 0 }
    const parsed = JSON.parse(raw) as Persisted
    return { best: parsed.best ?? 0, bestLab: parsed.bestLab ?? 0 }
  } catch {
    return { best: 0, bestLab: 0 }
  }
}

function savePersisted(data: Persisted) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

function loadDiscoveries(): Discoveries {
  try {
    const raw = localStorage.getItem(DISCOVERIES_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Discoveries
  } catch {
    return {}
  }
}

function saveDiscoveries(d: Discoveries) {
  try {
    localStorage.setItem(DISCOVERIES_KEY, JSON.stringify(d))
  } catch {
    // ignore
  }
}

export type ScoreEvent = {
  id: number
  tier: number
  amount: number
  row: number
  col: number
  comboMultiplier: number
}

export type UseGameReturn = {
  tiles: Tile[]
  score: number
  best: number
  bestLab: number
  highestTier: number
  moveCount: number
  combo: number
  scoreEvents: ScoreEvent[]
  discoveries: Discoveries
  isOver: boolean
  hasWon: boolean
  canUndo: boolean
  mode: GameMode
  variant: GameVariant
  dailyDate: string
  dailyResults: DailyResultsByVariant
  streak: number
  inventory: Inventory
  pendingDrops: number
  move: (direction: Direction) => void
  applyPowerup: (slotIdx: number, targetTileId: string | null) => void
  restart: () => void
  undo: () => void
  dismissWin: () => void
}

function freshRng(
  mode: GameMode,
  variant: GameVariant,
  dailyDate: string,
  customSeed?: string,
): Rng {
  if (mode === 'daily') return dailyRng(dailyDate, variant)
  if (mode === 'custom' && customSeed) {
    return mulberry32(fnv1a(`codon-collider/${variant}/custom/${customSeed}`))
  }
  return Math.random
}

export function useGame({
  paused = false,
  mode = 'endless',
  variant = 'classic',
  customSeed,
  difficulty = DEFAULT_DIFFICULTY,
}: {
  paused?: boolean
  mode?: GameMode
  variant?: GameVariant
  customSeed?: string
  difficulty?: Difficulty
} = {}): UseGameReturn {
  const dailyDate = useMemo(() => todayString(), [])
  // Daily and custom-seed runs are locked to standard difficulty so the
  // leaderboard for a given seed is comparable across players.
  const effectiveDifficulty: Difficulty =
    mode === 'endless' ? difficulty : 'standard'
  const cfg = DIFFICULTIES[effectiveDifficulty]
  const rngRef = useRef<Rng>(freshRng(mode, variant, dailyDate, customSeed))

  const spawnRules = useMemo(
    () => ({
      tier2Chance: cfg.tier2Chance,
      tier3Chance: cfg.tier3Chance,
      tier3Unlock: 4,
    }),
    [cfg.tier2Chance, cfg.tier3Chance],
  )

  const [tiles, setTiles] = useState<Tile[]>(() =>
    initialTiles(rngRef.current, cfg.startTiles, spawnRules),
  )
  const [score, setScore] = useState(0)
  const [highestTier, setHighestTier] = useState(0)
  const [moveCount, setMoveCount] = useState(0)
  const [combo, setCombo] = useState(0)
  const [scoreEvents, setScoreEvents] = useState<ScoreEvent[]>([])
  const [discoveries, setDiscoveries] = useState<Discoveries>(() => {
    const stored = loadDiscoveries()
    if (!stored[1]) {
      stored[1] = { moveCount: 0, firstReachedAt: Date.now() }
      saveDiscoveries(stored)
    }
    return stored
  })
  const [isOver, setIsOver] = useState(false)
  const [hasWon, setHasWon] = useState(false)
  const [winDismissed, setWinDismissed] = useState(false)
  const initialPersisted = useMemo(() => loadPersisted(), [])
  const [best, setBest] = useState(() => initialPersisted.best)
  const [bestLab, setBestLab] = useState(() => initialPersisted.bestLab ?? 0)
  const [history, setHistory] = useState<Snapshot[]>([])
  const [dailyResults, setDailyResults] = useState<DailyResultsByVariant>(() =>
    loadDailyResults(),
  )

  // Powerup state (only meaningful in lab variant; kept clean otherwise).
  const [inventory, setInventory] = useState<Inventory>(() => emptyInventory())
  const [nextDropAt, setNextDropAt] = useState<number>(cfg.powerupInterval)
  const [pendingDrops, setPendingDrops] = useState<number>(0)

  const animatingRef = useRef(false)
  const cleanupTimerRef = useRef<number | null>(null)
  const prevRunIdRef = useRef<string>(
    `${mode}/${variant}/${customSeed ?? ''}/${effectiveDifficulty}`,
  )

  // When mode, variant, customSeed, or difficulty changes, reset board.
  useEffect(() => {
    const runId = `${mode}/${variant}/${customSeed ?? ''}/${effectiveDifficulty}`
    if (prevRunIdRef.current === runId) return
    prevRunIdRef.current = runId
    if (cleanupTimerRef.current) window.clearTimeout(cleanupTimerRef.current)
    animatingRef.current = false
    rngRef.current = freshRng(mode, variant, dailyDate, customSeed)
    setTiles(initialTiles(rngRef.current, cfg.startTiles, spawnRules))
    setScore(0)
    setHighestTier(0)
    setMoveCount(0)
    setCombo(0)
    setScoreEvents([])
    setIsOver(false)
    setHasWon(false)
    setWinDismissed(false)
    setHistory([])
    setInventory(emptyInventory())
    setNextDropAt(cfg.powerupInterval)
    setPendingDrops(0)
  }, [mode, variant, dailyDate, customSeed, effectiveDifficulty, cfg, spawnRules])

  const move = useCallback(
    (direction: Direction) => {
      if (animatingRef.current || isOver) return

      const result = moveTiles(tiles, direction, highestTier, rngRef.current)
      if (!result.didMove) return

      animatingRef.current = true
      if (cfg.undoSize > 0) {
        setHistory((prev) => {
          const next = [
            ...prev,
            {
              tiles: tiles.map((t) => ({ ...t })),
              score,
              highestTier,
              moveCount,
              combo,
              inventory: inventory.slice(),
              nextDropAt,
              pendingDrops,
            },
          ]
          return next.slice(-cfg.undoSize)
        })
      }

      const newMoveCount = moveCount + 1
      setMoveCount(newMoveCount)

      // Combo: chain of moves that produced merges. Resets when a move
      // doesn't produce any merges. Multiplier caps at MAX_COMBO_MULT.
      const merged = result.mergedTiers.length > 0
      const newCombo = merged ? combo + 1 : 0
      setCombo(newCombo)
      const multiplier = merged ? Math.min(newCombo, MAX_COMBO_MULT) : 1

      playMove()
      if (result.newTiersUnlocked.length > 0) {
        playDiscovery(result.newTiersUnlocked[result.newTiersUnlocked.length - 1])
      } else if (result.mergedTiers.length > 0) {
        playMerge(Math.max(...result.mergedTiers))
      }

      // Emit a score event per merged survivor for floating popups.
      if (merged) {
        const events: ScoreEvent[] = []
        for (const t of result.tiles) {
          if (t.isMerged && !t.isAbsorbed) {
            const baseScore = TIERS[t.tier]?.scoreValue ?? Math.pow(2, t.tier)
            events.push({
              id: nextScoreEventId++,
              tier: t.tier,
              amount: baseScore * multiplier,
              row: t.row,
              col: t.col,
              comboMultiplier: multiplier,
            })
          }
        }
        if (events.length > 0) {
          setScoreEvents((prev) => [...prev, ...events])
          window.setTimeout(() => {
            setScoreEvents((prev) =>
              prev.filter((e) => !events.some((ne) => ne.id === e.id)),
            )
          }, SCORE_EVENT_LIFE_MS)
        }
      }

      if (result.newTiersUnlocked.length > 0) {
        setDiscoveries((prev) => {
          const updated: Discoveries = { ...prev }
          let changed = false
          for (const tier of result.newTiersUnlocked) {
            if (!updated[tier]) {
              updated[tier] = {
                moveCount: newMoveCount,
                firstReachedAt: Date.now(),
              }
              changed = true
            }
          }
          if (changed) saveDiscoveries(updated)
          return changed ? updated : prev
        })
      }

      const livingAfter = result.tiles.filter((t) => !t.isAbsorbed)
      const spawned = spawnTile(livingAfter, rngRef.current, {
        ...spawnRules,
        highestTierReached: result.highestTierReached,
      })
      const withSpawn = spawned ? [...result.tiles, spawned] : result.tiles
      setTiles(withSpawn)

      if (mode === 'daily') {
        setDailyResults((prev) => touchToday(prev, variant, dailyDate))
      }

      const newScore = score + result.scoreGained * multiplier
      setScore(newScore)
      setHighestTier(result.highestTierReached)

      if (mode === 'endless') {
        if (variant === 'classic' && newScore > best) {
          setBest(newScore)
          savePersisted({ best: newScore, bestLab })
        } else if (variant === 'lab' && newScore > bestLab) {
          setBestLab(newScore)
          savePersisted({ best, bestLab: newScore })
        }
      }

      // Powerup drops in lab variant when crossing score thresholds.
      if (variant === 'lab') {
        let inv = inventory
        let nextAt = nextDropAt
        let pending = pendingDrops
        let availableSlots = 3 - inventoryCount(inv)
        const drops: Powerup[] = []
        while (newScore >= nextAt) {
          nextAt += cfg.powerupInterval
          if (availableSlots > 0) {
            drops.push(rollPowerup(rngRef.current))
            availableSlots--
          } else {
            pending++
          }
        }
        if (drops.length > 0) {
          inv = inv.slice()
          for (const p of drops) {
            for (let i = 0; i < inv.length; i++) {
              if (inv[i] === null) {
                inv[i] = p
                break
              }
            }
          }
          setInventory(inv)
        }
        if (nextAt !== nextDropAt) setNextDropAt(nextAt)
        if (pending !== pendingDrops) setPendingDrops(pending)
      }

      if (result.highestTierReached >= 11 && !hasWon && !winDismissed) {
        setHasWon(true)
      }

      if (cleanupTimerRef.current) window.clearTimeout(cleanupTimerRef.current)
      cleanupTimerRef.current = window.setTimeout(() => {
        setTiles((prev) => {
          const cleaned = prev
            .filter((t) => !t.isAbsorbed)
            .map((t) => ({ ...t, isNew: false, isMerged: false }))
          if (isGameOver(cleaned)) {
            setIsOver(true)
            if (mode === 'daily') {
              setDailyResults((prevResults) =>
                recordDailyAttempt(prevResults, variant, dailyDate, {
                  score: newScore,
                  highestTier: result.highestTierReached,
                  moveCount: newMoveCount,
                  finalTiles: cleaned.map((t) => ({
                    row: t.row,
                    col: t.col,
                    tier: t.tier,
                  })),
                }),
              )
            }
          }
          return cleaned
        })
        animatingRef.current = false
      }, ANIMATION_MS)
    },
    [
      tiles,
      score,
      highestTier,
      moveCount,
      combo,
      isOver,
      best,
      bestLab,
      hasWon,
      winDismissed,
      mode,
      variant,
      dailyDate,
      inventory,
      nextDropAt,
      pendingDrops,
      cfg,
      spawnRules,
    ],
  )

  const applyPowerup = useCallback(
    (slotIdx: number, targetTileId: string | null) => {
      if (animatingRef.current || isOver) return
      if (variant !== 'lab') return
      const powerup = inventory[slotIdx]
      if (!powerup) return
      const meta = POWERUPS[powerup.type]
      if (meta.needsTarget && !targetTileId) return

      // Apply the operation.
      let opResult
      if (powerup.type === 'enzyme' && targetTileId) {
        opResult = applyEnzyme(tiles, targetTileId, highestTier)
      } else if (powerup.type === 'polymerase' && targetTileId) {
        opResult = applyPolymerase(tiles, targetTileId, highestTier, rngRef.current)
      } else if (powerup.type === 'centrifuge') {
        opResult = applyCentrifuge(tiles, highestTier, rngRef.current)
      } else {
        return
      }

      animatingRef.current = true
      if (cfg.undoSize > 0) {
        setHistory((prev) => {
          const next = [
            ...prev,
            {
              tiles: tiles.map((t) => ({ ...t })),
              score,
              highestTier,
              moveCount,
              combo,
              inventory: inventory.slice(),
              nextDropAt,
              pendingDrops,
            },
          ]
          return next.slice(-cfg.undoSize)
        })
      }

      const newMoveCount = moveCount + 1
      setMoveCount(newMoveCount)

      const merged = opResult.mergedTiers.length > 0
      const newCombo = merged ? combo + 1 : 0
      setCombo(newCombo)
      const multiplier = merged ? Math.min(newCombo, MAX_COMBO_MULT) : 1

      // Fire the powerup-specific sound, then merge / discovery sounds if relevant.
      if (powerup.type === 'enzyme') playEnzyme()
      else if (powerup.type === 'polymerase') playPolymerase()
      else if (powerup.type === 'centrifuge') playCentrifuge()
      if (opResult.newTiersUnlocked.length > 0) {
        playDiscovery(opResult.newTiersUnlocked[opResult.newTiersUnlocked.length - 1])
      } else if (opResult.mergedTiers.length > 0) {
        playMerge(Math.max(...opResult.mergedTiers))
      }

      // Score-event popups for merged tiles in the powerup result.
      if (merged) {
        const events: ScoreEvent[] = []
        for (const t of opResult.tiles) {
          if (t.isMerged && !t.isAbsorbed) {
            const baseScore = TIERS[t.tier]?.scoreValue ?? Math.pow(2, t.tier)
            events.push({
              id: nextScoreEventId++,
              tier: t.tier,
              amount: baseScore * multiplier,
              row: t.row,
              col: t.col,
              comboMultiplier: multiplier,
            })
          }
        }
        if (events.length > 0) {
          setScoreEvents((prev) => [...prev, ...events])
          window.setTimeout(() => {
            setScoreEvents((prev) =>
              prev.filter((e) => !events.some((ne) => ne.id === e.id)),
            )
          }, SCORE_EVENT_LIFE_MS)
        }
      }

      // Discoveries.
      if (opResult.newTiersUnlocked.length > 0) {
        setDiscoveries((prev) => {
          const updated: Discoveries = { ...prev }
          let changed = false
          for (const tier of opResult.newTiersUnlocked) {
            if (!updated[tier]) {
              updated[tier] = {
                moveCount: newMoveCount,
                firstReachedAt: Date.now(),
              }
              changed = true
            }
          }
          if (changed) saveDiscoveries(updated)
          return changed ? updated : prev
        })
      }

      // Spawn new tile (powerup costs a move slot).
      const livingAfter = opResult.tiles.filter((t) => !t.isAbsorbed)
      const spawned = spawnTile(livingAfter, rngRef.current, {
        ...spawnRules,
        highestTierReached: opResult.highestTierReached,
      })
      const withSpawn = spawned ? [...opResult.tiles, spawned] : opResult.tiles
      setTiles(withSpawn)

      const newScore = score + opResult.scoreGained * multiplier
      setScore(newScore)
      setHighestTier(opResult.highestTierReached)

      // Update inventory: remove used slot, fill from pendingDrops if any.
      let newInv = inventory.slice()
      newInv[slotIdx] = null
      let newPending = pendingDrops
      let newNextAt = nextDropAt
      if (newPending > 0) {
        const idx = newInv.findIndex((p) => p === null)
        if (idx >= 0) {
          newInv[idx] = rollPowerup(rngRef.current)
          newPending--
        }
      }
      // Also check if score crossed thresholds (rare, but possible if polymerase pushed score over).
      let availableSlots = 3 - inventoryCount(newInv)
      while (newScore >= newNextAt) {
        newNextAt += cfg.powerupInterval
        if (availableSlots > 0) {
          const idx = newInv.findIndex((p) => p === null)
          if (idx >= 0) {
            newInv = newInv.slice()
            newInv[idx] = rollPowerup(rngRef.current)
            availableSlots--
          }
        } else {
          newPending++
        }
      }
      setInventory(newInv)
      setPendingDrops(newPending)
      setNextDropAt(newNextAt)

      if (mode === 'daily') {
        setDailyResults((prev) => touchToday(prev, variant, dailyDate))
      }

      if (mode === 'endless' && newScore > bestLab) {
        setBestLab(newScore)
        savePersisted({ best, bestLab: newScore })
      }

      if (opResult.highestTierReached >= 11 && !hasWon && !winDismissed) {
        setHasWon(true)
      }

      if (cleanupTimerRef.current) window.clearTimeout(cleanupTimerRef.current)
      cleanupTimerRef.current = window.setTimeout(() => {
        setTiles((prev) => {
          const cleaned = prev
            .filter((t) => !t.isAbsorbed)
            .map((t) => ({ ...t, isNew: false, isMerged: false }))
          if (isGameOver(cleaned)) {
            setIsOver(true)
            if (mode === 'daily') {
              setDailyResults((prevResults) =>
                recordDailyAttempt(prevResults, variant, dailyDate, {
                  score: newScore,
                  highestTier: opResult.highestTierReached,
                  moveCount: newMoveCount,
                  finalTiles: cleaned.map((t) => ({
                    row: t.row,
                    col: t.col,
                    tier: t.tier,
                  })),
                }),
              )
            }
          }
          return cleaned
        })
        animatingRef.current = false
      }, ANIMATION_MS)
    },
    [
      tiles,
      score,
      highestTier,
      moveCount,
      combo,
      isOver,
      hasWon,
      winDismissed,
      mode,
      variant,
      dailyDate,
      inventory,
      nextDropAt,
      pendingDrops,
      best,
      bestLab,
      cfg,
      spawnRules,
    ],
  )

  const restart = useCallback(() => {
    if (cleanupTimerRef.current) window.clearTimeout(cleanupTimerRef.current)
    animatingRef.current = false
    rngRef.current = freshRng(mode, variant, dailyDate, customSeed)
    setTiles(initialTiles(rngRef.current, cfg.startTiles, spawnRules))
    setScore(0)
    setHighestTier(0)
    setMoveCount(0)
    setCombo(0)
    setScoreEvents([])
    setIsOver(false)
    setHasWon(false)
    setWinDismissed(false)
    setHistory([])
    setInventory(emptyInventory())
    setNextDropAt(cfg.powerupInterval)
    setPendingDrops(0)
  }, [mode, variant, dailyDate, customSeed, cfg, spawnRules])

  const undo = useCallback(() => {
    if (history.length === 0) return
    if (animatingRef.current) return
    const last = history[history.length - 1]
    setTiles(last.tiles.map((t) => ({ ...t, isNew: false, isMerged: false })))
    setScore(last.score)
    setHighestTier(last.highestTier)
    setMoveCount(last.moveCount)
    setCombo(last.combo)
    setInventory(last.inventory.slice())
    setNextDropAt(last.nextDropAt)
    setPendingDrops(last.pendingDrops)
    setIsOver(false)
    setHistory((prev) => prev.slice(0, -1))
  }, [history])

  const dismissWin = useCallback(() => {
    setHasWon(false)
    setWinDismissed(true)
  }, [])

  useEffect(() => {
    if (paused) return
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      let dir: Direction | null = null
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          dir = 'up'
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          dir = 'down'
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          dir = 'left'
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          dir = 'right'
          break
      }
      if (dir) {
        e.preventDefault()
        move(dir)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [move, paused])

  useEffect(() => {
    return () => {
      if (cleanupTimerRef.current) window.clearTimeout(cleanupTimerRef.current)
    }
  }, [])

  const streak = useMemo(
    () => computeStreak(dailyResults, variant, dailyDate),
    [dailyResults, variant, dailyDate],
  )

  return {
    tiles,
    score,
    best,
    bestLab,
    highestTier,
    moveCount,
    combo,
    scoreEvents,
    discoveries,
    isOver,
    hasWon,
    canUndo: history.length > 0 && !animatingRef.current,
    mode,
    variant,
    dailyDate,
    dailyResults,
    streak,
    inventory,
    pendingDrops,
    move,
    applyPowerup,
    restart,
    undo,
    dismissWin,
  }
}
