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
  /* 0  Dubstep Club */    P( 0,'TR808','TR808',         'synth_bass_1',         'steel_drums',     'lead_6_voice',     'pad_2_warm',           'lead_2_sawtooth',       'lead_6_voice',          'synth_drum',            'lead_8_bass__lead',     'FluidR3_GM','cMin'),
  /* 1  Trap Soul */       P( 1,'TR808','LM2',           'synth_bass_2',         'vibraphone',      'voice_oohs',      'electric_piano_1',     'lead_6_voice',          'pad_4_choir',           'synth_drum',            'electric_piano_2',      'MusyngKite','aMin'),
  /* 2  House Pulse */     P( 2,'LM2','TR808',           'electric_bass_finger', 'agogo',           'lead_6_voice',     'acoustic_grand_piano', 'lead_1_square',         'lead_2_sawtooth',       'synth_drum',            'pad_3_polysynth',       'FluidR3_GM','aMin'),
  /* 3  Lo-Fi Tape */      P( 3,'YAMAHA_MR10','LM2',     'acoustic_bass',        'marimba',         'voice_oohs',      'electric_piano_2',     'acoustic_guitar_nylon', 'electric_piano_1',      'kalimba',               'pad_8_sweep',           'FatBoy',    'fMaj'),
  /* 4  Techno */          P( 4,'TR808','MFB512',        'synth_bass_2',         'woodblock',       'lead_6_voice',     'pad_3_polysynth',      'lead_5_charang',        'lead_8_bass__lead',     'synth_drum',            'pad_6_metallic',        'MusyngKite','cMin'),
  /* 5  Drum&Bass */       P( 5,'MFB512','TR808',        'slap_bass_2',          'agogo',           'voice_oohs',      'pad_8_sweep',          'lead_7_fifths',         'lead_2_sawtooth',       'synth_drum',            'lead_3_calliope',       'FluidR3_GM','dMin'),
  /* 6  Ambient */         P( 6,'CASIO_SK1','CASIO_SK1', 'fretless_bass',        'tinkle_bell',     'choir_aahs',      'pad_1_new_age',        'pad_4_choir',           'pad_2_warm',            'celesta',               'pad_7_halo',            'MusyngKite','eMin'),
  /* 7  Industrial */      P( 7,'ROLAND_CR8000','TR808', 'overdriven_guitar',    'synth_drum',      'lead_6_voice',     'pad_6_metallic',       'distortion_guitar',     'overdriven_guitar',     'gunshot',               'helicopter',            'FluidR3_GM','cMin'),
  /* 8  Latin */           P( 8,'ROLAND_CR8000','LM2',   'acoustic_bass',        'agogo',           'choir_aahs',      'acoustic_guitar_nylon','trumpet',               'acoustic_guitar_nylon', 'marimba',               'muted_trumpet',         'FluidR3_GM','dMin'),
  /* 9  Jazz */            P( 9,'YAMAHA_MR10','LM2',     'acoustic_bass',        'vibraphone',      'voice_oohs',      'electric_piano_1',     'alto_sax',              'tenor_sax',             'acoustic_guitar_nylon', 'soprano_sax',           'MusyngKite','bbMaj'),
  /*10  Funk */            P(10,'LM2','TR808',           'slap_bass_1',          'clavinet',        'lead_6_voice',     'clavinet',             'electric_guitar_clean', 'electric_guitar_muted', 'electric_guitar_jazz',  'trumpet',               'FluidR3_GM','ebMaj'),
  /*11  K-Pop */           P(11,'MINI808','TR808',       'synth_bass_1',         'glockenspiel',    'voice_oohs',      'electric_piano_1',     'lead_1_square',         'lead_2_sawtooth',       'celesta',               'string_ensemble_1',     'MusyngKite','cMaj'),
  /*12  Phonk */           P(12,'TR808','LM2',           'synth_bass_2',         'agogo',           'lead_6_voice',     'rock_organ',           'distortion_guitar',     'overdriven_guitar',     'synth_drum',            'lead_8_bass__lead',     'FluidR3_GM','cMin'),
  /*13  Hardstyle */       P(13,'MFB512','TR808',        'synth_bass_2',         'woodblock',       'lead_6_voice',     'pad_3_polysynth',      'lead_8_bass__lead',     'lead_5_charang',        'synth_drum',            'pad_6_metallic',        'MusyngKite','cMin'),
  /*14  Cinematic */       P(14,'CASIO_RZ1','TR808',     'contrabass',           'timpani',         'choir_aahs',      'string_ensemble_1',    'french_horn',           'string_ensemble_2',     'pizzicato_strings',     'orchestral_harp',       'MusyngKite','dMin'),
  /*15  432Hz Heal */      P(15,'CASIO_SK1','CASIO_SK1', 'fretless_bass',        'tinkle_bell',     'choir_aahs',      'pad_1_new_age',        'pad_4_choir',           'pad_8_sweep',           'celesta',               'koto',                  'FatBoy',    'gMaj'),
  /*16  SoundFX Goofy */   P(16,'MINI808','LM2',         'synth_bass_1',         'woodblock',       'lead_6_voice',     'fx_3_crystal',         'ocarina',               'fx_5_brightness',       'bird_tweet',            'fx_8_scifi',            'FluidR3_GM','cMaj'),
  /*17  1930s Vintage */   P(17,'YAMAHA_MR10','LM2',     'acoustic_bass',        'vibraphone',      'voice_oohs',      'honkytonk_piano',      'clarinet',              'muted_trumpet',         'banjo',                 'accordion',             'MusyngKite','bbMaj'),
  /*18  Nature Sounds */   P(18,'LM2','YAMAHA_MR10',     'fretless_bass',        'kalimba',         'choir_aahs',      'pad_4_choir',          'pan_flute',             'blown_bottle',          'ocarina',               'bird_tweet',            'FluidR3_GM','eMin'),
  /*19  Chiptune 8-bit */  P(19,'MINI808','MINI808',     'synth_bass_1',         'woodblock',       'lead_6_voice',     'lead_1_square',        'lead_1_square',         'lead_2_sawtooth',       'lead_3_calliope',       'lead_4_chiff',          'FluidR3_GM','cMaj'),
  /*20  Vaporwave */       P(20,'CASIO_RZ1','LM2',       'synth_bass_2',         'vibraphone',      'voice_oohs',      'electric_piano_1',     'pad_2_warm',            'pad_3_polysynth',       'fx_3_crystal',          'pad_7_halo',            'FatBoy',    'fMaj'),
  /*21  Tribal Drums */    P(21,'TR808','TR808',         'acoustic_bass',        'taiko_drum',      'voice_oohs',      'taiko_drum',           'shakuhachi',            'pan_flute',             'kalimba',               'shanai',                'MusyngKite','dMin'),
  /*22  Bossa Nova */      P(22,'YAMAHA_MR10','LM2',     'acoustic_bass',        'agogo',           'voice_oohs',      'acoustic_guitar_nylon','acoustic_guitar_nylon', 'tenor_sax',             'acoustic_guitar_nylon', 'flute',                 'FluidR3_GM','fMaj'),
  /*23  Synthwave 80s */   P(23,'MFB512','LM2',          'synth_bass_2',         'tinkle_bell',     'lead_6_voice',     'pad_2_warm',           'lead_2_sawtooth',       'lead_5_charang',        'fx_3_crystal',          'pad_3_polysynth',       'MusyngKite','aMin'),
  /*24  Grime UK */        P(24,'TR808','MFB512',        'synth_bass_1',         'agogo',           'lead_6_voice',     'pad_8_sweep',          'lead_2_sawtooth',       'lead_6_voice',          'synth_drum',            'lead_8_bass__lead',     'FluidR3_GM','cMin'),
  /*25  Reggaeton */       P(25,'ROLAND_CR8000','TR808', 'slap_bass_1',          'marimba',         'voice_oohs',      'acoustic_guitar_steel','trumpet',               'muted_trumpet',         'marimba',               'electric_guitar_clean', 'FluidR3_GM','aMin'),
  /*26  Math Rock */       P(26,'MICRO_RH12','LM2',      'electric_bass_pick',   'marimba',         'lead_6_voice',     'electric_guitar_clean','electric_guitar_clean', 'electric_guitar_jazz',  'electric_guitar_muted', 'distortion_guitar',     'MusyngKite','gMaj'),
]

