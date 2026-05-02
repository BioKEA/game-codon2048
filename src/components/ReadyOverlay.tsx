type Props = {
  visible: boolean
}

// Pulses across the board until the player makes their first move.
export function ReadyOverlay({ visible }: Props) {
  if (!visible) return null
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <div className="animate-ready-pulse rounded-md border border-cyan-300/60 bg-slate-950/70 px-5 py-2 backdrop-blur-sm shadow-[0_0_30px_-4px_rgba(34,211,238,0.6)]">
        <div
          className="text-cyan-50 font-bold text-[34px] leading-none"
          style={{
            fontFamily: '"VT323", monospace',
            letterSpacing: '0.18em',
            textShadow: '0 0 16px rgba(34,211,238,0.8)',
          }}
        >
          READY?
        </div>
        <div
          className="mt-1 text-center text-cyan-300/80 text-[10px] uppercase tracking-[0.3em]"
          style={{ fontFamily: '"IBM Plex Mono", monospace' }}
        >
          Tap any arrow
        </div>
      </div>
    </div>
  )
}
