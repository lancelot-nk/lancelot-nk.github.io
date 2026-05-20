import React, { useCallback, useEffect, useState, useRef } from 'react'
import { catalogSynth } from './dawSoundCatalog'
import { getPadSampleUrl, synthesizeFill } from './dawSampleLibrary'
import {
  Play,
  Pause,
  Circle,
  Square,
  Trash2,
  Save,
  Download,
  Volume2,
  Settings2,
  Dna,
  CloudRain,
  Shuffle,
  ChevronRight,
  Plus,
  SlidersHorizontal,
  Scissors,
  Copy,
  X,
  Upload,
  Undo2,
  Redo2,
  ClipboardPaste,
  Mic,
  Sparkles,
  Camera,
  Zap,
  Filter as FilterIcon,
  Music2,
  Wand2,
  Star,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
// --- TYPES & CONSTANTS ---
type StepData = {
  velocity: number
  length: number
  probability?: number
}
type Sequence = StepData[]
type SequencerData = Record<string, Sequence>
type Variation = {
  id: string
  name: string
  bpm: number
  timeSig: string
  halfMode: boolean
  data: SequencerData
}
type Clip = {
  id: string
  variationId: string
  trackIdx: number
  startBeat: number
  lengthBeats: number
}
type PadSettings = {
  volume: number
  pan: number
  pitch: number
  octave: number
  detune: number
  // When true the browser time-stretches the sample to keep the original pitch
  // when playbackRate ≠ 1.0 (standard DAW "stretch" behaviour). When false,
  // pitch shifts along with playback speed (classic tape/vinyl pitch behaviour).
  preservesPitch: boolean
  adsr: {
    a: number
    d: number
    s: number
    r: number
  }
  fx: string[]
  advanced?: AdvancedSynthSettings
}
type Recording = {
  id: string
  url: string
  name: string
  duration: number
}
type SoundCategory =
  | 'long'
  | 'medium'
  | 'short'
  | 'chord'
  | 'snare'
  | 'drum'
  | 'kick'
  | 'bass'
  | 'hihat'
  | 'fill'
  | 'percussion'
  | 'vocal'
  | 'instrument'
type SoundDef = {
  id: string
  label: string
  category: SoundCategory
  color: string
  stretchable?: boolean
}
const CATEGORY_COLORS: Record<SoundCategory, string> = {
  long: 'bg-amber-500',
  medium: 'bg-orange-500',
  short: 'bg-orange-400',
  chord: 'bg-purple-500',
  snare: 'bg-pink-500',
  drum: 'bg-red-500',
  kick: 'bg-red-700',
  bass: 'bg-blue-600',
  hihat: 'bg-cyan-400',
  fill: 'bg-orange-600',
  percussion: 'bg-lime-500',
  vocal: 'bg-yellow-400',
  instrument: 'bg-green-500',
}
const PRESETS = [
  'Dubstep Club',
  'Trap Soul',
  'House Pulse',
  'Lo-Fi Tape',
  'Techno',
  'Drum&Bass',
  'Ambient',
  'Industrial',
  'Latin',
  'Jazz',
  'Funk',
  'K-Pop',
  'Phonk',
  'Hardstyle',
  'Cinematic',
  '432Hz Heal',
  'SoundFX Goofy',
  '1930s Vintage',
  'Nature Sounds',
  'Chiptune 8-bit',
  'Vaporwave',
  'Tribal Drums',
  'Bossa Nova',
  'Synthwave 80s',
  'Grime UK',
  'Reggaeton',
  'Math Rock',
] as const
type PresetName = (typeof PRESETS)[number]
const TIME_SIGNATURES = ['4/4', '3/4', '5/4'] as const
type TimeSignature = (typeof TIME_SIGNATURES)[number]
const FX_TYPES = ['Reverb', 'Delay', 'Distortion', 'Filter', 'Flanger', 'Phaser', 'Echo', 'Chorus', 'Bitcrush', 'Tremolo'] as const

// === FREESOUND API CONFIGURATION ===
const FREESOUND_API_TOKEN = 'd37DSk0vV5S7Cc2DwOaeiuMizrwneXAYz4FBQjqX'
const FREESOUND_API_BASE = 'https://freesound.org/apiv2/search/text/'
const CACHE_NAME = 'sequencer-preset-cache-v4'
const MANIFEST_PREFIX = 'preset-meta-v3-'

// ============================================================
// COMPREHENSIVE PER-PRESET SOUND BLUEPRINT
// Every preset gets 32 fully explicit query strings.
// No templating — each query is hand-crafted so every
// preset pulls DIFFERENT SOURCE SOUNDS from Freesound.
// pageOffset: which Freesound result page to use (0-4)
// resultOffset: which index to pick first from results
// ============================================================
type FullPresetBlueprint = {
  pageOffset: number
  resultOffset: number
  long:   readonly [string, string, string]
  medium: readonly [string, string, string]
  short:  readonly [string, string, string]
  chord:  readonly [string, string, string]
  inst:   readonly [string, string, string, string]
  snare:  readonly [string, string]
  drum:   readonly [string, string]
  kick:   readonly [string, string]
  bass:   readonly [string, string]
  hihat:  readonly [string, string]
  fill:   readonly [string, string]
  perc:   readonly [string, string]
  vocal:  readonly [string, string]
}

const FULL_PRESET_BLUEPRINTS: Record<PresetName, FullPresetBlueprint> = {
  'Dubstep Club': {
    pageOffset: 0, resultOffset: 0,
    long:   ['heavy bass synth pad sustain', 'dubstep wobble bass drone', 'dark electronic atmosphere'],
    medium: ['dubstep bass wobble loop', 'electronic synth arp loop', 'dark underground beat loop'],
    short:  ['glitch stutter electronic fx', 'synth laser zap hit', 'rise sweep synth fx'],
    chord:  ['dark minor synth chord electronic', 'sub bass chord stab electronic', 'distorted synth chord hit'],
    inst:   ['wobble bass synth hit', 'electric bass guitar hit heavy', 'synth pluck electronic note', 'distorted guitar hit electric'],
    snare:  ['electronic snare crack hit tight', 'clap hit electronic sharp'],
    drum:   ['electronic tom hit low', 'rimshot electronic hit'],
    kick:   ['sub bass heavy kick drum', 'electronic bass kick drum hit'],
    bass:   ['bass drop synth hit', 'wobble bass loop synth'],
    hihat:  ['closed hihat electronic tight crisp', 'hihat click metallic tight'],
    fill:   ['breakbeat drum fill electronic', 'drum roll electronic break'],
    perc:   ['industrial shaker loop electronic', 'electronic cowbell percussion loop'],
    vocal:  ['robotic vocal chop effect', 'electronic vocal sample phrase'],
  },
  'Trap Soul': {
    pageOffset: 1, resultOffset: 1,
    long:   ['soul r&b pad atmospheric warm', 'dark hiphop ambient texture', 'trap soul synth sustain'],
    medium: ['trap hiphop melody loop', 'soul piano melody riff loop', 'dark trap beat loop'],
    short:  ['trap hi hat roll short', 'vinyl record scratch fx', 'trap zing riser fx'],
    chord:  ['soul piano chord minor warm', 'dark r&b chord progression', 'trap synth chord stab'],
    inst:   ['soul piano riff warm', 'trap 808 bass hit sub', 'acoustic guitar soul warm', 'rhodes electric piano soul'],
    snare:  ['trap snare crack hit dry', 'hiphop clap hit sharp'],
    drum:   ['trap tom rimshot hit', 'acoustic tom hit hip hop'],
    kick:   ['808 trap kick thump sub', 'deep bass kick trap hit'],
    bass:   ['808 bass trap sub hit', 'sub bass hiphop note deep'],
    hihat:  ['trap closed hihat tight hit', 'hip hop hi-hat click sharp'],
    fill:   ['trap drum fill roll break', 'hiphop snare roll fill'],
    perc:   ['hiphop shaker loop rhythm', 'trap tambourine loop rhythm'],
    vocal:  ['soul female vocal phrase warm', 'trap vocal chop sample'],
  },
  'House Pulse': {
    pageOffset: 2, resultOffset: 2,
    long:   ['deep house organ sustain chord', 'house music synth pad warm', 'chicago house atmosphere pad'],
    medium: ['house groove piano loop', 'funky house bass loop', 'house music chord loop'],
    short:  ['house music filter sweep fx', 'vinyl crackle pop fx house', 'house synth stab fx'],
    chord:  ['house piano chord major bright', 'organ chord stab house', 'synth chord bright house'],
    inst:   ['house piano chord stab hit', 'funky bass guitar note pluck', 'organ stab house hit', 'synth lead bright house'],
    snare:  ['house snare clap reverb hit', 'house clap hit sharp'],
    drum:   ['rimshot hit house music', 'rim click percussion house'],
    kick:   ['four four kick drum house', 'deep house kick thump hit'],
    bass:   ['house bass guitar riff note', 'deep house bass synth hit'],
    hihat:  ['open hihat cymbal house', 'closed hihat tight house hit'],
    fill:   ['house drum fill transition', 'percussion break house music'],
    perc:   ['conga bongo loop house', 'latin percussion house loop'],
    vocal:  ['house diva vocal sample phrase', 'house music vocal loop'],
  },
  'Lo-Fi Tape': {
    pageOffset: 3, resultOffset: 0,
    long:   ['lofi vinyl crackle ambient warm', 'tape hiss texture nostalgic', 'vintage vinyl atmosphere warm'],
    medium: ['lofi hip hop piano melody loop', 'lofi guitar loop chill', 'lo-fi beat loop warm'],
    short:  ['vinyl record pop click fx', 'tape crackle noise fx', 'vinyl scratch short fx'],
    chord:  ['lofi piano chord jazz warm', 'jazz guitar chord mellow', 'lofi synth chord warm vintage'],
    inst:   ['lofi piano melody warm note', 'acoustic guitar fingerpick gentle', 'vibraphone jazz mellow note', 'upright bass jazz pluck'],
    snare:  ['lofi snare drum dusty hit', 'acoustic snare dry hit soft'],
    drum:   ['lofi tom hit vintage warm', 'vintage drum machine hit soft'],
    kick:   ['lofi kick drum soft hit', 'acoustic kick drum dry hit'],
    bass:   ['upright bass jazz pizzicato note', 'lofi bass guitar warm note'],
    hihat:  ['jazz hihat closed tight chick', 'lofi hihat dusty hit'],
    fill:   ['jazz brush drum fill', 'lofi drum break vinyl fill'],
    perc:   ['maracas shaker lofi loop', 'tambourine lofi loop soft'],
    vocal:  ['lofi vocal hum phrase', 'vintage vocal jazz sample'],
  },
  'Techno': {
    pageOffset: 4, resultOffset: 1,
    long:   ['techno industrial drone dark', 'warehouse techno atmosphere', 'dark techno synth pad minimal'],
    medium: ['techno machine sequence loop', 'acid techno synth loop', 'dark techno arp loop minimal'],
    short:  ['industrial machine fx hit', 'techno laser zap electronic', 'techno percussion click hit'],
    chord:  ['techno dark acid chord stab', 'minimal synth chord techno', 'industrial synth chord hit'],
    inst:   ['acid bass line synth hit', 'industrial distorted synth hit', 'techno lead synth stab', 'analog synth note techno'],
    snare:  ['techno electronic snare hit', 'industrial clap electronic hit'],
    drum:   ['techno analog tom hit', 'industrial percussion hit machine'],
    kick:   ['techno kick punch hard hit', 'industrial bass kick drum hit'],
    bass:   ['acid bass synth techno hit', 'techno bass loop minimal'],
    hihat:  ['techno closed hihat metallic', 'industrial hihat tight hit'],
    fill:   ['techno drum fill industrial', 'techno break percussion hit'],
    perc:   ['industrial cowbell click loop', 'techno metal shaker loop'],
    vocal:  ['robotic voice sample techno', 'techno vocal loop effect'],
  },
  'Drum&Bass': {
    pageOffset: 0, resultOffset: 2,
    long:   ['dnb dark pad sustain long', 'jungle atmosphere texture dark', 'drum bass synth atmosphere'],
    medium: ['jungle amen break loop', 'reese bass loop dnb', 'drum and bass melody riff loop'],
    short:  ['amen chop short hit', 'dnb stutter glitch fx', 'jungle snare hit short'],
    chord:  ['reese bass chord dark dnb', 'drum bass synth chord minor', 'jungle dark chord stab hit'],
    inst:   ['reese bass synth hit dnb', 'saxophone jazz sample note', 'dnb synth lead stab', 'electric bass guitar hit dnb'],
    snare:  ['breakbeat amen snare hit', 'jungle snare acoustic crack hit'],
    drum:   ['amen break tom drum hit', 'jungle tom percussion hit'],
    kick:   ['dnb kick drum heavy hit', 'jungle bass kick drum hit'],
    bass:   ['reese bass synth note deep', 'dnb bass hit heavy sub'],
    hihat:  ['jungle hihat closed tight hit', 'breakbeat hihat hit short'],
    fill:   ['amen break drum fill roll', 'jungle breakbeat fill loop'],
    perc:   ['jungle shaker percussion loop', 'breakbeat cymbal loop rhythm'],
    vocal:  ['jungle mc vocal chant', 'drum bass vocal sample phrase'],
  },
  'Ambient': {
    pageOffset: 1, resultOffset: 0,
    long:   ['ambient drone texture evolving', 'atmospheric reverb pad sustain', 'space ambient soundscape'],
    medium: ['ambient evolving melody loop', 'gentle piano ambient loop', 'nature ambient loop calm'],
    short:  ['ambient bell chime single hit', 'water drop ambient fx', 'wind chime gentle hit'],
    chord:  ['ambient string pad chord', 'ambient synth evolving chord', 'spacious reverb chord pad'],
    inst:   ['ambient piano gentle note', 'glass harmonica note ambient', 'celesta bell note gentle', 'flute soft note ambient'],
    snare:  ['soft brush snare ambient hit', 'gentle snare reverb hit'],
    drum:   ['soft tom ambient hit gentle', 'frame drum gentle hit'],
    kick:   ['soft kick thump ambient hit', 'gentle bass drum hit soft'],
    bass:   ['ambient bass drone note long', 'sub bass ambient note'],
    hihat:  ['soft cymbal wash ambient hit', 'gentle hihat ambient'],
    fill:   ['ambient percussion fill gentle', 'ethereal drum fill soft'],
    perc:   ['tibetan singing bowl hit', 'windchime ambient loop'],
    vocal:  ['ambient choir vocal pad', 'wordless vocal hum ambient'],
  },
  'Industrial': {
    pageOffset: 2, resultOffset: 1,
    long:   ['industrial noise metal texture long', 'harsh feedback drone industrial', 'factory machine ambient recording'],
    medium: ['industrial metal rhythm loop', 'harsh noise loop industrial', 'metal machine sound loop'],
    short:  ['metal clang hit industrial', 'industrial burst noise fx', 'chain rattle metal impact'],
    chord:  ['distorted power chord guitar hit', 'industrial synth chord harsh hit', 'metal bass chord distorted hit'],
    inst:   ['distorted electric guitar riff hit', 'industrial harsh synth hit', 'metal pipe hit clang', 'bass guitar distorted hit'],
    snare:  ['industrial snare metal crack hit', 'harsh distorted snare hit'],
    drum:   ['metal drum hit industrial', 'steel rim hit harsh industrial'],
    kick:   ['industrial kick drum heavy hit', 'metal bass kick punch hit'],
    bass:   ['industrial bass distorted hit', 'heavy metal bass guitar hit'],
    hihat:  ['industrial metal cymbal hit', 'harsh hihat industrial hit'],
    fill:   ['metal percussion fill industrial', 'industrial drum roll harsh'],
    perc:   ['metal chain percussion loop', 'factory machine rhythm loop'],
    vocal:  ['industrial distorted vocal', 'harsh vocal effect sample'],
  },
  'Latin': {
    pageOffset: 3, resultOffset: 2,
    long:   ['latin salsa orchestra atmosphere', 'tropical cuban ambient warm', 'latin jazz atmosphere pad'],
    medium: ['conga percussion latin loop', 'salsa rhythm loop latin', 'bossa nova guitar loop'],
    short:  ['clave hit latin single', 'cowbell hit latin single', 'guiro scrape latin hit'],
    chord:  ['latin guitar chord major', 'cuban jazz piano chord', 'brass chord stab salsa'],
    inst:   ['nylon guitar latin acoustic note', 'salsa trumpet melody note', 'cuban piano riff note', 'timbale hit latin single'],
    snare:  ['latin rim snare hit', 'conga slap hit latin'],
    drum:   ['timbale drum hit latin', 'latin drum rim hit single'],
    kick:   ['conga bass tone deep hit', 'latin kick drum hit single'],
    bass:   ['latin bass guitar note hit', 'cuban bass tumbao hit'],
    hihat:  ['latin hihat closed hit', 'salsa cymbal hit'],
    fill:   ['latin percussion fill break', 'timbale fill latin hit'],
    perc:   ['conga bongo loop latin', 'maracas shaker loop latin'],
    vocal:  ['latin vocal chant ole phrase', 'salsa vocal phrase'],
  },
  'Jazz': {
    pageOffset: 4, resultOffset: 2,
    long:   ['jazz club atmosphere piano warm', 'jazz piano sustain chord long', 'upright bass jazz walk pad'],
    medium: ['jazz swing quartet loop', 'bebop piano comping loop', 'jazz bass walking loop'],
    short:  ['cymbal chick jazz hit', 'brush snare jazz hit soft', 'rim click jazz single'],
    chord:  ['jazz piano chord voicing major 7', 'minor seventh chord jazz piano', 'dominant chord jazz organ'],
    inst:   ['jazz piano comping note chord', 'jazz saxophone melody note', 'upright bass pizzicato jazz', 'muted trumpet jazz note'],
    snare:  ['jazz brushed snare hit acoustic', 'jazz rim shot snare'],
    drum:   ['jazz tom hit acoustic single', 'rim click jazz hit'],
    kick:   ['jazz bass drum acoustic hit', 'jazz kick pedal hit soft'],
    bass:   ['upright bass pluck jazz note', 'walking bass jazz note single'],
    hihat:  ['jazz hihat chick closed hit', 'ride cymbal jazz hit'],
    fill:   ['jazz drum fill acoustic brush', 'jazz cymbal roll fill'],
    perc:   ['jazz brushwork percussion loop', 'bossa nova shaker loop'],
    vocal:  ['jazz scat vocal phrase', 'female jazz vocal note phrase'],
  },
  'Funk': {
    pageOffset: 0, resultOffset: 1,
    long:   ['funk groove organ sustain pad', 'vintage funk atmosphere warm', 'soul funk synth pad warm'],
    medium: ['funk bass guitar groove loop', 'funk wah guitar loop', 'soul horns funk loop'],
    short:  ['wah guitar scratch hit funk', 'funky guitar chop hit', 'funk clap hit sharp'],
    chord:  ['funk piano chord stab hit', 'funky organ chord hit stab', 'soul brass chord stab hit'],
    inst:   ['funk guitar wah hit single', 'soul horn brass stab note', 'funk piano stab note', 'slap bass guitar funk note'],
    snare:  ['funk snare crack tight hit', 'soul clap snare hit'],
    drum:   ['funk tom groove hit', 'floor tom soul hit'],
    kick:   ['funk kick drum tight hit', 'soul kick drum hit single'],
    bass:   ['slap bass guitar funk hit', 'electric bass funk note hit'],
    hihat:  ['funk hihat tight closed hit', 'open hihat funk single'],
    fill:   ['funk drum fill tight break', 'soul drum break fill'],
    perc:   ['funk tambourine shaker loop', 'conga funk groove loop'],
    vocal:  ['funk vocal shout sample', 'soul gospel vocal phrase'],
  },
  'K-Pop': {
    pageOffset: 1, resultOffset: 2,
    long:   ['kpop bright synth pad atmosphere', 'pop sparkle synth atmosphere', 'bright pop ambient pad'],
    medium: ['pop synth melody loop bright', 'kpop lead synth loop', 'bright arp synth loop pop'],
    short:  ['pop synth hit stab bright', 'kpop riser sweep fx', 'bright synth fx hit pop'],
    chord:  ['pop synth chord major bright', 'electric piano chord pop bright', 'brass chord stab pop bright'],
    inst:   ['bright synth lead melody note', 'electric piano pop note riff', 'pop guitar strum bright note', 'horn stab kpop note'],
    snare:  ['pop snare clap hit punchy', 'kpop snare tight punch hit'],
    drum:   ['pop drum machine tom hit', 'electronic tom hit pop'],
    kick:   ['pop kick drum tight punchy hit', 'kpop bass kick hit'],
    bass:   ['pop bass synth hit bright', 'electronic bass hit pop'],
    hihat:  ['pop hihat closed tight hit', 'kpop hihat rhythm hit'],
    fill:   ['pop drum fill break', 'kpop drum roll electronic'],
    perc:   ['pop clap shaker rhythm loop', 'pop tambourine percussion loop'],
    vocal:  ['kpop female vocal phrase sample', 'pop vocal harmony chop'],
  },
  'Phonk': {
    pageOffset: 2, resultOffset: 0,
    long:   ['memphis phonk dark synth pad', 'dark trap soul ambient texture', 'phonk atmosphere dark'],
    medium: ['phonk melody loop dark', 'memphis synth loop dark', 'dark phonk bass loop'],
    short:  ['phonk cowbell hit single', 'vinyl scratch hip hop short', 'phonk horn stab hit'],
    chord:  ['dark piano chord minor phonk', 'phonk synth chord dark minor', 'memphis dark chord stab'],
    inst:   ['phonk horn brass stab single', 'dark piano memphis note', 'phonk synth lead dark note', 'cowbell single hit phonk'],
    snare:  ['phonk snare crack dry hit', 'memphis snare dry tight hit'],
    drum:   ['phonk tom hit dark single', 'memphis drum machine hit single'],
    kick:   ['phonk 808 kick heavy hit', 'memphis bass kick drum hit'],
    bass:   ['808 bass phonk sub hit', 'dark trap bass sub phonk'],
    hihat:  ['phonk hihat closed hit roll', 'memphis hihat closed hit'],
    fill:   ['phonk drum fill dark roll', 'trap drum roll phonk fill'],
    perc:   ['phonk cowbell shaker loop', 'memphis percussion dark loop'],
    vocal:  ['phonk vocal chop dark sample', 'memphis vocal phrase dark'],
  },
  'Hardstyle': {
    pageOffset: 3, resultOffset: 1,
    long:   ['hardstyle euphoric synth pad', 'hardcore rave atmosphere dark', 'hardstyle synth atmosphere long'],
    medium: ['hardstyle synth melody loop', 'hardcore rave synth loop', 'hardstyle lead synth loop'],
    short:  ['hardstyle reverse cymbal fx', 'rave synth laser fx hit', 'hardstyle stab hit single'],
    chord:  ['hardstyle distorted synth chord', 'hardcore chord hit aggressive', 'rave chord stab hard hit'],
    inst:   ['hardstyle distorted synth note', 'hardcore piano stab note', 'rave synth stab hit note', 'distorted bass synth note'],
    snare:  ['hardstyle snare hit hard punch', 'hardcore clap snare hit'],
    drum:   ['hardstyle drum punch hit', 'hardcore electronic tom hit'],
    kick:   ['hardstyle kick distorted heavy', 'hardcore kick drum punch hard'],
    bass:   ['hardstyle bass synth hit hard', 'hardcore bass line hit'],
    hihat:  ['hardstyle hihat closed hit', 'hardcore hihat electronic hit'],
    fill:   ['hardstyle drum fill reverse', 'hardcore drum roll fill'],
    perc:   ['rave clap rhythm loop electronic', 'hardstyle shaker loop electronic'],
    vocal:  ['rave vocal shout sample', 'hardstyle vocal phrase'],
  },
  'Cinematic': {
    pageOffset: 4, resultOffset: 0,
    long:   ['cinematic orchestral string pad', 'epic film score atmosphere', 'dramatic orchestra sustain long'],
    medium: ['orchestral string loop melody', 'cinematic brass melody loop', 'film score piano loop'],
    short:  ['cinematic impact hit fx', 'orchestra stinger hit dramatic', 'dramatic braaam hit impact'],
    chord:  ['orchestral string chord major', 'brass chord hit cinematic', 'piano chord dramatic major'],
    inst:   ['cinematic violin solo note', 'orchestral horn melody note', 'film piano dramatic note', 'cello dramatic note solo'],
    snare:  ['orchestral snare roll hit', 'taiko drum hit single cinematic'],
    drum:   ['timpani drum hit cinematic', 'orchestral concert drum hit'],
    kick:   ['cinematic bass drum boom hit', 'taiko kick deep bass hit'],
    bass:   ['orchestral bass pizzicato note', 'cinematic bass note deep'],
    hihat:  ['orchestral cymbal hit single', 'triangle hit cinematic single'],
    fill:   ['timpani drum fill roll cinematic', 'orchestral percussion fill'],
    perc:   ['taiko percussion loop cinematic', 'orchestral rhythm percussion loop'],
    vocal:  ['cinematic choir vocal pad', 'epic choral vocal hit'],
  },
  '432Hz Heal': {
    pageOffset: 0, resultOffset: 2,
    long:   ['singing bowl sustained resonance', 'crystal bowl long tone healing', 'tibetan bowl resonance sustain'],
    medium: ['healing meditation music loop', 'crystal harmony loop', 'binaural relaxation loop'],
    short:  ['bell chime healing single hit', 'singing bowl strike single hit', 'tibetan bell single hit'],
    chord:  ['healing piano chord gentle warm', 'crystal harmony chord tone', 'meditation chord sustained'],
    inst:   ['crystal singing bowl note single', 'kalimba thumb piano note', 'flute meditation note gentle', 'harp gentle pluck note'],
    snare:  ['frame drum hit gentle soft', 'hand drum light tap single'],
    drum:   ['djembe hit soft gentle single', 'frame drum meditation hit'],
    kick:   ['bass drum soft healing hit', 'deep drum thump gentle hit'],
    bass:   ['deep bass healing tone note', 'sub bass meditation note long'],
    hihat:  ['finger cymbal ting single hit', 'small cymbal gentle hit'],
    fill:   ['healing drum fill gentle roll', 'soft drum fill meditation'],
    perc:   ['singing bowl loop meditation', 'rain stick shaker loop'],
    vocal:  ['om chant meditation vocal', 'healing vocal humming loop'],
  },
  'SoundFX Goofy': {
    pageOffset: 1, resultOffset: 1,
    long:   ['cartoon music background silly', 'funny ambient comical long', 'comical music loop background'],
    medium: ['cartoon sound effects loop', 'game funny sound loop', 'silly music jingle loop'],
    short:  ['cartoon boing sound hit', 'funny squeak sound effect', 'cartoon pop sound hit'],
    chord:  ['cartoon piano chord silly hit', 'xylophone chord hit cartoon', 'toy piano chord hit funny'],
    inst:   ['cartoon xylophone note melody', 'kazoo funny instrument note', 'ukulele silly strum note', 'toy piano hit cartoon note'],
    snare:  ['cartoon snare funny hit', 'silly drum hit comical'],
    drum:   ['cartoon tom boing hit', 'funny drum sound hit cartoon'],
    kick:   ['cartoon kick drum hit funny', 'bass drum thud cartoon'],
    bass:   ['cartoon tuba bass note funny', 'comical bass note cartoon'],
    hihat:  ['cartoon cymbal silly hit', 'funny hihat comical hit'],
    fill:   ['cartoon drum fill silly', 'funny drum roll cartoon'],
    perc:   ['cartoon percussion loop silly', 'funny rhythm loop cartoon'],
    vocal:  ['cartoon voice effect funny', 'silly vocal sound comical'],
  },
  '1930s Vintage': {
    pageOffset: 2, resultOffset: 2,
    long:   ['gramophone 1930s atmosphere crackle', 'old radio ambient vintage noise', 'vintage vinyl record ambience'],
    medium: ['1930s big band swing loop', 'vintage jazz swing loop', 'old orchestra vintage loop'],
    short:  ['vinyl record pop crackle single', 'old radio static fx short', 'gramophone needle drop fx'],
    chord:  ['vintage stride piano chord 1930s', 'old jazz guitar chord', 'big band brass chord hit'],
    inst:   ['vintage piano stride note 1930s', 'clarinet swing jazz note', 'trombone big band note', 'banjo strum vintage note'],
    snare:  ['vintage snare drum 1930s hit', 'brushed snare old jazz hit'],
    drum:   ['vintage drum kit hit 1930s', 'old drumset tom hit vintage'],
    kick:   ['vintage bass drum acoustic 1930s', 'old kick drum acoustic hit'],
    bass:   ['tuba bass vintage note 1930s', 'upright bass vintage pluck note'],
    hihat:  ['vintage cymbal 1930s hit', 'old jazz cymbal chick hit'],
    fill:   ['vintage drum fill 1930s break', 'old jazz drum break fill'],
    perc:   ['vintage woodblock hit 1930s', 'old tambourine vintage hit'],
    vocal:  ['1930s vintage vocal phrase', 'old radio vocal crackle sample'],
  },
  'Nature Sounds': {
    pageOffset: 3, resultOffset: 0,
    long:   ['forest birds ambient recording long', 'rain ambient nature recording', 'ocean waves ambient recording'],
    medium: ['forest nature loop ambient', 'rain falling loop nature', 'stream water loop nature'],
    short:  ['bird chirp single natural', 'frog croak nature single', 'twig snap natural hit single'],
    chord:  ['steel drum island chord hit', 'ambient nature tone chord', 'wind harmony chord natural'],
    inst:   ['bamboo flute forest note', 'kalimba african natural note', 'wind instrument nature note', 'didgeridoo natural note'],
    snare:  ['wood log hit percussion', 'stick hit wood natural single'],
    drum:   ['wood drum hit natural single', 'djembe natural single hit'],
    kick:   ['deep log drum bass hit', 'bass log hit natural deep'],
    bass:   ['bass log deep hit natural', 'deep natural resonant bass hit'],
    hihat:  ['seed rattle shake hit natural', 'natural shaker hit rattlesnake'],
    fill:   ['natural wood drum fill', 'log drum fill natural rhythm'],
    perc:   ['rainstick shaker loop natural', 'conga drum natural loop'],
    vocal:  ['nature tribal chant vocal', 'bird call imitation vocal'],
  },
  'Chiptune 8-bit': {
    pageOffset: 4, resultOffset: 1,
    long:   ['chiptune 8bit game music background', 'retro NES game music chip', '8bit game atmosphere chip'],
    medium: ['chiptune melody loop 8bit game', 'retro game synth loop chip', '8bit video game music loop'],
    short:  ['8bit game sound effect hit', 'chiptune blip hit short retro', 'video game coin collect fx'],
    chord:  ['chiptune arpeggio chord 8bit', 'retro chip chord hit game', '8bit synth chord hit retro'],
    inst:   ['chiptune square wave melody note', '8bit triangle wave note game', 'retro chip synth note lead', 'chiptune pulse wave hit note'],
    snare:  ['chiptune snare hit 8bit game', 'retro chip snare noise hit'],
    drum:   ['8bit drum hit chip retro', 'chiptune noise drum hit'],
    kick:   ['chiptune kick 8bit hit game', 'retro chip kick bass hit'],
    bass:   ['8bit bass chiptune hit note', 'retro chip bass note game'],
    hihat:  ['chiptune hihat noise hit 8bit', 'retro hihat chip noise game'],
    fill:   ['chiptune drum fill 8bit roll', 'retro game drum break chip'],
    perc:   ['8bit percussion loop chip game', 'retro game rhythm loop chip'],
    vocal:  ['chiptune voice chip sample', '8bit voice game sample'],
  },
  'Vaporwave': {
    pageOffset: 0, resultOffset: 0,
    long:   ['vaporwave smooth synth pad slow', '80s synth atmosphere smooth slow', 'slowed synth pad vaporwave aesthetic'],
    medium: ['slowed reverb melody loop vaporwave', 'smooth 80s synth loop', 'vaporwave ambient melody loop'],
    short:  ['vaporwave synth stab 80s hit', 'smooth fx reverb sweep', 'glitch vaporwave fx'],
    chord:  ['smooth chord synth 80s major', 'vaporwave electric piano chord', 'slow synth chord smooth pad'],
    inst:   ['smooth electric piano 80s note', 'saxophone vaporwave smooth note', 'slow synth melody note lead', 'smooth guitar 80s note'],
    snare:  ['gated reverb snare 80s hit', 'vaporwave snare reverb hit'],
    drum:   ['80s drum machine reverb hit', 'gated drum machine hit 80s'],
    kick:   ['80s drum machine kick hit', 'vaporwave kick reverb hit'],
    bass:   ['slap bass 80s smooth hit', 'smooth bass synth vaporwave hit'],
    hihat:  ['80s drum machine hihat hit', 'smooth hihat vaporwave hit'],
    fill:   ['80s drum fill reverb gated', 'smooth drum break vaporwave'],
    perc:   ['80s percussion shaker loop smooth', 'vaporwave rhythm loop 80s'],
    vocal:  ['smooth vocal sample 80s chop', 'vaporwave vocal aesthetic chop'],
  },
  'Tribal Drums': {
    pageOffset: 1, resultOffset: 2,
    long:   ['tribal ceremony drum ambient long', 'african drum circle atmosphere', 'world music tribal texture long'],
    medium: ['djembe pattern loop african', 'tribal percussion loop ethnic', 'talking drum rhythm loop'],
    short:  ['djembe single hit african', 'talking drum slap hit', 'balafon single note hit'],
    chord:  ['mbira thumb piano chord hit', 'balafon chord african hit', 'kora pluck chord tone'],
    inst:   ['djembe solo hit single', 'mbira thumb piano single note', 'balafon xylophone note hit', 'talking drum single hit'],
    snare:  ['djembe slap tight hit', 'ashiko drum slap hit single'],
    drum:   ['dunun bass drum african hit', 'dundun hit deep single'],
    kick:   ['djembe bass tone deep hit single', 'african bass drum hit deep'],
    bass:   ['low dundun bass hit african', 'deep african drum bass hit'],
    hihat:  ['african bell metal hit single', 'shekere rattle shake hit'],
    fill:   ['african polyrhythm drum fill', 'tribal percussion fill roll'],
    perc:   ['african djembe conga loop', 'tribal rhythm loop ethnic'],
    vocal:  ['african tribal chant loop', 'african call response vocal'],
  },
  'Bossa Nova': {
    pageOffset: 2, resultOffset: 1,
    long:   ['bossa nova guitar warm atmosphere', 'brazilian samba jazz ambient', 'bossa atmosphere warm gentle'],
    medium: ['bossa nova guitar rhythm loop', 'samba guitar loop brazilian', 'bossa piano loop jazz'],
    short:  ['clave bossa hit single', 'ganza shaker hit bossa single', 'pandeiro hit bossa single'],
    chord:  ['bossa nova guitar chord jazz', 'brazilian piano chord jazz', 'acoustic guitar major 7 chord bossa'],
    inst:   ['nylon guitar bossa nova note', 'jazz piano bossa melody note', 'acoustic bass bossa walk note', 'flute bossa nova melody note'],
    snare:  ['bossa snare rim hit single', 'pandeiro slap bossa hit single'],
    drum:   ['surdo drum hit bossa single', 'bossa nova rim hit drum'],
    kick:   ['surdo bass hit bossa kick', 'bossa kick drum hit single'],
    bass:   ['acoustic bass bossa note pluck', 'bass guitar bossa hit note'],
    hihat:  ['bossa nova hihat closed hit', 'brush cymbal bossa hit single'],
    fill:   ['bossa nova drum fill break', 'samba percussion break fill'],
    perc:   ['pandeiro bossa loop rhythm', 'ganza shaker samba loop'],
    vocal:  ['bossa nova portuguese vocal', 'samba vocal warm phrase'],
  },
  'Synthwave 80s': {
    pageOffset: 3, resultOffset: 2,
    long:   ['synthwave neon synth pad 80s', 'retrowave synth atmosphere long', 'neon synthwave texture sustain'],
    medium: ['synthwave arp melody loop 80s', 'retrowave bass synth loop 80s', '80s synth arp loop retrowave'],
    short:  ['synthwave laser hit 80s fx', '80s synth stab hit fx', 'retro synth fx hit 80s'],
    chord:  ['synthwave synth chord major 80s', 'retrowave pad chord hit', 'neon synth power chord 80s'],
    inst:   ['80s synth lead melody note', 'retrowave bass synth note hit', 'saxophone smooth 80s melody', 'electric guitar 80s lead note'],
    snare:  ['gated reverb snare 80s hit', 'synthwave snare hit retro'],
    drum:   ['80s gated drum machine tom', 'drum machine hit retro 80s'],
    kick:   ['80s drum machine kick hit retro', 'synthwave kick drum 80s'],
    bass:   ['retrowave synth bass 80s hit', '80s synth bass note'],
    hihat:  ['80s drum machine hihat hit', 'synthwave hihat electronic 80s'],
    fill:   ['80s drum machine fill retro', 'synthwave drum break 80s'],
    perc:   ['retrowave drum machine loop 80s', 'synthwave shaker percussion 80s loop'],
    vocal:  ['80s retrowave vocal sample', 'synthwave vocal chop 80s'],
  },
  'Grime UK': {
    pageOffset: 4, resultOffset: 2,
    long:   ['uk grime dark synth pad', 'grime electronic atmosphere dark uk', 'london underground atmosphere grime'],
    medium: ['grime beat loop dark uk', 'grime synth melody loop uk', 'uk garage grime loop'],
    short:  ['grime synth stab hit dark', 'uk grime fx hit short', 'garage stab hit grime'],
    chord:  ['grime dark synth chord hit', 'uk garage minor chord hit', 'grime bass chord stab dark'],
    inst:   ['grime synth lead note stab', 'uk bass hit garage note', 'grime piano stab note', 'dark synth grime note hit'],
    snare:  ['grime snare hit dark uk', 'uk garage clap snare hit'],
    drum:   ['grime drum machine hit uk', 'uk garage drum machine hit'],
    kick:   ['grime kick drum heavy hit', 'uk bass kick drum hit'],
    bass:   ['grime bass hit dark deep', 'uk bass synth hit deep'],
    hihat:  ['grime hihat tight hit uk', 'uk garage hihat click'],
    fill:   ['grime drum fill dark uk', 'uk garage drum break fill'],
    perc:   ['grime shaker percussion loop uk', 'uk garage percussion loop'],
    vocal:  ['uk grime vocal phrase', 'uk garage vocal sample'],
  },
  'Reggaeton': {
    pageOffset: 0, resultOffset: 1,
    long:   ['reggaeton dembow synth atmosphere', 'latin urban synth pad warm', 'reggaeton beat atmosphere'],
    medium: ['reggaeton dembow beat loop', 'latin trap melody loop', 'reggaeton synth bass loop'],
    short:  ['reggaeton dembow hit short', 'latin synth stab hit', 'reggaeton brass stab hit'],
    chord:  ['reggaeton synth chord hit latin', 'latin minor chord urban hit', 'latin trap chord stab hit'],
    inst:   ['reggaeton bass synth note hit', 'latin electric guitar riff note', 'reggaeton piano stab note', 'horn stab latin urban note'],
    snare:  ['reggaeton snare dembow hit', 'latin clap snare urban hit'],
    drum:   ['reggaeton drum machine hit', 'dembow tom hit latin single'],
    kick:   ['reggaeton kick drum dembow hit', 'latin kick drum bass hit'],
    bass:   ['reggaeton bass hit heavy sub', 'latin 808 bass note hit'],
    hihat:  ['reggaeton hihat closed hit', 'latin hihat urban hit single'],
    fill:   ['reggaeton drum fill break', 'dembow percussion fill latin'],
    perc:   ['reggaeton conga loop latin', 'latin percussion dembow loop'],
    vocal:  ['reggaeton vocal sample latin', 'perreo vocal phrase latin'],
  },
  'Math Rock': {
    pageOffset: 1, resultOffset: 0,
    long:   ['math rock guitar texture ambient', 'progressive rock atmosphere pad', 'complex guitar ambient texture'],
    medium: ['math rock guitar riff odd time', 'progressive odd meter guitar loop', 'math rock instrumental loop'],
    short:  ['guitar harmonic tap hit', 'math rock guitar hit single', 'guitar stab complex hit'],
    chord:  ['math rock complex guitar chord', 'progressive open guitar chord', 'dissonant guitar chord hit'],
    inst:   ['electric guitar math rock note', 'bass guitar progressive note hit', 'prepared piano complex note', 'marimba progressive note hit'],
    snare:  ['math rock snare acoustic hit', 'progressive snare hit acoustic'],
    drum:   ['math rock tom acoustic hit', 'progressive rock tom hit'],
    kick:   ['math rock kick tight acoustic', 'progressive kick acoustic hit'],
    bass:   ['math rock bass guitar hit note', 'progressive bass note hit'],
    hihat:  ['math rock hihat open acoustic', 'progressive hihat hit acoustic'],
    fill:   ['math rock drum fill complex', 'progressive drum fill break'],
    perc:   ['math rock odd meter loop', 'complex percussion rhythm loop'],
    vocal:  ['math rock vocal phrase sample', 'post rock atmospheric vocal'],
  },
}

// Map blueprint keys to pad indices and duration filters
const BLUEPRINT_SLOT_MAP: Array<{
  key: keyof FullPresetBlueprint
  padIds: number[]
  durationFilter: string
  category: SoundCategory
}> = [
  { key: 'long',   padIds: [0, 1, 2],          durationFilter: 'duration:[2.0 TO 4.0]', category: 'long' },
  { key: 'medium', padIds: [3, 4, 5],          durationFilter: 'duration:[1.0 TO 2.5]', category: 'medium' },
  { key: 'short',  padIds: [6, 7, 8],          durationFilter: 'duration:[0.5 TO 1.0]', category: 'short' },
  { key: 'chord',  padIds: [9, 10, 11],        durationFilter: 'duration:[0.5 TO 3.0]', category: 'chord' },
  { key: 'inst',   padIds: [12, 13, 14, 15],   durationFilter: 'duration:[0.5 TO 3.0]', category: 'instrument' },
  { key: 'snare',  padIds: [16, 17],           durationFilter: 'duration:[0.1 TO 2.0]', category: 'snare' },
  { key: 'drum',   padIds: [18, 19],           durationFilter: 'duration:[0.1 TO 2.0]', category: 'drum' },
  { key: 'kick',   padIds: [20, 21],           durationFilter: 'duration:[0.1 TO 2.0]', category: 'kick' },
  { key: 'bass',   padIds: [22, 23],           durationFilter: 'duration:[0.3 TO 2.5]', category: 'bass' },
  { key: 'hihat',  padIds: [24, 25],           durationFilter: 'duration:[0.05 TO 1.2]', category: 'hihat' },
  { key: 'fill',   padIds: [26, 27],           durationFilter: 'duration:[1.0 TO 3.5]', category: 'fill' },
  { key: 'perc',   padIds: [28, 29],           durationFilter: 'duration:[1.0 TO 4.0]', category: 'percussion' },
  { key: 'vocal',  padIds: [30, 31],           durationFilter: 'duration:[0.5 TO 3.0]', category: 'vocal' },
]

// Generic fallback queries per category if themed query returns 0 results
const FALLBACK_QUERIES: Record<SoundCategory, string[]> = {
  long: [
    'ambient pad sustain long', 'drone texture long atmosphere',
    'orchestral string pad sustain', 'synth pad long texture',
    'soundscape ambient atmosphere', 'cinematic pad long sustain',
  ],
  medium: [
    'melody loop instrument music', 'piano riff loop melody',
    'guitar melody loop acoustic', 'saxophone melody phrase',
    'flute melody loop folk', 'violin melody orchestral loop',
    'trumpet melody jazz phrase', 'synth melody arpeggio loop',
  ],
  short: [
    'sound effect one shot hit', 'instrument stab hit single',
    'piano stab note short', 'guitar pluck note hit',
    'synth hit short stab', 'brass stab hit short',
    'wood block hit single', 'bell hit chime single',
    'record scratch vinyl hit', 'glass break fx short',
    'snap clap body percussion', 'zap laser fx hit',
  ],
  chord: [
    'piano chord hit acoustic', 'guitar chord strum acoustic',
    'organ chord hit jazz', 'synth chord pad hit',
    'brass chord hit orchestral', 'string quartet chord hit',
    'vibraphone chord hit jazz', 'marimba chord hit mallet',
    'harp chord glissando hit', 'accordion chord hit',
    'electric guitar power chord', 'harpsichord chord hit baroque',
    'rhodes electric piano chord', 'flute ensemble chord harmony',
    'vocal choir chord hit', 'trumpet ensemble chord fanfare',
  ],
  instrument: [
    'piano note single acoustic', 'guitar note pluck single',
    'violin note bow single', 'flute note single breath',
    'saxophone note single jazz', 'trumpet note single bright',
    'trombone note single mellow', 'cello note single bow',
    'harp pluck note single', 'marimba note hit single',
    'vibraphone note hit single', 'oboe note single orchestral',
    'clarinet note single melodic', 'french horn note single',
    'synth note single lead', 'organ note single church',
    'rhodes note single warm', 'banjo pluck note single',
    'sitar pluck note single', 'erhu note single chinese',
    'didgeridoo note single', 'kalimba note thumb piano',
  ],
  snare: ['snare drum hit acoustic', 'snare crack tight hit', 'rimshot snare hit single', 'brushed snare hit soft'],
  drum: ['tom drum hit single', 'rimshot hit drum single', 'floor tom hit deep', 'timbale hit latin single'],
  kick: ['kick drum hit bass', 'bass drum thump hit', 'sub kick bass hit', 'electronic kick drum hit'],
  bass: [
    'bass guitar note hit single', 'upright bass pluck note',
    'synth bass note hit', 'tuba bass note single',
    'cello bass pizzicato note', 'bass piano low note hit',
    '808 bass sub hit note', 'bass clarinet note low',
  ],
  hihat: ['closed hihat hit single', 'hihat click tight hit', 'open hihat sizzle hit', 'electronic hihat hit'],
  fill: [
    'drum fill percussion break ensemble', 'snare roll drum fill break',
    'orchestral percussion fill roll', 'breakbeat drum break fill',
    'timbale roll fill percussion', 'tom fill break rhythm',
  ],
  percussion: [
    'marimba note hit single melody', 'xylophone note single hit',
    'vibraphone note single jazz', 'glockenspiel bell note hit',
    'conga hit single latin', 'bongo drum hit single',
    'timbale hit single latin', 'cowbell hit single rhythm',
    'woodblock hit single dry', 'agogo bell hit single',
    'triangle hit single chime', 'claves hit single cuban',
    'shaker hit single rattle', 'tambourine hit single',
    'tubular bells hit single orchestral', 'steel drum note island single',
  ],
  vocal: [
    'vocal phrase sample melody', 'vocal chant loop ethnic',
    'choir vocal hit harmony', 'spoken word vocal sample',
    'scat vocal jazz phrase', 'beatbox vocal rhythm hit',
    'whistle vocal melodic phrase', 'throat singing vocal ethnic',
  ],
}

// Drum categories — used to apply stricter quality filtering
const PERCUSSIVE_CATEGORIES: SoundCategory[] = ['snare', 'drum', 'kick', 'hihat']

// Deprecated — kept for type compatibility
type SoundSlotConfig = {
  padIds: number[]
  category: SoundCategory
  queryTerms: string[]
  durationFilter: string
}
const SOUND_SLOT_BLUEPRINT: SoundSlotConfig[] = [
  // All durations clamped to a hard 4.0s ceiling per spec.
  { padIds: [0, 1, 2], category: 'long', queryTerms: ['texture', 'pad', 'atmosphere'], durationFilter: 'duration:[2.0 TO 4.0]' },
  { padIds: [3, 4, 5], category: 'medium', queryTerms: ['loop', 'soundscape', 'melody'], durationFilter: 'duration:[1.0 TO 2.5]' },
  { padIds: [6, 7, 8], category: 'short', queryTerms: ['fx', 'glitch', 'one shot'], durationFilter: 'duration:[0.5 TO 1.0]' },
  { padIds: [9, 10, 11], category: 'chord', queryTerms: ['major chord', 'minor chord', 'synth chord'], durationFilter: 'duration:[0.5 TO 3.0]' },
  // 4 instruments, max 2 of same family — rotated per-preset in resolveInstrumentTerms()
  { padIds: [12, 13, 14, 15], category: 'instrument', queryTerms: ['piano', 'guitar', 'synth lead', 'violin'], durationFilter: 'duration:[0.5 TO 3.0]' },
  { padIds: [16, 17], category: 'snare', queryTerms: ['snare', 'snare drum'], durationFilter: 'duration:[0.5 TO 1.2]' },
  { padIds: [18, 19], category: 'drum', queryTerms: ['drum', 'rimshot'], durationFilter: 'duration:[0.5 TO 1.2]' },
  { padIds: [20, 21], category: 'kick', queryTerms: ['kick', 'sub kick'], durationFilter: 'duration:[0.5 TO 0.8]' },
  { padIds: [22, 23], category: 'bass', queryTerms: ['bass hit', 'bass loop'], durationFilter: 'duration:[0.1 TO 2.5]' },
  { padIds: [24, 25], category: 'hihat', queryTerms: ['hihat', 'closed hat'], durationFilter: 'duration:[0.5 TO 0.8]' },
  { padIds: [26, 27], category: 'fill', queryTerms: ['drum fill', 'breakbeat'], durationFilter: 'duration:[1.0 TO 3.5]' },
  { padIds: [28, 29], category: 'percussion', queryTerms: ['percussion ensemble', 'tribal loop'], durationFilter: 'duration:[1.0 TO 4.0]' },
  { padIds: [30, 31], category: 'vocal', queryTerms: ['vocal chant', 'vocal phrase'], durationFilter: 'duration:[0.5 TO 3.0]' },
]

// Broad instrument families to enforce "max 2 from same family" rule.
const INSTRUMENT_FAMILIES: Record<string, string> = {
  // Keys (10)
  piano: 'keys', 'grand piano': 'keys', 'upright piano': 'keys', rhodes: 'keys', wurlitzer: 'keys',
  organ: 'keys', 'hammond organ': 'keys', 'church organ': 'keys', harpsichord: 'keys', clavinet: 'keys',
  accordion: 'keys', 'toy piano': 'keys', celesta: 'keys',
  // Strings — bowed/plucked (16)
  guitar: 'strings', 'acoustic guitar': 'strings', 'electric guitar': 'strings', 'nylon guitar': 'strings',
  'classical guitar': 'strings', violin: 'strings', viola: 'strings', cello: 'strings',
  'double bass': 'strings', harp: 'strings', mandolin: 'strings', banjo: 'strings',
  ukulele: 'strings', sitar: 'strings', oud: 'strings', lute: 'strings', dulcimer: 'strings',
  // Synth (8)
  'synth lead': 'synth', 'synth pad': 'synth', 'synth pluck': 'synth', 'synth bass': 'synth',
  'synth arp': 'synth', moog: 'synth', 'modular synth': 'synth', 'fm synth': 'synth',
  // Woodwind (12)
  flute: 'woodwind', 'alto sax': 'woodwind', 'tenor sax': 'woodwind', 'soprano sax': 'woodwind',
  clarinet: 'woodwind', oboe: 'woodwind', bassoon: 'woodwind', recorder: 'woodwind',
  piccolo: 'woodwind', 'pan flute': 'woodwind', 'tin whistle': 'woodwind', shakuhachi: 'woodwind',
  bagpipes: 'woodwind', harmonica: 'woodwind',
  // Brass (8)
  trumpet: 'brass', trombone: 'brass', 'french horn': 'brass', tuba: 'brass',
  flugelhorn: 'brass', cornet: 'brass', 'brass ensemble': 'brass', euphonium: 'brass',
  // Mallet / pitched percussion (8)
  marimba: 'mallet', xylophone: 'mallet', vibraphone: 'mallet', glockenspiel: 'mallet',
  'tubular bells': 'mallet', kalimba: 'mallet', mbira: 'mallet', 'steel drum': 'mallet',
  // World / ethnic / special (10)
  tabla: 'world', kora: 'world', didgeridoo: 'world', gamelan: 'world',
  balafon: 'world', erhu: 'world', koto: 'world', shamisen: 'world',
  bouzouki: 'world', cuatro: 'world',
}
const INSTRUMENT_POOL = [
  // Keys (10)
  'grand piano', 'upright piano', 'rhodes', 'wurlitzer', 'hammond organ',
  'church organ', 'harpsichord', 'clavinet', 'accordion', 'celesta',
  // Strings (16)
  'acoustic guitar', 'electric guitar', 'nylon guitar', 'classical guitar',
  'violin', 'viola', 'cello', 'double bass', 'harp', 'mandolin',
  'banjo', 'ukulele', 'sitar', 'oud', 'lute', 'dulcimer',
  // Synths (8)
  'synth lead', 'synth pad', 'synth pluck', 'synth arp', 'moog', 'modular synth', 'fm synth', 'synth bass',
  // Woodwinds (14)
  'flute', 'piccolo', 'alto sax', 'tenor sax', 'soprano sax',
  'clarinet', 'oboe', 'bassoon', 'recorder', 'pan flute',
  'tin whistle', 'shakuhachi', 'harmonica', 'bagpipes',
  // Brass (8)
  'trumpet', 'trombone', 'french horn', 'tuba', 'flugelhorn', 'cornet', 'euphonium', 'brass ensemble',
  // Mallet / pitched perc (8)
  'marimba', 'vibraphone', 'xylophone', 'glockenspiel', 'tubular bells', 'kalimba', 'mbira', 'steel drum',
  // World / special (10)
  'tabla', 'kora', 'erhu', 'koto', 'shamisen', 'gamelan', 'didgeridoo', 'balafon', 'bouzouki', 'cuatro',
] as const

// Pick 4 instruments, never more than 2 from the same family, deterministic per preset name.
function resolveInstrumentTerms(presetName: string): string[] {
  // Simple deterministic shuffle from preset name hash
  let h = 0
  for (let i = 0; i < presetName.length; i++) h = (h * 31 + presetName.charCodeAt(i)) >>> 0
  const pool = [...INSTRUMENT_POOL].sort((a, b) => {
    const ha = ((h ^ a.charCodeAt(0)) * 2654435761) >>> 0
    const hb = ((h ^ b.charCodeAt(0)) * 2654435761) >>> 0
    return ha - hb
  })
  const picked: string[] = []
  const famCount: Record<string, number> = {}
  for (const term of pool) {
    const fam = INSTRUMENT_FAMILIES[term] || term
    if ((famCount[fam] || 0) >= 2) continue
    picked.push(term)
    famCount[fam] = (famCount[fam] || 0) + 1
    if (picked.length === 4) break
  }
  while (picked.length < 4) picked.push(INSTRUMENT_POOL[picked.length])
  return picked
}

// Preset-specific query modifiers to make each preset sound unique
const PRESET_QUERY_MODIFIERS: Record<PresetName, { prefix: string; tags: string[] }> = {
  'Dubstep Club': { prefix: 'dubstep', tags: ['bass', 'wobble', 'electronic'] },
  'Trap Soul': { prefix: 'trap', tags: ['808', 'hiphop', 'soul'] },
  'House Pulse': { prefix: 'house', tags: ['dance', 'club', 'electronic'] },
  'Lo-Fi Tape': { prefix: 'lofi', tags: ['vinyl', 'chill', 'nostalgic'] },
  'Techno': { prefix: 'techno', tags: ['industrial', 'rave', 'hard'] },
  'Drum&Bass': { prefix: 'dnb', tags: ['jungle', 'fast', 'breakbeat'] },
  'Ambient': { prefix: 'ambient', tags: ['atmospheric', 'calm', 'drone'] },
  'Industrial': { prefix: 'industrial', tags: ['metal', 'harsh', 'noise'] },
  'Latin': { prefix: 'latin', tags: ['salsa', 'bongo', 'conga'] },
  'Jazz': { prefix: 'jazz', tags: ['swing', 'blues', 'smooth'] },
  'Funk': { prefix: 'funk', tags: ['groovy', 'bass', 'rhythm'] },
  'K-Pop': { prefix: 'kpop', tags: ['pop', 'synth', 'dance'] },
  'Phonk': { prefix: 'phonk', tags: ['memphis', 'dark', 'cowbell'] },
  'Hardstyle': { prefix: 'hardstyle', tags: ['hardcore', 'kick', 'distorted'] },
  'Cinematic': { prefix: 'cinematic', tags: ['orchestra', 'film', 'epic'] },
  '432Hz Heal': { prefix: 'healing', tags: ['meditation', 'relaxing', 'binaural'] },
  'SoundFX Goofy': { prefix: 'cartoon', tags: ['funny', 'sfx', 'comedy'] },
  '1930s Vintage': { prefix: 'vintage', tags: ['old', 'retro', 'classic'] },
  'Nature Sounds': { prefix: 'nature', tags: ['forest', 'water', 'birds'] },
  'Chiptune 8-bit': { prefix: 'chiptune', tags: ['8bit', 'retro', 'game'] },
  'Vaporwave': { prefix: 'vaporwave', tags: ['aesthetic', '80s', 'synth'] },
  'Tribal Drums': { prefix: 'tribal', tags: ['african', 'world', 'ethnic'] },
  'Bossa Nova': { prefix: 'bossa', tags: ['brazilian', 'jazz', 'guitar'] },
  'Synthwave 80s': { prefix: 'synthwave', tags: ['retro', 'neon', 'synth'] },
  'Grime UK': { prefix: 'grime', tags: ['uk', 'bass', 'urban'] },
  'Reggaeton': { prefix: 'reggaeton', tags: ['latin', 'dembow', 'urban'] },
  'Math Rock': { prefix: 'mathrock', tags: ['guitar', 'complex', 'progressive'] },
}

// Type for loaded Freesound samples
type FreesoundSample = {
  id: number
  name: string
  previewUrl: string
  audioBuffer?: AudioBuffer
}

type PresetSoundKit = {
  preset: PresetName
  samples: Map<number, FreesoundSample> // padIdx -> sample
  loadedAt: number
}

// Fetch sounds from Freesound API for a specific query
async function fetchFreesoundSamples(
  query: string,
  durationFilter: string,
  count: number = 8,
  page: number = 1,
  sortBy: string = 'rating_desc'
): Promise<FreesoundSample[]> {
  const url = `${FREESOUND_API_BASE}?query=${encodeURIComponent(query)}&filter=${encodeURIComponent(durationFilter)}&page_size=${count}&page=${page}&sort=${sortBy}&fields=id,name,previews&token=${FREESOUND_API_TOKEN}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.warn(`[freesound] API error for query "${query}":`, response.status)
      return []
    }
    const data = await response.json()
    if (!data.results || data.results.length === 0) return []

    return data.results.map((r: any) => ({
      id: r.id,
      name: r.name,
      previewUrl: r.previews?.['preview-hq-mp3'] || r.previews?.['preview-lq-mp3'] || '',
    })).filter((s: FreesoundSample) => s.previewUrl)
  } catch (err) {
    console.warn(`[freesound] fetch error for query "${query}":`, err)
    return []
  }
}

// Load and cache a single audio file
async function loadAndCacheAudio(
  url: string,
  ctx: AudioContext
): Promise<AudioBuffer | null> {
  try {
    // Try cache first
    const cache = await caches.open(CACHE_NAME)
    let response = await cache.match(url)
    
    if (!response) {
      // Fetch from network
      response = await fetch(url)
      if (!response.ok) return null
      // Clone and cache
      await cache.put(url, response.clone())
    }
    
    const arrayBuffer = await response.arrayBuffer()
    if (arrayBuffer.byteLength < 200) return null  // empty file only
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
    // Accept any decoded buffer with non-zero duration. Do NOT peak-scan —
    // legitimate low-bass / soft-hat samples can read below tiny thresholds
    // and were being wrongly rejected, forcing the noisy synth fallback.
    if (audioBuffer.duration <= 0) return null
    return audioBuffer
  } catch (err) {
    console.warn(`[v0] Audio load error for ${url}:`, err)
    return null
  }
}

// ---- SAMPLE REFINEMENT PIPELINE (MINIMAL, NON-DESTRUCTIVE) ----
// Per user mandate: NO gain change, NO normalization, NO fades, NO trailing trim.
// Only: trim leading silence + hard-cap at 4 seconds. Period.
// Validates output is not silent — returns input as fallback if anything looks broken.
async function refineAudioBuffer(
  input: AudioBuffer,
  ctx: BaseAudioContext,
  _category?: SoundCategory,
  _isLightTouch?: boolean
): Promise<AudioBuffer> {
  void _category; void _isLightTouch
  const sr = input.sampleRate
  const channels = input.numberOfChannels
  const MAX_DUR_SAMPLES = Math.floor(4.0 * sr)

  // Peak check on input — if entirely silent reject (caller will use synth fallback)
  let inputPeak = 0
  for (let c = 0; c < channels; c++) {
    const d = input.getChannelData(c)
    for (let i = 0; i < d.length; i += 32) { // sparse scan
      const a = Math.abs(d[i]); if (a > inputPeak) inputPeak = a
      if (inputPeak > 0.1) break
    }
    if (inputPeak > 0.1) break
  }
  if (inputPeak < 0.005) {
    // Input is essentially silent — return as-is (caller may fall back to synth)
    return input
  }

  // Find first sample with any audible content (trim leading silence)
  const silenceThreshold = 0.005
  let firstNon = 0
  outer: for (let i = 0; i < input.length; i++) {
    for (let c = 0; c < channels; c++) {
      if (Math.abs(input.getChannelData(c)[i]) > silenceThreshold) { firstNon = i; break outer }
    }
  }
  // Don't trim more than 1 second of leading silence (safety)
  const maxLeadingTrim = Math.floor(1.0 * sr)
  if (firstNon > maxLeadingTrim) firstNon = maxLeadingTrim

  const remainingLen = input.length - firstNon
  const outLen = Math.min(remainingLen, MAX_DUR_SAMPLES)
  if (outLen < Math.floor(0.05 * sr)) {
    // Less than 50ms left after trimming — return original
    return input
  }

  const out = ctx.createBuffer(channels, outLen, sr)
  for (let c = 0; c < channels; c++) {
    const src = input.getChannelData(c)
    const dst = out.getChannelData(c)
    for (let i = 0; i < outLen; i++) {
      dst[i] = src[firstNon + i]  // NO gain change at all — pure pass-through
    }
  }
  return out
}

// ---- SYNTHESIZED PAD SOUNDS (up to ~6/32 per preset as fallback) ----
// Generates genuinely different AudioBuffers from scratch via OfflineAudioContext.
type SynthPadType = 'synth_kick' | 'synth_snare' | 'synth_hat' | 'synth_bass' | 'synth_pad' | 'synth_hit' | 'synth_perc' | 'synth_chord'

async function synthesizePadSound(type: SynthPadType, variant: number): Promise<AudioBuffer> {
  const SR = 44100
  const v = Math.abs(variant) % 128 // expanded range → far more distinct sounds

  if (type === 'synth_kick') {
    const dur = 0.5 + (v % 8) * 0.04  // vary length 0.5-0.78s
    const off = new OfflineAudioContext(1, Math.floor(dur * SR), SR)
    const gain = off.createGain()
    gain.connect(off.destination)
    gain.gain.setValueAtTime(1.0, 0)
    gain.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    const osc = off.createOscillator()
    osc.type = 'sine'
    // Wide frequency spread: 30-70Hz base, 4x-8x start multiplier
    const baseFreq = 30 + (v % 24) * 1.8
    const startMult = 4 + (v % 5)
    const midFreq  = baseFreq * (1.1 + (v % 10) * 0.08)
    osc.frequency.setValueAtTime(baseFreq * startMult, 0)
    osc.frequency.exponentialRampToValueAtTime(midFreq, 0.04 + (v % 6) * 0.003)
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.55, 0.28)
    osc.connect(gain)
    osc.start(0); osc.stop(dur)
    // click transient — varies in frequency and level
    const clickGain = off.createGain()
    clickGain.connect(off.destination)
    clickGain.gain.setValueAtTime(0.3 + (v % 6) * 0.06, 0)
    clickGain.gain.exponentialRampToValueAtTime(0.001, 0.006 + (v % 4) * 0.001)
    const clickOsc = off.createOscillator()
    clickOsc.type = v % 3 === 0 ? 'square' : v % 3 === 1 ? 'triangle' : 'sawtooth'
    clickOsc.frequency.setValueAtTime(900 + v * 22, 0)
    clickOsc.connect(clickGain)
    clickOsc.start(0); clickOsc.stop(0.012)
    return off.startRendering()
  }

  if (type === 'synth_snare') {
    // Vary between: tight snare, wide snare, rimshot, snappy, ghost, heavy
    const flavors = ['tight', 'wide', 'rimshot', 'snappy', 'ghost', 'heavy', 'crack', 'brush']
    const flavor = flavors[v % flavors.length]
    const dur = flavor === 'brush' ? 0.5 : flavor === 'ghost' ? 0.15 : flavor === 'heavy' ? 0.45 : 0.28 + (v % 8) * 0.012
    const off = new OfflineAudioContext(1, Math.floor(dur * SR), SR)
    // Noise component
    const noiseLen = Math.floor(dur * SR)
    const noiseBuf = off.createBuffer(1, noiseLen, SR)
    const nd = noiseBuf.getChannelData(0)
    for (let i = 0; i < noiseLen; i++) nd[i] = Math.random() * 2 - 1
    const noiseSource = off.createBufferSource()
    noiseSource.buffer = noiseBuf
    const noiseFilter = off.createBiquadFilter()
    noiseFilter.type = flavor === 'brush' ? 'lowpass' : 'highpass'
    noiseFilter.frequency.value = flavor === 'brush' ? 3000 : 700 + v * 30
    noiseFilter.Q.value = flavor === 'rimshot' ? 8 : 1 + (v % 6)
    noiseSource.connect(noiseFilter)
    const noiseGain = off.createGain()
    const noiseLevel = flavor === 'ghost' ? 0.25 : flavor === 'crack' ? 0.8 : 0.5 + (v % 8) * 0.05
    noiseGain.gain.setValueAtTime(noiseLevel, 0)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(off.destination)
    noiseSource.start(0); noiseSource.stop(dur)
    // Body tone — frequency varies by flavor
    const toneFreq = flavor === 'heavy' ? 110 + v * 3 : flavor === 'brush' ? 200 + v * 5 : 160 + v * 6
    const toneGain = off.createGain()
    toneGain.gain.setValueAtTime(flavor === 'ghost' ? 0.15 : 0.4, 0)
    toneGain.gain.exponentialRampToValueAtTime(0.001, flavor === 'brush' ? 0.3 : 0.12)
    const toneOsc = off.createOscillator()
    toneOsc.type = flavor === 'rimshot' ? 'square' : 'triangle'
    toneOsc.frequency.setValueAtTime(toneFreq, 0)
    toneOsc.connect(toneGain)
    toneGain.connect(off.destination)
    toneOsc.start(0); toneOsc.stop(dur)
    return off.startRendering()
  }

  if (type === 'synth_hat') {
    // Vary: closed, open, pedal, chick, ride-like, sizzle, crash-like
    const hatTypes = ['closed', 'open', 'pedal', 'chick', 'ride', 'sizzle']
    const hatType = hatTypes[v % hatTypes.length]
    const dur = hatType === 'open' ? 0.5 + (v % 4) * 0.1
              : hatType === 'ride' ? 0.6 + (v % 5) * 0.08
              : hatType === 'sizzle' ? 0.35 + (v % 6) * 0.05
              : 0.06 + (v % 12) * 0.01
    const off = new OfflineAudioContext(1, Math.floor(dur * SR), SR)
    // 6 detuned square/square oscillators — frequencies vary by type
    const baseFreqs = hatType === 'ride'  ? [320, 400, 630, 890, 1260, 1780]
                    : hatType === 'sizzle'? [200, 260, 400, 580, 820, 1160]
                    : [250, 320, 510, 720, 1020, 1440]
    const masterGain = off.createGain()
    masterGain.gain.setValueAtTime(hatType === 'pedal' ? 0.5 : 0.7, 0)
    masterGain.gain.exponentialRampToValueAtTime(0.001, dur - 0.005)
    const hp = off.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = hatType === 'ride' ? 4000 : hatType === 'sizzle' ? 3000 : 6000 + v * 50
    hp.connect(masterGain); masterGain.connect(off.destination)
    baseFreqs.forEach((f, i) => {
      const o = off.createOscillator()
      o.type = 'square'
      o.frequency.value = f * (1 + (v * 0.007) * (i % 2 === 0 ? 1 : -1))
      o.connect(hp)
      o.start(0); o.stop(dur)
    })
    return off.startRendering()
  }

  if (type === 'synth_bass') {
    // Many distinct bass flavors: sub, synth, plucked, picked, slap, moog, acid, tuba
    const flavors = ['sub', 'synth', 'pluck', 'slap', 'moog', 'acid', 'tuba', 'fretless']
    const flavor = flavors[v % flavors.length]
    const dur = flavor === 'pluck' ? 0.6 + (v % 8) * 0.05
              : flavor === 'slap'  ? 0.5 + (v % 6) * 0.04
              : flavor === 'acid'  ? 0.7 + (v % 9) * 0.05
              : 1.1 + (v % 12) * 0.06
    const off = new OfflineAudioContext(1, Math.floor(dur * SR), SR)
    // MIDI bass notes across 3 octaves
    const midiNotes = [24, 26, 28, 29, 31, 33, 34, 36, 38, 40, 41, 43, 45, 46, 48, 50]
    const midi = midiNotes[v % midiNotes.length]
    const freq = 440 * Math.pow(2, (midi - 69) / 12)
    const osc = off.createOscillator()
    osc.type = flavor === 'sub'  ? 'sine'
             : flavor === 'moog' ? 'sawtooth'
             : flavor === 'acid' ? 'sawtooth'
             : flavor === 'tuba' ? 'square'
             : flavor === 'pluck'? 'sawtooth'
             : 'square'
    osc.frequency.value = freq
    if (flavor === 'acid') {
      osc.frequency.setValueAtTime(freq * 2, 0)
      osc.frequency.exponentialRampToValueAtTime(freq, 0.04)
    }
    const filt = off.createBiquadFilter()
    filt.type = 'lowpass'
    filt.frequency.setValueAtTime(
      flavor === 'sub'  ? 200 + v * 4
      : flavor === 'moog' ? 1200 + v * 18
      : flavor === 'acid' ? 2000 + v * 40
      : 900 + v * 15, 0)
    filt.frequency.exponentialRampToValueAtTime(
      flavor === 'sub' ? 80 : 150 + v * 5, dur * 0.5)
    filt.Q.value = flavor === 'acid' ? 6 + (v % 8) : 1.5 + (v % 5) * 0.4
    osc.connect(filt)
    const g = off.createGain()
    const attack = flavor === 'slap' ? 0.002 : flavor === 'pluck' ? 0.003 : 0.008
    g.gain.setValueAtTime(0, 0)
    g.gain.linearRampToValueAtTime(0.85, attack)
    if (flavor === 'pluck' || flavor === 'slap') {
      g.gain.exponentialRampToValueAtTime(0.001, dur - 0.02)
    } else {
      g.gain.setValueAtTime(0.85, 0.12)
      g.gain.exponentialRampToValueAtTime(0.001, dur - 0.05)
    }
    filt.connect(g); g.connect(off.destination)
    osc.start(0); osc.stop(dur)
    return off.startRendering()
  }

  if (type === 'synth_pad') {
    // Many pad flavors across wider frequency range
    const flavors = ['warm', 'bright', 'string', 'choir', 'glass', 'organ', 'bells', 'hollow', 'dark', 'lush']
    const flavor = flavors[v % flavors.length]
    const dur = 2.0 + (v % 10) * 0.2
    const off = new OfflineAudioContext(2, Math.floor(dur * SR), SR)
    // 24 chromatic pitches spread across 2 octaves
    const semitone = v % 24
    const baseFreq = 110 * Math.pow(2, semitone / 12)
    const masterGain = off.createGain()
    masterGain.gain.setValueAtTime(0, 0)
    masterGain.gain.linearRampToValueAtTime(0.55, 0.4)
    masterGain.gain.setValueAtTime(0.55, dur - 0.6)
    masterGain.gain.linearRampToValueAtTime(0, dur)
    masterGain.connect(off.destination)
    // Layered oscillators — waveform depends on flavor
    const waveTypes: OscillatorType[] = flavor === 'bright' ? ['sawtooth', 'sawtooth', 'square']
                                      : flavor === 'hollow' ? ['square', 'square', 'triangle']
                                      : flavor === 'organ'  ? ['square', 'square', 'sine']
                                      : ['sine', 'triangle', 'sine']
    const detunes = [0, 7, -5, 12]
    detunes.forEach((cents, i) => {
      const o = off.createOscillator()
      o.type = waveTypes[i % waveTypes.length]
      o.frequency.value = baseFreq * Math.pow(2, cents / 1200)
      if (flavor === 'choir') o.detune.value = (i % 2 === 0 ? 1 : -1) * (12 + v % 18)
      const g = off.createGain(); g.gain.value = 0.28 - i * 0.05
      o.connect(g); g.connect(masterGain)
      o.start(0); o.stop(dur)
    })
    return off.startRendering()
  }

  if (type === 'synth_hit') {
    // Short attack hit — FM/inharmonic partials only, NO noise (noise = static)
    const hitFlavors = ['metallic', 'mallet', 'rimshot', 'clap', 'click', 'blip', 'plink', 'snap']
    const hitFlavor = hitFlavors[v % hitFlavors.length]
    const dur = hitFlavor === 'mallet' ? 0.6 + (v % 8) * 0.04
              : hitFlavor === 'clap'   ? 0.15 + (v % 5) * 0.02
              : 0.25 + (v % 10) * 0.02
    const off = new OfflineAudioContext(1, Math.floor(dur * SR), SR)
    const masterGain = off.createGain()
    masterGain.connect(off.destination)
    if (hitFlavor === 'mallet') {
      // Marimba/xylophone inharmonic partials
      const fundamental = 220 + v * 18
      const ratios = [1, 3.87, 9.97, 18.2]
      const levels  = [0.7, 0.3, 0.12, 0.06]
      ratios.forEach((r, i) => {
        const o = off.createOscillator(); o.type = 'sine'; o.frequency.value = fundamental * r
        const g = off.createGain()
        g.gain.setValueAtTime(levels[i], 0)
        g.gain.exponentialRampToValueAtTime(0.001, dur * (0.95 - i * 0.2))
        o.connect(g); g.connect(masterGain)
        o.start(0); o.stop(dur)
      })
    } else if (hitFlavor === 'clap') {
      // Very short burst of noise-like FM at body freq
      const modFreq = 500 + v * 40
      const mod = off.createOscillator(); mod.type = 'sine'; mod.frequency.value = modFreq * 3
      const modG = off.createGain(); modG.gain.value = modFreq * 2
      mod.connect(modG)
      const car = off.createOscillator(); car.type = 'sine'; car.frequency.value = modFreq
      modG.connect((car.frequency as AudioParam))
      const cg = off.createGain(); cg.gain.setValueAtTime(0.7, 0); cg.gain.exponentialRampToValueAtTime(0.001, dur)
      car.connect(cg); cg.connect(masterGain)
      mod.start(0); mod.stop(dur); car.start(0); car.stop(dur)
    } else {
      // Metallic/blip/click: inharmonic series at varying frequencies
      const baseFreq = hitFlavor === 'click' ? 2000 + v * 60
                     : hitFlavor === 'blip'  ? 600 + v * 30
                     : hitFlavor === 'plink' ? 900 + v * 25
                     : hitFlavor === 'snap'  ? 1400 + v * 45
                     : 300 + v * 25 // metallic/rimshot
      const partials = [1, 2.756, 5.404, 8.9]
      partials.forEach((r, i) => {
        const o = off.createOscillator(); o.type = 'sine'; o.frequency.value = baseFreq * r
        const g = off.createGain()
        g.gain.setValueAtTime(0.5 / (i + 1), 0)
        g.gain.exponentialRampToValueAtTime(0.001, Math.max(0.02, dur - i * 0.06))
        o.connect(g); g.connect(masterGain)
        o.start(0); o.stop(dur)
      })
    }
    return off.startRendering()
  }

  if (type === 'synth_perc') {
    // Many distinct percussion types: bongo, conga, clave, woodblock, cowbell, shaker, tamb, agogo, castanet, stick, tom, surdo
    const percTypes = ['bongo', 'conga', 'clave', 'woodblock', 'cowbell', 'shaker', 'tamb', 'agogo', 'castanet', 'stick', 'tom', 'surdo']
    const percType = percTypes[v % percTypes.length]
    const dur = percType === 'cowbell' ? 0.9 + (v % 6) * 0.06
              : percType === 'conga'   ? 0.6 + (v % 8) * 0.05
              : percType === 'tamb'    ? 0.5 + (v % 7) * 0.04
              : 0.2 + (v % 10) * 0.03
    const off = new OfflineAudioContext(1, Math.floor(dur * SR), SR)
    const mg = off.createGain()
    mg.gain.setValueAtTime(0.8, 0)
    mg.gain.exponentialRampToValueAtTime(0.001, dur - 0.01)
    mg.connect(off.destination)

    if (percType === 'cowbell') {
      ;[540 + v * 8, 845 + v * 12].forEach(f => {
        const o = off.createOscillator(); o.type = 'square'; o.frequency.value = f
        o.connect(mg); o.start(0); o.stop(dur)
      })
    } else if (percType === 'shaker' || percType === 'tamb') {
      const nb = off.createBuffer(1, Math.floor(dur * SR), SR)
      const nd = nb.getChannelData(0)
      for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1
      const ns = off.createBufferSource(); ns.buffer = nb
      const hpf = off.createBiquadFilter(); hpf.type = 'highpass'
      hpf.frequency.value = percType === 'tamb' ? 6000 + v * 80 : 8000 + v * 60
      ns.connect(hpf); hpf.connect(mg); ns.start(0); ns.stop(dur)
    } else {
      const freqMap: Record<string, number> = {
        bongo: 200 + v * 6, conga: 130 + v * 5, clave: 1200 + v * 15,
        woodblock: 900 + v * 20, agogo: 700 + v * 14, castanet: 1100 + v * 18,
        stick: 1500 + v * 22, tom: 80 + v * 4, surdo: 50 + v * 3
      }
      const freq = freqMap[percType] ?? 300 + v * 8
      const o = off.createOscillator()
      o.type = percType === 'clave' || percType === 'woodblock' ? 'square' : 'sine'
      o.frequency.setValueAtTime(freq * 1.8, 0)
      o.frequency.exponentialRampToValueAtTime(freq, 0.015 + (v % 5) * 0.002)
      o.connect(mg); o.start(0); o.stop(dur)
    }
    return off.startRendering()
  }

  // synth_chord
  {
    const dur = 2.0
    const off = new OfflineAudioContext(2, Math.floor(dur * SR), SR)
    const roots = [130.81, 138.59, 146.83, 155.56, 164.81, 174.61, 184.99, 195.99, 207.65, 220.00, 233.08, 246.94]
    const root = roots[v % roots.length]
    const isMinor = v % 3 === 0
    const intervals = isMinor ? [1, 1.189, 1.498] : [1, 1.260, 1.498]
    const masterGain = off.createGain()
    masterGain.gain.setValueAtTime(0, 0)
    masterGain.gain.linearRampToValueAtTime(0.45, 0.08)
    masterGain.gain.setValueAtTime(0.45, dur - 0.3)
    masterGain.gain.linearRampToValueAtTime(0, dur)
    masterGain.connect(off.destination)
    const filt = off.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 2000
    filt.connect(masterGain)
    intervals.forEach((r) => {
      const o = off.createOscillator(); o.type = 'sawtooth'
      o.frequency.value = root * r
      const g = off.createGain(); g.gain.value = 0.4
      o.connect(g); g.connect(filt)
      o.start(0); o.stop(dur)
    })
    return off.startRendering()
  }
}

// Map SoundCategory to a synth fallback type
const CATEGORY_SYNTH_MAP: Partial<Record<SoundCategory, SynthPadType>> = {
  kick:        'synth_kick',
  snare:       'synth_snare',
  hihat:       'synth_hat',
  drum:        'synth_snare',
  bass:        'synth_bass',
  long:        'synth_pad',
  medium:      'synth_pad',
  short:       'synth_hit',
  fill:        'synth_perc',    // fills are ensemble percussion, NOT static noise hits
  percussion:  'synth_perc',
  chord:       'synth_chord',
  instrument:  'synth_chord',   // instruments use chord-like tonal synth
  vocal:       'synth_pad',
}

// Generate a complete 32-sound kit for a preset using explicit per-preset blueprints
async function generatePresetSoundKit(
  preset: PresetName,
  ctx: AudioContext,
  onProgress?: (loaded: number, total: number) => void,
  forceRefresh: boolean = false,
  isReroll: boolean = false
): Promise<PresetSoundKit> {
  const blueprint = FULL_PRESET_BLUEPRINTS[preset]
  const samples = new Map<number, FreesoundSample>()
  let loadedCount = 0
  const totalPads = 32
  const globalUsedIds = new Set<number>()
  const { pageOffset, resultOffset } = blueprint
  // Track which padIdx→category for synth fallback
  const padCategoryMap = new Map<number, SoundCategory>()

  // Load a single pad: try explicit query, then fallback queries
  async function loadPad(
    padIdx: number,
    explicitQuery: string,
    durationFilter: string,
    category: SoundCategory,
    queryVariant: number
  ): Promise<void> {
    padCategoryMap.set(padIdx, category)
    // Use pageOffset to get different pages across presets (pages 1-5)
    const page = 1 + (pageOffset % 5)
    // Try rated results first, then downloads, then score
    const sortOrders = ['rating_desc', 'downloads_desc', 'score']

    let chosen: FreesoundSample | null = null

    for (const sortBy of sortOrders) {
      if (chosen) break
      const results = await fetchFreesoundSamples(explicitQuery, durationFilter, 12, page, sortBy)
      // Rotate pick index per preset so different presets get different results
      const startIdx = (resultOffset + queryVariant) % Math.max(1, results.length)
      for (let tries = 0; tries < results.length; tries++) {
        const idx = (startIdx + tries) % results.length
        const s = results[idx]
        if (!globalUsedIds.has(s.id)) { chosen = s; break }
      }
    }

    // Fallback to generic category query if specific query yielded nothing
    if (!chosen) {
      const fallbacks = FALLBACK_QUERIES[category] ?? ['audio sample']
      for (const fb of fallbacks) {
        if (chosen) break
        const fbResults = await fetchFreesoundSamples(fb, durationFilter, 8, 1, 'rating_desc')
        for (const s of fbResults) {
          if (!globalUsedIds.has(s.id)) { chosen = s; break }
        }
      }
    }

    if (chosen) globalUsedIds.add(chosen.id)

    if (chosen?.previewUrl) {
      try {
        const raw = await loadAndCacheAudio(chosen.previewUrl, ctx)
        if (raw) {
          const refined = await refineAudioBuffer(raw, ctx, category, isReroll)
          // Accept any refined buffer >= 30ms; let synth fallback handle the rest
          if (refined.duration >= 0.03) {
            chosen.audioBuffer = refined
            samples.set(padIdx, chosen)
          }
        }
      } catch (err) {
        console.warn('[freesound] refine error pad', padIdx, err)
      }
    }
    loadedCount++
    onProgress?.(loadedCount, totalPads)
  }

  // Dispatch all 32 pads in parallel using blueprint queries
  const tasks: Promise<void>[] = []
  for (const slot of BLUEPRINT_SLOT_MAP) {
    const keyQueries = (blueprint[slot.key] as readonly string[])
    slot.padIds.forEach((padIdx, i) => {
      const query = keyQueries[i % keyQueries.length]
      tasks.push(loadPad(padIdx, query, slot.durationFilter, slot.category, i))
    })
  }
  await Promise.all(tasks)

  // GUARANTEED FALLBACK: every empty pad gets a synthesized sound. 32/32 always.
  const presetIndex = Math.max(0, PRESETS.indexOf(preset))
  for (const slot of BLUEPRINT_SLOT_MAP) {
    for (let i = 0; i < slot.padIds.length; i++) {
      const padIdx = slot.padIds[i]
      if (samples.has(padIdx)) continue
      try {
        const buf = await catalogSynth(presetIndex, i, slot.category)
        samples.set(padIdx, {
          id: -(presetIndex * 100 + padIdx + 1),
          name: `Catalog ${slot.category} p${presetIndex}i${i}`,
          previewUrl: '',
          audioBuffer: buf,
        })
      } catch (e) {
        console.warn('[synth fallback] failed for pad', padIdx, e)
      }
    }
  }

  return { preset, samples, loadedAt: Date.now() }
}

// Check if we have cached metadata for a preset
function getCachedPresetMetadata(preset: PresetName): PresetSoundKit | null {
  try {
    const key = `${MANIFEST_PREFIX}${preset}`
    const stored = localStorage.getItem(key)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Check if cache is less than 24 hours old
      if (Date.now() - parsed.loadedAt < 24 * 60 * 60 * 1000) {
        return {
          preset: parsed.preset,
          samples: new Map(Object.entries(parsed.samples).map(([k, v]) => [parseInt(k), v as FreesoundSample])),
          loadedAt: parsed.loadedAt,
        }
      }
    }
  } catch (e) {
    console.warn('[v0] Cache read error:', e)
  }
  return null
}

// Save preset metadata to localStorage (audio buffers loaded separately via Cache API)
function savePresetMetadata(kit: PresetSoundKit): void {
  try {
    const key = `${MANIFEST_PREFIX}${kit.preset}`
    const serializable = {
      preset: kit.preset,
      samples: Object.fromEntries(
        Array.from(kit.samples.entries()).map(([k, v]) => [k, { id: v.id, name: v.name, previewUrl: v.previewUrl }])
      ),
      loadedAt: kit.loadedAt,
    }
    localStorage.setItem(key, JSON.stringify(serializable))
  } catch (e) {
    console.warn('[v0] Cache write error:', e)
  }
}

// Wipe a preset's manifest + cached audio so the next load re-rolls fresh sounds.
async function clearPresetCache(preset: PresetName): Promise<void> {
  try {
    localStorage.removeItem(`${MANIFEST_PREFIX}${preset}`)
    // Optional: also evict the cached MP3 blobs so the new kit can't reuse them.
    if (typeof caches !== 'undefined') {
      const cache = await caches.open(CACHE_NAME)
      const keys = await cache.keys()
      // We can't easily know which URLs belonged to this preset without the manifest;
      // safest behaviour is to leave other presets' cached blobs intact.
      void keys // no-op; kept for clarity
    }
  } catch (e) {
    console.warn('[freesound] clearPresetCache error', e)
  }
}

// === Enhanced PadSettings type with advanced synth controls ===
type AdvancedSynthSettings = {
  waveform: 'sine' | 'square' | 'sawtooth' | 'triangle'
  attackCurve: 'linear' | 'exponential' | 'logarithmic'
  decayCurve: 'linear' | 'exponential' | 'logarithmic'
  harmonics: number // 0-1 adds harmonic overtones
  filterCutoff: number // Hz
  filterResonance: number // 0-1
  lfoRate: number // Hz
  lfoDepth: number // 0-1
  lfoTarget: 'pitch' | 'filter' | 'amplitude'
}
const DEFAULT_ADVANCED_SYNTH: AdvancedSynthSettings = {
  waveform: 'sawtooth',
  attackCurve: 'exponential',
  decayCurve: 'exponential',
  harmonics: 0.3,
  filterCutoff: 2000,
  filterResonance: 0.3,
  lfoRate: 4,
  lfoDepth: 0,
  lfoTarget: 'pitch',
}
// === Graphical ADSR Envelope Editor (draggable handles) + Advanced Waveform Controls ===
function AdsrGraphEditor({ 
  adsr, 
  onChange,
  advanced,
  onAdvancedChange
}: { 
  adsr?: { a: number; d: number; s: number; r: number }
  onChange: (v: { a: number; d: number; s: number; r: number }) => void
  advanced?: AdvancedSynthSettings
  onAdvancedChange?: (v: AdvancedSynthSettings) => void
}) {
  const safe = adsr || { a: 0.02, d: 0.2, s: 0.7, r: 0.4 }
  const adv = advanced || DEFAULT_ADVANCED_SYNTH
  const svgRef = React.useRef<SVGSVGElement | null>(null)
  const W = 280, H = 90, PAD = 6
  const innerW = W - PAD * 2
  const innerH = H - PAD * 2
  const maxT = 1 + 1 + 2
  const aSeg = (safe.a / maxT) * innerW
  const dSeg = (safe.d / maxT) * innerW
  const rSeg = (safe.r / maxT) * innerW
  const sustainW = Math.max(20, innerW - aSeg - dSeg - rSeg)
  const x0 = PAD
  const xA = x0 + aSeg
  const xD = xA + dSeg
  const xS = xD + sustainW
  const xR = xS + rSeg
  const yBase = H - PAD
  const yPeak = PAD
  const ySustain = PAD + (1 - safe.s) * innerH
  const [drag, setDrag] = React.useState<null | 'A' | 'D' | 'S' | 'R'>(null)
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  React.useEffect(() => {
    if (!drag) return
    const onMove = (e: MouseEvent) => {
      const svg = svgRef.current; if (!svg) return
      const r = svg.getBoundingClientRect()
      const px = ((e.clientX - r.left) / r.width) * W
      const py = ((e.clientY - r.top) / r.height) * H
      const tFromPx = (delta: number) => Math.max(0, Math.min(2, (delta / innerW) * maxT))
      if (drag === 'A') onChange({ ...safe, a: Math.min(1, tFromPx(px - x0)) })
      else if (drag === 'D') onChange({ ...safe, d: Math.min(1, tFromPx(px - xA)) })
      else if (drag === 'S') onChange({ ...safe, s: Math.max(0, Math.min(1, 1 - (py - PAD) / innerH)) })
      else if (drag === 'R') onChange({ ...safe, r: tFromPx(px - xS) })
    }
    const onUp = () => setDrag(null)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [drag, safe, xA, xS, innerW, innerH, onChange, x0])
  // Create curved path based on attack/decay curve settings
  const getCurvePath = () => {
    const attackMid = adv.attackCurve === 'exponential' ? 0.7 : adv.attackCurve === 'logarithmic' ? 0.3 : 0.5
    const decayMid = adv.decayCurve === 'exponential' ? 0.7 : adv.decayCurve === 'logarithmic' ? 0.3 : 0.5
    const aMidX = x0 + aSeg * attackMid
    const aMidY = yBase - (yBase - yPeak) * (1 - attackMid * 0.5)
    const dMidX = xA + dSeg * decayMid
    const dMidY = yPeak + (ySustain - yPeak) * decayMid * 0.8
    return `M ${x0} ${yBase} Q ${aMidX} ${aMidY} ${xA} ${yPeak} Q ${dMidX} ${dMidY} ${xD} ${ySustain} L ${xS} ${ySustain} L ${xR} ${yBase}`
  }
  const path = getCurvePath()
  // Mini waveform preview
  const wavePreview = () => {
    const points: string[] = []
    const waveW = 40, waveH = 16, waveY = 10
    for (let i = 0; i <= waveW; i++) {
      const x = i
      const t = (i / waveW) * Math.PI * 2 * 2
      let y = 0
      switch (adv.waveform) {
        case 'sine': y = Math.sin(t); break
        case 'square': y = Math.sin(t) > 0 ? 1 : -1; break
        case 'sawtooth': y = ((t / Math.PI) % 2) - 1; break
        case 'triangle': y = Math.abs(((t / Math.PI) % 2) - 1) * 2 - 1; break
      }
      // Add harmonics
      if (adv.harmonics > 0) {
        y += Math.sin(t * 2) * adv.harmonics * 0.5
        y += Math.sin(t * 3) * adv.harmonics * 0.3
      }
      y = Math.max(-1, Math.min(1, y))
      points.push(`${x},${waveY + y * (waveH / 2) * -1 + waveH / 2}`)
    }
    return points.join(' ')
  }
  return (
    <div className="space-y-2">
      <label className="text-xs text-slate-400 mb-1 flex justify-between items-center">
        <span>ADSR Envelope (drag handles)</span>
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-[10px] text-indigo-400 hover:text-indigo-300 underline"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced
        </button>
      </label>
      <div className="flex gap-2 items-start">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="flex-1 bg-slate-950 rounded-lg border border-slate-800 select-none" style={{ touchAction: 'none' }}>
          <defs>
            <linearGradient id="adsrFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <path d={`${path} L ${xR} ${yBase} Z`} fill="url(#adsrFill)" />
          <path d={path} stroke="#34d399" strokeWidth={2} fill="none" filter="url(#glow)" />
          {[
            { id: 'A' as const, x: xA, y: yPeak },
            { id: 'D' as const, x: xD, y: ySustain },
            { id: 'S' as const, x: xS, y: ySustain },
            { id: 'R' as const, x: xR, y: yBase },
          ].map((h) => (
            <g key={h.id} onMouseDown={(e) => { e.preventDefault(); setDrag(h.id) }} style={{ cursor: 'grab' }}>
              <circle cx={h.x} cy={h.y} r={7} fill="#0f172a" stroke="#34d399" strokeWidth={2} />
              <text x={h.x} y={h.y + 3} textAnchor="middle" fontSize="8" fill="#e2e8f0">{h.id}</text>
            </g>
          ))}
        </svg>
        {/* Mini waveform display */}
        <div className="w-12 h-[90px] bg-slate-950 rounded border border-slate-800 flex flex-col items-center justify-center p-1">
          <svg viewBox="0 0 40 32" className="w-full h-8">
            <polyline points={wavePreview()} fill="none" stroke="#818cf8" strokeWidth="1.5" />
          </svg>
          <span className="text-[8px] text-slate-500 uppercase mt-1">{adv.waveform}</span>
        </div>
      </div>
      <div className="text-[10px] text-slate-500 flex justify-between px-1">
        <span>A {safe.a.toFixed(2)}s</span>
        <span>D {safe.d.toFixed(2)}s</span>
        <span>S {(safe.s * 100).toFixed(0)}%</span>
        <span>R {safe.r.toFixed(2)}s</span>
      </div>
      {/* Advanced Controls */}
      {showAdvanced && onAdvancedChange && (
        <div className="bg-slate-950 rounded-lg border border-slate-800 p-2 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {/* Waveform */}
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Waveform</label>
              <select 
                value={adv.waveform} 
                onChange={(e) => onAdvancedChange({ ...adv, waveform: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-[10px] text-slate-200"
              >
                <option value="sine">Sine</option>
                <option value="square">Square</option>
                <option value="sawtooth">Sawtooth</option>
                <option value="triangle">Triangle</option>
              </select>
            </div>
            {/* Attack Curve */}
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Attack Curve</label>
              <select 
                value={adv.attackCurve} 
                onChange={(e) => onAdvancedChange({ ...adv, attackCurve: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-[10px] text-slate-200"
              >
                <option value="linear">Linear</option>
                <option value="exponential">Exponential</option>
                <option value="logarithmic">Logarithmic</option>
              </select>
            </div>
            {/* Decay Curve */}
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Decay Curve</label>
              <select 
                value={adv.decayCurve} 
                onChange={(e) => onAdvancedChange({ ...adv, decayCurve: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-[10px] text-slate-200"
              >
                <option value="linear">Linear</option>
                <option value="exponential">Exponential</option>
                <option value="logarithmic">Logarithmic</option>
              </select>
            </div>
            {/* LFO Target */}
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">LFO Target</label>
              <select 
                value={adv.lfoTarget} 
                onChange={(e) => onAdvancedChange({ ...adv, lfoTarget: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-[10px] text-slate-200"
              >
                <option value="pitch">Pitch</option>
                <option value="filter">Filter</option>
                <option value="amplitude">Amplitude</option>
              </select>
            </div>
          </div>
          {/* Sliders */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-slate-500 w-16">Harmonics</span>
              <input type="range" min={0} max={1} step={0.01} value={adv.harmonics} 
                onChange={(e) => onAdvancedChange({ ...adv, harmonics: Number(e.target.value) })}
                className="flex-1 h-1 accent-indigo-500" />
              <span className="text-[9px] text-slate-400 w-8">{(adv.harmonics * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-slate-500 w-16">Filter Cutoff</span>
              <input type="range" min={100} max={8000} step={10} value={adv.filterCutoff} 
                onChange={(e) => onAdvancedChange({ ...adv, filterCutoff: Number(e.target.value) })}
                className="flex-1 h-1 accent-cyan-500" />
              <span className="text-[9px] text-slate-400 w-8">{adv.filterCutoff}Hz</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-slate-500 w-16">Filter Res</span>
              <input type="range" min={0} max={1} step={0.01} value={adv.filterResonance} 
                onChange={(e) => onAdvancedChange({ ...adv, filterResonance: Number(e.target.value) })}
                className="flex-1 h-1 accent-cyan-500" />
              <span className="text-[9px] text-slate-400 w-8">{(adv.filterResonance * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-slate-500 w-16">LFO Rate</span>
              <input type="range" min={0.1} max={20} step={0.1} value={adv.lfoRate} 
                onChange={(e) => onAdvancedChange({ ...adv, lfoRate: Number(e.target.value) })}
                className="flex-1 h-1 accent-amber-500" />
              <span className="text-[9px] text-slate-400 w-8">{adv.lfoRate.toFixed(1)}Hz</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-slate-500 w-16">LFO Depth</span>
              <input type="range" min={0} max={1} step={0.01} value={adv.lfoDepth} 
                onChange={(e) => onAdvancedChange({ ...adv, lfoDepth: Number(e.target.value) })}
                className="flex-1 h-1 accent-amber-500" />
              <span className="text-[9px] text-slate-400 w-8">{(adv.lfoDepth * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const generateSoundBank = (): SoundDef[] => {
  const bank: SoundDef[] = []
  let idCounter = 0
  const add = (
    cat: SoundCategory,
    label: string,
    count: number,
    stretchable = false,
  ) => {
    for (let i = 0; i < count; i++) {
      bank.push({
        id: `s_${idCounter++}`,
        label: `${label}${i + 1}`,
        category: cat,
        color: CATEGORY_COLORS[cat],
        stretchable,
      })
    }
  }
  // All long/med/short/chord/vocal/bass/instrument stretchable per spec
  add('long', 'Lng', 3, true)
  add('medium', 'Med', 3, true)
  add('short', 'Sht', 3, true)
  add('chord', 'Chd', 3, true)
  add('snare', 'Snr', 2)
  add('drum', 'Drm', 2)
  add('kick', 'Kck', 2)
  add('bass', 'Bss', 2, true)
  add('hihat', 'Hat', 2)
  add('fill', 'Fil', 2)
  add('percussion', 'Prc', 2)
  add('vocal', 'Voc', 2, true)
  add('instrument', 'Inst', 4, true)
  return bank
}
const SOUND_BANK = generateSoundBank()
const DEFAULT_PAD_SETTINGS: PadSettings = {
  volume: 1,
  pan: 0,
  pitch: 0,
  octave: 0,
  detune: 0,
  preservesPitch: true,
  adsr: {
    a: 0.01,
    d: 0.3,
    s: 0.5,
    r: 0.5,
  },
  fx: [],
}
// --- AUDIO ENGINE ---
type EffectName =
  | 'Reverb'
  | 'Delay'
  | 'Distortion'
  | 'Filter'
  | 'Flanger'
  | 'Phaser'
  | 'Echo'
  | 'Chorus'
  | 'Bitcrush'
  | 'Tremolo'
class AudioEngine {
  ctx: AudioContext | null = null
  masterGain: GainNode | null = null
  masterFilter: BiquadFilterNode | null = null
  preMaster: GainNode | null = null
  reverbNode: ConvolverNode | null = null
  delayNode: DelayNode | null = null
  distortionCurve: Float32Array | null = null
  dest: MediaStreamAudioDestinationNode | null = null
  recorder: MediaRecorder | null = null
  recordedChunks: Blob[] = []
  noiseBuffer: AudioBuffer | null = null
  customBuffers: Map<string, AudioBuffer> = new Map()
  rawProcessor: ScriptProcessorNode | null = null
  rawChunksL: Float32Array[] = []
  rawChunksR: Float32Array[] = []
  rawSampleRate = 44100
  isRawRecording = false
  // mastering chain
  compressor: DynamicsCompressorNode | null = null
  limiter: DynamicsCompressorNode | null = null
  autoMasterOn = false
  // whole-track effects bus (Reverb/Delay/etc applied to all output)
  wholeTrackEffects: Set<EffectName> = new Set()
  // Freesound loaded buffers per preset
  presetBuffers: Map<string, Map<number, AudioBuffer>> = new Map()
  // Active sources for polyphonic playback management
  activeSources: Map<string, AudioBufferSourceNode[]> = new Map()
  // Flanger and Chorus nodes
  flangerDelay: DelayNode | null = null
  flangerFeedback: GainNode | null = null
  flangerLFO: OscillatorNode | null = null
  chorusDelay: DelayNode | null = null
  init() {
    if (this.ctx) return
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    this.masterGain = this.ctx.createGain()
    this.masterFilter = this.ctx.createBiquadFilter()
    this.masterFilter.type = 'allpass'
    this.masterFilter.frequency.value = 1000
    this.masterGain.connect(this.masterFilter)
    // FX Setup
    this.reverbNode = this.ctx.createConvolver()
    this.createReverbImpulse()
    this.delayNode = this.ctx.createDelay()
    this.delayNode.delayTime.value = 0.25
    const feedback = this.ctx.createGain()
    feedback.gain.value = 0.4
    this.delayNode.connect(feedback)
    feedback.connect(this.delayNode)
    this.createDistortionCurve()
    // Flanger
    this.flangerDelay = this.ctx.createDelay(0.05)
    this.flangerDelay.delayTime.value = 0.003
    const flangerFB = this.ctx.createGain()
    flangerFB.gain.value = 0.7
    this.flangerDelay.connect(flangerFB)
    flangerFB.connect(this.flangerDelay)
    this.flangerFeedback = flangerFB
    const flangerLFO = this.ctx.createOscillator()
    const flangerDepth = this.ctx.createGain()
    flangerLFO.frequency.value = 0.25
    flangerDepth.gain.value = 0.002
    flangerLFO.connect(flangerDepth)
    flangerDepth.connect(this.flangerDelay.delayTime)
    flangerLFO.start()
    this.flangerLFO = flangerLFO
    // Chorus
    this.chorusDelay = this.ctx.createDelay(0.05)
    this.chorusDelay.delayTime.value = 0.03
    const chorusLFO = this.ctx.createOscillator()
    const chorusDepth = this.ctx.createGain()
    chorusLFO.frequency.value = 1.5
    chorusDepth.gain.value = 0.008
    chorusLFO.connect(chorusDepth)
    chorusDepth.connect(this.chorusDelay.delayTime)
    chorusLFO.start()
    // Compressor (auto-master) + brick-wall limiter to prevent clipping
    this.compressor = this.ctx.createDynamicsCompressor()
    this.compressor.threshold.value = -24
    this.compressor.knee.value = 12
    this.compressor.ratio.value = 2
    this.compressor.attack.value = 0.01
    this.compressor.release.value = 0.2
    this.limiter = this.ctx.createDynamicsCompressor()
    this.limiter.threshold.value = -1
    this.limiter.knee.value = 0
    this.limiter.ratio.value = 20
    this.limiter.attack.value = 0.001
    this.limiter.release.value = 0.05
    // master chain: masterFilter -> compressor -> limiter -> destination
    this.masterFilter.connect(this.compressor)
    this.compressor.connect(this.limiter)
    this.limiter.connect(this.ctx.destination)
    this.dest = this.ctx.createMediaStreamDestination()
    this.limiter.connect(this.dest)
    this.createNoiseBuffer()
  }
  setAutoMaster(on: boolean) {
    this.autoMasterOn = on
    if (!this.compressor) return
    if (on) {
      this.compressor.threshold.value = -18
      this.compressor.ratio.value = 4
      this.compressor.knee.value = 18
    } else {
      this.compressor.threshold.value = -24
      this.compressor.ratio.value = 2
      this.compressor.knee.value = 12
    }
  }
  setWholeTrackEffect(name: EffectName, on: boolean) {
    if (on) this.wholeTrackEffects.add(name)
    else this.wholeTrackEffects.delete(name)
  }
  get voiceBus(): AudioNode | null { return this.masterGain }
  setMasterFilter(type: 'off' | 'lowpass' | 'highpass', freq: number) {
    if (!this.masterFilter) return
    this.masterFilter.type = type === 'off' ? 'allpass' : type
    this.masterFilter.frequency.value = freq
  }
  ensureRawTap() {
    if (!this.ctx || !this.masterGain || this.rawProcessor) return
    this.rawSampleRate = this.ctx.sampleRate
    const proc = this.ctx.createScriptProcessor(4096, 2, 2)
    proc.onaudioprocess = (e) => {
      if (!this.isRawRecording) return
      const l = e.inputBuffer.getChannelData(0)
      const r = e.inputBuffer.numberOfChannels > 1 ? e.inputBuffer.getChannelData(1) : l
      this.rawChunksL.push(new Float32Array(l))
      this.rawChunksR.push(new Float32Array(r))
    }
    // Tap: masterFilter -> proc -> silent gain (to satisfy graph) -> destination muted
    const silent = this.ctx.createGain()
    silent.gain.value = 0
    this.masterFilter!.connect(proc)
    proc.connect(silent)
    silent.connect(this.ctx.destination)
    this.rawProcessor = proc
  }
  startRawRecording() {
    this.ensureRawTap()
    this.rawChunksL = []
    this.rawChunksR = []
    this.isRawRecording = true
  }
  stopRawRecording(): { sampleRate: number; left: Float32Array; right: Float32Array } {
    this.isRawRecording = false
    const total = this.rawChunksL.reduce((a, c) => a + c.length, 0)
    const left = new Float32Array(total)
    const right = new Float32Array(total)
    let off = 0
    for (let i = 0; i < this.rawChunksL.length; i++) {
      left.set(this.rawChunksL[i], off)
      right.set(this.rawChunksR[i], off)
      off += this.rawChunksL[i].length
    }
    this.rawChunksL = []
    this.rawChunksR = []
    return { sampleRate: this.rawSampleRate, left, right }
  }
  playSample(bufferKey: string, time: number, velocity: number, padSettings: PadSettings) {
    if (!this.ctx || !this.masterGain) return
    const buf = this.customBuffers.get(bufferKey)
    if (!buf) return
    const src = this.ctx.createBufferSource()
    src.buffer = buf
    const playbackRate = Math.pow(2, ((padSettings.pitch + padSettings.octave * 12) / 12) + padSettings.detune / 1200)
    src.playbackRate.value = playbackRate
    src.preservesPitch = padSettings.preservesPitch ?? true
    const gain = this.ctx.createGain()
    const panner = this.ctx.createStereoPanner()
    panner.pan.value = padSettings.pan
    const velMult = (velocity === 1 ? 0.4 : velocity === 2 ? 0.7 : 1.0) * padSettings.volume
    gain.gain.value = velMult
    let last: AudioNode = gain
    if (padSettings.fx.includes('Filter')) {
      const f = this.ctx.createBiquadFilter()
      f.type = 'lowpass'; f.frequency.value = 1500
      last.connect(f); last = f
    }
    src.connect(gain)
    last.connect(panner)
    panner.connect(this.voiceBus!)
    if (padSettings.fx.includes('Reverb') && this.reverbNode) {
      panner.connect(this.reverbNode); this.reverbNode.connect(this.voiceBus!)
    }
    if (padSettings.fx.includes('Delay') && this.delayNode) {
      panner.connect(this.delayNode); this.delayNode.connect(this.voiceBus!)
    }
    src.start(time)
  }
  createNoiseBuffer() {
    if (!this.ctx) return
    const bufferSize = this.ctx.sampleRate * 2
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const output = this.noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }
  }
  createReverbImpulse() {
    if (!this.ctx || !this.reverbNode) return
    const rate = this.ctx.sampleRate
    const length = rate * 2
    const impulse = this.ctx.createBuffer(2, length, rate)
    for (let i = 0; i < 2; i++) {
      const channel = impulse.getChannelData(i)
      for (let j = 0; j < length; j++) {
        channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, 3)
      }
    }
    this.reverbNode.buffer = impulse
  }
  createDistortionCurve() {
    const n_samples = 44100
    const curve = new Float32Array(n_samples)
    const deg = Math.PI / 180
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1
      curve[i] = ((3 + 20) * x * 20 * deg) / (Math.PI + 20 * Math.abs(x))
    }
    this.distortionCurve = curve
  }
  setVolume(val: number) {
    if (this.masterGain) this.masterGain.gain.value = val
  }
  setAmbientMode(isAmbient: boolean) {
    if (!this.ctx || !this.masterGain || !this.reverbNode) return
    this.masterGain.disconnect()
    if (isAmbient) {
      this.masterGain.connect(this.reverbNode)
      this.reverbNode.connect(this.masterFilter!)
    } else {
      this.masterGain.connect(this.masterFilter!)
    }
  }
  startRecording() {
    if (!this.dest) return
    this.recordedChunks = []
    this.recorder = new MediaRecorder(this.dest.stream)
    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.recordedChunks.push(e.data)
    }
    this.recorder.start()
  }
  stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.recorder) return resolve(new Blob())
      this.recorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, {
          type: 'audio/webm',
        })
        resolve(blob)
      }
      this.recorder.stop()
    })
  }
  playSynth(
    sound: SoundDef,
    time: number,
    stepDuration: number,
    velocity: number,
    preset: PresetName,
    padSettings: PadSettings,
    isAmbient: boolean = false,
    chaosMods?: {
      pitch: number
      filter: number
      decay: number
    },
  ) {
    if (!this.ctx || !this.masterGain) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()
    const panner = this.ctx.createStereoPanner()
    // FX Chain
    let lastNode: AudioNode = gain
    if (padSettings.fx.includes('Distortion') && this.distortionCurve) {
      const dist = this.ctx.createWaveShaper()
      dist.curve = this.distortionCurve as any
      dist.oversample = '4x'
      lastNode.connect(dist)
      lastNode = dist
    }
    if (padSettings.fx.includes('Filter')) {
      const fxFilter = this.ctx.createBiquadFilter()
      fxFilter.type = 'lowpass'
      fxFilter.frequency.value = 1000
      lastNode.connect(fxFilter)
      lastNode = fxFilter
    }
    if (padSettings.fx.includes('Phaser')) {
      const ap1 = this.ctx.createBiquadFilter()
      const ap2 = this.ctx.createBiquadFilter()
      ap1.type = 'allpass'; ap1.frequency.value = 350; ap1.Q.value = 5
      ap2.type = 'allpass'; ap2.frequency.value = 800; ap2.Q.value = 5
      lastNode.connect(ap1); ap1.connect(ap2)
      lastNode = ap2
    }
    if (padSettings.fx.includes('Bitcrush')) {
      const bc = this.ctx.createWaveShaper()
      const steps = 8
      const bcCurve = new Float32Array(256)
      for (let i = 0; i < 256; i++) {
        const x = (i / 128) - 1
        bcCurve[i] = Math.round(x * steps) / steps
      }
      bc.curve = bcCurve
      lastNode.connect(bc)
      lastNode = bc
    }
    if (padSettings.fx.includes('Tremolo')) {
      const tremoloGain = this.ctx.createGain()
      const tremoloLFO = this.ctx.createOscillator()
      const tremoloDepth = this.ctx.createGain()
      tremoloLFO.frequency.value = 4
      tremoloDepth.gain.value = 0.4
      tremoloLFO.connect(tremoloDepth)
      tremoloDepth.connect(tremoloGain.gain)
      tremoloGain.gain.value = 0.6
      tremoloLFO.start()
      lastNode.connect(tremoloGain)
      lastNode = tremoloGain
    }
    lastNode.connect(panner)
    panner.connect(this.masterGain)
    // Sends
    if (padSettings.fx.includes('Reverb') && this.reverbNode) {
      panner.connect(this.reverbNode)
      this.reverbNode.connect(this.masterGain)
    }
    if (padSettings.fx.includes('Delay') && this.delayNode) {
      panner.connect(this.delayNode)
      this.delayNode.connect(this.masterGain)
    }
    if (padSettings.fx.includes('Flanger') && this.flangerDelay) {
      panner.connect(this.flangerDelay)
      this.flangerDelay.connect(this.masterGain)
    }
    if (padSettings.fx.includes('Chorus') && this.chorusDelay) {
      panner.connect(this.chorusDelay)
      this.chorusDelay.connect(this.masterGain)
    }
    if (padSettings.fx.includes('Echo') && this.delayNode) {
      panner.connect(this.delayNode)
      this.delayNode.connect(this.masterGain)
    }
    filter.connect(gain)
    panner.pan.value = padSettings.pan
    const velMult =
      (velocity === 1 ? 0.4 : velocity === 2 ? 0.7 : 1.0) *
      padSettings.volume *
      (isAmbient ? 0.8 : 1)
    const t = time
    // Natural durations
    let d = stepDuration
    if (!sound.stretchable) {
      switch (sound.category) {
        case 'kick':
          d = 0.6
          break
        case 'snare':
          d = 0.4
          break
        case 'hihat':
          d = sound.label.includes('2') ? 0.3 : 0.1
          break
        case 'bass':
          d = 0.8
          break
        case 'long':
          d = 2.5
          break
        case 'medium':
          d = 1.0
          break
        case 'short':
          d = 0.2
          break
        case 'fill':
          d = 1.5
          break
        case 'percussion':
          d = 0.3
          break
        case 'instrument':
          d = 1.0
          break
      }
    }
    if (isAmbient) d *= 2
    if (chaosMods) d *= chaosMods.decay
    // ADSR
    const { a, d: decay, s, r } = padSettings.adsr
    const attackTime = t + a
    const decayTime = attackTime + decay
    const releaseTime = t + d
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(velMult, attackTime)
    gain.gain.linearRampToValueAtTime(velMult * s, decayTime)
    gain.gain.setValueAtTime(velMult * s, releaseTime)
    gain.gain.linearRampToValueAtTime(0.001, releaseTime + r)
    // Preset Modifiers
    let pMult = 1
    let fMult = 1
    let wave: OscillatorType = 'square'
    // Variant index (sound.label ends with 1/2/3/4) — used to differentiate sounds within a category
    const variantIdx = Math.max(0, parseInt(sound.label.replace(/^\D+/, ''), 10) - 1) || 0
    switch (preset) {
      case 'Dubstep Club': pMult = 0.5; fMult = 2.0; wave = 'sawtooth'; break
      case 'Trap Soul': pMult = 0.8; fMult = 1.5; wave = 'sine'; break
      case 'House Pulse': pMult = 1.0; fMult = 1.2; wave = 'square'; break
      case 'Lo-Fi Tape': pMult = 0.9; fMult = 0.5; wave = 'sine'; break
      case 'Techno': pMult = 1.0; fMult = 3.0; wave = 'sawtooth'; break
      case 'Drum&Bass': pMult = 1.5; fMult = 2.5; wave = 'square'; break
      case 'Ambient': pMult = 0.8; fMult = 0.4; wave = 'sine'; break
      case 'Industrial': pMult = 0.6; fMult = 4.0; wave = 'sawtooth'; break
      case 'Latin': pMult = 1.2; fMult = 1.5; wave = 'triangle'; break
      case 'Jazz': pMult = 1.0; fMult = 0.8; wave = 'sine'; break
      case 'Funk': pMult = 1.1; fMult = 1.8; wave = 'triangle'; break
      case 'K-Pop': pMult = 1.3; fMult = 2.0; wave = 'square'; break
      case 'Phonk': pMult = 0.7; fMult = 1.0; wave = 'sawtooth'; break
      case 'Hardstyle': pMult = 1.0; fMult = 5.0; wave = 'sawtooth'; break
      case 'Cinematic': pMult = 0.5; fMult = 0.6; wave = 'sine'; break
      // ---- NEW PRESETS ----
      case '432Hz Heal':
        // Tune to A=432: scale baseline 440->432
        pMult = 432 / 440; fMult = 0.7; wave = 'sine'; break
      case 'SoundFX Goofy': pMult = 1.4 + variantIdx * 0.2; fMult = 2.8; wave = 'square'; break
      case '1930s Vintage': pMult = 1.0; fMult = 0.35; wave = 'triangle'; break
      case 'Nature Sounds': pMult = 0.6; fMult = 0.9; wave = 'sine'; break
      case 'Chiptune 8-bit': pMult = 1.2; fMult = 2.5; wave = 'square'; break
      case 'Vaporwave': pMult = 0.75; fMult = 0.6; wave = 'sine'; break
      case 'Tribal Drums': pMult = 0.9; fMult = 1.7; wave = 'triangle'; break
      case 'Bossa Nova': pMult = 1.05; fMult = 1.1; wave = 'triangle'; break
      case 'Synthwave 80s': pMult = 0.95; fMult = 1.6; wave = 'sawtooth'; break
      case 'Grime UK': pMult = 1.15; fMult = 2.2; wave = 'square'; break
      case 'Reggaeton': pMult = 0.9; fMult = 1.3; wave = 'triangle'; break
      case 'Math Rock': pMult = 1.0; fMult = 2.0; wave = 'sawtooth'; break
    }
    // Per-preset drum kit variation table (kick/snare/hihat overrides)
    type DrumKit = {
      kickFreq: number; kickEndF: number; kickWave: OscillatorType
      snareNoiseF: number; snareToneF: number; snareWave: OscillatorType
      hatNoiseF: number; hatBandwidth: 'highpass' | 'bandpass'
    }
    const kits: Partial<Record<PresetName, DrumKit>> = {
      'Dubstep Club':   { kickFreq: 180, kickEndF: 30, kickWave: 'sine',     snareNoiseF: 1200, snareToneF: 220, snareWave: 'triangle', hatNoiseF: 6000, hatBandwidth: 'highpass' },
      'Trap Soul':      { kickFreq: 130, kickEndF: 35, kickWave: 'sine',     snareNoiseF: 1800, snareToneF: 180, snareWave: 'sine',     hatNoiseF: 8000, hatBandwidth: 'highpass' },
      'House Pulse':    { kickFreq: 160, kickEndF: 50, kickWave: 'sine',     snareNoiseF: 1000, snareToneF: 200, snareWave: 'triangle', hatNoiseF: 7000, hatBandwidth: 'highpass' },
      'Lo-Fi Tape':     { kickFreq: 110, kickEndF: 45, kickWave: 'sine',     snareNoiseF: 800,  snareToneF: 180, snareWave: 'sine',     hatNoiseF: 4500, hatBandwidth: 'bandpass' },
      'Techno':         { kickFreq: 170, kickEndF: 40, kickWave: 'sine',     snareNoiseF: 1500, snareToneF: 240, snareWave: 'square',   hatNoiseF: 9000, hatBandwidth: 'highpass' },
      'Drum&Bass':      { kickFreq: 200, kickEndF: 45, kickWave: 'sine',     snareNoiseF: 2400, snareToneF: 260, snareWave: 'triangle', hatNoiseF: 9500, hatBandwidth: 'highpass' },
      'Ambient':        { kickFreq: 90,  kickEndF: 30, kickWave: 'sine',     snareNoiseF: 600,  snareToneF: 150, snareWave: 'sine',     hatNoiseF: 3500, hatBandwidth: 'bandpass' },
      'Industrial':     { kickFreq: 220, kickEndF: 60, kickWave: 'square',   snareNoiseF: 2800, snareToneF: 300, snareWave: 'square',   hatNoiseF: 11000, hatBandwidth: 'highpass' },
      'Latin':          { kickFreq: 140, kickEndF: 55, kickWave: 'sine',     snareNoiseF: 1400, snareToneF: 260, snareWave: 'triangle', hatNoiseF: 7500, hatBandwidth: 'bandpass' },
      'Jazz':           { kickFreq: 100, kickEndF: 40, kickWave: 'sine',     snareNoiseF: 1100, snareToneF: 200, snareWave: 'triangle', hatNoiseF: 6500, hatBandwidth: 'bandpass' },
      'Funk':           { kickFreq: 150, kickEndF: 50, kickWave: 'sine',     snareNoiseF: 1300, snareToneF: 220, snareWave: 'triangle', hatNoiseF: 7000, hatBandwidth: 'highpass' },
      'K-Pop':          { kickFreq: 170, kickEndF: 50, kickWave: 'sine',     snareNoiseF: 1700, snareToneF: 250, snareWave: 'triangle', hatNoiseF: 8500, hatBandwidth: 'highpass' },
      'Phonk':          { kickFreq: 130, kickEndF: 30, kickWave: 'sine',     snareNoiseF: 1500, snareToneF: 190, snareWave: 'triangle', hatNoiseF: 6000, hatBandwidth: 'highpass' },
      'Hardstyle':      { kickFreq: 240, kickEndF: 70, kickWave: 'sawtooth', snareNoiseF: 2200, snareToneF: 280, snareWave: 'square',   hatNoiseF: 10000, hatBandwidth: 'highpass' },
      'Cinematic':      { kickFreq: 80,  kickEndF: 30, kickWave: 'sine',     snareNoiseF: 700,  snareToneF: 160, snareWave: 'sine',     hatNoiseF: 4000, hatBandwidth: 'bandpass' },
      '432Hz Heal':     { kickFreq: 108, kickEndF: 32, kickWave: 'sine',     snareNoiseF: 432,  snareToneF: 216, snareWave: 'sine',     hatNoiseF: 4320, hatBandwidth: 'bandpass' },
      'SoundFX Goofy':  { kickFreq: 300, kickEndF: 80, kickWave: 'square',   snareNoiseF: 2500, snareToneF: 440, snareWave: 'square',   hatNoiseF: 12000, hatBandwidth: 'highpass' },
      '1930s Vintage':  { kickFreq: 95,  kickEndF: 38, kickWave: 'triangle', snareNoiseF: 700,  snareToneF: 180, snareWave: 'triangle', hatNoiseF: 3800, hatBandwidth: 'bandpass' },
      'Nature Sounds':  { kickFreq: 70,  kickEndF: 28, kickWave: 'sine',     snareNoiseF: 500,  snareToneF: 140, snareWave: 'sine',     hatNoiseF: 3000, hatBandwidth: 'bandpass' },
      'Chiptune 8-bit': { kickFreq: 200, kickEndF: 60, kickWave: 'square',   snareNoiseF: 2000, snareToneF: 320, snareWave: 'square',   hatNoiseF: 10500, hatBandwidth: 'highpass' },
      'Vaporwave':      { kickFreq: 115, kickEndF: 35, kickWave: 'sine',     snareNoiseF: 850,  snareToneF: 175, snareWave: 'sine',     hatNoiseF: 5000, hatBandwidth: 'bandpass' },
      'Tribal Drums':   { kickFreq: 125, kickEndF: 60, kickWave: 'sine',     snareNoiseF: 900,  snareToneF: 210, snareWave: 'triangle', hatNoiseF: 5500, hatBandwidth: 'bandpass' },
      'Bossa Nova':     { kickFreq: 110, kickEndF: 45, kickWave: 'sine',     snareNoiseF: 1200, snareToneF: 200, snareWave: 'triangle', hatNoiseF: 6500, hatBandwidth: 'bandpass' },
      'Synthwave 80s':  { kickFreq: 155, kickEndF: 42, kickWave: 'sine',     snareNoiseF: 1600, snareToneF: 240, snareWave: 'triangle', hatNoiseF: 8000, hatBandwidth: 'highpass' },
      'Grime UK':       { kickFreq: 190, kickEndF: 55, kickWave: 'square',   snareNoiseF: 2100, snareToneF: 270, snareWave: 'square',   hatNoiseF: 9500, hatBandwidth: 'highpass' },
      'Reggaeton':      { kickFreq: 145, kickEndF: 50, kickWave: 'sine',     snareNoiseF: 1350, snareToneF: 230, snareWave: 'triangle', hatNoiseF: 7200, hatBandwidth: 'highpass' },
      'Math Rock':      { kickFreq: 165, kickEndF: 55, kickWave: 'sine',     snareNoiseF: 1500, snareToneF: 235, snareWave: 'triangle', hatNoiseF: 7800, hatBandwidth: 'highpass' },
    }
    const kit = kits[preset] || kits['House Pulse']!
    // Variant offsets: variant 2 detunes 7 semitones up, variant 3 a fifth, etc.
    const variantPitchOff = [0, 7, -5, 12][variantIdx % 4]
    const variantWaves: OscillatorType[] = ['sawtooth', 'square', 'triangle', 'sine']
    const variantWave = variantWaves[variantIdx % 4]
    const variantDetune = [0, 11, -7, 19][variantIdx % 4]
    if (chaosMods) {
      pMult *= chaosMods.pitch
      fMult *= chaosMods.filter
    }
    // Pitch
    const pitchOffset =
      padSettings.pitch + padSettings.octave * 12 + padSettings.detune / 100
    let baseF = 440 * Math.pow(2, pitchOffset / 12) * pMult
    switch (sound.category) {
      case 'kick':
        osc.type = kit.kickWave
        osc.frequency.setValueAtTime(
          kit.kickFreq * pMult * Math.pow(2, pitchOffset / 12) * (variantIdx === 1 ? 0.85 : 1),
          t,
        )
        osc.frequency.exponentialRampToValueAtTime(kit.kickEndF * pMult, t + 0.1)
        osc.start(t)
        osc.stop(releaseTime + r)
        break
      case 'snare':
        if (this.noiseBuffer) {
          const noiseSrc = this.ctx.createBufferSource()
          noiseSrc.buffer = this.noiseBuffer
          const noiseFilter = this.ctx.createBiquadFilter()
          noiseFilter.type = 'bandpass'
          noiseFilter.frequency.value = kit.snareNoiseF * fMult * (variantIdx === 1 ? 1.3 : 1)
          noiseSrc.connect(noiseFilter).connect(gain)
          noiseSrc.start(t)
          noiseSrc.stop(releaseTime + r)
        }
        osc.type = kit.snareWave
        osc.frequency.setValueAtTime(kit.snareToneF * pMult, t)
        osc.start(t)
        osc.stop(releaseTime + r)
        break
      case 'hihat':
        if (this.noiseBuffer) {
          const noiseSrc = this.ctx.createBufferSource()
          noiseSrc.buffer = this.noiseBuffer
          const noiseFilter = this.ctx.createBiquadFilter()
          noiseFilter.type = kit.hatBandwidth
          noiseFilter.frequency.value = kit.hatNoiseF * fMult * (variantIdx === 1 ? 0.6 : 1)
          noiseSrc.connect(noiseFilter).connect(gain)
          noiseSrc.start(t)
          noiseSrc.stop(releaseTime + r)
        }
        break
      case 'bass':
        osc.type = wave
        osc.frequency.value = 55 * Math.pow(2, (pitchOffset + variantPitchOff) / 12) * pMult
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(800 * fMult, t)
        filter.frequency.exponentialRampToValueAtTime(100 * fMult, t + d * 0.5)
        osc.start(t)
        osc.stop(releaseTime + r)
        break
      case 'chord':
      case 'vocal':
        osc.type = sound.category === 'vocal' ? (variantIdx === 0 ? 'sine' : 'triangle') : variantWave
        osc.frequency.value = baseF * Math.pow(2, variantPitchOff / 12)
        if (osc.detune) osc.detune.value = variantDetune
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(800 * fMult, t)
        filter.frequency.linearRampToValueAtTime(2000 * fMult, t + d / 2)
        filter.frequency.linearRampToValueAtTime(800 * fMult, t + d)
        if (sound.category === 'chord') {
          // Stacked thirds for richer chord; intervals depend on variant
          const intervalSets = [[0, 4, 7], [0, 3, 7], [0, 3, 7, 10], [0, 5, 7]]
          const set = intervalSets[variantIdx % intervalSets.length]
          set.slice(1).forEach((semi) => {
            const o = this.ctx!.createOscillator()
            o.type = variantWave
            o.frequency.value = baseF * Math.pow(2, semi / 12)
            o.detune.value = variantDetune
            o.connect(filter)
            o.start(t)
            o.stop(releaseTime + r)
          })
        } else if (sound.category === 'vocal' && variantIdx === 1) {
          // Vocal2: layered vibrato osc
          const v = this.ctx!.createOscillator()
          v.type = 'sine'
          v.frequency.value = baseF * 1.005
          v.detune.value = -8
          v.connect(filter)
          v.start(t)
          v.stop(releaseTime + r)
        }
        osc.start(t)
        osc.stop(releaseTime + r)
        break
      case 'long':
      case 'medium':
      case 'short':
      case 'instrument':
      default: {
        // Different waveform / pitch / 2-osc layering per variant for variation
        osc.type = variantWave
        const baseMult = sound.category === 'short' ? 1.5 : sound.category === 'long' ? 0.75 : sound.category === 'instrument' ? 1.0 : 1.2
        osc.frequency.value = baseF * 2 * baseMult * Math.pow(2, variantPitchOff / 12)
        if (osc.detune) osc.detune.value = variantDetune
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(3000 * fMult, t)
        filter.frequency.exponentialRampToValueAtTime(200 * fMult, t + d)
        // Add a second oscillator on long/medium/instrument for richer tone
        if (sound.category === 'long' || sound.category === 'medium' || sound.category === 'instrument') {
          const o2 = this.ctx!.createOscillator()
          o2.type = variantIdx % 2 === 0 ? 'triangle' : 'sawtooth'
          o2.frequency.value = osc.frequency.value * (variantIdx === 2 ? 0.5 : variantIdx === 3 ? 2 : 1.005)
          o2.detune.value = -variantDetune
          o2.connect(filter)
          o2.start(t)
          o2.stop(releaseTime + r)
        }
        // Drum/Fill/Percussion variant: noisy hits
        if ((sound.category === 'drum' || sound.category === 'fill' || sound.category === 'percussion') && this.noiseBuffer) {
          const ns = this.ctx!.createBufferSource()
          ns.buffer = this.noiseBuffer
          const nf = this.ctx!.createBiquadFilter()
          nf.type = variantIdx % 2 === 0 ? 'bandpass' : 'highpass'
          nf.frequency.value = (sound.category === 'percussion' ? 4000 : 1800) * fMult * (variantIdx === 1 ? 1.5 : 1)
          ns.connect(nf).connect(gain)
          ns.start(t)
          ns.stop(releaseTime + r)
        }
        osc.start(t)
        osc.stop(releaseTime + r)
        break
      }
    }
  }
  
  // Play a Freesound sample with proper normalization and anti-clipping
  playFreesoundSample(
    buffer: AudioBuffer,
    padId: string,
    time: number,
    velocity: number,
    stepDuration: number,
    padSettings: PadSettings,
    stretchable: boolean,
    snipMode: boolean = false
  ) {
    if (!this.ctx || !this.masterGain) return

    // Always stop existing sources on re-trigger (choke: new trigger cuts the previous sound for
    // this pad, just like placing adjacent tiles — each new tile restarts the sound).
    const existingSources = this.activeSources.get(padId) || []
    existingSources.forEach(src => { try { src.stop() } catch {} })
    this.activeSources.set(padId, [])

    const source = this.ctx.createBufferSource()
    source.buffer = buffer

    // Create gain node for envelope and volume control
    const gain = this.ctx.createGain()
    const panner = this.ctx.createStereoPanner()

    // ── NO normalization — applying 0.8/peak during playback amplifies quiet samples
    // into clipping range and destroys drum transients. Samples are already at the
    // correct level from the original recording. Just apply velocity + pad volume.
    const velMult = (velocity === 1 ? 0.4 : velocity === 2 ? 0.7 : 1.0)
    const baseVol = Math.min(1.0, velMult * padSettings.volume)

    // Duration logic:
    // - Stretched note (step.length > 1): loop/truncate to exact stretched duration regardless of mode
    // - Timing mode, single tile: play full buffer duration — next trigger of same pad will choke it
    // - Snip mode, single tile: hard-cut at step boundary
    const isStretched = stepDuration > buffer.duration * 0.9 && stretchable && stepDuration > 0.1
    let duration: number
    if (isStretched) {
      // Stretched note: loop if sample shorter than stretch target, else truncate
      if (buffer.duration < stepDuration) {
        source.loop = true
      }
      duration = stepDuration
    } else if (snipMode) {
      // Snip mode single tile: cut to one step's worth of time
      duration = stepDuration
    } else {
      // Timing mode single tile: play naturally until next retrigger chokes it
      duration = buffer.duration
    }

    // ADSR envelope
    const { a, d, s, r } = padSettings.adsr
    const t = time
    const attackTime = t + Math.min(a, duration * 0.25)
    const decayTime = attackTime + Math.min(d, duration * 0.25)
    const releaseTime = t + duration

    gain.gain.setValueAtTime(0.001, t)
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, baseVol), attackTime)
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, baseVol * s), decayTime)
    gain.gain.setValueAtTime(Math.max(0.001, baseVol * s), Math.max(decayTime, releaseTime - r))
    gain.gain.exponentialRampToValueAtTime(0.001, releaseTime)

    // Panning
    panner.pan.value = padSettings.pan

    // Apply pitch/detune
    const pitchOffset = padSettings.pitch + padSettings.octave * 12 + padSettings.detune / 100
    source.playbackRate.value = Math.pow(2, pitchOffset / 12)
    // Pitch-stretch toggle: when true browser time-stretches to keep original pitch (standard DAW
    // "stretch" mode). When false pitch shifts with playback speed (tape/vinyl behaviour).
    source.preservesPitch = padSettings.preservesPitch ?? true

    // FX chain — inline effects modify lastNode before panner
    let lastNode: AudioNode = gain
    if (padSettings.fx.includes('Distortion') && this.distortionCurve) {
      const dist = this.ctx.createWaveShaper()
      dist.curve = this.distortionCurve as any
      dist.oversample = '4x'
      lastNode.connect(dist)
      lastNode = dist
    }
    if (padSettings.fx.includes('Filter')) {
      const fxFilter = this.ctx.createBiquadFilter()
      fxFilter.type = 'lowpass'
      fxFilter.frequency.value = 1000
      lastNode.connect(fxFilter)
      lastNode = fxFilter
    }
    if (padSettings.fx.includes('Phaser')) {
      const ap1 = this.ctx.createBiquadFilter()
      const ap2 = this.ctx.createBiquadFilter()
      ap1.type = 'allpass'; ap1.frequency.value = 350; ap1.Q.value = 5
      ap2.type = 'allpass'; ap2.frequency.value = 800; ap2.Q.value = 5
      lastNode.connect(ap1); ap1.connect(ap2)
      lastNode = ap2
    }
    if (padSettings.fx.includes('Bitcrush')) {
      const bc = this.ctx.createWaveShaper()
      const steps = 8
      const bcCurve = new Float32Array(256)
      for (let i = 0; i < 256; i++) {
        const x = (i / 128) - 1
        bcCurve[i] = Math.round(x * steps) / steps
      }
      bc.curve = bcCurve
      lastNode.connect(bc)
      lastNode = bc
    }
    if (padSettings.fx.includes('Tremolo')) {
      const tremoloGain = this.ctx.createGain()
      const tremoloLFO = this.ctx.createOscillator()
      const tremoloDepth = this.ctx.createGain()
      tremoloLFO.frequency.value = 4
      tremoloDepth.gain.value = 0.4
      tremoloLFO.connect(tremoloDepth)
      tremoloDepth.connect(tremoloGain.gain)
      tremoloGain.gain.value = 0.6
      tremoloLFO.start()
      lastNode.connect(tremoloGain)
      lastNode = tremoloGain
    }
    lastNode.connect(panner)
    panner.connect(this.masterGain)

    // FX sends (tap from panner to effect bus)
    if (padSettings.fx.includes('Reverb') && this.reverbNode) {
      panner.connect(this.reverbNode)
      this.reverbNode.connect(this.masterGain)
    }
    if (padSettings.fx.includes('Delay') && this.delayNode) {
      panner.connect(this.delayNode)
      this.delayNode.connect(this.masterGain)
    }
    if (padSettings.fx.includes('Flanger') && this.flangerDelay) {
      panner.connect(this.flangerDelay)
      this.flangerDelay.connect(this.masterGain)
    }
    if (padSettings.fx.includes('Chorus') && this.chorusDelay) {
      panner.connect(this.chorusDelay)
      this.chorusDelay.connect(this.masterGain)
    }
    if (padSettings.fx.includes('Echo') && this.delayNode) {
      panner.connect(this.delayNode)
      this.delayNode.connect(this.masterGain)
    }

    source.connect(gain)
    source.start(t)
    // Schedule stop: always for stretched (looped) notes; for snip mode single tiles;
    // NOT for timing-mode single tiles (they ring out until next retrigger chokes them).
    if (isStretched || snipMode) {
      source.stop(releaseTime + 0.05)
    }

    // Track active source
    const sources = this.activeSources.get(padId) || []
    sources.push(source)
    this.activeSources.set(padId, sources)

    // Clean up when done
    source.onended = () => {
      const currentSources = this.activeSources.get(padId) || []
      this.activeSources.set(padId, currentSources.filter(s => s !== source))
    }
  }
  
  // Store Freesound buffers for a preset
  setPresetBuffers(preset: string, buffers: Map<number, AudioBuffer>) {
    this.presetBuffers.set(preset, buffers)
  }
  
  // Get a Freesound buffer for a specific pad in the current preset
  getFreesoundBuffer(preset: string, padIdx: number): AudioBuffer | null {
    const presetMap = this.presetBuffers.get(preset)
    return presetMap?.get(padIdx) || null
  }
}
const engine = new AudioEngine()
// --- MAIN COMPONENT ---
export default function AlphaDAW() {
  // UI State
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [bpm, setBpm] = useState(140)
  const [timeSig, setTimeSig] = useState<TimeSignature>('4/4')
  const [halfMode, setHalfMode] = useState(false)
  const [swing, setSwing] = useState(0)
  const [humanize, setHumanize] = useState(false)
  const [isAmbient, setIsAmbient] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [preset, setPreset] = useState<PresetName>('Dubstep Club')
  const [activePadId, setActivePadId] = useState<string>(SOUND_BANK[0].id)
  const [prevPadId, setPrevPadId] = useState<string | null>(null)
  const [mobileSide, setMobileSide] = useState<'A' | 'B'>('A')
  // Timing/Snip mode per pad
  const [padTimingMode, setPadTimingMode] = useState<Record<string, 'timing' | 'snip'>>(() => {
    try {
      const stored = localStorage.getItem('daw-pad-timing-mode')
      return stored ? JSON.parse(stored) : {}
    } catch { return {} }
  })
  // Freesound loading state
  const [freesoundLoading, setFreesoundLoading] = useState(false)
  const [freesoundProgress, setFreesoundProgress] = useState({ loaded: 0, total: 32 })
  const [loadedPresets, setLoadedPresets] = useState<Set<PresetName>>(new Set())
  const [freesoundSamples, setFreesoundSamples] = useState<Map<number, FreesoundSample>>(new Map())
  // Bind toggleFavoriteRef now that we have freesoundSamples in scope
  useEffect(() => {
    toggleFavoriteRef.current = (padIdx, sound) => {
      const meta = freesoundSamples.get(padIdx)
      const sourceId = meta?.id ?? -(padIdx + 1)
      const label = (meta?.name || sound.label).slice(0, 22)
      setFavorites(prev => {
        const exists = prev.find(f => f.sourceId === sourceId)
        if (exists) return prev.filter(f => f.favId !== exists.favId)
        const next: FavoriteSound = {
          favId: `fav_${Date.now()}_${padIdx}`,
          label,
          category: sound.category,
          color: sound.color,
          previewUrl: meta?.previewUrl || '',
          sourceId,
        }
        return prev.length >= 32 ? [...prev.slice(1), next] : [...prev, next]
      })
    }
  }, [freesoundSamples])
  // Pre-vetted manifest from /daw-presets.json — loaded once on mount
  type ManifestPad = { padIdx: number; id: number; name: string; previewUrl: string; duration: number; category: string; score: number }
  const [presetManifest, setPresetManifest] = useState<Record<string, ManifestPad[]> | null>(null)
  // Track which presets have been rerolled this session (session-only, reset on page reload)
  const rerolledPresetsRef = useRef<Set<PresetName>>(new Set())
  useEffect(() => {
    fetch('/daw-presets.json')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.presets) setPresetManifest(data.presets) })
      .catch(() => { /* manifest unavailable, use query system */ })
  }, [])
  // === Rate Limit Cooldown (Freesound 60 req/min protection) ===
  const COOLDOWN_MS = 60_000
  const LAST_FETCH_KEY = 'freesound-last-fetch-ts'
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(() => {
    try { const v = localStorage.getItem(LAST_FETCH_KEY); return v ? Number(v) : null } catch { return null }
  })
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const [cooldownOpen, setCooldownOpen] = useState(false)
  useEffect(() => {
    if (!cooldownOpen) return
    const tick = () => {
      if (lastFetchTime == null) { setCooldownOpen(false); return }
      const remain = Math.max(0, COOLDOWN_MS - (Date.now() - lastFetchTime))
      setCooldownRemaining(Math.ceil(remain / 1000))
      if (remain <= 0) setCooldownOpen(false)
    }
    tick()
    const id = window.setInterval(tick, 250)
    return () => clearInterval(id)
  }, [cooldownOpen, lastFetchTime])
  const markFetchNow = useCallback(() => {
    const now = Date.now()
    setLastFetchTime(now)
    try { localStorage.setItem(LAST_FETCH_KEY, String(now)) } catch {}
  }, [])
  const checkCooldown = useCallback((): boolean => {
    if (lastFetchTime == null) return true
    const elapsed = Date.now() - lastFetchTime
    if (elapsed >= COOLDOWN_MS) return true
    setCooldownRemaining(Math.ceil((COOLDOWN_MS - elapsed) / 1000))
    setCooldownOpen(true)
    return false
  }, [lastFetchTime])
  // Chaos Engine State
  const [chaosMods, setChaosMods] = useState<Record<
    string,
    {
      pitch: number
      filter: number
      decay: number
    }
  > | null>(null)
  // Sequencer Data State
  const [seqData, setSeqData] = useState<SequencerData>({})
  const [variations, setVariations] = useState<Variation[]>([])
  const [padSettings, setPadSettings] = useState<Record<string, PadSettings>>(
    {},
  )
  const [recordings, setRecordings] = useState<Recording[]>([])
  // Composition Timeline State
  const [clips, setClips] = useState<Clip[]>([])
  const [totalBars, setTotalBars] = useState(8)
  const [trackCount, setTrackCount] = useState(4)
  const [snapMode, setSnapMode] = useState<
    'off' | 'beat' | 'half-beat' | 'sixteenth'
  >('beat')
  const [isArrangementPlaying, setIsArrangementPlaying] = useState(false)
  const [zoom, setZoom] = useState(100)
  // Editor State
  const [editingPad, setEditingPad] = useState<string | null>(null)
  const [editingCell, setEditingCell] = useState<{
    padId: string
    stepIdx: number
  } | null>(null)
  // --- ADDITIVE FEATURE STATE ---
  // Custom samples: padId -> { name, key }
  const [customMap, setCustomMap] = useState<Record<string, { name: string; key: string }>>({})
  const customMapRef = useRef(customMap)
  useEffect(() => { customMapRef.current = customMap }, [customMap])
  // Master FX
  const [masterFilterType, setMasterFilterType] = useState<'off' | 'lowpass' | 'highpass'>('off')
  const [masterFilterFreq, setMasterFilterFreq] = useState(1000)
  useEffect(() => { engine.setMasterFilter(masterFilterType, masterFilterFreq) }, [masterFilterType, masterFilterFreq])
  // Live record (tap pads -> write into grid)
  const [liveRecord, setLiveRecord] = useState(false)
  const liveRecordRef = useRef(false)
  useEffect(() => { liveRecordRef.current = liveRecord }, [liveRecord])
  // Undo / Redo
  const [history, setHistory] = useState<SequencerData[]>([])
  const [future, setFuture] = useState<SequencerData[]>([])
  const pushHistory = (snapshot: SequencerData) => {
    setHistory((h) => [...h.slice(-49), snapshot])
    setFuture([])
  }
  // Copy / paste pattern
  const [clipboardPattern, setClipboardPattern] = useState<Sequence | null>(null)
  // Scene launching
  const [sceneMode, setSceneMode] = useState(false)
  const [pendingSceneId, setPendingSceneId] = useState<string | null>(null)
  const pendingSceneIdRef = useRef<string | null>(null)
  useEffect(() => { pendingSceneIdRef.current = pendingSceneId }, [pendingSceneId])
  // Macros
  const [macros, setMacros] = useState({ chaos: 0, darkness: 0, width: 0 })
  const macrosRef = useRef(macros)
  useEffect(() => { macrosRef.current = macros }, [macros])
  // Snapshots (kit state)
  type KitSnapshot = { id: string; name: string; padSettings: Record<string, PadSettings>; customMap: Record<string, { name: string; key: string }>; masterFilterType: typeof masterFilterType; masterFilterFreq: number; macros: typeof macros }
  const [snapshots, setSnapshots] = useState<KitSnapshot[]>([])
  // Chord generator
  const [chordKey, setChordKey] = useState('C')
  const [chordMood, setChordMood] = useState<'major' | 'minor' | 'dark' | 'dreamy'>('major')
  // Live resample
  const [resamplingFor, setResamplingFor] = useState<string | null>(null)
  // === NEW: BPM modal, Auto-master, Custom mode, Effects rack, Drag-drop ===
  const [bpmModalOpen, setBpmModalOpen] = useState(false)
  const [bpmDraft, setBpmDraft] = useState(140)
  const [autoMaster, setAutoMaster] = useState(false)
  useEffect(() => { engine.setAutoMaster(autoMaster) }, [autoMaster])
  // Metronome
  const [metronomeOn, setMetronomeOn] = useState(false)
  const [metronomeRate, setMetronomeRate] = useState<'half' | 'quarter' | 'eighth' | 'sixteenth'>('quarter')
  const metronomeOnRef = useRef(false)
  const metronomeRateRef = useRef<'half' | 'quarter' | 'eighth' | 'sixteenth'>('quarter')
  const nextMetronomeTimeRef = useRef(0)
  const metroBeatCountRef = useRef(0)
  useEffect(() => { metronomeOnRef.current = metronomeOn }, [metronomeOn])
  useEffect(() => { metronomeRateRef.current = metronomeRate }, [metronomeRate])
  // ── Favorites: persisted per device. Each favorite stores enough to re-load the sound. ──
  type FavoriteSound = {
    favId: string         // unique
    label: string         // displayed name
    category: SoundCategory
    color: string
    previewUrl: string    // freesound url; empty string => synth-only
    sourceId: number      // freesound id, or negative for synth
    synthType?: SynthPadType
    synthVariant?: number
  }
  const FAV_KEY = 'daw-favorites-v1'
  const [favorites, setFavorites] = useState<FavoriteSound[]>(() => {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]') } catch { return [] }
  })
  const [favoritesViewOpen, setFavoritesViewOpen] = useState(false)
  const [favoritesMode, setFavoritesMode] = useState(false)
  useEffect(() => {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(favorites)) } catch { /* quota */ }
  }, [favorites])
  const toggleFavoriteRef = useRef<(padIdx: number, sound: typeof SOUND_BANK[number]) => void>(() => {})
  // Custom mode
  const [customMode, setCustomMode] = useState(false)
  // queue of loaded sample files awaiting drag onto pad
  const [sampleQueue, setSampleQueue] = useState<Array<{ id: string; name: string; buf: AudioBuffer }>>([])
  const [pendingAssign, setPendingAssign] = useState<null | { padId: string; queueId?: string; buf: AudioBuffer; sourceName: string; trimStart: number; trimEnd: number; name: string }>(null)
  // Effects rack
  const EFFECT_LIST: EffectName[] = ['Reverb', 'Delay', 'Distortion', 'Filter', 'Flanger', 'Phaser', 'Echo', 'Chorus', 'Bitcrush', 'Tremolo']
  type EffectScope = 'off' | 'whole' | 'current' | 'selection'
  const [effectScopes, setEffectScopes] = useState<Record<EffectName, EffectScope>>(
    () => EFFECT_LIST.reduce((acc, e) => { acc[e] = 'off'; return acc }, {} as Record<EffectName, EffectScope>)
  )
  // per-pad effect set (current-instrument scope) — independent of padSettings.fx for cleaner UX
  const [perPadEffects, setPerPadEffects] = useState<Record<string, Set<EffectName>>>({})
  // selection-painted effects per pad: padId -> Set of dataIdx steps
  const [selectionPaints, setSelectionPaints] = useState<Record<string, Record<EffectName, number[]>>>({})
  const setEffectScope = (eff: EffectName, scope: EffectScope) => {
    setEffectScopes((p) => ({ ...p, [eff]: scope }))
  }
  // Wire whole-track effects into engine on every change
  useEffect(() => {
    EFFECT_LIST.forEach((e) => engine.setWholeTrackEffect(e, effectScopes[e] === 'whole'))
  }, [effectScopes])
  // Helper to toggle current-instrument FX on active pad
  const toggleCurrentInstFx = (eff: EffectName) => {
    setPerPadEffects((p) => {
      const next = { ...p }
      const s = new Set(next[activePadId] || [])
      if (s.has(eff)) s.delete(eff); else s.add(eff)
      next[activePadId] = s
      return next
    })
  }
  // localStorage persistence for Custom Mode samples (metadata only — buffers stay in memory)
  const CUSTOM_SAVE_KEY = 'microdaw_custom_kit_v1'
  const persistCustomKit = async () => {
    // encode each AudioBuffer → WAV → base64 in localStorage
    const out: Record<string, { name: string; wav: string }> = {}
    const entries = Object.entries(customMap)
    for (const [padId, info] of entries) {
      const buf = engine.customBuffers.get(info.key)
      if (!buf) continue
      const left = buf.getChannelData(0)
      const right = buf.numberOfChannels > 1 ? buf.getChannelData(1) : left
      const blob = encodeWAV(left, right, buf.sampleRate)
      const ab = await blob.arrayBuffer()
      let bin = ''
      const u8 = new Uint8Array(ab)
      for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i])
      out[padId] = { name: info.name, wav: btoa(bin) }
    }
    try { localStorage.setItem(CUSTOM_SAVE_KEY, JSON.stringify(out)); alert('Custom kit saved to device.') }
    catch (e) { alert('Save failed — likely too large for localStorage.') }
  }
  const loadPersistedCustomKit = async () => {
    engine.init()
    const ctx = engine.ctx!
    const raw = localStorage.getItem(CUSTOM_SAVE_KEY)
    if (!raw) return
    try {
      const obj = JSON.parse(raw) as Record<string, { name: string; wav: string }>
      const next: Record<string, { name: string; key: string }> = {}
      for (const [padId, info] of Object.entries(obj)) {
        const bin = atob(info.wav)
        const u8 = new Uint8Array(bin.length)
        for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i)
        try {
          const audioBuf = await ctx.decodeAudioData(u8.buffer.slice(0))
          const key = `persist_${padId}_${Date.now()}`
          engine.customBuffers.set(key, audioBuf)
          next[padId] = { name: info.name, key }
        } catch {}
      }
      setCustomMap(next)
    } catch {}
  }
  // Playback Refs
  const currentStepRef = useRef(0) // Global step for single pattern
  const currentBeatRef = useRef(0) // Global beat for arrangement
  const nextNoteTimeRef = useRef(0)
  const isPlayingRef = useRef(false)
  const seqDataRef = useRef(seqData)
  const bpmRef = useRef(bpm)
  const timeSigRef = useRef(timeSig)
  const halfModeRef = useRef(halfMode)
  const swingRef = useRef(swing)
  const humanizeRef = useRef(humanize)
  const isAmbientRef = useRef(isAmbient)
  const presetRef = useRef(preset)
  const chaosModsRef = useRef(chaosMods)
  const padSettingsRef = useRef(padSettings)
  const clipsRef = useRef(clips)
  const isArrangementPlayingRef = useRef(isArrangementPlaying)
  const totalBarsRef = useRef(totalBars)
  const padTimingModeRef = useRef(padTimingMode)
  const perPadEffectsRef = useRef(perPadEffects)
  const effectScopesRef = useRef(effectScopes)
  // UI Playhead State
  const [uiStep, setUiStep] = useState(0)
  const [uiBeat, setUiBeat] = useState(0)
  // Drag-to-stretch State
  const [dragState, setDragState] = useState<{
    type: 'paint' | 'erase' | 'stretch'
    startIdx: number
  } | null>(null)
  // Sync refs
  useEffect(() => {
    seqDataRef.current = seqData
  }, [seqData])
  useEffect(() => {
    bpmRef.current = bpm
  }, [bpm])
  useEffect(() => {
    timeSigRef.current = timeSig
  }, [timeSig])
  useEffect(() => {
    halfModeRef.current = halfMode
  }, [halfMode])
  useEffect(() => {
    swingRef.current = swing
  }, [swing])
  useEffect(() => {
    humanizeRef.current = humanize
  }, [humanize])
  useEffect(() => {
    isAmbientRef.current = isAmbient
    engine.setAmbientMode(isAmbient)
  }, [isAmbient])
  useEffect(() => {
    presetRef.current = preset
  }, [preset])
  useEffect(() => {
    chaosModsRef.current = chaosMods
  }, [chaosMods])
  useEffect(() => {
    padSettingsRef.current = padSettings
  }, [padSettings])
  useEffect(() => {
    clipsRef.current = clips
  }, [clips])
  useEffect(() => {
    isArrangementPlayingRef.current = isArrangementPlaying
  }, [isArrangementPlaying])
  useEffect(() => {
    totalBarsRef.current = totalBars
  }, [totalBars])
  useEffect(() => {
    padTimingModeRef.current = padTimingMode
  }, [padTimingMode])
  useEffect(() => { perPadEffectsRef.current = perPadEffects }, [perPadEffects])
  useEffect(() => { effectScopesRef.current = effectScopes }, [effectScopes])
  useEffect(() => {
    try { localStorage.setItem('daw-pad-timing-mode', JSON.stringify(padTimingMode)) } catch {}
  }, [padTimingMode])
  useEffect(() => {
    engine.setVolume(volume)
  }, [volume])
  // Derived Timing Math
  const getBeatsPerBar = (ts: TimeSignature) => parseInt(ts.split('/')[0])
  const beatsPerBar = getBeatsPerBar(timeSig)
  const subdivision = halfMode ? 4 : 2 // 2 = 8th notes (standard), 4 = 16th notes (half mode)
  const stepsPerBar = beatsPerBar * subdivision
  const getTimingMode = (padId: string) => padTimingMode[padId] ?? 'timing'
  // Initialize data
  useEffect(() => {
    if (Object.keys(seqData).length === 0) {
      const initialSeq: SequencerData = {}
      const initialPadSettings: Record<string, PadSettings> = {}
      SOUND_BANK.forEach((s) => {
        // We keep the array length at 80 (max possible steps: 5/4 half mode = 20*4 = 80)
        initialSeq[s.id] = Array(80).fill({
          velocity: 0,
          length: 1,
          probability: 1,
        })
        initialPadSettings[s.id] = {
          ...DEFAULT_PAD_SETTINGS,
        }
      })
      setSeqData(initialSeq)
      setPadSettings(initialPadSettings)
    }
  }, [])
  // === Load Freesound samples when preset changes ===
  useEffect(() => {
    // Skip if already loaded
    if (loadedPresets.has(preset)) {
      // Restore cached samples from engine
      const existing = engine.presetBuffers.get(preset)
      if (existing) {
        const samples = new Map<number, FreesoundSample>()
        existing.forEach((buf, idx) => {
          samples.set(idx, { id: idx, name: `${preset} Sound ${idx + 1}`, previewUrl: '', audioBuffer: buf })
        })
        setFreesoundSamples(samples)
      }
      return
    }
    
    const loadPreset = async () => {
      // Phase A: catalogSynth-only preset loading — no Freesound API here.
      // Freesound is exclusively used by Random Skim.
      if (!engine.ctx) engine.init()
      if (!engine.ctx) return

      setFreesoundLoading(true)
      setFreesoundProgress({ loaded: 0, total: 32 })

      try {
        const presetIndex = Math.max(0, PRESETS.indexOf(preset))
        const samples = new Map<number, FreesoundSample>()
        const buffers = new Map<number, AudioBuffer>()
        let loaded = 0
        for (const slot of BLUEPRINT_SLOT_MAP) {
          for (let i = 0; i < slot.padIds.length; i++) {
            const padIdx = slot.padIds[i]
            let buf: AudioBuffer | null = null
            let usedUrl = ''
            // 1) Try real CDN sample first
            const url = getPadSampleUrl(presetIndex, i, slot.category)
            if (url && engine.ctx) {
              try {
                buf = await loadAndCacheAudio(url, engine.ctx)
                if (buf) usedUrl = url
              } catch (e) { /* fall through */ }
            }
            // 2) Fills are composed offline from real drum hits
            if (!buf && slot.category === 'fill' && engine.ctx) {
              try {
                buf = await synthesizeFill(presetIndex, i, engine.ctx, (u) => loadAndCacheAudio(u, engine.ctx!))
              } catch (e) { /* fall through */ }
            }
            // 3) Synthesis fallback (last resort)
            if (!buf) {
              try { buf = await catalogSynth(presetIndex, i, slot.category) }
              catch (e) { console.warn('[catalogSynth fallback] pad', padIdx, e) }
            }
            if (buf) {
              samples.set(padIdx, { id: -(presetIndex * 100 + padIdx + 1), name: `${slot.category} ${i + 1}`, previewUrl: usedUrl, audioBuffer: buf })
              buffers.set(padIdx, buf)
            }
            loaded++
            setFreesoundProgress({ loaded, total: 32 })
          }
        }
        engine.setPresetBuffers(preset, buffers)
        setFreesoundSamples(samples)
        setLoadedPresets(prev => new Set(prev).add(preset))
      } catch (err) {
        console.warn('[loadPreset] Failed:', preset, err)
      } finally {
        setFreesoundLoading(false)
      }
    }
    
    loadPreset()
  }, [preset, loadedPresets, presetManifest])
  // Audio Scheduler Loop
  useEffect(() => {
    let timerID: number
    const scheduleNote = (time: number) => {
      const currentPreset = presetRef.current
      const isHum = humanizeRef.current
      const isAmb = isAmbientRef.current
      const cMods = chaosModsRef.current
      const ts = timeSigRef.current
      const hm = halfModeRef.current
      const bpb = getBeatsPerBar(ts)
      const sub = hm ? 4 : 2
      // Full loop spans all 4 rendered rows of the step grid: bar * rows
      const spb = bpb * sub * 4
      const stepDur = 60 / bpmRef.current / sub
      if (isArrangementPlayingRef.current) {
        // Timeline Playback
        const currentBeat = currentBeatRef.current
        requestAnimationFrame(() => setUiBeat(currentBeat))
        clipsRef.current.forEach((clip) => {
          if (
            currentBeat >= clip.startBeat &&
            currentBeat < clip.startBeat + clip.lengthBeats
          ) {
            const variation = variations.find((v) => v.id === clip.variationId)
            if (!variation) return
            const varBpb = getBeatsPerBar(variation.timeSig as TimeSignature)
            const varSub = variation.halfMode ? 4 : 2
            const varSpb = varBpb * varSub
            const beatsIntoClip = currentBeat - clip.startBeat
            const varStepIdx = Math.floor(beatsIntoClip * varSub) % varSpb
            SOUND_BANK.forEach((sound, index) => {
              const step = variation.data[sound.id]?.[varStepIdx]
              if (step && step.velocity > 0) {
                if (step.probability && Math.random() > step.probability) return
                let jitter = isHum ? Math.random() * 0.03 - 0.015 : 0
                const pSettings = padSettingsRef.current[sound.id]
                let smod = cMods ? cMods[sound.id] : undefined
                engine.playSynth(
                  sound,
                  time + jitter,
                  (step.length * (60 / bpmRef.current)) / varSub,
                  step.velocity,
                  currentPreset,
                  pSettings,
                  isAmb,
                  smod,
                )
              }
            })
          }
        })
        // Advance Timeline
        currentBeatRef.current += 1 / sub
        if (currentBeatRef.current >= totalBarsRef.current * bpb) {
          currentBeatRef.current = 0
        }
      } else {
        // Single Pattern Playback
        const stepIdx = currentStepRef.current % spb
        requestAnimationFrame(() => setUiStep(stepIdx))
        // Scene launching: at bar boundary, swap to pending variation
        if (stepIdx === 0 && pendingSceneIdRef.current) {
          const v = variations.find((vv) => vv.id === pendingSceneIdRef.current)
          if (v) {
            seqDataRef.current = v.data
            setSeqData(v.data)
          }
          pendingSceneIdRef.current = null
          setPendingSceneId(null)
        }
        // Data mapping: if Standard mode, we read from indices 0, 2, 4...
        // if Half mode, we read from indices 0, 1, 2, 3...
        const dataIdx = hm ? stepIdx : stepIdx * 2
        SOUND_BANK.forEach((sound, index) => {
          const step = seqDataRef.current[sound.id]?.[dataIdx]
          if (step && step.velocity > 0) {
            if (step.probability && Math.random() > step.probability) return
            // Conditional step gates (additive optional field)
            const cond = (step as any).condition as string | undefined
            if (cond === '1in2' && currentStepRef.current % 2 !== 0) return
            if (cond === '1in4' && currentStepRef.current % 4 !== 0) return
            if (cond === 'fill' && currentStepRef.current % 16 < 14) return
            let jitter = isHum ? Math.random() * 0.03 - 0.015 : 0
            const pSettings = padSettingsRef.current[sound.id]
            let smod = cMods ? cMods[sound.id] : undefined
            // Macro: darkness lowers freq mods; chaos randomizes; width pans
            const m = macrosRef.current
            if (m.chaos > 0) {
              smod = {
                pitch: (smod?.pitch ?? 1) * (1 + (Math.random() - 0.5) * m.chaos),
                filter: (smod?.filter ?? 1) * (1 + (Math.random() - 0.5) * m.chaos),
                decay: (smod?.decay ?? 1) * (1 + (Math.random() - 0.5) * m.chaos),
              }
            }
            if (m.darkness > 0 && smod) smod.filter *= 1 - m.darkness * 0.7
            // Merge effective FX: base padSettings.fx + per-pad CURRENT scope + WHOLE scope
            const padFxBase: string[] = pSettings?.fx ?? []
            const padFxCurrent = Array.from(perPadEffectsRef.current[sound.id] ?? [])
            const wholeFx = EFFECT_LIST.filter(e => effectScopesRef.current[e] === 'whole')
            const effectiveFx = [...new Set([...padFxBase, ...padFxCurrent, ...wholeFx])]
            const adjusted: PadSettings = m.width > 0
              ? { ...pSettings, fx: effectiveFx, pan: Math.max(-1, Math.min(1, (pSettings?.pan ?? 0) + (Math.random() - 0.5) * m.width * 2)) }
              : { ...pSettings, fx: effectiveFx }
            // Custom sample mapping (highest priority)
            const custom = customMapRef.current[sound.id]
            if (custom) {
              engine.playSample(custom.key, time + jitter, step.velocity, adjusted)
              return
            }
            // Try Freesound sample (second priority)
            const freesoundBuffer = engine.getFreesoundBuffer(currentPreset, index)
            if (freesoundBuffer) {
              const isSnip = (padTimingModeRef.current[sound.id] ?? 'timing') === 'snip'
              engine.playFreesoundSample(
                freesoundBuffer,
                sound.id,
                time + jitter,
                step.velocity,
                step.length * stepDur,
                adjusted,
                sound.stretchable ?? false,
                isSnip,
              )
              return
            }
            // Fallback to synthesized sound
            engine.playSynth(
              sound,
              time + jitter,
              step.length * stepDur,
              step.velocity,
              currentPreset,
              adjusted,
              isAmb,
              smod,
            )
          }
        })
        currentStepRef.current++
        if (currentStepRef.current >= spb) {
          currentStepRef.current = 0
        }
      }
    }
    const scheduler = () => {
      if (!isPlayingRef.current || !engine.ctx) return
      while (nextNoteTimeRef.current < engine.ctx.currentTime + 0.1) {
        let stepTime = nextNoteTimeRef.current
        const ts = timeSigRef.current
        const sub = halfModeRef.current ? 4 : 2
        const stepDur = 60 / bpmRef.current / sub
        // Swing (apply to even steps)
        if (currentStepRef.current % 2 === 1) {
          stepTime += (swingRef.current / 100) * stepDur * 0.5
        }
        scheduleNote(stepTime)
        nextNoteTimeRef.current += stepDur
      }
      // Metronome click — runs independent of main step grid
      if (metronomeOnRef.current && engine.ctx) {
        const beatDur = 60 / bpmRef.current
        const rateMap: Record<string, number> = { half: 2, quarter: 1, eighth: 0.5, sixteenth: 0.25 }
        const metroDur = beatDur * (rateMap[metronomeRateRef.current] ?? 1)
        const ctx = engine.ctx
        while (nextMetronomeTimeRef.current < ctx.currentTime + 0.12) {
          const t = nextMetronomeTimeRef.current
          const isDownbeat = metroBeatCountRef.current % 4 === 0
          // Synthesize metronome click inline
          const g = ctx.createGain()
          g.connect(ctx.destination)
          const vol = isDownbeat ? 0.55 : 0.35
          g.gain.setValueAtTime(vol, t)
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.055)
          const o = ctx.createOscillator()
          o.type = 'triangle'
          o.frequency.setValueAtTime(isDownbeat ? 1750 : 1100, t)
          o.frequency.exponentialRampToValueAtTime(isDownbeat ? 875 : 550, t + 0.04)
          o.connect(g)
          o.start(t); o.stop(t + 0.06)
          nextMetronomeTimeRef.current += metroDur
          metroBeatCountRef.current++
        }
      }
    }
    timerID = window.setInterval(scheduler, 25)
    return () => window.clearInterval(timerID)
  }, [variations])
  const togglePlay = () => {
    engine.init()
    if (!isPlaying) {
      if (engine.ctx?.state === 'suspended') engine.ctx.resume()
      isPlayingRef.current = true
      nextNoteTimeRef.current = engine.ctx!.currentTime + 0.05
      nextMetronomeTimeRef.current = engine.ctx!.currentTime + 0.05
      metroBeatCountRef.current = 0
      setIsPlaying(true)
    } else {
      isPlayingRef.current = false
      setIsPlaying(false)
    }
  }
  const toggleRecord = async () => {
    engine.init()
    if (!isRecording) {
      engine.startRecording()
      setIsRecording(true)
    } else {
      const blob = await engine.stopRecording()
      const url = URL.createObjectURL(blob)
      setRecordings((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          url,
          name: `Recording ${prev.length + 1}`,
          duration: 0,
        },
      ])
      setIsRecording(false)
    }
  }
  const handlePadClick = (sound: SoundDef, index: number) => {
    engine.init()
    const stepDur = 60 / bpm / subdivision
    const pSettings = padSettings[sound.id]
    const custom = customMap[sound.id]
    if (custom) {
      engine.playSample(custom.key, engine.ctx!.currentTime, 2, pSettings)
    } else {
      // Per-preset CDN sample (matches sequencer logic in scheduleNote)
      const presetBuf = engine.getFreesoundBuffer(preset, index)
      if (presetBuf) {
        const isSnip = (padTimingMode[sound.id] ?? 'timing') === 'snip'
        engine.playFreesoundSample(
          presetBuf,
          sound.id,
          engine.ctx!.currentTime,
          2,
          stepDur,
          pSettings,
          sound.stretchable ?? false,
          isSnip,
        )
      } else {
        engine.playSynth(
          sound,
          engine.ctx!.currentTime,
          stepDur,
          2,
          preset,
          pSettings,
          isAmbient,
          chaosMods?.[sound.id],
        )
      }
    }
    // Live record: write to current playhead step on the tapped pad
    if (liveRecordRef.current && isPlayingRef.current) {
      const writeIdx = halfMode ? currentStepRef.current : currentStepRef.current * 2
      pushHistory(seqData)
      setSeqData((prev) => {
        const next = { ...prev }
        const seq = [...(next[sound.id] || Array(80).fill({ velocity: 0, length: 1, probability: 1 }))]
        seq[writeIdx] = { ...seq[writeIdx], velocity: 2, length: 1 }
        next[sound.id] = seq
        return next
      })
    }
    if (activePadId !== sound.id) {
      setPrevPadId(activePadId)
      setActivePadId(sound.id)
    }
  }
  // --- SEQUENCER DRAG LOGIC ---
  // Find the head of a stretched note covering dataIdx (returns startIdx or -1)
  const findStretchHead = (padSeq: Sequence, dataIdx: number): number => {
    if (!padSeq) return -1
    if (padSeq[dataIdx]?.velocity > 0) return dataIdx
    // scan backwards: a previous active cell with length covering this idx
    for (let i = dataIdx - 1; i >= 0; i--) {
      const c = padSeq[i]
      if (!c) continue
      if (c.velocity > 0) {
        if (i + c.length > dataIdx) return i
        return -1
      }
    }
    return -1
  }
  const handleStepMouseDown = (uiCol: number, e: React.MouseEvent) => {
    const isShift = e.shiftKey
    const dataIdx = halfMode ? uiCol : uiCol * 2
    const padSeq = seqData[activePadId] || []
    const headIdx = findStretchHead(padSeq, dataIdx)
    const isActive = headIdx >= 0
    if (isShift) {
      setDragState({ type: 'erase', startIdx: dataIdx })
      updateStep(dataIdx, 0, 1)
      return
    }
    // Stretchable active cell: enter stretch mode from the head of the note instead of erasing.
    // This makes clicking anywhere on a stretched note continue the stretch, not accidentally delete it.
    // Shift+click still erases.
    if (isActive && activeSound?.stretchable) {
      lastStretchLengthRef.current = padSeq[headIdx]?.length ?? 1
      setDragState({ type: 'stretch', startIdx: headIdx })
      return
    }
    // Non-stretchable active cell → erase whole note
    if (isActive) {
      const head = headIdx
      const len = padSeq[head]?.length || 1
      setSeqData((prev) => {
        const next = { ...prev }
        const seq = [...next[activePadId]]
        for (let i = head; i < head + len; i++) {
          seq[i] = { velocity: 0, length: 1, probability: 1 }
        }
        next[activePadId] = seq
        return next
      })
      setDragState({ type: 'erase', startIdx: dataIdx })
      return
    }
    // Empty cell → paint
    setDragState({ type: 'paint', startIdx: dataIdx })
    updateStep(dataIdx, 2, 1)
  }
  // Ref to track the last applied stretch length — avoids spamming setState on every mouseenter
  const lastStretchLengthRef = useRef<number>(-1)
  const handleStepStretchStart = (uiCol: number) => {
    const dataIdx = halfMode ? uiCol : uiCol * 2
    const padSeq = seqData[activePadId] || []
    const headIdx = findStretchHead(padSeq, dataIdx)
    if (headIdx >= 0) {
      lastStretchLengthRef.current = padSeq[headIdx]?.length ?? 1
      setDragState({ type: 'stretch', startIdx: headIdx })
    }
  }
  const handleStepMouseEnter = (uiCol: number) => {
    if (!dragState) return
    const dataIdx = halfMode ? uiCol : uiCol * 2
    if (dragState.type === 'paint') {
      updateStep(dataIdx, 2, 1)
    } else if (dragState.type === 'erase') {
      updateStep(dataIdx, 0, 1)
    } else if (dragState.type === 'stretch') {
      if (dataIdx >= dragState.startIdx) {
        const length = dataIdx - dragState.startIdx + 1
        // Only update state when the length actually changes — prevents spaz re-renders
        if (length === lastStretchLengthRef.current) return
        lastStretchLengthRef.current = length
        setSeqData((prev) => {
          const newData = { ...prev }
          const padSeq = [...newData[activePadId]]
          padSeq[dragState.startIdx] = { ...padSeq[dragState.startIdx], length }
          // Clear intermediate cells
          for (let i = dragState.startIdx + 1; i <= dataIdx; i++) {
            padSeq[i] = { velocity: 0, length: 1, probability: 1 }
          }
          newData[activePadId] = padSeq
          return newData
        })
      }
    }
  }
  const handleMouseUp = () => {
    lastStretchLengthRef.current = -1
    setDragState(null)
  }
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [])
  const updateStep = (dataIdx: number, velocity: number, length: number) => {
    setSeqData((prev) => {
      const newData = {
        ...prev,
      }
      const padSeq = [
        ...(newData[activePadId] ||
          Array(80).fill({
            velocity: 0,
            length: 1,
            probability: 1,
          })),
      ]
      padSeq[dataIdx] = {
        ...padSeq[dataIdx],
        velocity,
        length,
      }
      newData[activePadId] = padSeq
      return newData
    })
  }
  // --- TIMELINE LOGIC ---
  const handleDropOnTrack = (e: React.DragEvent, trackIdx: number) => {
    e.preventDefault()
    const varId = e.dataTransfer.getData('variationId')
    if (!varId) return
    const variation = variations.find((v) => v.id === varId)
    if (!variation) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const beatPixelWidth = 80 * (zoom / 100)
    let rawBeat = x / beatPixelWidth
    if (snapMode === 'beat') rawBeat = Math.round(rawBeat)
    else if (snapMode === 'half-beat') rawBeat = Math.round(rawBeat * 2) / 2
    else if (snapMode === 'sixteenth') rawBeat = Math.round(rawBeat * 4) / 4
    const varBpb = getBeatsPerBar(variation.timeSig as TimeSignature)
    const lengthBeats = varBpb * 4
    const newClip: Clip = {
      id: Date.now().toString(),
      variationId: varId,
      trackIdx,
      startBeat: rawBeat,
      lengthBeats,
    }
    setClips((prev) => [...prev, newClip])
  }
  // --- EXTRAS ---
  const generateChaosKit = () => {
    const mods: Record<
      string,
      {
        pitch: number
        filter: number
        decay: number
      }
    > = {}
    SOUND_BANK.forEach((s) => {
      mods[s.id] = {
        pitch: 0.5 + Math.random(),
        filter: 0.2 + Math.random() * 2,
        decay: 0.1 + Math.random() * 2,
      }
    })
    setChaosMods(mods)
  }
  const mutateBeat = () => {
    setSeqData((prev) => {
      const newData = { ...prev }
      const padSeq = [...newData[activePadId]]
      // Count current density so we can bias toward removing when dense, adding when sparse
      const activeCount = padSeq.filter((s) => s && s.velocity > 0).length
      const total = padSeq.length
      const density = activeCount / total  // 0..1
      // Flip probability per step: always 15%, but the direction is biased by density.
      // Above 50% → bias toward removing; below 50% → bias toward adding.
      // This prevents runaway fill-up across repeated clicks.
      const removeChance = 0.1 + density * 0.6   // 0.1 (empty) → 0.7 (full)
      const addChance    = 0.7 - density * 0.6   // 0.7 (empty) → 0.1 (full)
      for (let i = 0; i < total; i++) {
        if (padSeq[i]?.velocity > 0) {
          // Active step: remove with removeChance
          if (Math.random() < removeChance * 0.25) {
            padSeq[i] = { velocity: 0, length: 1, probability: 1 }
          }
        } else {
          // Inactive step: add with addChance
          if (Math.random() < addChance * 0.25) {
            padSeq[i] = { velocity: 2, length: 1, probability: 1 }
          }
        }
      }
      newData[activePadId] = padSeq
      return newData
    })
  }
  const saveVariation = () => {
    const newVar: Variation = {
      id: Date.now().toString(),
      name: `Var ${variations.length + 1}`,
      bpm,
      timeSig,
      halfMode,
      data: JSON.parse(JSON.stringify(seqData)),
    }
    setVariations([...variations, newVar])
  }
  const loadVariation = (v: Variation) => {
    setSeqData(v.data)
    setBpm(v.bpm)
    setTimeSig(v.timeSig as TimeSignature)
    setHalfMode(v.halfMode)
  }
  const clearCurrentPad = () => {
    setSeqData((prev) => ({
      ...prev,
      [activePadId]: Array(80).fill({
        velocity: 0,
        length: 1,
        probability: 1,
      }),
    }))
  }
  const clearAll = () => {
    const initial: SequencerData = {}
    SOUND_BANK.forEach((s) => {
      initial[s.id] = Array(80).fill({
        velocity: 0,
        length: 1,
        probability: 1,
      })
    })
    setSeqData(initial)
    setChaosMods(null)
  }
  // --- ADDITIVE HELPERS ---
  // WAV encoding
  const encodeWAV = (left: Float32Array, right: Float32Array, sampleRate: number) => {
    const numChannels = 2
    const length = left.length
    const buffer = new ArrayBuffer(44 + length * numChannels * 2)
    const view = new DataView(buffer)
    const writeStr = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)) }
    writeStr(0, 'RIFF'); view.setUint32(4, 36 + length * numChannels * 2, true)
    writeStr(8, 'WAVE'); writeStr(12, 'fmt '); view.setUint32(16, 16, true)
    view.setUint16(20, 1, true); view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * numChannels * 2, true)
    view.setUint16(32, numChannels * 2, true); view.setUint16(34, 16, true)
    writeStr(36, 'data'); view.setUint32(40, length * numChannels * 2, true)
    let off = 44
    for (let i = 0; i < length; i++) {
      const l = Math.max(-1, Math.min(1, left[i])); const r = Math.max(-1, Math.min(1, right[i]))
      view.setInt16(off, l < 0 ? l * 0x8000 : l * 0x7fff, true); off += 2
      view.setInt16(off, r < 0 ? r * 0x8000 : r * 0x7fff, true); off += 2
    }
    return new Blob([buffer], { type: 'audio/wav' })
  }
  // Toggle record now also taps raw audio for WAV
  const toggleRecordWav = async () => {
    engine.init()
    if (!isRecording) {
      engine.startRecording(); engine.startRawRecording(); setIsRecording(true)
    } else {
      const blob = await engine.stopRecording()
      const raw = engine.stopRawRecording()
      const wavBlob = encodeWAV(raw.left, raw.right, raw.sampleRate)
      const url = URL.createObjectURL(blob)
      const wavUrl = URL.createObjectURL(wavBlob)
      setRecordings((prev) => [...prev, {
        id: Date.now().toString(), url, name: `Recording ${prev.length + 1}`, duration: raw.left.length / raw.sampleRate,
      } as any, {
        id: Date.now().toString() + '_wav', url: wavUrl, name: `Recording ${prev.length + 1} (WAV)`, duration: raw.left.length / raw.sampleRate,
      } as any])
      setIsRecording(false)
    }
  }
  // Custom samples upload
  const handleSamplesUpload = async (files: FileList) => {
    engine.init()
    const ctx = engine.ctx!
    const arr = Array.from(files).slice(0, 32)
    const newMap = { ...customMap }
    for (let i = 0; i < arr.length; i++) {
      const file = arr[i]
      try {
        const buf = await file.arrayBuffer()
        const audioBuf = await ctx.decodeAudioData(buf.slice(0))
        const key = `cust_${Date.now()}_${i}`
        engine.customBuffers.set(key, audioBuf)
        const padId = SOUND_BANK[i % SOUND_BANK.length].id
        newMap[padId] = { name: file.name.slice(0, 12), key }
      } catch (e) { console.warn('decode failed', file.name, e) }
    }
    setCustomMap(newMap)
  }
  // Random sound skimmer: fetches Freesound samples + randomizes patches.
  // Freesound API is ONLY used here (not in preset loading).
  const randomSkim = async () => {
    engine.init()
    // Cooldown guard — only Freesound calls are rate-limited
    if (!checkCooldown()) return
    markFetchNow()

    // Randomize pad settings and pattern
    const newSettings = { ...padSettings }
    const newChaos: any = {}
    SOUND_BANK.forEach((s) => {
      newSettings[s.id] = {
        ...newSettings[s.id],
        volume: 0.5 + Math.random() * 0.8,
        pan: (Math.random() - 0.5) * 1.6,
        pitch: Math.floor((Math.random() - 0.5) * 24),
        octave: Math.floor((Math.random() - 0.5) * 4),
        detune: Math.floor((Math.random() - 0.5) * 100),
        adsr: { a: Math.random() * 0.3, d: Math.random() * 0.6, s: Math.random(), r: Math.random() * 1.5 },
        fx: Math.random() > 0.5 ? [FX_TYPES[Math.floor(Math.random() * FX_TYPES.length)]] : [],
      }
      newChaos[s.id] = { pitch: 0.3 + Math.random() * 2, filter: 0.2 + Math.random() * 3, decay: 0.2 + Math.random() * 2.5 }
    })
    setPadSettings(newSettings); setChaosMods(newChaos)
    // Randomize the active pattern
    pushHistory(seqData)
    setSeqData((prev) => {
      const next = { ...prev }
      SOUND_BANK.forEach((s) => {
        next[s.id] = Array(80).fill(null).map(() => ({ velocity: Math.random() > 0.7 ? (Math.random() > 0.5 ? 2 : 1) : 0, length: 1, probability: 0.6 + Math.random() * 0.4 }))
      })
      return next
    })

    // Fetch Freesound samples and apply to current preset
    try {
      setFreesoundLoading(true)
      setFreesoundProgress({ loaded: 0, total: 32 })
      const kit = await generatePresetSoundKit(
        preset,
        engine.ctx!,
        (loaded, total) => setFreesoundProgress({ loaded, total }),
        true,  // forceRefresh
        true   // isReroll
      )
      const buffers = new Map<number, AudioBuffer>()
      kit.samples.forEach((sample, padIdx) => {
        if (sample.audioBuffer) buffers.set(padIdx, sample.audioBuffer)
      })
      engine.setPresetBuffers(preset, buffers)
      setFreesoundSamples(kit.samples)
      // Mark as loaded with fresh Freesound data
      setLoadedPresets(prev => new Set(prev).add(preset))
    } catch (err) {
      console.warn('[randomSkim] Freesound fetch failed:', err)
    } finally {
      setFreesoundLoading(false)
    }
  }
  // Undo / Redo
  const undo = () => {
    setHistory((h) => {
      if (h.length === 0) return h
      const prev = h[h.length - 1]
      setFuture((f) => [...f, seqData])
      setSeqData(prev)
      return h.slice(0, -1)
    })
  }
  const redo = () => {
    setFuture((f) => {
      if (f.length === 0) return f
      const nxt = f[f.length - 1]
      setHistory((h) => [...h, seqData])
      setSeqData(nxt)
      return f.slice(0, -1)
    })
  }
  // Copy / Paste pattern between pads
  const copyPattern = () => setClipboardPattern(seqData[activePadId] ? JSON.parse(JSON.stringify(seqData[activePadId])) : null)
  const pastePattern = () => {
    if (!clipboardPattern) return
    pushHistory(seqData)
    setSeqData((prev) => ({ ...prev, [activePadId]: JSON.parse(JSON.stringify(clipboardPattern)) }))
  }
  // Kit snapshots
  const saveSnapshot = () => {
    setSnapshots((s) => [...s, { id: Date.now().toString(), name: `Kit ${s.length + 1}`, padSettings: JSON.parse(JSON.stringify(padSettings)), customMap: { ...customMap }, masterFilterType, masterFilterFreq, macros: { ...macros } }])
  }
  const loadSnapshot = (snap: KitSnapshot) => {
    setPadSettings(snap.padSettings); setCustomMap(snap.customMap); setMasterFilterType(snap.masterFilterType); setMasterFilterFreq(snap.masterFilterFreq); setMacros(snap.macros)
  }
  // Chord generator: stamp a chord pattern onto the active (chord) pad
  const generateChord = () => {
    const root = NOTES.indexOf(chordKey)
    const intervals = chordMood === 'major' ? [0, 4, 7]
      : chordMood === 'minor' ? [0, 3, 7]
      : chordMood === 'dark' ? [0, 3, 6, 10]
      : [0, 4, 7, 11]
    // Apply chord by setting pad pitch to root and stamping 4 hits per bar
    pushHistory(seqData)
    setPadSettings((p) => ({ ...p, [activePadId]: { ...p[activePadId], pitch: root, octave: 0 } }))
    setSeqData((prev) => {
      const next = { ...prev }
      const seq = Array(80).fill(null).map(() => ({ velocity: 0, length: 1, probability: 1 }))
      for (let bar = 0; bar < 4; bar++) {
        const idx = bar * 16
        seq[idx] = { velocity: 2, length: 4, probability: 1 }
      }
      next[activePadId] = seq
      return next
    })
    console.log('Chord generated:', chordKey, chordMood, intervals)
  }
  // Live resampling: record next 2 seconds and assign to a pad
  const liveResample = async (padId: string) => {
    engine.init()
    setResamplingFor(padId)
    engine.startRawRecording()
    await new Promise((r) => setTimeout(r, 2000))
    const raw = engine.stopRawRecording()
    if (raw.left.length === 0) { setResamplingFor(null); return }
    const ctx = engine.ctx!
    const buf = ctx.createBuffer(2, raw.left.length, raw.sampleRate)
    buf.copyToChannel(raw.left as any, 0); buf.copyToChannel(raw.right as any, 1)
    const key = `resamp_${Date.now()}`
    engine.customBuffers.set(key, buf)
    setCustomMap((m) => ({ ...m, [padId]: { name: 'Resamp', key } }))
    setResamplingFor(null)
  }
  // Scene launch: queue variation to swap on next bar
  const queueScene = (vid: string) => setPendingSceneId(vid)
  // Step condition cycle (right-click extension)
  const cycleStepCondition = (padId: string, stepIdx: number) => {
    const order = [undefined, '1in2', '1in4', 'fill']
    pushHistory(seqData)
    setSeqData((prev) => {
      const next = { ...prev }
      const seq = [...next[padId]]
      const cur = (seq[stepIdx] as any).condition
      const i = order.indexOf(cur)
      const newCond = order[(i + 1) % order.length]
      seq[stepIdx] = { ...seq[stepIdx], condition: newCond } as any
      next[padId] = seq
      return next
    })
  }
  const activeSound = SOUND_BANK.find((s) => s.id === activePadId)
  const activeColor = activeSound ? activeSound.color : 'bg-pink-500'
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col overflow-x-hidden select-none">
      <style>{`
        @media (max-width: 640px) {
          /* Step sequencer grid rows must be at least 36px tall */
          .daw-seq-grid > div { min-height: 36px !important; }
          .daw-seq-grid > div > div { aspect-ratio: 1 !important; min-height: 32px !important; }
          /* Transport header: keep play/record prominent, shrink secondary controls */
          .daw-transport { padding: 8px 10px !important; gap: 8px !important; }
          .daw-transport .daw-secondary { display: none !important; }
          .daw-toolbar { font-size: 10px !important; padding: 4px 8px !important; gap: 4px !important; }
          .daw-toolbar > * { font-size: 10px !important; }
          /* Preset selector: smaller pills */
          .daw-presets button { padding: 4px 10px !important; font-size: 11px !important; }
          /* Sequencer section padding */
          .daw-seq-section { padding: 10px !important; }
          /* Mixer strip: compact */
          .daw-mixer { flex-wrap: wrap; gap: 8px !important; }
          /* Overall layout */
          .min-h-screen { overflow-x: hidden; }
        }
      `}</style>
      {/* TOP TRANSPORT BAR */}
      <header className="daw-transport bg-slate-900 border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className={`p-3 rounded-full flex items-center justify-center transition-colors ${isPlaying ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 hover:bg-slate-700 text-amber-500'}`}
          >
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" className="ml-1" />
            )}
          </button>
          <button
            onClick={toggleRecordWav}
            className={`p-3 rounded-full flex items-center justify-center transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-red-500'}`}
          >
            {isRecording ? (
              <Square size={18} fill="currentColor" />
            ) : (
              <Circle size={18} fill="currentColor" />
            )}
          </button>

          <div className="flex flex-col ml-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setBpmDraft(bpm); setBpmModalOpen(true) }}
                title="Click to enter exact BPM"
                className="text-xs font-bold text-amber-300 w-8 hover:text-white underline decoration-dotted"
              >
                {bpm}
              </button>
              <input
                type="range"
                min="40"
                max="300"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-24 accent-amber-500"
              />
            </div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">
              BPM
            </span>
          </div>
        </div>

        <div className="daw-secondary flex items-center gap-4 bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
          <div className="flex flex-col items-center">
            <select
              value={timeSig}
              onChange={(e) => setTimeSig(e.target.value as TimeSignature)}
              className="bg-slate-800 text-xs text-slate-200 rounded px-2 py-1 outline-none border border-slate-700"
            >
              {TIME_SIGNATURES.map((ts) => (
                <option key={ts} value={ts}>
                  {ts}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-500 mt-1 uppercase">
              Time Sig
            </span>
          </div>

          <div className="w-px h-8 bg-slate-800"></div>

          <div className="flex flex-col items-center">
            <div className="flex bg-slate-800 rounded p-0.5">
              <button
                onClick={() => setHalfMode(false)}
                className={`px-2 py-1 text-xs rounded ${!halfMode ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
              >
                Standard
              </button>
              <button
                onClick={() => setHalfMode(true)}
                className={`px-2 py-1 text-xs rounded ${halfMode ? 'bg-slate-600 text-white' : 'text-slate-400'}`}
              >
                Half Mode
              </button>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 uppercase">
              Resolution
            </span>
          </div>

          <div className="w-px h-8 bg-slate-800"></div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 w-6">{swing}%</span>
              <input
                type="range"
                min="0"
                max="60"
                value={swing}
                onChange={(e) => setSwing(Number(e.target.value))}
                className="w-16 accent-purple-500"
              />
            </div>
            <span className="text-[10px] text-slate-500 uppercase">Swing</span>
          </div>

          <div className="w-px h-8 bg-slate-800"></div>

          <div className="flex gap-3">
            <label className="flex flex-col items-center cursor-pointer">
              <input
                type="checkbox"
                checked={humanize}
                onChange={(e) => setHumanize(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-8 h-4 rounded-full transition-colors relative ${humanize ? 'bg-green-500' : 'bg-slate-700'}`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${humanize ? 'translate-x-4' : ''}`}
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 uppercase">
                Human
              </span>
            </label>
            <label className="flex flex-col items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAmbient}
                onChange={(e) => setIsAmbient(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-8 h-4 rounded-full transition-colors relative ${isAmbient ? 'bg-cyan-500' : 'bg-slate-700'}`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${isAmbient ? 'translate-x-4' : ''}`}
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 uppercase">
                Ambient
              </span>
            </label>
          </div>
        </div>

        <div className="daw-secondary flex items-center gap-3">
          <button
            onClick={mutateBeat}
            className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 rounded flex flex-col items-center"
            title="Mutate Beat"
          >
            <Dna size={16} />
            <span className="text-[8px] uppercase mt-1">Mutate</span>
          </button>
          <button
            onClick={generateChaosKit}
            className="p-2 text-fuchsia-400 hover:text-fuchsia-300 hover:bg-slate-800 rounded flex flex-col items-center"
            title="Chaos Kit"
          >
            <CloudRain size={16} />
            <span className="text-[8px] uppercase mt-1">Chaos</span>
          </button>
          <div className="w-px h-8 bg-slate-800"></div>
          <div className="flex items-center gap-2">
            <Volume2 size={16} className="text-slate-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20 accent-slate-400"
            />
          </div>
        </div>
      </header>

      {/* PRESET SELECTOR */}
      {/* === ADDITIVE STUDIO RACK === */}
      <div className="daw-toolbar bg-slate-900/70 border-b border-slate-800 px-3 py-2 flex flex-wrap items-center gap-2 text-xs">
        {/* Undo / Redo / Copy / Paste */}
        <div className="flex items-center gap-1 bg-slate-950 rounded-lg p-1 border border-slate-800">
          <button onClick={undo} title="Undo" className="p-1.5 hover:bg-slate-800 rounded text-slate-300"><Undo2 size={14} /></button>
          <button onClick={redo} title="Redo" className="p-1.5 hover:bg-slate-800 rounded text-slate-300"><Redo2 size={14} /></button>
          <button onClick={copyPattern} title="Copy active pad pattern" className="p-1.5 hover:bg-slate-800 rounded text-slate-300"><Copy size={14} /></button>
          <button onClick={pastePattern} title="Paste to active pad" className={`p-1.5 hover:bg-slate-800 rounded ${clipboardPattern ? 'text-emerald-400' : 'text-slate-500'}`}><ClipboardPaste size={14} /></button>
        </div>
        {/* Live Record */}
        <button onClick={() => setLiveRecord((v) => !v)} title="Live Record: tap pads to write into grid" className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border ${liveRecord ? 'bg-red-600 border-red-400 text-white animate-pulse' : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'}`}>
          <Mic size={14} /> Live Rec
        </button>
        {/* Scene Mode */}
        <button onClick={() => setSceneMode((v) => !v)} className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border ${sceneMode ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'}`}>
          <Zap size={14} /> Scene {sceneMode ? 'ON' : 'OFF'}
        </button>
        {pendingSceneId && (
          <span className="text-amber-400 animate-pulse">▶ Queued: {variations.find((v) => v.id === pendingSceneId)?.name}</span>
        )}
        {/* Custom Mode */}
        <button
          onClick={() => {
            const next = !customMode
            setCustomMode(next)
            if (next) loadPersistedCustomKit()
          }}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border ${customMode ? 'bg-emerald-700 border-emerald-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'}`}
          title="Drag audio files onto pads. Trim, name and save."
        >
          <Upload size={14} /> Custom Mode {customMode ? 'ON' : 'OFF'}
        </button>
        {customMode && (
          <>
            <label className="flex items-center gap-1 px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 hover:text-white cursor-pointer">
              <Upload size={14} /> Add Files
              <input type="file" accept="audio/*" multiple className="sr-only" onChange={(e) => e.target.files && handleSamplesUpload(e.target.files)} />
            </label>
            <button onClick={persistCustomKit} className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300 hover:text-white">Save Kit</button>
            <button onClick={() => { setCustomMap({}); engine.customBuffers.clear(); localStorage.removeItem(CUSTOM_SAVE_KEY) }} className="px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-red-400">Clear</button>
          </>
        )}
        {/* Random Skim */}
        <button onClick={randomSkim} className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gradient-to-r from-fuchsia-700 to-indigo-700 text-white hover:opacity-90">
          <Wand2 size={14} /> Random Skim
        </button>
        {/* Reroll Sounds — reload preset sounds from Freesound API (query system, full duration) */}
        <button
          onClick={() => {
            rerolledPresetsRef.current.add(preset)
            setLoadedPresets(prev => { const n = new Set(prev); n.delete(preset); return n })
          }}
          title="Fetch new sounds for this preset using the query system (ignores pre-vetted defaults)"
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gradient-to-r from-violet-700 to-pink-700 text-white hover:opacity-90"
        >
          <Wand2 size={14} /> Reroll Sounds
        </button>
        {/* Snapshots */}
        <button onClick={saveSnapshot} className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white">
          <Camera size={14} /> Snapshot
        </button>
        {snapshots.length > 0 && (
          <select onChange={(e) => { const s = snapshots.find((x) => x.id === e.target.value); if (s) loadSnapshot(s) }} className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-300">
            <option>Load Kit…</option>
            {snapshots.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
        {/* Hz Pass (formerly Master FX) */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5">
          <FilterIcon size={14} className="text-cyan-400" />
          <select value={masterFilterType} onChange={(e) => setMasterFilterType(e.target.value as any)} className="bg-transparent text-slate-300 text-xs">
            <option value="off">Hz Pass: Off</option>
            <option value="lowpass">Lowpass</option>
            <option value="highpass">Highpass</option>
          </select>
          <input type="range" min={80} max={12000} step={10} value={masterFilterFreq} onChange={(e) => setMasterFilterFreq(Number(e.target.value))} className="w-24 accent-cyan-500" />
          <span className="text-[10px] text-slate-500 w-12">{masterFilterFreq}Hz</span>
        </div>
        {/* Auto-Master toggle */}
        <button
          onClick={() => setAutoMaster((v) => !v)}
          title="Live auto-mastering — compressor + brick-wall limiter to keep mix loud and clipping-free."
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border ${autoMaster ? 'bg-rose-700 border-rose-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'}`}
        >
          <Sparkles size={14} /> Auto-Master {autoMaster ? 'ON' : 'OFF'}
        </button>
        {/* Metronome */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5">
          <button
            onClick={() => setMetronomeOn(v => !v)}
            title="Metronome — synced click track"
            className={`flex items-center gap-1 text-xs px-1 py-0.5 rounded transition-colors ${metronomeOn ? 'text-amber-400' : 'text-slate-400 hover:text-white'}`}
          >
            <svg width="11" height="14" viewBox="0 0 11 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
              <polyline points="5.5,1 10,13 1,13" />
              <line x1="5.5" y1="1" x2="5.5" y2="13" strokeDasharray="1.5,1.5" strokeWidth="0.7"/>
              <line x1="5.5" y1="7.5" x2="8.5" y2="4.5" strokeWidth="1.6"/>
            </svg>
            Metro {metronomeOn ? 'ON' : 'OFF'}
          </button>
          <select
            value={metronomeRate}
            onChange={e => setMetronomeRate(e.target.value as typeof metronomeRate)}
            className="bg-transparent text-slate-300 text-xs border-none outline-none cursor-pointer"
            title="Metronome rate"
          >
            <option value="half">½</option>
            <option value="quarter">¼</option>
            <option value="eighth">⅛</option>
            <option value="sixteenth">1/16</option>
          </select>
        </div>
        {/* Favorites view */}
        <button
          onClick={() => setFavoritesViewOpen(true)}
          title={`Favorites (${favorites.length}/32) — saved per device`}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-amber-300"
        >
          <Star size={14} className={favorites.length > 0 ? 'text-amber-400 fill-amber-400' : ''} />
          <span className="text-xs">Favorites ({favorites.length})</span>
        </button>
        {/* Favorites Mode — maps 32 pads to your saved favorites */}
        <button
          onClick={() => setFavoritesMode(m => !m)}
          title="Favorites Mode: play your 32 saved favorites as pads"
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            favoritesMode
              ? 'bg-amber-500 border-amber-400 text-slate-950'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-amber-300'
          }`}
        >
          <Star size={14} className={favoritesMode ? 'fill-slate-950' : ''} />
          Fav Mode
        </button>
        {/* === EFFECTS RACK WITH LED INDICATORS === */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 flex-wrap max-w-full">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-1">FX Rack</span>
          {EFFECT_LIST.map((eff) => {
            const scope = effectScopes[eff]
            const curOn = (perPadEffects[activePadId] || new Set()).has(eff)
            const isWholeOn = scope === 'whole'
            const isCurrentOn = scope === 'current' && curOn
            const isSelectionOn = scope === 'selection'
            const isAnyOn = isWholeOn || isCurrentOn || isSelectionOn
            return (
              <div key={eff} className="flex flex-col items-center gap-0.5 p-1 bg-slate-900/50 rounded border border-slate-800">
                {/* Effect name with LED indicator */}
                <div className="flex items-center gap-1">
                  {/* Red LED indicator */}
                  <div className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    isAnyOn 
                      ? 'bg-red-500 shadow-[0_0_6px_2px_rgba(239,68,68,0.6)]' 
                      : 'bg-slate-700'
                  }`} />
                  <span className={`text-[9px] font-medium ${isAnyOn ? 'text-white' : 'text-slate-500'}`}>{eff}</span>
                </div>
                {/* Scope buttons */}
                <div className="flex gap-0.5">
                  <button
                    title={`${eff}: Whole Track - applies to entire output`}
                    onClick={() => setEffectScope(eff, isWholeOn ? 'off' : 'whole')}
                    className={`text-[7px] px-1 py-0.5 rounded transition-all ${
                      isWholeOn 
                        ? 'bg-rose-600 text-white ring-1 ring-rose-400 shadow-[0_0_4px_rgba(244,63,94,0.5)]' 
                        : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300'
                    }`}
                  >
                    WHL
                  </button>
                  <button
                    title={`${eff}: Current Instrument - applies to selected pad only`}
                    onClick={() => {
                      if (isCurrentOn) {
                        setEffectScope(eff, 'off')
                        toggleCurrentInstFx(eff)
                      } else {
                        setEffectScope(eff, 'current')
                        setPerPadEffects((p) => {
                          const np = { ...p }
                          const s = new Set(np[activePadId] || [])
                          s.add(eff)
                          np[activePadId] = s
                          return np
                        })
                      }
                    }}
                    className={`text-[7px] px-1 py-0.5 rounded transition-all ${
                      isCurrentOn 
                        ? 'bg-indigo-600 text-white ring-1 ring-indigo-400 shadow-[0_0_4px_rgba(99,102,241,0.5)]' 
                        : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300'
                    }`}
                  >
                    CUR
                  </button>
                  <button
                    title={`${eff}: Selection - applies to steps placed while active`}
                    onClick={() => setEffectScope(eff, isSelectionOn ? 'off' : 'selection')}
                    className={`text-[7px] px-1 py-0.5 rounded transition-all ${
                      isSelectionOn 
                        ? 'bg-amber-600 text-white ring-1 ring-amber-400 shadow-[0_0_4px_rgba(245,158,11,0.5)]' 
                        : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300'
                    }`}
                  >
                    SEL
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        {/* Macro Knobs */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5">
          <Sparkles size={14} className="text-fuchsia-400" />
          {(['chaos', 'darkness', 'width'] as const).map((k) => (
            <div key={k} className="flex flex-col items-center">
              <input type="range" min={0} max={1} step={0.01} value={(macros as any)[k]} onChange={(e) => setMacros((m) => ({ ...m, [k]: Number(e.target.value) }))} className="w-16 accent-fuchsia-500" />
              <span className="text-[9px] text-slate-500 uppercase">{k}</span>
            </div>
          ))}
        </div>
        {/* Chord generator */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5">
          <Music2 size={14} className="text-emerald-400" />
          <select value={chordKey} onChange={(e) => setChordKey(e.target.value)} className="bg-transparent text-slate-300 text-xs">
            {NOTES.map((n) => <option key={n}>{n}</option>)}
          </select>
          <select value={chordMood} onChange={(e) => setChordMood(e.target.value as any)} className="bg-transparent text-slate-300 text-xs">
            <option value="major">major</option><option value="minor">minor</option><option value="dark">dark</option><option value="dreamy">dreamy</option>
          </select>
          <button onClick={generateChord} className="px-2 py-0.5 bg-emerald-700 rounded text-white text-[10px]">Stamp</button>
        </div>
        {/* Live resample */}
        <button onClick={() => liveResample(activePadId)} className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border ${resamplingFor ? 'bg-red-700 border-red-400 text-white animate-pulse' : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'}`}>
          <Mic size={14} /> {resamplingFor ? 'Resampling…' : 'Resample → Pad'}
        </button>
        {/* Custom map indicator */}
        {Object.keys(customMap).length > 0 && (
          <span className="text-emerald-400 text-[10px]">{Object.keys(customMap).length} pads using custom samples</span>
        )}
      </div>
      <div className="daw-presets bg-slate-900/50 border-b border-slate-800/50 px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => {
              setPreset(p)
              setChaosMods(null)
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${preset === p && !chaosMods ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={async () => {
            if (!checkCooldown()) return
            await clearPresetCache(preset)
            setLoadedPresets((prev) => {
              const next = new Set(prev)
              next.delete(preset)
              return next
            })
          }}
          disabled={freesoundLoading}
          title="Re-roll this preset's sound kit from Freesound"
          className="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white flex items-center gap-1"
        >
          <Shuffle size={12} /> Re-roll Kit
        </button>
        {freesoundLoading && (
          <div className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-slate-800 text-amber-300 border border-amber-700/50 animate-pulse flex items-center gap-2">
            <Sparkles size={12} /> Loading {freesoundProgress.loaded}/{freesoundProgress.total} samples…
          </div>
        )}
        {chaosMods && (
          <div className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap bg-fuchsia-600 text-white animate-pulse">
            Chaos Kit Active
          </div>
        )}
      </div>

      <main className="flex-1 flex flex-col p-4 gap-6 max-w-7xl mx-auto w-full">
        {/* SEQUENCER GRID */}
        <section className="daw-seq-section bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-2xl relative">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${activeColor}`} />
                {activeSound?.label || 'Select Pad'}
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPadTimingMode(p => ({ ...p, [activePadId]: getTimingMode(activePadId) === 'timing' ? 'snip' : 'timing' }))}
                className={`px-3 py-1 text-xs rounded border ${getTimingMode(activePadId) === 'snip' ? 'bg-cyan-700 border-cyan-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
                title="Timing Mode: sound rings out naturally. Snip Mode: sound cut to exact step length."
              >
                {getTimingMode(activePadId) === 'snip' ? '✂ Snip' : '⏱ Timing'}
              </button>
              <button
                onClick={clearCurrentPad}
                className="px-3 py-1 text-xs rounded bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
              >
                Clear Pad
              </button>
              <button
                onClick={clearAll}
                className="px-3 py-1 text-xs rounded bg-red-900/30 text-red-400 hover:text-red-300 border border-red-900/50"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="daw-seq-grid flex flex-col gap-1">
            {Array.from({
              length: 4,
            }).map((_, row) => (
              <div key={row} className="flex gap-1 relative">
                {Array.from({
                  length: stepsPerBar,
                }).map((_, col) => {
                  const uiCol = row * stepsPerBar + col
                  const dataIdx = halfMode ? uiCol : uiCol * 2
                  const stepData = seqData[activePadId]?.[dataIdx] || {
                    velocity: 0,
                    length: 1,
                  }
                  const isActive = stepData.velocity > 0
                  const isPlayhead =
                    isPlaying && !isArrangementPlaying && uiStep === uiCol
                  // Beat dividers
                  const isBeatBoundary = col % subdivision === 0
                  // Stretch visual logic
                  let stretchWidth = '100%'
                  if (isActive && stepData.length > 1) {
                    // Calculate how many UI columns this stretch covers
                    const lengthInUiCols = halfMode
                      ? stepData.length
                      : Math.ceil(stepData.length / 2)
                    stretchWidth = `calc(${lengthInUiCols * 100}% + ${(lengthInUiCols - 1) * 4}px)`
                  }
                  return (
                    <div
                      key={col}
                      onMouseEnter={() => handleStepMouseEnter(uiCol)}
                      className={`flex-1 relative aspect-[2/1] sm:aspect-square ${isBeatBoundary ? 'border-l-2 border-slate-700/50' : ''}`}
                    >
                      <div
                        onMouseDown={(e) => handleStepMouseDown(uiCol, e)}
                        onContextMenu={(e) => {
                          e.preventDefault()
                          setEditingCell({
                            padId: activePadId,
                            stepIdx: dataIdx,
                          })
                        }}
                        style={{
                          width: stretchWidth,
                          zIndex: isActive ? 10 : 1,
                        }}
                        className={`
                          absolute top-0 left-0 h-full rounded-md cursor-pointer transition-all duration-75 overflow-hidden
                          ${isActive ? `${activeColor} opacity-80` : 'bg-slate-800 hover:bg-slate-700'}
                          ${isPlayhead ? 'ring-2 ring-white ring-inset scale-[1.02] z-20' : ''}
                        `}
                      >
                        {stepData.probability &&
                          stepData.probability < 1 &&
                          isActive && (
                            <span className="absolute top-0.5 right-0.5 text-[8px] font-bold text-white/70">
                              {Math.round(stepData.probability * 100)}%
                            </span>
                          )}
                        {isActive && activeSound?.stretchable && (
                          <div
                            className="absolute top-0 right-0 h-full w-2 cursor-ew-resize bg-white/30 hover:bg-white/60 transition-colors rounded-r-md"
                            onMouseDown={(e) => { e.stopPropagation(); handleStepStretchStart(uiCol) }}
                          />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </section>

        {/* PERFORMANCE PADS & MIXER */}
        <section className="flex flex-col gap-4">
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Performance Pads
              </h2>
              <div className="md:hidden flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                <button
                  onClick={() => setMobileSide('A')}
                  className={`px-4 py-1 text-xs font-bold rounded-md ${mobileSide === 'A' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
                >
                  1-16
                </button>
                <button
                  onClick={() => setMobileSide('B')}
                  className={`px-4 py-1 text-xs font-bold rounded-md ${mobileSide === 'B' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
                >
                  17-32
                </button>
              </div>
            </div>

            {/* Favorites mode banner */}
            {favoritesMode && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
                <Star size={12} className="fill-amber-400 text-amber-400 flex-shrink-0" />
                <span><strong>Favorites Mode</strong> — pads show your {favorites.length} saved favorite{favorites.length !== 1 ? 's' : ''}. Grey pads are empty slots.</span>
              </div>
            )}
            <div className={`grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3`}>
              {SOUND_BANK.map((sound, index) => {
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  if (mobileSide === 'A' && index >= 16) return null
                  if (mobileSide === 'B' && index < 16) return null
                }
                // Favorites mode: override pad display and click with favorite data
                const fav = favoritesMode ? favorites[index] : null
                const favEmpty = favoritesMode && !fav
                const padLabel = fav ? fav.label : (!!customMap[sound.id] ? customMap[sound.id].name : sound.label)
                const padColor = fav ? fav.color : sound.color

                const isSelected = activePadId === sound.id
                const pSettings = padSettings[sound.id]
                const hasCustom = !!customMap[sound.id]
                const dimmed = favEmpty || (customMode && !hasCustom && !favoritesMode)

                const handleFavPadClick = () => {
                  if (favEmpty) return
                  engine.init()
                  if (!engine.ctx) return
                  const ctx = engine.ctx
                  // Play from stored preview URL or re-synthesize
                  if (fav!.previewUrl) {
                    loadAndCacheAudio(fav!.previewUrl, ctx).then(buf => {
                      if (buf) {
                        const src = ctx.createBufferSource(); src.buffer = buf
                        const g = ctx.createGain(); g.gain.value = 0.8
                        src.connect(g); g.connect(ctx.destination); src.start()
                      }
                    }).catch(() => {
                      // fallback: re-synthesize
                      const presetIdx = Math.max(0, PRESETS.indexOf(preset))
                      catalogSynth(presetIdx, index % 2, fav!.category).then(buf => {
                        const src = ctx.createBufferSource(); src.buffer = buf
                        const g = ctx.createGain(); g.gain.value = 0.8
                        src.connect(g); g.connect(ctx.destination); src.start()
                      })
                    })
                  } else {
                    // synthesized — re-synth from stored info
                    const presetIdx = Math.max(0, PRESETS.indexOf(preset))
                    catalogSynth(presetIdx, index % 2, fav!.category).then(buf => {
                      const src = ctx.createBufferSource(); src.buffer = buf
                      const g = ctx.createGain(); g.gain.value = 0.8
                      src.connect(g); g.connect(ctx.destination); src.start()
                    })
                  }
                  if (activePadId !== sound.id) { setPrevPadId(activePadId); setActivePadId(sound.id) }
                }

                return (
                  <motion.button
                    key={sound.id}
                    whileTap={{ scale: 0.92 }}
                    onMouseDown={() => {
                      if (dimmed) return
                      if (favoritesMode) handleFavPadClick()
                      else handlePadClick(sound, index)
                    }}
                    onContextMenu={(e: React.MouseEvent) => {
                      e.preventDefault()
                      if (!favoritesMode) setEditingPad(sound.id)
                    }}
                    onDragOver={(e: React.DragEvent) => { if (customMode && !favoritesMode) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' } }}
                    onDrop={async (e: React.DragEvent) => {
                      if (!customMode || favoritesMode) return
                      e.preventDefault()
                      const file = e.dataTransfer.files?.[0]
                      if (!file) return
                      engine.init()
                      const ctx = engine.ctx!
                      try {
                        const ab = await file.arrayBuffer()
                        const buf = await ctx.decodeAudioData(ab)
                        setPendingAssign({
                          padId: sound.id,
                          buf,
                          sourceName: file.name,
                          trimStart: 0,
                          trimEnd: 1,
                          name: file.name.replace(/\.[^/.]+$/, '').slice(0, 16),
                        })
                      } catch { alert('Could not decode that audio file.') }
                    }}
                    className={`
                      aspect-square rounded-xl flex flex-col items-center justify-center relative overflow-hidden shadow-lg
                      ${favEmpty ? 'bg-slate-800' : padColor} bg-opacity-90 hover:bg-opacity-100 transition-all
                      ${isSelected && !favoritesMode ? 'ring-4 ring-white ring-offset-2 ring-offset-slate-900 z-10 scale-105' : ''}
                      ${favoritesMode && fav ? 'ring-2 ring-amber-400/60' : ''}
                      ${dimmed ? 'opacity-30 grayscale cursor-not-allowed' : ''}
                      ${customMode && hasCustom && !favoritesMode ? 'ring-2 ring-emerald-400' : ''}
                    `}
                  >
                    <span className="text-white font-bold text-xs sm:text-sm drop-shadow-md z-10 text-center px-1">
                      {favEmpty ? `${index + 1}` : padLabel}
                    </span>
                    {fav && (
                      <span className="absolute bottom-1 left-1 text-[8px] text-amber-200 bg-amber-900/80 rounded px-1">{fav.category.slice(0, 3).toUpperCase()}</span>
                    )}
                    {!favoritesMode && customMode && hasCustom && (
                      <span className="absolute bottom-1 left-1 text-[8px] text-emerald-200 bg-emerald-900/80 rounded px-1">SMP</span>
                    )}
                    {pSettings?.fx.length > 0 && (
                      <div className="absolute top-1 right-1 flex gap-0.5">
                        {pSettings.fx.map((f, i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-white/80"
                          />
                        ))}
                      </div>
                    )}
                    {/* Favorite star — top-left */}
                    <span
                      role="button"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation()
                        toggleFavoriteRef.current(index, sound)
                      }}
                      title={(() => {
                        const meta = freesoundSamples.get(index)
                        const sid = meta?.id ?? -(index + 1)
                        return favorites.some(f => f.sourceId === sid) ? 'Unfavorite' : 'Favorite this sound'
                      })()}
                      className="absolute top-1 left-1 w-4 h-4 flex items-center justify-center cursor-pointer hover:scale-125 transition-transform z-20"
                    >
                      {(() => {
                        const meta = freesoundSamples.get(index)
                        const sid = meta?.id ?? -(index + 1)
                        const fav = favorites.some(f => f.sourceId === sid)
                        return (
                          <Star
                            size={12}
                            className={fav ? 'text-amber-300 fill-amber-300 drop-shadow' : 'text-white/60 hover:text-white'}
                          />
                        )
                      })()}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* PER-PAD MIXER STRIP */}
          <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 flex items-center gap-4">
            <div className="flex items-center gap-2 min-w-[100px]">
              <div className={`w-3 h-3 rounded-full ${activeColor}`} />
              <span className="text-sm font-bold">{activeSound?.label}</span>
            </div>

            <div className="flex items-center gap-2">
              <Volume2 size={14} className="text-slate-400" />
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.01"
                value={padSettings[activePadId]?.volume || 1}
                onChange={(e) =>
                  setPadSettings((p) => ({
                    ...p,
                    [activePadId]: {
                      ...p[activePadId],
                      volume: Number(e.target.value),
                    },
                  }))
                }
                className="w-20 accent-slate-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Pan</span>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.01"
                value={padSettings[activePadId]?.pan || 0}
                onChange={(e) =>
                  setPadSettings((p) => ({
                    ...p,
                    [activePadId]: {
                      ...p[activePadId],
                      pan: Number(e.target.value),
                    },
                  }))
                }
                className="w-20 accent-slate-400"
              />
            </div>

            <button className="px-2 py-1 text-xs rounded bg-slate-800 text-slate-400 hover:text-white">
              Mute
            </button>
            <button className="px-2 py-1 text-xs rounded bg-slate-800 text-slate-400 hover:text-amber-400">
              Solo
            </button>
            <button
              onClick={() => setEditingPad(activePadId)}
              className="ml-auto px-2 py-1 text-xs rounded bg-indigo-600 text-white flex items-center gap-1"
            >
              <SlidersHorizontal size={12} /> Edit Instrument
            </button>
          </div>
        </section>

        {/* TIMELINE ARRANGEMENT */}
        <section className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  engine.init()
                  if (!isArrangementPlaying) {
                    currentBeatRef.current = 0
                    setIsArrangementPlaying(true)
                    if (!isPlaying) togglePlay()
                  } else {
                    setIsArrangementPlaying(false)
                  }
                }}
                className={`${isArrangementPlaying ? 'bg-amber-500 text-slate-900' : 'bg-emerald-600 text-white'} px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-1`}
              >
                {isArrangementPlaying ? (
                  <Pause size={14} />
                ) : (
                  <Play size={14} />
                )}
                {isArrangementPlaying ? 'Stop' : 'Play Song'}
              </button>

              <select
                value={snapMode}
                onChange={(e) => setSnapMode(e.target.value as any)}
                className="bg-slate-800 text-xs text-slate-200 rounded px-2 py-1 outline-none border border-slate-700"
              >
                <option value="off">Snap: Off</option>
                <option value="beat">Snap: Beat</option>
                <option value="half-beat">Snap: 1/2 Beat</option>
                <option value="sixteenth">Snap: 1/16</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Zoom</span>
              <input
                type="range"
                min="50"
                max="300"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-20 accent-slate-400"
              />
            </div>
          </div>

          {/* Timeline Body */}
          <div className="flex relative overflow-x-auto min-h-[200px]">
            {/* Track Headers */}
            <div className="w-24 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col z-10 sticky left-0">
              <div className="h-6 border-b border-slate-800"></div>{' '}
              {/* Ruler spacer */}
              {Array.from({
                length: trackCount,
              }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 border-b border-slate-800 flex items-center px-2 justify-between bg-slate-900"
                >
                  <span className="text-[10px] font-bold text-slate-500">
                    Track {i + 1}
                  </span>
                </div>
              ))}
            </div>

            {/* Grid Area */}
            <div
              className="flex flex-col relative flex-1"
              style={{
                width: `${totalBars * beatsPerBar * ((80 * zoom) / 100)}px`,
                minWidth: '100%',
              }}
            >
              {/* Ruler */}
              <div className="h-6 border-b border-slate-800 flex relative bg-slate-950/50">
                {Array.from({
                  length: totalBars,
                }).map((_, bar) => (
                  <div
                    key={bar}
                    className="absolute h-full border-l border-slate-700 pl-1 text-[10px] text-slate-500"
                    style={{
                      left: `${bar * beatsPerBar * ((80 * zoom) / 100)}px`,
                    }}
                  >
                    {bar + 1}
                  </div>
                ))}
              </div>

              {/* Tracks */}
              <div className="relative flex-1">
                {/* Vertical Gridlines */}
                {Array.from({
                  length: totalBars * beatsPerBar,
                }).map((_, beat) => (
                  <div
                    key={beat}
                    className={`absolute top-0 bottom-0 border-l ${beat % beatsPerBar === 0 ? 'border-slate-700/50' : 'border-slate-800/30'}`}
                    style={{
                      left: `${beat * ((80 * zoom) / 100)}px`,
                    }}
                  />
                ))}

                {/* Track Lanes */}
                {Array.from({
                  length: trackCount,
                }).map((_, trackIdx) => (
                  <div
                    key={trackIdx}
                    className={`h-16 border-b border-slate-800 relative ${trackIdx % 2 === 0 ? 'bg-zinc-900/20' : 'bg-zinc-950/20'}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDropOnTrack(e, trackIdx)}
                  >
                    {/* Clips */}
                    {clips
                      .filter((c) => c.trackIdx === trackIdx)
                      .map((clip) => {
                        const variation = variations.find(
                          (v) => v.id === clip.variationId,
                        )
                        const beatPx = 80 * (zoom / 100)
                        return (
                          <div
                            key={clip.id}
                            className="absolute top-1 bottom-1 rounded bg-indigo-900/80 border border-indigo-500/50 overflow-hidden group"
                            style={{
                              left: `${clip.startBeat * beatPx}px`,
                              width: `${clip.lengthBeats * beatPx}px`,
                            }}
                          >
                            <div className="px-1 text-[8px] font-bold text-indigo-200 truncate bg-black/20 flex justify-between">
                              {variation?.name}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setClips(
                                    clips.filter((c) => c.id !== clip.id),
                                  )
                                }}
                                className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100"
                              >
                                <X size={10} />
                              </button>
                            </div>
                            {/* Mock pattern preview */}
                            <div className="absolute inset-0 top-4 opacity-30 flex items-center px-1 gap-[1px]">
                              {Array.from({
                                length: 16,
                              }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-1 w-full rounded-sm ${Math.random() > 0.5 ? 'bg-white' : ''}`}
                                />
                              ))}
                            </div>

                            {/* Trim handles */}
                            <div className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20" />
                            <div className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20" />
                          </div>
                        )
                      })}
                  </div>
                ))}

                {/* Playhead */}
                {isArrangementPlaying && (
                  <div
                    className="absolute top-0 bottom-0 w-px bg-white shadow-[0_0_10px_white] z-20 pointer-events-none"
                    style={{
                      left: `${uiBeat * ((80 * zoom) / 100)}px`,
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Variation Palette */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2 overflow-x-auto">
            <button
              onClick={saveVariation}
              className="flex-shrink-0 w-24 h-12 rounded border border-dashed border-slate-700 flex items-center justify-center text-xs text-slate-500 hover:text-white hover:border-slate-500"
            >
              + Save Var
            </button>
            {variations.map((v) => (
              <div
                key={v.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('variationId', v.id)}
                onClick={() => { if (sceneMode) queueScene(v.id); else loadVariation(v) }}
                className="flex-shrink-0 w-24 h-12 rounded bg-slate-800 border border-slate-700 p-1 cursor-grab active:cursor-grabbing hover:bg-slate-700 relative group"
              >
                <div className="text-[10px] font-bold text-slate-200 truncate">
                  {v.name}
                </div>
                <div className="text-[8px] text-slate-500">{v.timeSig}</div>
                {sceneMode && pendingSceneId === v.id && (
                  <div className="absolute inset-0 ring-2 ring-amber-400 rounded animate-pulse pointer-events-none" />
                )}
                <button
                  onClick={() =>
                    setVariations(variations.filter((x) => x.id !== v.id))
                  }
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* RECORDINGS */}
        {recordings.length > 0 && (
          <section className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Download size={16} /> Recordings
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {recordings.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-slate-800 rounded-lg p-3 flex items-center justify-between border border-slate-700"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-200">
                      {rec.name}
                    </span>
                    <span className="text-xs text-slate-500">WebM Audio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <audio
                      src={rec.url}
                      controls
                      className="h-8 w-32 hidden md:block"
                    />
                    <a
                      href={rec.url}
                      download={`${rec.name}.webm`}
                      className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors"
                    >
                      <Download size={16} />
                    </a>
                    <button
                      onClick={() =>
                        setRecordings(recordings.filter((r) => r.id !== rec.id))
                      }
                      className="p-2 text-red-400 hover:bg-slate-700 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* INSTRUMENT EDITOR MODAL */}
      <AnimatePresence>
        {editingPad && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
              className="bg-slate-900 border border-slate-700 p-4 rounded-xl w-[400px] max-w-[95vw] max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm">
                  Edit: {SOUND_BANK.find((s) => s.id === editingPad)?.label}
                </h3>
                <button
                  onClick={() => setEditingPad(null)}
                  className="text-slate-500 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 flex justify-between">
                    <span>Pitch (Semi)</span>
                    <span className="font-mono text-indigo-400">
                      {
                        NOTES[
                          (((padSettings[editingPad]?.pitch || 0) % 12) + 12) %
                            12
                        ]
                      }
                      {Math.floor((padSettings[editingPad]?.pitch || 0) / 12) +
                        (padSettings[editingPad]?.octave || 0)}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="-24"
                    max="24"
                    value={padSettings[editingPad]?.pitch || 0}
                    onChange={(e) =>
                      setPadSettings((p) => ({
                        ...p,
                        [editingPad]: {
                          ...p[editingPad],
                          pitch: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full accent-indigo-500"
                  />
                </div>

                {/* Pitch-Stretch toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Pitch Stretch</span>
                  <button
                    onClick={() =>
                      setPadSettings((p) => ({
                        ...p,
                        [editingPad]: {
                          ...p[editingPad],
                          preservesPitch: !(p[editingPad]?.preservesPitch ?? true),
                        },
                      }))
                    }
                    title={
                      (padSettings[editingPad]?.preservesPitch ?? true)
                        ? 'Stretch ON — pitch held while speed changes (standard DAW mode). Click to switch to tape/vinyl mode.'
                        : 'Stretch OFF — pitch shifts with speed (tape/vinyl). Click to switch to standard stretch mode.'
                    }
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      (padSettings[editingPad]?.preservesPitch ?? true)
                        ? 'bg-indigo-600'
                        : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                        (padSettings[editingPad]?.preservesPitch ?? true)
                          ? 'translate-x-4'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="text-xs text-slate-400 flex justify-between">
                    <span>Octave</span>{' '}
                    <span>{padSettings[editingPad]?.octave || 0}</span>
                  </label>
                  <input
                    type="range"
                    min="-3"
                    max="3"
                    value={padSettings[editingPad]?.octave || 0}
                    onChange={(e) =>
                      setPadSettings((p) => ({
                        ...p,
                        [editingPad]: {
                          ...p[editingPad],
                          octave: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full accent-indigo-500"
                  />
                </div>

                <AdsrGraphEditor
                  adsr={padSettings[editingPad]?.adsr}
                  onChange={(adsr) =>
                    setPadSettings((p) => ({
                      ...p,
                      [editingPad]: { ...p[editingPad], adsr },
                    }))
                  }
                  advanced={padSettings[editingPad]?.advanced || DEFAULT_ADVANCED_SYNTH}
                  onAdvancedChange={(advanced) =>
                    setPadSettings((p) => ({
                      ...p,
                      [editingPad]: { ...p[editingPad], advanced },
                    }))
                  }
                />

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">
                    FX Chain
                  </label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {padSettings[editingPad]?.fx.map((f) => (
                      <span
                        key={f}
                        className="text-[10px] bg-indigo-900 text-indigo-200 px-2 py-0.5 rounded flex items-center gap-1"
                      >
                        {f}{' '}
                        <X
                          size={8}
                          className="cursor-pointer hover:text-white"
                          onClick={() =>
                            setPadSettings((p) => ({
                              ...p,
                              [editingPad]: {
                                ...p[editingPad],
                                fx: p[editingPad].fx.filter((x) => x !== f),
                              },
                            }))
                          }
                        />
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {FX_TYPES.map((f) => (
                      <button
                        key={f}
                        onClick={() =>
                          setPadSettings((p) => ({
                            ...p,
                            [editingPad]: {
                              ...p[editingPad],
                              fx: [...new Set([...p[editingPad].fx, f])],
                            },
                          }))
                        }
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded border border-slate-700"
                      >
                        + {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CELL EDITOR MODAL */}
      <AnimatePresence>
        {editingCell && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
            onClick={() => setEditingCell(null)}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
              className="bg-slate-900 border border-slate-700 p-4 rounded-xl w-64 shadow-2xl"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <h3 className="font-bold text-sm mb-4">Step Probability</h3>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={
                  seqData[editingCell.padId]?.[editingCell.stepIdx]
                    ?.probability ?? 1
                }
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setSeqData((prev) => {
                    const newData = {
                      ...prev,
                    }
                    const padSeq = [...newData[editingCell.padId]]
                    padSeq[editingCell.stepIdx] = {
                      ...padSeq[editingCell.stepIdx],
                      probability: val,
                    }
                    newData[editingCell.padId] = padSeq
                    return newData
                  })
                }}
                className="w-full accent-indigo-500"
              />
              <div className="text-center text-xs text-slate-400 mt-1">
                {Math.round(
                  (seqData[editingCell.padId]?.[editingCell.stepIdx]
                    ?.probability ?? 1) * 100,
                )}
                %
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* === BPM ENTRY MODAL === */}
      <AnimatePresence>
        {bpmModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200]" onClick={() => setBpmModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 p-5 rounded-xl shadow-2xl w-72"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <h3 className="text-sm font-bold text-slate-200 mb-3">Enter exact BPM</h3>
              <input
                type="number" min={20} max={400} value={bpmDraft}
                onChange={(e) => setBpmDraft(Number(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const v = Math.max(20, Math.min(400, bpmDraft || 120))
                    setBpm(v); setBpmModalOpen(false)
                  }
                }}
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-2xl text-amber-300 text-center font-mono outline-none focus:border-amber-500"
              />
              <div className="flex gap-2 mt-3">
                <button onClick={() => setBpmModalOpen(false)} className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs">Cancel</button>
                <button
                  onClick={() => { const v = Math.max(20, Math.min(400, bpmDraft || 120)); setBpm(v); setBpmModalOpen(false) }}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold"
                >Set BPM</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* === SAMPLE TRIM + NAME MODAL (Custom Mode drop) === */}
      <AnimatePresence>
        {pendingAssign && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200]" onClick={() => setPendingAssign(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 p-5 rounded-xl shadow-2xl w-[420px] max-w-[92vw]"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <h3 className="text-sm font-bold text-slate-200 mb-1">Assign sample to pad</h3>
              <div className="text-[10px] text-slate-500 mb-3">{pendingAssign.sourceName} · {pendingAssign.buf.duration.toFixed(2)}s</div>
              <label className="text-xs text-slate-400 block mb-1">Pad name</label>
              <input
                value={pendingAssign.name}
                onChange={(e) => setPendingAssign({ ...pendingAssign, name: e.target.value.slice(0, 20) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-emerald-500 mb-3"
              />
              <label className="text-xs text-slate-400 block mb-1">Trim Start: {(pendingAssign.trimStart * pendingAssign.buf.duration).toFixed(2)}s</label>
              <input type="range" min={0} max={1} step={0.001}
                value={pendingAssign.trimStart}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  setPendingAssign({ ...pendingAssign, trimStart: Math.min(v, pendingAssign.trimEnd - 0.01) })
                }}
                className="w-full accent-emerald-500 mb-2"
              />
              <label className="text-xs text-slate-400 block mb-1">Trim End: {(pendingAssign.trimEnd * pendingAssign.buf.duration).toFixed(2)}s</label>
              <input type="range" min={0} max={1} step={0.001}
                value={pendingAssign.trimEnd}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  setPendingAssign({ ...pendingAssign, trimEnd: Math.max(v, pendingAssign.trimStart + 0.01) })
                }}
                className="w-full accent-emerald-500 mb-3"
              />
              <div className="flex gap-2">
                <button onClick={() => setPendingAssign(null)} className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs">Cancel</button>
                <button
                  onClick={() => {
                    // Slice buffer
                    const ctx = engine.ctx!
                    const src = pendingAssign.buf
                    const startSamp = Math.floor(pendingAssign.trimStart * src.length)
                    const endSamp = Math.floor(pendingAssign.trimEnd * src.length)
                    const len = Math.max(1, endSamp - startSamp)
                    const out = ctx.createBuffer(src.numberOfChannels, len, src.sampleRate)
                    for (let ch = 0; ch < src.numberOfChannels; ch++) {
                      out.getChannelData(ch).set(src.getChannelData(ch).subarray(startSamp, endSamp))
                    }
                    const key = `cust_${pendingAssign.padId}_${Date.now()}`
                    engine.customBuffers.set(key, out)
                    setCustomMap((m) => ({ ...m, [pendingAssign.padId]: { key, name: pendingAssign.name || 'sample' } }))
                    setPendingAssign(null)
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                >Assign</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* === FREESOUND RATE LIMIT COOLDOWN MODAL === */}
      <AnimatePresence>
        {cooldownOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[300] px-4"
            onClick={() => setCooldownOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-700/40 rounded-2xl shadow-2xl w-[440px] max-w-full p-6 relative"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <button
                onClick={() => setCooldownOpen(false)}
                className="absolute top-3 right-3 text-slate-500 hover:text-slate-200 transition-colors"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                  className="w-10 h-10 rounded-full bg-amber-600/20 border border-amber-500/40 flex items-center justify-center"
                >
                  <Sparkles size={18} className="text-amber-300" />
                </motion.div>
                <div>
                  <h3 className="text-base font-bold text-amber-200">Rate Limit Cooldown</h3>
                  <div className="text-[11px] text-slate-400">Freesound API · 60 req/min</div>
                </div>
              </div>
              <motion.div
                key={cooldownRemaining}
                initial={{ scale: 0.92, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                className="text-center text-4xl font-mono font-bold text-amber-300 mb-2 tabular-nums"
              >
                Please wait {cooldownRemaining} second{cooldownRemaining === 1 ? '' : 's'}…
              </motion.div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-4">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300"
                  initial={false}
                  animate={{ width: `${Math.max(0, Math.min(100, ((60 - cooldownRemaining) / 60) * 100))}%` }}
                  transition={{ duration: 0.25 }}
                />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Please wait a moment before compiling a brand new sound kit. This short 1-minute window keeps our high-fidelity sequencing engine completely free, fast, and universal for music creators everywhere!
              </p>
              <button
                onClick={() => setCooldownOpen(false)}
                className="mt-4 w-full px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Favorites view modal */}
      <AnimatePresence>
        {favoritesViewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setFavoritesViewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-5 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star size={18} className="text-amber-400 fill-amber-400" />
                  <h3 className="text-lg font-semibold text-slate-100">Favorites ({favorites.length}/32)</h3>
                </div>
                <button onClick={() => setFavoritesViewOpen(false)} className="text-slate-400 hover:text-slate-100">
                  <X size={18} />
                </button>
              </div>
              {favorites.length === 0 ? (
                <p className="text-sm text-slate-400 py-12 text-center">
                  No favorites yet. Tap the small star on any pad to save it here. Favorites are stored locally on this device.
                </p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {favorites.map(fav => (
                    <div
                      key={fav.favId}
                      className="relative rounded-lg p-2 h-20 flex items-end overflow-hidden group"
                      style={{ background: fav.color }}
                    >
                      <span className="text-[10px] font-semibold text-white drop-shadow leading-tight">{fav.label}</span>
                      <button
                        onClick={() => setFavorites(prev => prev.filter(f => f.favId !== fav.favId))}
                        title="Remove from favorites"
                        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/50 hover:bg-rose-600 flex items-center justify-center text-white"
                      >
                        <X size={10} />
                      </button>
                      <span className="absolute top-1 left-1 text-[8px] text-white/80 uppercase">{fav.category.slice(0, 3)}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">
                Favorites persist on this device via local storage. Star up to 32 sounds across any preset; oldest is replaced when full.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}