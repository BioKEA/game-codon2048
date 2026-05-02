import { BookOpen, HelpCircle, RotateCcw, Trophy, Undo2, Volume2, VolumeX } from 'lucide-react'

type Props = {
  onRestart: () => void
  onUndo: () => void
  onHelp: () => void
  onCodex: () => void
  onLeaderboard: () => void
  onToggleMute: () => void
  canUndo: boolean
  muted: boolean
  discoveryCount: number
}

const buttonClass =
  'group inline-flex items-center gap-2 rounded-md border border-cyan-400/20 bg-slate-950/60 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-200 transition-all hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-100'
const iconButtonClass =
  'group inline-flex items-center justify-center rounded-md border border-cyan-400/20 bg-slate-950/60 p-2 text-cyan-200 transition-all hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:text-cyan-100'

export function Controls({
  onRestart,
  onUndo,
  onHelp,
  onCodex,
  onLeaderboard,
  onToggleMute,
  canUndo,
  muted,
  discoveryCount,
}: Props) {
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      <button onClick={onLeaderboard} className={buttonClass}>
        <Trophy className="h-3.5 w-3.5" />
        Leaderboard
      </button>
      <button onClick={onCodex} className={`${buttonClass} relative`}>
        <BookOpen className="h-3.5 w-3.5" />
        Codex
        {discoveryCount > 0 && (
          <span className="ml-1 rounded-sm bg-cyan-500/20 border border-cyan-400/30 px-1 py-px font-mono text-[9px] tabular-nums text-cyan-100">
            {discoveryCount}
          </span>
        )}
      </button>
      <button onClick={onHelp} className={buttonClass} title="How to Play">
        <HelpCircle className="h-3.5 w-3.5" />
        Help
      </button>
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`${buttonClass} disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-slate-950/60`}
      >
        <Undo2 className="h-3.5 w-3.5" />
        Undo
      </button>
      <button onClick={onRestart} className={buttonClass}>
        <RotateCcw className="h-3.5 w-3.5" />
        New Run
      </button>
      <button
        onClick={onToggleMute}
        className={iconButtonClass}
        aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
        title={muted ? 'Unmute sounds' : 'Mute sounds'}
      >
        {muted ? (
          <VolumeX className="h-3.5 w-3.5" />
        ) : (
          <Volume2 className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  )
}
