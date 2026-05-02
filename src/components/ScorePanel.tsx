import { useEffect, useRef, useState } from 'react'
import { TIERS } from '@/lib/tiers'
import { CountUp } from './CountUp'

type Props = {
  score: number
  best: number
  highestTier: number
  streak?: number
  showStreak?: boolean
}

const PIXEL_FONT = '"VT323", monospace'

function padScore(n: number, digits = 6): string {
  return Math.max(0, Math.floor(n)).toString().padStart(digits, '0')
}

function StatTile({
  label,
  value,
  numericValue,
  accent = 'cyan',
  pixel = false,
}: {
  label: string
  value?: string
  numericValue?: number
  accent?: 'cyan' | 'emerald' | 'amber' | 'rose'
  pixel?: boolean
}) {
  const accentMap = {
    cyan: { border: 'border-cyan-400/30', text: 'text-cyan-300', glow: 'rgba(34,211,238,0.15)', neon: 'rgba(34,211,238,0.55)' },
    emerald: { border: 'border-emerald-400/30', text: 'text-emerald-300', glow: 'rgba(52,211,153,0.15)', neon: 'rgba(52,211,153,0.55)' },
    amber: { border: 'border-amber-300/35', text: 'text-amber-200', glow: 'rgba(251,191,36,0.18)', neon: 'rgba(251,191,36,0.6)' },
    rose: { border: 'border-rose-400/35', text: 'text-rose-300', glow: 'rgba(251,113,133,0.18)', neon: 'rgba(251,113,133,0.55)' },
  }
  const a = accentMap[accent]
  return (
    <div
      className={`relative rounded-md border ${a.border} bg-slate-950/60 px-5 py-2.5 min-w-[112px]`}
      style={{ boxShadow: `inset 0 0 18px ${a.glow}` }}
    >
      <div className={`text-[10px] font-mono uppercase tracking-[0.22em] ${a.text} opacity-80`}>
        {label}
      </div>
      {pixel && numericValue !== undefined ? (
        <PixelScore value={numericValue} neon={a.neon} />
      ) : (
        <div className="font-mono text-lg font-semibold text-white tabular-nums leading-tight">
          {numericValue !== undefined ? <CountUp value={numericValue} /> : value}
        </div>
      )}
    </div>
  )
}

function PixelScore({ value, neon }: { value: number; neon: string }) {
  return (
    <div
      className="leading-none text-white tabular-nums"
      style={{
        fontFamily: PIXEL_FONT,
        fontSize: '26px',
        letterSpacing: '0.06em',
        textShadow: `0 0 10px ${neon}, 0 1px 2px rgba(0,0,0,0.6)`,
      }}
    >
      <PixelCountUp value={value} />
    </div>
  )
}

function PixelCountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(value)
  const previousRef = useRef(value)
  const rafRef = useRef<number | null>(null)
  const duration = 320

  useEffect(() => {
    const start = previousRef.current
    const end = value
    if (start === end) {
      setDisplay(end)
      return
    }
    const t0 = performance.now()
    function tick(now: number) {
      const elapsed = now - t0
      const t = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const current = Math.round(start + (end - start) * eased)
      setDisplay(current)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        previousRef.current = end
      }
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value])

  return <>{padScore(display)}</>
}

export function ScorePanel({ score, best, highestTier, streak = 0, showStreak = false }: Props) {
  const highestName = highestTier > 0 ? TIERS[highestTier].name : '—'
  return (
    <div
      className="flex flex-wrap items-stretch justify-center gap-2"
      role="status"
      aria-live="polite"
      aria-atomic="false"
    >
      <StatTile label="Score" numericValue={score} accent="cyan" pixel />
      <StatTile label="Best" numericValue={best} accent="emerald" pixel />
      <StatTile label="Highest" value={highestName} accent="amber" />
      {showStreak && (
        <StatTile
          label="Streak"
          value={streak > 0 ? `${streak} 🔥` : '—'}
          accent="rose"
        />
      )}
    </div>
  )
}
