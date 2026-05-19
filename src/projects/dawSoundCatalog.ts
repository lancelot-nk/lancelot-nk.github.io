// dawSoundCatalog.ts — Unique synthesis catalog for Alpha DAW
// Every preset × every pad → a genuinely distinct synthesis origin.
// Uses 8-9 architecturally different signal chains per sound category.

const _SR = 44100

function _off(dur: number, ch = 1): OfflineAudioContext {
  return new OfflineAudioContext(ch, Math.max(1, Math.ceil(dur * _SR)), _SR)
}

function _noise(ctx: OfflineAudioContext, dur: number): AudioBufferSourceNode {
  const len = Math.ceil(dur * _SR)
  const buf = ctx.createBuffer(1, len, _SR)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buf
  return src
}

function _waveshape(ctx: OfflineAudioContext, amt: number): WaveShaperNode {
  const ws = ctx.createWaveShaper()
  const n = 256
  const c = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1
    c[i] = (x * (Math.PI + amt)) / (Math.PI + amt * Math.abs(x))
  }
  ws.curve = c
  return ws
}

function _env(g: GainNode, at: number, peak: number, dt: number, sus: number, rt: number, now = 0) {
  g.gain.setValueAtTime(0.001, now)
  g.gain.linearRampToValueAtTime(peak, now + at)
  g.gain.linearRampToValueAtTime(sus, now + at + dt)
  g.gain.linearRampToValueAtTime(0.001, now + at + dt + rt)
}

const PADS_PER_PRESET: Record<string, number> = {
  kick: 2, snare: 2, drum: 2, bass: 2, hihat: 2, fill: 2, percussion: 2, vocal: 2,
  long: 3, medium: 3, short: 3, chord: 3, instrument: 4
}

