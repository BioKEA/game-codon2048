import { Home, Share2, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import { TIERS } from '@/lib/tiers'
import { buildShareString } from '@/lib/daily'

type Props = {
  open: boolean
  score: number
  highestTier: number
  onRestart: () => void
  variant: 'over' | 'win'
  onDismiss?: () => void
  onViewLeaderboard?: () => void
  onMainMenu?: () => void
  shareData?: {
    date: string
    variant: 'classic' | 'lab'
    finalTiles: { row: number; col: number; tier: number }[]
    streak: number
  }
}

export function GameOverDialog({
  open,
  score,
  highestTier,
  onRestart,
  variant,
  onDismiss,
  onViewLeaderboard,
  onMainMenu,
  shareData,
}: Props) {
  if (!open) return null
  const isWin = variant === 'win'
  const highestName = highestTier > 0 ? TIERS[highestTier].name : '—'

  async function handleShare() {
    if (!shareData) return
    const text = buildShareString({
      date: shareData.date,
      variant: shareData.variant,
      score,
      highestTier,
      finalTiles: shareData.finalTiles,
      streak: shareData.streak,
    })
    try {
      if (navigator.share) {
        await navigator.share({ text }).catch(() => {})
      }
      await navigator.clipboard.writeText(text)
      toast.success('Result copied — paste it anywhere')
    } catch {
      toast.error('Could not copy result')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onDismiss} />
      <div
        className="relative w-full max-w-md rounded-2xl border border-cyan-300/30 bg-slate-950/95 p-8 text-center animate-fade-up"
        style={{
          boxShadow: isWin
            ? '0 0 80px -10px rgba(251,191,36,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
            : '0 0 60px -10px rgba(34,211,238,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <div
          className={`mb-2 font-mono text-[10px] uppercase tracking-[0.32em] ${
            isWin ? 'text-amber-300' : 'text-cyan-300'
          }`}
        >
          {isWin ? '◆ Discovery ◆' : 'Run Complete'}
        </div>
        <h2 className="font-sans text-3xl font-semibold text-white mb-1">
          {isWin ? 'Ecosystem Reached.' : 'No moves remaining.'}
        </h2>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400 mb-6">
          {isWin
            ? 'You collided enough sequences to assemble a living ecosystem.'
            : 'The collider has stalled.'}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-md border border-cyan-400/20 bg-slate-900/60 p-3">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-300 mb-1">
              Final Score
            </div>
            <div className="font-mono text-2xl font-semibold text-white tabular-nums">
              {score.toLocaleString('en-US')}
            </div>
          </div>
          <div className="rounded-md border border-amber-300/25 bg-slate-900/60 p-3">
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-amber-200 mb-1">
              Highest Tier
            </div>
            <div className="font-mono text-base font-semibold text-white">
              {highestName}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {isWin && (
            <button
              onClick={onDismiss}
              className="rounded-md border border-amber-300/30 bg-slate-900 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-amber-100 transition-colors hover:bg-amber-500/10"
            >
              Keep Going
            </button>
          )}
          {shareData && (
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300/40 bg-emerald-500/15 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-emerald-50 transition-colors hover:bg-emerald-500/25"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          )}
          {onViewLeaderboard && (
            <button
              onClick={onViewLeaderboard}
              className="inline-flex items-center gap-1.5 rounded-md border border-amber-300/40 bg-amber-500/15 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-amber-50 transition-colors hover:bg-amber-500/25"
            >
              <Trophy className="h-3.5 w-3.5" />
              Leaderboard
            </button>
          )}
          <button
            onClick={onRestart}
            className="rounded-md border border-cyan-300/40 bg-cyan-500/15 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-cyan-50 transition-colors hover:bg-cyan-500/25"
          >
            {shareData ? 'Retry' : 'New Run'}
          </button>
          {onMainMenu && (
            <button
              onClick={onMainMenu}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-400/30 bg-slate-800/60 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-slate-200 transition-colors hover:bg-slate-700/60"
            >
              <Home className="h-3.5 w-3.5" />
              Main Menu
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
