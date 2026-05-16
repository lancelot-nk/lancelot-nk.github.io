import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import {
  MicIcon,
  SquareIcon,
  PlayIcon,
  PauseIcon,
  ActivityIcon,
  RadioIcon,
  LayersIcon,
  SlidersHorizontalIcon,
  ShieldCheckIcon,
  CheckCircle2Icon,
  LoaderIcon,
  RefreshCwIcon,
  BrainIcon,
  FlaskConicalIcon,
  GitBranchIcon,
  MessageSquareIcon,
  VolumeXIcon,
  Volume2Icon,
  AudioWaveformIcon,
  WindIcon,
  ZapIcon,
  BoxIcon,
  SparklesIcon,
  ScanIcon,
  FlameIcon,
  RouteIcon,
  RotateCcwIcon,
  DropletIcon,
  StarIcon,
  CircleDotIcon,
  AtomIcon,
  WavesIcon,
  TrophyIcon,
  BarChart3Icon,
  CpuIcon,
  TargetIcon,
  ZapOffIcon,
  TableIcon,
  StopCircleIcon,
  BookOpenIcon,
  UploadIcon,
} from 'lucide-react'
/* =====================================================================
   VRACS v5 — Holistic Iterative Testing Machine
   Phase-by-phase choice machine + accuracy metrics + iterate-and-test-all
   ===================================================================== */
// =========================================================================
// CORE DSP
// =========================================================================
function fft(real: Float32Array, imag: Float32Array, inverse = false) {
  const n = real.length
  let j = 0
  for (let i = 1; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) {
      ;[real[i], real[j]] = [real[j], real[i]]
      ;[imag[i], imag[j]] = [imag[j], imag[i]]
    }
  }
  for (let size = 2; size <= n; size <<= 1) {
    const half = size >> 1
    const step = ((inverse ? 2 : -2) * Math.PI) / size
    for (let i = 0; i < n; i += size) {
      for (let k = 0; k < half; k++) {
        const a = step * k,
          c = Math.cos(a),
          s = Math.sin(a)
        const tre = real[i + k + half] * c - imag[i + k + half] * s
        const tim = real[i + k + half] * s + imag[i + k + half] * c
        real[i + k + half] = real[i + k] - tre
        imag[i + k + half] = imag[i + k] - tim
        real[i + k] += tre
        imag[i + k] += tim
      }
    }
  }
  if (inverse)
    for (let i = 0; i < n; i++) {
      real[i] /= n
      imag[i] /= n
    }
}
const nextPow2 = (n: number) => {
  let p = 1
  while (p < n) p <<= 1
  return p
}
function magnitudeSpectrum(s: Float32Array, size = 2048) {
  const N = size,
    re = new Float32Array(N),
    im = new Float32Array(N)
  const len = Math.min(s.length, N)
  for (let i = 0; i < len; i++)
    re[i] = s[i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1)))
  fft(re, im)
  const m = new Float32Array(N / 2)
  for (let i = 0; i < N / 2; i++)
    m[i] = Math.sqrt(re[i] * re[i] + im[i] * im[i])
  return m
}
function hilbertImag(samples: Float32Array): Float32Array {
  const N = nextPow2(samples.length)
  const re = new Float32Array(N),
    im = new Float32Array(N)
  for (let i = 0; i < samples.length; i++) re[i] = samples[i]
  fft(re, im)
  re[0] = 0
  im[0] = 0
  if (N / 2 < N) {
    re[N / 2] = 0
    im[N / 2] = 0
  }
  for (let i = 1; i < N / 2; i++) {
    re[i] *= 2
    im[i] *= 2
  }
  for (let i = N / 2 + 1; i < N; i++) {
    re[i] = 0
    im[i] = 0
  }
  fft(re, im, true)
  return im.slice(0, samples.length)
}
function detectPitch(buf: Float32Array, sr: number): number {
  const SIZE = Math.min(buf.length, 4096)
  let rms = 0
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i]
  rms = Math.sqrt(rms / SIZE)
  if (rms < 0.01) return 0
  let r1 = 0,
    r2 = SIZE - 1
  const th = 0.2
  for (let i = 0; i < SIZE / 2; i++)
    if (Math.abs(buf[i]) < th) {
      r1 = i
      break
    }
  for (let i = 1; i < SIZE / 2; i++)
    if (Math.abs(buf[SIZE - i]) < th) {
      r2 = SIZE - i
      break
    }
  const t = buf.slice(r1, r2)
  const c = new Float32Array(t.length)
  for (let i = 0; i < t.length; i++) {
    let s = 0
    for (let j = 0; j < t.length - i; j++) s += t[j] * t[j + i]
    c[i] = s
  }
  let d = 0
  while (d < c.length - 1 && c[d] > c[d + 1]) d++
  let mv = -1,
    mp = -1
  for (let i = d; i < c.length; i++)
    if (c[i] > mv) {
      mv = c[i]
      mp = i
    }
  if (mp <= 0) return 0
  const f = sr / mp
  return f < 60 || f > 500 ? 0 : f
}
async function processWithFilters(
  input: AudioBuffer,
  build: (ctx: OfflineAudioContext, src: AudioBufferSourceNode) => AudioNode,
) {
  const off = new OfflineAudioContext(1, input.length, input.sampleRate)
  const src = off.createBufferSource()
  src.buffer = input
  build(off, src).connect(off.destination)
  src.start()
  return off.startRendering()
}
function mapBuffer(
  input: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  fn: (x: number, i: number) => number,
) {
  const out = ctx.createBuffer(1, input.length, input.sampleRate)
  const a = input.getChannelData(0),
    b = out.getChannelData(0)
  for (let i = 0; i < a.length; i++) b[i] = fn(a[i], i)
  return out
}
function normalizeBuffer(
  input: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  target = 0.95,
) {
  const d = input.getChannelData(0)
  let p = 0
  for (let i = 0; i < d.length; i++) {
    const a = Math.abs(d[i])
    if (a > p) p = a
  }
  if (p < 1e-6) return input
  return mapBuffer(input, ctx, (x) => x * (target / p))
}
function sumBuffers(
  a: AudioBuffer,
  b: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  mA = 1,
  mB = 1,
) {
  const len = Math.max(a.length, b.length)
  const out = ctx.createBuffer(1, len, a.sampleRate)
  const aD = a.getChannelData(0),
    bD = b.getChannelData(0),
    oD = out.getChannelData(0)
  for (let i = 0; i < len; i++)
    oD[i] = (i < aD.length ? aD[i] * mA : 0) + (i < bD.length ? bD[i] * mB : 0)
  return out
}
function bufferFromArray(
  arr: Float32Array,
  sr: number,
  ctx: AudioContext | OfflineAudioContext,
) {
  const b = ctx.createBuffer(1, arr.length, sr)
  b.getChannelData(0).set(arr)
  return b
}
const phaseInvert = (b: AudioBuffer, c: AudioContext | OfflineAudioContext) =>
  mapBuffer(b, c, (x) => -x)
function softClipBuf(
  b: AudioBuffer,
  c: AudioContext | OfflineAudioContext,
  type: ClipType,
  k: number,
) {
  if (type === 'tanh') return mapBuffer(b, c, (x) => Math.tanh(x * (1 + k)))
  if (type === 'atan')
    return mapBuffer(b, c, (x) => Math.atan(x * (1 + k * 2)) / (Math.PI / 2))
  if (type === 'hard')
    return mapBuffer(b, c, (x) => Math.max(-1, Math.min(1, x * (1 + k))))
  if (type === 'cubic')
    return mapBuffer(b, c, (x) => {
      const v = x * (1 + k)
      return v - (v * v * v) / 3
    })
  if (type === 'wavefolder')
    return mapBuffer(b, c, (x) => Math.sin((x * (1 + k) * Math.PI) / 2))
  if (type === 'foldback')
    return mapBuffer(b, c, (x) => {
      let v = x * (1 + k)
      while (v > 1 || v < -1) {
        if (v > 1) v = 2 - v
        else if (v < -1) v = -2 - v
      }
      return v
    })
  if (type === 'norm-only') return mapBuffer(b, c, (x) => x)
  return mapBuffer(b, c, (x) => x / (1 + Math.abs(x) * k))
}
function getPeaks(buf: AudioBuffer, w: number) {
  const d = buf.getChannelData(0),
    step = Math.max(1, Math.floor(d.length / w))
  const ps: {
    min: number
    max: number
  }[] = []
  for (let i = 0; i < w; i++) {
    let mn = 1,
      mx = -1
    for (let j = i * step; j < Math.min((i + 1) * step, d.length); j++) {
      if (d[j] < mn) mn = d[j]
      if (d[j] > mx) mx = d[j]
    }
    ps.push({
      min: mn,
      max: mx,
    })
  }
  return ps
}
// =========================================================================
// LPC
// =========================================================================
function levinson(r: Float32Array, p: number) {
  const a = new Float32Array(p + 1)
  a[0] = 1
  let e = r[0]
  if (e <= 0)
    return {
      a,
      e: 1e-9,
    }
  for (let i = 1; i <= p; i++) {
    let k = -r[i]
    for (let j = 1; j < i; j++) k -= a[j] * r[i - j]
    k /= e
    const na = new Float32Array(p + 1)
    for (let j = 0; j <= p; j++) na[j] = a[j]
    na[i] = k
    for (let j = 1; j < i; j++) na[j] = a[j] + k * a[i - j]
    for (let j = 0; j <= p; j++) a[j] = na[j]
    e *= 1 - k * k
    if (e <= 0) {
      e = 1e-9
      break
    }
  }
  return {
    a,
    e,
  }
}
function autocorr(frame: Float32Array, p: number) {
  const r = new Float32Array(p + 1)
  for (let lag = 0; lag <= p; lag++) {
    let s = 0
    for (let i = 0; i < frame.length - lag; i++) s += frame[i] * frame[i + lag]
    r[lag] = s
  }
  return r
}
function lpcSynth(exc: Float32Array, a: Float32Array): Float32Array {
  const p = a.length - 1,
    out = new Float32Array(exc.length)
  for (let n = 0; n < exc.length; n++) {
    let y = exc[n]
    for (let k = 1; k <= p; k++) if (n - k >= 0) y -= a[k] * out[n - k]
    if (!isFinite(y) || Math.abs(y) > 50) y = 0
    out[n] = y
  }
  return out
}
function estimateFormants(
  a: Float32Array,
  sr: number,
  maxFreq = 4500,
  nPoints = 512,
): number[] {
  const env = new Float32Array(nPoints)
  for (let k = 0; k < nPoints; k++) {
    const w = (k / nPoints) * (maxFreq / (sr / 2)) * Math.PI
    let re = 1,
      im = 0
    for (let i = 1; i < a.length; i++) {
      re -= a[i] * Math.cos(i * w)
      im += a[i] * Math.sin(i * w)
    }
    env[k] = 1 / Math.sqrt(re * re + im * im + 1e-9)
  }
  const peaks: {
    f: number
    m: number
  }[] = []
  for (let k = 2; k < nPoints - 2; k++) {
    if (
      env[k] > env[k - 1] &&
      env[k] > env[k + 1] &&
      env[k] > env[k - 2] &&
      env[k] > env[k + 2]
    ) {
      peaks.push({
        f: (k * maxFreq) / nPoints,
        m: env[k],
      })
    }
  }
  peaks.sort((a, b) => b.m - a.m)
  return peaks
    .slice(0, 4)
    .map((p) => p.f)
    .sort((a, b) => a - b)
}
function detectGlobalFormants(x: Float32Array, sr: number): number[] {
  const start = Math.max(0, Math.floor(x.length / 2) - 1024)
  const len = Math.min(2048, x.length - start)
  if (len < 256) return [500, 1500, 2500]
  const frame = new Float32Array(len)
  for (let i = 0; i < len; i++)
    frame[i] =
      x[start + i] * (0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (len - 1)))
  const r = autocorr(frame, 14)
  const { a } = levinson(r, 14)
  const fm = estimateFormants(a, sr)
  while (fm.length < 3) fm.push(500 + fm.length * 1000)
  return fm
}
function zcr(frame: Float32Array): number {
  let z = 0
  for (let i = 1; i < frame.length; i++)
    if (frame[i] >= 0 !== frame[i - 1] >= 0) z++
  return z / frame.length
}
function voicing(zcrVal: number): number {
  if (zcrVal < 0.05) return 1
  if (zcrVal > 0.18) return 0
  return 1 - (zcrVal - 0.05) / 0.13
}
// Excitation
function pulseTrain(
  len: number,
  sr: number,
  f0: number,
  gain: number,
): Float32Array {
  const o = new Float32Array(len)
  if (f0 <= 0) return o
  const period = sr / f0,
    w = 0.05
  for (let i = 0; i < len; i++) {
    const ph = (i % period) / period
    if (ph < w) o[i] = gain * (0.5 + 0.5 * Math.cos(Math.PI * (ph / w - 1)))
  }
  let m = 0
  for (let i = 0; i < len; i++) m += o[i]
  m /= len
  for (let i = 0; i < len; i++) o[i] -= m
  return o
}
function lfPulseTrain(
  len: number,
  sr: number,
  f0: number,
  gain: number,
  openQuotient = 0.6,
  asymmetry = 0.7,
): Float32Array {
  const o = new Float32Array(len)
  if (f0 <= 0) return o
  const T = sr / f0,
    Te = T * openQuotient,
    Tp = Te * asymmetry,
    Ta = T * 0.04
  for (let i = 0; i < len; i++) {
    const t = i % T
    let v: number
    if (t < Te)
      v = -Math.exp((0.3 * (t - Tp)) / Tp) * Math.sin((Math.PI * t) / Tp)
    else v = (1 / Ta) * (Math.exp(-(t - Te) / Ta) - Math.exp(-(T - Te) / Ta))
    o[i] = v * gain
  }
  let mean = 0
  for (let i = 0; i < len; i++) mean += o[i]
  mean /= len
  for (let i = 0; i < len; i++) o[i] -= mean
  let p = 0
  for (let i = 0; i < len; i++) if (Math.abs(o[i]) > p) p = Math.abs(o[i])
  if (p > 0) for (let i = 0; i < len; i++) o[i] = (o[i] * gain) / p
  return o
}
function mixedExcitation(
  len: number,
  sr: number,
  f0: number,
  gain: number,
  voicingAmt: number,
): Float32Array {
  const pulses = pulseTrain(len, sr, f0, gain),
    o = new Float32Array(len)
  for (let i = 0; i < len; i++)
    o[i] =
      pulses[i] * voicingAmt +
      (Math.random() * 2 - 1) * gain * 0.6 * (1 - voicingAmt)
  return o
}
function lpcAR(
  input: Float32Array,
  sr: number,
  excFn: (
    idx: number,
    len: number,
    frame: Float32Array,
    gain: number,
    f0: number,
    voiced: number,
    formants: number[],
  ) => Float32Array,
  order = 14,
): Float32Array {
  const FL = 1024,
    hop = 256
  const out = new Float32Array(input.length + FL)
  const win = new Float32Array(FL)
  for (let i = 0; i < FL; i++)
    win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (FL - 1))
  let idx = 0
  for (let s = 0; s + FL <= input.length; s += hop) {
    const fr = new Float32Array(FL)
    for (let i = 0; i < FL; i++) fr[i] = input[s + i] * win[i]
    const r = autocorr(fr, order)
    const { a, e } = levinson(r, order)
    const g = Math.sqrt(Math.max(e, 1e-9) / FL)
    const f0 = detectPitch(fr, sr) || 0
    const v = voicing(zcr(fr))
    const fm = estimateFormants(a, sr)
    const exc = excFn(idx, FL, fr, g, f0, v, fm)
    const syn = lpcSynth(exc, a)
    for (let i = 0; i < FL; i++) out[s + i] += syn[i] * win[i]
    idx++
  }
  const c = (0.5 * (FL / 256)) / 2
  for (let i = 0; i < out.length; i++) out[i] /= Math.max(1, c)
  return out.subarray(0, input.length)
}
function applyBPInline(
  x: Float32Array,
  sr: number,
  fc: number,
  gainDb: number,
  Q: number,
): Float32Array {
  const w0 = (2 * Math.PI * fc) / sr
  const cw = Math.cos(w0),
    sw = Math.sin(w0)
  const alpha = sw / (2 * Q)
  const A = Math.pow(10, gainDb / 40)
  const b0 = 1 + alpha * A,
    b1 = -2 * cw,
    b2 = 1 - alpha * A
  const a0 = 1 + alpha / A,
    a1 = -2 * cw,
    a2 = 1 - alpha / A
  const B0 = b0 / a0,
    B1 = b1 / a0,
    B2 = b2 / a0,
    A1 = a1 / a0,
    A2 = a2 / a0
  const y = new Float32Array(x.length)
  let x1 = 0,
    x2 = 0,
    y1 = 0,
    y2 = 0
  for (let i = 0; i < x.length; i++) {
    const v = B0 * x[i] + B1 * x1 + B2 * x2 - A1 * y1 - A2 * y2
    x2 = x1
    x1 = x[i]
    y2 = y1
    y1 = v
    y[i] = v
  }
  return y
}
function spectralLPFArr(x: Float32Array, sr: number, fc: number): Float32Array {
  const N = nextPow2(x.length)
  const re = new Float32Array(N),
    im = new Float32Array(N)
  for (let i = 0; i < x.length; i++) re[i] = x[i]
  fft(re, im)
  for (let k = 0; k <= N / 2; k++) {
    const f = (k * sr) / N
    let g = 1
    if (f > fc) g = Math.max(0, 1 - Math.min(1, (f - fc) / fc))
    re[k] *= g
    im[k] *= g
    if (k > 0 && k < N / 2) {
      re[N - k] *= g
      im[N - k] *= g
    }
  }
  fft(re, im, true)
  return re.slice(0, x.length)
}
// =========================================================================
// STAGE 3A — DESTRUCTIVE FREQUENCY (6 variants)
// =========================================================================
type DestructiveId =
  | 'phase-invert'
  | 'inverse-stamp'
  | 'spectral-null'
  | 'transient-erase'
  | 'envelope-inverse'
  | 'negative-mask'
