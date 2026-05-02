type Props = {
  className?: string
  seed?: number
}

function widthForIdx(seed: number, idx: number): number {
  // pseudo-random but deterministic
  const x = Math.sin((seed + idx) * 12.9898) * 43758.5453
  const r = x - Math.floor(x)
  if (r < 0.45) return 1
  if (r < 0.78) return 2
  if (r < 0.93) return 3
  return 4
}

export function BarcodeStrip({ className = '', seed = 7 }: Props) {
  const bars: { width: number; gap: number; opacity: number }[] = []
  for (let i = 0; i < 80; i++) {
    bars.push({
      width: widthForIdx(seed, i),
      gap: widthForIdx(seed + 1, i),
      opacity: 0.35 + ((i * 7) % 5) * 0.08,
    })
  }
  return (
    <div className={`flex items-center gap-[2px] h-3 ${className}`} aria-hidden>
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
