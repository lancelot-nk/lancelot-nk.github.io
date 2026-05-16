#!/usr/bin/env node
/**
 * scripts/build-daw-presets.mjs
 *
 * Curation script for public/daw-presets.json
 *
 * For each of the 27 presets × 32 pads, queries Freesound with the explicit
 * blueprint query, scores every result by name/tag/duration keyword matching,
 * picks the highest-scoring sound ID, and writes public/daw-presets.json.
 *
 * Uses a local checkpoint file (scripts/.preset-cache.json) so the script can
 * be stopped and resumed without re-fetching already-vetted pads.
 *
 * Usage:
 *   node scripts/build-daw-presets.mjs
 *   node scripts/build-daw-presets.mjs --preset "Jazz"        # single preset
 *   node scripts/build-daw-presets.mjs --force                # ignore checkpoint
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_JSON = path.join(ROOT, 'public', 'daw-presets.json')
const CHECKPOINT = path.join(__dirname, '.preset-cache.json')

const API_TOKEN = 'd37DSk0vV5S7Cc2DwOaeiuMizrwneXAYz4FBQjqX'
const API_BASE = 'https://freesound.org/apiv2/search/text/'
const RATE_DELAY = 1200  // ms between requests — conservative to avoid rate limit (500 req/day)
const MAX_RETRIES = 3    // retries on 429/403 with exponential backoff

// ─────────────────────────────────────────────────────────────────────────────
// PRESET BLUEPRINTS  (mirrored from nearfinaldaw.tsx)
// ─────────────────────────────────────────────────────────────────────────────
const FULL_PRESET_BLUEPRINTS = {
  'Dubstep Club': {
    pageOffset:0, resultOffset:0,
    long:   ['heavy bass synth pad sustain','dubstep wobble bass drone','dark electronic atmosphere'],
    medium: ['dubstep bass wobble loop','electronic synth arp loop','dark underground beat loop'],
    short:  ['glitch stutter electronic fx','synth laser zap hit','rise sweep synth fx'],
    chord:  ['dark minor synth chord electronic','sub bass chord stab electronic','distorted synth chord hit'],
    inst:   ['wobble bass synth hit','electric bass guitar hit heavy','synth pluck electronic note','distorted guitar hit electric'],
    snare:  ['electronic snare crack hit tight','clap hit electronic sharp'],
    drum:   ['electronic tom hit low','rimshot electronic hit'],
    kick:   ['sub bass heavy kick drum','electronic bass kick drum hit'],
    bass:   ['bass drop synth hit','wobble bass loop synth'],
    hihat:  ['closed hihat electronic tight crisp','hihat click metallic tight'],
    fill:   ['breakbeat drum fill electronic','drum roll electronic break'],
    perc:   ['industrial shaker loop electronic','electronic cowbell percussion loop'],
    vocal:  ['robotic vocal chop effect','electronic vocal sample phrase'],
  },
  'Trap Soul': {
    pageOffset:1, resultOffset:1,
    long:   ['soul r&b pad atmospheric warm','dark hiphop ambient texture','trap soul synth sustain'],
    medium: ['trap hiphop melody loop','soul piano melody riff loop','dark trap beat loop'],
    short:  ['trap hi hat roll short','vinyl record scratch fx','trap zing riser fx'],
    chord:  ['soul piano chord minor warm','dark r&b chord progression','trap synth chord stab'],
    inst:   ['soul piano riff warm','trap 808 bass hit sub','acoustic guitar soul warm','rhodes electric piano soul'],
    snare:  ['trap snare crack hit dry','hiphop clap hit sharp'],
    drum:   ['trap tom rimshot hit','acoustic tom hit hip hop'],
    kick:   ['808 trap kick thump sub','deep bass kick trap hit'],
    bass:   ['808 bass trap sub hit','sub bass hiphop note deep'],
    hihat:  ['trap closed hihat tight hit','hip hop hi-hat click sharp'],
    fill:   ['trap drum fill roll break','hiphop snare roll fill'],
    perc:   ['hiphop shaker loop rhythm','trap tambourine loop rhythm'],
    vocal:  ['soul female vocal phrase warm','trap vocal chop sample'],
  },
  'House Pulse': {
    pageOffset:2, resultOffset:2,
    long:   ['deep house organ sustain chord','house music synth pad warm','chicago house atmosphere pad'],
    medium: ['house groove piano loop','funky house bass loop','house music chord loop'],
    short:  ['house music filter sweep fx','vinyl crackle pop fx house','house synth stab fx'],
    chord:  ['house piano chord major bright','organ chord stab house','synth chord bright house'],
    inst:   ['house piano chord stab hit','funky bass guitar note pluck','organ stab house hit','synth lead bright house'],
    snare:  ['house snare clap reverb hit','house clap hit sharp'],
    drum:   ['rimshot hit house music','rim click percussion house'],
    kick:   ['four four kick drum house','deep house kick thump hit'],
    bass:   ['house bass guitar riff note','deep house bass synth hit'],
    hihat:  ['open hihat cymbal house','closed hihat tight house hit'],
    fill:   ['house drum fill transition','percussion break house music'],
    perc:   ['conga bongo loop house','latin percussion house loop'],
    vocal:  ['house diva vocal sample phrase','house music vocal loop'],
  },
  'Lo-Fi Tape': {
    pageOffset:3, resultOffset:0,
    long:   ['lofi vinyl crackle ambient warm','tape hiss texture nostalgic','vintage vinyl atmosphere warm'],
    medium: ['lofi hip hop piano melody loop','lofi guitar loop chill','lo-fi beat loop warm'],
    short:  ['vinyl record pop click fx','tape crackle noise fx','vinyl scratch short fx'],
    chord:  ['lofi piano chord jazz warm','jazz guitar chord mellow','lofi synth chord warm vintage'],
    inst:   ['lofi piano melody warm note','acoustic guitar fingerpick gentle','vibraphone jazz mellow note','upright bass jazz pluck'],
    snare:  ['lofi snare drum dusty hit','acoustic snare dry hit soft'],
    drum:   ['lofi tom hit vintage warm','vintage drum machine hit soft'],
    kick:   ['lofi kick drum soft hit','acoustic kick drum dry hit'],
    bass:   ['upright bass jazz pizzicato note','lofi bass guitar warm note'],
    hihat:  ['jazz hihat closed tight chick','lofi hihat dusty hit'],
    fill:   ['jazz brush drum fill','lofi drum break vinyl fill'],
    perc:   ['maracas shaker lofi loop','tambourine lofi loop soft'],
    vocal:  ['lofi vocal hum phrase','vintage vocal jazz sample'],
  },
  'Techno': {
    pageOffset:4, resultOffset:1,
    long:   ['techno industrial drone dark','warehouse techno atmosphere','dark techno synth pad minimal'],
    medium: ['techno machine sequence loop','acid techno synth loop','dark techno arp loop minimal'],
    short:  ['industrial machine fx hit','techno laser zap electronic','techno percussion click hit'],
    chord:  ['techno dark acid chord stab','minimal synth chord techno','industrial synth chord hit'],
    inst:   ['acid bass line synth hit','industrial distorted synth hit','techno lead synth stab','analog synth note techno'],
    snare:  ['techno electronic snare hit','industrial clap electronic hit'],
    drum:   ['techno analog tom hit','industrial percussion hit machine'],
    kick:   ['techno kick punch hard hit','industrial bass kick drum hit'],
    bass:   ['acid bass synth techno hit','techno bass loop minimal'],
    hihat:  ['techno closed hihat metallic','industrial hihat tight hit'],
    fill:   ['techno drum fill industrial','techno break percussion hit'],
    perc:   ['industrial cowbell click loop','techno metal shaker loop'],
    vocal:  ['robotic voice sample techno','techno vocal loop effect'],
  },
  'Drum&Bass': {
    pageOffset:0, resultOffset:2,
    long:   ['dnb dark pad sustain long','jungle atmosphere texture dark','drum bass synth atmosphere'],
    medium: ['jungle amen break loop','reese bass loop dnb','drum and bass melody riff loop'],
    short:  ['amen chop short hit','dnb stutter glitch fx','jungle snare hit short'],
    chord:  ['reese bass chord dark dnb','drum bass synth chord minor','jungle dark chord stab hit'],
    inst:   ['reese bass synth hit dnb','saxophone jazz sample note','dnb synth lead stab','electric bass guitar hit dnb'],
    snare:  ['breakbeat amen snare hit','jungle snare acoustic crack hit'],
    drum:   ['amen break tom drum hit','jungle tom percussion hit'],
    kick:   ['dnb kick drum heavy hit','jungle bass kick drum hit'],
    bass:   ['reese bass synth note deep','dnb bass hit heavy sub'],
    hihat:  ['jungle hihat closed tight hit','breakbeat hihat hit short'],
    fill:   ['amen break drum fill roll','jungle breakbeat fill loop'],
    perc:   ['jungle shaker percussion loop','breakbeat cymbal loop rhythm'],
    vocal:  ['jungle mc vocal chant','drum bass vocal sample phrase'],
  },
  'Ambient': {
    pageOffset:1, resultOffset:0,
    long:   ['ambient drone texture evolving','atmospheric reverb pad sustain','space ambient soundscape'],
    medium: ['ambient evolving melody loop','gentle piano ambient loop','nature ambient loop calm'],
    short:  ['ambient bell chime single hit','water drop ambient fx','wind chime gentle hit'],
    chord:  ['ambient string pad chord','ambient synth evolving chord','spacious reverb chord pad'],
    inst:   ['ambient piano gentle note','glass harmonica note ambient','celesta bell note gentle','flute soft note ambient'],
    snare:  ['soft brush snare ambient hit','gentle snare reverb hit'],
    drum:   ['soft tom ambient hit gentle','frame drum gentle hit'],
    kick:   ['soft kick thump ambient hit','gentle bass drum hit soft'],
    bass:   ['ambient bass drone note long','sub bass ambient note'],
    hihat:  ['soft cymbal wash ambient hit','gentle hihat ambient'],
    fill:   ['ambient percussion fill gentle','ethereal drum fill soft'],
    perc:   ['tibetan singing bowl hit','windchime ambient loop'],
    vocal:  ['ambient choir vocal pad','wordless vocal hum ambient'],
  },
  'Industrial': {
    pageOffset:2, resultOffset:1,
    long:   ['industrial noise metal texture long','harsh feedback drone industrial','factory machine ambient recording'],
    medium: ['industrial metal rhythm loop','harsh noise loop industrial','metal machine sound loop'],
    short:  ['metal clang hit industrial','industrial burst noise fx','chain rattle metal impact'],
    chord:  ['distorted power chord guitar hit','industrial synth chord harsh hit','metal bass chord distorted hit'],
    inst:   ['distorted electric guitar riff hit','industrial harsh synth hit','metal pipe hit clang','bass guitar distorted hit'],
    snare:  ['industrial snare metal crack hit','harsh distorted snare hit'],
    drum:   ['metal drum hit industrial','steel rim hit harsh industrial'],
    kick:   ['industrial kick drum heavy hit','metal bass kick punch hit'],
    bass:   ['industrial bass distorted hit','heavy metal bass guitar hit'],
    hihat:  ['industrial metal cymbal hit','harsh hihat industrial hit'],
    fill:   ['metal percussion fill industrial','industrial drum roll harsh'],
    perc:   ['metal chain percussion loop','factory machine rhythm loop'],
    vocal:  ['industrial distorted vocal','harsh vocal effect sample'],
  },
  'Latin': {
    pageOffset:3, resultOffset:2,
    long:   ['latin salsa orchestra atmosphere','tropical cuban ambient warm','latin jazz atmosphere pad'],
    medium: ['conga percussion latin loop','salsa rhythm loop latin','bossa nova guitar loop'],
    short:  ['clave hit latin single','cowbell hit latin single','guiro scrape latin hit'],
    chord:  ['latin guitar chord major','cuban jazz piano chord','brass chord stab salsa'],
    inst:   ['nylon guitar latin acoustic note','salsa trumpet melody note','cuban piano riff note','timbale hit latin single'],
    snare:  ['latin rim snare hit','conga slap hit latin'],
    drum:   ['timbale drum hit latin','latin drum rim hit single'],
    kick:   ['conga bass tone deep hit','latin kick drum hit single'],
    bass:   ['latin bass guitar note hit','cuban bass tumbao hit'],
    hihat:  ['latin hihat closed hit','salsa cymbal hit'],
    fill:   ['latin percussion fill break','timbale fill latin hit'],
    perc:   ['conga bongo loop latin','maracas shaker loop latin'],
    vocal:  ['latin vocal chant ole phrase','salsa vocal phrase'],
  },
  'Jazz': {
    pageOffset:4, resultOffset:2,
    long:   ['jazz club atmosphere piano warm','jazz piano sustain chord long','upright bass jazz walk pad'],
    medium: ['jazz swing quartet loop','bebop piano comping loop','jazz bass walking loop'],
    short:  ['cymbal chick jazz hit','brush snare jazz hit soft','rim click jazz single'],
    chord:  ['jazz piano chord voicing major 7','minor seventh chord jazz piano','dominant chord jazz organ'],
    inst:   ['jazz piano comping note chord','jazz saxophone melody note','upright bass pizzicato jazz','muted trumpet jazz note'],
    snare:  ['jazz brushed snare hit acoustic','jazz rim shot snare'],
    drum:   ['jazz tom hit acoustic single','rim click jazz hit'],
    kick:   ['jazz bass drum acoustic hit','jazz kick pedal hit soft'],
    bass:   ['upright bass pluck jazz note','walking bass jazz note single'],
    hihat:  ['jazz hihat chick closed hit','ride cymbal jazz hit'],
    fill:   ['jazz drum fill acoustic brush','jazz cymbal roll fill'],
    perc:   ['jazz brushwork percussion loop','bossa nova shaker loop'],
    vocal:  ['jazz scat vocal phrase','female jazz vocal note phrase'],
  },
  'Funk': {
    pageOffset:0, resultOffset:1,
    long:   ['funk groove organ sustain pad','vintage funk atmosphere warm','soul funk synth pad warm'],
    medium: ['funk bass guitar groove loop','funk wah guitar loop','soul horns funk loop'],
    short:  ['wah guitar scratch hit funk','funky guitar chop hit','funk clap hit sharp'],
    chord:  ['funk piano chord stab hit','funky organ chord hit stab','soul brass chord stab hit'],
    inst:   ['funk guitar wah hit single','soul horn brass stab note','funk piano stab note','slap bass guitar funk note'],
    snare:  ['funk snare crack tight hit','soul clap snare hit'],
    drum:   ['funk tom groove hit','floor tom soul hit'],
    kick:   ['funk kick drum tight hit','soul kick drum hit single'],
    bass:   ['slap bass guitar funk hit','electric bass funk note hit'],
    hihat:  ['funk hihat tight closed hit','open hihat funk single'],
    fill:   ['funk drum fill tight break','soul drum break fill'],
    perc:   ['funk tambourine shaker loop','conga funk groove loop'],
    vocal:  ['funk vocal shout sample','soul gospel vocal phrase'],
  },
  'K-Pop': {
    pageOffset:1, resultOffset:2,
    long:   ['kpop bright synth pad atmosphere','pop sparkle synth atmosphere','bright pop ambient pad'],
    medium: ['pop synth melody loop bright','kpop lead synth loop','bright arp synth loop pop'],
    short:  ['pop synth hit stab bright','kpop riser sweep fx','bright synth fx hit pop'],
    chord:  ['pop synth chord major bright','electric piano chord pop bright','brass chord stab pop bright'],
    inst:   ['bright synth lead melody note','electric piano pop note riff','pop guitar strum bright note','horn stab kpop note'],
    snare:  ['pop snare clap hit punchy','kpop snare tight punch hit'],
    drum:   ['pop drum machine tom hit','electronic tom hit pop'],
    kick:   ['pop kick drum tight punchy hit','kpop bass kick hit'],
    bass:   ['pop bass synth hit bright','electronic bass hit pop'],
    hihat:  ['pop hihat closed tight hit','kpop hihat rhythm hit'],
    fill:   ['pop drum fill break','kpop drum roll electronic'],
    perc:   ['pop clap shaker rhythm loop','pop tambourine percussion loop'],
    vocal:  ['kpop female vocal phrase sample','pop vocal harmony chop'],
  },
  'Phonk': {
    pageOffset:2, resultOffset:0,
    long:   ['memphis phonk dark synth pad','dark trap soul ambient texture','phonk atmosphere dark'],
    medium: ['phonk melody loop dark','memphis synth loop dark','dark phonk bass loop'],
    short:  ['phonk cowbell hit single','vinyl scratch hip hop short','phonk horn stab hit'],
    chord:  ['dark piano chord minor phonk','phonk synth chord dark minor','memphis dark chord stab'],
    inst:   ['phonk horn brass stab single','dark piano memphis note','phonk synth lead dark note','cowbell single hit phonk'],
    snare:  ['phonk snare crack dry hit','memphis snare dry tight hit'],
    drum:   ['phonk tom hit dark single','memphis drum machine hit single'],
    kick:   ['phonk 808 kick heavy hit','memphis bass kick drum hit'],
    bass:   ['808 bass phonk sub hit','dark trap bass sub phonk'],
    hihat:  ['phonk hihat closed hit roll','memphis hihat closed hit'],
    fill:   ['phonk drum fill dark roll','trap drum roll phonk fill'],
    perc:   ['phonk cowbell shaker loop','memphis percussion dark loop'],
    vocal:  ['phonk vocal chop dark sample','memphis vocal phrase dark'],
  },
  'Hardstyle': {
    pageOffset:3, resultOffset:1,
    long:   ['hardstyle euphoric synth pad','hardcore rave atmosphere dark','hardstyle synth atmosphere long'],
    medium: ['hardstyle synth melody loop','hardcore rave synth loop','hardstyle lead synth loop'],
    short:  ['hardstyle reverse cymbal fx','rave synth laser fx hit','hardstyle stab hit single'],
    chord:  ['hardstyle distorted synth chord','hardcore chord hit aggressive','rave chord stab hard hit'],
    inst:   ['hardstyle distorted synth note','hardcore piano stab note','rave synth stab hit note','distorted bass synth note'],
    snare:  ['hardstyle snare hit hard punch','hardcore clap snare hit'],
    drum:   ['hardstyle drum punch hit','hardcore electronic tom hit'],
    kick:   ['hardstyle kick distorted heavy','hardcore kick drum punch hard'],
    bass:   ['hardstyle bass synth hit hard','hardcore bass line hit'],
    hihat:  ['hardstyle hihat closed hit','hardcore hihat electronic hit'],
    fill:   ['hardstyle drum fill reverse','hardcore drum roll fill'],
    perc:   ['rave clap rhythm loop electronic','hardstyle shaker loop electronic'],
    vocal:  ['rave vocal shout sample','hardstyle vocal phrase'],
  },
  'Cinematic': {
    pageOffset:4, resultOffset:0,
    long:   ['cinematic orchestral string pad','epic film score atmosphere','dramatic orchestra sustain long'],
    medium: ['orchestral string loop melody','cinematic brass melody loop','film score piano loop'],
    short:  ['cinematic impact hit fx','orchestra stinger hit dramatic','dramatic braaam hit impact'],
    chord:  ['orchestral string chord major','brass chord hit cinematic','piano chord dramatic major'],
    inst:   ['cinematic violin solo note','orchestral horn melody note','film piano dramatic note','cello dramatic note solo'],
    snare:  ['orchestral snare roll hit','taiko drum hit single cinematic'],
    drum:   ['timpani drum hit cinematic','orchestral concert drum hit'],
    kick:   ['cinematic bass drum boom hit','taiko kick deep bass hit'],
    bass:   ['orchestral bass pizzicato note','cinematic bass note deep'],
    hihat:  ['orchestral cymbal hit single','triangle hit cinematic single'],
    fill:   ['timpani drum fill roll cinematic','orchestral percussion fill'],
    perc:   ['taiko percussion loop cinematic','orchestral rhythm percussion loop'],
    vocal:  ['cinematic choir vocal pad','epic choral vocal hit'],
  },
  '432Hz Heal': {
    pageOffset:0, resultOffset:2,
    long:   ['singing bowl sustained resonance','crystal bowl long tone healing','tibetan bowl resonance sustain'],
    medium: ['healing meditation music loop','crystal harmony loop','binaural relaxation loop'],
    short:  ['bell chime healing single hit','singing bowl strike single hit','tibetan bell single hit'],
    chord:  ['healing piano chord gentle warm','crystal harmony chord tone','meditation chord sustained'],
    inst:   ['crystal singing bowl note single','kalimba thumb piano note','flute meditation note gentle','harp gentle pluck note'],
    snare:  ['frame drum hit gentle soft','hand drum light tap single'],
    drum:   ['djembe hit soft gentle single','frame drum meditation hit'],
    kick:   ['bass drum soft healing hit','deep drum thump gentle hit'],
    bass:   ['deep bass healing tone note','sub bass meditation note long'],
    hihat:  ['finger cymbal ting single hit','small cymbal gentle hit'],
    fill:   ['healing drum fill gentle roll','soft drum fill meditation'],
    perc:   ['singing bowl loop meditation','rain stick shaker loop'],
    vocal:  ['om chant meditation vocal','healing vocal humming loop'],
  },
  'SoundFX Goofy': {
    pageOffset:1, resultOffset:1,
    long:   ['cartoon music background silly','funny ambient comical long','comical music loop background'],
    medium: ['cartoon sound effects loop','game funny sound loop','silly music jingle loop'],
    short:  ['cartoon boing sound hit','funny squeak sound effect','cartoon pop sound hit'],
    chord:  ['cartoon piano chord silly hit','xylophone chord hit cartoon','toy piano chord hit funny'],
    inst:   ['cartoon xylophone note melody','kazoo funny instrument note','ukulele silly strum note','toy piano hit cartoon note'],
    snare:  ['cartoon snare funny hit','silly drum hit comical'],
    drum:   ['cartoon tom boing hit','funny drum sound hit cartoon'],
    kick:   ['cartoon kick drum hit funny','bass drum thud cartoon'],
    bass:   ['cartoon tuba bass note funny','comical bass note cartoon'],
    hihat:  ['cartoon cymbal silly hit','funny hihat comical hit'],
    fill:   ['cartoon drum fill silly','funny drum roll cartoon'],
    perc:   ['cartoon percussion loop silly','funny rhythm loop cartoon'],
    vocal:  ['cartoon voice effect funny','silly vocal sound comical'],
  },
  '1930s Vintage': {
    pageOffset:2, resultOffset:2,
    long:   ['gramophone 1930s atmosphere crackle','old radio ambient vintage noise','vintage vinyl record ambience'],
    medium: ['1930s big band swing loop','vintage jazz swing loop','old orchestra vintage loop'],
    short:  ['vinyl record pop crackle single','old radio static fx short','gramophone needle drop fx'],
    chord:  ['vintage stride piano chord 1930s','old jazz guitar chord','big band brass chord hit'],
    inst:   ['vintage piano stride note 1930s','clarinet swing jazz note','trombone big band note','banjo strum vintage note'],
    snare:  ['vintage snare drum 1930s hit','brushed snare old jazz hit'],
    drum:   ['vintage drum kit hit 1930s','old drumset tom hit vintage'],
    kick:   ['vintage bass drum acoustic 1930s','old kick drum acoustic hit'],
    bass:   ['tuba bass vintage note 1930s','upright bass vintage pluck note'],
    hihat:  ['vintage cymbal 1930s hit','old jazz cymbal chick hit'],
    fill:   ['vintage drum fill 1930s break','old jazz drum break fill'],
    perc:   ['vintage woodblock hit 1930s','old tambourine vintage hit'],
    vocal:  ['1930s vintage vocal phrase','old radio vocal crackle sample'],
  },
  'Nature Sounds': {
    pageOffset:3, resultOffset:0,
    long:   ['forest birds ambient recording long','rain ambient nature recording','ocean waves ambient recording'],
    medium: ['forest nature loop ambient','rain falling loop nature','stream water loop nature'],
    short:  ['bird chirp single natural','frog croak nature single','twig snap natural hit single'],
    chord:  ['steel drum island chord hit','ambient nature tone chord','wind harmony chord natural'],
    inst:   ['bamboo flute forest note','kalimba african natural note','wind instrument nature note','didgeridoo natural note'],
    snare:  ['wood log hit percussion','stick hit wood natural single'],
    drum:   ['wood drum hit natural single','djembe natural single hit'],
    kick:   ['deep log drum bass hit','bass log hit natural deep'],
    bass:   ['bass log deep hit natural','deep natural resonant bass hit'],
    hihat:  ['seed rattle shake hit natural','natural shaker hit rattlesnake'],
    fill:   ['natural wood drum fill','log drum fill natural rhythm'],
    perc:   ['rainstick shaker loop natural','conga drum natural loop'],
    vocal:  ['nature tribal chant vocal','bird call imitation vocal'],
  },
  'Chiptune 8-bit': {
    pageOffset:4, resultOffset:1,
    long:   ['chiptune 8bit game music background','retro NES game music chip','8bit game atmosphere chip'],
    medium: ['chiptune melody loop 8bit game','retro game synth loop chip','8bit video game music loop'],
    short:  ['8bit game sound effect hit','chiptune blip hit short retro','video game coin collect fx'],
    chord:  ['chiptune arpeggio chord 8bit','retro chip chord hit game','8bit synth chord hit retro'],
    inst:   ['chiptune square wave melody note','8bit triangle wave note game','retro chip synth note lead','chiptune pulse wave hit note'],
    snare:  ['chiptune snare hit 8bit game','retro chip snare noise hit'],
    drum:   ['8bit drum hit chip retro','chiptune noise drum hit'],
    kick:   ['chiptune kick 8bit hit game','retro chip kick bass hit'],
    bass:   ['8bit bass chiptune hit note','retro chip bass note game'],
    hihat:  ['chiptune hihat noise hit 8bit','retro hihat chip noise game'],
    fill:   ['chiptune drum fill 8bit roll','retro game drum break chip'],
    perc:   ['8bit percussion loop chip game','retro game rhythm loop chip'],
    vocal:  ['chiptune voice chip sample','8bit voice game sample'],
  },
  'Vaporwave': {
    pageOffset:0, resultOffset:0,
    long:   ['vaporwave smooth synth pad slow','80s synth atmosphere smooth slow','slowed synth pad vaporwave aesthetic'],
    medium: ['slowed reverb melody loop vaporwave','smooth 80s synth loop','vaporwave ambient melody loop'],
    short:  ['vaporwave synth stab 80s hit','smooth fx reverb sweep','glitch vaporwave fx'],
    chord:  ['smooth chord synth 80s major','vaporwave electric piano chord','slow synth chord smooth pad'],
    inst:   ['smooth electric piano 80s note','saxophone vaporwave smooth note','slow synth melody note lead','smooth guitar 80s note'],
    snare:  ['gated reverb snare 80s hit','vaporwave snare reverb hit'],
    drum:   ['80s drum machine reverb hit','gated drum machine hit 80s'],
    kick:   ['80s drum machine kick hit','vaporwave kick reverb hit'],
    bass:   ['slap bass 80s smooth hit','smooth bass synth vaporwave hit'],
    hihat:  ['80s drum machine hihat hit','smooth hihat vaporwave hit'],
    fill:   ['80s drum fill reverb gated','smooth drum break vaporwave'],
    perc:   ['80s percussion shaker loop smooth','vaporwave rhythm loop 80s'],
    vocal:  ['smooth vocal sample 80s chop','vaporwave vocal aesthetic chop'],
  },
  'Tribal Drums': {
    pageOffset:1, resultOffset:2,
    long:   ['tribal ceremony drum ambient long','african drum circle atmosphere','world music tribal texture long'],
    medium: ['djembe pattern loop african','tribal percussion loop ethnic','talking drum rhythm loop'],
    short:  ['djembe single hit african','talking drum slap hit','balafon single note hit'],
    chord:  ['mbira thumb piano chord hit','balafon chord african hit','kora pluck chord tone'],
    inst:   ['djembe solo hit single','mbira thumb piano single note','balafon xylophone note hit','talking drum single hit'],
    snare:  ['djembe slap tight hit','ashiko drum slap hit single'],
    drum:   ['dunun bass drum african hit','dundun hit deep single'],
    kick:   ['djembe bass tone deep hit single','african bass drum hit deep'],
    bass:   ['low dundun bass hit african','deep african drum bass hit'],
    hihat:  ['african bell metal hit single','shekere rattle shake hit'],
    fill:   ['african polyrhythm drum fill','tribal percussion fill roll'],
    perc:   ['african djembe conga loop','tribal rhythm loop ethnic'],
    vocal:  ['african tribal chant loop','african call response vocal'],
  },
  'Bossa Nova': {
    pageOffset:2, resultOffset:1,
    long:   ['bossa nova guitar warm atmosphere','brazilian samba jazz ambient','bossa atmosphere warm gentle'],
    medium: ['bossa nova guitar rhythm loop','samba guitar loop brazilian','bossa piano loop jazz'],
    short:  ['clave bossa hit single','ganza shaker hit bossa single','pandeiro hit bossa single'],
    chord:  ['bossa nova guitar chord jazz','brazilian piano chord jazz','acoustic guitar major 7 chord bossa'],
    inst:   ['nylon guitar bossa nova note','jazz piano bossa melody note','acoustic bass bossa walk note','flute bossa nova melody note'],
    snare:  ['bossa snare rim hit single','pandeiro slap bossa hit single'],
    drum:   ['surdo drum hit bossa single','bossa nova rim hit drum'],
    kick:   ['surdo bass hit bossa kick','bossa kick drum hit single'],
    bass:   ['acoustic bass bossa note pluck','bass guitar bossa hit note'],
    hihat:  ['bossa nova hihat closed hit','brush cymbal bossa hit single'],
    fill:   ['bossa nova drum fill break','samba percussion break fill'],
    perc:   ['pandeiro bossa loop rhythm','ganza shaker samba loop'],
    vocal:  ['bossa nova portuguese vocal','samba vocal warm phrase'],
  },
  'Synthwave 80s': {
    pageOffset:3, resultOffset:2,
    long:   ['synthwave neon synth pad 80s','retrowave synth atmosphere long','neon synthwave texture sustain'],
    medium: ['synthwave arp melody loop 80s','retrowave bass synth loop 80s','80s synth arp loop retrowave'],
    short:  ['synthwave laser hit 80s fx','80s synth stab hit fx','retro synth fx hit 80s'],
    chord:  ['synthwave synth chord major 80s','retrowave pad chord hit','neon synth power chord 80s'],
    inst:   ['80s synth lead melody note','retrowave bass synth note hit','saxophone smooth 80s melody','electric guitar 80s lead note'],
    snare:  ['gated reverb snare 80s hit','synthwave snare hit retro'],
    drum:   ['80s gated drum machine tom','drum machine hit retro 80s'],
    kick:   ['80s drum machine kick hit retro','synthwave kick drum 80s'],
    bass:   ['retrowave synth bass 80s hit','80s synth bass note'],
    hihat:  ['80s drum machine hihat hit','synthwave hihat electronic 80s'],
    fill:   ['80s drum machine fill retro','synthwave drum break 80s'],
    perc:   ['retrowave drum machine loop 80s','synthwave shaker percussion 80s loop'],
    vocal:  ['80s retrowave vocal sample','synthwave vocal chop 80s'],
  },
  'Grime UK': {
    pageOffset:4, resultOffset:2,
    long:   ['uk grime dark synth pad','grime electronic atmosphere dark uk','london underground atmosphere grime'],
    medium: ['grime beat loop dark uk','grime synth melody loop uk','uk garage grime loop'],
    short:  ['grime synth stab hit dark','uk grime fx hit short','garage stab hit grime'],
    chord:  ['grime dark synth chord hit','uk garage minor chord hit','grime bass chord stab dark'],
    inst:   ['grime synth lead note stab','uk bass hit garage note','grime piano stab note','dark synth grime note hit'],
    snare:  ['grime snare hit dark uk','uk garage clap snare hit'],
    drum:   ['grime drum machine hit uk','uk garage drum machine hit'],
    kick:   ['grime kick drum heavy hit','uk bass kick drum hit'],
    bass:   ['grime bass hit dark deep','uk bass synth hit deep'],
    hihat:  ['grime hihat tight hit uk','uk garage hihat click'],
    fill:   ['grime drum fill dark uk','uk garage drum break fill'],
    perc:   ['grime shaker percussion loop uk','uk garage percussion loop'],
    vocal:  ['uk grime vocal phrase','uk garage vocal sample'],
  },
  'Reggaeton': {
    pageOffset:0, resultOffset:1,
    long:   ['reggaeton dembow synth atmosphere','latin urban synth pad warm','reggaeton beat atmosphere'],
    medium: ['reggaeton dembow beat loop','latin trap melody loop','reggaeton synth bass loop'],
    short:  ['reggaeton dembow hit short','latin synth stab hit','reggaeton brass stab hit'],
    chord:  ['reggaeton synth chord hit latin','latin minor chord urban hit','latin trap chord stab hit'],
    inst:   ['reggaeton bass synth note hit','latin electric guitar riff note','reggaeton piano stab note','horn stab latin urban note'],
    snare:  ['reggaeton snare dembow hit','latin clap snare urban hit'],
    drum:   ['reggaeton drum machine hit','dembow tom hit latin single'],
    kick:   ['reggaeton kick drum dembow hit','latin kick drum bass hit'],
    bass:   ['reggaeton bass hit heavy sub','latin 808 bass note hit'],
    hihat:  ['reggaeton hihat closed hit','latin hihat urban hit single'],
    fill:   ['reggaeton drum fill break','dembow percussion fill latin'],
    perc:   ['reggaeton conga loop latin','latin percussion dembow loop'],
    vocal:  ['reggaeton vocal sample latin','perreo vocal phrase latin'],
  },
  'Math Rock': {
    pageOffset:1, resultOffset:0,
    long:   ['math rock guitar texture ambient','progressive rock atmosphere pad','complex guitar ambient texture'],
    medium: ['math rock guitar riff odd time','progressive odd meter guitar loop','math rock instrumental loop'],
    short:  ['guitar harmonic tap hit','math rock guitar hit single','guitar stab complex hit'],
    chord:  ['math rock complex guitar chord','progressive open guitar chord','dissonant guitar chord hit'],
    inst:   ['electric guitar math rock note','bass guitar progressive note hit','prepared piano complex note','marimba progressive note hit'],
    snare:  ['math rock snare acoustic hit','progressive snare hit acoustic'],
    drum:   ['math rock tom acoustic hit','progressive rock tom hit'],
    kick:   ['math rock kick tight acoustic','progressive kick acoustic hit'],
    bass:   ['math rock bass guitar hit note','progressive bass note hit'],
    hihat:  ['math rock hihat open acoustic','progressive hihat hit acoustic'],
    fill:   ['math rock drum fill complex','progressive drum fill break'],
    perc:   ['math rock odd meter loop','complex percussion rhythm loop'],
    vocal:  ['math rock vocal phrase sample','post rock atmospheric vocal'],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// SLOT MAP  (pad indices, duration filters, categories)
// ─────────────────────────────────────────────────────────────────────────────
const SLOT_MAP = [
  { key:'long',   padIds:[0,1,2],       dur:'duration:[2.0 TO 4.0]', cat:'long' },
  { key:'medium', padIds:[3,4,5],       dur:'duration:[1.0 TO 2.5]', cat:'medium' },
  { key:'short',  padIds:[6,7,8],       dur:'duration:[0.5 TO 1.0]', cat:'short' },
  { key:'chord',  padIds:[9,10,11],     dur:'duration:[0.5 TO 3.0]', cat:'chord' },
  { key:'inst',   padIds:[12,13,14,15], dur:'duration:[0.5 TO 3.0]', cat:'instrument' },
  { key:'snare',  padIds:[16,17],       dur:'duration:[0.3 TO 1.5]', cat:'snare' },
  { key:'drum',   padIds:[18,19],       dur:'duration:[0.3 TO 1.5]', cat:'drum' },
  { key:'kick',   padIds:[20,21],       dur:'duration:[0.3 TO 1.2]', cat:'kick' },
  { key:'bass',   padIds:[22,23],       dur:'duration:[0.3 TO 2.5]', cat:'bass' },
  { key:'hihat',  padIds:[24,25],       dur:'duration:[0.1 TO 0.8]', cat:'hihat' },
  { key:'fill',   padIds:[26,27],       dur:'duration:[1.0 TO 3.5]', cat:'fill' },
  { key:'perc',   padIds:[28,29],       dur:'duration:[1.0 TO 4.0]', cat:'percussion' },
  { key:'vocal',  padIds:[30,31],       dur:'duration:[0.5 TO 3.0]', cat:'vocal' },
]

// ─────────────────────────────────────────────────────────────────────────────
// KEYWORD SCORING per category
// ─────────────────────────────────────────────────────────────────────────────
const SCORE_RULES = {
  kick: {
    good: [[/kick/i,50],[/bass.?drum/i,40],[/\bbd\b/i,25],[/808.?kick/i,20],[/thump/i,10],[/\blow\b/i,5]],
    bad:  [[/snare/i,60],[/hihat|hi.?hat/i,60],[/cymbal/i,50],[/clap/i,40],[/loop/i,20]],
  },
  snare: {
    good: [[/snare/i,50],[/rimshot/i,35],[/rim.?shot/i,30],[/\bsnr\b/i,25],[/crack/i,15],[/\bhit\b/i,8]],
    bad:  [[/kick/i,60],[/hihat|hi.?hat/i,60],[/bass.?drum/i,50],[/loop/i,20]],
  },
  hihat: {
    good: [[/hi.?hat/i,50],[/\bhh\b/i,30],[/closed/i,15],[/\bopen\b/i,10],[/cymbal/i,10],[/tick/i,10],[/click/i,10]],
    bad:  [[/kick/i,60],[/snare/i,60],[/bass.?drum/i,50],[/loop/i,15]],
  },
  drum: {
    good: [[/\btom\b/i,40],[/\brim\b/i,35],[/drum.?hit/i,25],[/percussion/i,10],[/\bhit\b/i,8]],
    bad:  [[/\bkick\b/i,40],[/snare/i,40],[/hihat|hi.?hat/i,40],[/loop/i,20]],
  },
  bass: {
    good: [[/bass/i,40],[/\bsub\b/i,25],[/808/i,20],[/\blow\b/i,10],[/deep/i,8]],
    bad:  [[/hihat|hi.?hat/i,50],[/snare/i,50],[/cymbal/i,40]],
  },
  fill: {
    good: [[/fill/i,40],[/break/i,25],[/roll/i,20],[/drum/i,10],[/loop/i,8]],
    bad:  [],
  },
  chord: {
    good: [[/chord/i,35],[/piano/i,20],[/\bpad\b/i,15],[/synth/i,10],[/organ/i,10],[/stab/i,10]],
    bad:  [[/\bkick\b/i,40],[/snare/i,40],[/hihat/i,40]],
  },
  instrument: {
    good: [[/guitar|piano|violin|sax|trumpet|cello|flute|bass|synth|keyboard|organ|brass|horn|marimba|vibraphone|xylophone|rhodes/i,30],[/\bnote\b/i,10],[/\bhit\b/i,8],[/single/i,8]],
    bad:  [[/loop/i,5],[/\bkick\b/i,30],[/snare/i,30]],
  },
  long: {
    good: [[/\bpad\b/i,25],[/drone/i,20],[/ambient/i,20],[/sustain/i,15],[/atmosphere/i,15],[/texture/i,10]],
    bad:  [[/\bkick\b/i,50],[/snare/i,50],[/hihat/i,50],[/\bhit\b/i,15]],
  },
  medium: {
    good: [[/loop/i,20],[/melody/i,15],[/riff/i,15],[/groove/i,10],[/beat/i,10]],
    bad:  [[/\bkick\b/i,30],[/\bsnare\b/i,30]],
  },
  short: {
    good: [[/\bfx\b/i,20],[/sfx/i,20],[/\bhit\b/i,15],[/stab/i,15],[/single/i,10],[/one.?shot/i,15]],
    bad:  [[/loop/i,20],[/ambient/i,15]],
  },
  percussion: {
    good: [[/percussion/i,30],[/shaker/i,20],[/conga/i,20],[/loop/i,15],[/rhythm/i,10],[/cowbell/i,15]],
    bad:  [[/\bkick\b/i,30],[/\bsnare\b/i,30]],
  },
  vocal: {
    good: [[/vocal/i,40],[/\bvoice\b/i,30],[/chant/i,25],[/singing/i,20],[/phrase/i,15],[/sample/i,10]],
    bad:  [[/\bkick\b/i,50],[/snare/i,50],[/hihat/i,40],[/\bdrum\b/i,20]],
  },
}

function scoreSound(sound, category) {
  const text = ((sound.name || '') + ' ' + (sound.tags || []).join(' ')).toLowerCase()
  const rules = SCORE_RULES[category] || {}
  let score = 0
  for (const [re, pts] of (rules.good || [])) if (re.test(text)) score += pts
  for (const [re, pen] of (rules.bad  || [])) if (re.test(text)) score -= pen
  score += ((sound.avg_rating || 0) / 5) * 20
  if (/one.?shot|single/i.test(text)) score += 10
  if ((sound.name || '').split(/[\s_-]+/).length > 10) score -= 5
  return score
}

// ─────────────────────────────────────────────────────────────────────────────
// FETCH helpers
// ─────────────────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function freesoundSearch(query, durFilter, { pageSize=15, page=1, sort='rating_desc' } = {}) {
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
      if (r.status === 429 || r.status === 403) {
        const wait = (attempt + 1) * 8000  // 8s, 16s, 24s
        console.warn(`\n  [rate limit ${r.status}] waiting ${wait/1000}s…`)
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

async function pickBestSound(query, durFilter, category, { pageOffset=0, resultOffset=0, globalUsed }) {
  const sorts = ['rating_desc', 'downloads_desc']
  const pages = [
    1 + (pageOffset % 3),
    1 + ((pageOffset + 2) % 4),
  ]

  let allCandidates = []
  outer:
  for (const sortBy of sorts) {
    for (const page of pages) {
      const results = await freesoundSearch(query, durFilter, { page, sort: sortBy })
      await sleep(RATE_DELAY)
      allCandidates.push(...results)
      if (allCandidates.length >= 25) break outer
    }
  }

  // Deduplicate
  const seen = new Set()
  allCandidates = allCandidates.filter(s => {
    if (seen.has(s.id)) return false
    seen.add(s.id)
    return !!s.previews?.['preview-hq-mp3']
  })

  // Score
  const scored = allCandidates
    .map(s => ({ ...s, _score: scoreSound(s, category) }))
    .sort((a, b) => b._score - a._score)

  // Pick best non-globally-used sound
  const startIdx = resultOffset % Math.max(1, scored.length)
  for (let t = 0; t < scored.length; t++) {
    const s = scored[(startIdx + t) % scored.length]
    if (!globalUsed.has(s.id)) {
      globalUsed.add(s.id)
      return { id: s.id, name: s.name, previewUrl: s.previews['preview-hq-mp3'], duration: s.duration, score: s._score, category }
    }
  }
  // Last resort: allow reuse
  if (scored.length > 0) {
    const s = scored[0]
    return { id: s.id, name: s.name, previewUrl: s.previews['preview-hq-mp3'], duration: s.duration, score: s._score, category }
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECKPOINT
// ─────────────────────────────────────────────────────────────────────────────
function loadCheckpoint() {
  try { if (fs.existsSync(CHECKPOINT)) return JSON.parse(fs.readFileSync(CHECKPOINT, 'utf8')) } catch {}
  return {}
}
function saveCheckpoint(data) {
  fs.writeFileSync(CHECKPOINT, JSON.stringify(data, null, 2))
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2)
const singlePreset = args.includes('--preset') ? args[args.indexOf('--preset') + 1] : null
const force = args.includes('--force')

const checkpoint = force ? {} : loadCheckpoint()
const presetNames = singlePreset ? [singlePreset] : Object.keys(FULL_PRESET_BLUEPRINTS)
let totalDone = 0, totalFailed = 0

for (const presetName of presetNames) {
  const bp = FULL_PRESET_BLUEPRINTS[presetName]
  if (!bp) { console.error(`Unknown preset: "${presetName}"`); continue }

  console.log(`\n═══ ${presetName} ═══`)
  if (!checkpoint[presetName]) checkpoint[presetName] = {}

  const globalUsed = new Set(
    Object.values(checkpoint[presetName]).map(p => p?.id).filter(Boolean)
  )

  for (const slot of SLOT_MAP) {
    const queries = bp[slot.key]
    for (let i = 0; i < slot.padIds.length; i++) {
      const padIdx = slot.padIds[i]
      const ckKey = `pad_${padIdx}`

      if (checkpoint[presetName][ckKey] && !force) {
        console.log(`  ✓ pad ${padIdx} (${slot.cat}) [cached: "${checkpoint[presetName][ckKey].name}"]`)
        globalUsed.add(checkpoint[presetName][ckKey].id)
        totalDone++
        continue
      }

      const query = queries[i % queries.length]
      process.stdout.write(`  → pad ${padIdx} (${slot.cat}): "${query}" … `)

      const sound = await pickBestSound(
        query, slot.dur, slot.cat,
        { pageOffset: bp.pageOffset, resultOffset: bp.resultOffset + i, globalUsed }
      )

      if (sound) {
        console.log(`✔ [${sound.id}] "${sound.name}" ${sound.duration?.toFixed(2)}s score=${sound.score}`)
        checkpoint[presetName][ckKey] = sound
        saveCheckpoint(checkpoint)
        totalDone++
      } else {
        console.log('✗ NO RESULT')
        totalFailed++
      }
    }
  }
}

// Write output JSON — merge V2 checkpoint as fallback (V1 always wins)
const CHECKPOINT_V2 = path.join(__dirname, '.preset-cache-v2.json')
let checkpointV2 = {}
try { if (fs.existsSync(CHECKPOINT_V2)) checkpointV2 = JSON.parse(fs.readFileSync(CHECKPOINT_V2, 'utf8')) } catch {}

const output = {
  version: 4,
  generated: new Date().toISOString(),
  note: 'Merged V1 (niche) + V2 (wide) Freesound curation. V1 takes priority.',
  presets: {},
}

for (const presetName of Object.keys(FULL_PRESET_BLUEPRINTS)) {
  const pV1 = checkpoint[presetName] || {}
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
console.log(`   Done: ${totalDone}  Failed: ${totalFailed}`)
