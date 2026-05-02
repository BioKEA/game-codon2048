import { useEffect, useState } from 'react'
import { ExternalLink, Heart, Link2, X } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  open: boolean
  onClose: (optOut: boolean) => void
}

const SUPPORT_URL = 'https://www.calalive.org/get-involved'

export function SupportNudge({ open, onClose }: Props) {
  const [optOut, setOptOut] = useState(false)

  useEffect(() => {
    if (open) setOptOut(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose(optOut)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open, onClose, optOut])

  function copyLink() {
    try {
      navigator.clipboard.writeText(SUPPORT_URL)
      toast.success('Link copied — share it with someone')
    } catch {
      toast.error('Could not copy link')
    }
  }

  function visit() {
    window.open(SUPPORT_URL, '_blank', 'noopener,noreferrer')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => onClose(optOut)}
      />
      <div
        className="relative w-full max-w-md rounded-2xl border border-emerald-300/30 bg-slate-950/96 p-7 animate-fade-up"
        style={{
          boxShadow:
            '0 0 80px -10px rgba(52,211,153,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
        role="dialog"
        aria-labelledby="support-nudge-title"
      >
        <button
          onClick={() => onClose(optOut)}
          aria-label="Close"
          className="absolute right-3 top-3 rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-emerald-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-3 flex items-center gap-2">
          <Heart className="h-4 w-4 text-emerald-300" fill="currentColor" />
          <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-emerald-300/85">
            A small ask
          </span>
        </div>

        <h2
          id="support-nudge-title"
          className="font-sans text-xl font-semibold text-white mb-2"
        >
          It seems like you're enjoying this game!
        </h2>
        <p className="font-sans text-sm leading-relaxed text-slate-300 mb-4">
          Codon Collider is built around the{' '}
          <span className="font-mono text-emerald-200">Large Data Collider</span>{' '}
          — a real wet-lab in Berkeley cataloging California's biodiversity through
          environmental DNA, in the public interest.
        </p>
        <p className="font-sans text-sm leading-relaxed text-slate-300 mb-5">
          Would you consider supporting biodiversity cataloging efforts in
          California or your hometown? Or just share the link with people who
          might.
        </p>

        <div className="rounded-md border border-emerald-400/20 bg-slate-900/50 px-3 py-2 mb-5 font-mono text-[11px] text-emerald-100 break-all select-all">
          {SUPPORT_URL}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={visit}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-emerald-300/45 bg-emerald-500/15 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-50 transition-colors hover:bg-emerald-500/25"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Get involved
          </button>
          <button
            onClick={copyLink}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-cyan-400/30 bg-slate-900 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-100 transition-colors hover:bg-cyan-500/10"
          >
            <Link2 className="h-3.5 w-3.5" />
            Copy link
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-slate-500 transition-colors hover:text-slate-300">
            <input
              type="checkbox"
              checked={optOut}
              onChange={(e) => setOptOut(e.target.checked)}
              className="h-3 w-3 rounded border-slate-700 bg-slate-900 accent-slate-500"
            />
            <span className="font-mono text-[9px] uppercase tracking-[0.2em]">
              Don't show this again
            </span>
          </label>
          <button
            onClick={() => onClose(optOut)}
            className="rounded px-2 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-slate-400 transition-colors hover:text-slate-200"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
