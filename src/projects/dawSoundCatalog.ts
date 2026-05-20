// dawSoundCatalog.ts — Per-Preset Unique Synthesis Catalog
// 27 presets × 13 categories × 2-4 pads = 864 uniquely synthesized sounds
// Every preset has a tonal persona: root note, scale, and synthesis style indices
// NO Freesound API — all synthesis via OfflineAudioContext Web Audio
// Minimum bass 55Hz, minimum kick 40Hz — audible on all speakers

const SR = 44100

// ─── HELPERS ────────────────────────────────────────────────────────────────
function _off(dur: number): OfflineAudioContext {
  return new OfflineAudioContext(1, Math.max(1, Math.ceil(SR * Math.max(dur, 0.05))), SR)
}

function _noise(ctx: OfflineAudioContext, dur: number): AudioBufferSourceNode {
  const len = Math.ceil(dur * SR)
  const nb = ctx.createBuffer(1, Math.max(len, 1), SR)
  const d = nb.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource(); src.buffer = nb; return src
}

function _ws(ctx: OfflineAudioContext, amt: number): WaveShaperNode {
  const ws = ctx.createWaveShaper()
  const n = 512; const c = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1
    c[i] = (x * (Math.PI + amt)) / (Math.PI + amt * Math.abs(x))
  }
  ws.curve = c; return ws
}

// Simple attack-decay-release envelope
function _adr(g: GainNode, atk: number, peak: number, rel: number, now = 0) {
  g.gain.setValueAtTime(0.001, now)
  g.gain.linearRampToValueAtTime(peak, now + Math.max(atk, 0.001))
  g.gain.exponentialRampToValueAtTime(0.001, now + Math.max(atk, 0.001) + Math.max(rel, 0.01))
}

// Full ADSR
function _adsr(g: GainNode, at: number, peak: number, dt: number, sus: number, rt: number, now = 0) {
  g.gain.setValueAtTime(0.001, now)
  g.gain.linearRampToValueAtTime(peak, now + Math.max(at, 0.001))
  g.gain.linearRampToValueAtTime(sus, now + Math.max(at, 0.001) + Math.max(dt, 0.01))
  g.gain.exponentialRampToValueAtTime(0.001, now + Math.max(at, 0.001) + Math.max(dt, 0.01) + Math.max(rt, 0.02))
}

// Get frequency for semitone offset from root
function _st(root: number, semi: number): number { return root * Math.pow(2, semi / 12) }

// Clamp value
function _clamp(v: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, v)) }

// ─── PRESET PERSONAS ────────────────────────────────────────────────────────
// Indexed exactly to PRESETS array in nearfinaldaw.tsx
interface Persona {
  root: number       // tonal root Hz for melodic content
  bassRoot: number   // bass root Hz (min 55 for audibility on small speakers)
  kickRoot: number   // kick fundamental Hz (min 40)
  scale: number[]    // semitone offsets from root (scale degrees)
  kickStyle: number  // 0-7 → kick synthesis architecture
  snareStyle: number // 0-7 → snare synthesis architecture
  bassStyle: number  // 0-7 → bass synthesis architecture
  hihatStyle: number // 0-5 → hihat architecture
  fillStyle: number  // 0-7 → fill architecture
  percStyle: number  // 0-7 → percussion architecture
  vocalStyle: number // 0-5 → vocal architecture
  melodicStyle: number // 0-7 → for long/medium/short/chord/instrument
  drumStyle: number  // 0-7 → tom/drum architecture
}

const MIN = [0,2,3,5,7,8,10]   // natural minor
const MAJ = [0,2,4,5,7,9,11]   // major
const DOR = [0,2,3,5,7,9,10]   // dorian
const PHR = [0,1,3,5,7,8,10]   // phrygian
const LYD = [0,2,4,6,7,9,11]   // lydian
const MIX = [0,2,4,5,7,9,10]   // mixolydian
const PNM = [0,3,5,7,10]        // pentatonic minor
const PNJ = [0,2,4,7,9]         // pentatonic major/Japanese
const BLS = [0,3,5,6,7,10]      // blues scale
const CHR = [0,1,2,3,4,5,7,9]  // chromatic-ish