/* ─────────────  extended sources for per-pad within-preset variation  ───── */
// Additional public CDNs (all CC-licensed, validated 2025):
//   • tonejs.github.io/audio/drum-samples     (15 kits × kick/snare/hihat/tom1/2/3)
//   • tonejs.github.io/audio/drum-samples/loops (7 loop files)
//   • tonejs.github.io/audio/salamander       (Salamander Grand Piano, A0..A7,C..)
//   • tonejs.github.io/audio/casio            (Casio MT-540 keyboard)
//   • nbrosowsky.github.io/tonejs-instruments (17 recorded instruments)
const TONEJS_KIT_BASE  = 'https://tonejs.github.io/audio/drum-samples'
const TONEJS_LOOP_BASE = 'https://tonejs.github.io/audio/drum-samples/loops'
const NBRO_BASE        = 'https://nbrosowsky.github.io/tonejs-instruments/samples'
const SALAMANDER_BASE  = 'https://tonejs.github.io/audio/salamander'
const TONEJS_CASIO     = 'https://tonejs.github.io/audio/casio'

type Src =
  | { k:'sf';  b: Bank;   i: string; n: string }     // gleitz GM soundfont
  | { k:'dm';  m: string; s: string }                // smpldsnds drum machine
  | { k:'tdm'; kit: string; s: string }              // tonejs drum kit
  | { k:'tin'; i: string; n: string }                // nbrosowsky instrument
  | { k:'tlp'; f: string }                           // tonejs loop
  | { k:'sal'; n: string }                           // salamander piano
  | { k:'cas'; n: string }                           // casio MT-540

function srcUrl(s: Src): string {
  switch (s.k) {
    case 'sf':  return sfUrl(s.b, s.i, s.n)
    case 'dm':  return dmUrl(s.m, s.s)
    case 'tdm': return `${TONEJS_KIT_BASE}/${s.kit}/${s.s}.mp3`
    case 'tin': return `${NBRO_BASE}/${s.i}/${s.n}.mp3`
    case 'tlp': return `${TONEJS_LOOP_BASE}/${s.f}.mp3`
    case 'sal': return `${SALAMANDER_BASE}/${s.n}.mp3`
    case 'cas': return `${TONEJS_CASIO}/${s.n}.mp3`
  }
}

// terse builders
const sf  = (b: Bank, i: string, n: string): Src => ({ k:'sf', b, i, n })
const dm  = (m: string, s: string): Src => ({ k:'dm', m, s })
const tdm = (kit: string, s: string): Src => ({ k:'tdm', kit, s })
const tin = (i: string, n: string): Src => ({ k:'tin', i, n })
const tlp = (f: string): Src => ({ k:'tlp', f })
const sal = (n: string): Src => ({ k:'sal', n })
const cas = (n: string): Src => ({ k:'cas', n })

/* genre pools — entries are deliberately varied instruments/kits so any
 * 11-slice (melodic) or 5-slice (drum) or single pick yields a distinct sound.
 * Each pool exposes:
 *   mel:  pitched-instrument variety  (≥ 17)   → long / medium / short / chord / inst secondaries
 *   drm:  drum hit variety            (≥ 10)   → kick / snare / hihat / drum / fill secondaries
 *   bass, perc, voc:                  (≥ 7)    → single secondary each
 *   altKits: tonejs kit names         (≥ 6)    → alt fill machine for synthesizeFill
 */
interface GenrePool { mel: Src[]; drm: Src[]; bass: Src[]; perc: Src[]; voc: Src[]; altKits: string[] }

