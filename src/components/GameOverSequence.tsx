import { useEffect, useState } from 'react'

type Props = {
  active: boolean
  onComplete: () => void
}

const LETTERS = 'GAME  OVER'.split('')

// Big animated GAME OVER text overlay that plays before the
// real dialog. Letters drop in sequentially.
export function GameOverSequence({ active, onComplete }: Props) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!active) {
      setShow(false)
      return
    }
    setShow(true)
    const t = window.setTimeout(() => {
      setShow(false)
      onComplete()
    }, 1700)
    return () => window.clearTimeout(t)
  }, [active, onComplete])

  if (!show) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      <div className="relative flex gap-1.5 sm:gap-3">
        {LETTERS.map((ch, i) => {
          if (ch === ' ') {
            return <span key={i} className="w-3 sm:w-6" />
          }
          return (
            <span
              key={i}
              className="opacity-0 animate-gameover-letter"
              style={{
                animationDelay: `${i * 80}ms`,
                fontFamily: '"VT323", monospace',
                fontSize: '88px',
                lineHeight: 1,
                color: '#fef3c7',
                textShadow:
                  '0 0 20px rgba(251,191,36,0.85), 0 0 40px rgba(251,113,133,0.6), 0 4px 0 rgba(0,0,0,0.8)',
                letterSpacing: '0.04em',
                fontWeight: 700,
              }}
            >
              {ch}
            </span>
          )
        })}
      </div>
    </div>
  )
}