// ─── KICK ──────────────────────────────────────────────────────────────────
async function _kick(idx: number): Promise<AudioBuffer> {
  const a = idx % 8
  const t = Math.floor(idx / 8) % 7

  if (a === 0) {
    // Pure 808 sine sweep — deep sub, no click
    const base = 28 + t * 3
    const dur = 0.55 + t * 0.04
    const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sine'
    osc.frequency.setValueAtTime(base * (5 + t), 0)
    osc.frequency.exponentialRampToValueAtTime(base, 0.06 + t * 0.005)
    osc.frequency.exponentialRampToValueAtTime(base * 0.5, dur - 0.02)
    const g = o.createGain()
    g.gain.setValueAtTime(1.0, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }

  if (a === 1) {
    // 909 punch — click transient + mid-bass body
    const clickFreq = 1200 + t * 450
    const bodyFreq = 55 + t * 8
    const dur = 0.38 + t * 0.03
    const o = _off(dur)
    const cg = o.createGain()
    cg.gain.setValueAtTime(0.5 + t * 0.05, 0); cg.gain.exponentialRampToValueAtTime(0.001, 0.006)
    const cosc = o.createOscillator(); cosc.type = 'square'; cosc.frequency.value = clickFreq
    cosc.connect(cg); cg.connect(o.destination); cosc.start(0); cosc.stop(0.01)
    const bg = o.createGain()
    bg.gain.setValueAtTime(0.9, 0); bg.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    const bosc = o.createOscillator(); bosc.type = 'sine'
    bosc.frequency.setValueAtTime(bodyFreq * 3, 0); bosc.frequency.exponentialRampToValueAtTime(bodyFreq, 0.05)
    bosc.connect(bg); bg.connect(o.destination); bosc.start(0); bosc.stop(dur)
    return o.startRendering()
  }

  if (a === 2) {
    // FM kick — frequency modulation creates metallic attack color
    const carrier = 35 + t * 5
    const dur = 0.45 + t * 0.04
    const o = _off(dur)
    const mod = o.createOscillator(); mod.type = 'sine'; mod.frequency.value = carrier * (2 + t * 0.5)
    const mGain = o.createGain()
    mGain.gain.setValueAtTime(200 + t * 60, 0); mGain.gain.exponentialRampToValueAtTime(0.1, 0.08)
    const car = o.createOscillator(); car.type = 'sine'
    car.frequency.setValueAtTime(carrier * 4, 0); car.frequency.exponentialRampToValueAtTime(carrier, 0.07)
    mod.connect(mGain); mGain.connect(car.frequency)
    const g = o.createGain()
    g.gain.setValueAtTime(1.0, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    car.connect(g); g.connect(o.destination)
    mod.start(0); mod.stop(dur); car.start(0); car.stop(dur)
    return o.startRendering()
  }

  if (a === 3) {
    // Distorted kick — waveshaper saturation
    const base = 38 + t * 4
    const dur = 0.42 + t * 0.03
    const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sine'
    osc.frequency.setValueAtTime(base * 5, 0); osc.frequency.exponentialRampToValueAtTime(base, 0.06)
    const preGain = o.createGain(); preGain.gain.value = 3.0
    const ws = _waveshape(o, 20 + t * 12)
    const g = o.createGain()
    g.gain.setValueAtTime(0.7, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    osc.connect(preGain); preGain.connect(ws); ws.connect(g); g.connect(o.destination)
    osc.start(0); osc.stop(dur)
    return o.startRendering()
  }

  if (a === 4) {
    // Triangle body kick — warmer, less sub
    const base = 42 + t * 6
    const dur = 0.35 + t * 0.035
    const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'triangle'
    osc.frequency.setValueAtTime(base * 4, 0); osc.frequency.linearRampToValueAtTime(base, 0.05)
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300 + t * 40
    const g = o.createGain()
    g.gain.setValueAtTime(0.95, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    osc.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }

  if (a === 5) {
    // Sub + noise burst — electronic layered
    const base = 30 + t * 4
    const dur = 0.5 + t * 0.04
    const o = _off(dur)
    const sub = o.createOscillator(); sub.type = 'sine'
    sub.frequency.setValueAtTime(base * 3.5, 0); sub.frequency.exponentialRampToValueAtTime(base, 0.07)
    const sg = o.createGain()
    sg.gain.setValueAtTime(0.9, 0); sg.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    sub.connect(sg); sg.connect(o.destination); sub.start(0); sub.stop(dur)
    const ns = _noise(o, 0.05)
    const bp = o.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 800 + t * 200; bp.Q.value = 2
    const ng = o.createGain()
    ng.gain.setValueAtTime(0.4 + t * 0.04, 0); ng.gain.exponentialRampToValueAtTime(0.001, 0.04)
    ns.connect(bp); bp.connect(ng); ng.connect(o.destination); ns.start(0); ns.stop(0.06)
    return o.startRendering()
  }

  if (a === 6) {
    // Resonant membrane — 3 inharmonic partials
    const f0 = 50 + t * 7
    const dur = 0.4 + t * 0.04
    const o = _off(dur)
    const master = o.createGain(); master.connect(o.destination)
    master.gain.setValueAtTime(0.9, 0); master.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    ;[1.0, 1.59, 2.14].forEach((ratio, pi) => {
      const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = f0 * ratio
      const pg = o.createGain(); pg.gain.value = pi === 0 ? 0.7 : pi === 1 ? 0.3 : 0.15
      osc.connect(pg); pg.connect(master); osc.start(0); osc.stop(dur)
    })
    return o.startRendering()
  }

  // arch 7: ring-mod click — two sines multiplied for metallic transient
  const f1 = 40 + t * 5
  const f2 = 60 + t * 9
  const dur7 = 0.38 + t * 0.03
  const o7 = _off(dur7)
  const osc1 = o7.createOscillator(); osc1.type = 'sine'
  osc1.frequency.setValueAtTime(f1 * 4, 0); osc1.frequency.exponentialRampToValueAtTime(f1, 0.08)
  const osc2 = o7.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = f2
  const ringGain = o7.createGain(); ringGain.gain.value = 0
  osc2.connect(ringGain.gain)
  const preGain7 = o7.createGain(); preGain7.gain.value = 0.5
  osc1.connect(preGain7); preGain7.connect(ringGain)
  const g7 = o7.createGain()
  g7.gain.setValueAtTime(0.85, 0); g7.gain.exponentialRampToValueAtTime(0.001, dur7 - 0.01)
  ringGain.connect(g7); g7.connect(o7.destination)
  const sub7 = o7.createOscillator(); sub7.type = 'sine'
  sub7.frequency.setValueAtTime(f1 * 3, 0); sub7.frequency.exponentialRampToValueAtTime(f1 * 0.7, 0.06)
  const sg7 = o7.createGain()
  sg7.gain.setValueAtTime(0.5, 0); sg7.gain.exponentialRampToValueAtTime(0.001, dur7 * 0.7)
  sub7.connect(sg7); sg7.connect(o7.destination)
  osc1.start(0); osc1.stop(dur7); osc2.start(0); osc2.stop(dur7); sub7.start(0); sub7.stop(dur7)
  return o7.startRendering()
}

// ─── SNARE ─────────────────────────────────────────────────────────────────
async function _snare(idx: number): Promise<AudioBuffer> {
  const a = idx % 8
  const t = Math.floor(idx / 8) % 7

  if (a === 0) {
    // Tight clap — short noise burst, HP 2500 Hz
    const dur = 0.12 + t * 0.012
    const o = _off(dur)
    const ns = _noise(o, dur)
    const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2500 + t * 200
    const g = o.createGain(); g.gain.setValueAtTime(0.9, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.005)
    ns.connect(hp); hp.connect(g); g.connect(o.destination); ns.start(0); ns.stop(dur)
    return o.startRendering()
  }

  if (a === 1) {
    // Classic snare — noise + 180Hz body tone
    const bodyHz = 160 + t * 15
    const dur = 0.22 + t * 0.015
    const o = _off(dur)
    const ns = _noise(o, dur)
    const bp = o.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 4000 + t * 300; bp.Q.value = 0.5
    const ng = o.createGain(); ng.gain.setValueAtTime(0.7, 0); ng.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    ns.connect(bp); bp.connect(ng); ng.connect(o.destination); ns.start(0); ns.stop(dur)
    const osc = o.createOscillator(); osc.type = 'triangle'; osc.frequency.value = bodyHz
    const tg = o.createGain(); tg.gain.setValueAtTime(0.5, 0); tg.gain.exponentialRampToValueAtTime(0.001, 0.08)
    osc.connect(tg); tg.connect(o.destination); osc.start(0); osc.stop(0.1)
    return o.startRendering()
  }

  if (a === 2) {
    // Rimshot — high-Q bandpass on noise
    const rimHz = 700 + t * 150
    const dur = 0.18 + t * 0.012
    const o = _off(dur)
    const ns = _noise(o, dur)
    const bp = o.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = rimHz; bp.Q.value = 8 + t
    const g = o.createGain(); g.gain.setValueAtTime(1.0, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    ns.connect(bp); bp.connect(g); g.connect(o.destination); ns.start(0); ns.stop(dur)
    return o.startRendering()
  }

  if (a === 3) {
    // Ghost snare — very light tap
    const dur = 0.1 + t * 0.008
    const o = _off(dur)
    const ns = _noise(o, dur)
    const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1800 + t * 250
    const g = o.createGain(); g.gain.setValueAtTime(0.22 + t * 0.02, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.005)
    ns.connect(hp); hp.connect(g); g.connect(o.destination); ns.start(0); ns.stop(dur)
    return o.startRendering()
  }

  if (a === 4) {
    // Brush sweep — lowpass, slow decay
    const dur = 0.4 + t * 0.04
    const o = _off(dur)
    const ns = _noise(o, dur)
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5000 + t * 400
    const g = o.createGain(); g.gain.setValueAtTime(0.55, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.02)
    ns.connect(lp); lp.connect(g); g.connect(o.destination); ns.start(0); ns.stop(dur)
    return o.startRendering()
  }

  if (a === 5) {
    // Electronic snare — noise through distortion
    const dur = 0.2 + t * 0.015
    const o = _off(dur)
    const ns = _noise(o, dur)
    const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 500 + t * 80
    const ws = _waveshape(o, 10 + t * 5)
    const g = o.createGain(); g.gain.setValueAtTime(0.8, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    ns.connect(hp); hp.connect(ws); ws.connect(g); g.connect(o.destination); ns.start(0); ns.stop(dur)
    return o.startRendering()
  }

  if (a === 6) {
    // FM snare — modulated tone + noise layer
    const carrier = 200 + t * 30
    const dur = 0.25 + t * 0.02
    const o = _off(dur)
    const mod = o.createOscillator(); mod.type = 'sine'; mod.frequency.value = carrier * (2 + t * 0.3)
    const mGain = o.createGain()
    mGain.gain.setValueAtTime(300 + t * 50, 0); mGain.gain.exponentialRampToValueAtTime(0.1, 0.05)
    const car = o.createOscillator(); car.type = 'sine'; car.frequency.value = carrier
    mod.connect(mGain); mGain.connect(car.frequency)
    const ng = o.createGain(); ng.gain.setValueAtTime(0.7, 0); ng.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    car.connect(ng); ng.connect(o.destination)
    const ns = _noise(o, 0.1)
    const nhp = o.createBiquadFilter(); nhp.type = 'highpass'; nhp.frequency.value = 3000
    const npg = o.createGain(); npg.gain.setValueAtTime(0.4, 0); npg.gain.exponentialRampToValueAtTime(0.001, 0.08)
    ns.connect(nhp); nhp.connect(npg); npg.connect(o.destination)
    mod.start(0); mod.stop(dur); car.start(0); car.stop(dur); ns.start(0); ns.stop(0.12)
    return o.startRendering()
  }

  // arch 7: multi-partial snare body + noise
  const f0s = 200 + t * 25
  const dur7s = 0.3 + t * 0.02
  const o7s = _off(dur7s)
  ;[1, 1.78, 2.47].forEach((ratio, pi) => {
    const osc = o7s.createOscillator(); osc.type = pi === 0 ? 'sine' : 'triangle'
    osc.frequency.value = f0s * ratio
    const pg = o7s.createGain(); pg.gain.setValueAtTime(0.3 / (pi + 1), 0); pg.gain.exponentialRampToValueAtTime(0.001, dur7s * 0.6 / (pi + 1))
    osc.connect(pg); pg.connect(o7s.destination); osc.start(0); osc.stop(dur7s)
  })
  const ns7s = _noise(o7s, dur7s)
  const hp7s = o7s.createBiquadFilter(); hp7s.type = 'highpass'; hp7s.frequency.value = 3500 + t * 300
  const ng7s = o7s.createGain(); ng7s.gain.setValueAtTime(0.5, 0); ng7s.gain.exponentialRampToValueAtTime(0.001, dur7s - 0.01)
  ns7s.connect(hp7s); hp7s.connect(ng7s); ng7s.connect(o7s.destination); ns7s.start(0); ns7s.stop(dur7s)
  return o7s.startRendering()
}

// ─── HIHAT ─────────────────────────────────────────────────────────────────
async function _hihat(idx: number): Promise<AudioBuffer> {
  const a = idx % 8
  const t = Math.floor(idx / 8) % 7

  const allFreqs = [
    [280,380,560,800,1120,1580],
    [320,400,630,890,1260,1780],
    [200,330,470,730,1010,1590],
    [400,600,850,1200,1700,2400],
    [250,360,520,740,1060,1500],
    [500,720,1020,1450,2060,2920],
    [180,300,440,650,950,1400],
    [600,900,1280,1820,2580,3660],
  ]
  const durMap: number[] = [0.07, 0.48, 0.09, 0.32, 0.62, 0.38, 0.08, 0.11]
  const dur = durMap[a] + t * 0.005
  const o = _off(dur)
  const freqs = allFreqs[a]
  freqs.forEach(f => {
    const osc = o.createOscillator(); osc.type = 'square'
    osc.frequency.value = f * (1 + t * 0.015)
    const hpf = o.createBiquadFilter(); hpf.type = 'highpass'; hpf.frequency.value = 6000 + t * 200
    const g = o.createGain(); g.gain.setValueAtTime(0.15, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.005)
    osc.connect(hpf); hpf.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
  })
  return o.startRendering()
}

// ─── DRUM ──────────────────────────────────────────────────────────────────
async function _drum(idx: number): Promise<AudioBuffer> {
  const a = idx % 8
  const t = Math.floor(idx / 8) % 7

  if (a === 0) {
    // Floor tom — low sine
    const f0 = 60 + t * 6; const dur = 0.5 + t * 0.05
    const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sine'
    osc.frequency.setValueAtTime(f0 * 3, 0); osc.frequency.exponentialRampToValueAtTime(f0, 0.06)
    const g = o.createGain(); g.gain.setValueAtTime(0.9, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (a === 1) {
    // Mid tom — sine + noise burst
    const f0 = 120 + t * 10; const dur = 0.35 + t * 0.03
    const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sine'
    osc.frequency.setValueAtTime(f0 * 2.5, 0); osc.frequency.exponentialRampToValueAtTime(f0, 0.05)
    const g = o.createGain(); g.gain.setValueAtTime(0.85, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    const ns = _noise(o, 0.05)
    const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2000
    const ng = o.createGain(); ng.gain.setValueAtTime(0.3, 0); ng.gain.exponentialRampToValueAtTime(0.001, 0.04)
    ns.connect(hp); hp.connect(ng); ng.connect(o.destination); ns.start(0); ns.stop(0.06)
    return o.startRendering()
  }
  if (a === 2) {
    // High tom
    const f0 = 200 + t * 15; const dur = 0.25 + t * 0.02
    const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sine'
    osc.frequency.setValueAtTime(f0 * 2, 0); osc.frequency.exponentialRampToValueAtTime(f0, 0.04)
    const g = o.createGain(); g.gain.setValueAtTime(0.8, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (a === 3) {
    // Bongo high — short, bright
    const f0 = 350 + t * 30; const dur = 0.18 + t * 0.015
    const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sine'
    osc.frequency.setValueAtTime(f0 * 1.5, 0); osc.frequency.exponentialRampToValueAtTime(f0, 0.025)
    const g = o.createGain(); g.gain.setValueAtTime(0.75, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.005)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (a === 4) {
    // Conga — warm mid, 2 partials
    const f0 = 180 + t * 12; const dur = 0.4 + t * 0.04
    const o = _off(dur)
    const master = o.createGain(); master.connect(o.destination)
    master.gain.setValueAtTime(0.85, 0); master.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    ;[1.0, 1.52].forEach((r, pi) => {
      const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = f0 * r
      const pg = o.createGain(); pg.gain.value = pi === 0 ? 0.7 : 0.3
      osc.connect(pg); pg.connect(master); osc.start(0); osc.stop(dur)
    })
    return o.startRendering()
  }
  if (a === 5) {
    // Snare-tom hybrid — triangle + noise
    const f0 = 100 + t * 8; const dur = 0.3 + t * 0.025
    const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'triangle'
    osc.frequency.setValueAtTime(f0 * 2, 0); osc.frequency.exponentialRampToValueAtTime(f0, 0.05)
    const g = o.createGain(); g.gain.setValueAtTime(0.6, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    const ns = _noise(o, dur)
    const bp = o.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1200; bp.Q.value = 1
    const ng = o.createGain(); ng.gain.setValueAtTime(0.4, 0); ng.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    ns.connect(bp); bp.connect(ng); ng.connect(o.destination); ns.start(0); ns.stop(dur)
    return o.startRendering()
  }
  if (a === 6) {
    // Deep boom — very low, long decay
    const f0 = 40 + t * 4; const dur = 0.7 + t * 0.07
    const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sine'
    osc.frequency.setValueAtTime(f0 * 4, 0); osc.frequency.exponentialRampToValueAtTime(f0, 0.1)
    const g = o.createGain(); g.gain.setValueAtTime(0.9, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  // arch 7: tabla-like — 4 harmonics
  const f0t = 160 + t * 14; const durt = 0.28 + t * 0.025
  const ot = _off(durt)
  const mastt = ot.createGain(); mastt.connect(ot.destination)
  mastt.gain.setValueAtTime(0.9, 0); mastt.gain.exponentialRampToValueAtTime(0.001, durt - 0.01)
  ;[1, 2, 3, 4].forEach((r, pi) => {
    const osc = ot.createOscillator(); osc.type = 'sine'; osc.frequency.value = f0t * r
    const pg = ot.createGain(); pg.gain.value = 1 / (pi + 1) * 0.5
    osc.connect(pg); pg.connect(mastt); osc.start(0); osc.stop(durt)
  })
  return ot.startRendering()
}

// ─── BASS ──────────────────────────────────────────────────────────────────
async function _bass(idx: number): Promise<AudioBuffer> {
  const a = idx % 8
  const t = Math.floor(idx / 8) % 7
  const noteBase = [28.0, 30.9, 32.7, 36.7, 41.2, 43.7, 48.9, 51.9]
  const f0 = noteBase[idx % 8] * (1 + Math.floor(idx / 8) * 0.25)

  if (a === 0) {
    // Sub bass — pure sine
    const dur = 1.2 + t * 0.1; const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = f0
    const g = o.createGain(); _env(g, 0.01, 0.8, 0.05, 0.7, 0.2)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (a === 1) {
    // Sawtooth bass — lowpass filtered
    const dur = 0.9 + t * 0.08; const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = f0
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600 + t * 80; lp.Q.value = 2 + t * 0.3
    const g = o.createGain(); _env(g, 0.005, 0.75, 0.1, 0.6, 0.25)
    osc.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (a === 2) {
    // 303-style — self-oscillating filter sweep
    const dur = 0.7 + t * 0.07; const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = f0
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 10 + t
    lp.frequency.setValueAtTime(2000 + t * 200, 0); lp.frequency.exponentialRampToValueAtTime(200 + t * 30, 0.15)
    const g = o.createGain(); _env(g, 0.005, 0.8, 0.05, 0.65, 0.15)
    osc.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (a === 3) {
    // Plucked bass — Karplus-ish resonant
    const dur = 0.8 + t * 0.07; const o = _off(dur)
    const ns = _noise(o, 0.02)
    const bp = o.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f0; bp.Q.value = 30 + t * 5
    const g = o.createGain(); _env(g, 0.001, 0.9, 0.01, 0.5, dur - 0.05)
    ns.connect(bp); bp.connect(g); g.connect(o.destination); ns.start(0); ns.stop(0.025)
    return o.startRendering()
  }
  if (a === 4) {
    // FM bass — deep modulation
    const dur = 1.0 + t * 0.09; const o = _off(dur)
    const mod = o.createOscillator(); mod.type = 'sine'; mod.frequency.value = f0 * 2
    const mGain = o.createGain()
    mGain.gain.setValueAtTime(f0 * 3, 0); mGain.gain.exponentialRampToValueAtTime(0.1, 0.2)
    const car = o.createOscillator(); car.type = 'sine'; car.frequency.value = f0
    mod.connect(mGain); mGain.connect(car.frequency)
    const g = o.createGain(); _env(g, 0.01, 0.85, 0.05, 0.7, 0.2)
    car.connect(g); g.connect(o.destination)
    mod.start(0); mod.stop(dur); car.start(0); car.stop(dur)
    return o.startRendering()
  }
  if (a === 5) {
    // Square bass — hollow mid
    const dur = 0.85 + t * 0.075; const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'square'; osc.frequency.value = f0
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400 + t * 60
    const g = o.createGain(); _env(g, 0.008, 0.7, 0.08, 0.55, 0.2)
    osc.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (a === 6) {
    // Distorted bass — overdrive
    const dur = 0.75 + t * 0.065; const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = f0
    const ws = _waveshape(o, 30 + t * 8)
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 800 + t * 100
    const g = o.createGain(); _env(g, 0.005, 0.65, 0.07, 0.5, 0.2)
    osc.connect(ws); ws.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  // arch 7: additive bass — 4 harmonics
  const durb7 = 1.0 + t * 0.09; const ob7 = _off(durb7)
  ;[0.6, 0.25, 0.1, 0.05].forEach((amp, hi) => {
    const osc = ob7.createOscillator(); osc.type = 'sine'; osc.frequency.value = f0 * (hi + 1)
    const g = ob7.createGain(); _env(g, 0.01, amp, 0.05, amp * 0.8, 0.3)
    osc.connect(g); g.connect(ob7.destination); osc.start(0); osc.stop(durb7)
  })
  return ob7.startRendering()
}

// ─── FILL ──────────────────────────────────────────────────────────────────
async function _fill(idx: number): Promise<AudioBuffer> {
  const a = idx % 8
  const t = Math.floor(idx / 8) % 7
  const dur = 1.5 + t * 0.15

  if (a === 0) {
    // Ascending tom fill
    const o = _off(dur)
    ;[60, 90, 130, 180].map(f => f + t * 8).forEach((f, i) => {
      const start = i * 0.12
      const osc = o.createOscillator(); osc.type = 'sine'
      osc.frequency.setValueAtTime(f * 2, start); osc.frequency.exponentialRampToValueAtTime(f, start + 0.04)
      const g = o.createGain()
      g.gain.setValueAtTime(0, start); g.gain.linearRampToValueAtTime(0.7, start + 0.01); g.gain.exponentialRampToValueAtTime(0.001, start + 0.25)
      osc.connect(g); g.connect(o.destination); osc.start(start); osc.stop(start + 0.3)
    })
    return o.startRendering()
  }
  if (a === 1) {
    // Snare roll — rapid noise bursts
    const o = _off(dur); const steps = 8 + t
    for (let i = 0; i < steps; i++) {
      const start = i * (dur / steps); const slen = 0.06 + t * 0.005
      const ns = _noise(o, slen)
      const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2000 + t * 200
      const g = o.createGain()
      g.gain.setValueAtTime(0, start); g.gain.linearRampToValueAtTime(0.5 + (i / steps) * 0.3, start + 0.005); g.gain.exponentialRampToValueAtTime(0.001, start + slen)
      ns.connect(hp); hp.connect(g); g.connect(o.destination); ns.start(start); ns.stop(start + slen + 0.01)
    }
    return o.startRendering()
  }
  if (a === 2) {
    // Crash swell — noise envelope
    const o = _off(dur)
    const ns = _noise(o, dur)
    const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4000 + t * 300
    const g = o.createGain()
    g.gain.setValueAtTime(0.001, 0); g.gain.linearRampToValueAtTime(0.7, 0.08); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.05)
    ns.connect(hp); hp.connect(g); g.connect(o.destination); ns.start(0); ns.stop(dur)
    return o.startRendering()
  }
  if (a === 3) {
    // Kick fill — impacts
    const o = _off(dur)
    ;[0, 0.25, 0.4, 0.5, 0.62, 0.75, 0.85, 0.92].map(x => x * dur).forEach((start, i) => {
      const f = (45 + t * 5) * (1 + i * 0.05)
      const osc = o.createOscillator(); osc.type = 'sine'
      osc.frequency.setValueAtTime(f * 4, start); osc.frequency.exponentialRampToValueAtTime(f, start + 0.05)
      const g = o.createGain()
      g.gain.setValueAtTime(0, start); g.gain.linearRampToValueAtTime(0.7 + i * 0.03, start + 0.005); g.gain.exponentialRampToValueAtTime(0.001, start + 0.18)
      osc.connect(g); g.connect(o.destination); osc.start(start); osc.stop(start + 0.2)
    })
    return o.startRendering()
  }
  if (a === 4) {
    // Hihat fill — rapid metallic
    const o = _off(dur); const steps = 16 + t * 2
    for (let i = 0; i < steps; i++) {
      const start = i * (dur / steps)
      const osc = o.createOscillator(); osc.type = 'square'; osc.frequency.value = 8000 + t * 300
      const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 9000
      const g = o.createGain()
      g.gain.setValueAtTime(0, start); g.gain.linearRampToValueAtTime(0.2, start + 0.002); g.gain.exponentialRampToValueAtTime(0.001, start + 0.04)
      osc.connect(hp); hp.connect(g); g.connect(o.destination); osc.start(start); osc.stop(start + 0.05)
    }
    return o.startRendering()
  }
  if (a === 5) {
    // Tuned fill — melodic percussive
    const root = 200 + t * 20
    const o = _off(dur)
    ;[1, 1.25, 1.5, 2, 1.5, 1.25, 1, 0.75].forEach((ratio, i) => {
      const start = i * 0.15
      const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = root * ratio
      const g = o.createGain()
      g.gain.setValueAtTime(0, start); g.gain.linearRampToValueAtTime(0.5, start + 0.008); g.gain.exponentialRampToValueAtTime(0.001, start + 0.25)
      osc.connect(g); g.connect(o.destination); osc.start(start); osc.stop(start + 0.3)
    })
    return o.startRendering()
  }
  if (a === 6) {
    // Noise sweep — filtered glide
    const o = _off(dur)
    const ns = _noise(o, dur)
    const bp = o.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 3 + t
    bp.frequency.setValueAtTime(200 + t * 40, 0); bp.frequency.exponentialRampToValueAtTime(8000 + t * 300, dur)
    const g = o.createGain()
    g.gain.setValueAtTime(0.001, 0); g.gain.linearRampToValueAtTime(0.7, 0.1); g.gain.linearRampToValueAtTime(0.7, dur - 0.1); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    ns.connect(bp); bp.connect(g); g.connect(o.destination); ns.start(0); ns.stop(dur)
    return o.startRendering()
  }
  // arch 7: combo — kick+snare alternating
  const of7 = _off(dur)
  ;[0, 0.15, 0.25, 0.35, 0.45, 0.5, 0.55, 0.6].map(x => x * dur / 0.65).forEach((start, i) => {
    if (i % 2 === 0) {
      const osc = of7.createOscillator(); osc.type = 'sine'
      osc.frequency.setValueAtTime(200 + t * 20, start); osc.frequency.exponentialRampToValueAtTime(50 + t * 4, start + 0.06)
      const g = of7.createGain()
      g.gain.setValueAtTime(0, start); g.gain.linearRampToValueAtTime(0.7, start + 0.005); g.gain.exponentialRampToValueAtTime(0.001, start + 0.18)
      osc.connect(g); g.connect(of7.destination); osc.start(start); osc.stop(start + 0.2)
    } else {
      const ns = _noise(of7, 0.12)
      const hp = of7.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2000
      const g = of7.createGain()
      g.gain.setValueAtTime(0, start); g.gain.linearRampToValueAtTime(0.5, start + 0.003); g.gain.exponentialRampToValueAtTime(0.001, start + 0.12)
      ns.connect(hp); hp.connect(g); g.connect(of7.destination); ns.start(start); ns.stop(start + 0.14)
    }
  })
  return of7.startRendering()
}

// ─── PERCUSSION ────────────────────────────────────────────────────────────
async function _percussion(idx: number): Promise<AudioBuffer> {
  const a = idx % 8
  const t = Math.floor(idx / 8) % 7

  if (a === 0) {
    // Shaker
    const dur = 0.18 + t * 0.015; const o = _off(dur)
    const ns = _noise(o, dur)
    const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 5000 + t * 400
    const g = o.createGain(); g.gain.setValueAtTime(0.6, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.005)
    ns.connect(hp); hp.connect(g); g.connect(o.destination); ns.start(0); ns.stop(dur)
    return o.startRendering()
  }
  if (a === 1) {
    // Cowbell — two detuned squares
    const f = 800 + t * 80; const d = 0.5 + t * 0.05; const o = _off(d)
    const g = o.createGain(); g.gain.setValueAtTime(0.5, 0); g.gain.exponentialRampToValueAtTime(0.001, d - 0.01)
    ;[f, f * 1.51].forEach(freq => {
      const osc = o.createOscillator(); osc.type = 'square'; osc.frequency.value = freq
      osc.connect(g); osc.start(0); osc.stop(d)
    })
    g.connect(o.destination); return o.startRendering()
  }
  if (a === 2) {
    // Clap — 3 layered noise bursts
    const d = 0.22 + t * 0.02; const o = _off(d)
    for (let i = 0; i < 3; i++) {
      const st = i * 0.008
      const ns = _noise(o, 0.04)
      const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1500
      const g = o.createGain()
      g.gain.setValueAtTime(0, st); g.gain.linearRampToValueAtTime(0.4 + t * 0.03, st + 0.002); g.gain.exponentialRampToValueAtTime(0.001, st + 0.06)
      ns.connect(hp); hp.connect(g); g.connect(o.destination); ns.start(st); ns.stop(st + 0.05)
    }
    return o.startRendering()
  }
  if (a === 3) {
    // Woodblock — high sine
    const f = 900 + t * 70; const d = 0.12 + t * 0.01; const o = _off(d)
    const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = f
    const g = o.createGain(); g.gain.setValueAtTime(0.8, 0); g.gain.exponentialRampToValueAtTime(0.001, d - 0.005)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(d)
    return o.startRendering()
  }
  if (a === 4) {
    // Tambourine — shaker + jingle partials
    const d = 0.3 + t * 0.03; const o = _off(d)
    const ns = _noise(o, d)
    const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4000
    const ng = o.createGain(); ng.gain.setValueAtTime(0.4, 0); ng.gain.exponentialRampToValueAtTime(0.001, d - 0.01)
    ns.connect(hp); hp.connect(ng); ng.connect(o.destination); ns.start(0); ns.stop(d)
    ;[3500, 5200, 7100].forEach(freq => {
      const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq + t * 50
      const g = o.createGain(); g.gain.setValueAtTime(0.08, 0); g.gain.exponentialRampToValueAtTime(0.001, d * 0.7)
      osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(d)
    })
    return o.startRendering()
  }
  if (a === 5) {
    // Maracas — bandpass white noise
    const d = 0.15 + t * 0.012; const o = _off(d)
    const ns = _noise(o, d)
    const lp = o.createBiquadFilter(); lp.type = 'bandpass'; lp.frequency.value = 7000 + t * 300; lp.Q.value = 0.5
    const g = o.createGain(); g.gain.setValueAtTime(0.5, 0); g.gain.exponentialRampToValueAtTime(0.001, d - 0.005)
    ns.connect(lp); lp.connect(g); g.connect(o.destination); ns.start(0); ns.stop(d)
    return o.startRendering()
  }
  if (a === 6) {
    // Agogo bell — two struck tones
    const d = 0.6 + t * 0.06; const f1p = 600 + t * 50; const o = _off(d)
    ;[f1p, f1p * 1.25].forEach((f, i) => {
      const start = i * 0.08
      const osc = o.createOscillator(); osc.type = 'triangle'; osc.frequency.value = f
      const g = o.createGain()
      g.gain.setValueAtTime(0, start); g.gain.linearRampToValueAtTime(0.5, start + 0.005); g.gain.exponentialRampToValueAtTime(0.001, start + d * 0.7)
      osc.connect(g); g.connect(o.destination); osc.start(start); osc.stop(start + d)
    })
    return o.startRendering()
  }
  // arch 7: snap — sharp bandpass noise
  const dp7 = 0.06 + t * 0.005; const op7 = _off(dp7)
  const nsp7 = _noise(op7, dp7)
  const bpp7 = op7.createBiquadFilter(); bpp7.type = 'bandpass'; bpp7.frequency.value = 2500 + t * 200; bpp7.Q.value = 2
  const gp7 = op7.createGain(); gp7.gain.setValueAtTime(0.9, 0); gp7.gain.exponentialRampToValueAtTime(0.001, dp7 - 0.003)
  nsp7.connect(bpp7); bpp7.connect(gp7); gp7.connect(op7.destination); nsp7.start(0); nsp7.stop(dp7)
  return op7.startRendering()
}

// ─── VOCAL ─────────────────────────────────────────────────────────────────
async function _vocal(idx: number): Promise<AudioBuffer> {
  const a = idx % 8
  const t = Math.floor(idx / 8) % 7
  const formants: [number, number, number][] = [
    [730, 1090, 2440],  // 'ah'
    [270, 2290, 3010],  // 'ee'
    [390, 1990, 2550],  // 'ih'
    [530, 1840, 2480],  // 'eh'
    [300, 870, 2240],   // 'oo'
    [640, 1190, 2390],  // 'uh'
    [460, 1310, 2330],  // 'oh'
    [750, 1150, 2470],  // 'aa'
  ]
  const [f1, f2, f3] = formants[a]
  const pitch = 130 + t * 20
  const dur = 1.0 + t * 0.1
  const o = _off(dur)
  const osc = o.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = pitch
  const master = o.createGain(); master.connect(o.destination)
  master.gain.setValueAtTime(0.001, 0); master.gain.linearRampToValueAtTime(0.5, 0.05)
  master.gain.linearRampToValueAtTime(0.5, dur - 0.1); master.gain.linearRampToValueAtTime(0.001, dur - 0.01)
  ;[[f1, 8], [f2, 10], [f3, 12]].forEach(([freq, q]) => {
    const bp = o.createBiquadFilter(); bp.type = 'bandpass'
    bp.frequency.value = freq + t * 15; bp.Q.value = q
    osc.connect(bp); bp.connect(master)
  })
  osc.start(0); osc.stop(dur)
  return o.startRendering()
}

// ─── LONG ──────────────────────────────────────────────────────────────────
async function _long(idx: number): Promise<AudioBuffer> {
  const a = idx % 9
  const t = Math.floor(idx / 9) % 9
  const dur = 3.0 + t * 0.2
  const rootNotes = [55, 65.4, 73.4, 82.4, 98, 110, 123.5, 130.8, 146.8]
  const root = rootNotes[t]
  const o = _off(dur)

  if (a === 0) {
    // Pure sine pad
    const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = root
    const g = o.createGain(); _env(g, 0.3, 0.5, 0.2, 0.45, 0.3)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (a === 1) {
    // Detuned saw pad — 3 detuned saws
    ;[-0.05, 0, 0.05].forEach(det => {
      const osc = o.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = root * (1 + det)
      const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2000 + t * 150
      const g = o.createGain(); _env(g, 0.4, 0.2, 0.3, 0.18, 0.4)
      osc.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    })
    return o.startRendering()
  }
  if (a === 2) {
    // Ambient swell — noise + resonant filter
    const ns = _noise(o, dur)
    const bp = o.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = root * 2; bp.Q.value = 5 + t
    const g = o.createGain(); _env(g, 0.5, 0.4, 0.4, 0.35, 0.5)
    ns.connect(bp); bp.connect(g); g.connect(o.destination); ns.start(0); ns.stop(dur)
    return o.startRendering()
  }
  if (a === 3) {
    // Choir-like — formant filtered saw
    const osc = o.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = root
    ;[[730, 8], [1090, 12], [2440, 15]].forEach(([f, q]) => {
      const bp = o.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q
      const g = o.createGain(); _env(g, 0.4, 0.18, 0.3, 0.15, 0.4)
      osc.connect(bp); bp.connect(g); g.connect(o.destination)
    })
    osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (a === 4) {
    // String-like — saw + vibrato LFO
    const osc = o.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = root
    const lfo = o.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 5 + t * 0.3
    const lfoGain = o.createGain(); lfoGain.gain.value = 3 + t * 0.4
    lfo.connect(lfoGain); lfoGain.connect(osc.frequency)
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3000
    const g = o.createGain(); _env(g, 0.5, 0.4, 0.3, 0.35, 0.5)
    osc.connect(lp); lp.connect(g); g.connect(o.destination)
    lfo.start(0); lfo.stop(dur); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (a === 5) {
    // Pulse width pad
    const osc = o.createOscillator(); osc.type = 'square'; osc.frequency.value = root
    const osc2 = o.createOscillator(); osc2.type = 'square'; osc2.frequency.value = root * 2.005
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500 + t * 120
    const g = o.createGain(); _env(g, 0.4, 0.3, 0.2, 0.25, 0.4)
    osc.connect(lp); osc2.connect(lp); lp.connect(g); g.connect(o.destination)
    osc.start(0); osc.stop(dur); osc2.start(0); osc2.stop(dur)
    return o.startRendering()
  }
  if (a === 6) {
    // FM pad — lush modulation
    const mod = o.createOscillator(); mod.type = 'sine'; mod.frequency.value = root * 2
    const mGain = o.createGain()
    mGain.gain.setValueAtTime(root * 2, 0); mGain.gain.linearRampToValueAtTime(root * 0.3, dur * 0.5)
    const car = o.createOscillator(); car.type = 'sine'; car.frequency.value = root
    mod.connect(mGain); mGain.connect(car.frequency)
    const g = o.createGain(); _env(g, 0.5, 0.5, 0.3, 0.4, 0.5)
    car.connect(g); g.connect(o.destination)
    mod.start(0); mod.stop(dur); car.start(0); car.stop(dur)
    return o.startRendering()
  }
  if (a === 7) {
    // Drone — harmonics
    ;[1, 2, 3, 4].forEach((harmonic, i) => {
      const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = root * harmonic
      const g = o.createGain(); const amp = 0.4 / (i + 1)
      _env(g, 0.6, amp, 0.4, amp * 0.9, 0.6)
      osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    })
    return o.startRendering()
  }
  // arch 8: granular texture — overlapping short grains
  const grainCount = 12 + t * 2
  for (let i = 0; i < grainCount; i++) {
    const start = (i / grainCount) * dur * 0.7
    const gDur = 0.2 + (i % 3) * 0.1
    const freq = root * (0.9 + (i % 5) * 0.04)
    const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq
    const g = o.createGain()
    g.gain.setValueAtTime(0, start); g.gain.linearRampToValueAtTime(0.15, start + 0.05); g.gain.linearRampToValueAtTime(0.001, start + gDur)
    osc.connect(g); g.connect(o.destination); osc.start(start); osc.stop(start + gDur + 0.01)
  }
  return o.startRendering()
}

// ─── MEDIUM ────────────────────────────────────────────────────────────────
async function _medium(idx: number): Promise<AudioBuffer> {
  const a = idx % 9
  const t = Math.floor(idx / 9) % 9
  const dur = 1.8 + t * 0.15
  const notes = [82.4, 98, 110, 123.5, 130.8, 146.8, 164.8, 196, 220]
  const root = notes[t]
  const o = _off(dur)

  if (a === 0) {
    const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = root
    const g = o.createGain(); _env(g, 0.005, 0.75, 0.05, 0.0, dur - 0.05)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (a === 1) {
    // Piano-like inharmonic partials
    ;[1, 2, 3, 4.05, 5.1].forEach((r, i) => {
      const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = root * r
      const g = o.createGain(); const dec = (dur - 0.05) / (i + 1)
      _env(g, 0.003, 0.5 / (i + 1), 0.01, 0, dec)
      osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    })
    return o.startRendering()
  }
  if (a === 2) {
    // Marimba — 2 partials
    ;[[1, 0.6], [4.0, 0.2]].forEach(([r, amp]) => {
      const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = root * r
      const g = o.createGain(); _env(g, 0.004, amp, 0.01, 0, dur - 0.04)
      osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    })
    return o.startRendering()
  }
  if (a === 3) {
    // Guitar-like pluck
    const osc = o.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = root
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'
    lp.frequency.setValueAtTime(4000, 0); lp.frequency.exponentialRampToValueAtTime(500, 0.3)
    const g = o.createGain(); _env(g, 0.005, 0.7, 0.02, 0, dur - 0.04)
    osc.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (a === 4) {
    // Kalimba — quick attack, pure decay
    const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = root * 2
    const g = o.createGain(); _env(g, 0.002, 0.65, 0.008, 0, dur - 0.02)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (a === 5) {
    // Bell — inharmonic pair
    ;[[1, 0.5], [2.73, 0.2], [5.4, 0.1]].forEach(([r, amp]) => {
      const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = root * r
      const g = o.createGain(); _env(g, 0.002, amp, 0.01, 0, dur - 0.02)
      osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    })
    return o.startRendering()
  }
  if (a === 6) {
    // Synth stab — quick filtered saw
    const osc = o.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = root
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3000 + t * 200
    const g = o.createGain(); _env(g, 0.008, 0.8, 0.1, 0.4, 0.5)
    osc.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (a === 7) {
    // Vibraphone — tremolo
    const lfo = o.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 5.5
    const lfoGain = o.createGain(); lfoGain.gain.value = 0.15
    lfo.connect(lfoGain)
    ;[[1, 0.5], [3.98, 0.15]].forEach(([r, amp]) => {
      const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = root * r
      const trGain = o.createGain(); trGain.gain.value = amp
      lfoGain.connect(trGain.gain)
      const g = o.createGain(); _env(g, 0.005, 1.0, 0.01, 0, dur - 0.02)
      osc.connect(trGain); trGain.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    })
    lfo.start(0); lfo.stop(dur)
    return o.startRendering()
  }
  // arch 8: xylophone bright
  ;[[1, 0.7], [3.01, 0.25]].forEach(([r, amp]) => {
    const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = root * r * 2
    const g = o.createGain(); _env(g, 0.003, amp, 0.008, 0, 0.6 + t * 0.05)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
  })
  return o.startRendering()
}

// ─── SHORT ─────────────────────────────────────────────────────────────────
async function _short(idx: number): Promise<AudioBuffer> {
  const a = idx % 9
  const t = Math.floor(idx / 9) % 9
  const dur = 0.3 + t * 0.025
  const notes = [196, 220, 246.9, 261.6, 293.7, 329.6, 349.2, 392, 440]
  const root = notes[t]
  const o = _off(dur)

  if (a === 0) {
    const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = 800 + t * 60
    const g = o.createGain(); g.gain.setValueAtTime(0.8, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.005)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (a === 1) {
    const osc = o.createOscillator(); osc.type = 'square'; osc.frequency.value = 2000 + t * 150
    const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1500
    const g = o.createGain(); g.gain.setValueAtTime(0.7, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.005)
    osc.connect(hp); hp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (a === 2) {
    const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = root * 2
    const g = o.createGain(); g.gain.setValueAtTime(0.7, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.005)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (a === 3) {
    const ns = _noise(o, dur)
    const bp = o.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3000 + t * 250; bp.Q.value = 2
    const g = o.createGain(); g.gain.setValueAtTime(0.7, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.005)
    ns.connect(bp); bp.connect(g); g.connect(o.destination); ns.start(0); ns.stop(dur)
    return o.startRendering()
  }
  if (a === 4) {
    // Glitch — frequency sweep
    const osc = o.createOscillator(); osc.type = 'square'
    osc.frequency.setValueAtTime(root * 4, 0); osc.frequency.linearRampToValueAtTime(root * 0.5, dur)
    const g = o.createGain(); g.gain.setValueAtTime(0.7, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.005)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (a === 5) {
    // Ping — 2 partials
    ;[[1, 0.6], [2.4, 0.3]].forEach(([r, amp]) => {
      const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = root * r
      const g = o.createGain(); g.gain.setValueAtTime(amp, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.005)
      osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    })
    return o.startRendering()
  }
  if (a === 6) {
    // Zap — descending
    const osc = o.createOscillator(); osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(root * 8, 0); osc.frequency.exponentialRampToValueAtTime(root * 0.5, dur)
    const g = o.createGain(); g.gain.setValueAtTime(0.8, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.005)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (a === 7) {
    // Snap — fast noise
    const ns = _noise(o, dur)
    const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 5000
    const g = o.createGain(); g.gain.setValueAtTime(0.9, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.005)
    ns.connect(hp); hp.connect(g); g.connect(o.destination); ns.start(0); ns.stop(dur)
    return o.startRendering()
  }
  // arch 8: chip blip
  const osc8s = o.createOscillator(); osc8s.type = 'square'; osc8s.frequency.value = root * (1 + t * 0.5)
  const g8s = o.createGain(); g8s.gain.setValueAtTime(0.6, 0); g8s.gain.exponentialRampToValueAtTime(0.001, dur - 0.005)
  osc8s.connect(g8s); g8s.connect(o.destination); osc8s.start(0); osc8s.stop(dur)
  return o.startRendering()
}

// ─── CHORD ─────────────────────────────────────────────────────────────────
async function _chord(idx: number): Promise<AudioBuffer> {
  const a = idx % 9
  const t = Math.floor(idx / 9) % 9
  const dur = 1.5 + t * 0.12
  const roots = [65.4, 73.4, 82.4, 87.3, 98, 110, 116.5, 130.8, 146.8]
  const root = roots[t]
  const chordTypes: number[][] = [
    [0, 4, 7],
    [0, 3, 7],
    [0, 4, 7, 11],
    [0, 3, 7, 10],
    [0, 4, 7, 10],
    [0, 5, 7],
    [0, 2, 7],
    [0, 4, 8],
    [0, 3, 6],
  ]
  const oscTypes: OscillatorType[] = ['sine', 'triangle', 'sawtooth', 'square', 'sine', 'triangle', 'sawtooth', 'sine', 'triangle']
  const chord = chordTypes[a]
  const oscType = oscTypes[a]
  const o = _off(dur)
  chord.forEach(semitone => {
    const freq = root * Math.pow(2, semitone / 12)
    const osc = o.createOscillator(); osc.type = oscType; osc.frequency.value = freq
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2000 + t * 150
    const g = o.createGain(); _env(g, 0.02, 0.25, 0.15, 0.2, 0.4)
    osc.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
  })
  return o.startRendering()
}

// ─── INSTRUMENT ────────────────────────────────────────────────────────────
async function _instrument(idx: number): Promise<AudioBuffer> {
  const a = idx % 9
  const t = Math.floor(idx / 9) % 12
  const dur = 2.0 + t * 0.15
  const roots = [65.4, 73.4, 82.4, 87.3, 98, 110, 116.5, 130.8, 146.8, 164.8, 174.6, 196]
  const root = roots[t]
  const o = _off(dur)

  if (a === 0) {
    // Brass — saw + filter envelope
    const osc = o.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = root
    const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 200
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'
    lp.frequency.setValueAtTime(800, 0); lp.frequency.linearRampToValueAtTime(3000, 0.15)
    const g = o.createGain(); _env(g, 0.05, 0.7, 0.1, 0.55, 0.3)
    osc.connect(hp); hp.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (a === 1) {
    // Woodwind — square + vibrato
    const osc = o.createOscillator(); osc.type = 'square'; osc.frequency.value = root
    const lfo = o.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 5.5
    const lfoG = o.createGain(); lfoG.gain.value = 4
    lfo.connect(lfoG); lfoG.connect(osc.frequency)
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2000
    const g = o.createGain(); _env(g, 0.08, 0.6, 0.15, 0.5, 0.3)
    osc.connect(lp); lp.connect(g); g.connect(o.destination)
    lfo.start(0.1); lfo.stop(dur); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (a === 2) {
    // Synth lead — detuned pair
    ;[0, 0.02].forEach(det => {
      const osc = o.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = root * (1 + det)
      const g = o.createGain(); _env(g, 0.03, 0.35, 0.1, 0.28, 0.3)
      osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    })
    return o.startRendering()
  }
  if (a === 3) {
    // Organ — additive harmonics
    ;[1, 2, 3, 4, 6, 8].forEach((h, i) => {
      const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = root * h
      const g = o.createGain(); const amp = 0.3 / Math.sqrt(i + 1)
      _env(g, 0.02, amp, 0.05, amp * 0.95, 0.05)
      osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    })
    return o.startRendering()
  }
  if (a === 4) {
    // FM synth lead
    const mod = o.createOscillator(); mod.type = 'sine'; mod.frequency.value = root * 3
    const mGain = o.createGain()
    mGain.gain.setValueAtTime(root * 5, 0); mGain.gain.linearRampToValueAtTime(root * 0.5, 0.3)
    const car = o.createOscillator(); car.type = 'sine'; car.frequency.value = root
    mod.connect(mGain); mGain.connect(car.frequency)
    const g = o.createGain(); _env(g, 0.04, 0.7, 0.15, 0.55, 0.3)
    car.connect(g); g.connect(o.destination)
    mod.start(0); mod.stop(dur); car.start(0); car.stop(dur)
    return o.startRendering()
  }
  if (a === 5) {
    // Pad lead — triangle + LFO filter
    const osc = o.createOscillator(); osc.type = 'triangle'; osc.frequency.value = root
    const lfo = o.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.3
    const lfoG = o.createGain(); lfoG.gain.value = 800
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500
    lfo.connect(lfoG); lfoG.connect(lp.frequency)
    const g = o.createGain(); _env(g, 0.2, 0.6, 0.2, 0.5, 0.4)
    osc.connect(lp); lp.connect(g); g.connect(o.destination)
    lfo.start(0); lfo.stop(dur); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (a === 6) {
    // Plucked string — physical model style
    const ns = _noise(o, 0.01)
    const bp = o.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = root; bp.Q.value = 80 + t * 5
    const g = o.createGain(); _env(g, 0.001, 0.85, 0.01, 0, dur - 0.02)
    ns.connect(bp); bp.connect(g); g.connect(o.destination); ns.start(0); ns.stop(0.015)
    return o.startRendering()
  }
  if (a === 7) {
    // Chiptune arpeggio
    ;[root, root * 1.25, root * 1.5, root * 2].forEach((freq, i) => {
      const start = i * 0.15; const d = 0.12
      const osc = o.createOscillator(); osc.type = 'square'; osc.frequency.value = freq
      const g = o.createGain()
      g.gain.setValueAtTime(0, start); g.gain.linearRampToValueAtTime(0.4, start + 0.005); g.gain.linearRampToValueAtTime(0.001, start + d)
      osc.connect(g); g.connect(o.destination); osc.start(start); osc.stop(start + d + 0.01)
    })
    return o.startRendering()
  }
  // arch 8: distorted guitar-like
  const osc8i = o.createOscillator(); osc8i.type = 'sawtooth'; osc8i.frequency.value = root
  const ws8i = _waveshape(o, 40 + t * 10)
  const lp8i = o.createBiquadFilter(); lp8i.type = 'lowpass'; lp8i.frequency.value = 3500 + t * 200
  const g8i = o.createGain(); _env(g8i, 0.01, 0.65, 0.1, 0.5, 0.3)
  osc8i.connect(ws8i); ws8i.connect(lp8i); lp8i.connect(g8i); g8i.connect(o.destination); osc8i.start(0); osc8i.stop(dur)
  return o.startRendering()
}

// ─── MAIN EXPORT ───────────────────────────────────────────────────────────
/**
 * catalogSynth(presetIdx, localPadIdx, category) → unique AudioBuffer
 *
 * localPadIdx: 0-indexed position within the category for this preset.
 * Each preset×pad combination maps to a different architecture.
 */
export async function catalogSynth(
  presetIdx: number,
  localPadIdx: number,
  category: string
): Promise<AudioBuffer> {
  const ppc = PADS_PER_PRESET[category] ?? 2
  const idx = Math.max(0, presetIdx) * ppc + (Math.max(0, localPadIdx) % ppc)

  try {
    switch (category) {
      case 'kick':        return await _kick(idx)
      case 'snare':       return await _snare(idx)
      case 'hihat':       return await _hihat(idx)
      case 'drum':        return await _drum(idx)
      case 'bass':        return await _bass(idx)
      case 'fill':        return await _fill(idx)
      case 'percussion':  return await _percussion(idx)
      case 'vocal':       return await _vocal(idx)
      case 'long':        return await _long(idx)
      case 'medium':      return await _medium(idx)
      case 'short':       return await _short(idx)
      case 'chord':       return await _chord(idx)
      case 'instrument':  return await _instrument(idx)
      default: {
        const dur = 0.5; const o = _off(dur)
        const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = 220 + idx * 7
        const g = o.createGain(); g.gain.setValueAtTime(0.5, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
        osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
        return o.startRendering()
      }
    }
  } catch (err) {
    console.warn('[catalogSynth] error in', category, idx, err)
    const dur = 0.3; const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = 440
    const g = o.createGain(); g.gain.setValueAtTime(0.3, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
}
