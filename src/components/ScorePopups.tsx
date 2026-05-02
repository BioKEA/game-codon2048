import { TIERS } from '@/lib/tiers'
import { GRID_SIZE } from '@/lib/game'
import type { ScoreEvent } from '@/hooks/useGame'
import { cn } from '@/lib/utils'

type Props = {
  events: ScoreEvent[]
  cellSize: number
  gap: number
  padding: number
}

export function ScorePopups({ events, cellSize, gap, padding }: Props) {
  if (events.length === 0) return null
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: padding,
        top: padding,
        width: cellSize * GRID_SIZE + gap * (GRID_SIZE - 1),
        height: cellSize * GRID_SIZE + gap * (GRID_SIZE - 1),
      }}
    >
      {events.map((e) => {
        const meta = TIERS[e.tier]
        const cx = e.col * (cellSize + gap) + cellSize / 2
        const cy = e.row * (cellSize + gap) + cellSize / 2
        const big = e.tier >= 8 || e.comboMultiplier >= 3
        const fontSize = big ? Math.min(40, cellSize * 0.45) : Math.min(30, cellSize * 0.35)
        return (
          <div
            key={e.id}
            className="absolute animate-score-pop"
            style={{
              left: cx,
              top: cy,
              transform: 'translate(-50%, -50%)',
              willChange: 'transform, opacity',
              zIndex: 30,
            }}
          >
            <span
              className={cn(
                'font-bold whitespace-nowrap',
                meta?.textClass ?? 'text-cyan-100',
              )}
              style={{
                fontFamily: '"VT323", monospace',
                fontSize: `${fontSize}px`,
                lineHeight: 1,
                letterSpacing: '0.02em',
                textShadow:
                  '0 0 12px currentColor, 0 1px 8px rgba(0,0,0,0.7)',
              }}
            >
              +{e.amount.toLocaleString('en-US')}
            </span>
          </div>
        )
      })}
    </div>
  )
}
