import { useEffect, useRef, useState } from 'react'
import { toast, Toaster } from 'sonner'
import { useGame, type GameMode, type GameVariant } from '@/hooks/useGame'
import { TIERS } from '@/lib/tiers'
import { getMuted, setMuted } from '@/lib/sound'
import { POWERUPS, type PowerupType } from '@/lib/powerups'
import {
  ACHIEVEMENTS,
  evaluateAchievements,
  loadStats,
  loadUnlocked,
  saveStats,
  saveUnlocked,
  type LifetimeStats,
  type UnlockedAchievements,
} from '@/lib/achievements'
import {
  loadDifficulty,
  saveDifficulty,
  type Difficulty,
} from '@/lib/difficulty'
import {
  loadEngagement,
  recordGameCompletion,
  recordNudgeDismissed,
  recordNudgeShown,
  recordTierReached,
  recordTimeTick,
  shouldShowNudge,
  type EngagementStats,
} from '@/lib/engagement'
import { dayNumber } from '@/lib/daily'
import { getDisplayName, setDisplayName, submitScore } from '@/lib/leaderboard'
import { tryClaimGoldenSample } from '@/lib/golden-sample'
import { BiokeaLeaderboardPrompt, shouldShowBiokeaPrompt } from '@/components/BiokeaLeaderboardPrompt'
import { Header } from '@/components/Header'
import { ScorePanel } from '@/components/ScorePanel'
import { Board } from '@/components/Board'
import { Controls } from '@/components/Controls'
import { OrbitalBackground } from '@/components/OrbitalBackground'
import { BarcodeStrip } from '@/components/BarcodeStrip'
import { GameOverDialog } from '@/components/GameOverDialog'
import { Tutorial } from '@/components/Tutorial'
import { DiscoveryCodex } from '@/components/DiscoveryCodex'
import { ModeTabs } from '@/components/ModeTabs'
import { PowerupBar } from '@/components/PowerupBar'
import { LabBriefing } from '@/components/LabBriefing'
import { Leaderboard } from '@/components/Leaderboard'
import { DisplayNameModal } from '@/components/DisplayNameModal'
import { CustomSeedModal } from '@/components/CustomSeedModal'
import { DiscoveryFlash } from '@/components/DiscoveryFlash'
import { GameOverSequence } from '@/components/GameOverSequence'
import { SupportNudge } from '@/components/SupportNudge'

const TUTORIAL_KEY = 'codon-collider:tutorial-seen-v1'
const MODE_KEY = 'codon-collider:mode-v1'
const VARIANT_KEY = 'codon-collider:variant-v1'
const LAB_BRIEFING_KEY = 'codon-collider:lab-briefing-seen-v1'

function loadMode(): GameMode {
  // Default new-visitor mode is 'daily' so first-run players land on the
  // shared daily seed (every other BioKEA game uses daily mode by
  // default, and the daily leaderboard is the social hook). Returning
  // players who explicitly switched to endless or custom keep their
  // preference via the stored value.
  try {
    const v = localStorage.getItem(MODE_KEY)
    if (v === 'daily' || v === 'custom' || v === 'endless') return v as GameMode
    return 'daily'
  } catch {
    return 'daily'
  }
}

function loadVariant(): GameVariant {
  try {
    const v = localStorage.getItem(VARIANT_KEY)
    return v === 'lab' ? 'lab' : 'classic'
  } catch {
    return 'classic'
  }
}

function readSeedFromUrl(): string | null {
  try {
    const params = new URLSearchParams(window.location.search)
    const seed = params.get('seed')
    if (seed && seed.length > 0 && seed.length <= 64) return seed
  } catch {
    // ignore
  }
  return null
}