async function buildDestructive(
  id: DestructiveId,
  orig: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
): Promise<AudioBuffer> {
  const sr = orig.sampleRate,
    x = orig.getChannelData(0)
  if (id === 'phase-invert') return phaseInvert(orig, ctx)
  if (id === 'inverse-stamp') {
    const env = new Float32Array(x.length)
    let e = 0
    for (let i = 0; i < x.length; i++) {
      e = e * 0.997 + Math.abs(x[i]) * 0.003
      env[i] = e
    }
    let peak = 1e-9
    for (let i = 0; i < env.length; i++) if (env[i] > peak) peak = env[i]
    const o = new Float32Array(x.length)
    for (let i = 0; i < x.length; i++) {
      const invMask = 1 - Math.min(1, env[i] / peak)
      o[i] = (Math.random() * 2 - 1) * invMask * 0.5
    }
    return bufferFromArray(o, sr, ctx)
  }
  if (id === 'spectral-null') {
    const N = nextPow2(x.length)
    const re = new Float32Array(N),
      im = new Float32Array(N)
    for (let i = 0; i < x.length; i++) re[i] = x[i]
    fft(re, im)
    const mag = new Float32Array(N / 2)
    for (let k = 0; k < N / 2; k++)
      mag[k] = Math.sqrt(re[k] * re[k] + im[k] * im[k])
    const idxs = Array.from(mag.keys())
      .sort((a, b) => mag[b] - mag[a])
      .slice(0, 8)
    for (const k of idxs) {
      for (let d = -3; d <= 3; d++) {
        const kk = k + d
        if (kk > 0 && kk < N / 2) {
          re[kk] = 0
          im[kk] = 0
          re[N - kk] = 0
          im[N - kk] = 0
        }
      }
    }
    fft(re, im, true)
    const o = new Float32Array(x.length)
    for (let i = 0; i < x.length; i++) o[i] = -re[i]
    return bufferFromArray(o, sr, ctx)
  }
  if (id === 'transient-erase') {
    const hp = await processWithFilters(orig, (off, src) => {
      const f = off.createBiquadFilter()
      f.type = 'highpass'
      f.frequency.value = 1500
      src.connect(f)
      return f
    })
    return phaseInvert(hp, ctx)
  }
  if (id === 'envelope-inverse') {
    const env = new Float32Array(x.length)
    let e = 0
    for (let i = 0; i < x.length; i++) {
      e = e * 0.998 + Math.abs(x[i]) * 0.002
      env[i] = e
    }
    let peak = 1e-9
    for (let i = 0; i < env.length; i++) if (env[i] > peak) peak = env[i]
    const o = new Float32Array(x.length)
    for (let i = 0; i < x.length; i++) {
      const inv = 1 - Math.min(1, env[i] / peak)
      o[i] = Math.sin(2 * Math.PI * 800 * (i / sr)) * inv * 0.3
    }
    return bufferFromArray(o, sr, ctx)
  }
  const env = new Float32Array(x.length)
  let e = 0
  for (let i = 0; i < x.length; i++) {
    e = e * 0.996 + Math.abs(x[i]) * 0.004
    env[i] = e
  }
  let peak = 1e-9
  for (let i = 0; i < env.length; i++) if (env[i] > peak) peak = env[i]
  const noise = new Float32Array(x.length)
  for (let i = 0; i < x.length; i++) {
    const mask = 1 - Math.min(1, (env[i] / peak) * 1.5)
    noise[i] = (Math.random() * 2 - 1) * mask * 0.4
  }
  const nb = bufferFromArray(noise, sr, ctx)
  return processWithFilters(nb, (off, src) => {
    const lp = off.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 4000
    src.connect(lp)
    return lp
  })
}
// =========================================================================
// STAGE 3B — ADDITIVE FREQUENCY (6 variants)
// =========================================================================
type AdditiveId =
  | 'sii-weighted'
  | 'formant-boost'
  | 'harmonic-stack'
  | 'presence-shelf'
  | 'transient-emphasis'
  | 'pink-fill'
function buildSIIAdditive(
  input: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  dbAt2k = 4,
): AudioBuffer {
  const sr = input.sampleRate,
    d = input.getChannelData(0),
    N = nextPow2(d.length)
  const re = new Float32Array(N),
    im = new Float32Array(N)
  for (let i = 0; i < d.length; i++) re[i] = d[i]
  fft(re, im)
  const peak = Math.pow(10, dbAt2k / 20) - 1
  for (let k = 0; k < N / 2; k++) {
    const f = (k * sr) / N
    const w =
      (Math.exp(-Math.pow((f - 1800) / 900, 2)) +
        0.6 * Math.exp(-Math.pow((f - 3000) / 700, 2))) *
      peak
    re[k] *= w
    im[k] *= w
    if (k > 0) {
      re[N - k] = re[k]
      im[N - k] = -im[k]
    }
  }
  fft(re, im, true)
  const out = ctx.createBuffer(1, d.length, sr),
    o = out.getChannelData(0)
  for (let i = 0; i < d.length; i++) o[i] = re[i]
  return out
}
async function buildAdditive(
  id: AdditiveId,
  orig: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  dbAt2k = 4,
): Promise<AudioBuffer> {
  const sr = orig.sampleRate,
    x = orig.getChannelData(0)
  if (id === 'sii-weighted') return buildSIIAdditive(orig, ctx, dbAt2k)
  if (id === 'formant-boost') {
    const FL = 1024,
      hop = 256
    const out = new Float32Array(x.length)
    for (let s = 0; s + FL <= x.length; s += hop) {
      const fr = new Float32Array(FL)
      for (let i = 0; i < FL; i++) fr[i] = x[s + i]
      const r = autocorr(fr, 14)
      const { a } = levinson(r, 14)
      const fm = estimateFormants(a, sr)
      const win = (i: number) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / FL)
      for (const f of fm.slice(0, 3)) {
        for (let i = 0; i < FL; i++)
          out[s + i] +=
            Math.sin(2 * Math.PI * f * ((s + i) / sr)) * 0.04 * win(i)
      }
    }
    return bufferFromArray(out, sr, ctx)
  }
  if (id === 'harmonic-stack') {
    const f0 = detectPitch(x, sr) || 120
    const o = new Float32Array(x.length)
    for (let i = 0; i < x.length; i++) {
      let v = 0
      for (let h = 4; h <= 14; h++)
        v += Math.sin(2 * Math.PI * f0 * h * (i / sr)) / h
      o[i] = v * 0.1
    }
    return bufferFromArray(o, sr, ctx)
  }
  if (id === 'presence-shelf') {
    return processWithFilters(orig, (off, src) => {
      const sh = off.createBiquadFilter()
      sh.type = 'highshelf'
      sh.frequency.value = 2200
      sh.gain.value = dbAt2k + 2
      const hp = off.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.value = 1500
      src.connect(sh).connect(hp)
      return hp
    })
  }
  if (id === 'transient-emphasis') {
    const o = new Float32Array(x.length)
    const W = 256
    let prev = 0
    for (let s = 0; s + W < x.length; s += W) {
      let e = 0
      for (let i = 0; i < W; i++) e += x[s + i] * x[s + i]
      e = Math.sqrt(e / W)
      if (e > prev * 1.8 && e > 0.02) {
        for (let i = 0; i < W; i++)
          o[s + i] += (Math.random() * 2 - 1) * e * Math.exp(-i / 60) * 0.6
      }
      prev = e
    }
    const b = bufferFromArray(o, sr, ctx)
    return processWithFilters(b, (off, src) => {
      const hp = off.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.value = 1800
      const lp = off.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 7000
      src.connect(hp).connect(lp)
      return lp
    })
  }
  const o = new Float32Array(x.length)
  let b0 = 0,
    b1 = 0,
    b2 = 0
  for (let i = 0; i < x.length; i++) {
    const white = Math.random() * 2 - 1
    b0 = 0.99765 * b0 + white * 0.099
    b1 = 0.963 * b1 + white * 0.298
    b2 = 0.57 * b2 + white * 1.0526
    o[i] = (b0 + b1 + b2 + white * 0.1848) * 0.05
  }
  const b = bufferFromArray(o, sr, ctx)
  return processWithFilters(b, (off, src) => {
    const bp = off.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 2500
    bp.Q.value = 0.8
    src.connect(bp)
    return bp
  })
}
// =========================================================================
// STAGE 4 — ELECTROLARYNX (7 variants)
// =========================================================================
type ElectroId =
  | 'pulse-fixed'
  | 'pulse-jittery'
  | 'pulse-follow'
  | 'lf-glottal-el'
  | 'mixed-noise-el'
  | 'dual-pitch'
  | 'spectral-lpf'
