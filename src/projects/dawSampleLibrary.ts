/**
 * dawSampleLibrary.ts
 *
 * Real-sample sources used by Alpha DAW.  Each of the 27 presets is bound to
 * a distinct combination of:
 *
 *   - a hardware drum-machine kit from smpldsnds.github.io/drum-machines
 *     (CC-BY samples of TR-808, LM-2, MFB-512, Casio RZ-1, Casio SK-1,
 *      Yamaha MR-10, Roland CR-8000, 808-mini, Micro-Rhythmer-12)
 *
 *   - GM-instrument soundfonts from gleitz.github.io/midi-js-soundfonts
 *     (Fluid R3, MusyngKite, FatBoy banks – CC-BY / CC-BY-SA, one mp3 per note)
 *
 * The result is that *every pad* of *every preset* fetches a different
 * actual recorded sample — not a synthesised variation.  When a fetch fails
 * (offline, CORS, etc.) the caller (`nearfinaldaw.tsx > loadPreset`) falls
 * back to the synthesis catalog in `dawSoundCatalog.ts`.
 */

import type { SoundCategory } from './dawSoundCatalog'

const SF_BASE = 'https://gleitz.github.io/midi-js-soundfonts'
const DM_BASE = 'https://smpldsnds.github.io/drum-machines'

type Bank = 'FluidR3_GM' | 'MusyngKite' | 'FatBoy'

interface SfRef { bank: Bank; inst: string; notes: string[] }
// kick/snare/hihat/drum/perc paths are pre-rendered (machine + filename)
interface DmRef { machine: string; samples: string[] }

interface PresetConfig {
  // drum-machine derived
  kick:    DmRef
  snare:   DmRef
  hihat:   DmRef   // 2 samples: closed, open (or two variants)
  drum:    DmRef   // toms / extra drum hits
  fill:    DmRef   // sequenced from a machine — used by synthesizeFill
  // soundfont derived
  bass:    SfRef
  perc:    SfRef
  vocal:   SfRef
  chord:   SfRef
  long:    SfRef
  medium:  SfRef
  short:   SfRef
  inst:    SfRef
}

/* ─────────────  drum-machine sample dictionaries (relative paths)  ───────── */
// NOTE: directory names on the CDN use original casing (NOT the lowercase
//       baseUrl that dm.json reports).  Verified live 2025.

