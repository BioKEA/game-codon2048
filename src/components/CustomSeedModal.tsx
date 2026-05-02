import { useEffect, useState } from 'react'
import { Hash, Link2, Shuffle, X } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (seed: string) => void
  currentSeed?: string
}

const RANDOM_PARTS_A = [
  'HELIX',
  'SPIRAL',
  'TIDAL',
  'KELP',
  'CORAL',
  'GLACIAL',
  'BAYOU',
  'AURORA',
  'CRYO',
  'AMBER',
  'BISON',
  'SAGE',
]
const RANDOM_PARTS_B = [
  'GAUNTLET',
  'CIRCUIT',
  'EMBASSY',
  'DELTA',
  'FORGE',
  'STRATA',
  'WHALE',
  'COMET',
  'EMBER',
  'ARROW',
  'NEXUS',
  'HARBOR',
]

function pickRandomSeed(): string {
  const a = RANDOM_PARTS_A[Math.floor(Math.random() * RANDOM_PARTS_A.length)]
  const b = RANDOM_PARTS_B[Math.floor(Math.random() * RANDOM_PARTS_B.length)]
  const n = Math.floor(Math.random() * 100)
  return `${a}_${b}_${String(n).padStart(2, '0')}`
}

export function CustomSeedModal({ open, onClose, onSubmit, currentSeed }: Props) {
  const [seed, setSeed] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setSeed(currentSeed ?? '')
      setError(null)
    }
  }, [open, currentSeed])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, onClose])

  function submit() {
    const trimmed = seed.trim()
    if (trimmed.length === 0) {
      setError('Type a seed or hit Random')
      return
    }
    if (trimmed.length > 64) {
      setError('Maximum 64 characters')
      return
    }
    onSubmit(trimmed)
    onClose()
  }

  function copyShareUrl() {
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('seed', seed.trim())
      navigator.clipboard.writeText(url.toString())
      toast.success('Share link copied')
    } catch {
      toast.error('Could not copy link')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-2xl border border-cyan-300/30 bg-slate-950/95 p-7 animate-fade-up"
        style={{
          boxShadow:
            '0 0 80px -10px rgba(34,211,238,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-cyan-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-3 flex items-center gap-2">
          <Hash className="h-4 w-4 text-cyan-300" />
          <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-cyan-300/80">
            Custom Seed
          </span>
        </div>
        <h2 className="font-sans text-xl font-semibold text-white mb-2">
          Play any seed
        </h2>
        <p className="font-sans text-sm leading-relaxed text-slate-300 mb-4">
          A seed determines the entire run — same starting tiles, same spawn
          order. Share the seed (or a share link) and any other player gets the
          same puzzle. Both Classic and Lab variants supported.
        </p>

        <div className="space-y-2">
          <div className="flex gap-1.5">
            <input
              value={seed}
              onChange={(e) => {
                setSeed(e.target.value)
                setError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit()
              }}
              maxLength={64}
              placeholder="e.g. HELIX_FORGE_07"
              autoFocus
              className="flex-1 rounded-md border border-cyan-400/30 bg-slate-900/70 px-3 py-2.5 font-mono text-sm text-cyan-50 placeholder:text-slate-600 focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            />
            <button
              onClick={() => {
                setSeed(pickRandomSeed())
                setError(null)
              }}
              title="Random seed"
              className="rounded-md border border-cyan-400/30 bg-slate-900/70 px-3 text-cyan-200 transition-colors hover:bg-cyan-500/10 hover:border-cyan-400/50"
            >
              <Shuffle className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
            <span>{seed.length} / 64</span>
            {error && <span className="text-rose-300">{error}</span>}
          </div>
        </div>

        <div className="mt-4 rounded-md border border-cyan-400/15 bg-slate-900/40 px-3 py-2.5">
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-cyan-300/80 mb-1">
            How seeds work
          </div>
          <ul className="space-y-0.5 font-sans text-xs leading-relaxed text-slate-400">
            <li>· Any text becomes a deterministic puzzle</li>
            <li>· Different seed in Classic vs Lab — same string, two puzzles</li>
            <li>· Each seed has its own leaderboard</li>
          </ul>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            onClick={copyShareUrl}
            disabled={seed.trim().length === 0}
            className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-200 transition-colors hover:bg-cyan-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Link2 className="h-3 w-3" />
            Copy share link
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-cyan-200"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="inline-flex items-center gap-1 rounded border border-cyan-300/40 bg-cyan-500/15 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-50 transition-colors hover:bg-cyan-500/25"
            >
              Play seed
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
