import { useEffect } from 'react'
import { Beaker, RotateCw, Scissors, X, Zap } from 'lucide-react'
import { POWERUPS, SCORE_PER_DROP } from '@/lib/powerups'

type Props = {
  open: boolean
  onClose: () => void
}

const ICONS = {
  enzyme: Scissors,
  polymerase: Zap,
  centrifuge: RotateCw,
}

export function LabBriefing({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-2xl border border-fuchsia-300/30 bg-slate-950/95 animate-fade-up overflow-hidden"
        style={{
          boxShadow:
            '0 0 80px -10px rgba(232,121,249,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close briefing"
          className="absolute right-3 top-3 z-10 rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-fuchsia-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-7 pt-7 pb-5">
          <div className="mb-3 flex items-center gap-2">
            <Beaker className="h-4 w-4 text-fuchsia-300" />
            <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-fuchsia-300/80">
              Lab Variant Briefing
            </span>
          </div>
          <h2 className="font-sans text-2xl font-semibold text-white mb-2">
            You have a toolkit now
          </h2>
          <p className="font-sans text-sm leading-relaxed text-slate-300 mb-5">
            Lab variant adds a three-slot inventory. Every{' '}
            <span className="font-mono text-cyan-200">{SCORE_PER_DROP} score</span>,
            a powerup drops in. Spend them at critical moments to escape jams or
            boost your run.
          </p>

          <div className="space-y-2.5">
            {(['enzyme', 'polymerase', 'centrifuge'] as const).map((type) => {
              const meta = POWERUPS[type]
              const Icon = ICONS[type]
              return (
                <div
                  key={type}
                  className={`flex gap-3 rounded-md border ${meta.borderClass} ${meta.bgClass} p-3`}
                  style={{ boxShadow: meta.glowStyle }}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border ${meta.borderClass} bg-slate-950/40`}
                  >
                    <Icon className={`h-5 w-5 ${meta.textClass}`} />
                  </div>
                  <div>
                    <div className={`font-sans text-sm font-semibold ${meta.textClass}`}>
                      {meta.name}
                    </div>
                    <div className="font-sans text-xs text-slate-300/85 leading-relaxed mt-0.5">
                      {meta.description}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-5 rounded-md border border-cyan-400/20 bg-slate-900/40 p-3">
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-cyan-300/80 mb-2">
              How to use
            </div>
            <ul className="space-y-1 font-sans text-xs leading-relaxed text-slate-300">
              <li>
                <span className="text-cyan-200">Click a slot</span> (or press{' '}
                <kbd className="font-mono text-[10px] text-cyan-100">1</kbd>{' '}
                <kbd className="font-mono text-[10px] text-cyan-100">2</kbd>{' '}
                <kbd className="font-mono text-[10px] text-cyan-100">3</kbd>)
              </li>
              <li>
                The board glows cyan — <span className="text-cyan-200">tap any tile</span> to apply
              </li>
              <li>
                Centrifuge has no target — it acts immediately
              </li>
              <li>
                Each powerup costs a move slot — a fresh nucleotide spawns afterwards
              </li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-fuchsia-400/15 bg-slate-900/40 px-5 py-3">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1 rounded border border-fuchsia-300/40 bg-fuchsia-500/15 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-fuchsia-50 transition-colors hover:bg-fuchsia-500/25"
          >
            Start Lab Run
          </button>
        </div>
      </div>
    </div>
  )
}