async function synthElectrolarynx(
  orig: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  pitch: number,
  tissueLpf: number,
  id: ElectroId,
): Promise<AudioBuffer> {
  const sr = orig.sampleRate
  const input = orig.getChannelData(0)
  const synth = lpcAR(
    input,
    sr,
    (idx, len, fr, g, f0orig, v) => {
      if (id === 'pulse-follow')
        return pulseTrain(len, sr, f0orig > 0 ? f0orig : pitch, g * 2.0)
      if (id === 'pulse-jittery')
        return pulseTrain(
          len,
          sr,
          pitch * (1 + (Math.random() - 0.5) * 0.04),
          g * 2.0,
        )
      if (id === 'lf-glottal-el')
        return lfPulseTrain(len, sr, pitch, g * 1.8, 0.6, 0.7)
      if (id === 'mixed-noise-el')
        return mixedExcitation(len, sr, pitch, g * 1.8, v)
      if (id === 'dual-pitch') {
        const p1 = pulseTrain(len, sr, pitch, g * 1.2)
        const p2 = pulseTrain(len, sr, pitch * 1.5, g * 0.6)
        const o = new Float32Array(len)
        for (let i = 0; i < len; i++) o[i] = p1[i] + p2[i]
        return o
      }
      return pulseTrain(len, sr, pitch, g * 2.0)
    },
    14,
  )
  if (id === 'spectral-lpf') {
    const lp = spectralLPFArr(synth, sr, tissueLpf)
    const buf = bufferFromArray(lp, sr, ctx)
    const r = await processWithFilters(buf, (off, src) => {
      const pk = off.createBiquadFilter()
      pk.type = 'peaking'
      pk.frequency.value = 500
      pk.Q.value = 2
      pk.gain.value = 4
      src.connect(pk)
      return pk
    })
    return normalizeBuffer(r, ctx, 0.85)
  }
  const synthBuf = bufferFromArray(synth, sr, ctx)
  const filt = await processWithFilters(synthBuf, (off, src) => {
    const l1 = off.createBiquadFilter()
    l1.type = 'lowpass'
    l1.frequency.value = tissueLpf
    l1.Q.value = 0.707
    const l2 = off.createBiquadFilter()
    l2.type = 'lowpass'
    l2.frequency.value = tissueLpf
    l2.Q.value = 0.707
    const r = off.createBiquadFilter()
    r.type = 'peaking'
    r.frequency.value = 500
    r.Q.value = 2
    r.gain.value = 4
    src.connect(l1).connect(l2).connect(r)
    return r
  })
  return normalizeBuffer(filt, ctx, 0.85)
}
// =========================================================================
// HF RECONSTRUCTION — 18 methods
// =========================================================================
async function methodSBR(
  lowBand: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  cutoff: number,
  strength: number,
): Promise<AudioBuffer> {
  const sr = lowBand.sampleRate
  const x = lowBand.getChannelData(0)
  const out = new Float32Array(x.length)
  for (let i = 0; i < x.length; i++) out[i] = Math.tanh(x[i] * 3)
  const shaped = await processWithFilters(
    bufferFromArray(out, sr, ctx),
    (off, src) => {
      const hp = off.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.value = cutoff
      const tilt = off.createBiquadFilter()
      tilt.type = 'highshelf'
      tilt.frequency.value = 3000
      tilt.gain.value = -6
      const lp = off.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 7500
      src.connect(hp).connect(tilt).connect(lp)
      return lp
    },
  )
  return mapBuffer(shaped, ctx, (v) => v * strength * 1.4)
}
async function methodFold(
  lowBand: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  cutoff: number,
  strength: number,
): Promise<AudioBuffer> {
  const sr = lowBand.sampleRate,
    x = lowBand.getChannelData(0),
    xh = hilbertImag(x)
  const s1 = cutoff,
    s2 = cutoff * 1.8
  const out = new Float32Array(x.length)
  for (let i = 0; i < x.length; i++) {
    const t = i / sr
    out[i] =
      (x[i] * Math.cos(2 * Math.PI * s1 * t) -
        xh[i] * Math.sin(2 * Math.PI * s1 * t)) *
        0.6 +
      (x[i] * Math.cos(2 * Math.PI * s2 * t) -
        xh[i] * Math.sin(2 * Math.PI * s2 * t)) *
        0.4
  }
  const shaped = await processWithFilters(
    bufferFromArray(out, sr, ctx),
    (off, src) => {
      const hp = off.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.value = cutoff * 1.1
      const tilt = off.createBiquadFilter()
      tilt.type = 'highshelf'
      tilt.frequency.value = 3000
      tilt.gain.value = -4
      const lp = off.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 6000
      src.connect(hp).connect(tilt).connect(lp)
      return lp
    },
  )
  return mapBuffer(shaped, ctx, (v) => v * strength * 1.5)
}
async function methodSourceFilter(
  origForLpc: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  strength: number,
): Promise<AudioBuffer> {
  const sr = origForLpc.sampleRate
  const synth = lpcAR(
    origForLpc.getChannelData(0),
    sr,
    (idx, len, fr, g, f0, v) => mixedExcitation(len, sr, f0 || 120, g * 1.5, v),
    14,
  )
  const buf = bufferFromArray(synth, sr, ctx)
  const hi = await processWithFilters(buf, (off, src) => {
    const hp = off.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 600
    const lp = off.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 7000
    src.connect(hp).connect(lp)
    return lp
  })
  return mapBuffer(hi, ctx, (v) => v * strength * 1.2)
}
async function methodFormantTracked(
  orig: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  strength: number,
  pitch: number,
): Promise<AudioBuffer> {
  const sr = orig.sampleRate
  const input = orig.getChannelData(0)
  const synth = lpcAR(
    input,
    sr,
    (idx, len, fr, g, f0, v, fm) => {
      const exc = mixedExcitation(len, sr, f0 || pitch, g * 1.6, v)
      const f2 = fm[1] || 1800,
        f3 = fm[2] || 2800
      return applyBPInline(applyBPInline(exc, sr, f2, 6, 1.3), sr, f3, 6, 1.6)
    },
    14,
  )
  const buf = bufferFromArray(synth, sr, ctx)
  const hi = await processWithFilters(buf, (off, src) => {
    const hp = off.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 700
    const lp = off.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 6500
    src.connect(hp).connect(lp)
    return lp
  })
  return mapBuffer(hi, ctx, (v) => v * strength * 1.3)
}
async function methodConsonantNoise(
  orig: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  strength: number,
): Promise<AudioBuffer> {
  const sr = orig.sampleRate,
    x = orig.getChannelData(0),
    out = new Float32Array(x.length)
  const FL = 512,
    hop = 256
  let prevE = 0
  for (let s = 0; s + FL <= x.length; s += hop) {
    const fr = x.subarray(s, s + FL)
    let e = 0,
      z = 0
    for (let i = 0; i < FL; i++) {
      e += fr[i] * fr[i]
      if (i > 0 && fr[i] >= 0 !== fr[i - 1] >= 0) z++
    }
    const energy = Math.sqrt(e / FL),
      zRate = z / FL
    const isFricative = zRate > 0.16 && energy > 0.01
    const isPlosive = energy > prevE * 2.5 && energy > 0.02
    prevE = energy
    if (isFricative) {
      for (let i = 0; i < hop; i++)
        out[s + i] +=
          (Math.random() * 2 - 1) *
          energy *
          0.8 *
          Math.exp((-Math.abs(i - hop / 2) / hop) * 2)
    } else if (isPlosive) {
      for (let i = 0; i < Math.min(hop, 200); i++)
        out[s + i] += (Math.random() * 2 - 1) * energy * 1.5 * Math.exp(-i / 40)
    }
  }
  const buf = bufferFromArray(out, sr, ctx)
  const shaped = await processWithFilters(buf, (off, src) => {
    const hp = off.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 2000
    const sh = off.createBiquadFilter()
    sh.type = 'highshelf'
    sh.frequency.value = 4000
    sh.gain.value = 6
    src.connect(hp).connect(sh)
    return sh
  })
  return mapBuffer(shaped, ctx, (v) => v * strength * 1.5)
}
async function methodHumanizer(
  orig: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  strength: number,
  basePitch: number,
): Promise<AudioBuffer> {
  const sr = orig.sampleRate
  const synth = lpcAR(
    orig.getChannelData(0),
    sr,
    (idx, len, fr, g, f0, v) => {
      const jitter = 1 + (Math.random() - 0.5) * 0.03
      const shimmer = 1 + (Math.random() - 0.5) * 0.1
      const pf = (f0 || basePitch) * jitter
      const pulses = pulseTrain(len, sr, pf, g * 1.5 * shimmer)
      const breath = new Float32Array(len)
      for (let i = 0; i < len; i++)
        breath[i] = (Math.random() * 2 - 1) * g * 0.25
      const o = new Float32Array(len)
      for (let i = 0; i < len; i++)
        o[i] = pulses[i] * v + breath[i] * (1 - v) * 0.7 + breath[i] * 0.1
      return o
    },
    14,
  )
  const buf = bufferFromArray(synth, sr, ctx)
  const hi = await processWithFilters(buf, (off, src) => {
    const hp = off.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 500
    const lp = off.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 7500
    src.connect(hp).connect(lp)
    return lp
  })
  return mapBuffer(hi, ctx, (v) => v * strength * 1.2)
}
async function methodCepstralInpaint(
  orig: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  cutoff: number,
  strength: number,
): Promise<AudioBuffer> {
  const sr = orig.sampleRate,
    x = orig.getChannelData(0)
  const N = nextPow2(x.length)
  const re = new Float32Array(N),
    im = new Float32Array(N)
  for (let i = 0; i < x.length; i++) re[i] = x[i]
  fft(re, im)
  const logMag = new Float32Array(N),
    phase = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    const m = Math.sqrt(re[i] * re[i] + im[i] * im[i])
    logMag[i] = Math.log(m + 1e-9)
    phase[i] = Math.atan2(im[i], re[i])
  }
  const ce = new Float32Array(N),
    cim = new Float32Array(N)
  for (let i = 0; i < N; i++) ce[i] = logMag[i]
  fft(ce, cim, true)
  const lifter = 30
  for (let i = lifter; i < N - lifter; i++) {
    ce[i] = 0
    cim[i] = 0
  }
  fft(ce, cim)
  const cutBin = Math.floor((cutoff * N) / sr)
  let sx = 0,
    sy = 0,
    sxy = 0,
    sxx = 0,
    nFit = 64
  for (let i = cutBin - nFit; i < cutBin; i++) {
    sx += i
    sy += ce[i]
    sxy += i * ce[i]
    sxx += i * i
  }
  const slope = (nFit * sxy - sx * sy) / (nFit * sxx - sx * sx)
  const intercept = (sy - slope * sx) / nFit
  const newMag = new Float32Array(N / 2 + 1)
  for (let i = 0; i <= N / 2; i++) {
    if (i < cutBin) newMag[i] = Math.exp(logMag[i])
    else
      newMag[i] =
        Math.exp(slope * i + intercept + (Math.random() - 0.5) * 0.5) *
        strength *
        1.8
  }
  const nre = new Float32Array(N),
    nim = new Float32Array(N)
  for (let i = 0; i <= N / 2; i++) {
    const m = newMag[i]
    const ph = i < cutBin ? phase[i] : Math.random() * 2 * Math.PI - Math.PI
    nre[i] = m * Math.cos(ph)
    nim[i] = m * Math.sin(ph)
    if (i > 0 && i < N / 2) {
      nre[N - i] = nre[i]
      nim[N - i] = -nim[i]
    }
  }
  fft(nre, nim, true)
  const o = new Float32Array(x.length)
  for (let i = 0; i < x.length; i++) o[i] = nre[i]
  const buf = bufferFromArray(o, sr, ctx)
  return processWithFilters(buf, (off, src) => {
    const hp = off.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = cutoff
    const lp = off.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 7500
    src.connect(hp).connect(lp)
    return lp
  })
}
async function methodChannelVocoder(
  lowBand: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  strength: number,
  pitch: number,
): Promise<AudioBuffer> {
  const sr = lowBand.sampleRate
  const x = lowBand.getChannelData(0)
  const bandFreqs: number[] = []
  for (let i = 0; i < 12; i++)
    bandFreqs.push(300 * Math.pow(6000 / 300, i / 11))
  const carrier = new Float32Array(x.length)
  for (let i = 0; i < x.length; i++) {
    let v = 0
    for (let h = 1; h <= 30; h++)
      v += Math.sin(2 * Math.PI * (pitch * h) * (i / sr)) / h
    carrier[i] = v * 0.3 + (Math.random() * 2 - 1) * 0.1
  }
  const out = new Float32Array(x.length)
  for (let b = 0; b < bandFreqs.length; b++) {
    const fc = bandFreqs[b]
    const lowBand_b = applyBPInline(x, sr, fc, 0, 4)
    const env = new Float32Array(x.length)
    let e = 0
    for (let i = 0; i < x.length; i++) {
      e = e * 0.995 + Math.abs(lowBand_b[i]) * 0.005
      env[i] = e
    }
    const car_b = applyBPInline(carrier, sr, fc, 0, 4)
    for (let i = 0; i < x.length; i++) out[i] += car_b[i] * env[i] * 8
  }
  const buf = bufferFromArray(out, sr, ctx)
  const shaped = await processWithFilters(buf, (off, src) => {
    const hp = off.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 600
    const lp = off.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 6500
    src.connect(hp).connect(lp)
    return lp
  })
  return mapBuffer(shaped, ctx, (v) => v * strength * 1.2)
}
async function methodLFGlottal(
  orig: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  strength: number,
  basePitch: number,
): Promise<AudioBuffer> {
  const sr = orig.sampleRate
  const synth = lpcAR(
    orig.getChannelData(0),
    sr,
    (idx, len, fr, g, f0, v) => {
      if (v < 0.3) return mixedExcitation(len, sr, f0 || basePitch, g, v)
      return lfPulseTrain(len, sr, f0 || basePitch, g * 1.5, 0.6, 0.7)
    },
    14,
  )
  const buf = bufferFromArray(synth, sr, ctx)
  const hi = await processWithFilters(buf, (off, src) => {
    const hp = off.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 500
    const lp = off.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 7500
    src.connect(hp).connect(lp)
    return lp
  })
  return mapBuffer(hi, ctx, (v) => v * strength * 1.2)
}
const VOWELS: {
  name: string
  f: [number, number, number]
}[] = [
  {
    name: 'a',
    f: [730, 1090, 2440],
  },
  {
    name: 'e',
    f: [530, 1840, 2480],
  },
  {
    name: 'i',
    f: [270, 2290, 3010],
  },
  {
    name: 'o',
    f: [570, 840, 2410],
  },
  {
    name: 'u',
    f: [300, 870, 2240],
  },
  {
    name: 'ə',
    f: [500, 1500, 2500],
  },
]
function classifyVowel(formants: number[]): [number, number, number] {
  if (formants.length < 2) return VOWELS[5].f
  const f1 = formants[0],
    f2 = formants[1]
  let best = VOWELS[0],
    bd = Infinity
  for (const v of VOWELS) {
    const d =
      Math.pow((v.f[0] - f1) / 500, 2) + Math.pow((v.f[1] - f2) / 1000, 2)
    if (d < bd) {
      bd = d
      best = v
    }
  }
  return best.f
}
async function methodVowelTract(
  orig: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  strength: number,
  basePitch: number,
): Promise<AudioBuffer> {
  const sr = orig.sampleRate
  const input = orig.getChannelData(0)
  const FL = 1024,
    hop = 256
  const out = new Float32Array(input.length + FL)
  const win = new Float32Array(FL)
  for (let i = 0; i < FL; i++)
    win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (FL - 1))
  for (let s = 0; s + FL <= input.length; s += hop) {
    const fr = new Float32Array(FL)
    for (let i = 0; i < FL; i++) fr[i] = input[s + i] * win[i]
    const r = autocorr(fr, 14)
    const { a } = levinson(r, 14)
    const fm = estimateFormants(a, sr)
    const v = voicing(zcr(fr))
    if (v < 0.3) continue
    const vowelF = classifyVowel(fm)
    const f0 = detectPitch(fr, sr) || basePitch
    let buzz = pulseTrain(FL, sr, f0, 0.5)
    buzz = applyBPInline(buzz, sr, vowelF[0], 8, 6)
    buzz = applyBPInline(buzz, sr, vowelF[1], 10, 8)
    buzz = applyBPInline(buzz, sr, vowelF[2], 8, 10)
    for (let i = 0; i < FL; i++) out[s + i] += buzz[i] * win[i] * 0.3
  }
  const buf = bufferFromArray(out.subarray(0, input.length), sr, ctx)
  const hi = await processWithFilters(buf, (off, src) => {
    const hp = off.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 600
    const lp = off.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 6500
    src.connect(hp).connect(lp)
    return lp
  })
  return mapBuffer(hi, ctx, (v) => v * strength * 1.5)
}
async function methodSinusoidal(
  orig: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  cutoff: number,
  strength: number,
): Promise<AudioBuffer> {
  const sr = orig.sampleRate,
    x = orig.getChannelData(0)
  const FL = 2048,
    hop = 512
  const out = new Float32Array(x.length)
  const win = new Float32Array(FL)
  for (let i = 0; i < FL; i++)
    win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / FL)
  for (let s = 0; s + FL <= x.length; s += hop) {
    const re = new Float32Array(FL),
      im = new Float32Array(FL)
    for (let i = 0; i < FL; i++) re[i] = x[s + i] * win[i]
    fft(re, im)
    const peaks: {
      f: number
      m: number
    }[] = []
    for (let k = 2; k < FL / 2 - 2; k++) {
      const m = Math.sqrt(re[k] * re[k] + im[k] * im[k])
      if (m > 0.01)
        peaks.push({
          f: (k * sr) / FL,
          m,
        })
    }
    peaks.sort((a, b) => b.m - a.m)
    for (let i = 0; i < FL; i++) {
      let v = 0
      for (const p of peaks.slice(0, 10)) {
        if (p.f * 2 > cutoff && p.f * 2 < sr / 2)
          v += Math.sin(2 * Math.PI * (p.f * 2) * ((s + i) / sr)) * p.m * 0.05
      }
      out[s + i] += v * win[i]
    }
  }
  const buf = bufferFromArray(out, sr, ctx)
  return processWithFilters(buf, (off, src) => {
    const hp = off.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = cutoff
    src.connect(hp)
    return hp
  }).then((b) => mapBuffer(b, ctx, (v) => v * strength * 1.5))
}
async function methodPhaseVocoder(
  orig: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  cutoff: number,
  strength: number,
): Promise<AudioBuffer> {
  const sr = orig.sampleRate,
    x = orig.getChannelData(0)
  const N = nextPow2(x.length)
  const re = new Float32Array(N),
    im = new Float32Array(N)
  for (let i = 0; i < x.length; i++) re[i] = x[i]
  fft(re, im)
  const cutBin = Math.floor((cutoff * N) / sr)
  const nre = new Float32Array(N),
    nim = new Float32Array(N)
  for (let k = cutBin; k < N / 2; k++) {
    const srcK = Math.floor(cutBin + (k - cutBin) / 1.6)
    if (srcK > 0 && srcK < cutBin) {
      const mag = Math.sqrt(re[srcK] * re[srcK] + im[srcK] * im[srcK])
      const ph = Math.random() * 2 * Math.PI - Math.PI
      nre[k] = mag * Math.cos(ph) * 0.7
      nim[k] = mag * Math.sin(ph) * 0.7
      if (k > 0) {
        nre[N - k] = nre[k]
        nim[N - k] = -nim[k]
      }
    }
  }
  fft(nre, nim, true)
  const o = new Float32Array(x.length)
  for (let i = 0; i < x.length; i++) o[i] = nre[i]
  const b = bufferFromArray(o, sr, ctx)
  return processWithFilters(b, (off, src) => {
    const hp = off.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = cutoff
    const lp = off.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 7500
    const g = off.createGain()
    g.gain.value = strength * 1.6
    src.connect(hp).connect(lp).connect(g)
    return g
  })
}
async function methodGranular(
  orig: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  cutoff: number,
  strength: number,
): Promise<AudioBuffer> {
  const sr = orig.sampleRate,
    x = orig.getChannelData(0)
  const out = new Float32Array(x.length)
  const grainLen = Math.floor(sr * 0.012)
  for (let s = 0; s < x.length - grainLen; s += Math.floor(grainLen / 2)) {
    const startSrc = Math.floor(Math.random() * (x.length - grainLen))
    for (let i = 0; i < grainLen; i++) {
      const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / grainLen)
      const srcI = startSrc + Math.floor(i * 1.7)
      if (srcI < x.length && s + i < out.length) out[s + i] += x[srcI] * w * 0.4
    }
  }
  const b = bufferFromArray(out, sr, ctx)
  const shaped = await processWithFilters(b, (off, src) => {
    const hp = off.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = cutoff
    const lp = off.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 7500
    src.connect(hp).connect(lp)
    return lp
  })
  return mapBuffer(shaped, ctx, (v) => v * strength * 1.3)
}
async function methodChaotic(
  orig: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  strength: number,
  pitch: number,
): Promise<AudioBuffer> {
  const sr = orig.sampleRate
  const synth = lpcAR(
    orig.getChannelData(0),
    sr,
    (idx, len, fr, g, f0, v) => {
      const o = new Float32Array(len)
      let z = 0.4 + Math.random() * 0.2
      const r = 3.95
      for (let i = 0; i < len; i++) {
        z = r * z * (1 - z)
        o[i] = (z - 0.5) * 2 * g * 1.4 * (v * 0.6 + 0.4)
      }
      return o
    },
    14,
  )
  const buf = bufferFromArray(synth, sr, ctx)
  const hi = await processWithFilters(buf, (off, src) => {
    const hp = off.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 700
    const lp = off.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 7000
    src.connect(hp).connect(lp)
    return lp
  })
  return mapBuffer(hi, ctx, (v) => v * strength * 1.3)
}
async function methodHarmonicFormant(
  orig: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  strength: number,
  basePitch: number,
): Promise<AudioBuffer> {
  const sr = orig.sampleRate
  const x = orig.getChannelData(0)
  const f0 = detectPitch(x, sr) || basePitch
  const formants = detectGlobalFormants(x, sr)
  const out = new Float32Array(x.length)
  const dt = 1 / sr
  for (let n = 1; n <= 18; n++) {
    const f = n * f0
    if (f > sr / 2) break
    let amp = (1 / n) * strength * 0.15
    for (const F of formants) {
      const bw = 120 + F * 0.08
      const d = Math.abs(f - F)
      if (d < bw * 2) amp *= 1 + 2.5 * Math.exp(-(d * d) / (2 * bw * bw))
    }
    for (let i = 0; i < x.length; i++)
      out[i] += amp * Math.sin(2 * Math.PI * f * i * dt)
  }
  const W = 512
  for (let i = 0; i < x.length; i++) {
    const s = Math.max(0, i - W)
    let r = 0
    for (let j = s; j <= i; j++) r += x[j] * x[j]
    out[i] *= Math.min(Math.sqrt(r / (i - s + 1)) * 8, 1.8)
  }
  const buf = bufferFromArray(out, sr, ctx)
  return processWithFilters(buf, (off, src) => {
    const hp = off.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 600
    const lp = off.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 7500
    src.connect(hp).connect(lp)
    return lp
  })
}
async function methodCepstralPulse(
  orig: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  cutoff: number,
  basePitch: number,
): Promise<AudioBuffer> {
  const sr = orig.sampleRate
  const x = orig.getChannelData(0)
  const f0 = detectPitch(x, sr) || basePitch
  const pulse = new Float32Array(x.length)
  const period = sr / f0
  let ph = 0
  for (let i = 0; i < x.length; i++) {
    ph += 1
    if (ph >= period) {
      pulse[i] = 1
      ph -= period
    }
  }
  const N = nextPow2(Math.min(x.length, 4096))
  const re = new Float32Array(N),
    im = new Float32Array(N)
  for (let i = 0; i < Math.min(N, x.length); i++)
    re[i] = x[i] * (0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (N - 1)))
  fft(re, im)
  const log = new Float32Array(N)
  for (let i = 0; i < N; i++)
    log[i] = Math.log(Math.sqrt(re[i] * re[i] + im[i] * im[i]) + 1e-9)
  const cre = new Float32Array(N),
    cim = new Float32Array(N)
  cre.set(log)
  fft(cre, cim, true)
  for (let i = 30; i < N - 30; i++) cre[i] = 0
  cim.fill(0)
  fft(cre, cim)
  const env = new Float32Array(N / 2 + 1)
  for (let i = 0; i <= N / 2; i++) env[i] = Math.exp(cre[i])
  const PN = nextPow2(x.length)
  const pre = new Float32Array(PN),
    pim = new Float32Array(PN)
  for (let i = 0; i < x.length; i++) pre[i] = pulse[i]
  fft(pre, pim)
  for (let k = 0; k <= PN / 2; k++) {
    const f = (k * sr) / PN
    const ek = Math.min(env.length - 1, Math.round((f / sr) * N))
    let g = env[ek] || 0
    if (f < cutoff) g *= (f / cutoff) * (f / cutoff)
    pre[k] *= g
    pim[k] *= g
    if (k > 0 && k < PN / 2) {
      pre[PN - k] *= g
      pim[PN - k] *= g
    }
  }
  fft(pre, pim, true)
  const o = new Float32Array(x.length)
  for (let i = 0; i < x.length; i++) o[i] = pre[i]
  return normalizeBuffer(bufferFromArray(o, sr, ctx), ctx, 0.7)
}
async function methodTiltInpaint(
  orig: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  cutoff: number,
  strength: number,
): Promise<AudioBuffer> {
  const sr = orig.sampleRate,
    x = orig.getChannelData(0)
  const N = nextPow2(x.length)
  const re = new Float32Array(N),
    im = new Float32Array(N)
  for (let i = 0; i < x.length; i++) re[i] = x[i]
  fft(re, im)
  let sxx = 0,
    sx = 0,
    sy = 0,
    sxy = 0,
    c = 0
  for (let k = 4; k < N / 2; k++) {
    const f = (k * sr) / N
    if (f < 200 || f > cutoff) continue
    const m = Math.sqrt(re[k] * re[k] + im[k] * im[k])
    if (m < 1e-9) continue
    const lf = Math.log(f),
      lm = Math.log(m)
    sx += lf
    sy += lm
    sxy += lf * lm
    sxx += lf * lf
    c++
  }
  const slope = c > 2 ? (c * sxy - sx * sy) / (c * sxx - sx * sx) : -1.2
  const intercept = c > 2 ? (sy - slope * sx) / c : 0
  const cutBin = Math.floor((cutoff * N) / sr)
  let edgeMag = 0
  for (let k = Math.max(0, cutBin - 8); k <= cutBin; k++)
    edgeMag += Math.sqrt(re[k] * re[k] + im[k] * im[k])
  edgeMag /= 9
  for (let k = cutBin; k <= N / 2; k++) {
    const f = (k * sr) / N
    const predicted = Math.exp(slope * Math.log(f) + intercept)
    const mag = Math.min(predicted, edgeMag * 4) * strength
    const phase = Math.random() * 2 * Math.PI
    re[k] = mag * Math.cos(phase)
    im[k] = mag * Math.sin(phase)
    if (k > 0 && k < N / 2) {
      re[N - k] = re[k]
      im[N - k] = -im[k]
    }
  }
  for (let k = 0; k < cutBin; k++) {
    re[k] = 0
    im[k] = 0
    if (k > 0) {
      re[N - k] = 0
      im[N - k] = 0
    }
  }
  fft(re, im, true)
  const o = new Float32Array(x.length)
  for (let i = 0; i < x.length; i++) o[i] = re[i]
  const W = 512
  for (let i = 0; i < o.length; i++) {
    const s = Math.max(0, i - W)
    let r = 0
    for (let j = s; j <= i; j++) r += x[j] * x[j]
    o[i] *= Math.min(Math.sqrt(r / (i - s + 1)) * 6, 2)
  }
  return normalizeBuffer(bufferFromArray(o, sr, ctx), ctx, 0.7)
}
// =========================================================================
// STAGE 6 — FUSION (7 variants)
// =========================================================================
type FusionId =
  | 'sum'
  | 'crossover'
  | 'spectral-merge'
  | 'linkwitz-riley'
  | 'match-eq'
  | 'dynamic-blend'
  | 'envmod-rms'
async function fuseLowHigh(
  low: AudioBuffer,
  high: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  id: FusionId,
  crossHz: number,
): Promise<AudioBuffer> {
  if (id === 'sum')
    return normalizeBuffer(sumBuffers(low, high, ctx, 1.0, 0.9), ctx, 0.9)
  if (id === 'crossover') {
    const lowF = await processWithFilters(low, (off, src) => {
      const lp = off.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = crossHz
      lp.Q.value = 0.707
      src.connect(lp)
      return lp
    })
    const highF = await processWithFilters(high, (off, src) => {
      const hp = off.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.value = crossHz
      hp.Q.value = 0.707
      src.connect(hp)
      return hp
    })
    return normalizeBuffer(sumBuffers(lowF, highF, ctx), ctx, 0.9)
  }
  if (id === 'linkwitz-riley') {
    const lowF = await processWithFilters(low, (off, src) => {
      const lp1 = off.createBiquadFilter()
      lp1.type = 'lowpass'
      lp1.frequency.value = crossHz
      lp1.Q.value = 0.707
      const lp2 = off.createBiquadFilter()
      lp2.type = 'lowpass'
      lp2.frequency.value = crossHz
      lp2.Q.value = 0.707
      src.connect(lp1).connect(lp2)
      return lp2
    })
    const highF = await processWithFilters(high, (off, src) => {
      const hp1 = off.createBiquadFilter()
      hp1.type = 'highpass'
      hp1.frequency.value = crossHz
      hp1.Q.value = 0.707
      const hp2 = off.createBiquadFilter()
      hp2.type = 'highpass'
      hp2.frequency.value = crossHz
      hp2.Q.value = 0.707
      src.connect(hp1).connect(hp2)
      return hp2
    })
    return normalizeBuffer(sumBuffers(lowF, highF, ctx), ctx, 0.9)
  }
  if (id === 'match-eq') {
    const lD = low.getChannelData(0),
      hD = high.getChannelData(0)
    const lowMag = magnitudeSpectrum(lD, 2048)
    const highMag = magnitudeSpectrum(hD, 2048)
    const sr = low.sampleRate
    const N = nextPow2(hD.length)
    const re = new Float32Array(N),
      im = new Float32Array(N)
    for (let i = 0; i < hD.length; i++) re[i] = hD[i]
    fft(re, im)
    for (let k = 0; k < N / 2; k++) {
      const f = (k * sr) / N
      const lowBin = Math.min(lowMag.length - 1, Math.floor((f * 2048) / sr))
      const highBin = Math.min(highMag.length - 1, Math.floor((f * 2048) / sr))
      const target = lowMag[Math.min(lowBin, lowMag.length - 1)] * 0.5
      const cur = highMag[highBin] + 1e-6
      const g = Math.min(2, Math.max(0.5, target / cur))
      re[k] *= g
      im[k] *= g
      if (k > 0) {
        re[N - k] = re[k]
        im[N - k] = -im[k]
      }
    }
    fft(re, im, true)
    const matched = ctx.createBuffer(1, hD.length, sr)
    const od = matched.getChannelData(0)
    for (let i = 0; i < hD.length; i++) od[i] = re[i]
    return normalizeBuffer(sumBuffers(low, matched, ctx, 1, 0.9), ctx, 0.9)
  }
  if (id === 'dynamic-blend') {
    const lD = low.getChannelData(0),
      hD = high.getChannelData(0)
    const len = Math.max(lD.length, hD.length)
    const env = new Float32Array(len)
    let e = 0
    for (let i = 0; i < lD.length; i++) {
      e = e * 0.997 + Math.abs(lD[i]) * 0.003
      env[i] = e
    }
    let pk = 1e-9
    for (let i = 0; i < env.length; i++) if (env[i] > pk) pk = env[i]
    const out = ctx.createBuffer(1, len, low.sampleRate)
    const od = out.getChannelData(0)
    for (let i = 0; i < len; i++) {
      const w = Math.min(1, env[i] / pk)
      od[i] =
        (i < lD.length ? lD[i] : 0) +
        (i < hD.length ? hD[i] * (0.4 + 0.7 * w) : 0)
    }
    return normalizeBuffer(out, ctx, 0.9)
  }
  if (id === 'envmod-rms') {
    const lD = low.getChannelData(0),
      hD = high.getChannelData(0)
    const W = 256
    const len = Math.max(lD.length, hD.length)
    const out = ctx.createBuffer(1, len, low.sampleRate)
    const od = out.getChannelData(0)
    for (let i = 0; i < len; i++) {
      const s = Math.max(0, i - W)
      let r = 0
      for (let j = s; j <= Math.min(i, lD.length - 1); j++) r += lD[j] * lD[j]
      const env = Math.min(1.5, Math.sqrt(r / (i - s + 1)) * 5)
      od[i] =
        (i < lD.length ? lD[i] * 0.6 : 0) + (i < hD.length ? hD[i] * env : 0)
    }
    return normalizeBuffer(out, ctx, 0.9)
  }
  // spectral-merge
  const sr = low.sampleRate,
    lD = low.getChannelData(0),
    hD = high.getChannelData(0)
  const N = nextPow2(Math.max(lD.length, hD.length))
  const lr = new Float32Array(N),
    li = new Float32Array(N),
    hr = new Float32Array(N),
    hi2 = new Float32Array(N)
  for (let i = 0; i < lD.length; i++) lr[i] = lD[i]
  for (let i = 0; i < hD.length; i++) hr[i] = hD[i]
  fft(lr, li)
  fft(hr, hi2)
  const cb = Math.floor((crossHz * N) / sr),
    bw = Math.max(8, cb / 4)
  for (let k = 0; k <= N / 2; k++) {
    let w: number
    if (k < cb - bw) w = 0
    else if (k > cb + bw) w = 1
    else w = 0.5 - 0.5 * Math.cos((Math.PI * (k - (cb - bw))) / (2 * bw))
    lr[k] = lr[k] * (1 - w) + hr[k] * w
    li[k] = li[k] * (1 - w) + hi2[k] * w
    if (k > 0 && k < N / 2) {
      lr[N - k] = lr[k]
      li[N - k] = -li[k]
    }
  }
  fft(lr, li, true)
  const out = ctx.createBuffer(1, Math.max(lD.length, hD.length), sr),
    od = out.getChannelData(0)
  for (let i = 0; i < od.length; i++) od[i] = lr[i]
  return normalizeBuffer(out, ctx, 0.9)
}
// =========================================================================
// STAGE 7 — BOOST (6 variants)
// =========================================================================
type BoostId =
  | 'bypass'
  | 'formant-aware'
  | 'consonant-focus'
  | 'loudness-curve'
  | 'static'
  | 'multiband'