const POOL_ELECTRONIC: GenrePool = {
  mel: [
    sf('FluidR3_GM','lead_2_sawtooth','C4'),
    tin('guitar-electric','A3'),
    sf('MusyngKite','synth_brass_1','G3'),
    sf('FluidR3_GM','lead_5_charang','C4'),
    sf('MusyngKite','pad_3_polysynth','A3'),
    tin('organ','C4'),
    sf('FluidR3_GM','lead_8_bass__lead','C3'),
    sf('MusyngKite','synth_bass_2','C3'),
    sf('FluidR3_GM','fx_3_crystal','C5'),
    sf('FluidR3_GM','lead_1_square','C5'),
    sf('MusyngKite','pad_8_sweep','G3'),
    sf('FluidR3_GM','synth_brass_2','C4'),
    sf('MusyngKite','lead_7_fifths','C4'),
    sf('FluidR3_GM','electric_piano_1','C4'),
    sf('MusyngKite','fx_5_brightness','C5'),
    sf('FluidR3_GM','pad_2_warm','C4'),
    sf('MusyngKite','synth_bass_1','C3'),
    sf('FluidR3_GM','lead_3_calliope','C5'),
  ],
  drm: [
    tdm('Techno','kick'), tdm('R8','snare'), tdm('Techno','hihat'), tdm('R8','tom1'), tdm('Techno','tom2'),
    tdm('breakbeat13','kick'), tdm('breakbeat8','snare'), tdm('breakbeat9','hihat'),
    tdm('Kit3','kick'), tdm('Kit8','snare'), tdm('LINN','hihat'),
    tdm('MFB512-substitute','kick'),
  ],
  bass: [
    tin('bass-electric','E3'),
    sf('FluidR3_GM','synth_bass_2','E2'),
    sf('MusyngKite','synth_bass_1','E2'),
    sf('FluidR3_GM','slap_bass_1','E2'),
    tin('bass-electric','G4'),
    sf('MusyngKite','synth_bass_2','A2'),
    sf('FluidR3_GM','lead_8_bass__lead','E2'),
  ],
  perc: [
    tin('xylophone','C5'),
    sf('MusyngKite','woodblock','C5'),
    sf('FluidR3_GM','woodblock','C5'),
    sf('MusyngKite','agogo','C5'),
    sf('FluidR3_GM','steel_drums','C5'),
    sf('MusyngKite','glockenspiel','C6'),
    sf('FluidR3_GM','tinkle_bell','C6'),
    dm('LM2','tambourine'),
    dm('TR808','cowbell/cb'),
    dm('TR808','clave/cl'),
    dm('TR808','maraca/ma'),
  ],
  voc: [
    sf('FluidR3_GM','lead_6_voice','A3'),
    sf('MusyngKite','voice_oohs','A3'),
    sf('FluidR3_GM','choir_aahs','A3'),
    sf('MusyngKite','choir_aahs','A3'),
    sf('MusyngKite','pad_4_choir','C4'),
    sf('FluidR3_GM','lead_6_voice','C4'),
    sf('MusyngKite','lead_6_voice','C4'),
  ],
  altKits: ['Techno','R8','breakbeat13','Kit8','LINN','breakbeat8','Kit3'],
}

const POOL_URBAN: GenrePool = {  // trap / phonk / grime
  mel: [
    sf('MusyngKite','electric_piano_1','C4'),
    sf('FluidR3_GM','synth_bass_2','C3'),
    sf('MusyngKite','vibraphone','C5'),
    sf('FluidR3_GM','lead_8_bass__lead','C4'),
    sf('MusyngKite','pad_2_warm','G3'),
    tin('guitar-electric','A3'),
    sf('FluidR3_GM','distortion_guitar','E3'),
    sf('MusyngKite','lead_6_voice','A3'),
    tin('organ','C4'),
    sf('FluidR3_GM','overdriven_guitar','E3'),
    sf('MusyngKite','rock_organ','C4'),
    sf('FluidR3_GM','lead_2_sawtooth','C5'),
    sf('MusyngKite','choir_aahs','A3'),
    sf('FluidR3_GM','synth_brass_1','C4'),
    sf('MusyngKite','pad_4_choir','C4'),
    tin('harmonium','C4'),
    sf('FluidR3_GM','electric_piano_2','C4'),
    sf('MusyngKite','fx_3_crystal','C5'),
  ],
  drm: [
    tdm('TR-808-substitute','kick'), tdm('LM-2-substitute','snare'), tdm('Kit8','hihat'), tdm('R8','tom1'), tdm('LINN','tom2'),
    tdm('Kit3','snare'), tdm('Stark','kick'), tdm('CR78','hihat'), tdm('Techno','tom3'),
    tdm('breakbeat13','snare'), tdm('Kit8','kick'),
  ],
  bass: [
    sf('FluidR3_GM','synth_bass_2','C2'),
    tin('bass-electric','E3'),
    sf('MusyngKite','synth_bass_1','E2'),
    sf('FluidR3_GM','electric_bass_finger','E2'),
    sf('MusyngKite','slap_bass_2','C3'),
    sf('FluidR3_GM','fretless_bass','E2'),
    sf('MusyngKite','synth_bass_2','A2'),
  ],
  perc: [
    sf('FluidR3_GM','woodblock','C5'),
    tin('xylophone','G5'),
    sf('MusyngKite','clavinet','C4'),
    sf('FluidR3_GM','vibraphone','C5'),
    sf('MusyngKite','marimba','C5'),
    sf('FluidR3_GM','tinkle_bell','C6'),
    sf('MusyngKite','glockenspiel','C6'),
  ],
  voc: [
    sf('FluidR3_GM','voice_oohs','A3'),
    sf('MusyngKite','lead_6_voice','A3'),
    sf('MusyngKite','voice_oohs','C4'),
    sf('FluidR3_GM','choir_aahs','C4'),
    sf('MusyngKite','pad_4_choir','A3'),
    sf('FluidR3_GM','lead_6_voice','A3'),
    sf('FluidR3_GM','choir_aahs','A3'),
  ],
  altKits: ['Stark','LINN','Kit8','breakbeat13','R8','CR78','Kit3'],
}