function App() {
  const lastNotifiedTierRef = useRef(0)
  const [tutorialOpen, setTutorialOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return localStorage.getItem(TUTORIAL_KEY) !== '1'
    } catch {
      return true
    }
  })

  function closeTutorial() {
    setTutorialOpen(false)
    try {
      localStorage.setItem(TUTORIAL_KEY, '1')
    } catch {
      // ignore
    }
  }

  const [codexOpen, setCodexOpen] = useState(false)
  const [leaderboardOpen, setLeaderboardOpen] = useState(false)
  const [displayNameModalOpen, setDisplayNameModalOpen] = useState(false)
  const [customSeedModalOpen, setCustomSeedModalOpen] = useState(false)
  // BiokeaLeaderboardPrompt state — game-end "post your score" modal that
  // also offers the optional Lab updates email opt-in.
  const [biokeaPromptOpen, setBiokeaPromptOpen] = useState(false)
  const [biokeaPromptScore, setBiokeaPromptScore] = useState<number>(0)
  const pendingPostRef = useRef<(() => void) | null>(null)

  // Initialize from URL — if ?seed=X is present on first load, switch to custom mode.
  const initialUrlSeed = useState(() => readSeedFromUrl())[0]

  const [mode, setModeState] = useState<GameMode>(() =>
    initialUrlSeed ? 'custom' : loadMode(),
  )
  const [variant, setVariantState] = useState<GameVariant>(() => loadVariant())
  const [customSeed, setCustomSeed] = useState<string | undefined>(
    () => initialUrlSeed ?? undefined,
  )
  const [labBriefingOpen, setLabBriefingOpen] = useState(false)
  const [pendingTargetSlot, setPendingTargetSlot] = useState<number | null>(null)
  const [gameOverSequenceDone, setGameOverSequenceDone] = useState(false)
  const [gameOverDialogDismissed, setGameOverDialogDismissed] = useState(false)

  // Achievements + lifetime stats (persisted, loaded once)
  const [unlocked, setUnlockedState] = useState<UnlockedAchievements>(() =>
    loadUnlocked(),
  )
  const [stats, setStatsState] = useState<LifetimeStats>(() => loadStats())
  const [pendingDisplayNameAction, setPendingDisplayNameAction] = useState<
    null | (() => void)
  >(null)
  const submittedRunIdRef = useRef<string | null>(null)
  const [leaderboardRefreshKey, setLeaderboardRefreshKey] = useState(0)
  const [difficulty, setDifficultyState] = useState<Difficulty>(() => loadDifficulty())
  const [engagement, setEngagement] = useState<EngagementStats>(() => loadEngagement())
  const [supportNudgeOpen, setSupportNudgeOpen] = useState(false)
  const lastGameOverRunIdRef = useRef<string | null>(null)
  const tierMilestoneRef = useRef<number>(0)

  function setDifficulty(d: Difficulty) {
    setDifficultyState(d)
    saveDifficulty(d)
  }

  const game = useGame({
    paused:
      tutorialOpen ||
      codexOpen ||
      labBriefingOpen ||
      leaderboardOpen ||
      displayNameModalOpen ||
      biokeaPromptOpen ||
      customSeedModalOpen ||
      supportNudgeOpen,
    difficulty,
    mode,
    variant,
    customSeed,
  })
  const [muted, setMutedState] = useState(() => getMuted())

  function setMode(m: GameMode) {
    setModeState(m)
    setPendingTargetSlot(null)
    if (m !== 'custom') {
      setCustomSeed(undefined)
      // Clear URL ?seed=
      try {
        const url = new URL(window.location.href)
        if (url.searchParams.has('seed')) {
          url.searchParams.delete('seed')
          window.history.replaceState({}, '', url.toString())
        }
      } catch {
        // ignore
      }
    }
    try {
      localStorage.setItem(MODE_KEY, m)
    } catch {
      // ignore
    }
  }

  function applyCustomSeed(seed: string) {
    setCustomSeed(seed)
    setModeState('custom')
    setPendingTargetSlot(null)
    try {
      localStorage.setItem(MODE_KEY, 'custom')
    } catch {
      // ignore
    }
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('seed', seed)
      window.history.replaceState({}, '', url.toString())
    } catch {
      // ignore
    }
    if (!stats.hasPlayedCustomSeed) {
      const next = { ...stats, hasPlayedCustomSeed: true }
      setStatsState(next)
      saveStats(next)
    }
  }

  function setVariant(v: GameVariant) {
    setVariantState(v)
    setPendingTargetSlot(null)
    try {
      localStorage.setItem(VARIANT_KEY, v)
    } catch {
      // ignore
    }
    if (v === 'lab') {
      try {
        if (localStorage.getItem(LAB_BRIEFING_KEY) !== '1') {
          setLabBriefingOpen(true)
        }
      } catch {
        // ignore
      }
    }
  }

  function closeLabBriefing() {
    setLabBriefingOpen(false)
    try {
      localStorage.setItem(LAB_BRIEFING_KEY, '1')
    } catch {
      // ignore
    }
  }

  function toggleMute() {
    const next = !muted
    setMutedState(next)
    setMuted(next)
  }

  // When a slot is clicked, either apply (no-target) or enter target mode.
  function activatePowerup(slotIdx: number) {
    const powerup = game.inventory[slotIdx]
    if (!powerup) return
    const meta = POWERUPS[powerup.type]
    if (!meta.needsTarget) {
      game.applyPowerup(slotIdx, null)
      setPendingTargetSlot(null)
      return
    }
    if (pendingTargetSlot === slotIdx) {
      // Toggle off if same slot clicked
      setPendingTargetSlot(null)
    } else {
      setPendingTargetSlot(slotIdx)
    }
  }

  function onTileClickInTargetMode(tileId: string) {
    if (pendingTargetSlot === null) return
    game.applyPowerup(pendingTargetSlot, tileId)
    setPendingTargetSlot(null)
  }

  // Cancel target mode if game state changes outside (restart, mode switch, etc.)
  useEffect(() => {
    if (pendingTargetSlot !== null && game.inventory[pendingTargetSlot] === null) {
      setPendingTargetSlot(null)
    }
  }, [pendingTargetSlot, game.inventory])

  const pendingTargetType: PowerupType | null =
    pendingTargetSlot !== null
      ? game.inventory[pendingTargetSlot]?.type ?? null
      : null

  useEffect(() => {
    if (game.highestTier > lastNotifiedTierRef.current && game.highestTier >= 3) {
      const meta = TIERS[game.highestTier]
      if (meta) {
        toast.success(`Discovered: ${meta.name}`, {
          description: `Tier ${game.highestTier} unlocked`,
        })
      }
      lastNotifiedTierRef.current = game.highestTier
    }
  }, [game.highestTier])

  // Reset game-over sequence flag whenever a fresh run starts.
  // Also a natural seam to evaluate whether to show the support nudge —
  // the user has just dismissed the game-over dialog and clicked New Run.
  const wasOverRef = useRef(game.isOver)
  useEffect(() => {
    if (!game.isOver) {
      setGameOverSequenceDone(false)
      setGameOverDialogDismissed(false)
      // Just transitioned from over → not-over: evaluate nudge.
      if (wasOverRef.current && shouldShowNudge(engagement) && !supportNudgeOpen) {
        setSupportNudgeOpen(true)
        setEngagement((s) => recordNudgeShown(s))
      }
    }
    wasOverRef.current = game.isOver
  }, [game.isOver, engagement, supportNudgeOpen])

  // Engagement: count each completed run exactly once, on the first render
  // tick where isOver flips to true for the new run id.
  useEffect(() => {
    if (!game.isOver) return
    const runId = `${variant}/${mode}/${customSeed ?? game.dailyDate}/${game.moveCount}/${game.score}`
    if (lastGameOverRunIdRef.current === runId) return
    lastGameOverRunIdRef.current = runId
    setEngagement((s) => recordGameCompletion(s))
  }, [game.isOver, game.score, game.moveCount, variant, mode, customSeed, game.dailyDate])

  // Engagement: tier-7 milestone (Cell).
  useEffect(() => {
    if (game.highestTier <= tierMilestoneRef.current) return
    tierMilestoneRef.current = game.highestTier
    if (game.highestTier >= 7) {
      setEngagement((s) => recordTierReached(s, game.highestTier))
    }
  }, [game.highestTier])

  // Engagement: tick total play time every 30s while the tab is visible.
  useEffect(() => {
    let lastTick = Date.now()
    const interval = window.setInterval(() => {
      if (document.hidden) {
        lastTick = Date.now()
        return
      }
      const delta = Date.now() - lastTick
      lastTick = Date.now()
      if (delta > 0 && delta < 60_000) {
        setEngagement((s) => recordTimeTick(s, delta))
      }
    }, 30_000)
    return () => window.clearInterval(interval)
  }, [])

  // Achievement evaluation runs on every state change.
  useEffect(() => {
    const newlyUnlocked = evaluateAchievements(
      {
        highestTier: game.highestTier,
        scoreThisRun: game.score,
        moveCount: game.moveCount,
        variant,
        mode,
        isOver: game.isOver,
        discoveredTierCount: Object.keys(game.discoveries).length,
        streak: game.streak,
        stats,
      },
      unlocked,
    )
    if (newlyUnlocked.length === 0) return
    const next = { ...unlocked }
    for (const id of newlyUnlocked) {
      next[id] = Date.now()
      const meta = ACHIEVEMENTS.find((a) => a.id === id)
      if (meta) {
        toast.success(`Achievement: ${meta.name}`, {
          description: meta.description,
        })
      }
    }
    setUnlockedState(next)
    saveUnlocked(next)
  }, [
    game.highestTier,
    game.score,
    game.moveCount,
    game.isOver,
    game.discoveries,
    game.streak,
    variant,
    mode,
    stats,
    unlocked,
  ])

  // On game over, submit the score (daily or custom only) and update lifetime stats.
  useEffect(() => {
    if (!game.isOver) return
    const runId = `${variant}/${mode}/${customSeed ?? game.dailyDate}/${game.moveCount}/${game.score}`
    if (submittedRunIdRef.current === runId) return
    submittedRunIdRef.current = runId

    // Lifetime stats updates
    let nextStats = stats
    let statsChanged = false
    if (game.score > stats.highestScoreEver) {
      nextStats = { ...nextStats, highestScoreEver: game.score }
      statsChanged = true
    }
    if (mode === 'daily' && variant === 'lab') {
      nextStats = {
        ...nextStats,
        labDailiesCompleted: nextStats.labDailiesCompleted + 1,
      }
      statsChanged = true
    }
    if (statsChanged) {
      setStatsState(nextStats)
      saveStats(nextStats)
    }

    // Submit score for daily or custom seeds. If the player hasn't set a
    // display name yet, prompt for one and resubmit when they save —
    // otherwise the score would silently no-op and never reach the
    // leaderboard, which is exactly what was happening in practice.
    if (mode === 'daily' || mode === 'custom') {
      const seedKind = mode === 'daily' ? 'daily' : 'custom'
      const seedId = mode === 'daily' ? game.dailyDate : customSeed!
      const finalTiles = game.tiles
        .filter((t) => !t.isAbsorbed)
        .map((t) => ({ row: t.row, col: t.col, tier: t.tier }))

      const doSubmit = () => {
        submitScore({
          variant,
          seedKind,
          seedId,
          score: game.score,
          highestTier: game.highestTier,
          moveCount: game.moveCount,
          finalTiles,
        })
          .then((result) => {
            if (result.ok && result.submitted) {
              toast.success('Submitted to leaderboard', {
                description: 'Open the leaderboard to see your rank',
              })
              setLeaderboardRefreshKey((k) => k + 1)
              // Golden Sample 26: server validates highestTier >= 11
              // (Ecosystem). The handle the prompt set lives in
              // localStorage; tryClaimGoldenSample reads it.
              // I won't tell. That would be cheating.
              if (seedKind === 'daily') void tryClaimGoldenSample()
            }
          })
          .catch(() => {
            // ignore network errors silently
          })
      }

      // Open the BioKEA leaderboard prompt unless the player has either
      // already subscribed via this prompt or skipped it this session.
      // Pre-populates handle if one is already stored, so returning
      // players who haven't subscribed get one more chance per session.
      // If they skip, doSubmit still posts (handle is set).
      if (shouldShowBiokeaPrompt()) {
        pendingPostRef.current = doSubmit
        setBiokeaPromptScore(game.score)
        setBiokeaPromptOpen(true)
      } else if (!getDisplayName()) {
        // BioKEA prompt suppressed (subscribed/skipped) but no per-game
        // display name set yet — submitScore would silently no-op. Fall
        // back to the per-game DisplayNameModal so the score actually
        // lands on the leaderboard.
        setPendingDisplayNameAction(() => doSubmit)
        setDisplayNameModalOpen(true)
      } else {
        doSubmit()
      }
    }
  }, [
    game.isOver,
    game.score,
    game.highestTier,
    game.moveCount,
    game.tiles,
    game.dailyDate,
    variant,
    mode,
    customSeed,
    stats,
  ])

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#06080d] font-sans text-slate-100"
      style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}
    >
      <OrbitalBackground />
      <DiscoveryFlash highestTier={game.highestTier} />

      <main
        className="relative z-10 mx-auto max-w-2xl px-4 pb-12 sm:pt-12"
        style={{
          paddingTop: 'max(2rem, env(safe-area-inset-top, 0) + 1rem)',
          paddingLeft: 'max(1rem, env(safe-area-inset-left, 0))',
          paddingRight: 'max(1rem, env(safe-area-inset-right, 0))',
          paddingBottom: 'max(3rem, env(safe-area-inset-bottom, 0) + 2rem)',
        }}
      >
        <div className="space-y-8">
          <Header />

          <div className="flex justify-center">
            <BarcodeStrip />
          </div>

          <div className="flex justify-center">
            <ModeTabs
              mode={mode}
              variant={variant}
              customSeed={customSeed}
              difficulty={difficulty}
              onModeChange={setMode}
              onVariantChange={setVariant}
              onDifficultyChange={setDifficulty}
              onOpenCustomSeed={() => setCustomSeedModalOpen(true)}
              dailyDate={game.dailyDate}
            />
          </div>

          <div className="flex justify-center">
            <ScorePanel
              score={game.score}
              best={
                mode === 'daily'
                  ? game.dailyResults[variant][game.dailyDate]?.bestScore ?? 0
                  : mode === 'custom'
                    ? 0
                    : variant === 'classic'
                      ? game.best
                      : game.bestLab
              }
              highestTier={game.highestTier}
              streak={game.streak}
              showStreak={mode === 'daily'}
            />
          </div>

          {variant === 'lab' && (
            <PowerupBar
              inventory={game.inventory}
              pendingDrops={game.pendingDrops}
              score={game.score}
              nextDropAt={
                game.score < 500
                  ? 500
                  : Math.ceil((game.score + 1) / 500) * 500
              }
              pendingTargetType={pendingTargetType}
              pendingTargetSlot={pendingTargetSlot}
              onActivate={activatePowerup}
              onCancelTarget={() => setPendingTargetSlot(null)}
            />
          )}

          <Board
            tiles={game.tiles}
            onMove={game.move}
            targetMode={pendingTargetSlot !== null}
            onTileClick={onTileClickInTargetMode}
            scoreEvents={game.scoreEvents}
            combo={game.combo}
            showReady={game.moveCount === 0 && !game.isOver}
          />

          <div className="space-y-3">
            <Controls
              onRestart={game.restart}
              onUndo={game.undo}
              onHelp={() => setTutorialOpen(true)}
              onCodex={() => setCodexOpen(true)}
              onLeaderboard={() => {
                const name = getDisplayName()
                if (!name) {
                  setPendingDisplayNameAction(() => () => setLeaderboardOpen(true))
                  setDisplayNameModalOpen(true)
                  return
                }
                setLeaderboardOpen(true)
              }}
              onToggleMute={toggleMute}
              canUndo={game.canUndo}
              muted={muted}
              discoveryCount={Object.keys(game.discoveries).length}
            />
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              Arrow keys / WASD / swipe — collide identical sequences
            </p>
          </div>

          <TierLegend highestTier={game.highestTier} />
        </div>
      </main>

      <Tutorial open={tutorialOpen} onClose={closeTutorial} />
      <LabBriefing open={labBriefingOpen} onClose={closeLabBriefing} />
      <DiscoveryCodex
        open={codexOpen}
        onClose={() => setCodexOpen(false)}
        discoveries={game.discoveries}
        achievements={unlocked}
      />
      <Leaderboard
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        defaultVariant={variant}
        defaultSeedKind={mode === 'custom' ? 'custom' : 'daily'}
        defaultSeedId={mode === 'custom' && customSeed ? customSeed : game.dailyDate}
        defaultSeedLabel={
          mode === 'custom' && customSeed
            ? `Custom · ${customSeed}`
            : `Daily · Day ${dayNumber(game.dailyDate)}`
        }
        onEditName={() => {
          setLeaderboardOpen(false)
          setPendingDisplayNameAction(() => () => setLeaderboardOpen(true))
          setDisplayNameModalOpen(true)
        }}
        refreshKey={leaderboardRefreshKey}
      />
      <DisplayNameModal
        open={displayNameModalOpen}
        onClose={() => {
          setDisplayNameModalOpen(false)
          setPendingDisplayNameAction(null)
        }}
        onSave={() => {
          setDisplayNameModalOpen(false)
          if (pendingDisplayNameAction) {
            const action = pendingDisplayNameAction
            setPendingDisplayNameAction(null)
            action()
          }
        }}
        reason={getDisplayName() ? 'edit' : 'first-time'}
      />
      <CustomSeedModal
        open={customSeedModalOpen}
        onClose={() => setCustomSeedModalOpen(false)}
        onSubmit={(seed) => applyCustomSeed(seed)}
        currentSeed={customSeed}
      />
      {biokeaPromptOpen && (
        <BiokeaLeaderboardPrompt
          trigger="game-end"
          gameSlug="codon2048"
          gameTitle="Codon Collider"
          score={{ value: biokeaPromptScore.toLocaleString(), label: 'Score', unit: 'pts' }}
          defaultHandle={getDisplayName() ?? ''}
          onSubmit={(result) => {
            setDisplayName(result.handle)
            setBiokeaPromptOpen(false)
            const action = pendingPostRef.current
            pendingPostRef.current = null
            if (action) action()
          }}
          onSkip={() => {
            setBiokeaPromptOpen(false)
            // If a handle is already stored (returning player who just
            // skipped the email opt-in), still post the score using it.
            const action = pendingPostRef.current
            pendingPostRef.current = null
            if (getDisplayName() && action) action()
          }}
        />
      )}

      <SupportNudge
        open={supportNudgeOpen}
        onClose={(optOut) => {
          setSupportNudgeOpen(false)
          setEngagement((s) => recordNudgeDismissed(s, optOut))
        }}
      />

      <GameOverSequence
        active={game.isOver && !gameOverSequenceDone}
        onComplete={() => setGameOverSequenceDone(true)}
      />

      <GameOverDialog
        open={game.isOver && gameOverSequenceDone && !gameOverDialogDismissed}
        score={game.score}
        highestTier={game.highestTier}
        variant="over"
        onRestart={game.restart}
        onMainMenu={() => {
          setGameOverDialogDismissed(true)
          try {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          } catch {
            // ignore
          }
        }}
        shareData={
          mode === 'daily' || mode === 'custom'
            ? {
                date: game.dailyDate,
                variant,
                finalTiles: game.tiles
                  .filter((t) => !t.isAbsorbed)
                  .map((t) => ({ row: t.row, col: t.col, tier: t.tier })),
                streak: game.streak,
              }
            : undefined
        }
        onViewLeaderboard={
          mode === 'daily' || mode === 'custom'
            ? () => setLeaderboardOpen(true)
            : undefined
        }
      />
      <GameOverDialog
        open={game.hasWon}
        score={game.score}
        highestTier={game.highestTier}
        variant="win"
        onRestart={game.restart}
        onDismiss={game.dismissWin}
      />

      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(8, 12, 20, 0.95)',
            border: '1px solid rgba(34, 211, 238, 0.25)',
            color: '#e0f2fe',
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '12px',
          },
        }}
      />
    </div>
  )
}

function TierLegend({ highestTier }: { highestTier: number }) {
  return (
    <div className="rounded-lg border border-cyan-400/15 bg-slate-950/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-300/80">
          Synthesis Ladder
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
          Target → Ecosystem
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {TIERS.slice(1).map((tier) => {
          const isReached = tier.id <= highestTier
          const isTarget = tier.id === 11
          return (
            <div
              key={tier.id}
              className={`rounded px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-all ${
                isReached
                  ? `${tier.bgClass} ${tier.borderClass} ${tier.textClass} border opacity-100`
                  : 'border border-slate-700/50 bg-slate-900/40 text-slate-600 opacity-60'
              } ${isTarget && !isReached ? 'ring-1 ring-amber-400/30' : ''}`}
            >
              {tier.name}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App