async function applyBoost(
  input: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
  id: BoostId,
  db: number,
): Promise<AudioBuffer> {
  if (id === 'bypass') return input
  if (id === 'formant-aware') {
    const sr = input.sampleRate
    const x = input.getChannelData(0)
    const fr = new Float32Array(Math.min(2048, x.length))
    for (let i = 0; i < fr.length; i++) fr[i] = x[i]
    const r = autocorr(fr, 14)
    const { a } = levinson(r, 14)
    const fm = estimateFormants(a, sr)
    return processWithFilters(input, (off, src) => {
      let node: AudioNode = src
      for (const f of fm.slice(0, 3)) {
        const p = off.createBiquadFilter()
        p.type = 'peaking'
        p.frequency.value = f
        p.Q.value = 4
        p.gain.value = db * 0.8
        node.connect(p)
        node = p
      }
      const c = off.createDynamicsCompressor()
      c.threshold.value = -18
      c.knee.value = 12
      c.ratio.value = 2.5
      c.attack.value = 0.01
      c.release.value = 0.15
      node.connect(c)
      return c
    })
  }
  if (id === 'consonant-focus') {
    return processWithFilters(input, (off, src) => {
      const p1 = off.createBiquadFilter()
      p1.type = 'peaking'
      p1.frequency.value = 3000
      p1.Q.value = 1.5
      p1.gain.value = db
      const p2 = off.createBiquadFilter()
      p2.type = 'peaking'
      p2.frequency.value = 5500
      p2.Q.value = 1.2
      p2.gain.value = db * 0.9
      const c = off.createDynamicsCompressor()
      c.threshold.value = -20
      c.knee.value = 8
      c.ratio.value = 3
      c.attack.value = 0.002
      c.release.value = 0.1
      src.connect(p1).connect(p2).connect(c)
      return c
    })
  }
  if (id === 'loudness-curve') {
    return processWithFilters(input, (off, src) => {
      const lo = off.createBiquadFilter()
      lo.type = 'lowshelf'
      lo.frequency.value = 200
      lo.gain.value = -db * 0.4
      const mid = off.createBiquadFilter()
      mid.type = 'peaking'
      mid.frequency.value = 3200
      mid.Q.value = 0.9
      mid.gain.value = db
      const hi = off.createBiquadFilter()
      hi.type = 'highshelf'
      hi.frequency.value = 8000
      hi.gain.value = db * 0.5
      const c = off.createDynamicsCompressor()
      c.threshold.value = -16
      c.knee.value = 10
      c.ratio.value = 2.5
      c.attack.value = 0.01
      c.release.value = 0.15
      src.connect(lo).connect(mid).connect(hi).connect(c)
      return c
    })
  }
  return processWithFilters(input, (off, src) => {
    if (id === 'static') {
      const p = off.createBiquadFilter()
      p.type = 'peaking'
      p.frequency.value = 1800
      p.Q.value = 1.2
      p.gain.value = db
      const c = off.createDynamicsCompressor()
      c.threshold.value = -18
      c.knee.value = 12
      c.ratio.value = 2.5
      c.attack.value = 0.01
      c.release.value = 0.15
      src.connect(p).connect(c)
      return c
    }
    if (id === 'multiband') {
      const p1 = off.createBiquadFilter()
      p1.type = 'peaking'
      p1.frequency.value = 1500
      p1.Q.value = 1.2
      p1.gain.value = db
      const p2 = off.createBiquadFilter()
      p2.type = 'peaking'
      p2.frequency.value = 2500
      p2.Q.value = 1.4
      p2.gain.value = db * 0.8
      const p3 = off.createBiquadFilter()
      p3.type = 'peaking'
      p3.frequency.value = 4000
      p3.Q.value = 1.6
      p3.gain.value = db * 0.5
      const c = off.createDynamicsCompressor()
      c.threshold.value = -16
      c.knee.value = 10
      c.ratio.value = 3
      c.attack.value = 0.005
      c.release.value = 0.12
      src.connect(p1).connect(p2).connect(p3).connect(c)
      return c
    }
    const sh = off.createBiquadFilter()
    sh.type = 'highshelf'
    sh.frequency.value = 2000
    sh.gain.value = db
    const c = off.createDynamicsCompressor()
    c.threshold.value = -22
    c.knee.value = 18
    c.ratio.value = 4
    c.attack.value = 0.003
    c.release.value = 0.08
    const c2 = off.createDynamicsCompressor()
    c2.threshold.value = -10
    c2.knee.value = 6
    c2.ratio.value = 2
    c2.attack.value = 0.02
    c2.release.value = 0.25
    src.connect(sh).connect(c).connect(c2)
    return c2
  })
}
// =========================================================================
// STAGE 8 — SOFT CLIP (8 variants)
// =========================================================================
type ClipType =
  | 'soft'
  | 'tanh'
  | 'atan'
  | 'hard'
  | 'cubic'
  | 'wavefolder'
  | 'foldback'
  | 'norm-only'
// =========================================================================
// METHOD ID + DISPATCH
// =========================================================================
type MethodId =
  | 'sbr'
  | 'fold'
  | 'sourcefilter'
  | 'tts'
  | 'formant'
  | 'consonant'
  | 'humanize'
  | 'cepstral'
  | 'vocoder'
  | 'lfglottal'
  | 'voweltract'
  | 'sinusoidal'
  | 'phasevocoder'
  | 'granular'
  | 'chaotic'
  | 'harmonic-formant'
  | 'cepstral-pulse'
  | 'tilt-inpaint'
