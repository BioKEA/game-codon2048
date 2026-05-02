import React from 'react'

type Props = {
  children: React.ReactNode
}

type State = {
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App error boundary caught:', error, info)
  }

  reload = () => {
    window.location.reload()
  }

  reset = () => {
    this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#06080d] p-6">
        <div
          className="max-w-md rounded-2xl border border-rose-300/30 bg-slate-950/95 p-8 text-center"
          style={{
            boxShadow:
              '0 0 80px -10px rgba(251,113,133,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-rose-300 mb-2">
            ◆ Sequence Error ◆
          </div>
          <h2 className="font-sans text-2xl font-semibold text-white mb-2">
            The collider stalled.
          </h2>
          <p className="font-sans text-sm text-slate-400 mb-5">
            Something went wrong. Reloading usually clears it. Your progress
            (best score, discoveries, leaderboard entries) is safe in local
            storage and on the server.
          </p>
          <pre className="mb-5 max-h-32 overflow-auto rounded-md border border-rose-400/20 bg-slate-900/60 p-3 text-left font-mono text-[10px] text-rose-200/80">
            {this.state.error.message}
          </pre>
          <div className="flex justify-center gap-2">
            <button
              onClick={this.reset}
              className="rounded-md border border-cyan-300/30 bg-slate-900 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-100 transition-colors hover:bg-cyan-500/10"
            >
              Try again
            </button>
            <button
              onClick={this.reload}
              className="rounded-md border border-cyan-300/40 bg-cyan-500/15 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-50 transition-colors hover:bg-cyan-500/25"
            >
              Reload page
            </button>
          </div>
        </div>
      </div>
    )
  }
}