// 27 personas — index matches PRESETS array in nearfinaldaw.tsx
const PERSONAS: Persona[] = [
  // 0: Dubstep Club — A2=110, deep sub A1, heavy minor
  { root:110,   bassRoot:55,    kickRoot:55,  scale:MIN, kickStyle:0, snareStyle:0, bassStyle:0, hihatStyle:0, fillStyle:0, percStyle:0, vocalStyle:0, melodicStyle:0, drumStyle:0 },
  // 1: Trap Soul — Ab2, trap sub, pentatonic minor
  { root:103.8, bassRoot:55,    kickRoot:55,  scale:PNM, kickStyle:1, snareStyle:1, bassStyle:1, hihatStyle:1, fillStyle:1, percStyle:1, vocalStyle:1, melodicStyle:1, drumStyle:1 },
  // 2: House Pulse — F2, dorian, 909 kick
  { root:87.3,  bassRoot:87.3,  kickRoot:65,  scale:DOR, kickStyle:2, snareStyle:2, bassStyle:2, hihatStyle:2, fillStyle:2, percStyle:2, vocalStyle:2, melodicStyle:2, drumStyle:2 },
  // 3: Lo-Fi Tape — D3, minor, vintage gentle
  { root:146.8, bassRoot:73.4,  kickRoot:55,  scale:MIN, kickStyle:3, snareStyle:3, bassStyle:3, hihatStyle:3, fillStyle:3, percStyle:3, vocalStyle:3, melodicStyle:3, drumStyle:3 },
  // 4: Techno — B2, phrygian, hard
  { root:123.5, bassRoot:62,    kickRoot:60,  scale:PHR, kickStyle:4, snareStyle:4, bassStyle:4, hihatStyle:0, fillStyle:4, percStyle:4, vocalStyle:4, melodicStyle:4, drumStyle:4 },
  // 5: Drum&Bass — E3, minor, punchy break
  { root:164.8, bassRoot:82.4,  kickRoot:65,  scale:MIN, kickStyle:5, snareStyle:5, bassStyle:5, hihatStyle:4, fillStyle:5, percStyle:5, vocalStyle:5, melodicStyle:5, drumStyle:5 },
  // 6: Ambient — C4, lydian, soft floating
  { root:261.6, bassRoot:130.8, kickRoot:80,  scale:LYD, kickStyle:6, snareStyle:6, bassStyle:6, hihatStyle:3, fillStyle:6, percStyle:6, vocalStyle:6, melodicStyle:6, drumStyle:6 },
  // 7: Industrial — F#2, phrygian, distorted/harsh
  { root:92.5,  bassRoot:92.5,  kickRoot:55,  scale:PHR, kickStyle:7, snareStyle:7, bassStyle:7, hihatStyle:1, fillStyle:7, percStyle:7, vocalStyle:7, melodicStyle:7, drumStyle:0 },
  // 8: Latin — G3, major, bombo kick, warm bass
  { root:196,   bassRoot:98,    kickRoot:75,  scale:MAJ, kickStyle:0, snareStyle:2, bassStyle:3, hihatStyle:2, fillStyle:0, percStyle:0, vocalStyle:0, melodicStyle:0, drumStyle:7 },
  // 9: Jazz — Bb3, dorian, brush/swing
  { root:233.1, bassRoot:116.5, kickRoot:65,  scale:DOR, kickStyle:1, snareStyle:3, bassStyle:4, hihatStyle:3, fillStyle:1, percStyle:1, vocalStyle:1, melodicStyle:1, drumStyle:3 },
  // 10: Funk — Ab3, mixolydian, slap bass
  { root:207.7, bassRoot:103.8, kickRoot:80,  scale:MIX, kickStyle:2, snareStyle:4, bassStyle:5, hihatStyle:2, fillStyle:2, percStyle:2, vocalStyle:2, melodicStyle:2, drumStyle:2 },
  // 11: K-Pop — A3, major, bright punchy
  { root:220,   bassRoot:110,   kickRoot:80,  scale:MAJ, kickStyle:3, snareStyle:5, bassStyle:6, hihatStyle:0, fillStyle:3, percStyle:3, vocalStyle:3, melodicStyle:3, drumStyle:1 },
  // 12: Phonk — C3, blues, Memphis 808
  { root:130.8, bassRoot:65.4,  kickRoot:60,  scale:BLS, kickStyle:4, snareStyle:6, bassStyle:7, hihatStyle:5, fillStyle:4, percStyle:4, vocalStyle:4, melodicStyle:4, drumStyle:3 },
  // 13: Hardstyle — C#3, minor, reverse/hard
  { root:138.6, bassRoot:69.3,  kickRoot:55,  scale:MIN, kickStyle:5, snareStyle:7, bassStyle:0, hihatStyle:4, fillStyle:5, percStyle:5, vocalStyle:5, melodicStyle:5, drumStyle:4 },
  // 14: Cinematic — Eb3, minor, orchestral
  { root:155.6, bassRoot:77.8,  kickRoot:65,  scale:MIN, kickStyle:6, snareStyle:0, bassStyle:1, hihatStyle:3, fillStyle:6, percStyle:6, vocalStyle:6, melodicStyle:6, drumStyle:6 },
  // 15: 432Hz Heal — A@432Hz, pentatonic major, healing
  { root:216,   bassRoot:108,   kickRoot:72,  scale:PNJ, kickStyle:7, snareStyle:1, bassStyle:2, hihatStyle:3, fillStyle:7, percStyle:7, vocalStyle:7, melodicStyle:7, drumStyle:6 },
  // 16: SoundFX Goofy — C5, chromatic, cartoon
  { root:523.2, bassRoot:261.6, kickRoot:130, scale:CHR, kickStyle:0, snareStyle:4, bassStyle:3, hihatStyle:5, fillStyle:0, percStyle:0, vocalStyle:0, melodicStyle:0, drumStyle:7 },
  // 17: 1930s Vintage — F3, major, swing jazz
  { root:174.6, bassRoot:87.3,  kickRoot:75,  scale:MAJ, kickStyle:1, snareStyle:5, bassStyle:4, hihatStyle:3, fillStyle:1, percStyle:1, vocalStyle:1, melodicStyle:1, drumStyle:3 },
  // 18: Nature Sounds — D4, pentatonic major, organic
  { root:293.7, bassRoot:130.8, kickRoot:90,  scale:PNJ, kickStyle:2, snareStyle:6, bassStyle:5, hihatStyle:5, fillStyle:2, percStyle:2, vocalStyle:2, melodicStyle:2, drumStyle:5 },
  // 19: Chiptune 8-bit — A4=440, major, square wave digital
  { root:440,   bassRoot:220,   kickRoot:110, scale:MAJ, kickStyle:3, snareStyle:7, bassStyle:6, hihatStyle:0, fillStyle:3, percStyle:3, vocalStyle:3, melodicStyle:3, drumStyle:1 },
  // 20: Vaporwave — B3, major, smooth vintage
  { root:246.9, bassRoot:123.5, kickRoot:70,  scale:MAJ, kickStyle:4, snareStyle:0, bassStyle:7, hihatStyle:3, fillStyle:4, percStyle:4, vocalStyle:4, melodicStyle:4, drumStyle:3 },
  // 21: Tribal Drums — G2=98, pentatonic minor, membranes
  { root:98,    bassRoot:98,    kickRoot:65,  scale:PNM, kickStyle:5, snareStyle:1, bassStyle:0, hihatStyle:5, fillStyle:5, percStyle:5, vocalStyle:5, melodicStyle:5, drumStyle:7 },
  // 22: Bossa Nova — F#3=185, major, nylon/warm
  { root:185,   bassRoot:92.5,  kickRoot:60,  scale:MAJ, kickStyle:6, snareStyle:2, bassStyle:1, hihatStyle:3, fillStyle:6, percStyle:6, vocalStyle:6, melodicStyle:6, drumStyle:3 },
  // 23: Synthwave 80s — C3 (diff from Phonk—same root, diff everything else), minor, Moog
  { root:130.8, bassRoot:65.4,  kickRoot:65,  scale:MIN, kickStyle:7, snareStyle:3, bassStyle:2, hihatStyle:0, fillStyle:7, percStyle:7, vocalStyle:7, melodicStyle:7, drumStyle:1 },
  // 24: Grime UK — E3, minor, digital sub
  { root:164.8, bassRoot:82.4,  kickRoot:65,  scale:MIN, kickStyle:0, snareStyle:6, bassStyle:3, hihatStyle:1, fillStyle:0, percStyle:0, vocalStyle:0, melodicStyle:7, drumStyle:0 },
  // 25: Reggaeton — F3, minor, dembow
  { root:174.6, bassRoot:87.3,  kickRoot:75,  scale:MIN, kickStyle:1, snareStyle:7, bassStyle:4, hihatStyle:2, fillStyle:1, percStyle:1, vocalStyle:1, melodicStyle:1, drumStyle:2 },
  // 26: Math Rock — E3, lydian, dry/angular
  { root:164.8, bassRoot:82.4,  kickRoot:65,  scale:LYD, kickStyle:2, snareStyle:0, bassStyle:5, hihatStyle:4, fillStyle:2, percStyle:2, vocalStyle:2, melodicStyle:2, drumStyle:5 },
]