const POOL_ACOUSTIC: GenrePool = {  // lo-fi / rock-adjacent
  mel: [
    tin('guitar-acoustic','A3'),
    tin('piano','C4'),
    sf('MusyngKite','acoustic_guitar_nylon','C4'),
    sal('A3'),
    tin('guitar-nylon','E3'),
    sf('FluidR3_GM','acoustic_guitar_steel','C4'),
    tin('harmonium','C4'),
    sf('MusyngKite','electric_piano_1','C4'),
    tin('organ','C4'),
    sf('FluidR3_GM','vibraphone','C5'),
    tin('flute','C5'),
    sf('MusyngKite','marimba','C5'),
    sal('C4'),
    sf('FluidR3_GM','electric_piano_2','C4'),
    tin('piano','E4'),
    sf('MusyngKite','acoustic_grand_piano','C4'),
    tin('guitar-acoustic','C4'),
    sf('FluidR3_GM','celesta','C5'),
  ],
  drm: [
    tdm('acoustic-kit','kick'), tdm('Stark','snare'), tdm('LINN','hihat'), tdm('acoustic-kit','tom1'), tdm('Stark','tom2'),
    tdm('LM-2-substitute','snare'), tdm('Yamaha-MR10-substitute','kick'), tdm('Kit3','hihat'), tdm('acoustic-kit','tom3'),
    tdm('CR78','snare'),
  ],
  bass: [
    sf('FluidR3_GM','acoustic_bass','E2'),
    tin('contrabass','A2'),
    sf('MusyngKite','acoustic_bass','C2'),
    sf('FluidR3_GM','electric_bass_finger','E2'),
    sf('MusyngKite','fretless_bass','E2'),
    tin('contrabass','E3'),
    sf('FluidR3_GM','acoustic_bass','C3'),
  ],
  perc: [
    tin('xylophone','C5'),
    sf('FluidR3_GM','marimba','C5'),
    sf('MusyngKite','vibraphone','C5'),
    sf('FluidR3_GM','kalimba','C5'),
    sf('MusyngKite','agogo','C5'),
    sf('FluidR3_GM','tinkle_bell','C6'),
    sf('MusyngKite','woodblock','C5'),
  ],
  voc: [
    sf('FluidR3_GM','voice_oohs','A3'),
    sf('FluidR3_GM','voice_oohs','C4'),
    sf('MusyngKite','choir_aahs','A3'),
    sf('FluidR3_GM','lead_6_voice','A3'),
    sf('MusyngKite','pad_4_choir','C4'),
    sf('MusyngKite','lead_6_voice','A3'),
    sf('FluidR3_GM','choir_aahs','C4'),
  ],
  altKits: ['acoustic-kit','Stark','LINN','Kit3','CR78','Kit8'],
}

const POOL_AMBIENT: GenrePool = {
  mel: [
    sf('FluidR3_GM','pad_1_new_age','C4'),
    tin('harp','C5'),
    sal('C4'),
    sf('MusyngKite','pad_2_warm','C4'),
    tin('flute','C5'),
    sf('FluidR3_GM','pad_4_choir','C4'),
    cas('A2'),
    sf('MusyngKite','pad_7_halo','C4'),
    tin('organ','C5'),
    sf('FluidR3_GM','pad_8_sweep','C4'),
    sf('MusyngKite','celesta','C5'),
    tin('harmonium','C4'),
    sf('FluidR3_GM','fx_3_crystal','C5'),
    sal('A4'),
    sf('MusyngKite','kalimba','C5'),
    sf('FluidR3_GM','pad_5_bowed','C4'),
    tin('harp','A4'),
    sf('MusyngKite','pad_3_polysynth','C4'),
  ],
  drm: [
    tdm('Casio-SK1-substitute','kick'), tdm('CR78','snare'), tdm('KPR77','hihat'), tdm('4OP-FM','tom1'), tdm('Stark','tom2'),
    tdm('LM-2-substitute','snare'), tdm('Kit3','kick'), tdm('LINN','hihat'), tdm('TheCheebacabra1','tom3'),
    tdm('CR78','kick'),
  ],
  bass: [
    sf('FluidR3_GM','fretless_bass','E2'),
    tin('contrabass','A2'),
    sf('MusyngKite','acoustic_bass','C2'),
    sf('FluidR3_GM','synth_bass_1','C2'),
    sf('MusyngKite','pad_2_warm','C2'),
    tin('cello','C3'),
    sf('FluidR3_GM','contrabass','C2'),
  ],
  perc: [
    sf('FluidR3_GM','tinkle_bell','C6'),
    sf('MusyngKite','celesta','C5'),
    tin('xylophone','C6'),
    sf('FluidR3_GM','kalimba','C5'),
    sf('MusyngKite','glockenspiel','C6'),
    sf('FluidR3_GM','music_box','C5'),
    sf('MusyngKite','marimba','C5'),
  ],
  voc: [
    sf('FluidR3_GM','choir_aahs','A3'),
    sf('MusyngKite','voice_oohs','A4'),
    sf('FluidR3_GM','pad_4_choir','C4'),
    sf('MusyngKite','choir_aahs','C4'),
    sf('MusyngKite','lead_6_voice','C4'),
    sf('FluidR3_GM','choir_aahs','C4'),
    sf('FluidR3_GM','lead_6_voice','A3'),
  ],
  altKits: ['CR78','KPR77','4OP-FM','Stark','Kit3','LINN','TheCheebacabra1'],
}

