#!/usr/bin/env node
/**
 * scripts/build-daw-presets-v2.mjs  — "wide net" version
 *
 * Uses SHORT 2-word queries so Freesound search finds results reliably.
 * V1 results always take priority: any pad already in .preset-cache.json is skipped.
 * This script writes to .preset-cache-v2.json and merges both into daw-presets.json
 * where V1 overrides V2 for the same pad.
 *
 * Usage:
 *   node scripts/build-daw-presets-v2.mjs
 *   node scripts/build-daw-presets-v2.mjs --preset "Jazz"
 *   node scripts/build-daw-presets-v2.mjs --max-requests 40
 *   node scripts/build-daw-presets-v2.mjs --force   # ignore v2 checkpoint (still respects v1)
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_JSON      = path.join(ROOT, 'public', 'daw-presets.json')
const CHECKPOINT_V1 = path.join(__dirname, '.preset-cache.json')
const CHECKPOINT_V2 = path.join(__dirname, '.preset-cache-v2.json')

const API_TOKEN  = 'd37DSk0vV5S7Cc2DwOaeiuMizrwneXAYz4FBQjqX'
const API_BASE   = 'https://freesound.org/apiv2/search/text/'
const RATE_DELAY = 1500   // 40 req/min — well under the 60/min limit
const MAX_RETRIES = 3

// ─────────────────────────────────────────────────────────────────────────────
// SIMPLIFIED 2-WORD BLUEPRINTS  (broad queries guaranteed to return results)
// Each key has 3 fallback queries — all max 3 words, simple nouns
// ─────────────────────────────────────────────────────────────────────────────
const PRESETS_V2 = {
  'Dubstep Club': {
    long:   ['bass pad', 'dark drone', 'synth atmosphere'],
    medium: ['wobble bass', 'synth loop', 'bass loop'],
    short:  ['glitch fx', 'laser zap', 'synth hit'],
    chord:  ['synth chord', 'bass stab', 'minor chord'],
    inst:   ['wobble synth', 'bass guitar', 'electric bass', 'distorted guitar'],
    snare:  ['electronic snare', 'clap hit'],
    drum:   ['electronic tom', 'rimshot hit'],
    kick:   ['bass kick', 'sub kick'],
    bass:   ['bass drop', 'synth bass'],
    hihat:  ['metal hihat', 'closed hihat'],
    fill:   ['drum fill', 'break roll'],
    perc:   ['metal shaker', 'cowbell hit'],
    vocal:  ['robotic vocal', 'vocal chop'],
  },
  'Trap Soul': {
    long:   ['soul pad', 'dark ambient', 'trap atmosphere'],
    medium: ['trap piano', 'hiphop loop', 'soul loop'],
    short:  ['hihat roll', 'vinyl scratch', 'trap riser'],
    chord:  ['piano chord', 'trap chord', 'soul chord'],
    inst:   ['soul piano', 'trap 808', 'acoustic guitar', 'rhodes piano'],
    snare:  ['trap snare', 'clap snap'],
    drum:   ['trap tom', 'drum hit'],
    kick:   ['808 kick', 'trap kick'],
    bass:   ['808 bass', 'sub bass'],
    hihat:  ['trap hihat', 'closed hihat'],
    fill:   ['drum fill', 'snare roll'],
    perc:   ['shaker loop', 'tambourine'],
    vocal:  ['soul vocal', 'vocal chop'],
  },
  'House Pulse': {
    long:   ['house organ', 'synth pad', 'deep house'],
    medium: ['house piano', 'house loop', 'funky bass'],
    short:  ['filter sweep', 'vinyl crackle', 'synth stab'],
    chord:  ['piano chord', 'organ chord', 'house chord'],
    inst:   ['house piano', 'bass guitar', 'organ stab', 'synth lead'],
    snare:  ['house snare', 'house clap'],
    drum:   ['rimshot hit', 'rim click'],
    kick:   ['house kick', 'bass kick'],
    bass:   ['house bass', 'funky bass'],
    hihat:  ['open hihat', 'closed hihat'],
    fill:   ['drum fill', 'percussion break'],
    perc:   ['conga bongo', 'latin percussion'],
    vocal:  ['house vocal', 'diva vocal'],
  },
  'Lo-Fi Tape': {
    long:   ['vinyl crackle', 'tape hiss', 'lofi ambient'],
    medium: ['lofi piano', 'lofi guitar', 'lofi loop'],
    short:  ['vinyl pop', 'tape crackle', 'record scratch'],
    chord:  ['lofi chord', 'jazz chord', 'mellow chord'],
    inst:   ['lofi piano', 'acoustic guitar', 'vibraphone', 'upright bass'],
    snare:  ['lofi snare', 'brush snare'],
    drum:   ['lofi tom', 'drum machine'],
    kick:   ['lofi kick', 'acoustic kick'],
    bass:   ['upright bass', 'jazz bass'],
    hihat:  ['jazz hihat', 'lofi hihat'],
    fill:   ['brush fill', 'jazz fill'],
    perc:   ['maracas shaker', 'soft tambourine'],
    vocal:  ['lofi vocal', 'jazz vocal'],
  },
  'Techno': {
    long:   ['industrial drone', 'dark pad', 'techno atmosphere'],
    medium: ['acid synth', 'techno loop', 'machine sequence'],
    short:  ['industrial hit', 'laser hit', 'percussion click'],
    chord:  ['acid chord', 'synth stab', 'dark chord'],
    inst:   ['acid bass', 'industrial synth', 'techno lead', 'analog synth'],
    snare:  ['techno snare', 'industrial clap'],
    drum:   ['analog tom', 'industrial drum'],
    kick:   ['techno kick', 'industrial kick'],
    bass:   ['acid bass', 'techno bass'],
    hihat:  ['metal hihat', 'techno hihat'],
    fill:   ['industrial fill', 'techno break'],
    perc:   ['metal cowbell', 'industrial shaker'],
    vocal:  ['robotic voice', 'techno vocal'],
  },
  'Drum&Bass': {
    long:   ['dnb pad', 'jungle atmosphere', 'dark pad'],
    medium: ['amen break', 'reese bass', 'jungle loop'],
    short:  ['amen chop', 'dnb stutter', 'jungle snare'],
    chord:  ['reese bass', 'dark chord', 'synth chord'],
    inst:   ['reese synth', 'saxophone', 'bass guitar', 'synth lead'],
    snare:  ['breakbeat snare', 'amen snare'],
    drum:   ['amen tom', 'jungle tom'],
    kick:   ['dnb kick', 'jungle kick'],
    bass:   ['reese bass', 'sub bass'],
    hihat:  ['jungle hihat', 'breakbeat hihat'],
    fill:   ['amen break', 'drum roll'],
    perc:   ['jungle shaker', 'breakbeat cymbal'],
    vocal:  ['mc vocal', 'jungle vocal'],
  },
  'Ambient': {
    long:   ['ambient drone', 'reverb pad', 'space ambient'],
    medium: ['ambient melody', 'piano ambient', 'nature ambient'],
    short:  ['bell chime', 'water drop', 'wind chime'],
    chord:  ['string pad', 'ambient chord', 'reverb chord'],
    inst:   ['ambient piano', 'glass harmonica', 'celesta bell', 'flute soft'],
    snare:  ['brush snare', 'gentle snare'],
    drum:   ['soft tom', 'frame drum'],
    kick:   ['soft kick', 'gentle drum'],
    bass:   ['bass drone', 'sub bass'],
    hihat:  ['soft cymbal', 'gentle hihat'],
    fill:   ['percussion fill', 'ethereal fill'],
    perc:   ['singing bowl', 'windchime'],
    vocal:  ['choir vocal', 'wordless hum'],
  },
  'Industrial': {
    long:   ['industrial noise', 'metal drone', 'factory ambient'],
    medium: ['industrial loop', 'machine rhythm', 'metal sequence'],
    short:  ['metal clang', 'machine impact', 'industrial fx'],
    chord:  ['industrial chord', 'noise chord', 'metal stab'],
    inst:   ['distorted guitar', 'metal bass', 'industrial synth', 'noise synth'],
    snare:  ['industrial snare', 'metal snare'],
    drum:   ['metal percussion', 'industrial tom'],
    kick:   ['industrial kick', 'metal kick'],
    bass:   ['industrial bass', 'distorted bass'],
    hihat:  ['industrial hihat', 'metal hihat'],
    fill:   ['industrial fill', 'metal break'],
    perc:   ['metal hit', 'anvil strike'],
    vocal:  ['industrial vocal', 'distorted voice'],
  },
  'Latin': {
    long:   ['latin pad', 'salsa atmosphere', 'latin strings'],
    medium: ['salsa piano', 'latin bass', 'clave loop'],
    short:  ['clave hit', 'cowbell hit', 'latin fx'],
    chord:  ['latin piano', 'salsa chord', 'bossa chord'],
    inst:   ['nylon guitar', 'conga drum', 'marimba note', 'bass guitar'],
    snare:  ['latin snare', 'timbale hit'],
    drum:   ['conga hit', 'bongo hit'],
    kick:   ['latin kick', 'bass drum'],
    bass:   ['latin bass', 'bass guitar'],
    hihat:  ['latin hihat', 'cymbal chick'],
    fill:   ['latin fill', 'conga fill'],
    perc:   ['shaker guiro', 'maracas clave'],
    vocal:  ['salsa vocal', 'latin vocal'],
  },
  'Jazz': {
    long:   ['jazz pad', 'swing atmosphere', 'jazz strings'],
    medium: ['jazz piano', 'swing bass', 'jazz loop'],
    short:  ['jazz hit', 'rim shot', 'jazz fx'],
    chord:  ['jazz chord', 'piano voicing', 'minor seventh'],
    inst:   ['jazz piano', 'double bass', 'trumpet jazz', 'saxophone jazz'],
    snare:  ['brush snare', 'jazz snare'],
    drum:   ['jazz tom', 'brush tom'],
    kick:   ['jazz kick', 'bass drum'],
    bass:   ['upright bass', 'walking bass'],
    hihat:  ['jazz hihat', 'swing hihat'],
    fill:   ['jazz fill', 'brush roll'],
    perc:   ['brushed cymbal', 'jazz shaker'],
    vocal:  ['jazz vocal', 'scat vocal'],
  },
  'Funk': {
    long:   ['funk pad', 'soul atmosphere', 'funk strings'],
    medium: ['funk guitar', 'funk bass', 'groove loop'],
    short:  ['funk stab', 'horn hit', 'scratch fx'],
    chord:  ['funk chord', 'brass chord', 'ninth chord'],
    inst:   ['funk guitar', 'bass guitar', 'brass stab', 'hammond organ'],
    snare:  ['funk snare', 'snare crack'],
    drum:   ['funk tom', 'drum roll'],
    kick:   ['funk kick', 'bass kick'],
    bass:   ['funk bass', 'bass slap'],
    hihat:  ['open hihat', 'funk hihat'],
    fill:   ['funk fill', 'drum fill'],
    perc:   ['cowbell funk', 'tambourine hit'],
    vocal:  ['funk vocal', 'soul vocal'],
  },
  'K-Pop': {
    long:   ['kpop pad', 'synth atmosphere', 'pop strings'],
    medium: ['kpop synth', 'pop piano', 'dance loop'],
    short:  ['kpop hit', 'synth riser', 'pop fx'],
    chord:  ['pop chord', 'synth chord', 'piano chord'],
    inst:   ['pop piano', 'synth lead', 'bass guitar', 'electric guitar'],
    snare:  ['snare crack', 'pop clap'],
    drum:   ['drum tom', 'acoustic tom'],
    kick:   ['pop kick', 'bass kick'],
    bass:   ['synth bass', 'bass guitar'],
    hihat:  ['pop hihat', 'closed hihat'],
    fill:   ['drum fill', 'pop fill'],
    perc:   ['tambourine pop', 'shaker pop'],
    vocal:  ['pop vocal', 'kpop vocal'],
  },
  'Phonk': {
    long:   ['phonk pad', 'dark ambient', 'memphis soul'],
    medium: ['phonk loop', 'trap loop', 'dark bass'],
    short:  ['cowbell hit', 'phonk fx', 'vinyl scratch'],
    chord:  ['dark chord', 'minor chord', 'soul chord'],
    inst:   ['808 bass', 'dark guitar', 'slide guitar', 'soul piano'],
    snare:  ['snare clap', 'phonk snare'],
    drum:   ['drum tom', 'acoustic tom'],
    kick:   ['trap kick', '808 kick'],
    bass:   ['808 bass', 'dark bass'],
    hihat:  ['trap hihat', 'phonk hihat'],
    fill:   ['drum fill', 'snare roll'],
    perc:   ['metal cowbell', 'shaker hit'],
    vocal:  ['dark vocal', 'soul vocal'],
  },
  'Hardstyle': {
    long:   ['hardstyle pad', 'euphoric synth', 'dark atmosphere'],
    medium: ['hardstyle loop', 'reverse bass', 'synth loop'],
    short:  ['screeching synth', 'reverse fx', 'laser hit'],
    chord:  ['euphoric chord', 'synth chord', 'power chord'],
    inst:   ['distorted synth', 'lead synth', 'rave synth', 'bass synth'],
    snare:  ['hardstyle snare', 'snare crack'],
    drum:   ['drum tom', 'hard tom'],
    kick:   ['hard kick', 'distorted kick'],
    bass:   ['hardstyle bass', 'reverse bass'],
    hihat:  ['closed hihat', 'metal hihat'],
    fill:   ['drum fill', 'rave fill'],
    perc:   ['industrial shaker', 'metal hit'],
    vocal:  ['rave vocal', 'euphoric vocal'],
  },
  'Cinematic': {
    long:   ['cinematic pad', 'orchestral drone', 'epic strings'],
    medium: ['cinematic piano', 'orchestral loop', 'epic theme'],
    short:  ['timpani hit', 'impact fx', 'cinematic hit'],
    chord:  ['string chord', 'brass chord', 'orchestral chord'],
    inst:   ['piano forte', 'cello note', 'french horn', 'oboe melody'],
    snare:  ['orchestral snare', 'snare roll'],
    drum:   ['orchestral tom', 'taiko drum'],
    kick:   ['orchestral kick', 'taiko hit'],
    bass:   ['cello bass', 'orchestral bass'],
    hihat:  ['cymbal wash', 'orchestral cymbal'],
    fill:   ['orchestral fill', 'timpani roll'],
    perc:   ['taiko roll', 'cymbal swell'],
    vocal:  ['choir alto', 'epic chorus'],
  },
  '432Hz Heal': {
    long:   ['healing drone', 'crystal bowl', 'solfeggio tone'],
    medium: ['meditation loop', 'healing piano', 'binaural loop'],
    short:  ['bell ring', 'chime strike', 'bowl strike'],
    chord:  ['healing chord', 'crystal chord', 'harmonic pad'],
    inst:   ['crystal singing bowl', 'sitar note', 'kalimba note', 'hang drum'],
    snare:  ['soft drum', 'gentle snare'],
    drum:   ['frame drum', 'soft tom'],
    kick:   ['soft kick', 'bass drum'],
    bass:   ['bass drone', 'deep bass'],
    hihat:  ['gentle cymbal', 'soft hihat'],
    fill:   ['gentle fill', 'soft roll'],
    perc:   ['singing bowl', 'meditation bell'],
    vocal:  ['healing vocal', 'chant om'],
  },
  'SoundFX Goofy': {
    long:   ['cartoon ambience', 'silly sound', 'funny audio'],
    medium: ['cartoon loop', 'game audio', 'funny loop'],
    short:  ['boing spring', 'cartoon hit', 'whistle tweet'],
    chord:  ['cartoon chord', 'silly chord', 'funny stab'],
    inst:   ['kazoo note', 'toy piano', 'slide whistle', 'xylophone child'],
    snare:  ['cartoon snare', 'funny snare'],
    drum:   ['cartoon tom', 'rubber drum'],
    kick:   ['cartoon kick', 'funny kick'],
    bass:   ['tuba note', 'silly bass'],
    hihat:  ['cartoon hihat', 'silly cymbal'],
    fill:   ['cartoon fill', 'funny roll'],
    perc:   ['boing hit', 'cartoon cowbell'],
    vocal:  ['funny voice', 'cartoon vocal'],
  },
  '1930s Vintage': {
    long:   ['vintage pad', '1930s atmosphere', 'jazz lounge'],
    medium: ['vintage piano', 'swing jazz', 'lounge loop'],
    short:  ['vinyl crackle', 'radio static', 'vintage hit'],
    chord:  ['vintage chord', 'swing chord', 'piano voicing'],
    inst:   ['upright piano', 'vintage trumpet', 'clarinet vintage', 'banjo strum'],
    snare:  ['jazz snare', 'brush snare'],
    drum:   ['drum kit vintage', 'jazz tom'],
    kick:   ['vintage kick', 'jazz kick'],
    bass:   ['upright bass', 'tuba bass'],
    hihat:  ['vintage hihat', 'jazz cymbal'],
    fill:   ['jazz fill', 'vintage roll'],
    perc:   ['woodblock hit', 'jazz shaker'],
    vocal:  ['1930s vocal', 'crooner voice'],
  },
  'Nature Sounds': {
    long:   ['rain ambient', 'forest ambience', 'ocean waves'],
    medium: ['bird loop', 'water stream', 'nature loop'],
    short:  ['bird chirp', 'water drop', 'leaf rustle'],
    chord:  ['nature chord', 'wind pad', 'forest chord'],
    inst:   ['wooden flute', 'pan flute', 'didgeridoo note', 'native drum'],
    snare:  ['wood snare', 'natural snare'],
    drum:   ['log drum', 'drum nature'],
    kick:   ['bass drum', 'thunder hit'],
    bass:   ['nature bass', 'deep wind'],
    hihat:  ['cymbal wash', 'rain cymbal'],
    fill:   ['nature fill', 'drum roll'],
    perc:   ['rain stick', 'ocean drum'],
    vocal:  ['nature vocal', 'tribal chant'],
  },
  'Chiptune 8-bit': {
    long:   ['chiptune drone', '8bit pad', 'gameboy music'],
    medium: ['chiptune loop', '8bit melody', 'nes music'],
    short:  ['8bit hit', 'blip sound', 'chiptune fx'],
    chord:  ['8bit chord', 'chiptune chord', 'square chord'],
    inst:   ['gameboy melody', 'nes bass', 'chiptune lead', '8bit arpegio'],
    snare:  ['8bit snare', 'digital snare'],
    drum:   ['8bit tom', 'digital drum'],
    kick:   ['8bit kick', 'digital kick'],
    bass:   ['8bit bass', 'square bass'],
    hihat:  ['digital hihat', '8bit hihat'],
    fill:   ['8bit fill', 'digital roll'],
    perc:   ['8bit cowbell', 'digital shaker'],
    vocal:  ['8bit vocal', 'robot voice'],
  },
  'Vaporwave': {
    long:   ['vaporwave pad', 'lo-fi ambience', 'retro synth'],
    medium: ['vaporwave loop', 'slowed piano', 'chill loop'],
    short:  ['vhs glitch', 'retro hit', 'tape noise'],
    chord:  ['smooth chord', 'vaporwave chord', 'jazz chord'],
    inst:   ['electric piano', 'smooth saxophone', 'synth bass', 'neon guitar'],
    snare:  ['lofi snare', 'brush snare'],
    drum:   ['lofi drum', 'vintage tom'],
    kick:   ['lofi kick', 'slow kick'],
    bass:   ['smooth bass', 'vaporwave bass'],
    hihat:  ['lofi hihat', 'soft hihat'],
    fill:   ['lofi fill', 'smooth roll'],
    perc:   ['vintage shaker', 'lofi tambourine'],
    vocal:  ['vaporwave vocal', 'smooth vocal'],
  },
  'Tribal Drums': {
    long:   ['tribal drone', 'jungle ambience', 'ethnic pad'],
    medium: ['tribal rhythm', 'djembe loop', 'drum circle'],
    short:  ['djembe hit', 'tribal hit', 'wood block'],
    chord:  ['tribal chord', 'ethnic chord', 'drum chord'],
    inst:   ['djembe pattern', 'kalimba note', 'didgeridoo', 'steel drum'],
    snare:  ['frame drum', 'tribal snare'],
    drum:   ['djembe low', 'drum circle'],
    kick:   ['bass drum', 'tribal kick'],
    bass:   ['bass drone', 'tribal bass'],
    hihat:  ['tribal cymbal', 'metal ring'],
    fill:   ['tribal fill', 'drum roll'],
    perc:   ['shaker wood', 'rattle hit'],
    vocal:  ['tribal chant', 'tribal vocal'],
  },
  'Bossa Nova': {
    long:   ['bossa pad', 'samba atmosphere', 'brazil strings'],
    medium: ['bossa guitar', 'bossa piano', 'samba loop'],
    short:  ['bossa hit', 'clave hit', 'bossa fx'],
    chord:  ['bossa chord', 'jazz chord', 'nylon chord'],
    inst:   ['nylon guitar', 'piano jazz', 'upright bass', 'flute bossa'],
    snare:  ['bossa snare', 'rim hit'],
    drum:   ['surdo hit', 'bossa tom'],
    kick:   ['bass drum', 'bossa kick'],
    bass:   ['bass guitar', 'upright bass'],
    hihat:  ['jazz hihat', 'bossa cymbal'],
    fill:   ['bossa fill', 'samba fill'],
    perc:   ['tamborim agogo', 'pandeiro shaker'],
    vocal:  ['bossa vocal', 'samba vocal'],
  },
  'Synthwave 80s': {
    long:   ['synthwave pad', '80s synth', 'retrowave drone'],
    medium: ['synth arp', '80s loop', 'retrowave loop'],
    short:  ['80s hit', 'synth blip', 'retro fx'],
    chord:  ['synth chord', '80s chord', 'analog chord'],
    inst:   ['synth lead', 'bass synth', 'electric guitar', 'synth brass'],
    snare:  ['gated snare', 'drum machine snare'],
    drum:   ['drum machine tom', '80s tom'],
    kick:   ['drum machine kick', '80s kick'],
    bass:   ['synth bass', 'analog bass'],
    hihat:  ['drum machine hihat', '80s hihat'],
    fill:   ['80s fill', 'synth roll'],
    perc:   ['cowbell 80s', 'drum machine perc'],
    vocal:  ['80s vocal', 'synth vocal'],
  },
  'Grime UK': {
    long:   ['grime pad', 'uk bass', 'dark atmosphere'],
    medium: ['grime beat', 'uk melody', 'grime loop'],
    short:  ['grime hit', 'stab short', 'uk fx'],
    chord:  ['grime chord', 'dark stab', 'minor chord'],
    inst:   ['piano grime', 'bass synth', 'dark guitar', 'grime synth'],
    snare:  ['grime snare', 'snare hit'],
    drum:   ['drum hit', 'grime tom'],
    kick:   ['grime kick', 'bass kick'],
    bass:   ['bass synth', 'grime bass'],
    hihat:  ['closed hihat', 'grime hihat'],
    fill:   ['grime fill', 'drum break'],
    perc:   ['shaker grime', 'metal click'],
    vocal:  ['grime vocal', 'uk mc'],
  },
  'Reggaeton': {
    long:   ['reggaeton pad', 'latin synth', 'dembow atmosphere'],
    medium: ['dembow beat', 'reggaeton loop', 'latin bass'],
    short:  ['dembow hit', 'latin fx', 'perc hit'],
    chord:  ['latin chord', 'synth chord', 'reggaeton chord'],
    inst:   ['reggaeton guitar', 'bass synth', 'piano latin', 'brass stab'],
    snare:  ['dembow snare', 'clap hit'],
    drum:   ['drum hit', 'latin tom'],
    kick:   ['bass kick', 'latin kick'],
    bass:   ['synth bass', 'latin bass'],
    hihat:  ['closed hihat', 'latin hihat'],
    fill:   ['latin fill', 'percussion break'],
    perc:   ['conga loop', 'cowbell latin'],
    vocal:  ['reggaeton vocal', 'latin vocal'],
  },
  'Math Rock': {
    long:   ['math rock pad', 'ambient guitar', 'complex drone'],
    medium: ['guitar loop', 'odd meter', 'math rock'],
    short:  ['guitar hit', 'string hit', 'pluck fx'],
    chord:  ['guitar chord', 'complex chord', 'jazz chord'],
    inst:   ['electric guitar', 'bass guitar', 'vibraphone', 'piano math'],
    snare:  ['acoustic snare', 'snare hit'],
    drum:   ['acoustic tom', 'drum hit'],
    kick:   ['acoustic kick', 'bass drum'],
    bass:   ['bass guitar', 'electric bass'],
    hihat:  ['open hihat', 'cymbal hit'],
    fill:   ['drum fill', 'roll break'],
    perc:   ['xylophone hit', 'vibraphone hit'],
    vocal:  ['indie vocal', 'rock vocal'],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// SLOT MAP — same as v1 (mirrored from nearfinaldaw.tsx SOUND_BANK pad layout)
// ─────────────────────────────────────────────────────────────────────────────
const SLOT_MAP = [
  { key: 'long',   cat: 'long',   dur: 'duration:[4.0 TO *]',     padIds: [0,1,2,3] },
  { key: 'medium', cat: 'medium', dur: 'duration:[1.5 TO 4.0]',   padIds: [4,5,6,7] },
  { key: 'short',  cat: 'short',  dur: 'duration:[0.05 TO 1.5]',  padIds: [8,9,10,11] },
  { key: 'chord',  cat: 'chord',  dur: 'duration:[0.3 TO 8.0]',   padIds: [12,13,14,15] },
  { key: 'inst',   cat: 'inst',   dur: 'duration:[0.1 TO 6.0]',   padIds: [16,17,18,19] },
  { key: 'snare',  cat: 'snare',  dur: 'duration:[0.05 TO 1.5]',  padIds: [20,21] },
  { key: 'drum',   cat: 'drum',   dur: 'duration:[0.05 TO 1.5]',  padIds: [22,23] },
  { key: 'kick',   cat: 'kick',   dur: 'duration:[0.05 TO 1.2]',  padIds: [24,25] },
  { key: 'bass',   cat: 'bass',   dur: 'duration:[0.1 TO 8.0]',   padIds: [26,27] },
  { key: 'hihat',  cat: 'hihat',  dur: 'duration:[0.02 TO 0.8]',  padIds: [28,29] },
  { key: 'fill',   cat: 'fill',   dur: 'duration:[0.5 TO 4.0]',   padIds: [30] },
  { key: 'perc',   cat: 'perc',   dur: 'duration:[0.1 TO 3.0]',   padIds: [31] },
]

// If a preset doesn't have 'vocal' slot it won't fill those — but we only score, not required
// Note: v1 has 32 pads (0-31); SLOT_MAP pads above cover 0-31.

// ─────────────────────────────────────────────────────────────────────────────
// SCORING
// ─────────────────────────────────────────────────────────────────────────────
function scoreSound(sound, category) {
  let score = 0
  const text = `${sound.name || ''} ${(sound.tags || []).join(' ')}`.toLowerCase()
  const CAT_KEYWORDS = {
    kick:   ['kick', 'bass drum', 'bd'],
    snare:  ['snare', 'snr', 'rimshot', 'clap'],
    hihat:  ['hihat', 'hi-hat', 'hh', 'cymbal', 'hat'],
    bass:   ['bass', '808'],
    drum:   ['tom', 'drum', 'rimshot'],
    fill:   ['fill', 'break', 'roll', 'ensemble'],
    perc:   ['perc', 'shaker', 'cowbell', 'conga', 'bongo', 'cajon', 'xylophone', 'marimba'],
    chord:  ['chord', 'harmony', 'stab', 'pad', 'major', 'minor'],
    inst:   ['instrument', 'lead', 'melody', 'riff', 'guitar', 'piano', 'synth', 'organ'],
    long:   ['pad', 'drone', 'ambient', 'atmosphere', 'texture', 'sustain'],
    medium: ['loop', 'melody', 'riff', 'groove'],
    short:  ['fx', 'hit', 'one-shot', 'effect', 'zap', 'blip'],
    vocal:  ['vocal', 'voice', 'chant', 'choir', 'sing'],
  }
  const keywords = CAT_KEYWORDS[category] || []
  for (const kw of keywords) if (text.includes(kw)) score += 25
  score += Math.min(30, (sound.num_downloads || 0) / 200)
  score += ((sound.avg_rating || 0) / 5) * 15
  return score
}

// ─────────────────────────────────────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function freesoundSearch(query, durFilter, { pageSize = 15, page = 1, sort = 'downloads_desc' } = {}) {
  const url = new URL(API_BASE)
  url.searchParams.set('query', query)
  url.searchParams.set('filter', durFilter)
  url.searchParams.set('page_size', String(pageSize))
  url.searchParams.set('page', String(page))
  url.searchParams.set('sort', sort)
  url.searchParams.set('fields', 'id,name,duration,tags,previews,avg_rating,num_downloads')
  url.searchParams.set('token', API_TOKEN)
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const r = await fetch(url.toString())
      if (r.status === 429 || r.status === 503) {
        const wait = (attempt + 1) * 10000
        console.warn(`\n  [rate-limit ${r.status}] waiting ${wait / 1000}s…`)
        await sleep(wait)
        continue
      }
      if (!r.ok) { console.warn(`  [API ${r.status}] "${query}"`); return [] }
      const d = await r.json()
      return d.results || []
    } catch (e) { console.warn(`  [net err] "${query}":`, e.message); return [] }
  }
  return []
}

async function pickBestSound(queries, durFilter, category, { globalUsed, offset = 0 }) {
  let allCandidates = []
  for (const q of queries) {
    const results = await freesoundSearch(q, durFilter, { page: 1, sort: 'downloads_desc' })
    await sleep(RATE_DELAY)
    allCandidates.push(...results)
    if (allCandidates.length >= 30) break
  }
  // Deduplicate + require preview
  const seen = new Set()
  allCandidates = allCandidates.filter(s => {
    if (seen.has(s.id)) return false
    seen.add(s.id)
    return !!s.previews?.['preview-hq-mp3']
  })
  const scored = allCandidates.map(s => ({ ...s, _s: scoreSound(s, category) })).sort((a, b) => b._s - a._s)
  const startIdx = offset % Math.max(1, scored.length)
  for (let t = 0; t < scored.length; t++) {
    const s = scored[(startIdx + t) % scored.length]
    if (!globalUsed.has(s.id)) {
      globalUsed.add(s.id)
      return { id: s.id, name: s.name, previewUrl: s.previews['preview-hq-mp3'], duration: s.duration, score: s._s, category }
    }
  }
  if (scored.length > 0) {
    const s = scored[0]
    return { id: s.id, name: s.name, previewUrl: s.previews['preview-hq-mp3'], duration: s.duration, score: s._s, category }
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECKPOINT I/O
// ─────────────────────────────────────────────────────────────────────────────
function loadCheckpoint(file) {
  try { if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8')) } catch {}
  return {}
}
function saveCheckpoint(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const singlePreset  = args.includes('--preset') ? args[args.indexOf('--preset') + 1] : null
const force         = args.includes('--force')
const maxRequestsArg = args.includes('--max-requests') ? parseInt(args[args.indexOf('--max-requests') + 1], 10) : Infinity

const checkpointV1 = loadCheckpoint(CHECKPOINT_V1)     // read-only reference
const checkpointV2 = force ? {} : loadCheckpoint(CHECKPOINT_V2)  // our mutable store

const presetNames = singlePreset ? [singlePreset] : Object.keys(PRESETS_V2)
let totalDone = 0, totalSkipped = 0, totalFailed = 0, requestCount = 0

for (const presetName of presetNames) {
  const bp = PRESETS_V2[presetName]
  if (!bp) { console.error(`Unknown preset: "${presetName}"`); continue }

  console.log(`\n═══ [V2] ${presetName} ═══`)
  if (!checkpointV2[presetName]) checkpointV2[presetName] = {}
  const v1Preset  = checkpointV1[presetName] || {}

  const globalUsed = new Set([
    ...Object.values(checkpointV2[presetName]).map(p => p?.id).filter(Boolean),
    ...Object.values(v1Preset).map(p => p?.id).filter(Boolean),
  ])

  for (const slot of SLOT_MAP) {
    const queries = bp[slot.key] || []
    if (queries.length === 0) continue

    for (let i = 0; i < slot.padIds.length; i++) {
      if (requestCount >= maxRequestsArg) {
        console.log('  [max requests reached — stopping pass]')
        break
      }

      const padIdx = slot.padIds[i]
      const ckKey  = `pad_${padIdx}`

      // V1 has this pad → skip entirely (V1 takes priority)
      if (v1Preset[ckKey]) {
        console.log(`  ✓ pad ${padIdx} (${slot.cat}) [V1 owns: "${v1Preset[ckKey].name}"]`)
        totalSkipped++
        continue
      }

      // V2 already cached this pad
      if (checkpointV2[presetName][ckKey] && !force) {
        console.log(`  ✓ pad ${padIdx} (${slot.cat}) [V2 cached: "${checkpointV2[presetName][ckKey].name}"]`)
        globalUsed.add(checkpointV2[presetName][ckKey].id)
        totalDone++
        continue
      }

      // Rotate through queries for variety
      const rotatedQueries = [queries[i % queries.length], ...queries.filter((_, qi) => qi !== i % queries.length)]
      process.stdout.write(`  → pad ${padIdx} (${slot.cat}): "${rotatedQueries[0]}" … `)

      const sound = await pickBestSound(rotatedQueries, slot.dur, slot.cat, { globalUsed, offset: i * 3 })
      requestCount++

      if (sound) {
        console.log(`✔ [${sound.id}] "${sound.name}" ${sound.duration?.toFixed(2)}s`)
        checkpointV2[presetName][ckKey] = sound
        saveCheckpoint(CHECKPOINT_V2, checkpointV2)
        totalDone++
      } else {
        console.log('✗ NO RESULT')
        totalFailed++
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Merge V1 + V2 → daw-presets.json  (V1 always wins)
// ─────────────────────────────────────────────────────────────────────────────
const allPresetNames = [...new Set([...Object.keys(checkpointV1), ...Object.keys(checkpointV2)])]

const output = {
  version: 4,
  generated: new Date().toISOString(),
  note: 'Merged V1 (niche) + V2 (wide) Freesound curation. V1 takes priority.',
  presets: {},
}

for (const presetName of allPresetNames) {
  const pV1 = checkpointV1[presetName] || {}
  const pV2 = checkpointV2[presetName] || {}
  output.presets[presetName] = []

  for (const slot of SLOT_MAP) {
    for (let i = 0; i < slot.padIds.length; i++) {
      const padIdx = slot.padIds[i]
      const ckKey  = `pad_${padIdx}`
      const entry  = pV1[ckKey] || pV2[ckKey]   // V1 wins
      if (entry) {
        output.presets[presetName].push({
          padIdx,
          id: entry.id,
          name: entry.name,
          previewUrl: entry.previewUrl,
          duration: entry.duration,
          category: slot.cat,
          score: entry.score ?? 0,
          source: pV1[ckKey] ? 'v1' : 'v2',
        })
      }
    }
  }
}

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true })
fs.writeFileSync(OUT_JSON, JSON.stringify(output, null, 2))
console.log(`\n✅  Written → ${OUT_JSON}`)
console.log(`   Done: ${totalDone}  Skipped(V1 owned): ${totalSkipped}  Failed: ${totalFailed}`)