// ─── KICK SYNTHESIS ─────────────────────────────────────────────────────────
// 8 architecturally distinct kick types, each tuned to persona.kickRoot
// v = localPadIdx (0 = standard, 1 = variant with diff decay/character)
async function synthKick(p: Persona, presetIdx: number, v: number): Promise<AudioBuffer> {
  const kr = p.kickRoot
  const ks = p.kickStyle
  const depth = 0.85 + (presetIdx % 4) * 0.04  // slight variation per preset group
  const vd = v * 0.12  // v adds variation to duration

  if (ks === 0) {
    // 808 Sub-bass: deep sine sweep, long decay, no click. Used by Dubstep, Latin, Grime, SoundFX
    const startHz = kr * (4 + v * 1.2)
    const endHz = kr * (1 + v * 0.08)
    const dur = (0.65 + vd) * depth
    const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sine'
    osc.frequency.setValueAtTime(startHz, 0)
    osc.frequency.exponentialRampToValueAtTime(endHz, 0.05 + v * 0.01)
    const g = o.createGain()
    g.gain.setValueAtTime(0.0, 0)
    g.gain.linearRampToValueAtTime(0.9, 0.003)
    g.gain.exponentialRampToValueAtTime(0.001, dur - 0.02)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }

  if (ks === 1) {
    // Trap 808: sub-bass sustained note with triangle click. Trap Soul, Jazz, 1930s, Reggaeton
    const noteHz = kr * (1 + v * 0.19)  // v=1 goes up a minor third
    const dur = (0.85 + vd + presetIdx * 0.005) * depth
    const o = _off(dur)
    // Click transient
    const click = o.createOscillator(); click.type = 'triangle'; click.frequency.value = noteHz * 3.5
    const cg = o.createGain(); cg.gain.setValueAtTime(0.35 - v * 0.05, 0); cg.gain.exponentialRampToValueAtTime(0.001, 0.025)
    click.connect(cg); cg.connect(o.destination); click.start(0); click.stop(0.03)
    // Sub tone — stays pitched (trap 808 note)
    const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = noteHz
    const g = o.createGain()
    g.gain.setValueAtTime(0.0, 0)
    g.gain.linearRampToValueAtTime(0.85, 0.005)
    g.gain.exponentialRampToValueAtTime(0.001, dur - 0.02)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }

  if (ks === 2) {
    // House 909 / Funky: click noise burst + tight sine sweep. House, Funk, Nature, Math Rock
    const dur = (0.28 + vd) * depth
    const o = _off(dur)
    const ns = _noise(o, 0.009)
    const hpN = o.createBiquadFilter(); hpN.type = 'highpass'; hpN.frequency.value = 1200 + v * 400
    const ng = o.createGain(); ng.gain.setValueAtTime(0.55 + v * 0.05, 0); ng.gain.exponentialRampToValueAtTime(0.001, 0.009)
    ns.connect(hpN); hpN.connect(ng); ng.connect(o.destination); ns.start(0); ns.stop(0.012)
    const osc = o.createOscillator(); osc.type = 'sine'
    osc.frequency.setValueAtTime(kr * (3.5 - v * 0.5), 0); osc.frequency.exponentialRampToValueAtTime(kr, 0.05 - v * 0.01)
    const g = o.createGain(); g.gain.setValueAtTime(0.8, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }

  if (ks === 3) {
    // Vintage / Lo-Fi tape: sine + 2nd harmonic, gentle tape decay. Lo-Fi, K-Pop, Chiptune→square
    const dur = (0.45 + vd) * depth
    const o = _off(dur)
    const f0 = kr * (1 + v * 0.12)
    // Primary sine
    const osc = o.createOscillator(); osc.type = 'sine'
    osc.frequency.setValueAtTime(f0 * 2.5, 0); osc.frequency.exponentialRampToValueAtTime(f0, 0.04)
    const g = o.createGain(); g.gain.setValueAtTime(0.75, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    // Harmonic layer at 2x
    const osc2 = o.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = f0 * 2
    const g2 = o.createGain(); g2.gain.setValueAtTime(0.2, 0); g2.gain.exponentialRampToValueAtTime(0.001, dur * 0.45)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    osc2.connect(g2); g2.connect(o.destination); osc2.start(0); osc2.stop(dur * 0.5)
    return o.startRendering()
  }

  if (ks === 4) {
    // Hard Techno / Distorted: clipped sine, punchy. Techno, Phonk, Vaporwave
    const dur = (0.22 + vd * 0.6) * depth
    const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sine'
    osc.frequency.setValueAtTime(kr * (5 + v), 0); osc.frequency.exponentialRampToValueAtTime(kr, 0.03)
    const ws = _ws(o, 25 + v * 8)
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2500
    const g = o.createGain(); g.gain.setValueAtTime(0.85, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    osc.connect(ws); ws.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }

  if (ks === 5) {
    // D&B / Hardstyle Punchy: fast attack, tight crisp decay. DnB, Hardstyle, Tribal
    const dur = (0.3 + vd) * depth
    const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sine'
    osc.frequency.setValueAtTime(kr * 4.5, 0); osc.frequency.exponentialRampToValueAtTime(kr, 0.025 + v * 0.005)
    const g = o.createGain(); g.gain.setValueAtTime(0.88, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    // Small noise click
    const ns = _noise(o, 0.006)
    const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2000
    const ng = o.createGain(); ng.gain.setValueAtTime(0.3, 0); ng.gain.exponentialRampToValueAtTime(0.001, 0.006)
    ns.connect(hp); hp.connect(ng); ng.connect(o.destination); ns.start(0); ns.stop(0.008)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }

  if (ks === 6) {
    // Soft / Ambient / Cinematic: gentle sine, lowpass warmth. Ambient, Cinematic, Bossa Nova
    const dur = (0.5 + vd + v * 0.1) * depth
    const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sine'
    osc.frequency.setValueAtTime(kr * 2.2, 0); osc.frequency.exponentialRampToValueAtTime(kr, 0.07 + v * 0.02)
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500 + v * 120
    const g = o.createGain()
    g.gain.setValueAtTime(0.0, 0); g.gain.linearRampToValueAtTime(0.6 - v * 0.08, 0.008)
    g.gain.exponentialRampToValueAtTime(0.001, dur - 0.02)
    osc.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }

  // ks === 7: Industrial / Synthwave: sawtooth+distortion+noise layer. Industrial, 432Hz, Synthwave
  const dur = (0.33 + vd) * depth
  const o = _off(dur)
  const osc = o.createOscillator(); osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(kr * (3 + v), 0); osc.frequency.exponentialRampToValueAtTime(kr, 0.04)
  const ws = _ws(o, 45 + v * 10)
  const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800
  const g = o.createGain(); g.gain.setValueAtTime(0.7, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
  osc.connect(ws); ws.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
  // Metallic noise layer
  const ns = _noise(o, dur * 0.4)
  const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3500
  const ng = o.createGain(); ng.gain.setValueAtTime(0.25 + v * 0.05, 0); ng.gain.exponentialRampToValueAtTime(0.001, dur * 0.35)
  ns.connect(hp); hp.connect(ng); ng.connect(o.destination); ns.start(0); ns.stop(dur * 0.42)
  return o.startRendering()
}

// ─── SNARE SYNTHESIS ────────────────────────────────────────────────────────
async function synthSnare(p: Persona, presetIdx: number, v: number): Promise<AudioBuffer> {
  const ks = p.snareStyle
  const depth = 0.8 + (presetIdx % 5) * 0.04

  if (ks === 0) {
    // Electronic crack: noise + pitched sine, tight HPF. Dubstep, Cinematic, Vaporwave, Grime, Math Rock
    const dur = (0.18 + v * 0.06) * depth
    const o = _off(dur)
    const ns = _noise(o, dur)
    const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1500 + v * 300
    const ng = o.createGain(); ng.gain.setValueAtTime(0.6 + v * 0.1, 0); ng.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    ns.connect(hp); hp.connect(ng); ng.connect(o.destination); ns.start(0); ns.stop(dur)
    const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = 200 + v * 50 + presetIdx * 8
    const og = o.createGain(); og.gain.setValueAtTime(0.4, 0); og.gain.exponentialRampToValueAtTime(0.001, dur * 0.5)
    osc.connect(og); og.connect(o.destination); osc.start(0); osc.stop(dur * 0.55)
    return o.startRendering()
  }

  if (ks === 1) {
    // Clap stack: 3 staggered noise bursts. Trap, 432Hz, Tribal, Reggaeton
    const dur = (0.22 + v * 0.05) * depth
    const o = _off(dur)
    const delays = [0, 0.008, 0.018].map(d => d + v * 0.003)
    delays.forEach((delay, i) => {
      const ns = _noise(o, 0.05 - i * 0.01)
      const bp = o.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800 + i * 300 + presetIdx * 10; bp.Q.value = 1.2
      const g = o.createGain()
      g.gain.setValueAtTime(0, delay); g.gain.linearRampToValueAtTime(0.55 + i * 0.05, delay + 0.002)
      g.gain.exponentialRampToValueAtTime(0.001, delay + 0.06)
      ns.connect(bp); bp.connect(g); g.connect(o.destination); ns.start(delay); ns.stop(delay + 0.07)
    })
    return o.startRendering()
  }

  if (ks === 2) {
    // Snap / House snap: short tight noise hit. House, Latin, Funk, Bossa Nova, Math Rock
    const dur = (0.12 + v * 0.04) * depth
    const o = _off(dur)
    const ns = _noise(o, dur)
    const bp = o.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2500 + v * 500 + presetIdx * 5; bp.Q.value = 1.5
    const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1200
    const g = o.createGain(); g.gain.setValueAtTime(0.7 + v * 0.08, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.005)
    ns.connect(bp); bp.connect(hp); hp.connect(g); g.connect(o.destination); ns.start(0); ns.stop(dur)
    return o.startRendering()
  }

  if (ks === 3) {
    // Brush / Lo-Fi: warm noise through bandpass, long whisper. Lo-Fi, Jazz, Synthwave, 1930s, Vaporwave
    const dur = (0.35 + v * 0.12) * depth
    const o = _off(dur)
    const ns = _noise(o, dur)
    const bp = o.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1200 + v * 200 + presetIdx * 4; bp.Q.value = 1
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 6000
    const g = o.createGain()
    g.gain.setValueAtTime(0, 0); g.gain.linearRampToValueAtTime(0.35 + v * 0.05, 0.01)
    g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    ns.connect(bp); bp.connect(lp); lp.connect(g); g.connect(o.destination); ns.start(0); ns.stop(dur)
    return o.startRendering()
  }

  if (ks === 4) {
    // Rimshot: short metallic click + decay. Techno, Funk, SoundFX Goofy, 1930s Vintage
    const dur = (0.14 + v * 0.04) * depth
    const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'triangle'; osc.frequency.value = 400 + v * 100 + presetIdx * 6
    const og = o.createGain(); og.gain.setValueAtTime(0.65, 0); og.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    osc.connect(og); og.connect(o.destination); osc.start(0); osc.stop(dur)
    const ns = _noise(o, dur * 0.5)
    const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3000
    const ng = o.createGain(); ng.gain.setValueAtTime(0.4, 0); ng.gain.exponentialRampToValueAtTime(0.001, dur * 0.45)
    ns.connect(hp); hp.connect(ng); ng.connect(o.destination); ns.start(0); ns.stop(dur * 0.52)
    return o.startRendering()
  }

  if (ks === 5) {
    // Ghost / D&B snare: layered noise, airy. D&B, K-Pop, Hardstyle, Tribal
    const dur = (0.2 + v * 0.06) * depth
    const o = _off(dur)
    // Noise body
    const ns = _noise(o, dur)
    const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900 + v * 200
    const ng = o.createGain(); ng.gain.setValueAtTime(0.5, 0); ng.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    ns.connect(hp); hp.connect(ng); ng.connect(o.destination); ns.start(0); ns.stop(dur)
    // Pitch content
    const osc = o.createOscillator(); osc.type = 'triangle'; osc.frequency.value = 250 + v * 40 + presetIdx * 5
    const og = o.createGain(); og.gain.setValueAtTime(0.35, 0); og.gain.exponentialRampToValueAtTime(0.001, dur * 0.6)
    osc.connect(og); og.connect(o.destination); osc.start(0); osc.stop(dur * 0.65)
    return o.startRendering()
  }

  if (ks === 6) {
    // Ambient / soft: barely there, more noise than snap. Ambient, Phonk, Nature, Cinematic→alt
    const dur = (0.28 + v * 0.1) * depth
    const o = _off(dur)
    const ns = _noise(o, dur)
    const bp = o.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2000 + v * 400; bp.Q.value = 0.8
    const g = o.createGain()
    g.gain.setValueAtTime(0, 0); g.gain.linearRampToValueAtTime(0.28 + v * 0.04, 0.005)
    g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    ns.connect(bp); bp.connect(g); g.connect(o.destination); ns.start(0); ns.stop(dur)
    return o.startRendering()
  }

  // ks === 7: Industrial / Hardstyle: distorted noise, harsh. Industrial, Hardstyle, 15, Reggaeton
  const dur = (0.18 + v * 0.05) * depth
  const o = _off(dur)
  const ns = _noise(o, dur)
  const ws = _ws(o, 30 + v * 10)
  const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 800 + v * 200
  const g = o.createGain(); g.gain.setValueAtTime(0.7, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
  ns.connect(ws); ws.connect(hp); hp.connect(g); g.connect(o.destination); ns.start(0); ns.stop(dur)
  // Low thud
  const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = 120 + presetIdx * 3 + v * 15
  const og = o.createGain(); og.gain.setValueAtTime(0.4, 0); og.gain.exponentialRampToValueAtTime(0.001, dur * 0.4)
  osc.connect(og); og.connect(o.destination); osc.start(0); osc.stop(dur * 0.45)
  return o.startRendering()
}

// ─── HIHAT SYNTHESIS ────────────────────────────────────────────────────────
// Properly filtered — HPF at 2500-4500Hz (NOT 6000Hz) so harmonics are audible
async function synthHihat(p: Persona, presetIdx: number, v: number): Promise<AudioBuffer> {
  const ks = p.hihatStyle

  // Inharmonic frequency set per preset — this is what makes metallic sound different per preset
  // Base set scales with presetIdx so every preset has a truly unique timbre
  const baseFreq = 300 + presetIdx * 40 + v * 80
  const freqRatios = [1, 1.43, 2.08, 2.91, 4.12, 5.81]

  if (ks === 0) {
    // Tight closed: 6 inharmonic oscs, short decay. Dubstep, Techno, K-Pop, Chiptune, Synthwave
    const dur = 0.06 + v * 0.03
    const o = _off(dur)
    freqRatios.forEach((r, i) => {
      const osc = o.createOscillator(); osc.type = 'square'
      osc.frequency.value = baseFreq * r
      const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2500
      const g = o.createGain(); g.gain.setValueAtTime(0.12, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.003)
      osc.connect(hp); hp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    })
    return o.startRendering()
  }

  if (ks === 1) {
    // Metallic open: 5 inharmonic oscs, longer decay. Industrial, Grime
    const dur = 0.28 + v * 0.18
    const o = _off(dur)
    const metalFreqs = [1, 1.62, 2.45, 3.58, 5.18]
    metalFreqs.forEach((r, i) => {
      const osc = o.createOscillator(); osc.type = 'sawtooth'
      osc.frequency.value = (baseFreq + presetIdx * 12) * r
      const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3000
      const g = o.createGain(); g.gain.setValueAtTime(0.1, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
      osc.connect(hp); hp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    })
    return o.startRendering()
  }

  if (ks === 2) {
    // Open house: longer metallic with HPF sweep. House, Funk, Latin, Reggaeton
    const dur = 0.38 + v * 0.22
    const o = _off(dur)
    freqRatios.forEach((r, i) => {
      const osc = o.createOscillator(); osc.type = 'square'
      osc.frequency.value = (baseFreq + i * 30) * r
      const hp = o.createBiquadFilter(); hp.type = 'highpass'
      hp.frequency.setValueAtTime(2000, 0); hp.frequency.exponentialRampToValueAtTime(4000, dur - 0.01)
      const g = o.createGain(); g.gain.setValueAtTime(0.1 - i * 0.01, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
      osc.connect(hp); hp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    })
    return o.startRendering()
  }

  if (ks === 3) {
    // Vintage / jazz / Lo-Fi: warm, lower HPF, slight noise. Lo-Fi, Ambient, Bossa, Jazz, 1930s, Vaporwave, Cinematic, 432Hz Heal
    const dur = 0.12 + v * 0.08
    const o = _off(dur)
    // Warmer metallic cluster
    const vintFreqs = [1, 1.38, 2.02, 2.92]
    vintFreqs.forEach((r, i) => {
      const osc = o.createOscillator(); osc.type = 'triangle'
      osc.frequency.value = (baseFreq * 0.85) * r
      const bp = o.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3000 + i * 400; bp.Q.value = 1.5
      const g = o.createGain(); g.gain.setValueAtTime(0.14, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.005)
      osc.connect(bp); bp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    })
    // Noise whisper
    const ns = _noise(o, dur)
    const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4000
    const ng = o.createGain(); ng.gain.setValueAtTime(0.06, 0); ng.gain.exponentialRampToValueAtTime(0.001, dur - 0.005)
    ns.connect(hp); hp.connect(ng); ng.connect(o.destination); ns.start(0); ns.stop(dur)
    return o.startRendering()
  }

  if (ks === 4) {
    // Ride-like chime: longer ring, brighter. D&B, Hardstyle, Math Rock
    const dur = 0.5 + v * 0.25
    const o = _off(dur)
    const rideFreqs = [1, 2.01, 3.08, 4.2, 5.55, 7.1]
    rideFreqs.forEach((r, i) => {
      const osc = o.createOscillator(); osc.type = 'sine'
      osc.frequency.value = (baseFreq * 1.5 + i * 40) * r
      const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4500
      const g = o.createGain(); g.gain.setValueAtTime(0.09, 0); g.gain.exponentialRampToValueAtTime(0.001, (dur - 0.01) * (1 - i * 0.08))
      osc.connect(hp); hp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    })
    return o.startRendering()
  }

  // ks === 5: Organic brush / noise-based: for Nature, Tribal, SoundFX, Phonk
  const dur = 0.09 + v * 0.06
  const o = _off(dur)
  const ns = _noise(o, dur)
  const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3500 + presetIdx * 50
  const bp = o.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 6000 + v * 500; bp.Q.value = 2
  const g = o.createGain()
  g.gain.setValueAtTime(0, 0); g.gain.linearRampToValueAtTime(0.45 + v * 0.05, 0.002)
  g.gain.exponentialRampToValueAtTime(0.001, dur - 0.003)
  ns.connect(hp); hp.connect(bp); bp.connect(g); g.connect(o.destination); ns.start(0); ns.stop(dur)
  return o.startRendering()
}

// ─── DRUM (tom / alternate percussion) ─────────────────────────────────────
async function synthDrum(p: Persona, presetIdx: number, v: number): Promise<AudioBuffer> {
  const ks = p.drumStyle
  const f0 = _st(p.root, -12) * (1 + v * 0.3)  // root - 1 octave, offset by v for second pad

  if (ks === 0) {
    // Floor tom: sine, low, long. Dubstep, Industrial, Grime
    const dur = 0.5 + v * 0.08; const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sine'
    osc.frequency.setValueAtTime(_clamp(f0 * 2, 60, 400), 0); osc.frequency.exponentialRampToValueAtTime(_clamp(f0, 55, 200), 0.06)
    const g = o.createGain(); g.gain.setValueAtTime(0.85, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (ks === 1) {
    // Mid tom + noise: sine burst + short noise texture. Trap, K-Pop, Chiptune, Reggaeton
    const dur = 0.35 + v * 0.06; const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sine'
    osc.frequency.setValueAtTime(_clamp(f0 * 2.2, 80, 500), 0); osc.frequency.exponentialRampToValueAtTime(_clamp(f0 * 1.1, 70, 250), 0.05)
    const g = o.createGain(); g.gain.setValueAtTime(0.8, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    const ns = _noise(o, 0.04); const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2000
    const ng = o.createGain(); ng.gain.setValueAtTime(0.25, 0); ng.gain.exponentialRampToValueAtTime(0.001, 0.04)
    ns.connect(hp); hp.connect(ng); ng.connect(o.destination); ns.start(0); ns.stop(0.05)
    return o.startRendering()
  }
  if (ks === 2) {
    // High tom: bright short sine. House, Funk, Math Rock
    const dur = 0.25 + v * 0.05; const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sine'
    osc.frequency.setValueAtTime(_clamp(f0 * 3, 150, 700), 0); osc.frequency.exponentialRampToValueAtTime(_clamp(f0 * 1.5, 100, 400), 0.04)
    const g = o.createGain(); g.gain.setValueAtTime(0.75, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (ks === 3) {
    // Bongo/conga: warm, multi-partial. Lo-Fi, Jazz, 1930s, Bossa Nova, Vaporwave
    const dur = 0.4 + v * 0.07; const o = _off(dur)
    ;[1.0, 1.5].forEach((r, i) => {
      const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = _clamp(f0 * r * 1.2, 100, 600)
      const g = o.createGain(); g.gain.setValueAtTime(i === 0 ? 0.7 : 0.3, 0); g.gain.exponentialRampToValueAtTime(0.001, dur * (i === 0 ? 1 : 0.6))
      osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    })
    return o.startRendering()
  }
  if (ks === 4) {
    // Electronic/Techno tom: distorted. Techno, Hardstyle
    const dur = 0.28 + v * 0.04; const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'square'
    osc.frequency.setValueAtTime(_clamp(f0 * 2.5, 120, 600), 0); osc.frequency.exponentialRampToValueAtTime(_clamp(f0, 80, 300), 0.05)
    const ws = _ws(o, 15)
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500
    const g = o.createGain(); g.gain.setValueAtTime(0.7, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    osc.connect(ws); ws.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (ks === 5) {
    // D&B / Math Rock dry: fast punchy tom. D&B, Nature, Math Rock
    const dur = 0.22 + v * 0.04; const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sine'
    osc.frequency.setValueAtTime(_clamp(f0 * 3.5, 150, 800), 0); osc.frequency.exponentialRampToValueAtTime(_clamp(f0 * 1.4, 100, 400), 0.03)
    const g = o.createGain(); g.gain.setValueAtTime(0.8, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
  if (ks === 6) {
    // Ambient/cinematic: pitched, long reverb tail via multiple partials. Ambient, Cinematic, 432Hz Heal, 1930s, Bossa Nova
    const dur = 0.7 + v * 0.15; const o = _off(dur)
    ;[1.0, 2.0, 3.0].forEach((r, i) => {
      const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = _clamp(f0 * r, 80, 1200)
      const g = o.createGain(); g.gain.setValueAtTime(0.5 / (i + 1), 0); g.gain.exponentialRampToValueAtTime(0.001, dur * (1 - i * 0.2))
      osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    })
    return o.startRendering()
  }
  // ks === 7: Latin conga / tribal: 4 partials at non-integer ratios. Latin, SoundFX, Tribal
  const dur = 0.38 + v * 0.07; const o = _off(dur)
  ;[1.0, 1.48, 2.37, 3.6].forEach((r, i) => {
    const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = _clamp(f0 * r, 80, 1500)
    const g = o.createGain(); g.gain.setValueAtTime(0.6 / (i + 1), 0); g.gain.exponentialRampToValueAtTime(0.001, dur * (1 - i * 0.15))
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
  })
  return o.startRendering()
}

// ─── BASS SYNTHESIS ─────────────────────────────────────────────────────────
// bassRoot is always ≥55Hz for audibility. 8 architecturally distinct bass types.
async function synthBass(p: Persona, presetIdx: number, v: number): Promise<AudioBuffer> {
  const br = p.bassRoot   // ≥55Hz
  const ks = p.bassStyle
  // For v=1, use the 5th of the scale (scale degree index 4 → usually 7 semitones up = 1.498x)
  const noteHz = v === 0 ? br : _st(br, p.scale[Math.min(2, p.scale.length - 1)])

  if (ks === 0) {
    // Sub bass 808-style: pure sine, long sustain. Dubstep, Hardstyle→alt, Tribal, Grime
    const dur = 1.2 + presetIdx * 0.01; const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = noteHz
    const g = o.createGain()
    _adsr(g, 0.01, 0.8, 0.05, 0.65, 0.45)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }

  if (ks === 1) {
    // Trap 808-style: sub sine, note held, slight FM growl at start. Trap, Cinematic, Bossa Nova
    const dur = 1.0 + presetIdx * 0.012; const o = _off(dur)
    const mod = o.createOscillator(); mod.type = 'sine'; mod.frequency.value = noteHz * 2
    const mGain = o.createGain()
    mGain.gain.setValueAtTime(noteHz * 2, 0); mGain.gain.exponentialRampToValueAtTime(0.5, 0.15)
    const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = noteHz
    mod.connect(mGain); mGain.connect(osc.frequency)
    const g = o.createGain(); _adsr(g, 0.005, 0.85, 0.05, 0.7, 0.3)
    osc.connect(g); g.connect(o.destination)
    mod.start(0); mod.stop(dur); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }

  if (ks === 2) {
    // House / Synthwave sawtooth: saw + lowpass. House, 432Hz, Synthwave
    const dur = 0.9 + presetIdx * 0.008; const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = noteHz
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700 + presetIdx * 15; lp.Q.value = 2
    const g = o.createGain(); _adsr(g, 0.008, 0.75, 0.1, 0.55, 0.25)
    osc.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }

  if (ks === 3) {
    // Pluck / Lo-Fi: Karplus-resonant bandpass. Lo-Fi, Latin, SoundFX, Grime
    const dur = 0.8 + presetIdx * 0.009; const o = _off(dur)
    const ns = _noise(o, 0.025)
    const bp = o.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = noteHz; bp.Q.value = 35 + presetIdx
    const g = o.createGain(); _adsr(g, 0.001, 0.85, 0.02, 0.5, dur - 0.06)
    ns.connect(bp); bp.connect(g); g.connect(o.destination); ns.start(0); ns.stop(0.028)
    return o.startRendering()
  }

  if (ks === 4) {
    // Acid 303 / Jazz: sawtooth + self-oscillating filter sweep. Techno, Jazz, 1930s, Reggaeton, Vaporwave→alt
    const dur = 0.75 + presetIdx * 0.007; const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = noteHz
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 8 + presetIdx % 5
    lp.frequency.setValueAtTime(2000 + presetIdx * 50, 0); lp.frequency.exponentialRampToValueAtTime(200 + presetIdx * 5, 0.18)
    const g = o.createGain(); _adsr(g, 0.006, 0.8, 0.05, 0.6, 0.15)
    osc.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }

  if (ks === 5) {
    // Slap / Funk / D&B: fast transient + resonant pluck. D&B, Funk, Nature, Math Rock, Reggaeton
    const dur = 0.85 + presetIdx * 0.008; const o = _off(dur)
    // Transient click
    const ns = _noise(o, 0.008)
    const bpT = o.createBiquadFilter(); bpT.type = 'bandpass'; bpT.frequency.value = noteHz * 4; bpT.Q.value = 5
    const ng = o.createGain(); ng.gain.setValueAtTime(0.5, 0); ng.gain.exponentialRampToValueAtTime(0.001, 0.008)
    ns.connect(bpT); bpT.connect(ng); ng.connect(o.destination); ns.start(0); ns.stop(0.01)
    // Resonant sine body
    const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = noteHz
    const bp = o.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = noteHz * 3; bp.Q.value = 15
    const g = o.createGain(); _adsr(g, 0.001, 0.75, 0.05, 0.4, 0.5)
    osc.connect(bp); bp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }

  if (ks === 6) {
    // Ambient pad bass: slow attack sawtooth with vibrato. Ambient, K-Pop, Chiptune
    const dur = 1.3 + presetIdx * 0.012; const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = noteHz
    // Vibrato LFO
    const lfo = o.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 5 + presetIdx * 0.15
    const lfoG = o.createGain(); lfoG.gain.value = noteHz * 0.01
    lfo.connect(lfoG); lfoG.connect(osc.frequency)
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500 + presetIdx * 10
    const g = o.createGain(); _adsr(g, 0.12, 0.65, 0.08, 0.5, 0.6)
    osc.connect(lp); lp.connect(g); g.connect(o.destination)
    lfo.start(0); lfo.stop(dur); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }

  // ks === 7: Industrial / Phonk distorted: sawtooth+waveshape. Industrial, Phonk
  const dur = 0.8 + presetIdx * 0.008; const o = _off(dur)
  const osc = o.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = noteHz
  const ws = _ws(o, 20 + presetIdx % 8 * 3)
  const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 800 + presetIdx * 12
  const g = o.createGain(); _adsr(g, 0.005, 0.65, 0.07, 0.45, 0.25)
  osc.connect(ws); ws.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
  return o.startRendering()
}

// ─── FILL SYNTHESIS ─────────────────────────────────────────────────────────
// All fills use genuine rhythmic/musical content — NO pure white noise
async function synthFill(p: Persona, presetIdx: number, v: number): Promise<AudioBuffer> {
  const ks = p.fillStyle
  const dur = 1.5 + v * 0.2

  if (ks === 0) {
    // Ascending tom fill: pitched hits sweeping up. Dubstep, Latin, Grime, SoundFX
    const o = _off(dur)
    const startF = _clamp(p.kickRoot * 1.5 + v * 30, 60, 300)
    ;[startF, startF * 1.5, startF * 2.2, startF * 3].forEach((f, i) => {
      const t = i * 0.15 + v * 0.03
      const osc = o.createOscillator(); osc.type = 'sine'
      osc.frequency.setValueAtTime(f * 2, t); osc.frequency.exponentialRampToValueAtTime(f, t + 0.04)
      const g = o.createGain()
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.65, t + 0.008)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.28)
      osc.connect(g); g.connect(o.destination); osc.start(t); osc.stop(t + 0.32)
    })
    return o.startRendering()
  }

  if (ks === 1) {
    // Snare roll: timed bursts with growing density. Trap, House, Jazz, 1930s, Chiptune, Reggaeton
    const o = _off(dur)
    const steps = 8 + v * 4 + (presetIdx % 4)
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * (dur - 0.05)
      const slen = 0.04 + (i / steps) * 0.02
      const ns = _noise(o, slen)
      const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1800 + presetIdx * 15 + v * 100
      const g = o.createGain()
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.3 + (i / steps) * 0.4, t + 0.003)
      g.gain.exponentialRampToValueAtTime(0.001, t + slen)
      ns.connect(hp); hp.connect(g); g.connect(o.destination); ns.start(t); ns.stop(t + slen + 0.005)
    }
    return o.startRendering()
  }

  if (ks === 2) {
    // Metallic crash swell: inharmonic partials growing then fading (NOT pure noise). House, Funk, Nature, Math Rock
    const o = _off(dur)
    const baseF = 500 + presetIdx * 30 + v * 40
    const ratios = [1, 1.43, 2.12, 2.98, 4.24, 5.86]
    ratios.forEach((r, i) => {
      const osc = o.createOscillator(); osc.type = 'sine'
      osc.frequency.value = baseF * r
      const g = o.createGain()
      g.gain.setValueAtTime(0.001, 0); g.gain.linearRampToValueAtTime(0.12 - i * 0.01, 0.06)
      g.gain.exponentialRampToValueAtTime(0.001, dur - 0.05)
      osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    })
    return o.startRendering()
  }

  if (ks === 3) {
    // Melodic descending fill: tuned hits from scale. Lo-Fi, Trap, Jazz, Nature, Vaporwave, Bossa Nova
    const o = _off(dur)
    const root = p.root
    const scaleNotes = p.scale.map(s => _st(root, s)).reverse()
    scaleNotes.slice(0, 5 + v).forEach((f, i) => {
      const t = i * 0.14 + v * 0.02
      const osc = o.createOscillator(); osc.type = 'sine'
      osc.frequency.setValueAtTime(f * 2, t); osc.frequency.exponentialRampToValueAtTime(f, t + 0.02)
      const g = o.createGain()
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.55, t + 0.005)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22)
      osc.connect(g); g.connect(o.destination); osc.start(t); osc.stop(t + 0.25)
    })
    return o.startRendering()
  }

  if (ks === 4) {
    // Kick fill: rapid kick hits with slight pitch variation. Techno, D&B, Hardstyle, K-Pop→alt, Phonk
    const o = _off(dur)
    const hitTimes = [0, 0.22, 0.38, 0.5, 0.62, 0.74, 0.83, 0.92].map(x => x * dur)
    hitTimes.forEach((t, i) => {
      const f = p.kickRoot * (1.2 - i * 0.02) * (1 + v * 0.05)
      const osc = o.createOscillator(); osc.type = 'sine'
      osc.frequency.setValueAtTime(f * 4, t); osc.frequency.exponentialRampToValueAtTime(f, t + 0.04)
      const g = o.createGain()
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.65 + i * 0.02, t + 0.003)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
      osc.connect(g); g.connect(o.destination); osc.start(t); osc.stop(t + 0.2)
    })
    return o.startRendering()
  }

  if (ks === 5) {
    // D&B breakbeat fill: fast offset snare+kick patterns. D&B, Hardstyle, Tribal
    const o = _off(dur)
    // Quick kicks
    ;[0, 0.35, 0.5, 0.65].forEach((x, i) => {
      const t = x * dur + v * 0.02
      const osc = o.createOscillator(); osc.type = 'sine'
      osc.frequency.setValueAtTime(p.kickRoot * 4, t); osc.frequency.exponentialRampToValueAtTime(p.kickRoot, t + 0.04)
      const g = o.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.7, t + 0.003); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
      osc.connect(g); g.connect(o.destination); osc.start(t); osc.stop(t + 0.18)
    })
    // Quick snares
    ;[0.17, 0.4, 0.57, 0.75, 0.9].forEach((x, i) => {
      const t = x * dur + v * 0.01
      const ns = _noise(o, 0.04)
      const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1600
      const g = o.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.45, t + 0.003); g.gain.exponentialRampToValueAtTime(0.001, t + 0.04)
      ns.connect(hp); hp.connect(g); g.connect(o.destination); ns.start(t); ns.stop(t + 0.045)
    })
    return o.startRendering()
  }

  if (ks === 6) {
    // Orchestral/Ambient timpani sweep: pitched hits with long tails. Ambient, Cinematic, 432Hz
    const o = _off(dur)
    const timps = [p.kickRoot * 1.5, p.kickRoot * 2, p.kickRoot * 1.2, p.kickRoot * 2.5]
    timps.forEach((f, i) => {
      const t = i * 0.22 + v * 0.05
      ;[1.0, 1.8, 2.7].forEach((r, j) => {
        const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = f * r
        const g = o.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.4 / (j + 1), t + 0.015)
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.4 - j * 0.1)
        osc.connect(g); g.connect(o.destination); osc.start(t); osc.stop(t + 0.5)
      })
    })
    return o.startRendering()
  }

  // ks === 7: Industrial/Synthwave/432Hz complex: metallic sequence with pitched tones. Industrial, 432Hz, Synthwave
  const o = _off(dur)
  const scale = p.scale
  const pitches = scale.slice(0, 6).map(s => _st(p.root * 0.5, s))
  pitches.forEach((f, i) => {
    const t = i * (dur / pitches.length)
    const osc = o.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = f
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1200 + presetIdx * 20
    const g = o.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.4 + v * 0.05, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22)
    osc.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(t); osc.stop(t + 0.25)
  })
  return o.startRendering()
}

// ─── PERCUSSION ─────────────────────────────────────────────────────────────
async function synthPercussion(p: Persona, presetIdx: number, v: number): Promise<AudioBuffer> {
  const ks = p.percStyle
  const dur = 1.2 + v * 0.2

  if (ks === 0) {
    // Industrial shaker: noise + comb-like HPF, looped. Dubstep, Latin, Grime, SoundFX
    const o = _off(dur)
    const steps = 8 + v * 4
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * (dur - 0.05)
      const ns = _noise(o, 0.07); const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 5000 + presetIdx * 40
      const g = o.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.25, t + 0.003); g.gain.exponentialRampToValueAtTime(0.001, t + 0.07)
      ns.connect(hp); hp.connect(g); g.connect(o.destination); ns.start(t); ns.stop(t + 0.075)
    }
    return o.startRendering()
  }

  if (ks === 1) {
    // Cowbell / electronic: triangle waves with tight decay. Trap, K-Pop, Chiptune
    const o = _off(dur)
    const cbF = _st(p.root, 7)  // cowbell pitch from scale
    const steps = 6 + v * 4
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * (dur - 0.05)
      ;[1.0, 1.505].forEach(r => {
        const osc = o.createOscillator(); osc.type = 'square'; osc.frequency.value = cbF * r
        const g = o.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.18, t + 0.001); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06 + v * 0.01)
        osc.connect(g); g.connect(o.destination); osc.start(t); osc.stop(t + 0.08)
      })
    }
    return o.startRendering()
  }

  if (ks === 2) {
    // Shaker organic: filtered noise with groove. House, Funk, Nature, Math Rock
    const o = _off(dur)
    const shakeF = 6000 + presetIdx * 50 + v * 200
    const steps = 16 + v * 8
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * (dur - 0.03)
      const vel = 0.15 + (i % 4 === 0 ? 0.1 : 0)
      const ns = _noise(o, 0.03); const bp = o.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = shakeF + i * 20; bp.Q.value = 3
      const g = o.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + 0.002); g.gain.exponentialRampToValueAtTime(0.001, t + 0.03)
      ns.connect(bp); bp.connect(g); g.connect(o.destination); ns.start(t); ns.stop(t + 0.035)
    }
    return o.startRendering()
  }

  if (ks === 3) {
    // Jazz/swing rim hits: triangle clicks on a swung grid. Lo-Fi, Jazz, 1930s
    const o = _off(dur)
    const rimF = 400 + presetIdx * 10 + v * 50
    const swings = [0, 0.25, 0.5, 0.75].map(x => x + (x % 0.5 === 0.25 ? 0.03 + v * 0.01 : 0))  // slight swing
    swings.forEach((x, i) => {
      const t = x * dur
      const osc = o.createOscillator(); osc.type = 'triangle'; osc.frequency.value = rimF + i * 20
      const g = o.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.45, t + 0.002); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05)
      osc.connect(g); g.connect(o.destination); osc.start(t); osc.stop(t + 0.06)
    })
    return o.startRendering()
  }

  if (ks === 4) {
    // Electronic/techno sequence: fast high-pitched pulses. Techno, Hardstyle, Phonk
    const o = _off(dur)
    const steps = 12 + v * 4
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * (dur - 0.04)
      const osc = o.createOscillator(); osc.type = 'square'; osc.frequency.value = 800 + i * 80 + presetIdx * 20 + v * 40
      const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3000
      const g = o.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.15, t + 0.001); g.gain.exponentialRampToValueAtTime(0.001, t + 0.04)
      osc.connect(hp); hp.connect(g); g.connect(o.destination); osc.start(t); osc.stop(t + 0.045)
    }
    return o.startRendering()
  }

  if (ks === 5) {
    // D&B/jungle: rapid hi-pitched noise bursts. D&B, Tribal
    const o = _off(dur)
    const steps = 16 + v * 8
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * (dur - 0.03)
      const ns = _noise(o, 0.025); const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4000 + i * 30 + presetIdx * 15
      const g = o.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.2 + (i % 8 === 0 ? 0.1 : 0), t + 0.002); g.gain.exponentialRampToValueAtTime(0.001, t + 0.025)
      ns.connect(hp); hp.connect(g); g.connect(o.destination); ns.start(t); ns.stop(t + 0.03)
    }
    return o.startRendering()
  }

  if (ks === 6) {
    // Ambient / cinematic: tuned metallic percussive hits. Ambient, Cinematic, 432Hz
    const o = _off(dur)
    const scale = p.scale.map(s => _st(p.root, s))
    scale.slice(0, 4 + v).forEach((f, i) => {
      const t = i * (dur / (4 + v))
      ;[1.0, 2.76].forEach(r => {
        const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = f * r
        const g = o.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.35 * (r === 1 ? 1 : 0.4), t + 0.005)
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
        osc.connect(g); g.connect(o.destination); osc.start(t); osc.stop(t + 0.4)
      })
    })
    return o.startRendering()
  }

  // ks === 7: Industrial: random-pitched metallic clicks. Industrial, 15, Synthwave
  const o = _off(dur)
  const steps = 10 + v * 4
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * (dur - 0.04)
    const osc = o.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = 200 + Math.sin(i * 1.732) * 150 + presetIdx * 8
    const ws = _ws(o, 20)
    const hp = o.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2000
    const g = o.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.2, t + 0.002); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
    osc.connect(ws); ws.connect(hp); hp.connect(g); g.connect(o.destination); osc.start(t); osc.stop(t + 0.07)
  }
  return o.startRendering()
}