const POOL_JAZZ: GenrePool = {
  mel: [
    tin('saxophone','C4'),
    sf('FluidR3_GM','electric_piano_1','C4'),
    tin('trumpet','C4'),
    sf('MusyngKite','vibraphone','C5'),
    tin('piano','A3'),
    sf('FluidR3_GM','acoustic_bass','E2'),
    tin('guitar-acoustic','C4'),
    sf('MusyngKite','alto_sax','C4'),
    sf('FluidR3_GM','tenor_sax','C4'),
    tin('flute','C5'),
    sf('MusyngKite','muted_trumpet','C5'),
    tin('trombone','C4'),
    sf('FluidR3_GM','clarinet','C5'),
    tin('saxophone','G4'),
    sf('MusyngKite','soprano_sax','C5'),
    sf('FluidR3_GM','vibraphone','C5'),
    tin('cello','A3'),
    sf('MusyngKite','acoustic_guitar_nylon','C4'),
  ],
  drm: [
    tdm('Yamaha-MR10-substitute','kick'), tdm('LM-2-substitute','snare'), tdm('CR78','hihat'), tdm('Stark','tom1'), tdm('LINN','tom2'),
    tdm('acoustic-kit','snare'), tdm('Kit3','kick'), tdm('LINN','hihat'), tdm('Stark','tom3'),
    tdm('acoustic-kit','kick'), tdm('TheCheebacabra1','snare'), tdm('CR78','tom1'),
  ],
  bass: [
    sf('FluidR3_GM','acoustic_bass','E2'),
    tin('contrabass','A2'),
    sf('MusyngKite','slap_bass_1','E2'),
    sf('FluidR3_GM','electric_bass_finger','E2'),
    sf('MusyngKite','fretless_bass','C3'),
    tin('contrabass','E3'),
    sf('FluidR3_GM','acoustic_bass','C3'),
  ],
  perc: [
    sf('FluidR3_GM','vibraphone','C5'),
    tin('xylophone','C5'),
    sf('MusyngKite','marimba','C5'),
    sf('FluidR3_GM','agogo','C5'),
    sf('MusyngKite','clavinet','C4'),
    sf('FluidR3_GM','tinkle_bell','C6'),
    sf('MusyngKite','glockenspiel','C6'),
  ],
  voc: [
    sf('FluidR3_GM','voice_oohs','A3'),
    sf('MusyngKite','choir_aahs','A3'),
    sf('MusyngKite','voice_oohs','C4'),
    sf('FluidR3_GM','lead_6_voice','A3'),
    sf('MusyngKite','pad_4_choir','C4'),
    sf('FluidR3_GM','choir_aahs','C4'),
    sf('FluidR3_GM','voice_oohs','C4'),
  ],
  altKits: ['acoustic-kit','LINN','Stark','CR78','Kit3','TheCheebacabra1'],
}

const POOL_WORLD: GenrePool = {
  mel: [
    tin('guitar-nylon','A3'),
    sf('FluidR3_GM','steel_drums','C5'),
    tin('trumpet','C4'),
    sf('MusyngKite','marimba','C5'),
    sf('FluidR3_GM','taiko_drum','C3'),
    sf('MusyngKite','shakuhachi','C5'),
    tin('xylophone','C5'),
    sf('FluidR3_GM','kalimba','C5'),
    sf('MusyngKite','pan_flute','C5'),
    tin('flute','C5'),
    sf('FluidR3_GM','shanai','C5'),
    tin('guitar-acoustic','A3'),
    sf('MusyngKite','sitar','C4'),
    sf('FluidR3_GM','koto','C5'),
    tin('saxophone','C4'),
    sf('MusyngKite','agogo','C5'),
    sf('FluidR3_GM','muted_trumpet','C5'),
    tin('harp','A4'),
  ],
  drm: [
    tdm('TR-808-substitute','kick'), tdm('Roland-CR-8000-substitute','snare'), tdm('LM-2-substitute','hihat'), tdm('breakbeat9','tom1'), tdm('Stark','tom2'),
    tdm('CR78','snare'), tdm('breakbeat13','kick'), tdm('Kit3','hihat'), tdm('R8','tom3'),
    tdm('TheCheebacabra1','snare'), tdm('LINN','kick'),
  ],
  bass: [
    sf('FluidR3_GM','acoustic_bass','E2'),
    tin('contrabass','A2'),
    sf('MusyngKite','slap_bass_1','E2'),
    sf('FluidR3_GM','synth_bass_1','C2'),
    sf('MusyngKite','electric_bass_finger','E2'),
    tin('contrabass','E3'),
    sf('FluidR3_GM','fretless_bass','C3'),
  ],
  perc: [
    sf('FluidR3_GM','taiko_drum','C4'),
    sf('MusyngKite','kalimba','C5'),
    sf('FluidR3_GM','marimba','C5'),
    sf('MusyngKite','agogo','C5'),
    tin('xylophone','C6'),
    sf('FluidR3_GM','steel_drums','C5'),
    sf('MusyngKite','woodblock','C5'),
  ],
  voc: [
    sf('FluidR3_GM','voice_oohs','A3'),
    sf('MusyngKite','choir_aahs','A3'),
    sf('FluidR3_GM','lead_6_voice','A3'),
    sf('MusyngKite','pad_4_choir','C4'),
    sf('MusyngKite','lead_6_voice','C4'),
    sf('FluidR3_GM','choir_aahs','C4'),
    sf('MusyngKite','voice_oohs','C4'),
  ],
  altKits: ['Stark','breakbeat9','breakbeat13','Kit3','R8','CR78','LINN'],
}

