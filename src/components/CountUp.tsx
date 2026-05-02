import { useEffect, useRef, useState } from 'react'

type Props = {
  value: number
  duration?: number
  className?: string
}

export function CountUp({ value, duration = 320, className }: Props) {
  const [display, setDisplay] = useState(value)
  const previousRef = useRef(value)
  const rafRef = useRef<number | null>(null)

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
      // ease-out cubic
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
  }, [value, duration])

  return (
    <span className={className} aria-live="polite">
      {display.toLocaleString('en-US')}
    </span>
  )
}