// ─── VOCAL SYNTHESIS ────────────────────────────────────────────────────────
// Formant-based vowel synthesis for authentic vocal character
async function synthVocal(p: Persona, presetIdx: number, v: number): Promise<AudioBuffer> {
  const ks = p.vocalStyle
  // Vowel formants: F1, F2, F3 for various vowels
  const vowels = [
    [800, 1200, 2400],  // 'ah'
    [270, 2300, 3000],  // 'ee'
    [300, 870, 2240],   // 'oo'
    [660, 1700, 2400],  // 'ay'
    [520, 1190, 2390],  // 'eh'
    [450, 800, 2830],   // 'oh'
  ]
  const vowelIdx = (ks + v + presetIdx) % 6
  const [f1, f2, f3] = vowels[vowelIdx]
  const fundamental = _st(p.root, p.scale[v % p.scale.length])
  const dur = 1.0 + v * 0.2 + presetIdx * 0.01

  if (ks <= 2) {
    // Synthesized vowel: sawtooth through formant filters
    const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = fundamental
    const master = o.createGain(); _adsr(master, 0.05, 0.65, 0.1, 0.5, 0.35)
    ;[f1, f2, f3].forEach((ff, i) => {
      const bp = o.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = ff; bp.Q.value = 5 + i
      const g = o.createGain(); g.gain.value = 0.4 - i * 0.1
      osc.connect(bp); bp.connect(g); g.connect(master)
    })
    master.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }

  if (ks <= 4) {
    // Breathy: noise layer + formant. Ambient, 432Hz, Cinematic
    const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = fundamental
    const ns = _noise(o, dur)
    const master = o.createGain(); _adsr(master, 0.08, 0.5, 0.15, 0.4, 0.4)
    ;[f1, f2].forEach((ff, i) => {
      const bp = o.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = ff; bp.Q.value = 4
      const g = o.createGain(); g.gain.value = 0.35 - i * 0.1
      osc.connect(bp); bp.connect(g); g.connect(master)
    })
    const nbp = o.createBiquadFilter(); nbp.type = 'bandpass'; nbp.frequency.value = f1 * 1.2; nbp.Q.value = 3
    const ng = o.createGain(); ng.gain.value = 0.12
    ns.connect(nbp); nbp.connect(ng); ng.connect(master)
    master.connect(o.destination); osc.start(0); osc.stop(dur); ns.start(0); ns.stop(dur)
    return o.startRendering()
  }

  // ks 5-7: Robot/vocal chop: FM + formants
  const o = _off(dur)
  const mod = o.createOscillator(); mod.type = 'sine'; mod.frequency.value = fundamental * 1.5
  const mGain = o.createGain(); mGain.gain.value = fundamental * 2
  const osc = o.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = fundamental
  mod.connect(mGain); mGain.connect(osc.frequency)
  const master = o.createGain(); _adsr(master, 0.02, 0.6, 0.1, 0.45, 0.4)
  ;[f1, f2, f3].forEach((ff, i) => {
    const bp = o.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = ff * (1 + i * 0.1); bp.Q.value = 6
    const g = o.createGain(); g.gain.value = 0.35 - i * 0.08
    osc.connect(bp); bp.connect(g); g.connect(master)
  })
  master.connect(o.destination)
  mod.start(0); mod.stop(dur); osc.start(0); osc.stop(dur)
  return o.startRendering()
}