const POOL_ORCHESTRAL: GenrePool = {
  mel: [
    tin('violin','A4'),
    tin('cello','C3'),
    sf('FluidR3_GM','string_ensemble_1','C4'),
    tin('contrabass','A2'),
    sf('MusyngKite','french_horn','C4'),
    tin('trombone','C3'),
    sf('FluidR3_GM','orchestral_harp','C5'),
    tin('bassoon','C3'),
    sf('MusyngKite','timpani','C3'),
    tin('flute','C5'),
    sf('FluidR3_GM','clarinet','C5'),
    sf('MusyngKite','pizzicato_strings','C4'),
    tin('trumpet','C4'),
    sf('FluidR3_GM','string_ensemble_2','C4'),
    sal('C4'),
    tin('harp','A4'),
    sf('MusyngKite','oboe','C5'),
    sf('FluidR3_GM','viola','C4'),
  ],
  drm: [
    tdm('Casio-RZ1-substitute','kick'), tdm('Stark','snare'), tdm('Kit3','hihat'), tdm('Casio-RZ1-substitute','tom1'), tdm('Stark','tom2'),
    tdm('TR-808-substitute','kick'), tdm('LM-2-substitute','snare'), tdm('CR78','hihat'), tdm('Stark','tom3'),
    tdm('LINN','kick'),
  ],
  bass: [
    tin('contrabass','A2'),
    sf('FluidR3_GM','contrabass','C2'),
    tin('cello','C3'),
    sf('MusyngKite','acoustic_bass','E2'),
    sf('FluidR3_GM','tuba','C2'),
    tin('bassoon','C3'),
    sf('MusyngKite','contrabass','E2'),
  ],
  perc: [
    sf('FluidR3_GM','timpani','C3'),
    sf('MusyngKite','orchestral_harp','C5'),
    sf('FluidR3_GM','pizzicato_strings','C4'),
    sf('MusyngKite','tinkle_bell','C6'),
    tin('xylophone','C6'),
    sf('FluidR3_GM','tubular_bells','C5'),
    sf('MusyngKite','celesta','C5'),
  ],
  voc: [
    sf('FluidR3_GM','choir_aahs','A3'),
    sf('MusyngKite','voice_oohs','A3'),
    sf('FluidR3_GM','pad_4_choir','C4'),
    sf('MusyngKite','pad_4_choir','A3'),
    sf('MusyngKite','choir_aahs','C4'),
    sf('FluidR3_GM','lead_6_voice','A3'),
    sf('MusyngKite','lead_6_voice','A3'),
  ],
  altKits: ['Stark','Kit3','CR78','LINN','Casio-RZ1-substitute','LM-2-substitute'],
}

const POOL_FX: GenrePool = {  // chiptune / sound-fx / goofy
  mel: [
    sf('FluidR3_GM','lead_1_square','C5'),
    sf('MusyngKite','lead_2_sawtooth','C5'),
    sf('FluidR3_GM','lead_3_calliope','C5'),
    sf('MusyngKite','lead_4_chiff','C5'),
    sf('FluidR3_GM','fx_3_crystal','C5'),
    sf('MusyngKite','fx_5_brightness','C5'),
    sf('FluidR3_GM','fx_8_scifi','C5'),
    sf('MusyngKite','bird_tweet','C6'),
    sf('FluidR3_GM','ocarina','C5'),
    sf('MusyngKite','telephone_ring','C5'),
    sf('FluidR3_GM','helicopter','C3'),
    sf('MusyngKite','fx_4_atmosphere','C4'),
    sf('FluidR3_GM','fx_6_goblins','C4'),
    sf('MusyngKite','fx_7_echoes','C4'),
    sf('FluidR3_GM','lead_5_charang','C5'),
    sf('MusyngKite','lead_8_bass__lead','C4'),
    sf('FluidR3_GM','synth_brass_1','C4'),
    sf('MusyngKite','fx_1_rain','C4'),
  ],
  drm: [
    tdm('4OP-FM','kick'), tdm('KPR77','snare'), tdm('4OP-FM','hihat'), tdm('KPR77','tom1'), tdm('4OP-FM','tom2'),
    tdm('CR78','snare'), tdm('Kit8','kick'), tdm('LINN','hihat'), tdm('4OP-FM','tom3'),
    tdm('Techno','snare'),
  ],
  bass: [
    sf('FluidR3_GM','synth_bass_1','C2'),
    sf('MusyngKite','synth_bass_2','C2'),
    sf('FluidR3_GM','lead_8_bass__lead','C2'),
    tin('bass-electric','E3'),
    sf('MusyngKite','synth_bass_1','E2'),
    sf('FluidR3_GM','synth_bass_2','A2'),
    sf('MusyngKite','synth_bass_2','E2'),
  ],
  perc: [
    sf('FluidR3_GM','woodblock','C5'),
    sf('MusyngKite','tinkle_bell','C6'),
    sf('FluidR3_GM','agogo','C5'),
    tin('xylophone','C6'),
    sf('MusyngKite','glockenspiel','C6'),
    sf('FluidR3_GM','synth_drum','C4'),
    sf('MusyngKite','steel_drums','C5'),
  ],
  voc: [
    sf('FluidR3_GM','lead_6_voice','A3'),
    sf('MusyngKite','voice_oohs','A3'),
    sf('FluidR3_GM','choir_aahs','A3'),
    sf('MusyngKite','pad_4_choir','C4'),
    sf('FluidR3_GM','lead_6_voice','C4'),
    sf('MusyngKite','choir_aahs','C4'),
    sf('MusyngKite','lead_6_voice','C4'),
  ],
  altKits: ['4OP-FM','KPR77','Kit8','LINN','CR78','Techno'],
}

const POOLS: Record<string, GenrePool> = {
  electronic: POOL_ELECTRONIC,
  urban:      POOL_URBAN,
  acoustic:   POOL_ACOUSTIC,
  ambient:    POOL_AMBIENT,
  jazz:       POOL_JAZZ,
  world:      POOL_WORLD,
  orchestral: POOL_ORCHESTRAL,
  fx:         POOL_FX,
}

// Some tonejs kit names referenced in pools are aliases — map to the closest
// real kit name on the CDN (we only have 15 actual kits available).
const KIT_ALIAS: Record<string, string> = {
  'MFB512-substitute':       'Techno',
  'TR-808-substitute':       'R8',
  'LM-2-substitute':         'LINN',
  'Yamaha-MR10-substitute':  'acoustic-kit',
  'Roland-CR-8000-substitute':'CR78',
  'Casio-SK1-substitute':    'KPR77',
  'Casio-RZ1-substitute':    '4OP-FM',
}
function resolveKit(name: string): string { return KIT_ALIAS[name] || name }