async function computeMethodBuffer(
  id: MethodId,
  ctx: AudioContext | OfflineAudioContext,
  orig: AudioBuffer,
  electro: AudioBuffer,
  elPitch: number,
  elTissue: number,
  bweStrength: number,
): Promise<AudioBuffer | null> {
  switch (id) {
    case 'sbr':
      return methodSBR(electro, ctx, elTissue, bweStrength)
    case 'fold':
      return methodFold(electro, ctx, elTissue, bweStrength)
    case 'sourcefilter':
      return methodSourceFilter(orig, ctx, bweStrength)
    case 'formant':
      return methodFormantTracked(orig, ctx, bweStrength, elPitch)
    case 'consonant':
      return methodConsonantNoise(orig, ctx, bweStrength)
    case 'humanize':
      return methodHumanizer(orig, ctx, bweStrength, elPitch)
    case 'cepstral':
      return methodCepstralInpaint(orig, ctx, elTissue, bweStrength)
    case 'vocoder':
      return methodChannelVocoder(electro, ctx, bweStrength, elPitch)
    case 'lfglottal':
      return methodLFGlottal(orig, ctx, bweStrength, elPitch)
    case 'voweltract':
      return methodVowelTract(orig, ctx, bweStrength, elPitch)
    case 'sinusoidal':
      return methodSinusoidal(orig, ctx, elTissue, bweStrength)
    case 'phasevocoder':
      return methodPhaseVocoder(orig, ctx, elTissue, bweStrength)
    case 'granular':
      return methodGranular(orig, ctx, elTissue, bweStrength)
    case 'chaotic':
      return methodChaotic(orig, ctx, bweStrength, elPitch)
    case 'harmonic-formant':
      return methodHarmonicFormant(orig, ctx, bweStrength, elPitch)
    case 'cepstral-pulse':
      return methodCepstralPulse(orig, ctx, elTissue, elPitch)
    case 'tilt-inpaint':
      return methodTiltInpaint(orig, ctx, elTissue, bweStrength)
    default:
      return null
  }
}
// =========================================================================
// ACCURACY METRICS
// =========================================================================
function computeMFCC(
  spec: Float32Array,
  sr: number,
  nMel = 26,
  nCoef = 13,
): Float32Array {
  const N = spec.length * 2
  const melMin = 0
  const melMax = 2595 * Math.log10(1 + sr / 2 / 700)
  const melPts: number[] = []
  for (let i = 0; i <= nMel + 1; i++)
    melPts.push(melMin + (i / (nMel + 1)) * (melMax - melMin))
  const hzPts = melPts.map((m) => 700 * (Math.pow(10, m / 2595) - 1))
  const binPts = hzPts.map((h) =>
    Math.max(0, Math.min(spec.length - 1, Math.floor((h * N) / sr))),
  )
  const melEnergies = new Float32Array(nMel)
  for (let m = 1; m <= nMel; m++) {
    let s = 0
    const lo = binPts[m - 1],
      cen = binPts[m],
      hi = binPts[m + 1]
    for (let k = lo; k < cen; k++) {
      s += spec[k] * ((k - lo) / Math.max(1, cen - lo))
    }
    for (let k = cen; k < hi; k++) {
      s += spec[k] * ((hi - k) / Math.max(1, hi - cen))
    }
    melEnergies[m - 1] = Math.log(s + 1e-9)
  }
  const mfcc = new Float32Array(nCoef)
  for (let i = 0; i < nCoef; i++) {
    let s = 0
    for (let m = 0; m < nMel; m++)
      s += melEnergies[m] * Math.cos((Math.PI * i * (m + 0.5)) / nMel)
    mfcc[i] = s
  }
  return mfcc
}
function cosineSim(a: Float32Array, b: Float32Array): number {
  let dot = 0,
    na = 0,
    nb = 0
  const L = Math.min(a.length, b.length)
  for (let i = 1; i < L; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  return dot / (Math.sqrt(na * nb) + 1e-9)
}
function spectralCentroid(spec: Float32Array, sr: number): number {
  const N = spec.length * 2
  let num = 0,
    den = 0
  for (let k = 1; k < spec.length; k++) {
    const f = (k * sr) / N
    num += f * spec[k]
    den += spec[k]
  }
  return num / (den + 1e-9)
}
function spectralFlatness(spec: Float32Array): number {
  let geo = 0,
    arith = 0,
    nz = 0
  for (let k = 1; k < spec.length; k++) {
    if (spec[k] > 1e-9) {
      geo += Math.log(spec[k])
      arith += spec[k]
      nz++
    }
  }
  if (nz === 0) return 0
  geo /= nz
  arith /= nz
  return Math.exp(geo) / (arith + 1e-9)
}
function rmsOf(d: Float32Array): number {
  let s = 0
  for (let i = 0; i < d.length; i++) s += d[i] * d[i]
  return Math.sqrt(s / d.length)
}
function zcrOf(d: Float32Array): number {
  let z = 0
  for (let i = 1; i < d.length; i++) if (d[i] >= 0 !== d[i - 1] >= 0) z++
  return z / d.length
}
type AccuracyMetrics = {
  spectralCorr: number
  mfccSim: number
  pitchAcc: number
  centroidSim: number
  flatnessSim: number
  rmsSim: number
  zcrSim: number
  composite: number
}
function computeAccuracy(
  orig: AudioBuffer,
  recon: AudioBuffer,
): AccuracyMetrics {
  const sr = orig.sampleRate
  const winSize = 4096
  const oD = orig.getChannelData(0),
    rD = recon.getChannelData(0)
  const oS = Math.max(0, Math.floor(oD.length / 2 - winSize / 2))
  const rS = Math.max(0, Math.floor(rD.length / 2 - winSize / 2))
  const oWin = new Float32Array(Math.min(winSize, oD.length))
  const rWin = new Float32Array(Math.min(winSize, rD.length))
  for (let i = 0; i < oWin.length; i++) oWin[i] = oD[oS + i] || 0
  for (let i = 0; i < rWin.length; i++) rWin[i] = rD[rS + i] || 0
  let oP = 0,
    rP = 0
  for (let i = 0; i < oWin.length; i++) {
    if (Math.abs(oWin[i]) > oP) oP = Math.abs(oWin[i])
  }
  for (let i = 0; i < rWin.length; i++) {
    if (Math.abs(rWin[i]) > rP) rP = Math.abs(rWin[i])
  }
  if (oP > 1e-9) for (let i = 0; i < oWin.length; i++) oWin[i] /= oP
  if (rP > 1e-9) for (let i = 0; i < rWin.length; i++) rWin[i] /= rP
  const oSpec = magnitudeSpectrum(oWin, 4096)
  const rSpec = magnitudeSpectrum(rWin, 4096)
  const logO = new Float32Array(oSpec.length),
    logR = new Float32Array(rSpec.length)
  for (let i = 0; i < oSpec.length; i++) {
    logO[i] = Math.log(oSpec[i] + 1e-9)
    logR[i] = Math.log(rSpec[i] + 1e-9)
  }
  let mO = 0,
    mR = 0
  for (let i = 0; i < logO.length; i++) {
    mO += logO[i]
    mR += logR[i]
  }
  mO /= logO.length
  mR /= logR.length
  let num = 0,
    dO = 0,
    dR = 0
  for (let i = 0; i < logO.length; i++) {
    const a = logO[i] - mO,
      b = logR[i] - mR
    num += a * b
    dO += a * a
    dR += b * b
  }
  const corr = num / (Math.sqrt(dO * dR) + 1e-9)
  const spectralCorr = Math.max(0, Math.min(100, ((corr + 1) / 2) * 100))
  const mfccO = computeMFCC(oSpec, sr)
  const mfccR = computeMFCC(rSpec, sr)
  const mfccCos = cosineSim(mfccO, mfccR)
  const mfccSim = Math.max(0, Math.min(100, ((mfccCos + 1) / 2) * 100))
  const f0o = detectPitch(oWin, sr),
    f0r = detectPitch(rWin, sr)
  let pitchAcc = 0
  if (f0o > 0 && f0r > 0) {
    const err = Math.abs(f0o - f0r) / f0o
    pitchAcc = Math.max(0, 100 - err * 200)
  } else if (f0o === 0 && f0r === 0) pitchAcc = 100
  else pitchAcc = 50
  const co = spectralCentroid(oSpec, sr),
    cr = spectralCentroid(rSpec, sr)
  const cDiff = Math.abs(co - cr) / Math.max(co, 1)
  const centroidSim = Math.max(0, 100 - cDiff * 100)
  const fO = spectralFlatness(oSpec),
    fR = spectralFlatness(rSpec)
  const fDiff = Math.abs(fO - fR)
  const flatnessSim = Math.max(0, 100 - fDiff * 200)
  const ro = rmsOf(orig.getChannelData(0)),
    rr = rmsOf(recon.getChannelData(0))
  const rmsDiff = Math.abs(ro - rr) / Math.max(ro, 1e-6)
  const rmsSim = Math.max(0, Math.min(100, 100 - rmsDiff * 50))
  const zo = zcrOf(orig.getChannelData(0)),
    zr = zcrOf(recon.getChannelData(0))
  const zDiff = Math.abs(zo - zr)
  const zcrSim = Math.max(0, 100 - zDiff * 500)
  const composite =
    spectralCorr * 0.35 +
    mfccSim * 0.25 +
    pitchAcc * 0.1 +
    centroidSim * 0.1 +
    flatnessSim * 0.05 +
    rmsSim * 0.1 +
    zcrSim * 0.05
  return {
    spectralCorr,
    mfccSim,
    pitchAcc,
    centroidSim,
    flatnessSim,
    rmsSim,
    zcrSim,
    composite,
  }
}
// =========================================================================
// CUSTOM REFERENCE GENERATION
// =========================================================================
async function generateCustomReference(
  customBuf: AudioBuffer,
  ctx: AudioContext | OfflineAudioContext,
): Promise<AudioBuffer> {
  // Synthesize a "full voice" reference from the custom electrolarynx audio
  // using an idealized source-filter model (LPC + mixed excitation)
  const sr = customBuf.sampleRate
  const synth = lpcAR(
    customBuf.getChannelData(0),
    sr,
    (idx, len, fr, g, f0, v) => mixedExcitation(len, sr, f0 || 120, g * 1.5, v),
    14,
  )
  const b = bufferFromArray(synth, sr, ctx)
  return processWithFilters(b, (off, src) => {
    const lp = off.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 6000
    src.connect(lp)
    return lp
  })
}
// =========================================================================
// VISUALIZATION
// =========================================================================
const Waveform: React.FC<{
  buffer: AudioBuffer | null
  color?: string
  height?: number
}> = ({ buffer, color = '#0891b2', height = 60 }) => {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const dpr = window.devicePixelRatio || 1
    const w = c.clientWidth,
      h = c.clientHeight
    c.width = w * dpr
    c.height = h * dpr
    const ctx = c.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(15,23,42,0.04)'
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(15,23,42,0.1)'
    ctx.beginPath()
    ctx.moveTo(0, h / 2)
    ctx.lineTo(w, h / 2)
    ctx.stroke()
    if (!buffer) return
    const ps = getPeaks(buffer, w)
    ctx.strokeStyle = color
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let i = 0; i < ps.length; i++) {
      ctx.moveTo(i + 0.5, (1 - ps[i].max) * 0.5 * h)
      ctx.lineTo(i + 0.5, (1 - ps[i].min) * 0.5 * h)
    }
    ctx.stroke()
  }, [buffer, color])
  return (
    <canvas
      ref={ref}
      style={{
        width: '100%',
        height,
      }}
      className="rounded-md bg-white/40 border border-slate-200"
    />
  )
}
const Spectrum: React.FC<{
  buffer: AudioBuffer | null
  color?: string
  height?: number
  maxHz?: number
}> = ({ buffer, color = '#7c3aed', height = 60, maxHz = 8000 }) => {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const dpr = window.devicePixelRatio || 1
    const w = c.clientWidth,
      h = c.clientHeight
    c.width = w * dpr
    c.height = h * dpr
    const ctx = c.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(15,23,42,0.04)'
    ctx.fillRect(0, 0, w, h)
    if (!buffer) return
    const d = buffer.getChannelData(0),
      N = 2048
    const s = Math.max(0, Math.floor(d.length / 2 - N / 2)),
      seg = d.slice(s, s + N)
    const m = magnitudeSpectrum(seg, N),
      bh = buffer.sampleRate / N
    const mb = Math.min(m.length - 1, Math.floor(maxHz / bh))
    let p = 1e-9
    for (let i = 1; i <= mb; i++) if (m[i] > p) p = m[i]
    ctx.fillStyle = color
    for (let i = 1; i <= mb; i++) {
      const x = ((i - 1) / (mb - 1)) * w
      const db = 20 * Math.log10(m[i] / p + 1e-6)
      const y = Math.max(0, Math.min(1, (db + 60) / 60))
      ctx.fillRect(x, h - y * (h - 4), Math.max(1, w / mb), y * (h - 4))
    }
    ctx.fillStyle = 'rgba(15,23,42,0.4)'
    ctx.font = '9px ui-monospace, monospace'
    for (let f = 1000; f < maxHz; f += 1000) {
      const x = (f / maxHz) * w
      ctx.fillRect(x, h - 3, 1, 3)
      ctx.fillText(`${f / 1000}k`, x + 2, h - 5)
    }
  }, [buffer, color, maxHz])
  return (
    <canvas
      ref={ref}
      style={{
        width: '100%',
        height,
      }}
      className="rounded-md bg-white/40 border border-slate-200"
    />
  )
}
const LevelMeter: React.FC<{
  analyser: AnalyserNode | null
}> = ({ analyser }) => {
  const [lv, setLv] = useState(0)
  useEffect(() => {
    if (!analyser) return
    const d = new Uint8Array(analyser.fftSize)
    let raf = 0
    const t = () => {
      analyser.getByteTimeDomainData(d)
      let s = 0
      for (let i = 0; i < d.length; i++) {
        const v = (d[i] - 128) / 128
        s += v * v
      }
      setLv(Math.sqrt(s / d.length))
      raf = requestAnimationFrame(t)
    }
    t()
    return () => cancelAnimationFrame(raf)
  }, [analyser])
  return (
    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-[width] duration-75"
        style={{
          width: `${Math.min(100, lv * 200)}%`,
        }}
      />
    </div>
  )
}
// =========================================================================
// PLAYBACK
// =========================================================================
function usePlayback() {
  const ctxRef = useRef<AudioContext | null>(null),
    srcRef = useRef<AudioBufferSourceNode | null>(null),
    tok = useRef(0)
  const [pid, setPid] = useState<string | null>(null)
  const getCtx = () => {
    if (!ctxRef.current)
      ctxRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)()
    return ctxRef.current!
  }
  const stop = useCallback(() => {
    tok.current++
    if (srcRef.current) {
      try {
        srcRef.current.onended = null
      } catch {}
      try {
        srcRef.current.stop()
      } catch {}
      try {
        srcRef.current.disconnect()
      } catch {}
      srcRef.current = null
    }
    try {
      window.speechSynthesis?.cancel()
    } catch {}
    setPid(null)
  }, [])
  const play = useCallback(
    (b: AudioBuffer, id: string) => {
      stop()
      const ctx = getCtx()
      if (ctx.state === 'suspended') ctx.resume()
      const s = ctx.createBufferSource()
      s.buffer = b
      s.connect(ctx.destination)
      const t = ++tok.current
      s.onended = () => {
        if (tok.current === t) {
          srcRef.current = null
          setPid(null)
        }
      }
      s.start()
      srcRef.current = s
      setPid(id)
    },
    [stop],
  )
  const speakText = useCallback(
    (txt: string, id: string) => {
      stop()
      const u = new SpeechSynthesisUtterance(txt)
      u.onend = () => setPid(null)
      window.speechSynthesis.speak(u)
      setPid(id)
    },
    [stop],
  )
  return {
    play,
    stop,
    speakText,
    playingId: pid,
    getCtx,
  }
}
// =========================================================================
// VARIANT METADATA
// =========================================================================
type VariantMeta = {
  id: string
  name: string
  short: string
  desc: string
}
const DESTRUCTIVE_VARIANTS: VariantMeta[] = [
  {
    id: 'phase-invert',
    name: 'Phase Invert',
    short: 'PhInv',
    desc: 'y(t) = −x(t). Perfect cancellation when summed.',
  },
  {
    id: 'inverse-stamp',
    name: 'Inverse Stamp',
    short: 'InvSt',
    desc: 'Noise where signal is silent, silence where signal exists.',
  },
  {
    id: 'negative-mask',
    name: 'Negative Mask',
    short: 'NegMask',
    desc: 'Threshold-gated inverse: noise below amplitude threshold.',
  },
  {
    id: 'spectral-null',
    name: 'Spectral Null',
    short: 'SpecNull',
    desc: 'Zero out top 10% spectral peaks, invert residual.',
  },
  {
    id: 'transient-erase',
    name: 'Transient Erase',
    short: 'TransEr',
    desc: 'Phase-invert only the high band (>1.5kHz).',
  },
  {
    id: 'envelope-inverse',
    name: 'Envelope Inverse',
    short: 'EnvInv',
    desc: 'Tone modulated by inverse envelope — fills silences.',
  },
]
const ADDITIVE_VARIANTS: VariantMeta[] = [
  {
    id: 'sii-weighted',
    name: 'SII-Weighted',
    short: 'SII',
    desc: 'ANSI S3.5 Speech Intelligibility Index curve, 1.5–4 kHz lift.',
  },
  {
    id: 'formant-boost',
    name: 'Formant Boost',
    short: 'Formant',
    desc: 'LPC-tracked F1/F2/F3, add pure sinusoids at formant peaks.',
  },
  {
    id: 'harmonic-stack',
    name: 'Harmonic Stack',
    short: 'Harm',
    desc: 'Reinforce detected pitch harmonics 2–8.',
  },
  {
    id: 'presence-shelf',
    name: 'Presence Shelf',
    short: 'Pres',
    desc: 'Simple high-shelf at 3 kHz for psychoacoustic lift.',
  },
  {
    id: 'transient-emphasis',
    name: 'Transient Emphasis',
    short: 'Trans',
    desc: 'Boost sample-to-sample differences — plosive bursts.',
  },
  {
    id: 'pink-fill',
    name: 'Pink Fill',
    short: 'Pink',
    desc: 'Shaped broadband noise (1/f pink) for clarity test.',
  },
]
const ELECTRO_VARIANTS: VariantMeta[] = [
  {
    id: 'pulse-fixed',
    name: 'Pulse · Fixed',
    short: 'PulseFix',
    desc: 'Monotone pulse train. Like a real Servox electrolarynx.',
  },
  {
    id: 'pulse-jittery',
    name: 'Pulse · Jitter',
    short: 'PulseJit',
    desc: '±2% cycle jitter for naturalness (Hillenbrand 1996).',
  },
  {
    id: 'pulse-follow',
    name: 'Pulse · Pitch-Follow',
    short: 'PulseFol',
    desc: 'Pulse train tracks detected f₀ per frame.',
  },
  {
    id: 'lf-glottal-el',
    name: 'LF Glottal',
    short: 'LF',
    desc: 'Liljencrants–Fant glottal pulse model (Fant 1985).',
  },
  {
    id: 'mixed-noise-el',
    name: 'Mixed Excite',
    short: 'Mixed',
    desc: 'Pulse + noise excitation, voicing-gated (Klatt 1980).',
  },
  {
    id: 'dual-pitch',
    name: 'Dual Pitch',
    short: 'Dual',
    desc: 'Pseudo-chorus: two pulse trains at f₀ and 1.5·f₀.',
  },
  {
    id: 'spectral-lpf',
    name: 'Spectral LPF',
    short: 'SpecLPF',
    desc: 'FFT brick-wall low-pass tissue model (sharper cutoff).',
  },
]
const HF_VARIANTS: (VariantMeta & {
  id: MethodId
})[] = [
  {
    id: 'sbr',
    name: 'Non-linear SBR',
    short: 'SBR',
    desc: 'HE-AAC standard: tanh saturation + LTASS shaping.',
  },
  {
    id: 'fold',
    name: 'Spectral Folding',
    short: 'Fold',
    desc: 'Hilbert SSB up-translation (Liu 2010).',
  },
  {
    id: 'sourcefilter',
    name: 'Source–Filter',
    short: 'SrcFlt',
    desc: 'LPC envelope + broadband excitation (Klatt 1980).',
  },
  {
    id: 'tts',
    name: 'ASR→TTS',
    short: 'TTS',
    desc: 'Web Speech API: recognise words, resynthesize.',
  },
  {
    id: 'formant',
    name: 'Formant-Tracked',
    short: 'Formant',
    desc: 'LPC peak-pick F1–F4, resonant biquad cascades.',
  },
  {
    id: 'consonant',
    name: 'Consonant Burst',
    short: 'Cons',
    desc: 'Phonetic-feature detector for fricatives/plosives.',
  },
  {
    id: 'humanize',
    name: 'Humanizer',
    short: 'Human',
    desc: 'Jitter, shimmer, breathiness to reduce robotic artefacts.',
  },
  {
    id: 'cepstral',
    name: 'Cepstral Inpaint',
    short: 'Cepstral',
    desc: 'Liftered cepstral envelope, slope-extrapolated.',
  },
  {
    id: 'vocoder',
    name: 'Channel Vocoder',
    short: 'ChVoc',
    desc: '12 critical-band envelopes modulate harmonic carrier.',
  },
  {
    id: 'lfglottal',
    name: 'LF Glottal',
    short: 'LF-HF',
    desc: 'Liljencrants–Fant glottal pulse replacing raw pulse.',
  },
  {
    id: 'voweltract',
    name: 'Vowel-Tract Tube',
    short: 'Vowel',
    desc: 'Classify to nearest cardinal vowel, drive formant tube.',
  },
  {
    id: 'sinusoidal',
    name: 'Sinusoidal Model',
    short: 'Sinus',
    desc: 'Track top partials, extrapolate harmonics.',
  },
  {
    id: 'phasevocoder',
    name: 'Phase Vocoder',
    short: 'PhVoc',
    desc: 'Frequency-domain spectral stretch, random phase reseed.',
  },
  {
    id: 'granular',
    name: 'Granular Texture',
    short: 'Grain',
    desc: 'Scatter 12 ms grains at 1.7× pitch shift, high-pass.',
  },
  {
    id: 'chaotic',
    name: 'Chaotic Exciter',
    short: 'Chaos',
    desc: 'Logistic-map oscillator drives LPC filter.',
  },
  {
    id: 'harmonic-formant',
    name: 'Harmonic·Formant',
    short: 'HarmForm',
    desc: 'Harmonic series weighted by formant proximity.',
  },
  {
    id: 'cepstral-pulse',
    name: 'Cepstral × Pulse',
    short: 'CepPulse',
    desc: 'Pulse train filtered by smoothed cepstral envelope.',
  },
  {
    id: 'tilt-inpaint',
    name: 'Log-Tilt Inpaint',
    short: 'LogTilt',
    desc: 'Linear regression of log-mag tilt below cutoff.',
  },
]
const FUSION_VARIANTS: VariantMeta[] = [
  {
    id: 'sum',
    name: 'Direct Sum',
    short: 'Sum',
    desc: 'Simple addition of low and high bands.',
  },
  {
    id: 'crossover',
    name: 'Crossover',
    short: 'Cross',
    desc: '2nd-order Butterworth crossover, Q=0.707.',
  },
  {
    id: 'spectral-merge',
    name: 'Spectral Merge',
    short: 'Spec',
    desc: 'FFT-domain crossfade around cutoff.',
  },
  {
    id: 'linkwitz-riley',
    name: 'Linkwitz–Riley',
    short: 'LR',
    desc: '4th-order phase-aligned crossover, steeper slopes.',
  },
  {
    id: 'match-eq',
    name: 'Match EQ',
    short: 'MatchEQ',
    desc: 'Reshape high band to follow low-band envelope.',
  },
  {
    id: 'dynamic-blend',
    name: 'Dynamic Blend',
    short: 'DynBlend',
    desc: 'Mix tracks low-band energy — more low when loud.',
  },
  {
    id: 'envmod-rms',
    name: 'Envelope RMS',
    short: 'EnvRMS',
    desc: 'Highs gated by short-window low-band RMS.',
  },
]
const BOOST_VARIANTS: VariantMeta[] = [
  {
    id: 'bypass',
    name: 'Bypass',
    short: 'Bypass',
    desc: 'No boost. Clean A/B reference.',
  },
  {
    id: 'formant-aware',
    name: 'Formant-Aware',
    short: 'Formant',
    desc: 'Track formants, boost only near F2/F3.',
  },
  {
    id: 'consonant-focus',
    name: 'Consonant Focus',
    short: 'Cons',
    desc: 'Peaks at 3 kHz and 5.5 kHz for fricatives/plosives.',
  },
  {
    id: 'loudness-curve',
    name: 'Loudness Curve',
    short: 'Loudness',
    desc: 'ISO 226 inverse equal-loudness contour weighting.',
  },
  {
    id: 'static',
    name: 'Static SII',
    short: 'Static',
    desc: 'Fixed 1.8 kHz bandpass, constant gain.',
  },
  {
    id: 'multiband',
    name: 'Multiband',
    short: 'Multi',
    desc: 'Three-band split: 1.5k, 2.5k, 4k, different gains.',
  },
]
const CLIP_VARIANTS: VariantMeta[] = [
  {
    id: 'soft',
    name: 'Soft Rational',
    short: 'Soft',
    desc: 'x/(1+k|x|). Smooth, minimal harmonics.',
  },
  {
    id: 'tanh',
    name: 'Tanh',
    short: 'Tanh',
    desc: 'Hyperbolic tangent. Gentle even harmonics.',
  },
  {
    id: 'atan',
    name: 'Arctangent',
    short: 'Atan',
    desc: 'Arctangent saturation. Slightly brighter than tanh.',
  },
  {
    id: 'hard',
    name: 'Hard Clip',
    short: 'Hard',
    desc: 'Brick-wall ±1. Adds odd-order distortion.',
  },
  {
    id: 'cubic',
    name: 'Cubic',
    short: 'Cubic',
    desc: 'x - x³/3. Polynomial soft clip.',
  },
  {
    id: 'wavefolder',
    name: 'Wavefolder',
    short: 'Fold',
    desc: 'sin(x·π/2). Extreme aliased timbre.',
  },
  {
    id: 'foldback',
    name: 'Foldback',
    short: 'Foldback',
    desc: 'Recursive wrap-around. Chaotic edge case.',
  },
  {
    id: 'norm-only',
    name: 'Normalize Only',
    short: 'Norm',
    desc: 'Peak normalize to 0.95, no saturation.',
  },
]
// =========================================================================
// MAIN APP STATE & TYPES
// =========================================================================
type Stage =
  | 'destructive'
  | 'additive'
  | 'electro'
  | 'methods'
  | 'fusion'
  | 'boost'
  | 'final'
  | null
