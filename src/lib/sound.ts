type AnyWindow = Window & { webkitAudioContext?: typeof AudioContext }

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
let muted = false

const MUTE_KEY = 'codon-collider:muted-v1'

function loadMutedFromStorage(): boolean {
  // Default to muted on first visit. Players who have explicitly set
  // a preference (either 1 or 0) get their saved choice; anything else
  // (no key, cleared storage, etc.) starts muted.
  try {
    const v = localStorage.getItem(MUTE_KEY)
    if (v === '0') return false
    return true
  } catch {
    return true
  }
}

muted = loadMutedFromStorage()

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor =
      window.AudioContext || (window as AnyWindow).webkitAudioContext
    if (!Ctor) return null
    try {
      ctx = new Ctor()
      masterGain = ctx.createGain()
      masterGain.gain.value = 0.6
      masterGain.connect(ctx.destination)
    } catch {
      return null
    }
  }
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
  return ctx
}

export function setMuted(m: boolean) {
  muted = m
  try {
    localStorage.setItem(MUTE_KEY, m ? '1' : '0')
  } catch {
    // ignore
  }
}

export function getMuted(): boolean {
  return muted
}

function tierFrequency(tier: number): number {
  // Pentatonic-ish ladder: each tier ~1.18x previous (~3 semitones).
  // Tier 1 = 220Hz (A3). Tier 13 = ~1500Hz.
  return 220 * Math.pow(1.18, tier - 1)
}

export function playMove() {
  if (muted) return
  const c = getCtx()
  if (!c || !masterGain) return
  const now = c.currentTime

  // Short, soft noise puff filtered to a hiss
  const dur = 0.05
  const buffer = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    const t = i / data.length
    data[i] = (Math.random() * 2 - 1) * (1 - t)
  }
  const noise = c.createBufferSource()
  noise.buffer = buffer

  const filter = c.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 1200

  const gain = c.createGain()
  gain.gain.setValueAtTime(0.04, now)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(masterGain)
  noise.start(now)
}

export function playMerge(tier: number) {
  if (muted) return
  const c = getCtx()
  if (!c || !masterGain) return
  const now = c.currentTime
  const freq = tierFrequency(tier)

  // Two-osc bell: sine fundamental + triangle fifth
  const osc1 = c.createOscillator()
  osc1.type = 'sine'
  osc1.frequency.setValueAtTime(freq, now)

  const osc2 = c.createOscillator()
  osc2.type = 'triangle'
  osc2.frequency.setValueAtTime(freq * 1.5, now)

  const peak = 0.18
  const dur = 0.32
  const gain = c.createGain()
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(peak, now + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0005, now + dur)

  osc1.connect(gain)
  osc2.connect(gain)
  gain.connect(masterGain)

  osc1.start(now)
  osc2.start(now)
  osc1.stop(now + dur)
  osc2.stop(now + dur)
}

export function playEnzyme() {
  if (muted) return
  const c = getCtx()
  if (!c || !masterGain) return
  const now = c.currentTime

  // Sharp snip — quick descending blip + filtered noise transient
  const osc = c.createOscillator()
  osc.type = 'square'
  osc.frequency.setValueAtTime(1800, now)
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.06)

  const oscGain = c.createGain()
  oscGain.gain.setValueAtTime(0.06, now)
  oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

  osc.connect(oscGain)
  oscGain.connect(masterGain)
  osc.start(now)
  osc.stop(now + 0.09)

  // Tiny noise burst on top
  const buffer = c.createBuffer(1, Math.floor(c.sampleRate * 0.04), c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  }
  const noise = c.createBufferSource()
  noise.buffer = buffer

  const filter = c.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 2400

  const noiseGain = c.createGain()
  noiseGain.gain.value = 0.05

  noise.connect(filter)
  filter.connect(noiseGain)
  noiseGain.connect(masterGain)
  noise.start(now)
}

export function playPolymerase() {
  if (muted) return
  const c = getCtx()
  if (!c || !masterGain) return
  const now = c.currentTime

  // Short ascending arpeggio — like discovery but quicker
  const root = 330
  const intervals = [1, 1.25, 1.5]
  intervals.forEach((mult, i) => {
    const t = now + i * 0.05
    const osc = c.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = root * mult
    const g = c.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.13, t + 0.005)
    g.gain.exponentialRampToValueAtTime(0.0008, t + 0.22)
    osc.connect(g)
    g.connect(masterGain!)
    osc.start(t)
    osc.stop(t + 0.24)
  })
}

export function playCentrifuge() {
  if (muted) return
  const c = getCtx()
  if (!c || !masterGain) return
  const now = c.currentTime

  // Spinning whoosh — sweeping filter on noise
  const buffer = c.createBuffer(1, Math.floor(c.sampleRate * 0.6), c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.7
  }
  const noise = c.createBufferSource()
  noise.buffer = buffer

  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 8
  filter.frequency.setValueAtTime(400, now)
  filter.frequency.exponentialRampToValueAtTime(2400, now + 0.45)
  filter.frequency.exponentialRampToValueAtTime(800, now + 0.6)

  const gain = c.createGain()
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.18, now + 0.04)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(masterGain)
  noise.start(now)
}

export function playDiscovery(tier: number) {
  if (muted) return
  const c = getCtx()
  if (!c || !masterGain) return
  const now = c.currentTime

  // Low boom — sub-frequency thump
  {
    const boom = c.createOscillator()
    boom.type = 'sine'
    boom.frequency.setValueAtTime(110, now)
    boom.frequency.exponentialRampToValueAtTime(48, now + 0.55)

    const boomGain = c.createGain()
    boomGain.gain.setValueAtTime(0, now)
    boomGain.gain.linearRampToValueAtTime(0.32, now + 0.015)
    boomGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.6)

    boom.connect(boomGain)
    boomGain.connect(masterGain)
    boom.start(now)
    boom.stop(now + 0.6)
  }

  // Ascending arpeggio — major triad + octave
  const root = tierFrequency(Math.max(3, tier))
  const intervals = [1, 1.26, 1.5, 2.0]
  intervals.forEach((mult, i) => {
    const t = now + i * 0.09 + 0.05
    const osc = c.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = root * mult

    const g = c.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.13, t + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0005, t + 0.35)

    osc.connect(g)
    g.connect(masterGain!)
    osc.start(t)
    osc.stop(t + 0.36)
  })
}
