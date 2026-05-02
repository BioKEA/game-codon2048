import { useEffect, useRef, useState } from 'react'
import { Tile } from './Tile'
import type { Direction, Tile as TileT } from '@/lib/game'
import { GRID_SIZE } from '@/lib/game'
import type { ScoreEvent } from '@/hooks/useGame'
import { ScorePopups } from './ScorePopups'
import { ComboCallout } from './ComboCallout'
import { ReadyOverlay } from './ReadyOverlay'
import { cn } from '@/lib/utils'

type Props = {
  tiles: TileT[]
  onMove: (direction: Direction) => void
  targetMode?: boolean
  onTileClick?: (tileId: string) => void
  scoreEvents?: ScoreEvent[]
  combo?: number
  showReady?: boolean
}

const GAP = 10

export function Board({
  tiles,
  onMove,
  targetMode = false,
  onTileClick,
  scoreEvents = [],
  combo = 0,
  showReady = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [boardWidth, setBoardWidth] = useState(420)

  useEffect(() => {
    function measure() {
      const el = containerRef.current
      if (!el) return
      const parentWidth = el.parentElement?.clientWidth ?? 420
      const width = Math.min(parentWidth, 480)
      setBoardWidth(width)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const cellSize = (boardWidth - GAP * (GRID_SIZE - 1) - 24) / GRID_SIZE
  const innerSize = cellSize * GRID_SIZE + GAP * (GRID_SIZE - 1)
  const padding = 12

  const touchStart = useRef<{ x: number; y: number } | null>(null)

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }
  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current
    if (!start) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    const absX = Math.abs(dx)
    const absY = Math.abs(dy)
    const threshold = 24
    if (Math.max(absX, absY) < threshold) return
    if (absX > absY) {
      onMove(dx > 0 ? 'right' : 'left')
    } else {
      onMove(dy > 0 ? 'down' : 'up')
    }
    touchStart.current = null
  }

  // Screen shake — when a high-tier merge happens, shake the chamber.
  // Detected from the highest tier among current isMerged tiles.
  const [shakeKey, setShakeKey] = useState(0)
  const [shakeIntensity, setShakeIntensity] = useState<'none' | 'light' | 'heavy'>('none')

  useEffect(() => {
    let highestMerged = 0
    for (const t of tiles) {
      if (t.isMerged && !t.isAbsorbed && t.tier > highestMerged) {
        highestMerged = t.tier
      }
    }
    if (highestMerged >= 11) {
      setShakeIntensity('heavy')
      setShakeKey((k) => k + 1)
    } else if (highestMerged >= 8) {
      setShakeIntensity('light')
      setShakeKey((k) => k + 1)
    }
  }, [tiles])

  return (
    <div
      ref={containerRef}
      className="relative select-none touch-none mx-auto"
      style={{ width: innerSize + padding * 2, height: innerSize + padding * 2 }}
      onTouchStart={targetMode ? undefined : onTouchStart}
      onTouchEnd={targetMode ? undefined : onTouchEnd}
    >
      <ComboCallout combo={combo} />

      <div
        key={shakeKey}
        className={cn(
          'absolute inset-0',
          shakeIntensity === 'heavy' && 'animate-screen-shake-heavy',
          shakeIntensity === 'light' && 'animate-screen-shake-light',
        )}
      >
        {/* Outer chamber frame */}
        <div
          className={cn(
            'absolute inset-0 rounded-2xl border bg-gradient-to-br from-slate-900/80 via-slate-950/90 to-black/90 transition-all duration-200',
            targetMode ? 'border-cyan-300/60' : 'border-cyan-400/15',
          )}
          style={{
            boxShadow: targetMode
              ? 'inset 0 0 100px rgba(34,211,238,0.16), 0 0 80px -10px rgba(34,211,238,0.55), 0 0 0 1px rgba(34,211,238,0.4)'
              : 'inset 0 0 80px rgba(34,211,238,0.06), 0 0 60px -20px rgba(34,211,238,0.25), 0 0 0 1px rgba(34,211,238,0.08)',
          }}
        />

        {/* Corner brackets — instrument-panel feel */}
        {[
          'top-2 left-2 border-l border-t',
          'top-2 right-2 border-r border-t',
          'bottom-2 left-2 border-l border-b',
          'bottom-2 right-2 border-r border-b',
        ].map((cls, i) => (
          <div
            key={i}
            className={`absolute h-3 w-3 border-cyan-300/60 ${cls}`}
          />
        ))}

        {/* Cell grid background */}
        <div
          className="absolute"
          style={{
            left: padding,
            top: padding,
            width: innerSize,
            height: innerSize,
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const r = Math.floor(i / GRID_SIZE)
            const c = i % GRID_SIZE
            return (
              <div
                key={i}
                className="absolute rounded-xl bg-cyan-50/[0.02] border border-cyan-100/[0.05]"
                style={{
                  width: cellSize,
                  height: cellSize,
                  transform: `translate(${c * (cellSize + GAP)}px, ${r * (cellSize + GAP)}px)`,
                }}
              />
            )
          })}

          {/* Tiles */}
          {tiles.map((tile) => (
            <Tile
              key={tile.id}
              tile={tile}
              cellSize={cellSize}
              gap={GAP}
              clickable={targetMode && !tile.isAbsorbed}
              onClick={
                targetMode && onTileClick && !tile.isAbsorbed
                  ? () => onTileClick(tile.id)
                  : undefined
              }
            />
          ))}
        </div>

        {/* Floating score popups */}
        <ScorePopups
          events={scoreEvents}
          cellSize={cellSize}
          gap={GAP}
          padding={padding}
        />

        <ReadyOverlay visible={showReady} />
      </div>
    </div>
  )
}