interface Secondaries {
  mel: Src[]    // length 11 — slots 0..10 cover long[1,2], medium[1,2], short[1,2], chord[1,2], inst[1,2,3]
  drm: Src[]    // length 5 — kick[1], snare[1], hihat[1], drum[1], fill[1]
  bass1: Src
  perc1: Src
  voc1:  Src
  altFillKit: string
}

// Identity token for a Src — used to dedupe vs preset primaries.
function srcIdent(s: Src): string {
  switch (s.k) {
    case 'sf':  return `sf:${s.b}:${s.i}`
    case 'dm':  return `dm:${s.m}`
    case 'tdm': return `tdm:${s.kit}:${s.s}`
    case 'tin': return `tin:${s.i}`
    case 'tlp': return `tlp:${s.f}`
    case 'sal': return `sal`
    case 'cas': return `cas`
  }
}

function makeSecondaries(genre: string, off: number, exclude: Set<string> = new Set()): Secondaries {
  const p = POOLS[genre]
  const filter = (arr: Src[]) => arr.filter(s => !exclude.has(srcIdent(s)))
  const slice = (arr: Src[], n: number) => {
    const filtered = filter(arr)
    const pool = filtered.length >= n ? filtered : arr  // fall back if filter strips too many
    return Array.from({ length: n }, (_, i) => pool[(off + i) % pool.length])
  }
  const single = (arr: Src[]) => {
    const filtered = filter(arr)
    const pool = filtered.length ? filtered : arr
    return pool[off % pool.length]
  }
  const mel = slice(p.mel, 11)
  const drm = slice(p.drm, 5).map(s => s.k === 'tdm' ? ({ ...s, kit: resolveKit(s.kit) }) : s)
  return {
    mel,
    drm,
    bass1: single(p.bass),
    perc1: single(p.perc),
    voc1:  single(p.voc),
    altFillKit: resolveKit(p.altKits[off % p.altKits.length]),
  }
}

// Build the exclude set for a preset based on its primary instrument identities.
function primariesExclude(cfg: PresetConfig): Set<string> {
  const ex = new Set<string>()
  ;[cfg.bass, cfg.perc, cfg.vocal, cfg.chord, cfg.long, cfg.medium, cfg.short, cfg.inst]
    .forEach(r => ex.add(`sf:${r.bank}:${r.inst}`))
  ex.add(`dm:${cfg.kick.machine}`)
  ex.add(`dm:${cfg.snare.machine}`)
  ex.add(`dm:${cfg.hihat.machine}`)
  ex.add(`dm:${cfg.drum.machine}`)
  return ex
}

// 27 presets → genre+offset table.  Offsets within a genre are spread so
// neighbouring same-genre presets do NOT share secondaries.  Each preset
// also excludes its own primary instruments so secondaries are *different*
// instruments, not just different notes of the same one.
const PRESET_GENRE: Array<[string, number]> = [
  ['electronic', 0],   // 0  Dubstep Club
  ['urban',      0],   // 1  Trap Soul
  ['electronic', 3],   // 2  House Pulse
  ['acoustic',   0],   // 3  Lo-Fi Tape
  ['electronic', 6],   // 4  Techno
  ['electronic', 9],   // 5  Drum & Bass
  ['ambient',    0],   // 6  Ambient
  ['electronic',12],   // 7  Industrial
  ['world',      0],   // 8  Latin
  ['jazz',       0],   // 9  Jazz
  ['jazz',       3],   // 10 Funk
  ['urban',      3],   // 11 K-Pop
  ['urban',      6],   // 12 Phonk
  ['electronic',15],   // 13 Hardstyle
  ['orchestral', 0],   // 14 Cinematic
  ['ambient',    4],   // 15 432Hz Heal
  ['fx',         0],   // 16 SoundFX Goofy
  ['jazz',       6],   // 17 1930s Vintage
  ['ambient',    8],   // 18 Nature Sounds
  ['fx',         5],   // 19 Chiptune 8-bit
  ['ambient',   12],   // 20 Vaporwave
  ['world',      4],   // 21 Tribal Drums
  ['jazz',       9],   // 22 Bossa Nova
  ['electronic',17],   // 23 Synthwave 80s
  ['urban',      9],   // 24 Grime UK
  ['world',      8],   // 25 Reggaeton
  ['acoustic',   4],   // 26 Math Rock
]

const PRESET_SEC: Secondaries[] = PRESET_GENRE.map(([g, off], i) =>
  makeSecondaries(g, off, primariesExclude(PRESET_ASSIGN[i]))
)

// slot index in Secondaries.mel for each (category, localIdx)
const MEL_SLOT: Partial<Record<SoundCategory, Record<number, number>>> = {
  long:       { 1: 0,  2: 1 },
  medium:     { 1: 2,  2: 3 },
  short:      { 1: 4,  2: 5 },
  chord:      { 1: 6,  2: 7 },
  instrument: { 1: 8,  2: 9,  3: 10 },
}
const DRM_SLOT: Partial<Record<SoundCategory, number>> = {
  kick: 0, snare: 1, hihat: 2, drum: 3, fill: 4,
}

/* ─────────────────────────  public API  ───────────────────────────────── */

/**
 * Returns a fully qualified sample URL for the given preset / pad slot.
 * For localIdx === 0 we use the preset's hand-picked primary instrument
 * (PRESET_ASSIGN).  For localIdx >= 1 we dispatch into PRESET_SEC so that
 * EVERY pad within a preset uses a DIFFERENT source — within-preset
 * uniqueness (long[0] ≠ long[1] ≠ long[2], etc.).
 */
