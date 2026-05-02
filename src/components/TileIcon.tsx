import { cn } from '@/lib/utils'

type Props = {
  tier: number
  className?: string
}

// Returns null for tiers 1-2 (text-only); SVG for tiers 3-13.
export function TileIcon({ tier, className }: Props) {
  switch (tier) {
    case 3:
      return <Gene className={className} />
    case 4:
      return <Operon className={className} />
    case 5:
      return <Chromosome className={className} />
    case 6:
      return <Genome className={className} />
    case 7:
      return <Cell className={className} />
    case 8:
      return <Organism className={className} />
    case 9:
      return <Species className={className} />
    case 10:
      return <Population className={className} />
    case 11:
      return <Ecosystem className={className} />
    case 12:
      return <Biome className={className} />
    case 13:
      return <Biosphere className={className} />
    default:
      return null
  }
}

type IconProps = { className?: string }

const baseStroke = 'currentColor'

function Gene({ className }: IconProps) {
  // Stylized double helix segment.
  return (
    <svg
      viewBox="0 0 48 24"
      className={cn('opacity-90', className)}
      fill="none"
      stroke={baseStroke}
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <path d="M2 6 Q 14 22, 24 6 T 46 6" />
      <path d="M2 18 Q 14 2, 24 18 T 46 18" />
      <line x1="8" y1="9" x2="8" y2="15" />
      <line x1="18" y1="11" x2="18" y2="13" opacity="0.7" />
      <line x1="30" y1="9" x2="30" y2="15" />
      <line x1="40" y1="11" x2="40" y2="13" opacity="0.7" />
    </svg>
  )
}

function Operon({ className }: IconProps) {
  // A horizontal connector with several bars descending — like an mRNA transcript.
  return (
    <svg
      viewBox="0 0 48 24"
      className={cn('opacity-90', className)}
      fill="none"
      stroke={baseStroke}
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <line x1="3" y1="6" x2="45" y2="6" />
      <rect x="6" y="10" width="6" height="11" rx="1" fill="currentColor" opacity="0.55" />
      <rect x="16" y="10" width="9" height="11" rx="1" fill="currentColor" opacity="0.85" />
      <rect x="29" y="10" width="5" height="11" rx="1" fill="currentColor" opacity="0.45" />
      <rect x="38" y="10" width="7" height="11" rx="1" fill="currentColor" opacity="0.7" />
    </svg>
  )
}

function Chromosome({ className }: IconProps) {
  // X-shape with rounded ends and a centromere.
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('opacity-90', className)}
      fill="currentColor"
    >
      <path
        d="M6 2 Q 8 2 12 8 L 16 14 L 20 8 Q 24 2 26 2 Q 28 4 26 8 L 22 14 Q 21 16 22 18 L 26 24 Q 28 28 26 30 Q 24 30 20 24 L 16 18 L 12 24 Q 8 30 6 30 Q 4 28 6 24 L 10 18 Q 11 16 10 14 L 6 8 Q 4 4 6 2 Z"
        opacity="0.78"
      />
      <circle cx="16" cy="16" r="2.6" fill="currentColor" />
    </svg>
  )
}

function Genome({ className }: IconProps) {
  // Coiled helix — three nested ovals with cross-marks.
  return (
    <svg
      viewBox="0 0 36 36"
      className={cn('opacity-90', className)}
      fill="none"
      stroke={baseStroke}
      strokeWidth="1.4"
    >
      <ellipse cx="18" cy="18" rx="14" ry="6" />
      <ellipse cx="18" cy="18" rx="14" ry="6" transform="rotate(60 18 18)" />
      <ellipse cx="18" cy="18" rx="14" ry="6" transform="rotate(120 18 18)" />
      <circle cx="18" cy="18" r="1.4" fill="currentColor" />
    </svg>
  )
}

function Cell({ className }: IconProps) {
  // Membrane with internal organelles.
  return (
    <svg
      viewBox="0 0 36 36"
      className={cn('opacity-90', className)}
      fill="none"
      stroke={baseStroke}
      strokeWidth="1.4"
    >
      <circle cx="18" cy="18" r="14" strokeDasharray="2 1.5" />
      <circle cx="18" cy="14" r="4.5" fill="currentColor" opacity="0.7" />
      <circle cx="11" cy="22" r="2" fill="currentColor" opacity="0.55" />
      <circle cx="24" cy="24" r="2.4" fill="currentColor" opacity="0.55" />
      <circle cx="26" cy="13" r="1.4" fill="currentColor" opacity="0.45" />
    </svg>
  )
}

