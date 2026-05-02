import { useEffect, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, ChevronLeft, ChevronRight, Hand, X } from 'lucide-react'
import { TIERS } from '@/lib/tiers'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onClose: () => void
}

const TOTAL_STEPS = 6
const PRACTICE_STEP = 3

export function Tutorial({ open, onClose }: Props) {
  const [step, setStep] = useState(0)
  const [practiceCompleted, setPracticeCompleted] = useState(false)

  useEffect(() => {
    if (open) {
      setStep(0)
      setPracticeCompleted(false)
    }
  }, [open])

  const blocked = step === PRACTICE_STEP && !practiceCompleted

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (blocked) return
        if (step === TOTAL_STEPS - 1) onClose()
        else setStep((s) => s + 1)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, step, blocked, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-2xl border border-cyan-300/30 bg-slate-950/95 animate-fade-up overflow-hidden"
        style={{
          boxShadow:
            '0 0 80px -10px rgba(34,211,238,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close tutorial"
          className="absolute right-3 top-3 z-10 rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-cyan-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-7 pt-7 pb-2">
          <div className="mb-4 flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-cyan-300/80">
              Briefing · {String(step + 1).padStart(2, '0')} / {String(TOTAL_STEPS).padStart(2, '0')}
            </span>
            <div className="flex flex-1 gap-1">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-[2px] flex-1 rounded-full transition-colors',
                    i <= step ? 'bg-cyan-400' : 'bg-slate-800',
                  )}
                />
              ))}
            </div>
          </div>

          <div className="min-h-[280px]">
            {step === 0 && <StepMission />}
            {step === 1 && <StepControls />}
            {step === 2 && <StepMerging />}
            {step === 3 && (
              <StepPractice
                completed={practiceCompleted}
                onComplete={() => setPracticeCompleted(true)}
              />
            )}
            {step === 4 && <StepLadder />}
            {step === 5 && <StepStrategy />}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-cyan-400/15 bg-slate-900/40 px-5 py-3">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-1 rounded px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-200 transition-colors hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back
          </button>
          {step < TOTAL_STEPS - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={blocked}
              title={blocked ? 'Complete the merge to continue' : ''}
              className="inline-flex items-center gap-1 rounded border border-cyan-300/40 bg-cyan-500/15 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-50 transition-colors hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-cyan-500/15"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1 rounded border border-amber-300/40 bg-amber-500/15 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-50 transition-colors hover:bg-amber-500/25"
            >
              Begin Sequencing
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function StepHeader({ title, kicker }: { title: string; kicker?: string }) {
  return (
    <div className="mb-4">
      {kicker && (
        <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-amber-300/80 mb-1">
          {kicker}
        </div>
      )}
      <h2 className="font-sans text-xl font-semibold text-white">{title}</h2>
    </div>
  )
}

function StepMission() {
  return (
    <div className="animate-fade-up">
      <StepHeader kicker="The Mission" title="Build life from base pairs" />
      <p className="font-sans text-sm leading-relaxed text-slate-300">
        You're at the controls of the{' '}
        <span className="font-mono text-cyan-300">Large Data Collider</span> — a
        Berkeley wet-lab where field samples become genomes and ecosystems.
      </p>
      <p className="mt-3 font-sans text-sm leading-relaxed text-slate-300">
        Collide matching DNA fragments to build them up through{' '}
        <span className="text-cyan-200">13 tiers of biological organization</span>.
        The goal: assemble a complete{' '}
        <span className="font-semibold text-amber-300">Ecosystem</span>. Push past
        it to discover Biomes and the Biosphere.
      </p>

      <div className="mt-5 rounded-md border border-cyan-400/20 bg-slate-900/50 p-3">
        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-300/80 mb-2">
          Synthesis Path
        </div>
        <div className="font-mono text-[10px] text-slate-300 leading-relaxed">
          A · T · G · C →{' '}
          <span className="text-emerald-300">Codon</span> →{' '}
          <span className="text-teal-300">Gene</span> →{' '}
          <span className="text-violet-300">Genome</span> →{' '}
          <span className="text-fuchsia-300">Cell</span> → ··· →{' '}
          <span className="text-amber-300 font-semibold">Ecosystem</span>
        </div>
      </div>
    </div>
  )
}

function KeyCap({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-8 min-w-[32px] items-center justify-center rounded-md border border-cyan-400/30 bg-slate-900/80 px-2 font-mono text-[11px] font-medium text-cyan-100 shadow-[inset_0_-2px_0_rgba(34,211,238,0.18)]">
      {children}
    </kbd>
  )
}

function StepControls() {
  return (
    <div className="animate-fade-up">
      <StepHeader kicker="Controls" title="One direction, all tiles" />
      <p className="font-sans text-sm leading-relaxed text-slate-300">
        Each move slides{' '}
        <span className="text-cyan-200">every tile on the board</span> in the
        direction you choose. Tiles travel until they hit a wall or another tile.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div className="rounded-md border border-cyan-400/20 bg-slate-900/50 p-3">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-300/80 mb-3">
            Keyboard
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <KeyCap>
              <ArrowUp className="h-3.5 w-3.5" />
            </KeyCap>
            <div className="flex gap-1.5">
              <KeyCap>
                <ArrowLeft className="h-3.5 w-3.5" />
              </KeyCap>
              <KeyCap>
                <ArrowDown className="h-3.5 w-3.5" />
              </KeyCap>
              <KeyCap>
                <ArrowRight className="h-3.5 w-3.5" />
              </KeyCap>
            </div>
            <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
              or W A S D
            </div>
          </div>
        </div>

        <div className="rounded-md border border-cyan-400/20 bg-slate-900/50 p-3">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-300/80 mb-3">
            Touch
          </div>
          <div className="flex flex-col items-center gap-2 pt-2">
            <Hand className="h-7 w-7 text-cyan-200" />
            <div className="font-sans text-xs text-slate-300 text-center">
              Swipe in any direction
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
        A new nucleotide spawns after every move you make.
      </p>
    </div>
  )
}

function MergeDemo() {
  return (
    <div className="relative h-24 overflow-hidden rounded-md border border-cyan-400/15 bg-slate-950/80">
      {/* Two starting tiles that slide and merge in a loop */}
      <style>{`
        @keyframes merge-demo-left {
          0%, 8% { transform: translate(0, -50%); opacity: 1; }
          40%, 100% { transform: translate(56px, -50%); opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes merge-demo-right {
          0%, 8% { transform: translate(112px, -50%); opacity: 1; }
          40%, 100% { transform: translate(56px, -50%); opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes merge-demo-result {
          0%, 45% { transform: translate(56px, -50%) scale(0); opacity: 0; }
          55% { transform: translate(56px, -50%) scale(1.15); opacity: 1; }
          70%, 100% { transform: translate(56px, -50%) scale(1); opacity: 1; }
        }
      `}</style>

      <div className="absolute left-1/2 top-1/2 h-12 w-44 -translate-x-1/2 -translate-y-1/2">
        {/* Left A tile */}
        <div
          className="absolute top-1/2 h-12 w-12 rounded-lg border border-cyan-300/40 bg-gradient-to-br from-cyan-400/40 via-cyan-500/30 to-cyan-700/20 flex items-center justify-center"
          style={{
            animation: 'merge-demo-left 2.4s ease-in-out infinite',
            boxShadow: '0 0 20px -2px rgba(34,211,238,0.5)',
          }}
        >
          <span className="font-mono text-xl font-semibold text-cyan-50">A</span>
        </div>
        {/* Right A tile */}
        <div
          className="absolute top-1/2 h-12 w-12 rounded-lg border border-cyan-300/40 bg-gradient-to-br from-cyan-400/40 via-cyan-500/30 to-cyan-700/20 flex items-center justify-center"
          style={{
            animation: 'merge-demo-right 2.4s ease-in-out infinite',
            boxShadow: '0 0 20px -2px rgba(34,211,238,0.5)',
          }}
        >
          <span className="font-mono text-xl font-semibold text-cyan-50">A</span>
        </div>
        {/* Result codon tile */}
        <div
          className="absolute top-1/2 h-12 w-12 rounded-lg border border-emerald-300/50 bg-gradient-to-br from-emerald-400/45 via-emerald-500/35 to-emerald-700/25 flex items-center justify-center"
          style={{
            animation: 'merge-demo-result 2.4s ease-in-out infinite',
            boxShadow: '0 0 24px -2px rgba(52,211,153,0.6)',
          }}
        >
          <span className="font-mono text-sm font-semibold text-emerald-50">AAA</span>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute left-3 top-3 font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-300/70">
        Same tier collides
      </div>
      <div className="absolute right-3 bottom-3 font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-300/70">
        → next tier
      </div>
    </div>
  )
}

function StepMerging() {
  return (
    <div className="animate-fade-up">
      <StepHeader kicker="Mechanics" title="Same tier + same tier = next tier" />
      <p className="font-sans text-sm leading-relaxed text-slate-300">
        When two tiles of the{' '}
        <span className="text-cyan-200">same tier</span> collide, they fuse into
        the next tier up. Two nucleotides → a Codon. Two Codons → a Gene. And so
        on, all the way up the ladder.
      </p>

      <div className="mt-4">
        <MergeDemo />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
        <div className="rounded-sm border border-slate-800 bg-slate-900/40 px-2.5 py-2 leading-relaxed">
          <span className="text-cyan-300">·</span> Three tiles of the same tier in
          a row only merge once per move
        </div>
        <div className="rounded-sm border border-slate-800 bg-slate-900/40 px-2.5 py-2 leading-relaxed">
          <span className="text-cyan-300">·</span> Different letters at tier 1
          still merge — they're all nucleotides
        </div>
      </div>
    </div>
  )
}

function StepPractice({
  completed,
  onComplete,
}: {
  completed: boolean
  onComplete: () => void
}) {
  type Phase = 'idle' | 'sliding' | 'done'
  const [phase, setPhase] = useState<Phase>(completed ? 'done' : 'idle')

  useEffect(() => {
    if (completed && phase === 'idle') setPhase('done')
  }, [completed, phase])

  function trigger() {
    if (phase !== 'idle') return
    setPhase('sliding')
    window.setTimeout(() => {
      setPhase('done')
      onComplete()
    }, 400)
  }

  useEffect(() => {
    if (phase !== 'idle') return
    function onKey(e: KeyboardEvent) {
      const valid = [
        'ArrowRight',
        'ArrowLeft',
        'ArrowUp',
        'ArrowDown',
        'w',
        'W',
        'a',
        'A',
        's',
        'S',
        'd',
        'D',
      ]
      if (!valid.includes(e.key)) return
      e.preventDefault()
      e.stopPropagation()
      trigger()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [phase])

  return (
    <div className="animate-fade-up">
      <StepHeader kicker="Try it" title="Run your first collision" />
      <p className="font-sans text-sm leading-relaxed text-slate-300">
        Two A nucleotides are loaded. Press{' '}
        <span className="font-mono text-cyan-200">→</span> (or any arrow key) to
        slide them together and watch them fuse into a Codon.
      </p>

      <PracticeBoard phase={phase} onClick={trigger} />

      <div className="mt-4 flex h-7 items-center justify-center font-mono text-[11px] uppercase tracking-[0.2em]">
        {phase === 'idle' && (
          <span className="text-cyan-300/80 animate-pulse-soft">
            ▸ Press an arrow key
          </span>
        )}
        {phase === 'sliding' && (
          <span className="text-emerald-300">Colliding…</span>
        )}
        {phase === 'done' && (
          <span className="inline-flex items-center gap-1.5 text-emerald-300">
            <Check className="h-3.5 w-3.5" />
            Codon assembled. Continue to the ladder.
          </span>
        )}
      </div>
    </div>
  )
}

function PracticeBoard({
  phase,
  onClick,
}: {
  phase: 'idle' | 'sliding' | 'done'
  onClick: () => void
}) {
  const cellSize = 56
  const gap = 8
  const totalWidth = cellSize * 4 + gap * 3

  // Idle: A at col 1, A at col 2. Sliding/done: both move toward col 3.
  const leftCol = phase === 'idle' ? 1 : 3
  const rightCol = phase === 'idle' ? 2 : 3
  const leftOpacity = phase === 'done' ? 0 : 1
  const rightOpacity = phase === 'done' ? 0 : phase === 'sliding' ? 1 : 1
  const codonOpacity = phase === 'done' ? 1 : 0
  const codonScale = phase === 'done' ? 1 : 0.3

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={phase !== 'idle'}
      className="mt-5 mx-auto flex justify-center w-full disabled:cursor-default"
      aria-label="Trigger merge"
    >
      <div
        className="relative rounded-xl border border-cyan-400/15 bg-slate-950/70 p-3"
        style={{
          width: totalWidth + 24,
          height: cellSize + 24,
          boxShadow:
            'inset 0 0 40px rgba(34,211,238,0.05), 0 0 30px -8px rgba(34,211,238,0.15)',
        }}
      >
        <div
          className="relative"
          style={{ width: totalWidth, height: cellSize }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute rounded-md bg-cyan-50/[0.025] border border-cyan-100/[0.06]"
              style={{
                width: cellSize,
                height: cellSize,
                transform: `translate(${i * (cellSize + gap)}px, 0)`,
              }}
            />
          ))}

          {/* Left A tile */}
          <div
            className="absolute transition-[transform,opacity] duration-300 ease-out"
            style={{
              width: cellSize,
              height: cellSize,
              transform: `translate(${leftCol * (cellSize + gap)}px, 0)`,
              opacity: leftOpacity,
              zIndex: 2,
            }}
          >
            <NucleotideTile letter="A" />
          </div>

          {/* Right A tile */}
          <div
            className="absolute transition-[transform,opacity] duration-300 ease-out"
            style={{
              width: cellSize,
              height: cellSize,
              transform: `translate(${rightCol * (cellSize + gap)}px, 0)`,
              opacity: rightOpacity,
              zIndex: 2,
            }}
          >
            <NucleotideTile letter="A" />
          </div>

          {/* Codon result */}
          <div
            className="absolute transition-[transform,opacity] duration-300 ease-out"
            style={{
              width: cellSize,
              height: cellSize,
              transform: `translate(${3 * (cellSize + gap)}px, 0) scale(${codonOpacity ? 1 : codonScale})`,
              opacity: codonOpacity,
              zIndex: 3,
            }}
          >
            <CodonTile />
          </div>
        </div>
      </div>
    </button>
  )
}