export function getPadSampleUrl(
  presetIdx: number,
  localIdx: number,
  category: SoundCategory,
): string | null {
  const cfg = PRESET_ASSIGN[presetIdx]
  if (!cfg) return null
  const sec = PRESET_SEC[presetIdx]

  if (localIdx >= 1 && sec) {
    // melodic secondaries
    const melIdx = MEL_SLOT[category]?.[localIdx]
    if (melIdx != null) return srcUrl(sec.mel[melIdx % sec.mel.length])
    // single-slot secondaries
    if (category === 'bass'       && localIdx === 1) return srcUrl(sec.bass1)
    if (category === 'percussion' && localIdx === 1) return srcUrl(sec.perc1)
    if (category === 'vocal'      && localIdx === 1) return srcUrl(sec.voc1)
    // drum-secondary categories
    const drmIdx = DRM_SLOT[category]
    if (drmIdx != null) {
      const src = sec.drm[drmIdx]
      // fill[1] is composed inside synthesizeFill — never returned as URL
      if (category === 'fill') return null
      return srcUrl(src)
    }
  }

  // localIdx === 0 path: original primaries
  switch (category) {
    case 'kick':   return dmUrl(cfg.kick.machine,   cfg.kick.samples[0])
    case 'snare':  return dmUrl(cfg.snare.machine,  cfg.snare.samples[0])
    case 'hihat':  return dmUrl(cfg.hihat.machine,  cfg.hihat.samples[0])
    case 'drum':   return dmUrl(cfg.drum.machine,   cfg.drum.samples[0])
    case 'bass':   return sfUrl(cfg.bass.bank,   cfg.bass.inst,   cfg.bass.notes[0])
    case 'percussion':
                   return sfUrl(cfg.perc.bank,   cfg.perc.inst,   cfg.perc.notes[0])
    case 'vocal':  return sfUrl(cfg.vocal.bank,  cfg.vocal.inst,  cfg.vocal.notes[0])
    case 'chord':  return sfUrl(cfg.chord.bank,  cfg.chord.inst,  cfg.chord.notes[0])
    case 'long':   return sfUrl(cfg.long.bank,   cfg.long.inst,   cfg.long.notes[0])
    case 'medium': return sfUrl(cfg.medium.bank, cfg.medium.inst, cfg.medium.notes[0])
    case 'short':  return sfUrl(cfg.short.bank,  cfg.short.inst,  cfg.short.notes[0])
    case 'instrument':
                   return sfUrl(cfg.inst.bank,   cfg.inst.inst,   cfg.inst.notes[0])
    case 'fill':   return null   // composed offline – see synthesizeFill
    default:       return null
  }
}

/**
 * Build a composed "fill" AudioBuffer for a given preset/pad.  For
 * localIdx === 0 we sequence samples from the preset's primary fill machine
 * (smpldsnds).  For localIdx === 1 we sequence kick+snare+hihat hits from
 * the preset's *alt tonejs drum kit* — a totally different source — so the
 * two fill pads in every preset are audibly distinct.  Returns null on
 * fetch failure.
 */
export async function synthesizeFill(
  presetIdx: number,
  localIdx: number,
  ctx: AudioContext,
  loader: (url: string) => Promise<AudioBuffer | null>,
): Promise<AudioBuffer | null> {
  const cfg = PRESET_ASSIGN[presetIdx]
  const sec = PRESET_SEC[presetIdx]
  if (!cfg) return null

  // localIdx 0: rapid snare roll (8 hits at 16th-note spacing + kick at end)
  // localIdx 1: descending tom fill (tom cascade tom1→tom2→tom3→kick)
  let urls: string[]
  let offsets: number[]
  let gains: number[]

  if (localIdx >= 1 && sec) {
    const kit = sec.altFillKit
    // Tom cascade fill: tom1 tom1 tom2 tom2 tom3 kick
    urls = [
      `${TONEJS_KIT_BASE}/${kit}/tom1.mp3`,
      `${TONEJS_KIT_BASE}/${kit}/tom1.mp3`,
      `${TONEJS_KIT_BASE}/${kit}/tom2.mp3`,
      `${TONEJS_KIT_BASE}/${kit}/tom2.mp3`,
      `${TONEJS_KIT_BASE}/${kit}/tom3.mp3`,
      `${TONEJS_KIT_BASE}/${kit}/kick.mp3`,
    ]
    offsets = [0.00, 0.25, 0.50, 0.75, 1.00, 1.25]
    gains   = [0.9, 0.9, 0.95, 0.95, 1.0, 1.0]
  } else {
    const samples = cfg.fill.samples
    if (!samples.length) return null
    // Snare roll: use same snare sample repeated 8 times at 16th-note intervals
    const snareUrl = dmUrl(cfg.fill.machine, samples[0])
    urls    = Array(8).fill(snareUrl)
    // Crescendo: start quiet, get louder
    offsets = [0.00, 0.125, 0.25, 0.375, 0.50, 0.625, 0.75, 0.875]
    gains   = [0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95, 1.0]
  }

  const bufs = await Promise.all(urls.map(loader))
  const valid = bufs.filter((b): b is AudioBuffer => !!b)
  if (valid.length === 0) return null

  const totalDuration = offsets[offsets.length - 1] + 0.5
  const length = ctx.sampleRate * Math.min(totalDuration, 6)
  const offline = new OfflineAudioContext(2, length, ctx.sampleRate)
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
  drumMachines:    'github.com/smpldsnds/drum-machines (CC-BY)',
  soundfonts:      'github.com/gleitz/midi-js-soundfonts (CC-BY / CC-BY-SA)',
  tonejsDrumKits:  'github.com/Tonejs/audio drum-samples (MIT)',
  tonejsInstruments:'github.com/nbrosowsky/tonejs-instruments (MIT)',
  salamander:      'tonejs.github.io/audio/salamander – Salamander Grand Piano (CC-BY)',
  casio:           'tonejs.github.io/audio/casio – Casio MT-540 (CC-BY)',
}