function Organism({ className }: IconProps) {
  // Branching tree — root and limbs.
  return (
    <svg
      viewBox="0 0 36 36"
      className={cn('opacity-90', className)}
      fill="none"
      stroke={baseStroke}
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <line x1="18" y1="32" x2="18" y2="20" />
      <line x1="18" y1="20" x2="10" y2="14" />
      <line x1="18" y1="20" x2="26" y2="14" />
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="10" y1="14" x2="6" y2="8" />
      <line x1="10" y1="14" x2="14" y2="6" />
      <line x1="26" y1="14" x2="22" y2="6" />
      <line x1="26" y1="14" x2="30" y2="8" />
      <circle cx="6" cy="8" r="1.6" fill="currentColor" />
      <circle cx="14" cy="6" r="1.6" fill="currentColor" />
      <circle cx="22" cy="6" r="1.6" fill="currentColor" />
      <circle cx="30" cy="8" r="1.6" fill="currentColor" />
      <circle cx="18" cy="10" r="1.6" fill="currentColor" />
    </svg>
  )
}

function Species({ className }: IconProps) {
  // Phylogenetic fork — root branching into several lineages.
  return (
    <svg
      viewBox="0 0 40 32"
      className={cn('opacity-90', className)}
      fill="none"
      stroke={baseStroke}
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <line x1="20" y1="30" x2="20" y2="22" />
      <line x1="6" y1="22" x2="34" y2="22" />
      <line x1="6" y1="22" x2="6" y2="14" />
      <line x1="14" y1="22" x2="14" y2="10" />
      <line x1="26" y1="22" x2="26" y2="10" />
      <line x1="34" y1="22" x2="34" y2="14" />
      <line x1="14" y1="10" x2="20" y2="10" />
      <line x1="20" y1="10" x2="26" y2="10" />
      <line x1="20" y1="10" x2="20" y2="4" />
      <circle cx="6" cy="14" r="2.2" fill="currentColor" />
      <circle cx="20" cy="4" r="2.2" fill="currentColor" />
      <circle cx="34" cy="14" r="2.2" fill="currentColor" />
    </svg>
  )
}

function Population({ className }: IconProps) {
  // Cluster of dots arranged in a hex-like pattern.
  return (
    <svg
      viewBox="0 0 36 36"
      className={cn('opacity-90', className)}
      fill="currentColor"
    >
      {[
        [10, 10],
        [18, 6],
        [26, 10],
        [6, 18],
        [14, 18],
        [22, 18],
        [30, 18],
        [10, 26],
        [18, 30],
        [26, 26],
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="2.4"
          opacity={0.55 + (i % 4) * 0.1}
        />
      ))}
    </svg>
  )
}

function Ecosystem({ className }: IconProps) {
  // Layered terrain — sky, canopy, water, soil.
  return (
    <svg
      viewBox="0 0 40 32"
      className={cn('opacity-90', className)}
      fill="currentColor"
    >
      {/* Sky band */}
      <rect x="2" y="3" width="36" height="4" rx="1" opacity="0.35" />
      {/* Canopy with arch */}
      <path d="M2 11 L 38 11 L 38 16 L 2 16 Z" opacity="0.55" />
      <circle cx="10" cy="10" r="3" opacity="0.7" />
      <circle cx="22" cy="9" r="4" opacity="0.7" />
      <circle cx="32" cy="10" r="3" opacity="0.7" />
      {/* Water */}
      <rect x="2" y="18" width="36" height="3" rx="1" opacity="0.45" />
      {/* Soil */}
      <rect x="2" y="22" width="36" height="6" rx="1" opacity="0.78" />
    </svg>
  )
}

function Biome({ className }: IconProps) {
  // Hemispheric world section.
  return (
    <svg viewBox="0 0 40 36" className={cn('opacity-90', className)} fill="none">
      <defs>
        <clipPath id="hemi">
          <path d="M2 30 A 18 18 0 0 1 38 30 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#hemi)">
        <rect x="0" y="0" width="40" height="10" fill="currentColor" opacity="0.32" />
        <rect x="0" y="10" width="40" height="9" fill="currentColor" opacity="0.55" />
        <rect x="0" y="19" width="40" height="6" fill="currentColor" opacity="0.78" />
        <rect x="0" y="25" width="40" height="8" fill="currentColor" opacity="0.95" />
      </g>
      <path
        d="M2 30 A 18 18 0 0 1 38 30"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
      />
      <line x1="2" y1="30" x2="38" y2="30" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function Biosphere({ className }: IconProps) {
  // Full planet with rings.
  return (
    <svg viewBox="0 0 40 40" className={cn('opacity-95', className)} fill="none">
      <circle
        cx="20"
        cy="20"
        r="14"
        fill="currentColor"
        opacity="0.85"
      />
      <ellipse
        cx="20"
        cy="20"
        rx="18"
        ry="5"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.6"
      />
      <ellipse
        cx="20"
        cy="20"
        rx="14"
        ry="3"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.5"
        transform="rotate(20 20 20)"
      />
      <circle cx="14" cy="16" r="1.3" fill="white" opacity="0.7" />
      <circle cx="24" cy="22" r="0.9" fill="white" opacity="0.5" />
    </svg>
  )
}
