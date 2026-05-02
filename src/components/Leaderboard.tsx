import { useEffect, useState } from 'react'
import { Edit2, Loader2, Trophy, X } from 'lucide-react'
import {
  fetchLeaderboard,
  fetchMyRank,
  getClientId,
  getDisplayName,
  type LeaderboardEntry,
  type RankInfo,
  type SeedKind,
} from '@/lib/leaderboard'
import { TIERS } from '@/lib/tiers'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onClose: () => void
  defaultVariant: 'classic' | 'lab'
  defaultSeedKind: SeedKind
  defaultSeedId: string
  defaultSeedLabel: string
  onEditName: () => void
  refreshKey?: number
}

export function Leaderboard({
  open,
  onClose,
  defaultVariant,
  defaultSeedKind,
  defaultSeedId,
  defaultSeedLabel,
  onEditName,
  refreshKey,
}: Props) {
  const [variant, setVariant] = useState<'classic' | 'lab'>(defaultVariant)
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [rank, setRank] = useState<RankInfo>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const myClientId = getClientId()
  const myName = getDisplayName()

  useEffect(() => {
    if (open) setVariant(defaultVariant)
  }, [open, defaultVariant])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([
      fetchLeaderboard({
        variant,
        seedKind: defaultSeedKind,
        seedId: defaultSeedId,
        limit: 100,
      }),
      fetchMyRank({
        variant,
        seedKind: defaultSeedKind,
        seedId: defaultSeedId,
      }),
    ]).then(([listResult, r]) => {
      if (cancelled) return
      if (listResult.ok) {
        setEntries(listResult.data)
        setError(null)
      } else {
        setEntries([])
        setError(listResult.error)
      }
      setRank(r)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [open, variant, defaultSeedKind, defaultSeedId, refreshKey])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, onClose])

  const isMine = (entry: LeaderboardEntry) => entry.client_id === myClientId

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full max-w-md transform transition-transform duration-300 ease-out',
          'border-l border-amber-300/25 bg-slate-950/98 flex flex-col',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        style={{
          boxShadow: open
            ? '-20px 0 60px -10px rgba(251,191,36,0.25)'
            : 'none',
        }}
        aria-hidden={!open}
      >
        <header className="border-b border-amber-400/15 px-6 py-5 flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-3.5 w-3.5 text-amber-300" />
              <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-amber-300/80">
                Leaderboard
              </span>
            </div>
            <h2 className="font-sans text-xl font-semibold text-white">
              {defaultSeedLabel}
            </h2>
            <div className="mt-2 inline-flex items-center gap-0.5 rounded-md border border-cyan-400/15 bg-slate-950/60 p-0.5">
              <VariantTab
                active={variant === 'classic'}
                onClick={() => setVariant('classic')}
                label="Classic"
              />
              <VariantTab
                active={variant === 'lab'}
                onClick={() => setVariant('lab')}
                label="Lab"
              />
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close leaderboard"
            className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-cyan-200"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="border-b border-cyan-400/15 px-6 py-3 flex items-center justify-between gap-3 bg-slate-900/40">
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-cyan-300/80 mb-0.5">
              Playing as
            </div>
            <div className="font-mono text-sm font-medium text-cyan-100 truncate">
              {myName ?? <span className="text-slate-500">— not set —</span>}
            </div>
          </div>
          <button
            onClick={onEditName}
            className="inline-flex items-center gap-1 rounded-sm border border-cyan-400/20 bg-slate-950 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-200 transition-colors hover:bg-cyan-500/10"
          >
            <Edit2 className="h-3 w-3" />
            {myName ? 'Edit' : 'Set name'}
          </button>
        </div>

        {rank && (
          <div className="border-b border-cyan-400/10 px-6 py-2.5 flex items-center justify-between bg-cyan-500/5">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300">
              You're ranked
            </span>
            <span className="font-mono text-sm tabular-nums text-cyan-100">
              <span className="font-semibold">#{rank.rank}</span>
              <span className="text-slate-500"> / {rank.total}</span>
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 flex items-center justify-center text-cyan-300/60">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : error ? (
            <OfflineState />
          ) : entries.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="px-3 py-2 space-y-1">
              {entries.map((entry) => (
                <Row key={entry.client_id} entry={entry} isMine={isMine(entry)} />
              ))}
            </div>
          )}
        </div>

        <footer className="border-t border-amber-400/15 px-6 py-3 font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500">
          {defaultSeedKind === 'daily'
            ? 'Resets daily · names are unverified'
            : 'Custom seed · share to compare'}
        </footer>
      </aside>
    </>
  )
}

function VariantTab({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-sm px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] transition-all',
        active
          ? 'bg-cyan-500/15 text-cyan-50 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.4)]'
          : 'text-slate-400 hover:text-cyan-200',
      )}
    >
      {label}
    </button>
  )
}

function Row({ entry, isMine }: { entry: LeaderboardEntry; isMine: boolean }) {
  const tierMeta = TIERS[entry.highest_tier]
  const isPodium = entry.rank <= 3
  const podiumColors = ['text-amber-300', 'text-slate-300', 'text-orange-300']
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-md border px-3 py-2 transition-colors',
        isMine
          ? 'border-cyan-300/40 bg-cyan-500/10'
          : 'border-cyan-400/10 bg-slate-900/50',
      )}
    >
      <div
        className={cn(
          'w-7 text-center font-mono text-[11px] tabular-nums',
          isPodium ? `${podiumColors[entry.rank - 1]} font-semibold` : 'text-slate-500',
        )}
      >
        {isPodium ? `${'★'.repeat(1)}${entry.rank}` : `#${entry.rank}`}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'font-mono text-sm truncate',
              isMine ? 'text-cyan-50 font-semibold' : 'text-slate-100',
            )}
          >
            {entry.display_name || 'anon'}
          </span>
          {isMine && (
            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-cyan-300/80">
              you
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 font-mono text-[10px] text-slate-500">
          {tierMeta && (
            <span className={cn('uppercase tracking-[0.12em]', tierMeta.textClass)}>
              {tierMeta.name}
            </span>
          )}
          <span className="tabular-nums">{entry.move_count} moves</span>
        </div>
      </div>
      <div className="font-mono text-base font-semibold text-white tabular-nums">
        {entry.score.toLocaleString('en-US')}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="p-8 flex flex-col items-center justify-center text-center">
      <Trophy className="h-8 w-8 text-slate-700 mb-3" />
      <div className="font-sans text-sm text-slate-400 max-w-[260px]">
        No scores yet. Be the first to log a result for this puzzle.
      </div>
    </div>
  )
}

function OfflineState() {
  return (
    <div className="p-8 flex flex-col items-center justify-center text-center">
      <div className="mb-3 h-8 w-8 rounded-full border border-rose-300/40 flex items-center justify-center">
        <span className="block h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse-soft" />
      </div>
      <div className="font-sans text-sm text-slate-300 mb-1">
        Leaderboard offline
      </div>
      <div className="font-sans text-xs text-slate-500 max-w-[260px]">
        Couldn't reach the scores server. Your run still saves locally — try
        again in a moment.
      </div>
    </div>
  )
}