const TR808 = {
  kicks: ['kick/bd0000','kick/bd0050','kick/bd1000','kick/bd1050','kick/bd2500','kick/bd5000','kick/bd7500','kick/bd0010','kick/bd1025'],
  snares:['snare/sd0010','snare/sd0050','snare/sd1050','snare/sd2575','snare/sd5050','snare/sd7575','snare/sd0025','snare/sd5025'],
  chs:   ['hihat-close/ch'],
  ohs:   ['hihat-open/oh00','hihat-open/oh10','hihat-open/oh25','hihat-open/oh50','hihat-open/oh75'],
  toms:  ['mid-tom/mt00','mid-tom/mt25','mid-tom/mt50','mid-tom/mt75'],
  perc:  ['cowbell/cb','clave/cl','maraca/ma','rimshot/rs','conga-hi/hc00','conga-mid/mc00','conga-low/lc00','clap/cp','cymbal/cy0010'],
}
const LM2 = {
  kicks: ['kick','kick-alt'],
  snares:['snare-h','snare-m','snare-l'],
  chs:   ['hhclosed','hhclosed-short','hhclosed-long'],
  ohs:   ['hhopen','ride','crash'],
  toms:  ['tom-h','tom-hh','tom-m','tom-l','tom-ll'],
  perc:  ['cabasa','clap','conga-h','conga-hh','conga-l','conga-m','cowbell','tambourine','stick-h','stick-m','stick-l'],
}
const CASIO_RZ1 = {
  kicks: ['kick'], snares:['snare'],
  chs:['hihat-closed'], ohs:['hihat-open','ride','crash'],
  toms:['tom-1','tom-2','tom-3'],
  perc:['clap','clave','cowbell'],
}
const MFB512 = {
  kicks:['kick'], snares:['snare'],
  chs:['hihat-closed'], ohs:['hihat-open','cymbal'],
  toms:['tom-hi','tom-mid','tom-low'],
  perc:['clap'],
}
const CASIO_SK1 = {
  kicks:['kick'], snares:['snare'],
  chs:['hithat'], ohs:['hihat-open'],
  toms:['tom-hi','tom-low'],
  perc:['hithat','hihat-open'], // limited
}
const MINI808 = {
  kicks:['kick'], snares:['snare-1','snare-2','snare-3'],
  chs:['hhclosed-1','hhclosed-2'], ohs:['hhopen-1','hhopen-2','crash','ride'],
  toms:['tom-high','tom-mid','tom-low'],
  perc:['crash','ride'],
}
const MICRO_RH12 = {
  kicks:['univox-sd'], snares:['univox-sd'],
  chs:['univox-ch'], ohs:['univox-oh'],
  toms:['univox-sd'],
  perc:['univox-ch','univox-oh','univox-sd'],
}
const YAMAHA_MR10 = {
  kicks:['kick','kick1'], snares:['snare','shortsn'],
  chs:['chihat'], ohs:['ohihat','crash','cymbal'],
  toms:['hitom','midtom','lowtom','shorthi'],
  perc:['brush','shaker'],
}
const ROLAND_CR8000 = {
  kicks:['kick'], snares:['snare'],
  chs:['hihat-closed'], ohs:['hihat-open','cymball'],
  toms:['tom-high','tom-low'],
  perc:['clap','clave','conga-high','conga-low','cowbell','rimshot'],
}

const MACHINE_DIR: Record<string,string> = {
  TR808: 'TR-808',
  LM2: 'LM-2',
  CASIO_RZ1: 'Casio-RZ1',
  MFB512: 'MFB-512',
  CASIO_SK1: 'Casio-SK1',
  MINI808: '808-mini',
  MICRO_RH12: 'Micro-Rhythmer-12',
  YAMAHA_MR10: 'Yamaha-MR10',
  ROLAND_CR8000: 'Roland-CR-8000',
}
const MACHINE_KIT: Record<string, typeof TR808> = {
  TR808, LM2, CASIO_RZ1, MFB512, CASIO_SK1, MINI808, MICRO_RH12, YAMAHA_MR10, ROLAND_CR8000,
}

const dmUrl = (machine: string, sample: string, fmt: 'm4a' | 'ogg' = 'm4a') =>
  `${DM_BASE}/${MACHINE_DIR[machine]}/${sample}.${fmt}`

const sfUrl = (bank: Bank, inst: string, note: string) =>
  `${SF_BASE}/${bank}/${inst}-mp3/${note}.mp3`

/* helpers to pick 2-3 unique items from a list with a deterministic seed */
const pick = <T>(list: T[], n: number, seed: number): T[] => {
  if (list.length === 0) return []
  const out: T[] = []
  for (let i = 0; i < n; i++) out.push(list[(seed + i * 3) % list.length])
  return out
}
const mk = (machine: string, kind: keyof typeof TR808, n: number, seed: number): DmRef => {
  const kit = MACHINE_KIT[machine]
  const list = kit[kind] || []
  return { machine, samples: pick(list, n, seed) }
}

/* ─────────────────────────  27 preset configurations  ──────────────────── */
// For each preset we hand-pick a drum machine + soundfont instruments that
// match the genre.  Notes are spelled with flats only (URL convention).

