import { useEffect, useState } from 'react'
import { Award, Layers, Lock, X } from 'lucide-react'
import { TIERS } from '@/lib/tiers'
import { type Discoveries } from '@/hooks/useGame'
import {
  ACHIEVEMENTS,
  type Achievement,
  type UnlockedAchievements,
} from '@/lib/achievements'
import { cn } from '@/lib/utils'
import { TileIcon } from './TileIcon'

type Props = {
  open: boolean
  onClose: () => void
  discoveries: Discoveries
  achievements?: UnlockedAchievements
}

type Tab = 'tiers' | 'achievements'

export function DiscoveryCodex({
  open,
  onClose,
  discoveries,
  achievements = {},
}: Props) {
  const [tab, setTab] = useState<Tab>('tiers')
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

  const tiers = TIERS.slice(1)
  const discoveredCount = tiers.filter((t) => discoveries[t.id]).length
  const unlockedCount = ACHIEVEMENTS.filter((a) => achievements[a.id]).length

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
          'border-l border-cyan-300/25 bg-slate-950/98 flex flex-col',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        style={{
          boxShadow: open
            ? '-20px 0 60px -10px rgba(34,211,238,0.25)'
            : 'none',
        }}
        aria-hidden={!open}
      >
        <header className="border-b border-cyan-400/15 px-6 py-5 flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="font-mono text-[9px] uppercase tracking-[0.32em] text-cyan-300/80 mb-1">
              Field Journal
            </div>
            <h2 className="font-sans text-xl font-semibold text-white">
              Discovery Codex
            </h2>
            <div className="mt-3 inline-flex items-center gap-0.5 rounded-md border border-cyan-400/15 bg-slate-950/60 p-0.5">
              <CodexTab
                active={tab === 'tiers'}
                onClick={() => setTab('tiers')}
                icon={<Layers className="h-3 w-3" />}
                label={`Tiers · ${discoveredCount}/${tiers.length}`}
              />
              <CodexTab
                active={tab === 'achievements'}
                onClick={() => setTab('achievements')}
                icon={<Award className="h-3 w-3" />}
                label={`Achievements · ${unlockedCount}/${ACHIEVEMENTS.length}`}
              />
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close codex"
            className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-cyan-200"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {tab === 'tiers' ? (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
            {tiers.map((tier) => {
              const found = discoveries[tier.id]
              return <CodexEntry key={tier.id} tier={tier} discovery={found} />
            })}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-4 grid grid-cols-2 gap-2">
            {ACHIEVEMENTS.map((a) => (
              <AchievementCard
                key={a.id}
                achievement={a}
                unlockedAt={achievements[a.id] ?? null}
              />
            ))}
          </div>
        )}

        <footer className="border-t border-cyan-400/15 px-6 py-3 font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500">
          {tab === 'tiers'
            ? 'Discoveries persist across runs'
            : 'Achievements unlock anytime — keep playing'}
        </footer>
      </aside>
    </>
  )
}

