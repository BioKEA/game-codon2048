import { useEffect } from 'react'
import { RotateCw, Scissors, X, Zap } from 'lucide-react'
import {
  INVENTORY_SIZE,
  POWERUPS,
  SCORE_PER_DROP,
  type Inventory,
  type Powerup,
  type PowerupType,
} from '@/lib/powerups'
import { cn } from '@/lib/utils'

type Props = {
  inventory: Inventory
  pendingDrops: number
  score: number
  nextDropAt: number
  pendingTargetType: PowerupType | null
  pendingTargetSlot: number | null
  onActivate: (slotIdx: number) => void
  onCancelTarget: () => void
}

const ICONS = {
  enzyme: Scissors,
  polymerase: Zap,
  centrifuge: RotateCw,
}

export function PowerupBar({
  inventory,
  pendingDrops,
  score,
  nextDropAt,
  pendingTargetType,
  pendingTargetSlot,
  onActivate,
  onCancelTarget,
}: Props) {
  // Hotkeys 1/2/3 to activate slots (only if not already in target mode)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      if (e.key === 'Escape' && pendingTargetSlot !== null) {
        e.preventDefault()
        onCancelTarget()
        return
      }
      if (e.key === '1' || e.key === '2' || e.key === '3') {
        const slotIdx = Number(e.key) - 1
        if (inventory[slotIdx]) {
          e.preventDefault()
          onActivate(slotIdx)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [inventory, pendingTargetSlot, onActivate, onCancelTarget])

  const progress = Math.max(
    0,
    Math.min(1, (score - (nextDropAt - SCORE_PER_DROP)) / SCORE_PER_DROP),
  )

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-cyan-300/80">
          Lab Toolkit
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
          {pendingDrops > 0 && (
            <span className="text-amber-300">+{pendingDrops} queued</span>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Next drop</span>
            <div className="h-1 w-16 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-amber-300 transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {Array.from({ length: INVENTORY_SIZE }).map((_, idx) => (
          <Slot
            key={idx}
            slotIdx={idx}
            powerup={inventory[idx]}
            isPending={pendingTargetSlot === idx}
            onActivate={() => onActivate(idx)}
            onCancel={onCancelTarget}
          />
        ))}
      </div>

      {pendingTargetType && (
        <div className="flex items-center justify-center gap-2 rounded-md border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 animate-fade-up">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-100">
            Tap a tile to apply{' '}
            <span className="font-semibold">{POWERUPS[pendingTargetType].short}</span>
          </span>
          <button
            onClick={onCancelTarget}
            className="rounded-sm border border-cyan-400/30 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-200 transition-colors hover:bg-cyan-500/20"
          >
            <span className="inline-flex items-center gap-1">
              <X className="h-2.5 w-2.5" />
              Cancel
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

function Slot({
  slotIdx,
  powerup,
  isPending,
  onActivate,
  onCancel,
}: {
  slotIdx: number
  powerup: Powerup | null
  isPending: boolean
  onActivate: () => void
  onCancel: () => void
}) {
  const meta = powerup ? POWERUPS[powerup.type] : null
  const Icon = powerup ? ICONS[powerup.type] : null

  return (
    <button
      onClick={powerup ? (isPending ? onCancel : onActivate) : undefined}
      disabled={!powerup}
      className={cn(
        'group relative flex h-14 w-14 items-center justify-center rounded-xl border transition-all',
        powerup
          ? `${meta!.borderClass} ${meta!.bgClass} hover:scale-105 cursor-pointer`
          : 'border-dashed border-slate-700 bg-slate-950/40 cursor-default',
        isPending && 'ring-2 ring-cyan-300/70 scale-105',
      )}
      style={powerup ? { boxShadow: meta!.glowStyle } : undefined}
      aria-label={powerup ? `Activate ${meta!.name} (slot ${slotIdx + 1})` : `Empty slot ${slotIdx + 1}`}
      title={powerup ? `${meta!.name} — ${meta!.description}` : `Empty (drops every ${SCORE_PER_DROP} score)`}
    >
      {powerup && Icon ? (
        <Icon className={cn('h-5 w-5', meta!.textClass)} />
      ) : (
        <span className="font-mono text-[10px] tabular-nums text-slate-700">
          {slotIdx + 1}
        </span>
      )}
      {powerup && (
        <span className="absolute -top-1 -right-1 rounded-sm bg-slate-950 border border-cyan-400/30 px-1 font-mono text-[8px] tabular-nums text-cyan-200">
          {slotIdx + 1}
        </span>
      )}
    </button>
  )
}
