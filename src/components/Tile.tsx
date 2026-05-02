import { cn } from '@/lib/utils'
import { type Tile as TileT } from '@/lib/game'
import { TIERS } from '@/lib/tiers'
import { TileIcon } from './TileIcon'

type Props = {
  tile: TileT
  cellSize: number
  gap: number
  clickable?: boolean
  onClick?: () => void
}

const PARTICLE_COUNT = 8

// Icon size grows with tier so higher tiers visually dominate.
function iconSizeFor(tier: number): string {
  if (tier <= 4) return 'h-5 w-9'
  if (tier <= 6) return 'h-8 w-11'
  if (tier <= 8) return 'h-10 w-12'
  if (tier <= 10) return 'h-12 w-14'
  if (tier <= 12) return 'h-14 w-16'
  return 'h-[60px] w-16'
}

// Label font size in pixels — grows with tier, scales down for long labels.
function labelFontPx(tier: number, labelLength: number): number {
  if (tier === 1) return 38
  if (tier === 2) return 22
  let base: number
  if (tier <= 4) base = 10
  else if (tier <= 6) base = 12
  else if (tier <= 8) base = 14
  else if (tier <= 10) base = 15
  else if (tier <= 12) base = 17
  else base = 18
  // Long labels still need to fit, but never go below readable.
  let scale = 1
  if (labelLength >= 7) scale = 0.92
  if (labelLength >= 9) scale = 0.82
  if (labelLength >= 11) scale = 0.74
  return Math.max(9, Math.round(base * scale))
}

function borderWidthClass(tier: number): string {
  if (tier <= 5) return 'border'
  if (tier <= 8) return 'border-[1.5px]'
  if (tier <= 11) return 'border-2'
  return 'border-[2.5px]'
}

function letterSpacing(tier: number): string {
  if (tier <= 5) return '0.12em'
  if (tier <= 8) return '0.18em'
  if (tier <= 11) return '0.22em'
  return '0.26em'
}

// 1 pip per "stripe" of three tiers. Visual rank indicator.
function pipsForTier(tier: number): number {
  if (tier <= 2) return 0
  if (tier <= 5) return 1
  if (tier <= 8) return 2
  if (tier <= 11) return 3
  return 4
}

function labelOpacity(tier: number): number {
  if (tier <= 4) return 0.85
  if (tier <= 8) return 1
  return 1
}