// ─── MELODIC SYNTHESIS ──────────────────────────────────────────────────────
// Used for: long, medium, short, chord, instrument
// v = localPadIdx → selects a different scale degree for harmonic variety
function _scaleNote(root: number, scale: number[], degreeIdx: number): number {
  const si = ((degreeIdx % scale.length) + scale.length) % scale.length
  const octave = Math.floor(degreeIdx / scale.length)
  return root * Math.pow(2, (scale[si] + 12 * octave) / 12)
}

async function synthMelodic(
  p: Persona, presetIdx: number, v: number,
  durBase: number, longMode: boolean
): Promise<AudioBuffer> {
  const ks = p.melodicStyle
  const noteFreq = _scaleNote(p.root, p.scale, v)
  const dur = durBase + presetIdx * 0.015

  if (ks === 0) {
    // Pad: slow attack sawtooth+lowpass. Dubstep, Latin, SoundFX, Grime
    const o = _off(dur)
    ;[1, 2, 3].forEach((harmonic, i) => {
      const osc = o.createOscillator(); osc.type = i === 0 ? 'sawtooth' : 'sine'
      osc.frequency.value = noteFreq * harmonic; osc.detune.value = i * 8
      const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 800 + harmonic * 200
      const g = o.createGain(); _adsr(g, 0.25, 0.5 / harmonic, 0.1, 0.35 / harmonic, 0.6)
      osc.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    })
    return o.startRendering()
  }

  if (ks === 1) {
    // Dreamy trap pad: detuned saws, minor/pentatonic lush. Trap, Jazz, 1930s, Reggaeton
    const o = _off(dur)
    ;[-8, 0, 8].forEach((det, i) => {
      const osc = o.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = noteFreq; osc.detune.value = det
      const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1200 - i * 100
      const g = o.createGain(); _adsr(g, 0.15, 0.3, 0.2, 0.22, 0.5)
      osc.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    })
    return o.startRendering()
  }

  if (ks === 2) {
    // House/funk chord stab: short sawtooth with bandpass and attack. House, Funk, Nature, Math Rock
    const o = _off(dur)
    // Slight chord voicing: root + third + fifth
    const chordIntervals = [0, longMode ? 4 : 3, 7]
    chordIntervals.forEach((semi, i) => {
      const f = _st(noteFreq, semi)
      const osc = o.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = f
      const bp = o.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f * 3; bp.Q.value = 2
      const g = o.createGain(); _adsr(g, 0.008, 0.4, 0.12, 0.25, 0.3)
      osc.connect(bp); bp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    })
    return o.startRendering()
  }

  if (ks === 3) {
    // Lo-Fi warm keys: triangle wave with HPF and slow decay. Lo-Fi, K-Pop, Chiptune, Vaporwave
    const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'triangle'; osc.frequency.value = noteFreq
    const osc2 = o.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = noteFreq * 2; osc2.detune.value = 5
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2000
    const g = o.createGain(); _adsr(g, 0.02, 0.6, 0.15, 0.4, 0.55)
    const g2 = o.createGain(); _adsr(g2, 0.015, 0.25, 0.1, 0.15, 0.4)
    osc.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    osc2.connect(g2); g2.connect(o.destination); osc2.start(0); osc2.stop(dur)
    return o.startRendering()
  }

  if (ks === 4) {
    // Techno/Industrial pluck: harsh attack, metallic ring. Techno, Phonk→alt, Vaporwave, 1930s→alt
    const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'square'; osc.frequency.value = noteFreq
    const ws = _ws(o, 8)
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500 + presetIdx * 20
    const g = o.createGain(); _adsr(g, 0.005, 0.55, 0.2, 0.25, 0.45)
    osc.connect(ws); ws.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }

  if (ks === 5) {
    // D&B / Reese: detuned sawtooths creating beating tones. D&B, Hardstyle→alt
    const o = _off(dur)
    ;[-6, 0, 6].forEach((det, i) => {
      const osc = o.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = noteFreq; osc.detune.value = det
      const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600 + i * 150
      const g = o.createGain(); _adsr(g, 0.03, 0.38, 0.15, 0.28, 0.5)
      osc.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    })
    return o.startRendering()
  }

  if (ks === 6) {
    // Ambient lyrical: slow FM sine pads. Ambient, Cinematic, Bossa Nova, 432Hz
    const o = _off(dur)
    const mod = o.createOscillator(); mod.type = 'sine'; mod.frequency.value = noteFreq * 0.5
    const mGain = o.createGain(); mGain.gain.value = noteFreq * 0.3
    const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = noteFreq
    mod.connect(mGain); mGain.connect(osc.frequency)
    // Second partial
    const osc2 = o.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = noteFreq * 2
    const g = o.createGain(); _adsr(g, 0.3, 0.55, 0.2, 0.42, 0.6)
    const g2 = o.createGain(); _adsr(g2, 0.35, 0.22, 0.2, 0.15, 0.55)
    osc.connect(g); g.connect(o.destination)
    osc2.connect(g2); g2.connect(o.destination)
    mod.start(0); mod.stop(dur); osc.start(0); osc.stop(dur); osc2.start(0); osc2.stop(dur)
    return o.startRendering()
  }

  // ks === 7: Industrial / Synthwave supersaw: 4 detuned saws. Industrial, 15, Synthwave
  const o = _off(dur)
  ;[-12, -4, 0, 4, 12].forEach((det, i) => {
    const osc = o.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = noteFreq; osc.detune.value = det
    const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1600 + presetIdx * 20
    const g = o.createGain(); _adsr(g, 0.04, 0.2, 0.15, 0.15, 0.45)
    osc.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
  })
  return o.startRendering()
}

