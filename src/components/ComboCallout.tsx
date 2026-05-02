import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  combo: number
}

const LABELS = ['', '', 'NICE', 'GREAT', 'EPIC', 'PERFECT']

// Whenever combo increments to >= 2, render a brief pop-in callout above the board.
export function ComboCallout({ combo }: Props) {
  const [activeCombo, setActiveCombo] = useState<number | null>(null)
  const [popKey, setPopKey] = useState(0)

  useEffect(() => {
    if (combo >= 2) {
      setActiveCombo(combo)
      setPopKey((k) => k + 1)
      const t = window.setTimeout(() => {
        // Let the animation run; clear afterwards.
        setActiveCombo(null)
      }, 1100)
      return () => window.clearTimeout(t)
    }
  }, [combo])

  if (activeCombo === null) return null

  const tier = Math.min(activeCombo, LABELS.length - 1)
  const label = LABELS[tier]
  const accent =
    activeCombo >= 5
      ? 'text-amber-200'
      : activeCombo >= 4
        ? 'text-rose-200'
        : activeCombo >= 3
          ? 'text-fuchsia-200'
          : 'text-cyan-200'

  return (
    <div
      key={popKey}
      className="pointer-events-none absolute -top-3 left-1/2 z-40 animate-combo-pop"
      style={{ transform: 'translate(-50%, 0)' }}
    >
      <div
        className={cn(
          'rounded-md border bg-slate-950/85 px-3 py-1.5 backdrop-blur-sm',
          accent,
          activeCombo >= 4
            ? 'border-amber-300/60 shadow-[0_0_30px_-2px_rgba(251,191,36,0.6)]'
            : activeCombo >= 3
              ? 'border-fuchsia-300/55 shadow-[0_0_24px_-2px_rgba(232,121,249,0.55)]'
              : 'border-cyan-300/45 shadow-[0_0_20px_-2px_rgba(34,211,238,0.5)]',
        )}
      >
        <div
          className="flex items-baseline gap-2 leading-none"
          style={{ fontFamily: '"VT323", monospace' }}
        >
          <span
            className="text-[26px] font-bold"
            style={{ textShadow: '0 0 10px currentColor' }}
          >
            ×{Math.min(activeCombo, 5)}
          </span>
          <span
            className="text-[12px] uppercase tracking-[0.32em] opacity-90"
            style={{ fontFamily: '"IBM Plex Mono", monospace' }}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  )
}