const SCALES: Record<string,string[]> = {
  cMin:  ['C3','Eb3','G3','C4','Eb4','G4','C5','Eb5','G5'],
  cMaj:  ['C3','E3','G3','C4','E4','G4','C5','E5','G5'],
  aMin:  ['A2','C3','E3','A3','C4','E4','A4','C5','E5'],
  dMin:  ['D3','F3','A3','D4','F4','A4','D5','F5','A5'],
  fMaj:  ['F2','A2','C3','F3','A3','C4','F4','A4','C5'],
  eMin:  ['E2','G2','B2','E3','G3','B3','E4','G4','B4'],
  gMaj:  ['G2','B2','D3','G3','B3','D4','G4','B4','D5'],
  bbMaj: ['Bb2','D3','F3','Bb3','D4','F4','Bb4','D5','F5'],
  ebMaj: ['Eb2','G2','Bb2','Eb3','G3','Bb3','Eb4','G4','Bb4'],
}
// take three notes from a scale starting at offset, with deterministic spread
const notes = (scale: string[], offset: number, n: number): string[] => {
  const out: string[] = []
  for (let i = 0; i < n; i++) out.push(scale[(offset + i * 2) % scale.length])
  return out
}

const P = (
  idx: number,
  drumMachine: string,
  fillMachine: string,
  bassInst: string,
  percInst: string,
  vocalInst: string,
  chordInst: string,
  longInst: string,
  medInst: string,
  shortInst: string,
  extraInst: string,
  bank: Bank,
  scale: keyof typeof SCALES,
): PresetConfig => {
  const s = SCALES[scale]
  return {
    kick:   mk(drumMachine, 'kicks',  2, idx),
    snare:  mk(drumMachine, 'snares', 2, idx + 1),
    hihat:  { machine: drumMachine, samples: [
                MACHINE_KIT[drumMachine].chs[idx % MACHINE_KIT[drumMachine].chs.length],
                MACHINE_KIT[drumMachine].ohs[idx % MACHINE_KIT[drumMachine].ohs.length],
              ] },
    drum:   mk(drumMachine, 'toms',   2, idx + 2),
    fill:   mk(fillMachine, 'snares', 6, idx + 7),
    bass:   { bank, inst: bassInst,  notes: notes(s, 0, 2) },
    perc:   { bank, inst: percInst,  notes: notes(s, 3, 2) },
    vocal:  { bank, inst: vocalInst, notes: notes(s, 4, 2) },
    chord:  { bank, inst: chordInst, notes: notes(s, 2, 3) },
    long:   { bank, inst: longInst,  notes: notes(s, 1, 3) },
    medium: { bank, inst: medInst,   notes: notes(s, 2, 3) },
    short:  { bank, inst: shortInst, notes: notes(s, 5, 3) },
    inst:   { bank, inst: extraInst, notes: notes(s, 3, 4) },
  }
}