function NucleotideTile({ letter }: { letter: string }) {
  return (
    <div
      className="h-full w-full rounded-lg border border-cyan-300/40 bg-gradient-to-br from-cyan-400/40 via-cyan-500/30 to-cyan-700/20 flex items-center justify-center"
      style={{ boxShadow: '0 0 20px -2px rgba(34,211,238,0.5)' }}
    >
      <span
        className="font-mono text-2xl font-semibold text-cyan-50"
        style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}
      >
        {letter}
      </span>
    </div>
  )
}

function CodonTile() {
  return (
    <div
      className="h-full w-full rounded-lg border border-emerald-300/45 bg-gradient-to-br from-emerald-400/45 via-emerald-500/35 to-emerald-700/25 flex items-center justify-center animate-tile-merge"
      style={{ boxShadow: '0 0 26px -2px rgba(52,211,153,0.6)' }}
    >
      <span
        className="font-mono text-base font-semibold text-emerald-50"
        style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}
      >
        AAA
      </span>
    </div>
  )
}

function StepLadder() {
  const visibleTiers = TIERS.slice(1)
  return (
    <div className="animate-fade-up">
      <StepHeader kicker="Progression" title="13 tiers to climb" />
      <p className="font-sans text-sm leading-relaxed text-slate-300">
        Each tier is a leap in biological complexity. The goal is{' '}
        <span className="font-semibold text-amber-300">Ecosystem</span> at tier 11
        — equivalent to reaching 2048. Bold players push for Biome and Biosphere.
      </p>

      <div className="mt-4 space-y-1">
        {visibleTiers.map((tier) => {
          const isGoal = tier.id === 11
          return (
            <div
              key={tier.id}
              className={cn(
                'flex items-center gap-3 rounded-md border px-3 py-1.5',
                tier.bgClass,
                tier.borderClass,
                isGoal && 'ring-1 ring-amber-300/40',
              )}
            >
              <span
                className={cn(
                  'font-mono text-[10px] tabular-nums w-7 opacity-60',
                  tier.textClass,
                )}
              >
                T{String(tier.id).padStart(2, '0')}
              </span>
              <span className={cn('font-mono text-[11px] uppercase tracking-[0.16em] flex-1', tier.textClass)}>
                {tier.name}
              </span>
              <span className={cn('font-mono text-[10px] tabular-nums opacity-70', tier.textClass)}>
                {tier.scoreValue.toLocaleString('en-US')}
              </span>
              {isGoal && (
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-amber-200">
                  Goal
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StepStrategy() {
  const tips = [
    {
      title: 'Anchor a corner',
      body: 'Pick one corner and keep your highest-tier tile there. Never let it move.',
    },
    {
      title: 'Build a descending chain',
      body: 'Snake your tiles along an edge — biggest in the corner, decreasing toward the open side.',
    },
    {
      title: 'Avoid the opposite direction',
      body: 'If your anchor is bottom-left, almost never press up or right. That\'s how anchors slip.',
    },
    {
      title: 'Undo aggressively',
      body: 'A bad move can scatter the board. You have a 10-move undo buffer — use it.',
    },
  ]
  return (
    <div className="animate-fade-up">
      <StepHeader kicker="Lab Protocol" title="Strategy" />
      <p className="font-sans text-sm leading-relaxed text-slate-300">
        Random moves stall around tier 5 or 6. Disciplined moves reach the
        Ecosystem. Four habits make the difference.
      </p>

      <div className="mt-4 space-y-2">
        {tips.map((tip, i) => (
          <div
            key={tip.title}
            className="flex gap-3 rounded-md border border-cyan-400/15 bg-slate-900/50 p-3"
          >
            <span className="font-mono text-xs text-cyan-300 tabular-nums">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <div className="font-sans text-sm font-semibold text-white">{tip.title}</div>
              <div className="font-sans text-xs text-slate-400 leading-relaxed mt-0.5">
                {tip.body}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
