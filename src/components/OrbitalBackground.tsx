import { useEffect, useState } from 'react'

const COLORS = [
  'rgba(34,211,238,0.7)',  // cyan
  'rgba(167,139,250,0.7)', // violet
  'rgba(52,211,153,0.7)',  // emerald
  'rgba(251,191,36,0.7)',  // amber
  'rgba(244,114,182,0.6)', // pink
]

const DRIFT_PARTICLES = Array.from({ length: 22 }).map((_, i) => {
  const seed = (i + 1) * 9301
  return {
    top: `${(seed * 1.37) % 95 + 2}%`,
    left: `${(seed * 0.71) % 95 + 2}%`,
    color: COLORS[i % COLORS.length],
    delay: ((seed * 0.43) % 14).toFixed(1),
    duration: (12 + (seed % 8)).toFixed(0),
    size: i % 3 === 0 ? 'h-1 w-1' : 'h-[3px] w-[3px]',
  }
})

export function OrbitalBackground() {
  const [streams, setStreams] = useState<{ id: number; top: string; color: string }[]>([])

  // Periodically inject a horizontal data stream from one edge to the other.
  useEffect(() => {
    let nextId = 1
    function spawn() {
      const top = `${15 + Math.random() * 70}%`
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      const id = nextId++
      setStreams((prev) => [...prev, { id, top, color }])
      window.setTimeout(() => {
        setStreams((prev) => prev.filter((s) => s.id !== id))
      }, 6000)
    }
    const interval = window.setInterval(spawn, 7500)
    // Spawn one shortly after mount so the effect is visible.
    const initial = window.setTimeout(spawn, 1800)
    return () => {
      window.clearInterval(interval)
      window.clearTimeout(initial)
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Deep gradient base */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.08),transparent_50%),radial-gradient(ellipse_at_bottom,rgba(167,139,250,0.06),transparent_55%)]" />

      {/* Dot matrix */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(148,184,255,0.5) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />

      {/* Orbital rings — slow rotation, far behind */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit-slow">
        <div
          className="rounded-full border border-cyan-300/10"
          style={{ width: 980, height: 600 }}
        />
      </div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit-reverse">
        <div
          className="rounded-full border border-violet-300/10"
          style={{ width: 1400, height: 820 }}
        />
      </div>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-orbit-slow">
        <div
          className="rounded-full border border-emerald-300/8"
          style={{ width: 1800, height: 1100 }}
        />
      </div>

      {/* Drifting particle field */}
      {DRIFT_PARTICLES.map((p, i) => (
        <span
          key={i}
          className={`absolute rounded-full ${p.size} animate-drift`}
          style={{
            top: p.top,
            left: p.left,
            background: p.color,
            boxShadow: `0 0 6px ${p.color}`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      {/* Lattice nodes — small glowing dots */}
      {[
        { top: '12%', left: '8%', color: 'rgb(34,211,238)' },
        { top: '22%', left: '88%', color: 'rgb(167,139,250)' },
        { top: '78%', left: '12%', color: 'rgb(52,211,153)' },
        { top: '88%', left: '82%', color: 'rgb(251,191,36)' },
        { top: '38%', left: '4%', color: 'rgb(244,114,182)' },
        { top: '62%', left: '94%', color: 'rgb(56,189,248)' },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full animate-pulse-soft"
          style={{
            top: p.top,
            left: p.left,
            background: p.color,
            boxShadow: `0 0 12px 2px ${p.color}`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}

      {/* Data streams — horizontal traversing lines */}
      {streams.map((s) => (
        <div
          key={s.id}
          className="absolute h-px w-32 animate-data-stream"
          style={{
            top: s.top,
            left: 0,
            background: `linear-gradient(to right, transparent, ${s.color} 30%, ${s.color} 70%, transparent)`,
            boxShadow: `0 0 8px ${s.color}`,
          }}
        />
      ))}

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.6)_85%)]" />
    </div>
  )
}
