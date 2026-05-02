import { Beaker, Calendar, Hash, Hexagon, Infinity as InfinityIcon } from 'lucide-react'
import type { GameMode, GameVariant } from '@/hooks/useGame'
import { dayNumber } from '@/lib/daily'
import { DIFFICULTIES, type Difficulty } from '@/lib/difficulty'
import { cn } from '@/lib/utils'

type Props = {
  mode: GameMode
  variant: GameVariant
  customSeed?: string
  difficulty: Difficulty
  onModeChange: (mode: GameMode) => void
  onVariantChange: (variant: GameVariant) => void
  onDifficultyChange: (d: Difficulty) => void
  onOpenCustomSeed: () => void
  dailyDate: string
}

const DIFFICULTY_ORDER: Difficulty[] = ['casual', 'standard', 'challenge', 'hardcore']

export function ModeTabs({
  mode,
  variant,
  customSeed,
  difficulty,
  onModeChange,
  onVariantChange,
  onDifficultyChange,
  onOpenCustomSeed,
  dailyDate,
}: Props) {
  const day = dayNumber(dailyDate)
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="inline-flex items-center gap-0.5 rounded-md border border-cyan-400/15 bg-slate-950/60 p-0.5">
        <PillButton
          active={variant === 'classic'}
          onClick={() => onVariantChange('classic')}
          icon={<Hexagon className="h-3.5 w-3.5" />}
          label="Classic"
          accent="cyan"
        />
        <PillButton
          active={variant === 'lab'}
          onClick={() => onVariantChange('lab')}
          icon={<Beaker className="h-3.5 w-3.5" />}
          label="Lab"
          accent="fuchsia"
        />
      </div>

      <div className="inline-flex items-center gap-0.5 rounded-md border border-cyan-400/10 bg-slate-950/40 p-0.5">
        <PillButton
          active={mode === 'endless'}
          onClick={() => onModeChange('endless')}
          icon={<InfinityIcon className="h-3 w-3" />}
          label="Endless"
          size="sm"
          accent="cyan"
        />
        <PillButton
          active={mode === 'daily'}
          onClick={() => onModeChange('daily')}
          icon={<Calendar className="h-3 w-3" />}
          label={`Daily · Day ${day}`}
          size="sm"
          accent="cyan"
        />
        <PillButton
          active={mode === 'custom'}
          onClick={() => {
            if (mode === 'custom') {
              onOpenCustomSeed()
            } else if (customSeed) {
              onModeChange('custom')
            } else {
              onOpenCustomSeed()
            }
          }}
          icon={<Hash className="h-3 w-3" />}
          label={mode === 'custom' && customSeed ? `Custom · ${truncate(customSeed, 12)}` : 'Custom'}
          size="sm"
          accent="cyan"
        />
      </div>

      {mode === 'endless' ? (
        <div
          className="inline-flex items-center gap-0.5 rounded-md border border-cyan-400/10 bg-slate-950/40 p-0.5"
          role="radiogroup"
          aria-label="Difficulty"
        >
          {DIFFICULTY_ORDER.map((d) => {
            const meta = DIFFICULTIES[d]
            return (
              <button
                key={d}
                onClick={() => onDifficultyChange(d)}
                role="radio"
                aria-checked={difficulty === d}
                title={meta.description}
                className={cn(
                  'rounded-sm px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-all',
                  difficulty === d
                    ? d === 'hardcore'
                      ? 'bg-rose-500/20 text-rose-50 shadow-[inset_0_0_0_1px_rgba(251,113,133,0.45)]'
                      : d === 'challenge'
                        ? 'bg-amber-500/15 text-amber-50 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.4)]'
                        : 'bg-cyan-500/15 text-cyan-50 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.4)]'
                    : 'text-slate-400 hover:text-cyan-200',
                )}
              >
                {meta.name}
              </button>
            )
          })}
        </div>
      ) : (
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500">
          {mode === 'daily' ? `${dailyDate} · ` : ''}
          {variant === 'lab' ? 'lab seed' : 'classic seed'} · standard difficulty · same for everyone
        </span>
      )}
      {mode === 'custom' && customSeed && (
        <button
          onClick={onOpenCustomSeed}
          className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500 transition-colors hover:text-cyan-300"
          title="Change seed"
        >
          Custom seed · click to edit
        </button>
      )}
    </div>
  )
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1) + '…'
}

function PillButton({
  active,
  onClick,
  icon,
  label,
  size = 'md',
  accent = 'cyan',
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  size?: 'sm' | 'md'
  accent?: 'cyan' | 'fuchsia'
}) {
  const accentMap = {
    cyan: {
      active: 'bg-cyan-500/15 text-cyan-50 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.4)]',
      hover: 'hover:text-cyan-200',
    },
    fuchsia: {
      active:
        'bg-fuchsia-500/15 text-fuchsia-50 shadow-[inset_0_0_0_1px_rgba(232,121,249,0.45)]',
      hover: 'hover:text-fuchsia-200',
    },
  }
  const a = accentMap[accent]
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm font-mono uppercase transition-all',
        size === 'sm'
          ? 'px-3 py-1.5 text-[11px] tracking-[0.18em]'
          : 'px-3.5 py-2 text-[11px] tracking-[0.18em]',
        active ? a.active : `text-slate-400 ${a.hover}`,
      )}
    >
      {icon}
      {label}
    </button>
  )
}
