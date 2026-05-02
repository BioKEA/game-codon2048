import { useEffect, useState } from 'react'
import { TIERS } from '@/lib/tiers'

type Props = {
  highestTier: number
}

// Briefly tints the screen with the new tier's color when highestTier increases.
export function DiscoveryFlash({ highestTier }: Props) {
  const [flashKey, setFlashKey] = useState<{ tier: number; n: number } | null>(null)
  const [previousTier, setPreviousTier] = useState(highestTier)

  useEffect(() => {
    if (highestTier > previousTier && highestTier >= 3) {
      setFlashKey((prev) => ({ tier: highestTier, n: (prev?.n ?? 0) + 1 }))
    }
    setPreviousTier(highestTier)
  }, [highestTier, previousTier])

  if (!flashKey) return null
  const meta = TIERS[flashKey.tier]
  if (!meta) return null

  // Extract a CSS color hint from the tier's glow style.
  // We just use a tier-color tinted radial gradient.
  const tints: Record<number, string> = {
    3: 'rgba(45,212,191,0.35)',
    4: 'rgba(56,189,248,0.4)',
    5: 'rgba(129,140,248,0.45)',
    6: 'rgba(167,139,250,0.5)',
    7: 'rgba(232,121,249,0.55)',
    8: 'rgba(244,114,182,0.55)',
    9: 'rgba(251,113,133,0.55)',
    10: 'rgba(251,146,60,0.6)',
    11: 'rgba(251,191,36,0.65)',
    12: 'rgba(250,204,21,0.7)',
    13: 'rgba(255,255,255,0.7)',
  }
  const tint = tints[flashKey.tier] ?? 'rgba(34,211,238,0.4)'

  return (
    <div
      key={flashKey.n}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 animate-discovery-flash"
      style={{
        background: `radial-gradient(ellipse at center, ${tint} 0%, transparent 65%)`,
      }}
    />
  )
}