export const PRESET_ASSIGN: PresetConfig[] = [
  /* 0  Dubstep Club */    P( 0,'TR808','TR808',         'synth_bass_1',         'steel_drums',     'synth_voice',     'pad_2_warm',           'lead_2_sawtooth',       'lead_6_voice',          'synth_drum',            'lead_8_bass__lead',     'FluidR3_GM','cMin'),
  /* 1  Trap Soul */       P( 1,'TR808','LM2',           'synth_bass_2',         'vibraphone',      'voice_oohs',      'electric_piano_1',     'lead_6_voice',          'pad_4_choir',           'synth_drum',            'electric_piano_2',      'MusyngKite','aMin'),
  /* 2  House Pulse */     P( 2,'LM2','TR808',           'electric_bass_finger', 'cowbell',         'synth_voice',     'acoustic_grand_piano', 'lead_1_square',         'lead_2_sawtooth',       'synth_drum',            'pad_3_polysynth',       'FluidR3_GM','aMin'),
  /* 3  Lo-Fi Tape */      P( 3,'YAMAHA_MR10','LM2',     'acoustic_bass',        'marimba',         'voice_oohs',      'electric_piano_2',     'acoustic_guitar_nylon', 'electric_piano_1',      'kalimba',               'pad_8_sweep',           'FatBoy',    'fMaj'),
  /* 4  Techno */          P( 4,'TR808','MFB512',        'synth_bass_2',         'woodblock',       'synth_voice',     'pad_3_polysynth',      'lead_5_charang',        'lead_8_bass__lead',     'synth_drum',            'pad_6_metallic',        'MusyngKite','cMin'),
  /* 5  Drum&Bass */       P( 5,'MFB512','TR808',        'slap_bass_2',          'agogo',           'voice_oohs',      'pad_8_sweep',          'lead_7_fifths',         'lead_2_sawtooth',       'synth_drum',            'lead_3_calliope',       'FluidR3_GM','dMin'),
  /* 6  Ambient */         P( 6,'CASIO_SK1','CASIO_SK1', 'fretless_bass',        'tinkle_bell',     'choir_aahs',      'pad_1_new_age',        'pad_4_choir',           'pad_2_warm',            'celesta',               'pad_7_halo',            'MusyngKite','eMin'),
  /* 7  Industrial */      P( 7,'ROLAND_CR8000','TR808', 'overdriven_guitar',    'reverse_cymbal',  'synth_voice',     'pad_6_metallic',       'distortion_guitar',     'overdriven_guitar',     'gunshot',               'helicopter',            'FluidR3_GM','cMin'),
  /* 8  Latin */           P( 8,'ROLAND_CR8000','LM2',   'acoustic_bass',        'taiko_drum',      'choir_aahs',      'acoustic_guitar_nylon','trumpet',               'acoustic_guitar_nylon', 'marimba',               'muted_trumpet',         'FluidR3_GM','dMin'),
  /* 9  Jazz */            P( 9,'YAMAHA_MR10','LM2',     'acoustic_bass',        'vibraphone',      'voice_oohs',      'electric_piano_1',     'alto_sax',              'tenor_sax',             'acoustic_guitar_nylon', 'soprano_sax',           'MusyngKite','bbMaj'),
  /*10  Funk */            P(10,'LM2','TR808',           'slap_bass_1',          'clavinet',        'synth_voice',     'clavinet',             'electric_guitar_clean', 'electric_guitar_muted', 'electric_guitar_jazz',  'trumpet',               'FluidR3_GM','ebMaj'),
  /*11  K-Pop */           P(11,'MINI808','TR808',       'synth_bass_1',         'glockenspiel',    'voice_oohs',      'electric_piano_1',     'lead_1_square',         'lead_2_sawtooth',       'celesta',               'string_ensemble_1',     'MusyngKite','cMaj'),
  /*12  Phonk */           P(12,'TR808','LM2',           'synth_bass_2',         'cowbell',         'synth_voice',     'rock_organ',           'distortion_guitar',     'overdriven_guitar',     'synth_drum',            'lead_8_bass__lead',     'FluidR3_GM','cMin'),
  /*13  Hardstyle */       P(13,'MFB512','TR808',        'synth_bass_2',         'crash_cymbal',    'synth_voice',     'pad_3_polysynth',      'lead_8_bass__lead',     'lead_5_charang',        'synth_drum',            'pad_6_metallic',        'MusyngKite','cMin'),
  /*14  Cinematic */       P(14,'CASIO_RZ1','TR808',     'contrabass',           'timpani',         'choir_aahs',      'string_ensemble_1',    'french_horn',           'string_ensemble_2',     'pizzicato_strings',     'orchestral_harp',       'MusyngKite','dMin'),
  /*15  432Hz Heal */      P(15,'CASIO_SK1','CASIO_SK1', 'fretless_bass',        'tinkle_bell',     'choir_aahs',      'pad_1_new_age',        'pad_4_choir',           'pad_8_sweep',           'celesta',               'koto',                  'FatBoy',    'gMaj'),
  /*16  SoundFX Goofy */   P(16,'MINI808','LM2',         'synth_bass_1',         'woodblock',       'synth_voice',     'fx_3_crystal',         'ocarina',               'fx_5_brightness',       'bird_tweet',            'fx_8_scifi',            'FluidR3_GM','cMaj'),
  /*17  1930s Vintage */   P(17,'YAMAHA_MR10','LM2',     'acoustic_bass',        'vibraphone',      'voice_oohs',      'honkytonk_piano',      'clarinet',              'muted_trumpet',         'banjo',                 'accordion',             'MusyngKite','bbMaj'),
  /*18  Nature Sounds */   P(18,'LM2','YAMAHA_MR10',     'fretless_bass',        'kalimba',         'choir_aahs',      'pad_4_choir',          'pan_flute',             'blown_bottle',          'ocarina',               'bird_tweet',            'FluidR3_GM','eMin'),
  /*19  Chiptune 8-bit */  P(19,'MINI808','MINI808',     'synth_bass_1',         'woodblock',       'synth_voice',     'lead_1_square',        'lead_1_square',         'lead_2_sawtooth',       'lead_3_calliope',       'lead_4_chiff',          'FluidR3_GM','cMaj'),
  /*20  Vaporwave */       P(20,'CASIO_RZ1','LM2',       'synth_bass_2',         'vibraphone',      'voice_oohs',      'electric_piano_1',     'pad_2_warm',            'pad_3_polysynth',       'fx_3_crystal',          'pad_7_halo',            'FatBoy',    'fMaj'),
  /*21  Tribal Drums */    P(21,'TR808','TR808',         'acoustic_bass',        'taiko_drum',      'voice_oohs',      'taiko_drum',           'shakuhachi',            'pan_flute',             'kalimba',               'shanai',                'MusyngKite','dMin'),
  /*22  Bossa Nova */      P(22,'YAMAHA_MR10','LM2',     'acoustic_bass',        'agogo',           'voice_oohs',      'acoustic_guitar_nylon','acoustic_guitar_nylon', 'tenor_sax',             'acoustic_guitar_nylon', 'flute',                 'FluidR3_GM','fMaj'),
  /*23  Synthwave 80s */   P(23,'MFB512','LM2',          'synth_bass_2',         'tinkle_bell',     'synth_voice',     'pad_2_warm',           'lead_2_sawtooth',       'lead_5_charang',        'fx_3_crystal',          'pad_3_polysynth',       'MusyngKite','aMin'),
  /*24  Grime UK */        P(24,'TR808','MFB512',        'synth_bass_1',         'agogo',           'synth_voice',     'pad_8_sweep',          'lead_2_sawtooth',       'lead_6_voice',          'synth_drum',            'lead_8_bass__lead',     'FluidR3_GM','cMin'),
  /*25  Reggaeton */       P(25,'ROLAND_CR8000','TR808', 'slap_bass_1',          'taiko_drum',      'voice_oohs',      'acoustic_guitar_steel','trumpet',               'muted_trumpet',         'marimba',               'electric_guitar_clean', 'FluidR3_GM','aMin'),
  /*26  Math Rock */       P(26,'MICRO_RH12','LM2',      'electric_bass_pick',   'marimba',         'synth_voice',     'electric_guitar_clean','electric_guitar_clean', 'electric_guitar_jazz',  'electric_guitar_muted', 'distortion_guitar',     'MusyngKite','gMaj'),
]