export function Tile({ tile, cellSize, gap, clickable = false, onClick }: Props) {
  const meta = TIERS[tile.tier]
  if (!meta) return null

  const x = tile.col * (cellSize + gap)
  const y = tile.row * (cellSize + gap)

  const showIcon = tile.tier >= 3
  const showInnerPattern = tile.tier >= 6
  const showSheen = tile.tier >= 9
  const showHaloRing = tile.tier >= 11
  const showRotatingGlow = tile.tier >= 12
  const ambientPulse = tile.tier >= 11

  const fontPx = labelFontPx(tile.tier, tile.label.length)
  const pipCount = pipsForTier(tile.tier)
  const labelBold = tile.tier >= 9

  return (
    <div
      className={cn(
        'absolute transition-[transform,opacity] ease-out duration-150',
        tile.isAbsorbed ? 'opacity-0' : 'opacity-100',
      )}
      style={{
        width: cellSize,
        height: cellSize,
        transform: `translate(${x}px, ${y}px)`,
        zIndex: tile.isAbsorbed ? 1 : tile.isMerged ? 3 : 2,
      }}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      aria-label={clickable ? `Apply to ${meta.name}` : undefined}
    >
      <div
        className={cn(
          'relative h-full w-full rounded-xl flex flex-col items-center justify-center',
          'backdrop-blur-sm overflow-hidden',
          borderWidthClass(tile.tier),
          meta.bgClass,
          meta.borderClass,
          meta.textClass,
          tile.isNew && 'animate-tile-spawn',
          tile.isMerged && 'animate-tile-merge',
          ambientPulse && 'animate-pulse-soft',
          clickable && 'cursor-pointer hover:scale-105 hover:brightness-125 transition-transform',
        )}
        style={{ boxShadow: meta.glowStyle }}
      >
        {/* Inner pattern overlay — diagonal scan lines for tier 6+ */}
        {showInnerPattern && (
          <div
            className="pointer-events-none absolute inset-0 rounded-xl"
            style={{
              backgroundImage:
                'linear-gradient(135deg, transparent 49%, currentColor 49% 51%, transparent 51%)',
              backgroundSize: '10px 10px',
              opacity: tile.tier <= 8 ? 0.06 : 0.1,
              mixBlendMode: 'overlay',
            }}
          />
        )}

        {/* Rotating conic glow for the top tiers */}
        {showRotatingGlow && (
          <div
            className="pointer-events-none absolute -inset-2 animate-orbit-slow"
            style={{
              background: `conic-gradient(from 0deg, transparent 0%, currentColor 25%, transparent 50%, currentColor 75%, transparent 100%)`,
              opacity: 0.25,
              filter: 'blur(6px)',
            }}
          />
        )}

        {/* Inner halo ring for tier 11+ */}
        {showHaloRing && (
          <div
            className="pointer-events-none absolute inset-1 rounded-lg"
            style={{
              boxShadow: 'inset 0 0 14px rgba(255,255,255,0.18)',
            }}
          />
        )}

        {/* Top-edge sheen for high-tier tiles */}
        {showSheen && (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1/3 rounded-t-xl"
            style={{
              background:
                'linear-gradient(to bottom, rgba(255,255,255,0.22), rgba(255,255,255,0) 80%)',
            }}
          />
        )}

        {/* Corner pip indicator — 1-4 dots based on tier band, top-right */}
        {pipCount > 0 && (
          <div className="pointer-events-none absolute top-1.5 right-1.5 flex gap-[3px] z-10">
            {Array.from({ length: pipCount }).map((_, i) => (
              <span
                key={i}
                className="block rounded-full bg-current"
                style={{
                  width: tile.tier >= 9 ? 4 : 3,
                  height: tile.tier >= 9 ? 4 : 3,
                  opacity: 0.85,
                  boxShadow: tile.tier >= 11 ? '0 0 4px currentColor' : 'none',
                }}
              />
            ))}
          </div>
        )}

        {/* Icon */}
        {showIcon && (
          <div className="relative z-10 flex items-center justify-center pointer-events-none">
            <TileIcon
              tier={tile.tier}
              className={cn(iconSizeFor(tile.tier), 'max-h-[55%]')}
            />
          </div>
        )}

        {/* Label */}
        <span
          className={cn(
            'relative z-10 font-mono leading-none text-center px-1',
            labelBold ? 'font-bold' : 'font-semibold',
          )}
          style={{
            fontSize: `${fontPx}px`,
            letterSpacing: letterSpacing(tile.tier),
            opacity: labelOpacity(tile.tier),
            textShadow:
              tile.tier >= 11
                ? '0 1px 12px rgba(0,0,0,0.6), 0 0 18px rgba(255,255,255,0.3)'
                : '0 1px 8px rgba(0,0,0,0.5)',
            marginTop: showIcon ? '4px' : '0',
          }}
        >
          {tile.label}
        </span>

        {/* Glow ring on merge */}
        {tile.isMerged && (
          <div
            className="pointer-events-none absolute inset-0 rounded-xl animate-merge-ring"
            style={{
              border: '2px solid currentColor',
              opacity: 0,
            }}
          />
        )}

        {/* Particle burst on merge */}
        {tile.isMerged && (
          <div className="pointer-events-none absolute inset-0">
            {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
              const angle = (i / PARTICLE_COUNT) * Math.PI * 2
              const dx = Math.cos(angle)
              const dy = Math.sin(angle)
              return (
                <span
                  key={i}
                  className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full animate-merge-particle"
                  style={{
                    background: 'currentColor',
                    boxShadow: '0 0 6px currentColor',
                    ['--p-dx' as string]: `${dx}`,
                    ['--p-dy' as string]: `${dy}`,
                    animationDelay: `${i * 8}ms`,
                  }}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
