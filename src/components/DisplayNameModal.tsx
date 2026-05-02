import { useEffect, useState } from 'react'
import { User, X } from 'lucide-react'
import { getDisplayName, setDisplayName } from '@/lib/leaderboard'

type Props = {
  open: boolean
  onClose: () => void
  onSave: (name: string) => void
  reason?: 'first-time' | 'edit'
}

const SUGGESTIONS = [
  'BASE_PAIR',
  'HELIX',
  'CIPHER',
  'POLY',
  'ENZYME',
  'CRYO',
  'DARWIN',
  'CURIE',
]

export function DisplayNameModal({ open, onClose, onSave, reason = 'first-time' }: Props) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(getDisplayName() ?? '')
      setError(null)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && reason === 'edit') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, reason, onClose])

  function submit() {
    const trimmed = name.trim()
    if (trimmed.length === 0) {
      setError('Pick a name to appear on the leaderboard')
      return
    }
    if (trimmed.length > 24) {
      setError('Maximum 24 characters')
      return
    }
    if (!/^[\p{L}\p{N}_\-\s.]+$/u.test(trimmed)) {
      setError('Letters, numbers, spaces, underscore, dot, dash only')
      return
    }
    const saved = setDisplayName(trimmed)
    onSave(saved)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        onClick={reason === 'edit' ? onClose : undefined}
      />
      <div
        className="relative w-full max-w-md rounded-2xl border border-cyan-300/30 bg-slate-950/95 p-7 animate-fade-up"
        style={{
          boxShadow:
            '0 0 80px -10px rgba(34,211,238,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {reason === 'edit' && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 z-10 rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-cyan-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="mb-3 flex items-center gap-2">
          <User className="h-4 w-4 text-cyan-300" />
          <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-cyan-300/80">
            {reason === 'first-time' ? 'Lab Identification' : 'Edit Display Name'}
          </span>
        </div>
        <h2 className="font-sans text-xl font-semibold text-white mb-2">
          {reason === 'first-time'
            ? 'Pick a name for the leaderboard'
            : 'Update your display name'}
        </h2>
        <p className="font-sans text-sm leading-relaxed text-slate-300 mb-4">
          {reason === 'first-time'
            ? 'This is what other players see next to your daily and custom-seed scores. You can change it anytime in the leaderboard.'
            : 'New name applies to future submissions. Past scores keep the name they were submitted under.'}
        </p>

        <div className="space-y-2">
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit()
            }}
            maxLength={24}
            placeholder="e.g. CIPHER, helix_42, or your name"
            autoFocus
            className="w-full rounded-md border border-cyan-400/30 bg-slate-900/70 px-3 py-2.5 font-mono text-sm text-cyan-50 placeholder:text-slate-600 focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
          />
          <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
            <span>{name.length} / 24</span>
            {error && <span className="text-rose-300">{error}</span>}
          </div>
        </div>

        <div className="mt-4">
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500 mb-1.5">
            Suggestions
          </div>
          <div className="flex flex-wrap gap-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setName(s)
                  setError(null)
                }}
                className="rounded-sm border border-cyan-400/15 bg-slate-900 px-2 py-1 font-mono text-[10px] text-cyan-200 transition-colors hover:bg-cyan-500/10 hover:border-cyan-400/30"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          {reason === 'edit' && (
            <button
              onClick={onClose}
              className="rounded px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-cyan-200"
            >
              Cancel
            </button>
          )}
          <button
            onClick={submit}
            className="inline-flex items-center gap-1 rounded border border-cyan-300/40 bg-cyan-500/15 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-50 transition-colors hover:bg-cyan-500/25"
          >
            {reason === 'first-time' ? 'Enter Lab' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