type AppliedChoices = {
  destructive: DestructiveId
  additive: AdditiveId
  electro: ElectroId
  method: MethodId
  fusion: FusionId
  boost: BoostId
  clip: ClipType
}
const DEFAULT_CHOICES: AppliedChoices = {
  destructive: 'phase-invert',
  additive: 'sii-weighted',
  electro: 'pulse-fixed',
  method: 'sbr',
  fusion: 'crossover',
  boost: 'multiband',
  clip: 'soft',
}
type IterResult = {
  combo: {
    destructive: DestructiveId
    additive: AdditiveId
    electro: ElectroId | 'custom'
    method: MethodId
    fusion: FusionId
    boost: BoostId
    clip: ClipType
  }
  metrics: AccuracyMetrics
  rank: number
}
const METRIC_INFO: {
  key: keyof AccuracyMetrics
  label: string
  weight: number
  tip: string
}[] = [
  {
    key: 'spectralCorr',
    label: 'Spectral Corr',
    weight: 35,
    tip: 'Pearson correlation of log-magnitude FFT spectra. The single most informative timbre metric.',
  },
  {
    key: 'mfccSim',
    label: 'MFCC Cosine',
    weight: 25,
    tip: 'Cosine similarity of 13-coefficient MFCCs. Mel-scale matches human perception of timbre.',
  },
  {
    key: 'pitchAcc',
    label: 'Pitch Match',
    weight: 10,
    tip: 'How closely the detected f₀ of the reconstruction matches the original.',
  },
  {
    key: 'centroidSim',
    label: 'Brightness',
    weight: 10,
    tip: 'Spectral centroid match — proxy for perceived brightness.',
  },
  {
    key: 'rmsSim',
    label: 'Loudness',
    weight: 10,
    tip: 'RMS-energy match. Are the two clips at similar perceived loudness?',
  },
  {
    key: 'flatnessSim',
    label: 'Spectral Flatness',
    weight: 5,
    tip: 'Match of tonal-vs-noisy character (Wiener entropy proxy).',
  },
  {
    key: 'zcrSim',
    label: 'ZCR Match',
    weight: 5,
    tip: 'Zero-crossing rate similarity — quick proxy for high-frequency energy ratio.',
  },
]
const MAX_ITER_SAMPLES = 15000
export function App() {
  const { play, stop, speakText, playingId, getCtx } = usePlayback()
  // Recording
  const [recording, setRecording] = useState(false)
  const [recDuration, setRecDuration] = useState(0)
  const [statusMsg, setStatusMsg] = useState(
    'Press the mic. Speak a short sentence (4 seconds).',
  )
  const [error, setError] = useState<string | null>(null)
  const [transcript, setTranscript] = useState('')
  // Parameters
  const [elPitch, setElPitch] = useState(100)
  const [elTissue, setElTissue] = useState(3200)
  const [boostDb, setBoostDb] = useState(4)
  const [bweStrength, setBweStrength] = useState(0.55)
  const [clipK, setClipK] = useState(0.4)
  const [crossHz, setCrossHz] = useState(1200)
  // Choices
  const [applied, setApplied] = useState<AppliedChoices>(DEFAULT_CHOICES)
  const [pending, setPending] = useState<AppliedChoices>(DEFAULT_CHOICES)
  // Buffers
  const [bufOriginal, setBufOriginal] = useState<AudioBuffer | null>(null)
  const [bufDestructive, setBufDestructive] = useState<AudioBuffer | null>(null)
  const [bufCancel, setBufCancel] = useState<AudioBuffer | null>(null)
  const [bufAdditive, setBufAdditive] = useState<AudioBuffer | null>(null)
  const [bufBoosted, setBufBoosted] = useState<AudioBuffer | null>(null)
  const [bufElectro, setBufElectro] = useState<AudioBuffer | null>(null)
  const [methodBufs, setMethodBufs] = useState<
    Partial<Record<MethodId, AudioBuffer>>
  >({})
  const [bufFused, setBufFused] = useState<AudioBuffer | null>(null)
  const [bufFinalBoosted, setBufFinalBoosted] = useState<AudioBuffer | null>(
    null,
  )
  const [bufFinal, setBufFinal] = useState<AudioBuffer | null>(null)
  // Per-variant previews
  const [destructivePreviews, setDestructivePreviews] = useState<
    Partial<Record<DestructiveId, AudioBuffer>>
  >({})
  const [additivePreviews, setAdditivePreviews] = useState<
    Partial<Record<AdditiveId, AudioBuffer>>
  >({})
  const [electroPreviews, setElectroPreviews] = useState<
    Partial<Record<ElectroId, AudioBuffer>>
  >({})
  const [fusionPreviews, setFusionPreviews] = useState<
    Partial<Record<FusionId, AudioBuffer>>
  >({})
  const [boostPreviews, setBoostPreviews] = useState<
    Partial<Record<BoostId, AudioBuffer>>
  >({})
  const [clipPreviews, setClipPreviews] = useState<
    Partial<Record<ClipType, AudioBuffer>>
  >({})
  const [detectedF0, setDetectedF0] = useState(0)
  const [stageRunning, setStageRunning] = useState<Stage>(null)
  // Accuracy + iteration state
  const [currentAccuracy, setCurrentAccuracy] =
    useState<AccuracyMetrics | null>(null)
  const [iterRunning, setIterRunning] = useState(false)
  const [iterProgress, setIterProgress] = useState(0)
  const [iterTotal, setIterTotal] = useState(0)
  const [iterStatus, setIterStatus] = useState('')
  const [iterResults, setIterResults] = useState<IterResult[]>([])
  const [iterTopBuffers, setIterTopBuffers] = useState<(AudioBuffer | null)[]>(
    [],
  )
  const iterCancelRef = useRef(false)
  const [topRenderCache, setTopRenderCache] = useState<
    Map<string, AudioBuffer>
  >(new Map())
  // Custom electrolarynx mode
  const [customElectroMode, setCustomElectroMode] = useState(false)
  const [customElectroBuffer, setCustomElectroBuffer] =
    useState<AudioBuffer | null>(null)
  const [customReferenceBuffer, setCustomReferenceBuffer] =
    useState<AudioBuffer | null>(null)
  const [recordingCustomElectro, setRecordingCustomElectro] = useState(false)
  const [customTranscript, setCustomTranscript] = useState('')
  const customElectroRecChunksRef = useRef<Float32Array[]>([])
  const customElectroStreamRef = useRef<MediaStream | null>(null)
  const customElectroCtxRef = useRef<AudioContext | null>(null)
  const customElectroProcessorRef = useRef<ScriptProcessorNode | null>(null)
  const customSpeechRecRef = useRef<any>(null)
  // Refs
  const liveAnalyserRef = useRef<AnalyserNode | null>(null)
  const [liveAnalyser, setLiveAnalyser] = useState<AnalyserNode | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const recCtxRef = useRef<AudioContext | null>(null)
  const recProcessorRef = useRef<ScriptProcessorNode | null>(null)
  const recChunksRef = useRef<Float32Array[]>([])
  const recSampleRateRef = useRef(48000)
  const recStartRef = useRef(0)
  const recTimerRef = useRef<number | null>(null)
  const speechRecRef = useRef<any>(null)
  const cleanup = useCallback(() => {
    if (recProcessorRef.current) {
      try {
        recProcessorRef.current.disconnect()
      } catch {}
      recProcessorRef.current = null
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop())
      mediaStreamRef.current = null
    }
    if (recCtxRef.current) {
      try {
        recCtxRef.current.close()
      } catch {}
      recCtxRef.current = null
    }
    if (recTimerRef.current) {
      window.clearInterval(recTimerRef.current)
      recTimerRef.current = null
    }
    if (speechRecRef.current) {
      try {
        speechRecRef.current.stop()
      } catch {}
      speechRecRef.current = null
    }
    liveAnalyserRef.current = null
    setLiveAnalyser(null)
  }, [])
  const cleanupCustomElectro = useCallback(() => {
    if (customElectroProcessorRef.current) {
      try {
        customElectroProcessorRef.current.disconnect()
      } catch {}
      customElectroProcessorRef.current = null
    }
    if (customElectroStreamRef.current) {
      customElectroStreamRef.current.getTracks().forEach((t) => t.stop())
      customElectroStreamRef.current = null
    }
    if (customElectroCtxRef.current) {
      try {
        customElectroCtxRef.current.close()
      } catch {}
      customElectroCtxRef.current = null
    }
    if (customSpeechRecRef.current) {
      try {
        customSpeechRecRef.current.stop()
      } catch {}
      customSpeechRecRef.current = null
    }
  }, [])
  // =====================================================================
  // PIPELINE
  // =====================================================================
  const runFrom = useCallback(
    async (
      startStage: Stage,
      choices: AppliedChoices,
      original: AudioBuffer | null,
    ) => {
      if (!original && !customElectroMode) return
      const ctx = getCtx()
      const order: Exclude<Stage, null>[] = [
        'destructive',
        'additive',
        'electro',
        'methods',
        'fusion',
        'boost',
        'final',
      ]
      const startIdx = startStage ? order.indexOf(startStage as any) : 0
      let curDestructive = bufDestructive
      let curAdditive = bufAdditive
      let curElectro = bufElectro
      let curMethodBufs: Partial<Record<MethodId, AudioBuffer>> = {
        ...methodBufs,
      }
      let curFused = bufFused
      let curBoosted = bufFinalBoosted
      if (startIdx <= 0 && original) {
        setStageRunning('destructive')
        const f0 = detectPitch(original.getChannelData(0), original.sampleRate)
        setDetectedF0(f0)
        const dest = await buildDestructive(choices.destructive, original, ctx)
        curDestructive = dest
        setBufDestructive(dest)
        setBufCancel(sumBuffers(original, dest, ctx, 1, 1))
        const dprev = await Promise.all(
          DESTRUCTIVE_VARIANTS.map((v) =>
            buildDestructive(v.id as DestructiveId, original, ctx),
          ),
        )
        const dp: Partial<Record<DestructiveId, AudioBuffer>> = {}
        DESTRUCTIVE_VARIANTS.forEach((v, i) => {
          dp[v.id as DestructiveId] = dprev[i]
        })
        setDestructivePreviews(dp)
      }
      if (startIdx <= 1 && original) {
        setStageRunning('additive')
        const add = await buildAdditive(
          choices.additive,
          original,
          ctx,
          boostDb,
        )
        curAdditive = add
        setBufAdditive(add)
        setBufBoosted(
          normalizeBuffer(sumBuffers(original, add, ctx, 1, 1), ctx, 0.95),
        )
        const aprev = await Promise.all(
          ADDITIVE_VARIANTS.map((v) =>
            buildAdditive(v.id as AdditiveId, original, ctx, boostDb),
          ),
        )
        const ap: Partial<Record<AdditiveId, AudioBuffer>> = {}
        ADDITIVE_VARIANTS.forEach((v, i) => {
          ap[v.id as AdditiveId] = aprev[i]
        })
        setAdditivePreviews(ap)
      }
      if (startIdx <= 2) {
        setStageRunning('electro')
        let electro: AudioBuffer
        if (customElectroMode && customElectroBuffer) {
          electro = customElectroBuffer
        } else if (original) {
          electro = await synthElectrolarynx(
            original,
            ctx,
            elPitch,
            elTissue,
            choices.electro,
          )
        } else {
          return // Cannot proceed without original or custom
        }
        curElectro = electro
        setBufElectro(electro)
        if (!customElectroMode && original) {
          const eprev = await Promise.all(
            ELECTRO_VARIANTS.map((v) =>
              synthElectrolarynx(
                original,
                ctx,
                elPitch,
                elTissue,
                v.id as ElectroId,
              ),
            ),
          )
          const ep: Partial<Record<ElectroId, AudioBuffer>> = {}
          ELECTRO_VARIANTS.forEach((v, i) => {
            ep[v.id as ElectroId] = eprev[i]
          })
          setElectroPreviews(ep)
        }
      }
      if (startIdx <= 3) {
        setStageRunning('methods')
        const electroForBwe = curElectro!
        const origForBwe = original || customReferenceBuffer || electroForBwe
        const allIds: MethodId[] = HF_VARIANTS.map((m) => m.id)
        const bufs: Partial<Record<MethodId, AudioBuffer>> = {}
        const results = await Promise.all(
          allIds.map((id) => {
            if (id === 'tts') return Promise.resolve(null)
            return computeMethodBuffer(
              id,
              ctx,
              origForBwe,
              electroForBwe,
              elPitch,
              elTissue,
              bweStrength,
            )
          }),
        )
        allIds.forEach((id, i) => {
          if (results[i]) bufs[id] = results[i]!
        })
        curMethodBufs = bufs
        setMethodBufs(bufs)
      }
      if (startIdx <= 4) {
        setStageRunning('fusion')
        const electroForFuse = curElectro!
        const highBand =
          choices.method !== 'tts'
            ? curMethodBufs[choices.method] || null
            : null
        const fused = highBand
          ? await fuseLowHigh(
              electroForFuse,
              highBand,
              ctx,
              choices.fusion,
              crossHz,
            )
          : electroForFuse
        curFused = fused
        setBufFused(fused)
        if (highBand) {
          const fp = await Promise.all(
            FUSION_VARIANTS.map((v) =>
              fuseLowHigh(
                electroForFuse,
                highBand,
                ctx,
                v.id as FusionId,
                crossHz,
              ),
            ),
          )
          const fpm: Partial<Record<FusionId, AudioBuffer>> = {}
          FUSION_VARIANTS.forEach((v, i) => {
            fpm[v.id as FusionId] = fp[i]
          })
          setFusionPreviews(fpm)
        }
      }
      if (startIdx <= 5) {
        setStageRunning('boost')
        const fusedForBoost = curFused!
        const boosted = await applyBoost(
          fusedForBoost,
          ctx,
          choices.boost,
          boostDb,
        )
        curBoosted = boosted
        setBufFinalBoosted(boosted)
        const bp = await Promise.all(
          BOOST_VARIANTS.map((v) =>
            applyBoost(fusedForBoost, ctx, v.id as BoostId, boostDb),
          ),
        )
        const bpm: Partial<Record<BoostId, AudioBuffer>> = {}
        BOOST_VARIANTS.forEach((v, i) => {
          bpm[v.id as BoostId] = bp[i]
        })
        setBoostPreviews(bpm)
      }
      if (startIdx <= 6) {
        setStageRunning('final')
        const boostedForClip = curBoosted!
        const clipped = softClipBuf(boostedForClip, ctx, choices.clip, clipK)
        const fin = normalizeBuffer(clipped, ctx, 0.95)
        setBufFinal(fin)
        const cp: Partial<Record<ClipType, AudioBuffer>> = {}
        for (const v of CLIP_VARIANTS) {
          const c = softClipBuf(boostedForClip, ctx, v.id as ClipType, clipK)
          cp[v.id as ClipType] = normalizeBuffer(c, ctx, 0.95)
        }
        setClipPreviews(cp)
        // Compute accuracy
        const referenceBuffer =
          customElectroMode && customReferenceBuffer
            ? customReferenceBuffer
            : original
        if (referenceBuffer) {
          const metrics = computeAccuracy(referenceBuffer, fin)
          setCurrentAccuracy(metrics)
        }
      }
      setStageRunning(null)
      setStatusMsg(
        'Pipeline complete. Try a new choice — then hit "Rerun Below" to regenerate.',
      )
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [
      boostDb,
      bweStrength,
      clipK,
      crossHz,
      elPitch,
      elTissue,
      getCtx,
      customElectroMode,
      customElectroBuffer,
      customReferenceBuffer,
    ],
  )
  // Recording
  const finishRecording = useCallback(async () => {
    setRecording(false)
    const chunks = recChunksRef.current
    const total = chunks.reduce((s, c) => s + c.length, 0)
    const merged = new Float32Array(total)
    let off = 0
    for (const c of chunks) {
      merged.set(c, off)
      off += c.length
    }
    const sr = recSampleRateRef.current
    cleanup()
    if (merged.length < sr * 0.3) {
      setError('Too short. Hold for at least half a second.')
      return
    }
    const ctx = getCtx()
    const o = ctx.createBuffer(1, merged.length, sr)
    o.copyToChannel(merged, 0)
    const n = normalizeBuffer(o, ctx, 0.9)
    setBufOriginal(n)
    setIterResults([])
    setIterTopBuffers([])
    setCurrentAccuracy(null)
    setStatusMsg('Processing full pipeline…')
    await runFrom('destructive', applied, n)
  }, [applied, cleanup, getCtx, runFrom])
  const startRecording = useCallback(async () => {
    setError(null)
    setTranscript('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      mediaStreamRef.current = stream
      const ctx = new (window.AudioContext ||
        (window as any).webkitAudioContext)()
      recCtxRef.current = ctx
      recSampleRateRef.current = ctx.sampleRate
      const src = ctx.createMediaStreamSource(stream)
      const an = ctx.createAnalyser()
      an.fftSize = 1024
      src.connect(an)
      liveAnalyserRef.current = an
      setLiveAnalyser(an)
      const p = ctx.createScriptProcessor(4096, 1, 1)
      recChunksRef.current = []
      p.onaudioprocess = (e) =>
        recChunksRef.current.push(
          new Float32Array(e.inputBuffer.getChannelData(0)),
        )
      src.connect(p)
      p.connect(ctx.destination)
      recProcessorRef.current = p
      const SR: any =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
      if (SR) {
        const r = new SR()
        r.continuous = false
        r.interimResults = true
        r.lang = 'en-US'
        r.onresult = (ev: any) => {
          let t = ''
          for (let i = 0; i < ev.results.length; i++)
            t += ev.results[i][0].transcript
          setTranscript(t.trim())
        }
        r.onerror = () => {}
        try {
          r.start()
        } catch {}
        speechRecRef.current = r
      }
      recStartRef.current = performance.now()
      setRecording(true)
      setRecDuration(0)
      setStatusMsg('Recording…')
      recTimerRef.current = window.setInterval(() => {
        const d = (performance.now() - recStartRef.current) / 1000
        setRecDuration(d)
        if (d >= 4) finishRecording()
      }, 50)
    } catch (e: any) {
      setError(e?.message || 'Microphone access denied.')
      cleanup()
      setRecording(false)
    }
  }, [cleanup, finishRecording])
  // Custom electrolarynx recording
  const startRecordingCustomElectro = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })
      customElectroStreamRef.current = stream
      const ctx = new (window.AudioContext ||
        (window as any).webkitAudioContext)()
      customElectroCtxRef.current = ctx
      const src = ctx.createMediaStreamSource(stream)
      const p = ctx.createScriptProcessor(4096, 1, 1)
      customElectroRecChunksRef.current = []
      p.onaudioprocess = (e) =>
        customElectroRecChunksRef.current.push(
          new Float32Array(e.inputBuffer.getChannelData(0)),
        )
      src.connect(p)
      p.connect(ctx.destination)
      customElectroProcessorRef.current = p
      const SR: any =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
      if (SR) {
        const r = new SR()
        r.continuous = true
        r.interimResults = true
        r.lang = 'en-US'
        r.onresult = (ev: any) => {
          let t = ''
          for (let i = 0; i < ev.results.length; i++)
            t += ev.results[i][0].transcript
          setCustomTranscript(t.trim())
        }
        r.onerror = () => {}
        try {
          r.start()
        } catch {}
        customSpeechRecRef.current = r
      }
      setRecordingCustomElectro(true)
    } catch (e: any) {
      setError(e?.message || 'Microphone access denied.')
    }
  }, [])
  const stopRecordingCustomElectro = useCallback(async () => {
    setRecordingCustomElectro(false)
    const chunks = customElectroRecChunksRef.current
    const total = chunks.reduce((s, c) => s + c.length, 0)
    const merged = new Float32Array(total)
    let off = 0
    for (const c of chunks) {
      merged.set(c, off)
      off += c.length
    }
    cleanupCustomElectro()
    if (merged.length < 1000) {
      setError('Custom electrolarynx recording too short.')
      return
    }
    const ctx = getCtx()
    const sr = customElectroCtxRef.current?.sampleRate || 48000
    const buf = ctx.createBuffer(1, merged.length, sr)
    buf.copyToChannel(merged, 0)
    const normalized = normalizeBuffer(buf, ctx, 0.9)
    setCustomElectroBuffer(normalized)
    setCustomElectroMode(true)
    const ref = await generateCustomReference(normalized, ctx)
    setCustomReferenceBuffer(ref)
  }, [cleanupCustomElectro, getCtx])
  const handleCustomElectroUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const arrayBuffer = await file.arrayBuffer()
      const ctx = getCtx()
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
      // Auto-clip to first 4 seconds
      const maxLen = Math.min(audioBuffer.length, ctx.sampleRate * 4)
      const clipped = ctx.createBuffer(1, maxLen, ctx.sampleRate)
      clipped.copyToChannel(
        audioBuffer.getChannelData(0).subarray(0, maxLen),
        0,
      )
      const normalized = normalizeBuffer(clipped, ctx, 0.9)
      setCustomElectroBuffer(normalized)
      setCustomElectroMode(true)
      const ref = await generateCustomReference(normalized, ctx)
      setCustomReferenceBuffer(ref)
    },
    [getCtx],
  )
  useEffect(() => {
    if (!bufOriginal && !customElectroMode) return
    const t = window.setTimeout(
      () => runFrom('destructive', applied, bufOriginal),
      400,
    )
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elPitch, elTissue, boostDb, bweStrength, clipK, crossHz])
  useEffect(() => () => cleanup(), [cleanup])
  useEffect(() => () => cleanupCustomElectro(), [cleanupCustomElectro])
  const reset = () => {
    stop()
    setBufOriginal(null)
    setBufDestructive(null)
    setBufCancel(null)
    setBufAdditive(null)
    setBufBoosted(null)
    setBufElectro(null)
    setMethodBufs({})
    setBufFused(null)
    setBufFinalBoosted(null)
    setBufFinal(null)
    setTranscript('')
    setDetectedF0(0)
    setDestructivePreviews({})
    setAdditivePreviews({})
    setElectroPreviews({})
    setFusionPreviews({})
    setBoostPreviews({})
    setClipPreviews({})
    setCurrentAccuracy(null)
    setIterResults([])
    setIterTopBuffers([])
    setStatusMsg('Reset. Press the mic.')
  }
  const cancellationDb = useMemo(() => {
    if (!bufOriginal || !bufCancel) return null
    const o = bufOriginal.getChannelData(0),
      c = bufCancel.getChannelData(0)
    let oE = 0,
      cE = 0
    for (let i = 0; i < o.length; i++) {
      oE += o[i] * o[i]
      cE += c[i] * c[i]
    }
    if (cE < 1e-12) return -120
    return 10 * Math.log10(cE / oE)
  }, [bufOriginal, bufCancel])
  const selectPending = <K extends keyof AppliedChoices>(
    key: K,
    value: AppliedChoices[K],
  ) =>
    setPending((p) => ({
      ...p,
      [key]: value,
    }))
  const rerunFromStage = async (stage: Stage, key: keyof AppliedChoices) => {
    const newApplied = {
      ...applied,
      [key]: pending[key],
    }
    setApplied(newApplied)
    await runFrom(stage, newApplied, bufOriginal)
  }
  // ====================================================================
  // ITERATE & TEST ALL — MONTE CARLO 15K SAMPLING
  // ====================================================================
  const runIterateAll = useCallback(async () => {
    if (!bufOriginal && !customElectroBuffer) {
      setIterStatus('Record a clip and run the pipeline first.')
      return
    }
    const ctx = getCtx()
    // Build dimension arrays
    const destructives = DESTRUCTIVE_VARIANTS.map((v) => v.id as DestructiveId)
    const additives = ADDITIVE_VARIANTS.map((v) => v.id as AdditiveId)
    const electros = ELECTRO_VARIANTS.map((v) => v.id as ElectroId)
    const methods = HF_VARIANTS.filter((m) => m.id !== 'tts').map(
      (m) => m.id as MethodId,
    )
    const fusions = FUSION_VARIANTS.map((v) => v.id as FusionId)
    const boosts = BOOST_VARIANTS.map((v) => v.id as BoostId)
    const clips = CLIP_VARIANTS.map((v) => v.id as ClipType)
    let combos: Array<{
      destructive: DestructiveId
      additive: AdditiveId
      electro: ElectroId | 'custom'
      method: MethodId
      fusion: FusionId
      boost: BoostId
      clip: ClipType
    }> = []
    if (customElectroMode) {
      // Custom mode: hold destructive/additive/electro at applied values
      // Sweep only HF × fusion × boost × clip
      for (const method of methods) {
        for (const fusion of fusions) {
          for (const boost of boosts) {
            for (const clip of clips) {
              combos.push({
                destructive: applied.destructive,
                additive: applied.additive,
                electro: 'custom',
                method,
                fusion,
                boost,
                clip,
              })
            }
          }
        }
      }
    } else {
      // Normal mode: full cartesian product, then sample
      const fullCartesian: typeof combos = []
      for (const destructive of destructives) {
        for (const additive of additives) {
          for (const electro of electros) {
            for (const method of methods) {
              for (const fusion of fusions) {
                for (const boost of boosts) {
                  for (const clip of clips) {
                    fullCartesian.push({
                      destructive,
                      additive,
                      electro,
                      method,
                      fusion,
                      boost,
                      clip,
                    })
                  }
                }
              }
            }
          }
        }
      }
      // Random sample up to MAX_ITER_SAMPLES
      if (fullCartesian.length <= MAX_ITER_SAMPLES) {
        combos = fullCartesian
      } else {
        // Fisher-Yates shuffle indices
        const indices = Array.from(
          {
            length: fullCartesian.length,
          },
          (_, i) => i,
        )
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[indices[i], indices[j]] = [indices[j], indices[i]]
        }
        combos = indices.slice(0, MAX_ITER_SAMPLES).map((i) => fullCartesian[i])
      }
    }
    // Sort for cache locality: destructive, additive, electro, method, fusion, boost, clip
    combos.sort((a, b) => {
      if (a.destructive !== b.destructive)
        return a.destructive.localeCompare(b.destructive)
      if (a.additive !== b.additive) return a.additive.localeCompare(b.additive)
      if (a.electro !== b.electro)
        return String(a.electro).localeCompare(String(b.electro))
      if (a.method !== b.method) return a.method.localeCompare(b.method)
      if (a.fusion !== b.fusion) return a.fusion.localeCompare(b.fusion)
      if (a.boost !== b.boost) return a.boost.localeCompare(b.boost)
      return a.clip.localeCompare(b.clip)
    })
    const sampleCount = combos.length
    setIterTotal(sampleCount)
    setIterProgress(0)
    setIterResults([])
    setIterTopBuffers([])
    setIterRunning(true)
    iterCancelRef.current = false
    setIterStatus(
      `Starting sweep of ${sampleCount.toLocaleString()} combinations…`,
    )
    const results: IterResult[] = []
    // Caches
    const destructiveCache = new Map<DestructiveId, AudioBuffer>()
    const additiveCache = new Map<AdditiveId, AudioBuffer>()
    const electroCache = new Map<ElectroId | 'custom', AudioBuffer>()
    const hfCache = new Map<string, AudioBuffer>() // key: electro_id + method
    const fusionCache = new Map<string, AudioBuffer>() // key: electro_id + method + fusion
    const boostCache = new Map<string, AudioBuffer>() // key: electro_id + method + fusion + boost
    let done = 0
    const t0 = performance.now()
    for (const combo of combos) {
      if (iterCancelRef.current) break
      try {
        // 1. Destructive
        let destBuf = destructiveCache.get(combo.destructive)
        if (!destBuf && bufOriginal) {
          destBuf = await buildDestructive(combo.destructive, bufOriginal, ctx)
          destructiveCache.set(combo.destructive, destBuf)
        }
        // 2. Additive
        let addBuf = additiveCache.get(combo.additive)
        if (!addBuf && bufOriginal) {
          addBuf = await buildAdditive(
            combo.additive,
            bufOriginal,
            ctx,
            boostDb,
          )
          additiveCache.set(combo.additive, addBuf)
        }
        // 3. Electrolarynx
        let elBuf: AudioBuffer
        if (combo.electro === 'custom') {
          elBuf = customElectroBuffer!
        } else {
          let cached = electroCache.get(combo.electro)
          if (!cached && bufOriginal) {
            cached = await synthElectrolarynx(
              bufOriginal,
              ctx,
              elPitch,
              elTissue,
              combo.electro,
            )
            electroCache.set(combo.electro, cached)
          }
          elBuf = cached!
        }
        // 4. HF reconstruction
        const hfKey = `${combo.electro}_${combo.method}`
        let hfBuf: AudioBuffer | null = hfCache.get(hfKey) ?? null
        if (!hfBuf) {
          const origForBwe =
            bufOriginal || customReferenceBuffer || customElectroBuffer!
          hfBuf = await computeMethodBuffer(
            combo.method,
            ctx,
            origForBwe,
            elBuf,
            elPitch,
            elTissue,
            bweStrength,
          )
          if (hfBuf) hfCache.set(hfKey, hfBuf)
        }
        if (!hfBuf) {
          done++
          continue
        }
        // 5. Fusion
        const fusionKey = `${hfKey}_${combo.fusion}`
        let fusedBuf = fusionCache.get(fusionKey)
        if (!fusedBuf) {
          fusedBuf = await fuseLowHigh(elBuf, hfBuf, ctx, combo.fusion, crossHz)
          fusionCache.set(fusionKey, fusedBuf)
        }
        // 6. Boost
        const boostKey = `${fusionKey}_${combo.boost}`
        let boostedBuf = boostCache.get(boostKey)
        if (!boostedBuf) {
          boostedBuf = await applyBoost(fusedBuf, ctx, combo.boost, boostDb)
          boostCache.set(boostKey, boostedBuf)
        }
        // 7. Clip + normalize
        const clipped = softClipBuf(boostedBuf, ctx, combo.clip, clipK)
        const final = normalizeBuffer(clipped, ctx, 0.95)
        // 8. Accuracy
        const referenceBuffer =
          customElectroMode && customReferenceBuffer
            ? customReferenceBuffer
            : bufOriginal
        if (referenceBuffer) {
          const metrics = computeAccuracy(referenceBuffer, final)
          results.push({
            combo,
            metrics,
            rank: 0,
          })
        }
      } catch (err) {
        // Skip on error
      }
      done++
      if (done % 24 === 0) {
        setIterProgress(done)
        const elapsed = (performance.now() - t0) / 1000
        const rate = done / elapsed
        const eta = rate > 0 ? (sampleCount - done) / rate : 0
        setIterStatus(
          `${done}/${sampleCount} · ETA ${Math.max(0, Math.round(eta))}s`,
        )
        await new Promise((r) => setTimeout(r, 0))
      }
    }
    // Sort and rank
    results.sort((a, b) => b.metrics.composite - a.metrics.composite)
    results.forEach((r, i) => (r.rank = i + 1))
    setIterResults(results)
    setIterProgress(sampleCount)
    setIterStatus(
      `Sweep complete · ${results.length.toLocaleString()} combinations tested in ${((performance.now() - t0) / 1000).toFixed(1)}s`,
    )
    // Build top-5 buffers
    const topBufs: AudioBuffer[] = []
    for (const r of results.slice(0, 5)) {
      try {
        let elBuf: AudioBuffer
        if (r.combo.electro === 'custom') {
          elBuf = customElectroBuffer!
        } else {
          elBuf = await synthElectrolarynx(
            bufOriginal!,
            ctx,
            elPitch,
            elTissue,
            r.combo.electro,
          )
        }
        const origForBwe =
          bufOriginal || customReferenceBuffer || customElectroBuffer!
        const hf = await computeMethodBuffer(
          r.combo.method,
          ctx,
          origForBwe,
          elBuf,
          elPitch,
          elTissue,
          bweStrength,
        )
        if (!hf) {
          topBufs.push(null as any)
          continue
        }
        const fused = await fuseLowHigh(elBuf, hf, ctx, r.combo.fusion, crossHz)
        const boosted = await applyBoost(fused, ctx, r.combo.boost, boostDb)
        const clipped = softClipBuf(boosted, ctx, r.combo.clip, clipK)
        topBufs.push(normalizeBuffer(clipped, ctx, 0.95))
      } catch {
        topBufs.push(null as any)
      }
    }
    setIterTopBuffers(topBufs)
    setIterRunning(false)
  }, [
    boostDb,
    bufOriginal,
    bweStrength,
    clipK,
    crossHz,
    elPitch,
    elTissue,
    getCtx,
    applied,
    customElectroMode,
    customElectroBuffer,
    customReferenceBuffer,
  ])
  const cancelIterate = () => {
    iterCancelRef.current = true
  }
  const applyTopCombo = async (combo: IterResult['combo']) => {
    const newApplied: AppliedChoices = {
      ...applied,
      destructive: combo.destructive,
      additive: combo.additive,
      electro: combo.electro === 'custom' ? applied.electro : combo.electro,
      method: combo.method,
      fusion: combo.fusion,
      boost: combo.boost,
      clip: combo.clip,
    }
    setApplied(newApplied)
    setPending(newApplied)
    if (bufOriginal || customElectroBuffer)
      await runFrom('destructive', newApplied, bufOriginal)
  }
  const playComboFromTable = useCallback(
    async (combo: IterResult['combo'], rank: number) => {
      const cacheKey = `${combo.destructive}_${combo.additive}_${combo.electro}_${combo.method}_${combo.fusion}_${combo.boost}_${combo.clip}`
      if (topRenderCache.has(cacheKey)) {
        const buf = topRenderCache.get(cacheKey)!
        play(buf, `table-${rank}`)
        return
      }
      // Build the buffer
      const ctx = getCtx()
      try {
        let elBuf: AudioBuffer
        if (combo.electro === 'custom') {
          elBuf = customElectroBuffer!
        } else {
          elBuf = await synthElectrolarynx(
            bufOriginal!,
            ctx,
            elPitch,
            elTissue,
            combo.electro,
          )
        }
        const origForBwe =
          bufOriginal || customReferenceBuffer || customElectroBuffer!
        const hf = await computeMethodBuffer(
          combo.method,
          ctx,
          origForBwe,
          elBuf,
          elPitch,
          elTissue,
          bweStrength,
        )
        if (!hf) return
        const fused = await fuseLowHigh(elBuf, hf, ctx, combo.fusion, crossHz)
        const boosted = await applyBoost(fused, ctx, combo.boost, boostDb)
        const clipped = softClipBuf(boosted, ctx, combo.clip, clipK)
        const final = normalizeBuffer(clipped, ctx, 0.95)
        setTopRenderCache((prev) => new Map(prev).set(cacheKey, final))
        play(final, `table-${rank}`)
      } catch (err) {
        console.error('Failed to build combo buffer:', err)
      }
    },
    [
      topRenderCache,
      play,
      getCtx,
      customElectroBuffer,
      bufOriginal,
      customReferenceBuffer,
      elPitch,
      elTissue,
      bweStrength,
      crossHz,
      boostDb,
      clipK,
    ],
  )
  return (
    <div
      className="w-full min-h-screen text-slate-900 font-sans relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #f0f9ff 0%, #fdf4ff 50%, #ecfeff 100%)',
      }}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-cyan-300/30 rounded-full blur-[140px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute top-1/3 -right-40 w-[700px] h-[700px] bg-violet-300/30 rounded-full blur-[140px] animate-[pulse_10s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-emerald-200/30 rounded-full blur-[120px] animate-[pulse_12s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-rose-200/20 rounded-full blur-[110px] animate-[pulse_14s_ease-in-out_infinite]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-violet-600 to-emerald-600 bg-clip-text text-transparent">
                VRACS v5
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Voice Reconstruction · Accuracy · Combinatorial Search
              </p>
            </div>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-all"
            >
              <RotateCcwIcon className="w-4 h-4" /> Reset
            </button>
          </div>
        </header>

        {/* Recording Section */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MicIcon className="w-4 h-4 text-cyan-600" />
            <h2 className="text-sm font-mono tracking-widest text-slate-600">
              RECORD ORIGINAL VOICE
            </h2>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <button
              onClick={recording ? finishRecording : startRecording}
              disabled={recording}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white shadow-lg transition-all ${recording ? 'bg-rose-500 hover:bg-rose-600' : 'bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600'}`}
            >
              {recording ? (
                <>
                  <SquareIcon className="w-5 h-5" /> Stop (
                  {recDuration.toFixed(1)}s)
                </>
              ) : (
                <>
                  <MicIcon className="w-5 h-5" /> Record
                </>
              )}
            </button>
            <div className="flex-1">
              <div className="text-xs text-slate-600 mb-1">{statusMsg}</div>
              {recording && <LevelMeter analyser={liveAnalyser} />}
              {error && (
                <div className="text-xs text-rose-600 mt-1">{error}</div>
              )}
              {transcript && (
                <div className="text-xs text-slate-500 mt-1 italic">
                  "{transcript}"
                </div>
              )}
            </div>
          </div>
          {bufOriginal && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-mono text-slate-500 mb-1">
                  WAVEFORM
                </div>
                <Waveform buffer={bufOriginal} color="#0891b2" height={60} />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-500 mb-1">
                  SPECTRUM
                </div>
                <Spectrum buffer={bufOriginal} color="#7c3aed" height={60} />
              </div>
            </div>
          )}
          {detectedF0 > 0 && (
            <div className="mt-3 text-xs text-slate-600">
              Detected pitch: <b>{detectedF0.toFixed(1)} Hz</b>
            </div>
          )}
        </section>

        {/* Custom Electrolarynx Section */}
        <section className="mb-6 rounded-2xl border border-amber-200 bg-white/70 backdrop-blur p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <UploadIcon className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-mono tracking-widest text-slate-600">
              CUSTOM ELECTROLARYNX (OPTIONAL)
            </h2>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            Record or upload your own electrolarynx source. When active, the
            pipeline enters <b>Custom Mode</b>. Since there is no "original full
            voice" to compare against, accuracy is measured by transcribing the
            audio via STT, synthesizing an idealized "full voice" reference, and
            comparing the pipeline output to that reference.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={
                recordingCustomElectro
                  ? stopRecordingCustomElectro
                  : startRecordingCustomElectro
              }
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white shadow transition-all ${recordingCustomElectro ? 'bg-rose-500 hover:bg-rose-600' : 'bg-amber-500 hover:bg-amber-600'}`}
            >
              {recordingCustomElectro ? (
                <>
                  <SquareIcon className="w-4 h-4" /> Stop Recording
                </>
              ) : (
                <>
                  <MicIcon className="w-4 h-4" /> Record Custom
                </>
              )}
            </button>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer transition-all">
              <UploadIcon className="w-4 h-4" /> Upload Audio
              <input
                type="file"
                accept="audio/*"
                onChange={handleCustomElectroUpload}
                className="hidden"
              />
            </label>
            {customElectroBuffer && (
              <div className="flex items-center gap-2 text-xs text-emerald-600">
                <CheckCircle2Icon className="w-4 h-4" />
                Custom electrolarynx loaded (
                {customElectroBuffer.duration.toFixed(2)}s)
              </div>
            )}
            {customElectroMode && (
              <button
                onClick={() => {
                  setCustomElectroMode(false)
                  setCustomElectroBuffer(null)
                  setCustomReferenceBuffer(null)
                }}
                className="text-xs text-slate-500 hover:text-slate-700 underline"
              >
                Clear & use synthesized
              </button>
            )}
          </div>
          {customTranscript && (
            <div className="mt-3 text-xs text-slate-500 italic">
              Transcript: "{customTranscript}"
            </div>
          )}
        </section>

        {/* Parameters */}
        {(bufOriginal || customElectroBuffer) && (
          <section className="mb-6 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontalIcon className="w-4 h-4 text-violet-600" />
              <h2 className="text-sm font-mono tracking-widest text-slate-600">
                GLOBAL PARAMETERS
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ParamSlider
                label="EL Pitch"
                value={elPitch}
                onChange={setElPitch}
                min={60}
                max={200}
                step={1}
                unit="Hz"
              />
              <ParamSlider
                label="EL Tissue"
                value={elTissue}
                onChange={setElTissue}
                min={1000}
                max={6000}
                step={100}
                unit="Hz"
              />
              <ParamSlider
                label="BWE Strength"
                value={bweStrength}
                onChange={setBweStrength}
                min={0}
                max={1}
                step={0.05}
                unit=""
              />
              <ParamSlider
                label="Boost"
                value={boostDb}
                onChange={setBoostDb}
                min={0}
                max={12}
                step={0.5}
                unit="dB"
              />
              <ParamSlider
                label="Clip K"
                value={clipK}
                onChange={setClipK}
                min={0}
                max={1}
                step={0.05}
                unit=""
              />
              <ParamSlider
                label="Crossover"
                value={crossHz}
                onChange={setCrossHz}
                min={800}
                max={2000}
                step={50}
                unit="Hz"
              />
            </div>
          </section>
        )}

        {/* Pipeline Stages */}
        {(bufOriginal || customElectroBuffer) && (
          <div className="space-y-6">
            {/* Stage 3A */}
            {!customElectroMode && bufOriginal && (
              <StageCard>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <StageHeader
                    index={3}
                    title="Destructive Frequency"
                    subtitle={`Method: ${DESTRUCTIVE_VARIANTS.find((v) => v.id === applied.destructive)?.name}`}
                    icon={<ZapOffIcon className="w-5 h-5 text-rose-700" />}
                    accent="bg-rose-100"
                    status={
                      bufDestructive
                        ? 'ready'
                        : stageRunning === 'destructive'
                          ? 'processing'
                          : 'idle'
                    }
                  />
                  {bufDestructive && (
                    <PlayButton
                      onClick={() =>
                        playingId === 'dest'
                          ? stop()
                          : play(bufDestructive, 'dest')
                      }
                      isPlaying={playingId === 'dest'}
                    />
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {DESTRUCTIVE_VARIANTS.map((v) => (
                    <VariantTile
                      key={v.id}
                      meta={v}
                      buffer={
                        destructivePreviews[v.id as DestructiveId] || null
                      }
                      selected={pending.destructive === v.id}
                      isApplied={applied.destructive === v.id}
                      onSelect={() =>
                        selectPending('destructive', v.id as DestructiveId)
                      }
                      onRerunBelow={() =>
                        rerunFromStage('destructive', 'destructive')
                      }
                      playingId={playingId}
                      playId={`dp-${v.id}`}
                      onPlay={() => {
                        const b = destructivePreviews[v.id as DestructiveId]
                        if (b)
                          playingId === `dp-${v.id}`
                            ? stop()
                            : play(b, `dp-${v.id}`)
                      }}
                      showRerun={
                        pending.destructive === v.id &&
                        applied.destructive !== v.id
                      }
                    />
                  ))}
                </div>
                {bufCancel && cancellationDb !== null && (
                  <div className="mt-4 rounded-md bg-rose-50 border border-rose-200 p-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-mono text-rose-700">
                        CANCELLATION TEST
                      </div>
                      <div className="text-sm text-slate-800">
                        orig + destructive → residual{' '}
                        <b>{cancellationDb.toFixed(1)} dB</b>
                      </div>
                    </div>
                    <PlayButton
                      onClick={() =>
                        playingId === 'cancel'
                          ? stop()
                          : play(bufCancel, 'cancel')
                      }
                      isPlaying={playingId === 'cancel'}
                    />
                  </div>
                )}
              </StageCard>
            )}

            {/* Stage 3B */}
            {!customElectroMode && bufOriginal && (
              <StageCard>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <StageHeader
                    index={3}
                    title="Additive Frequency"
                    subtitle={`Method: ${ADDITIVE_VARIANTS.find((v) => v.id === applied.additive)?.name}`}
                    icon={<SparklesIcon className="w-5 h-5 text-emerald-700" />}
                    accent="bg-emerald-100"
                    status={
                      bufAdditive
                        ? 'ready'
                        : stageRunning === 'additive'
                          ? 'processing'
                          : 'idle'
                    }
                  />
                  {bufAdditive && (
                    <PlayButton
                      onClick={() =>
                        playingId === 'add' ? stop() : play(bufAdditive, 'add')
                      }
                      isPlaying={playingId === 'add'}
                    />
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ADDITIVE_VARIANTS.map((v) => (
                    <VariantTile
                      key={v.id}
                      meta={v}
                      buffer={additivePreviews[v.id as AdditiveId] || null}
                      selected={pending.additive === v.id}
                      isApplied={applied.additive === v.id}
                      onSelect={() =>
                        selectPending('additive', v.id as AdditiveId)
                      }
                      onRerunBelow={() =>
                        rerunFromStage('additive', 'additive')
                      }
                      playingId={playingId}
                      playId={`ap-${v.id}`}
                      onPlay={() => {
                        const b = additivePreviews[v.id as AdditiveId]
                        if (b)
                          playingId === `ap-${v.id}`
                            ? stop()
                            : play(b, `ap-${v.id}`)
                      }}
                      showRerun={
                        pending.additive === v.id && applied.additive !== v.id
                      }
                    />
                  ))}
                </div>
                {bufBoosted && (
                  <div className="mt-4 rounded-md bg-emerald-50 border border-emerald-200 p-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-mono text-emerald-700">
                        BOOST TEST
                      </div>
                      <div className="text-sm text-slate-800">
                        orig + additive → audibly lifted intelligibility band
                      </div>
                    </div>
                    <PlayButton
                      onClick={() =>
                        playingId === 'boost'
                          ? stop()
                          : play(bufBoosted, 'boost')
                      }
                      isPlaying={playingId === 'boost'}
                    />
                  </div>
                )}
              </StageCard>
            )}

            {/* Stage 4 */}
            {!customElectroMode && bufOriginal && (
              <StageCard>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <StageHeader
                    index={4}
                    title="Electrolarynx Simulation"
                    subtitle={`Method: ${ELECTRO_VARIANTS.find((v) => v.id === applied.electro)?.name}`}
                    formula={`x[n] = e[n] - Σ a_k·x[n-k]`}
                    icon={<RadioIcon className="w-5 h-5 text-amber-700" />}
                    accent="bg-amber-100"
                    status={
                      bufElectro
                        ? 'ready'
                        : stageRunning === 'electro'
                          ? 'processing'
                          : 'idle'
                    }
                  />
                  {bufElectro && (
                    <PlayButton
                      onClick={() =>
                        playingId === 'el' ? stop() : play(bufElectro, 'el')
                      }
                      isPlaying={playingId === 'el'}
                      size="lg"
                    />
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ELECTRO_VARIANTS.map((v) => (
                    <VariantTile
                      key={v.id}
                      meta={v}
                      buffer={electroPreviews[v.id as ElectroId] || null}
                      selected={pending.electro === v.id}
                      isApplied={applied.electro === v.id}
                      onSelect={() =>
                        selectPending('electro', v.id as ElectroId)
                      }
                      onRerunBelow={() => rerunFromStage('electro', 'electro')}
                      playingId={playingId}
                      playId={`ep-${v.id}`}
                      onPlay={() => {
                        const b = electroPreviews[v.id as ElectroId]
                        if (b)
                          playingId === `ep-${v.id}`
                            ? stop()
                            : play(b, `ep-${v.id}`)
                      }}
                      showRerun={
                        pending.electro === v.id && applied.electro !== v.id
                      }
                    />
                  ))}
                </div>
              </StageCard>
            )}

            {customElectroMode && bufElectro && (
              <StageCard>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <StageHeader
                    index={4}
                    title="Custom Electrolarynx"
                    subtitle="Using uploaded/recorded source"
                    icon={<RadioIcon className="w-5 h-5 text-amber-700" />}
                    accent="bg-amber-100"
                    status="ready"
                  />
                  <PlayButton
                    onClick={() =>
                      playingId === 'el' ? stop() : play(bufElectro, 'el')
                    }
                    isPlaying={playingId === 'el'}
                    size="lg"
                  />
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                  <div className="text-xs text-slate-600 mb-2">
                    Custom electrolarynx source active. Duration:{' '}
                    {bufElectro.duration.toFixed(2)}s
                  </div>
                  <Waveform buffer={bufElectro} color="#d97706" height={60} />
                </div>
              </StageCard>
            )}

            {/* Stage 5 */}
            <StageCard highlight>
              <div className="flex items-start justify-between gap-4 mb-4">
                <StageHeader
                  index={5}
                  title="High-Frequency Reconstruction"
                  subtitle={`Method: ${HF_VARIANTS.find((v) => v.id === applied.method)?.name} · 18 methods available`}
                  icon={<GitBranchIcon className="w-5 h-5 text-emerald-700" />}
                  accent="bg-emerald-100"
                  status={
                    Object.keys(methodBufs).length > 0
                      ? 'ready'
                      : stageRunning === 'methods'
                        ? 'processing'
                        : 'idle'
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {HF_VARIANTS.map((m) => (
                  <VariantTile
                    key={m.id}
                    meta={m}
                    buffer={m.id === 'tts' ? null : methodBufs[m.id] || null}
                    selected={pending.method === m.id}
                    isApplied={applied.method === m.id}
                    onSelect={() => selectPending('method', m.id)}
                    onRerunBelow={() => rerunFromStage('methods', 'method')}
                    playingId={playingId}
                    playId={`m-${m.id}`}
                    onPlay={() => {
                      if (m.id === 'tts') {
                        playingId === 'm-tts'
                          ? stop()
                          : speakText(
                              customElectroMode
                                ? customTranscript || '(no transcript)'
                                : transcript || '(no transcript)',
                              'm-tts',
                            )
                      } else {
                        const b = methodBufs[m.id]
                        if (b)
                          playingId === `m-${m.id}`
                            ? stop()
                            : play(b, `m-${m.id}`)
                      }
                    }}
                    showRerun={
                      pending.method === m.id && applied.method !== m.id
                    }
                    badge={
                      m.id === 'tts' ? (
                        <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-rose-100 text-rose-700">
                          TTS
                        </span>
                      ) : undefined
                    }
                  />
                ))}
              </div>
            </StageCard>

            {/* Stage 6 */}
            <StageCard>
              <div className="flex items-start justify-between gap-4 mb-4">
                <StageHeader
                  index={6}
                  title="Low + High Fusion"
                  subtitle={`Strategy: ${FUSION_VARIANTS.find((v) => v.id === applied.fusion)?.name}`}
                  icon={<LayersIcon className="w-5 h-5 text-cyan-700" />}
                  accent="bg-cyan-100"
                  status={
                    bufFused
                      ? 'ready'
                      : stageRunning === 'fusion'
                        ? 'processing'
                        : 'idle'
                  }
                />
                {bufFused && (
                  <PlayButton
                    onClick={() =>
                      playingId === 'fu' ? stop() : play(bufFused, 'fu')
                    }
                    isPlaying={playingId === 'fu'}
                  />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {FUSION_VARIANTS.map((v) => (
                  <VariantTile
                    key={v.id}
                    meta={v}
                    buffer={fusionPreviews[v.id as FusionId] || null}
                    selected={pending.fusion === v.id}
                    isApplied={applied.fusion === v.id}
                    onSelect={() => selectPending('fusion', v.id as FusionId)}
                    onRerunBelow={() => rerunFromStage('fusion', 'fusion')}
                    playingId={playingId}
                    playId={`fp-${v.id}`}
                    onPlay={() => {
                      const b = fusionPreviews[v.id as FusionId]
                      if (b)
                        playingId === `fp-${v.id}`
                          ? stop()
                          : play(b, `fp-${v.id}`)
                    }}
                    showRerun={
                      pending.fusion === v.id && applied.fusion !== v.id
                    }
                  />
                ))}
              </div>
            </StageCard>

            {/* Stage 7 */}
            <StageCard>
              <div className="flex items-start justify-between gap-4 mb-4">
                <StageHeader
                  index={7}
                  title="Intelligibility Boost"
                  subtitle={`Profile: ${BOOST_VARIANTS.find((v) => v.id === applied.boost)?.name}`}
                  formula={`+${boostDb.toFixed(1)} dB`}
                  icon={
                    <SlidersHorizontalIcon className="w-5 h-5 text-violet-700" />
                  }
                  accent="bg-violet-100"
                  status={
                    bufFinalBoosted
                      ? 'ready'
                      : stageRunning === 'boost'
                        ? 'processing'
                        : 'idle'
                  }
                />
                {bufFinalBoosted && (
                  <PlayButton
                    onClick={() =>
                      playingId === 'bo' ? stop() : play(bufFinalBoosted, 'bo')
                    }
                    isPlaying={playingId === 'bo'}
                  />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {BOOST_VARIANTS.map((v) => (
                  <VariantTile
                    key={v.id}
                    meta={v}
                    buffer={boostPreviews[v.id as BoostId] || null}
                    selected={pending.boost === v.id}
                    isApplied={applied.boost === v.id}
                    onSelect={() => selectPending('boost', v.id as BoostId)}
                    onRerunBelow={() => rerunFromStage('boost', 'boost')}
                    playingId={playingId}
                    playId={`bp-${v.id}`}
                    onPlay={() => {
                      const b = boostPreviews[v.id as BoostId]
                      if (b)
                        playingId === `bp-${v.id}`
                          ? stop()
                          : play(b, `bp-${v.id}`)
                    }}
                    showRerun={pending.boost === v.id && applied.boost !== v.id}
                  />
                ))}
              </div>
            </StageCard>

            {/* Stage 8 */}
            <StageCard>
              <div className="flex items-start justify-between gap-4 mb-4">
                <StageHeader
                  index={8}
                  title="Soft Clip & Normalize"
                  subtitle={`Curve: ${CLIP_VARIANTS.find((v) => v.id === applied.clip)?.name}`}
                  icon={<ShieldCheckIcon className="w-5 h-5 text-rose-700" />}
                  accent="bg-rose-100"
                  status={
                    bufFinal
                      ? 'ready'
                      : stageRunning === 'final'
                        ? 'processing'
                        : 'idle'
                  }
                />
                {bufFinal && (
                  <PlayButton
                    onClick={() =>
                      playingId === 'fin' ? stop() : play(bufFinal, 'fin')
                    }
                    isPlaying={playingId === 'fin'}
                    size="lg"
                  />
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {CLIP_VARIANTS.map((v) => (
                  <VariantTile
                    key={v.id}
                    meta={v}
                    buffer={clipPreviews[v.id as ClipType] || null}
                    selected={pending.clip === v.id}
                    isApplied={applied.clip === v.id}
                    onSelect={() => selectPending('clip', v.id as ClipType)}
                    onRerunBelow={() => rerunFromStage('final', 'clip')}
                    playingId={playingId}
                    playId={`cp-${v.id}`}
                    onPlay={() => {
                      const b = clipPreviews[v.id as ClipType]
                      if (b)
                        playingId === `cp-${v.id}`
                          ? stop()
                          : play(b, `cp-${v.id}`)
                    }}
                    showRerun={pending.clip === v.id && applied.clip !== v.id}
                  />
                ))}
              </div>
            </StageCard>

            {/* Accuracy Dashboard */}
            {currentAccuracy && (
              <section className="mt-8 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <TargetIcon className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-800">
                    Accuracy Metrics (Current Pipeline)
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {METRIC_INFO.map((m) => (
                    <div
                      key={m.key}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-100 group relative"
                    >
                      <div className="text-xs font-medium text-slate-500 mb-1 flex justify-between">
                        {m.label}
                        <span className="text-slate-400">{m.weight}%</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-800">
                        {currentAccuracy[m.key].toFixed(1)}
                        <span className="text-sm text-slate-400 font-normal ml-1">
                          /100
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{
                            width: `${currentAccuracy[m.key]}%`,
                          }}
                        />
                      </div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                        {m.tip}
                      </div>
                    </div>
                  ))}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-100 lg:col-span-1">
                    <div className="text-xs font-bold text-emerald-700 mb-1">
                      COMPOSITE SCORE
                    </div>
                    <div className="text-3xl font-black text-emerald-600">
                      {currentAccuracy.composite.toFixed(1)}
                    </div>
                    <div className="mt-2 h-1.5 w-full bg-emerald-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{
                          width: `${currentAccuracy.composite}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Iterate All */}
            <section className="mt-8 rounded-2xl border border-violet-200 bg-violet-50/50 backdrop-blur p-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CpuIcon className="w-5 h-5 text-violet-600" />
                    <h2 className="text-lg font-bold text-slate-800">
                      Monte-Carlo Sweep (15,000 samples)
                    </h2>
                  </div>
                  <p className="text-sm text-slate-600">
                    Randomly samples up to 15,000 combinations from the full
                    cartesian product.
                    {customElectroMode &&
                      ' (Custom mode: destructive, additive, and electro are fixed).'}
                  </p>
                </div>
                {iterRunning ? (
                  <button
                    onClick={cancelIterate}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-lg transition-all"
                  >
                    <StopCircleIcon className="w-5 h-5" /> Stop Sweep
                  </button>
                ) : (
                  <button
                    onClick={runIterateAll}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium shadow-lg transition-all"
                  >
                    <PlayIcon className="w-5 h-5" /> Start Sweep
                  </button>
                )}
              </div>

              {iterTotal > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-slate-500 mb-2 font-mono">
                    <span>{iterStatus}</span>
                    <span>{Math.round((iterProgress / iterTotal) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 transition-all duration-200"
                      style={{
                        width: `${(iterProgress / iterTotal) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {iterResults.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <TrophyIcon className="w-4 h-4 text-amber-500" /> Top 30
                    Combinations
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-medium">Rank</th>
                          <th className="px-4 py-3 font-medium">Score</th>
                          <th className="px-4 py-3 font-medium">Destructive</th>
                          <th className="px-4 py-3 font-medium">Additive</th>
                          <th className="px-4 py-3 font-medium">Electro</th>
                          <th className="px-4 py-3 font-medium">Method</th>
                          <th className="px-4 py-3 font-medium">Fusion</th>
                          <th className="px-4 py-3 font-medium">Boost</th>
                          <th className="px-4 py-3 font-medium">Clip</th>
                          <th className="px-4 py-3 font-medium text-right">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {iterResults.slice(0, 30).map((r, i) => (
                          <tr
                            key={i}
                            className="hover:bg-slate-50 transition-colors group cursor-pointer"
                            onClick={() => playComboFromTable(r.combo, r.rank)}
                          >
                            <td className="px-4 py-3 font-mono text-slate-500">
                              #{r.rank}
                            </td>
                            <td className="px-4 py-3 font-bold text-emerald-600">
                              {r.metrics.composite.toFixed(1)}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {
                                DESTRUCTIVE_VARIANTS.find(
                                  (v) => v.id === r.combo.destructive,
                                )?.short
                              }
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {
                                ADDITIVE_VARIANTS.find(
                                  (v) => v.id === r.combo.additive,
                                )?.short
                              }
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {r.combo.electro === 'custom'
                                ? 'Custom'
                                : ELECTRO_VARIANTS.find(
                                    (v) => v.id === r.combo.electro,
                                  )?.short}
                            </td>
                            <td className="px-4 py-3 text-slate-600 font-medium">
                              {
                                HF_VARIANTS.find((v) => v.id === r.combo.method)
                                  ?.short
                              }
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {
                                FUSION_VARIANTS.find(
                                  (v) => v.id === r.combo.fusion,
                                )?.short
                              }
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {
                                BOOST_VARIANTS.find(
                                  (v) => v.id === r.combo.boost,
                                )?.short
                              }
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {
                                CLIP_VARIANTS.find((v) => v.id === r.combo.clip)
                                  ?.short
                              }
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    playComboFromTable(r.combo, r.rank)
                                  }}
                                  className="p-1.5 rounded-md text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                                  title="Play this combination"
                                >
                                  {playingId === `table-${r.rank}` ? (
                                    <SquareIcon className="w-4 h-4" />
                                  ) : (
                                    <PlayIcon className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    applyTopCombo(r.combo)
                                  }}
                                  className="px-3 py-1.5 rounded-md bg-violet-100 text-violet-700 text-xs font-medium hover:bg-violet-200 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  Apply
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
// =========================================================================
// UI COMPONENTS
// =========================================================================
const StageCard: React.FC<{
  children: React.ReactNode
  highlight?: boolean
}> = ({ children, highlight }) => (
  <section
    className={`rounded-2xl border ${highlight ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white/70'} backdrop-blur p-6 shadow-sm transition-all`}
  >
    {children}
  </section>
)
const StageHeader: React.FC<{
  index: number
  title: string
  subtitle: string
  formula?: string
  icon: React.ReactNode
  accent: string
  status: 'idle' | 'processing' | 'ready'
}> = ({ index, title, subtitle, formula, icon, accent, status }) => (
  <div className="flex items-start gap-3">
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}
    >
      {icon}
    </div>
    <div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          Stage {index}
        </span>
        {status === 'processing' && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
            <LoaderIcon className="w-3 h-3 animate-spin" /> Processing
          </span>
        )}
        {status === 'ready' && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
            <CheckCircle2Icon className="w-3 h-3" /> Ready
          </span>
        )}
      </div>
      <h2 className="text-lg font-bold text-slate-800 leading-tight">
        {title}
      </h2>
      <div className="text-sm text-slate-500 mt-0.5">{subtitle}</div>
      {formula && (
        <div className="text-xs font-mono text-slate-400 mt-1 bg-slate-100/50 inline-block px-1.5 py-0.5 rounded">
          {formula}
        </div>
      )}
    </div>
  </div>
)
const PlayButton: React.FC<{
  onClick: () => void
  isPlaying: boolean
  size?: 'sm' | 'md' | 'lg'
}> = ({ onClick, isPlaying, size = 'md' }) => {
  const dims =
    size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10'
  const iconDims =
    size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
  return (
    <button
      onClick={onClick}
      className={`${dims} rounded-full flex items-center justify-center shrink-0 transition-all ${isPlaying ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'}`}
    >
      {isPlaying ? (
        <SquareIcon className={iconDims} />
      ) : (
        <PlayIcon className={iconDims} />
      )}
    </button>
  )
}
const VariantTile: React.FC<{
  meta: VariantMeta
  buffer: AudioBuffer | null
  selected: boolean
  isApplied: boolean
  onSelect: () => void
  onRerunBelow: () => void
  playingId: string | null
  playId: string
  onPlay: () => void
  showRerun?: boolean
  badge?: React.ReactNode
}> = ({
  meta,
  buffer,
  selected,
  isApplied,
  onSelect,
  onRerunBelow,
  playingId,
  playId,
  onPlay,
  showRerun,
  badge,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`relative p-3 rounded-xl border text-left cursor-pointer transition-all ${isApplied ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500' : selected ? 'border-violet-400 bg-violet-50/30 ring-1 ring-violet-400' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-slate-800">{meta.name}</h3>
            {badge}
          </div>
          <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
            {meta.desc}
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          {buffer && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPlay()
              }}
              className={`p-1.5 rounded-md transition-colors ${playingId === playId ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800'}`}
            >
              {playingId === playId ? (
                <SquareIcon className="w-3.5 h-3.5" />
              ) : (
                <PlayIcon className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>
      {buffer && (
        <div className="mt-2 opacity-60">
          <Waveform
            buffer={buffer}
            height={24}
            color={isApplied ? '#10b981' : selected ? '#8b5cf6' : '#94a3b8'}
          />
        </div>
      )}
      {showRerun && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRerunBelow()
          }}
          className="mt-3 w-full py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <RefreshCwIcon className="w-3.5 h-3.5" /> Apply & Rerun Below
        </button>
      )}
      {isApplied && !showRerun && (
        <div className="mt-3 w-full py-1 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1">
          <CheckCircle2Icon className="w-3 h-3" /> Active
        </div>
      )}
    </div>
  )
}
const ParamSlider: React.FC<{
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  unit: string
}> = ({ label, value, onChange, min, max, step, unit }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-3">
    <div className="flex justify-between items-center mb-2">
      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
        {label}
      </label>
      <span className="text-sm font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
        {value}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full accent-violet-600"
    />
  </div>
)

export default App