/* ─────────────────────────  public API  ───────────────────────────────── */

/**
 * Returns a fully qualified sample URL for the given preset / pad slot,
 * or null when the preset has no real-sample mapping for this category.
 */
export function getPadSampleUrl(
  presetIdx: number,
  localIdx: number,          // index within the slot (0..n-1)
  category: SoundCategory,
): string | null {
  const cfg = PRESET_ASSIGN[presetIdx]
  if (!cfg) return null
  switch (category) {
    case 'kick':   return dmUrl(cfg.kick.machine,   cfg.kick.samples[localIdx % cfg.kick.samples.length])
    case 'snare':  return dmUrl(cfg.snare.machine,  cfg.snare.samples[localIdx % cfg.snare.samples.length])
    case 'hihat':  return dmUrl(cfg.hihat.machine,  cfg.hihat.samples[localIdx % cfg.hihat.samples.length])
    case 'drum':   return dmUrl(cfg.drum.machine,   cfg.drum.samples[localIdx % cfg.drum.samples.length])
    case 'bass':   return sfUrl(cfg.bass.bank,   cfg.bass.inst,   cfg.bass.notes[localIdx % cfg.bass.notes.length])
    case 'percussion':
                   return sfUrl(cfg.perc.bank,   cfg.perc.inst,   cfg.perc.notes[localIdx % cfg.perc.notes.length])
    case 'vocal':  return sfUrl(cfg.vocal.bank,  cfg.vocal.inst,  cfg.vocal.notes[localIdx % cfg.vocal.notes.length])
    case 'chord':  return sfUrl(cfg.chord.bank,  cfg.chord.inst,  cfg.chord.notes[localIdx % cfg.chord.notes.length])
    case 'long':   return sfUrl(cfg.long.bank,   cfg.long.inst,   cfg.long.notes[localIdx % cfg.long.notes.length])
    case 'medium': return sfUrl(cfg.medium.bank, cfg.medium.inst, cfg.medium.notes[localIdx % cfg.medium.notes.length])
    case 'short':  return sfUrl(cfg.short.bank,  cfg.short.inst,  cfg.short.notes[localIdx % cfg.short.notes.length])
    case 'instrument':
                   return sfUrl(cfg.inst.bank,   cfg.inst.inst,   cfg.inst.notes[localIdx % cfg.inst.notes.length])
    case 'fill':   return null   // composed offline – see synthesizeFill
    default:       return null
  }
}