// ─── MAIN EXPORT ────────────────────────────────────────────────────────────
/**
 * catalogSynth(presetIdx, localPadIdx, category)
 * Returns a uniquely synthesized AudioBuffer for the given preset+pad+category.
 * Every pad in every preset sounds genuinely different:
 * — different synthesis architecture (from PERSONAS[presetIdx].kickStyle etc.)
 * — different root frequency (PERSONAS[presetIdx].root / bassRoot / kickRoot)
 * — different scale/mode (PERSONAS[presetIdx].scale)
 * — different variation (localPadIdx selects a 2nd flavor within the preset)
 */
export async function catalogSynth(
  presetIdx: number,
  localPadIdx: number,
  category: string
): Promise<AudioBuffer> {
  const pidx = Math.max(0, Math.min(presetIdx, PERSONAS.length - 1))
  const p = PERSONAS[pidx]
  const v = Math.max(0, localPadIdx)

  try {
    switch (category) {
      case 'kick':
        return await synthKick(p, pidx, v % 2)

      case 'snare':
        return await synthSnare(p, pidx, v % 2)

      case 'hihat':
        return await synthHihat(p, pidx, v % 2)

      case 'drum':
        return await synthDrum(p, pidx, v % 2)

      case 'bass':
        return await synthBass(p, pidx, v % 2)

      case 'fill':
        return await synthFill(p, pidx, v % 2)

      case 'percussion':
        return await synthPercussion(p, pidx, v % 2)

      case 'vocal':
        return await synthVocal(p, pidx, v % 2)

      case 'long':
        // v=0,1,2 → scale degrees 0, 2, 4 (root, 3rd, 5th)
        return await synthMelodic(p, pidx, [0, 2, 4][v % 3], 2.5, true)

      case 'medium':
        // v=0,1,2 → scale degrees 1, 3, 5 (different from long)
        return await synthMelodic(p, pidx, [1, 3, 5][v % 3], 1.5, false)

      case 'short':
        // v=0,1,2 → scale degrees 4, 2, 6 (fifth, third, seventh)
        return await synthMelodic(p, pidx, [4, 2, 6][v % 3], 0.6, false)

      case 'chord': {
        // Chord: synthesize a 3-note stack
        const chordDegrees = [[0, 2, 4], [1, 3, 5], [3, 5, 0]][v % 3]
        const dur = 1.8 + pidx * 0.01
        const o = _off(dur)
        chordDegrees.forEach((deg, ci) => {
          const f = _scaleNote(p.root, p.scale, deg)
          const osc = o.createOscillator()
          osc.type = p.melodicStyle < 4 ? 'sawtooth' : p.melodicStyle < 6 ? 'triangle' : 'sine'
          osc.frequency.value = f; osc.detune.value = ci * 5
          const lp = o.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1200 + ci * 300
          const g = o.createGain(); _adsr(g, 0.04 + ci * 0.01, 0.35, 0.2, 0.25, 0.5)
          osc.connect(lp); lp.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
        })
        return o.startRendering()
      }

      case 'instrument': {
        // Instrument: v=0-3 picks scale degree 0,2,4,6 — one instrument voice per pad
        const deg = [0, 2, 4, 6][v % 4]
        return await synthMelodic(p, pidx, deg, 1.0, false)
      }

      default: {
        const dur = 0.5; const o = _off(dur)
        const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = p.root * (1 + v * 0.2)
        const g = o.createGain(); g.gain.setValueAtTime(0.5, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
        osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
        return o.startRendering()
      }
    }
  } catch (err) {
    console.warn('[catalogSynth] error in', category, 'preset', presetIdx, 'pad', localPadIdx, err)
    const dur = 0.3; const o = _off(dur)
    const osc = o.createOscillator(); osc.type = 'sine'; osc.frequency.value = 440
    const g = o.createGain(); g.gain.setValueAtTime(0.3, 0); g.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    osc.connect(g); g.connect(o.destination); osc.start(0); osc.stop(dur)
    return o.startRendering()
  }
}
