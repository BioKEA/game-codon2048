export function Header() {
  return (
    <div className="text-center space-y-2">
      <div className="flex items-center justify-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse-soft" />
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-cyan-300/90">
          Large Data Collider
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse-soft" />
      </div>
      <h1
        className="font-sans text-3xl sm:text-4xl font-semibold tracking-tight text-white"
        style={{
          textShadow:
            '0 0 30px rgba(34,211,238,0.35), 0 0 60px rgba(167,139,250,0.18)',
        }}
      >
        Codon Collider
      </h1>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400/80">
        Biology, decoded in the public interest
      </p>
    </div>
  )
}