function CodexEntry({
  tier,
  discovery,
}: {
  tier: (typeof TIERS)[number]
  discovery: { moveCount: number; firstReachedAt: number } | undefined
}) {
  const found = !!discovery

  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-colors',
        found
          ? 'border-cyan-400/15 bg-slate-900/50'
          : 'border-slate-800/80 bg-slate-950/40',
      )}
    >
      <div className="flex items-center gap-3">
        {found ? (
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-md border',
              tier.bgClass,
              tier.borderClass,
            )}
            style={{ boxShadow: tier.glowStyle }}
          >
            {tier.id >= 3 ? (
              <TileIcon
                tier={tier.id}
                className={cn('h-6 w-7', tier.textClass)}
              />
            ) : (
              <span
                className={cn(
                  'font-mono font-semibold tracking-wider leading-none',
                  tier.textClass,
                  tier.defaultLabel.length <= 4 ? 'text-xs' : 'text-[9px]',
                )}
              >
                {tier.defaultLabel.length <= 6
                  ? tier.defaultLabel
                  : tier.defaultLabel.slice(0, 5)}
              </span>
            )}
          </div>
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-slate-800 bg-slate-900/60">
            <Lock className="h-4 w-4 text-slate-700" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'font-mono text-[10px] uppercase tracking-[0.18em] tabular-nums',
                found ? 'text-cyan-300/80' : 'text-slate-600',
              )}
            >
              T{String(tier.id).padStart(2, '0')}
            </span>
            <span
              className={cn(
                'font-sans text-sm font-semibold',
                found ? 'text-white' : 'text-slate-600',
              )}
            >
              {found ? tier.name : '— Locked —'}
            </span>
          </div>
          {found ? (
            <p className="mt-1 font-sans text-xs leading-relaxed text-slate-400">
              {tier.description}
            </p>
          ) : (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-700">
              Reach this tier to log a description
            </p>
          )}
        </div>
      </div>

      {found && discovery && (
        <div className="mt-3 flex items-center justify-between gap-3 pl-15">
          <BarcodeSig seed={tier.id * 17 + discovery.moveCount} />
          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-300/70 shrink-0">
            {discovery.moveCount === 0 ? (
              <span className="text-cyan-200">From spawn</span>
            ) : (
              <span>
                <span className="text-slate-500">Move </span>
                <span className="tabular-nums text-cyan-200">
                  {discovery.moveCount}
                </span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function CodexTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] transition-all',
        active
          ? 'bg-cyan-500/15 text-cyan-50 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.4)]'
          : 'text-slate-400 hover:text-cyan-200',
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function AchievementCard({
  achievement,
  unlockedAt,
}: {
  achievement: Achievement
  unlockedAt: number | null
}) {
  const accentMap = {
    cyan: { bg: 'bg-gradient-to-br from-cyan-500/30 to-cyan-700/20', border: 'border-cyan-300/40', text: 'text-cyan-100' },
    emerald: { bg: 'bg-gradient-to-br from-emerald-500/30 to-emerald-700/20', border: 'border-emerald-300/40', text: 'text-emerald-100' },
    fuchsia: { bg: 'bg-gradient-to-br from-fuchsia-500/30 to-fuchsia-700/20', border: 'border-fuchsia-300/40', text: 'text-fuchsia-100' },
    amber: { bg: 'bg-gradient-to-br from-amber-400/35 to-amber-600/22', border: 'border-amber-300/45', text: 'text-amber-100' },
    rose: { bg: 'bg-gradient-to-br from-rose-500/30 to-rose-700/20', border: 'border-rose-300/45', text: 'text-rose-100' },
    violet: { bg: 'bg-gradient-to-br from-violet-500/30 to-violet-700/22', border: 'border-violet-300/45', text: 'text-violet-100' },
  }
  const a = accentMap[achievement.accent]
  const isUnlocked = unlockedAt !== null
  return (
    <div
      className={cn(
        'rounded-lg border p-2.5 flex flex-col gap-1.5 transition-all',
        isUnlocked
          ? `${a.bg} ${a.border}`
          : 'border-slate-800/80 bg-slate-950/40 opacity-60',
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full border text-base',
            isUnlocked ? `${a.border} ${a.text}` : 'border-slate-800 text-slate-700',
          )}
        >
          {isUnlocked ? '★' : <Lock className="h-3 w-3" />}
        </div>
        {isUnlocked && (
          <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-emerald-300">
            unlocked
          </span>
        )}
      </div>
      <div>
        <div
          className={cn(
            'font-sans text-[11px] font-semibold',
            isUnlocked ? a.text : 'text-slate-500',
          )}
        >
          {achievement.name}
        </div>
        <div
          className={cn(
            'font-sans text-[10px] leading-snug mt-0.5',
            isUnlocked ? 'text-slate-300' : 'text-slate-600',
          )}
        >
          {achievement.description}
        </div>
      </div>
    </div>
  )
}

function BarcodeSig({ seed }: { seed: number }) {
  function noise(idx: number): number {
    const x = Math.sin((seed + idx) * 12.9898) * 43758.5453
    return x - Math.floor(x)
  }
  const bars: { width: number; opacity: number }[] = []
  for (let i = 0; i < 28; i++) {
    const r = noise(i)
    const w = r < 0.4 ? 1 : r < 0.75 ? 2 : 3
    bars.push({ width: w, opacity: 0.5 + ((i * 5) % 4) * 0.12 })
  }
  return (
    <div className="flex items-center gap-[2px] h-3 flex-1 overflow-hidden">
      {bars.map((b, i) => (
        <div
          key={i}
          className="h-full bg-cyan-200/80"
          style={{ width: b.width, opacity: b.opacity }}
        />
      ))}
    </div>
  )
}