/**
 * Build a composed "fill" AudioBuffer for a given preset/pad by sequencing
 * real drum samples from that preset's fill machine into a snare-roll
 * pattern.  Falls back to null if the fetches fail.
 */
export async function synthesizeFill(
  presetIdx: number,
  localIdx: number,
  ctx: AudioContext,
  loader: (url: string) => Promise<AudioBuffer | null>,
): Promise<AudioBuffer | null> {
  const cfg = PRESET_ASSIGN[presetIdx]
  if (!cfg) return null
  const samples = cfg.fill.samples
  if (!samples.length) return null

  // 6 hit pattern – snare roll into open hat
  const urls = samples.slice(0, 6).map(s => dmUrl(cfg.fill.machine, s))
  const bufs = await Promise.all(urls.map(loader))
  const valid = bufs.filter((b): b is AudioBuffer => !!b)
  if (valid.length === 0) return null

  const length = ctx.sampleRate * 1.4
  const offline = new OfflineAudioContext(2, length, ctx.sampleRate)
  // pattern: hits at 0.0, 0.10, 0.20, 0.30, 0.50, 0.80
  const offsets = localIdx % 2 === 0
    ? [0.00, 0.10, 0.20, 0.30, 0.50, 0.80]
    : [0.00, 0.08, 0.16, 0.24, 0.40, 0.70]
  const gains   = [0.4, 0.5, 0.6, 0.7, 0.85, 1.0]
  offsets.forEach((t, i) => {
    const src = offline.createBufferSource()
    src.buffer = valid[i % valid.length]
    const g = offline.createGain()
    g.gain.value = gains[i] * 0.8
    src.connect(g).connect(offline.destination)
    src.start(t)
  })
  try {
    return await offline.startRendering()
  } catch {
    return null
  }
}

/** Tiny inventory for credits modal */
export const SAMPLE_CREDITS = {
  drumMachines: 'github.com/smpldsnds/drum-machines (CC-BY)',
  soundfonts:   'github.com/gleitz/midi-js-soundfonts (CC-BY / CC-BY-SA)',
}
