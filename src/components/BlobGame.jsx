import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// ─── Mobile detection ─────────────────────────────────────────────────────────
const isMobile = () => /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;

// ─── Blob shape math ──────────────────────────────────────────────────────────
const BLOB_POINTS = 8;
function buildBlobOffsets(seed) {
  const o = [];
  for (let i = 0; i < BLOB_POINTS; i++) o.push(0.82 + ((seed * (i + 3.7) * 17.37) % 1) * 0.36);
  return o;
}
function drawBlob(ctx, cx, cy, r, offsets, phase) {
  ctx.beginPath();
  for (let i = 0; i <= BLOB_POINTS; i++) {
    const idx = i % BLOB_POINTS;
    const wobble = 1 + 0.12 * Math.sin(phase * 2.1 + idx * 1.3);
    const rr = r * offsets[idx] * wobble;
    const angle = (idx / BLOB_POINTS) * Math.PI * 2 - Math.PI / 2;
    if (i === 0) ctx.moveTo(cx + rr * Math.cos(angle), cy + rr * Math.sin(angle));
    else ctx.lineTo(cx + rr * Math.cos(angle), cy + rr * Math.sin(angle));
  }
  ctx.closePath();
}
function drawStar6(ctx, cx, cy, r, rotation) {
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    const rr = i % 2 === 0 ? r : r * 0.48;
    const angle = (Math.PI / 6) * i + rotation;
    if (i === 0) ctx.moveTo(cx + rr * Math.cos(angle), cy + rr * Math.sin(angle));
    else ctx.lineTo(cx + rr * Math.cos(angle), cy + rr * Math.sin(angle));
  }
  ctx.closePath();
}
const getVolume = (size) => Math.PI * (size / 2) ** 2;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const MAX_SCORE = 999999999;

// ─── Mobile scaling constants ─────────────────────────────────────────────────
const MOB_MAX_PLAYER = 160;
const MOB_MAX_ENEMY  = 120;
const MOB_MAX_BOSS   = 100;

// ─── Spawn difficulty scaling ─────────────────────────────────────────────────
function getSpawnSizeRange(score) {
  const tiers = Math.floor(score / 10000);
  const baseMin = 0.4 + tiers * 0.1;
  const baseMax = 1.3 + tiers * 0.1;
  return { min: baseMin, max: baseMax };
}
function getExtraSpawnRolls(score) {
  const pct = Math.floor(score / 10000) * 10;
  const guaranteed = Math.floor(pct / 100);
  const remainder = (pct % 100) / 100;
  return { guaranteed, remainder };
}

// ─── Saturn texture ───────────────────────────────────────────────────────────
function drawSaturn(ctx, cx, cy, size, staticRot, spinRot, hits) {
  const half = size * 0.48;
  const baseColors = ['rgba(210,180,130,0.88)', 'rgba(160,110,60,0.88)', 'rgba(90,55,20,0.88)'];
  const ringColors = ['rgba(230,200,140,0.7)', 'rgba(180,130,70,0.7)', 'rgba(110,70,25,0.7)'];
  const col = baseColors[Math.min(hits, 2)];
  const rcol = ringColors[Math.min(hits, 2)];
  ctx.save();
  ctx.translate(cx, cy);
  ctx.save();
  ctx.rotate(staticRot);
  ctx.fillStyle = col;
  ctx.strokeStyle = rcol;
  ctx.lineWidth = 2;
  ctx.fillRect(-half, -half, half * 2, half * 2);
  ctx.strokeRect(-half, -half, half * 2, half * 2);
  for (let b = 1; b < 4; b++) {
    ctx.strokeStyle = `rgba(0,0,0,0.12)`;
    ctx.lineWidth = half * 0.18;
    ctx.beginPath();
    ctx.moveTo(-half, -half + (b / 4) * half * 2);
    ctx.lineTo(half, -half + (b / 4) * half * 2);
    ctx.stroke();
  }
  ctx.restore();
  ctx.save();
  ctx.rotate(spinRot);
  ctx.strokeStyle = rcol;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.7;
  ctx.strokeRect(-half * 1.35, -half * 1.35, half * 2.7, half * 2.7);
  ctx.globalAlpha = 1;
  ctx.restore();
  ctx.fillStyle = hits === 2 ? '#FF6666' : '#3A2000';
  ctx.font = `900 ${Math.max(8, size * 0.13)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SATURN', 0, 0);
  ctx.restore();
}

// ─── Corn cob canvas draw ─────────────────────────────────────────────────────
function drawCornCob(ctx, cx, cy, size) {
  ctx.save();
  ctx.translate(cx, cy);
  const s = size / 38;
  ctx.fillStyle = '#FFD700';
  ctx.strokeStyle = '#B8860B';
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.ellipse(0, 0, 9 * s, 16 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#FFC200';
  for (let row = -3; row <= 3; row++) {
    for (let col = -1; col <= 1; col++) {
      const kx = col * 5.5 * s + (row % 2 === 0 ? 0 : 2.7 * s);
      const ky = row * 4.2 * s;
      if (Math.abs(kx) < 7.5 * s && Math.abs(ky) < 15 * s) {
        ctx.beginPath();
        ctx.ellipse(kx, ky, 2 * s, 1.6 * s, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.fillStyle = '#5D8A26';
  ctx.beginPath();
  ctx.moveTo(0, -15 * s);
  ctx.quadraticCurveTo(-12 * s, -24 * s, -6 * s, -30 * s);
  ctx.quadraticCurveTo(0, -22 * s, 0, -15 * s);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, -15 * s);
  ctx.quadraticCurveTo(12 * s, -24 * s, 6 * s, -30 * s);
  ctx.quadraticCurveTo(0, -22 * s, 0, -15 * s);
  ctx.fill();
  ctx.restore();
}

// ─── Confetti ─────────────────────────────────────────────────────────────────
function spawnConfetti(confettiRef) {
  const colors = ['#E01880','#FFD700','#00FF88','#00CFFF','#FF6B35','#B14FFF','#FF3333'];
  confettiRef.current = [];
  for (let i = 0; i < 180; i++) {
    confettiRef.current.push({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 5,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.2,
      w: 6 + Math.random() * 8,
      h: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1.0,
    });
  }
}

// ─── Opposite spawn ───────────────────────────────────────────────────────────
function oppositeSafeSpawnPos(playerX, playerY, W, H) {
  const oppX = clamp(W - playerX + (Math.random() - 0.5) * 120, 60, W - 60);
  const oppY = clamp(H - playerY + (Math.random() - 0.5) * 120, 60, H - 60);
  return { x: oppX, y: oppY };
}

// ─── Main component ───────────────────────────────────────────────────────────
const BlobGame = ({ onClose }) => {
  const [screen, setScreen] = useState('title');
  const [displayScore, setDisplayScore] = useState(0);
  const [displayPlayerSize, setDisplayPlayerSize] = useState(60);
  const [highScores, setHighScores] = useState(Array(10).fill(null));
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [saturnAlert, setSaturnAlert] = useState(false);
  const [madeLeaderboard, setMadeLeaderboard] = useState(false);
  const [muted, setMuted] = useState(false);
  const [damageFlash, setDamageFlash] = useState(false);
  const [immuneActive, setImmuneActive] = useState(false);
  const [bajaActive, setBajaActive] = useState(false);
  const [animeMode, setAnimeMode] = useState(false);
  const [displayCornTime, setDisplayCornTime] = useState(0);
  const [displayBajaTime, setDisplayBajaTime] = useState(0);

  const canvasRef = useRef(null);
  const screenRef = useRef('title');
  const playerPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const targetPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const playerSize = useRef(60);
  const score = useRef(0);
  const enemies = useRef([]);
  const projectiles = useRef([]);
  const slimeTrails = useRef([]);
  const confettiRef = useRef([]);
  const bajaPowerups = useRef([]);
  const lightningArcs = useRef([]);
  const animFrameRef = useRef(null);
  const phaseRef = useRef(0);
  const idCounter = useRef(0);
  const lastAutoSpawnScore = useRef(0);
  const lastBossScore = useRef(0);
  const lastSlimeScore = useRef(0);
  const lastSaturnScore = useRef(0);
  const lastBajaSpawnTime = useRef(-1);
  const lastPlayerFire = useRef(0);
  const hudTickRef = useRef(0);
  const saturnAlertTimer = useRef(0);
  const gameStartTime = useRef(0);
  const animeModeRef = useRef(false);
  const animeModeTimer = useRef(0);
  const animePhaseRef = useRef(0);
  const spotlightPhaseRef = useRef(0);
  const bajaActiveRef = useRef(false);
  const bajaTimerRef = useRef(0);
  const bajaPhaseRef = useRef(0);
  const immuneRef = useRef(false);
  const immuneTimerRef = useRef(0);
  const lastCornSpawnTime = useRef(0);
  const cornPickups = useRef([]);
  const damageFlashTimer = useRef(0);
  const mobileRef = useRef(isMobile());
  // Throttle enemy snapshot writes to window.__blobEnemies (read by ParticleField)
  const enemySyncTickRef = useRef(0);

  // Audio
  const audioRef = useRef(null);
  const audioLoadedRef = useRef(false);
  const mutedRef = useRef(false);

  const PROJECTILE_SPEED = 13;
  const PLAYER_FIRE_COOLDOWN = 1000;
  const SLIME_DRAIN_RATE = 0.06;
  const TRAIL_LINGER_MS = 5000;
  const BANNED_WORDS = ['SLUR1', 'SLUR2', 'FUCK', 'SHIT', 'PISS', 'CUNT'];
  const ENEMY_COLORS = ['#FF1493', '#00FF7F', '#1E90FF', '#FFD700', '#FF6B35', '#B14FFF'];
  const uid = () => ++idCounter.current;

  // ─── Audio ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const audio = new Audio();
    audio.src = '/src/assets/theme.mp3';
    audio.loop = true;
    audio.volume = 0.55;
    audio.preload = 'none';
    audioRef.current = audio;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (['title','playing','enteringName','gameOver'].includes(screen)) {
      if (!mutedRef.current && !audioLoadedRef.current) {
        audio.load();
        audioLoadedRef.current = true;
      }
      if (!mutedRef.current) audio.play().catch(() => {});
    }
  }, [screen]);

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    mutedRef.current = newMuted;
    if (audioRef.current) {
      if (newMuted) {
        audioRef.current.pause();
      } else {
        if (!audioLoadedRef.current) { audioRef.current.load(); audioLoadedRef.current = true; }
        audioRef.current.play().catch(() => {});
      }
    }
  };

  // Force stop audio + clean up window ref on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      window.__blobEnemies = null;
    };
  }, []);

  // ─── Fetch scores ─────────────────────────────────────────────────────────────
  const fetchScores = useCallback(async () => {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('player_name, score')
      .order('score', { ascending: false })
      .limit(10);
    if (!error && data) {
      const filled = Array(10).fill(null).map((_, i) =>
        data[i] ? { name: data[i].player_name, score: data[i].score } : null
      );
      setHighScores(filled);
      return filled;
    }
    return Array(10).fill(null);
  }, []);

  useEffect(() => { fetchScores(); }, [fetchScores]);

  // ─── Particle events ──────────────────────────────────────────────────────────
  useEffect(() => {
    // Player absorbs a particle (dispatched by ParticleField)
    const handlePlayerParticle = () => {
      if (screenRef.current !== 'playing') return;
      const sizeBonus = Math.max(0, Math.floor(playerSize.current / 80));
      score.current = Math.min(score.current + 15 + sizeBonus, MAX_SCORE);
      const mob = mobileRef.current;
      playerSize.current = Math.min(playerSize.current + (mob ? 0.4 : 0.8), mob ? MOB_MAX_PLAYER : 500);
    };

    // Enemy absorbs a particle (dispatched by ParticleField with enemyId)
    const handleEnemyParticle = (e) => {
      if (screenRef.current !== 'playing') return;
      const { enemyId } = e.detail;
      const enemy = enemies.current.find(en => en.id === enemyId);
      if (!enemy || enemy.type === 'saturn') return;
      const mob = mobileRef.current;
      const maxSize = mob
        ? (enemy.isBoss ? MOB_MAX_BOSS : MOB_MAX_ENEMY)
        : (enemy.isBoss ? 400 : 250);
      // Use the same particle-gain rate as the player at equivalent size.
      enemy.size = Math.min(enemy.size + (mob ? 0.4 : 0.8), maxSize);
    };

    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };

    window.addEventListener('particleCollected', handlePlayerParticle);
    window.addEventListener('enemyParticleCollected', handleEnemyParticle);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('particleCollected', handlePlayerParticle);
      window.removeEventListener('enemyParticleCollected', handleEnemyParticle);
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  // ─── Mouse/touch movement ─────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      targetPos.current = {
        x: e.touches ? e.touches[0].clientX : e.clientX,
        y: e.touches ? e.touches[0].clientY : e.clientY,
      };
    };
    window.addEventListener('mousemove', h);
    window.addEventListener('touchmove', h, { passive: false });
    return () => { window.removeEventListener('mousemove', h); window.removeEventListener('touchmove', h); };
  }, []);

  // ─── Spawn helpers ────────────────────────────────────────────────────────────
  const fireProjectile = useCallback((x, y, vx, vy, color, owner, ownerSize) => {
    const projSize = Math.max(8, Math.min(ownerSize * 0.32, 50));
    projectiles.current.push({ id: uid(), x, y, vx, vy, color, owner, size: projSize });
  }, []);

  const safeSpawnPos = (forceOpposite = false, enemySize = 0) => {
    const W = window.innerWidth, H = window.innerHeight;
    const px = playerPos.current.x, py = playerPos.current.y;
    const minDist = Math.max(380, playerSize.current * 2.5 + enemySize);
    if (forceOpposite) return oppositeSafeSpawnPos(px, py, W, H);
    let x, y, tries = 0;
    do {
      x = Math.random() * W; y = Math.random() * H; tries++;
    } while (tries < 20 && Math.hypot(x - px, y - py) < minDist);
    return { x, y };
  };

  const spawnEnemy = useCallback((isBoss = false) => {
    const mob = mobileRef.current;
    const { min, max } = getSpawnSizeRange(score.current);
    const rawSize = isBoss
      ? playerSize.current * (1.5 + Math.random() * 0.4)
      : playerSize.current * (min + Math.random() * (max - min));
    const maxEnemy = mob ? (isBoss ? MOB_MAX_BOSS : MOB_MAX_ENEMY) : (isBoss ? 400 : 250);
    const size = isBoss
      ? Math.min(rawSize, playerSize.current, maxEnemy)
      : Math.max(Math.min(rawSize, maxEnemy), mob ? 12 : 18);
    const forceOpp = getVolume(size) >= getVolume(playerSize.current) * 0.85;
    const { x, y } = safeSpawnPos(forceOpp, size);
    const angle = Math.random() * Math.PI * 2;
    enemies.current.push({
      id: uid(), x, y, size, isBoss, type: 'blob',
      color: isBoss ? '#FF2020' : ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)],
      vx: Math.cos(angle), vy: Math.sin(angle),
      lastFire: Date.now() + Math.random() * 1500,
      targetAngle: angle, turnSpeed: isBoss ? 0.022 : 0.038,
      blobOffsets: buildBlobOffsets(Math.random()),
      phase: Math.random() * Math.PI * 2,
    });
  }, []);

  const spawnSlimeSquare = useCallback(() => {
    const mob = mobileRef.current;
    const size = Math.min(playerSize.current * 1.5, mob ? MOB_MAX_BOSS : 400);
    const { x, y } = safeSpawnPos(true, size);
    const angle = Math.random() * Math.PI * 2;
    enemies.current.push({
      id: uid(), x, y, size, isBoss: true, type: 'slime',
      vx: Math.cos(angle), vy: Math.sin(angle),
      targetAngle: angle, turnSpeed: 0.022,
      lastFire: Date.now(), trailTick: 0,
    });
  }, []);

  const spawnSaturn = useCallback(() => {
    const mob = mobileRef.current;
    const size = Math.min(playerSize.current * 1.28, mob ? MOB_MAX_BOSS : 400);
    const { x, y } = safeSpawnPos(true, size);
    const angle = Math.random() * Math.PI * 2;
    enemies.current.push({
      id: uid(), x, y, size, isBoss: true, type: 'saturn',
      vx: Math.cos(angle), vy: Math.sin(angle),
      targetAngle: angle, turnSpeed: 0.015,
      staticRot: 0, spinRot: 0, hits: 0, knockbackImmune: false,
    });
    setSaturnAlert(true);
    saturnAlertTimer.current = 180;
  }, []);

  const spawnCorn = useCallback(() => {
    const { x, y } = safeSpawnPos(false, 0);
    cornPickups.current.push({
      id: uid(), x, y,
      size: mobileRef.current ? 24 : 36,
      bob: Math.random() * Math.PI * 2,
    });
  }, []);

  const spawnBaja = useCallback(() => {
    const size = mobileRef.current ? 24 : 34;
    const { x, y } = safeSpawnPos(false, size);
    bajaPowerups.current.push({ id: uid(), x, y, size });
  }, []);

  const normalizeAngle = (angle) => {
    while (angle < -Math.PI) angle += Math.PI * 2;
    while (angle > Math.PI) angle -= Math.PI * 2;
    return angle;
  };

  const drawBajaCan = (ctx, cx, cy, size) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.sin(phaseRef.current * 0.8) * 0.08);
    ctx.fillStyle = '#0BD9C5';
    ctx.strokeStyle = '#00786E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(-size * 0.32, -size * 0.6, size * 0.64, size * 1.05, size * 0.14);
    } else {
      const w = size * 0.64;
      const h = size * 1.05;
      const r = size * 0.14;
      ctx.moveTo(-w / 2 + r, -h / 2);
      ctx.lineTo(w / 2 - r, -h / 2);
      ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
      ctx.lineTo(w / 2, h / 2 - r);
      ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
      ctx.lineTo(-w / 2 + r, h / 2);
      ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
      ctx.lineTo(-w / 2, -h / 2 + r);
      ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    }
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#3CE48F';
    ctx.fillRect(-size * 0.24, -size * 0.16, size * 0.48, size * 0.28);
    ctx.fillStyle = '#FFF';
    ctx.font = `800 ${Math.max(8, size * 0.18)}px 'Courier New', monospace`;
    ctx.fillText('BAJA', -ctx.measureText('BAJA').width / 2, 6);
    ctx.fillStyle = '#36FFD7';
    ctx.font = `600 ${Math.max(6, size * 0.12)}px 'Courier New', monospace`;
    ctx.fillText('BLAST', -ctx.measureText('BLAST').width / 2, size * 0.28);
    ctx.restore();
  };

  // ─── Reset ────────────────────────────────────────────────────────────────────
  const resetGame = useCallback(() => {
    mobileRef.current = isMobile();
    playerPos.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    targetPos.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    playerSize.current = mobileRef.current ? 36 : 60;
    score.current = 0;
    enemies.current = [];
    projectiles.current = [];
    slimeTrails.current = [];
    confettiRef.current = [];
    bajaPowerups.current = [];
    lightningArcs.current = [];
    cornPickups.current = [];
    lastAutoSpawnScore.current = 0;
    lastBossScore.current = 0;
    lastSlimeScore.current = 0;
    lastSaturnScore.current = 0;
    lastBajaSpawnTime.current = -1;
    bajaActiveRef.current = false;
    setBajaActive(false);
    bajaTimerRef.current = 0;
    bajaPhaseRef.current = 0;
    lastPlayerFire.current = 0;
    lastCornSpawnTime.current = 0;
    phaseRef.current = 0;
    animeModeRef.current = false;
    animeModeTimer.current = 0;
    animePhaseRef.current = 0;
    spotlightPhaseRef.current = 0;
    immuneRef.current = false;
    immuneTimerRef.current = 0;
    damageFlashTimer.current = 0;
    gameStartTime.current = 0;
    enemySyncTickRef.current = 0;
    window.__blobEnemies = [];
    setDisplayScore(0);
    setDisplayPlayerSize(mobileRef.current ? 36 : 60);
    setPlayerName('');
    setErrorMsg('');
    setMadeLeaderboard(false);
    setSaturnAlert(false);
    setDamageFlash(false);
    setImmuneActive(false);
    setAnimeMode(false);
  }, []);

  const startGame = useCallback(() => {
    resetGame();
    screenRef.current = 'playing';
    setScreen('playing');
    gameStartTime.current = Date.now();
  }, [resetGame]);

  const goToTitle = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    resetGame();
    window.__blobEnemies = null;
    screenRef.current = 'title';
    setScreen('title');
  }, [resetGame]);

  // ─── Main game loop ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'playing') return;
    screenRef.current = 'playing';

    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    let lastTime = performance.now();

    const loop = (now) => {
      if (screenRef.current !== 'playing') return;
      const dt = Math.min((now - lastTime) / 16.67, 3);
      lastTime = now;
      phaseRef.current += 0.04 * dt;
      hudTickRef.current += dt;
      if (hudTickRef.current > 8) {
        setDisplayScore(score.current);
        setDisplayPlayerSize(playerSize.current);
        setDisplayCornTime(immuneActive ? Math.max(0, Math.ceil(immuneTimerRef.current)) : 0);
        setDisplayBajaTime(bajaActive ? Math.max(0, Math.ceil(bajaTimerRef.current)) : 0);
        hudTickRef.current = 0;
      }

      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const mob = mobileRef.current;
      const curScore = score.current;
      const curSize = playerSize.current;
      const nowMs = Date.now();

      // ── Sync enemy positions → window.__blobEnemies for ParticleField ───────
      // Throttled to every 3 frames to avoid per-frame allocation pressure
      enemySyncTickRef.current += dt;
      if (enemySyncTickRef.current >= 3) {
        enemySyncTickRef.current = 0;
        window.__blobEnemies = enemies.current.map(e => ({
          id: e.id,
          x: e.x,
          y: e.y,
          size: e.size,
          type: e.type,  // ParticleField skips 'saturn'
        }));
      }

      // ── Timers ──────────────────────────────────────────────────────────────
      if (saturnAlertTimer.current > 0) {
        saturnAlertTimer.current -= dt;
        if (saturnAlertTimer.current <= 0) setSaturnAlert(false);
      }
      if (damageFlashTimer.current > 0) {
        damageFlashTimer.current -= dt;
        if (damageFlashTimer.current <= 0) { damageFlashTimer.current = 0; setDamageFlash(false); }
      }
      if (immuneRef.current && immuneTimerRef.current > 0) {
        immuneTimerRef.current -= dt / 60;
        if (immuneTimerRef.current <= 0) {
          immuneRef.current = false;
          immuneTimerRef.current = 0;
          setImmuneActive(false);
        }
      }

      // ── Anime Mode (5 min → 1 min) ───────────────────────────────────────
      const elapsedSec = (nowMs - gameStartTime.current) / 1000;
      if (!animeModeRef.current && elapsedSec >= 300) {
        animeModeRef.current = true;
        animeModeTimer.current = 60;
        setAnimeMode(true);
      }
      if (animeModeRef.current && animeModeTimer.current > 0) {
        animeModeTimer.current -= dt / 60;
        animePhaseRef.current += 0.008 * dt;
        spotlightPhaseRef.current += 0.018 * dt;
        if (animeModeTimer.current <= 0) {
          animeModeRef.current = false;
          setAnimeMode(false);
          gameStartTime.current -= 3600000;
        }
      }

      // ── Corn spawn (after 10 min, 50% chance per real minute) ────────────
      if (elapsedSec >= 600) {
        const nowSec = nowMs / 1000;
        const lastSec = lastCornSpawnTime.current / 1000;
        if (nowSec - lastSec >= 60) {
          lastCornSpawnTime.current = nowMs;
          if (Math.random() < 0.5) spawnCorn();
        }
      }

      // ── Baja Blast spawn (8 min guaranteed, then 50% every 3 min) ───────
      if (elapsedSec >= BAJA_FIRST_SPAWN_SEC) {
        const nowSec = nowMs / 1000;
        if (lastBajaSpawnTime.current < 0) {
          lastBajaSpawnTime.current = nowSec;
          spawnBaja();
        } else if (nowSec - lastBajaSpawnTime.current >= BAJA_RESPAWN_SEC) {
          lastBajaSpawnTime.current = nowSec;
          if (Math.random() < BAJA_RESPAWN_CHANCE) spawnBaja();
        }
      }

      // ── Spawning ─────────────────────────────────────────────────────────
      if (curScore >= lastAutoSpawnScore.current + Math.max(300, 1200 - Math.floor(curScore / 5000) * 60)) {
        lastAutoSpawnScore.current = curScore;
        spawnEnemy(false);
        const { guaranteed, remainder } = getExtraSpawnRolls(curScore);
        for (let g = 0; g < guaranteed; g++) spawnEnemy(false);
        if (Math.random() < remainder) spawnEnemy(false);
      }
      if (curScore > 0 && curScore >= lastBossScore.current + 5000) {
        lastBossScore.current = Math.floor(curScore / 5000) * 5000;
        spawnEnemy(true);
      }
      if (curScore > 0 && curScore >= lastSlimeScore.current + 8000) {
        lastSlimeScore.current = Math.floor(curScore / 8000) * 8000;
        spawnSlimeSquare();
      }
      if (curScore > 0 && curScore >= lastSaturnScore.current + 22222) {
        lastSaturnScore.current = Math.floor(curScore / 22222) * 22222;
        spawnSaturn();
      }

      // ── Player movement ──────────────────────────────────────────────────
      const dxP = targetPos.current.x - playerPos.current.x;
      const dyP = targetPos.current.y - playerPos.current.y;
      const distP = Math.hypot(dxP, dyP);
      if (distP > 4) {
        const spd = mob ? 3.8 : 5.5;
        playerPos.current.x += (dxP / distP) * spd * dt;
        playerPos.current.y += (dyP / distP) * spd * dt;
      }

      // ── Slime trails ─────────────────────────────────────────────────────
      slimeTrails.current = slimeTrails.current.filter(t => nowMs - t.ts < TRAIL_LINGER_MS);
      slimeTrails.current.forEach(t => {
        const age = (nowMs - t.ts) / TRAIL_LINGER_MS;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(57,255,20,${((1 - age) * 0.38).toFixed(2)})`;
        ctx.fill();
        if (!immuneRef.current && Math.hypot(t.x - playerPos.current.x, t.y - playerPos.current.y) < t.radius + curSize / 2) {
          playerSize.current = Math.max(playerSize.current - SLIME_DRAIN_RATE * dt, 20);
        }
      });

      // ── Corn pickups ─────────────────────────────────────────────────────
      for (let i = cornPickups.current.length - 1; i >= 0; i--) {
        const corn = cornPickups.current[i];
        corn.bob += 0.05 * dt;
        const bobY = corn.y + Math.sin(corn.bob) * 5;
        drawCornCob(ctx, corn.x, bobY, corn.size);
        ctx.save();
        ctx.beginPath();
        ctx.arc(corn.x, bobY, corn.size * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,215,0,${0.35 + 0.2 * Math.sin(phaseRef.current * 3)})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
        if (Math.hypot(corn.x - playerPos.current.x, bobY - playerPos.current.y) < curSize / 2 + corn.size * 0.7) {
          immuneRef.current = true;
          immuneTimerRef.current = 15;
          setImmuneActive(true);
          cornPickups.current.splice(i, 1);
        }
      }

      // ── Baja Blast pickups ─────────────────────────────────────────────────
      for (let i = bajaPowerups.current.length - 1; i >= 0; i--) {
        const powerup = bajaPowerups.current[i];
        drawBajaCan(ctx, powerup.x, powerup.y, powerup.size);
        const dist = Math.hypot(powerup.x - playerPos.current.x, powerup.y - playerPos.current.y);
        if (dist < curSize / 2 + powerup.size * 0.7) {
          bajaActiveRef.current = true;
          setBajaActive(true);
          bajaTimerRef.current = BAJA_POWERUP_DURATION;
          bajaPowerups.current.splice(i, 1);
        }
      }

      // ── Active Baja lightning arcs ─────────────────────────────────────────
      for (let i = lightningArcs.current.length - 1; i >= 0; i--) {
        const arc = lightningArcs.current[i];
        arc.life -= dt;
        if (arc.life <= 0) { lightningArcs.current.splice(i, 1); continue; }
        const start = arc.angle - arc.span * 0.5;
        const end = arc.angle + arc.span * 0.5;
        ctx.save();
        ctx.strokeStyle = 'rgba(0,255,235,0.85)';
        ctx.lineWidth = arc.thickness;
        ctx.shadowColor = 'rgba(0,255,235,0.75)';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        for (let step = 0; step <= 6; step++) {
          const t = step / 6;
          const angle = start + (end - start) * t;
          const radius = arc.radius + Math.sin(t * Math.PI * 3 + arc.phase) * arc.wobble;
          const x = playerPos.current.x + Math.cos(angle) * radius;
          const y = playerPos.current.y + Math.sin(angle) * radius;
          if (step === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();

        for (let j = enemies.current.length - 1; j >= 0; j--) {
          const e = enemies.current[j];
          const relX = e.x - playerPos.current.x;
          const relY = e.y - playerPos.current.y;
          const dist = Math.hypot(relX, relY);
          if (Math.abs(dist - arc.radius) > e.size * 0.55 + arc.thickness * 0.55) continue;
          const angle = Math.atan2(relY, relX);
          const delta = Math.abs(normalizeAngle(angle - arc.angle));
          if (delta <= arc.span * 0.5) {
            score.current = Math.min(score.current + (e.isBoss ? 1200 : 600), MAX_SCORE);
            enemies.current.splice(j, 1);
          }
        }
      }

      if (bajaActiveRef.current) {
        bajaTimerRef.current -= dt / 60;
        bajaPhaseRef.current += 0.08 * dt;
        if (bajaTimerRef.current <= 0) {
          bajaActiveRef.current = false;
          setBajaActive(false);
          bajaTimerRef.current = 0;
        }
      }

      // ── Projectiles ──────────────────────────────────────────────────────
      for (let i = projectiles.current.length - 1; i >= 0; i--) {
        const p = projectiles.current[i];
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < -120 || p.x > W + 120 || p.y < -120 || p.y > H + 120) {
          projectiles.current.splice(i, 1); continue;
        }

        if (p.owner === 'enemy') {
          let bounced = false;
          for (const e of enemies.current) {
            if (e.type !== 'saturn') continue;
            if (Math.hypot(p.x - e.x, p.y - e.y) < e.size * 0.55 + p.size / 2) {
              p.vx = -p.vx * 1.2; p.vy = -p.vy * 1.2;
              p.owner = 'player'; p.color = '#FFD700';
              bounced = true; break;
            }
          }
          if (bounced) continue;
          if (!immuneRef.current && Math.hypot(p.x - playerPos.current.x, p.y - playerPos.current.y) < curSize / 2 + p.size / 2) {
            // 33% base dmg + small bonus per projectile size
            playerSize.current = Math.max(playerSize.current - (playerSize.current * 0.33 + p.size * 0.18), 20);
            damageFlashTimer.current = 30;
            setDamageFlash(true);
            projectiles.current.splice(i, 1); continue;
          }
        } else {
          let hit = false;
          for (let j = enemies.current.length - 1; j >= 0; j--) {
            const e = enemies.current[j];
            const hitR = e.type === 'slime' ? e.size * 0.55 : e.type === 'saturn' ? e.size * 0.55 : e.size / 2;
            if (Math.hypot(p.x - e.x, p.y - e.y) < hitR + p.size / 2) {
              if (e.type === 'saturn') {
                e.hits++;
                if (e.hits >= 3) { score.current = Math.min(score.current + 3000, MAX_SCORE); enemies.current.splice(j, 1); }
              } else if (e.type === 'slime') {
                if (e.size > 28) {
                  const halfSize = e.size * 0.5;
                  const perpAngle = e.targetAngle + Math.PI / 2;
                  for (const side of [-1, 1]) {
                    const ang = Math.random() * Math.PI * 2;
                    enemies.current.push({
                      id: uid(), x: e.x + Math.cos(perpAngle) * side * halfSize * 0.6,
                      y: e.y + Math.sin(perpAngle) * side * halfSize * 0.6,
                      size: halfSize, isBoss: true, type: 'slime',
                      vx: Math.cos(ang), vy: Math.sin(ang),
                      targetAngle: ang, turnSpeed: 0.022, lastFire: Date.now(), trailTick: 0,
                    });
                  }
                  enemies.current.splice(j, 1);
                } else {
                  e.size *= 0.78;
                  if (e.size < 14) { score.current = Math.min(score.current + 2000, MAX_SCORE); enemies.current.splice(j, 1); }
                }
              } else {
                e.size *= 0.78;
                if (e.size < 14) {
                  score.current = Math.min(score.current + (e.isBoss ? 1000 : 500), MAX_SCORE);
                  enemies.current.splice(j, 1);
                }
              }
              projectiles.current.splice(i, 1);
              hit = true; break;
            }
          }
          if (hit) continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ── Enemies ──────────────────────────────────────────────────────────
      const playerVol = getVolume(curSize);

      for (let i = enemies.current.length - 1; i >= 0; i--) {
        const e = enemies.current[i];
        e.phase = (e.phase || 0) + 0.045 * dt;

        const angToP = Math.atan2(playerPos.current.y - e.y, playerPos.current.x - e.x);
        let dAng = angToP - e.targetAngle;
        while (dAng < -Math.PI) dAng += Math.PI * 2;
        while (dAng > Math.PI) dAng -= Math.PI * 2;
        e.targetAngle += dAng * e.turnSpeed * dt;
        e.vx = Math.cos(e.targetAngle);
        e.vy = Math.sin(e.targetAngle);

        if (e.knockbackTimer > 0) {
          e.knockbackTimer -= dt;
          e.x += e.knockbackVx * dt;
          e.y += e.knockbackVy * dt;
        } else {
          const spd = e.type === 'slime' ? (mob ? 1.5 : 2.2)
                    : e.type === 'saturn' ? (mob ? 1.4 : 2.0)
                    : (mob ? 2.0 : 2.8);
          e.x += e.vx * spd * dt;
          e.y += e.vy * spd * dt;
        }

        if (e.type === 'saturn') { e.spinRot = (e.spinRot || 0) + 0.04 * dt; e.staticRot = (e.staticRot || 0) + 0.003 * dt; }
        if (e.type === 'blob' && e.isBoss) e.starRot = (e.starRot || 0) + 0.015 * dt;

        if (e.type === 'slime') {
          e.trailTick = (e.trailTick || 0) + dt;
          if (e.trailTick >= 3) { slimeTrails.current.push({ x: e.x, y: e.y, radius: e.size * 0.42, ts: nowMs }); e.trailTick = 0; }
        }

        // Passive growth (supplemental to particle event growth)
        if (e.type !== 'saturn') {
          const maxSize = mob ? (e.isBoss ? MOB_MAX_BOSS : MOB_MAX_ENEMY) : (e.isBoss ? 400 : 250);
          e.size = Math.min(e.size + (e.isBoss ? (mob ? 0.006 : 0.010) : (mob ? 0.003 : 0.006)) * dt, maxSize);
        }

        // Fire projectiles
        const FIRE_CD = e.isBoss ? 2500 : 5500;
        if (e.type === 'blob' && nowMs - e.lastFire > FIRE_CD) {
          if (e.isBoss) {
            for (let k = 0; k < 8; k++) {
              const ang = (Math.PI * 2 / 8) * k + (e.starRot || 0);
              fireProjectile(e.x, e.y, Math.cos(ang) * (mob ? 7 : 9), Math.sin(ang) * (mob ? 7 : 9), '#FF3333', 'enemy', e.size);
            }
          } else {
            fireProjectile(e.x, e.y, e.vx * PROJECTILE_SPEED, e.vy * PROJECTILE_SPEED, '#00FFFF', 'enemy', e.size);
          }
          e.lastFire = nowMs;
        }

        // Saturn knocks enemies
        if (e.type === 'saturn') {
          for (let j = enemies.current.length - 1; j >= 0; j--) {
            if (j === i) continue;
            const other = enemies.current[j];
            if (other.type === 'saturn') continue;
            if (Math.hypot(e.x - other.x, e.y - other.y) < (e.size * 0.55 + other.size / 2) * 0.9) {
              const knockAng = Math.atan2(other.y - e.y, other.x - e.x);
              other.knockbackVx = Math.cos(knockAng) * 12;
              other.knockbackVy = Math.sin(knockAng) * 12;
              other.knockbackTimer = 120;
            }
          }
        }

        // Enemies eat each other with volume-based growth
        if (e.type !== 'saturn') {
          for (let j = enemies.current.length - 1; j >= 0; j--) {
            if (j === i) continue;
            const other = enemies.current[j];
            if (other.type === 'saturn') continue;
            if (Math.hypot(e.x - other.x, e.y - other.y) < (e.size / 2 + other.size / 2) * 0.82 && getVolume(e.size) > getVolume(other.size)) {
              const maxSize = mob ? (e.isBoss ? MOB_MAX_BOSS : MOB_MAX_ENEMY) : (e.isBoss ? 400 : 250);
              e.size = Math.min(Math.sqrt(e.size * e.size + other.size * other.size), maxSize);
              enemies.current.splice(j, 1);
              if (j < i) i--;
            }
          }
        }

        // Slime eats blob enemies with volume-based growth
        if (e.type === 'slime') {
          for (let j = enemies.current.length - 1; j >= 0; j--) {
            if (j === i || enemies.current[j].type === 'slime' || enemies.current[j].type === 'saturn') continue;
            const other = enemies.current[j];
            if (Math.hypot(e.x - other.x, e.y - other.y) < (e.size * 0.55 + other.size / 2) * 0.85 && getVolume(e.size) > getVolume(other.size)) {
              e.size = Math.min(Math.sqrt(e.size * e.size + other.size * other.size), mob ? MOB_MAX_BOSS : 400);
              enemies.current.splice(j, 1);
              if (j < i) i--;
            }
          }
        }

        // Contact with player
        const enemyVol = getVolume(e.size);
        const contactDist = (curSize / 2 + (e.type === 'slime' ? e.size * 0.55 : e.type === 'saturn' ? e.size * 0.55 : e.size / 2)) * 0.82;
        const distToPlayer = Math.hypot(e.x - playerPos.current.x, e.y - playerPos.current.y);

        if (distToPlayer < contactDist) {
          if (e.type === 'saturn') {
            const ang = Math.atan2(playerPos.current.y - e.y, playerPos.current.x - e.x);
            playerPos.current.x += Math.cos(ang) * 40;
            playerPos.current.y += Math.sin(ang) * 40;
          } else if (e.type === 'slime') {
            const forwardDot = ((playerPos.current.x - e.x) * e.vx + (playerPos.current.y - e.y) * e.vy);
            if (forwardDot > 0) {
              const maxP = mob ? MOB_MAX_PLAYER : 500;
              playerSize.current = Math.min(Math.sqrt(playerSize.current ** 2 + e.size * e.size), maxP);
              score.current = Math.min(score.current + 2000, MAX_SCORE);
              enemies.current.splice(i, 1);
              continue;
            }
          } else if (enemyVol > playerVol && !immuneRef.current) {
            screenRef.current = 'enteringName';
            setScreen('enteringName');
            return;
          } else {
            const maxP = mob ? MOB_MAX_PLAYER : 500;
            playerSize.current = Math.min(Math.sqrt(playerSize.current ** 2 + e.size * e.size), maxP);
            score.current = Math.min(score.current + Math.floor(e.size * 1.5) + (e.isBoss ? 1000 : 500), MAX_SCORE);
            enemies.current.splice(i, 1);
            continue;
          }
        }

        // Threat coloring
        const threatDist = curSize * 2.8 + e.size;
        const isThreat = distToPlayer < threatDist && getVolume(e.size) >= getVolume(curSize) * 0.7;

        // Draw
        ctx.save();
        if (e.type === 'saturn') {
          drawSaturn(ctx, e.x, e.y, e.size, e.staticRot, e.spinRot, e.hits);
          if (isThreat) {
            ctx.save();
            ctx.globalAlpha = 0.22;
            ctx.fillStyle = '#FF4F4F';
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.size * 0.72, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        } else if (e.type === 'slime') {
          const half = e.size * 0.52;
          ctx.translate(e.x, e.y);
          ctx.rotate(e.phase * 0.4);
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(-half, -half, half * 2, half * 2, half * 0.18);
          else ctx.rect(-half, -half, half * 2, half * 2);
          ctx.fillStyle = 'rgba(20,200,10,0.82)';
          ctx.strokeStyle = isThreat ? 'rgba(255,100,100,0.6)' : '#00FF00';
          ctx.lineWidth = isThreat ? 3 : 2.5;
          ctx.shadowColor = isThreat ? 'rgba(255,90,90,0.55)' : '#39FF14';
          ctx.shadowBlur = isThreat ? 12 : 10;
          ctx.fill(); ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#003300';
          ctx.font = `900 ${Math.max(9, e.size * 0.13)}px 'Courier New', monospace`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('SLIME', 0, 0);
        } else if (e.isBoss) {
          drawStar6(ctx, e.x, e.y, e.size / 2, e.starRot || 0);
          ctx.fillStyle = '#CC0000';
          ctx.strokeStyle = isThreat ? 'rgba(255,120,120,0.7)' : '#FF6666';
          ctx.lineWidth = isThreat ? 3 : 2;
          ctx.shadowColor = isThreat ? 'rgba(255,120,120,0.45)' : 'rgba(255,0,0,0.25)';
          ctx.shadowBlur = isThreat ? 28 : 20;
          ctx.fill(); ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#FFCCCC';
          ctx.font = `900 ${Math.max(9, e.size * 0.14)}px 'Courier New', monospace`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('BOSS', e.x, e.y);
        } else {
          drawBlob(ctx, e.x, e.y, e.size / 2, e.blobOffsets, e.phase);
          ctx.fillStyle = e.color;
          ctx.globalAlpha = 0.88;
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.strokeStyle = isThreat ? 'rgba(255,80,80,0.35)' : 'rgba(255,255,255,0.3)';
          ctx.lineWidth = isThreat ? 2.2 : 1.5;
          if (isThreat) {
            ctx.shadowColor = 'rgba(255,80,80,0.28)';
            ctx.shadowBlur = 12;
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
        ctx.restore();
      }

      // ── Player ────────────────────────────────────────────────────────────
      const px = playerPos.current.x, py = playerPos.current.y, pr = curSize / 2;
      const pOffsets = [0.95, 1.0, 0.92, 1.02, 0.96, 1.0, 0.94, 1.01];
      ctx.save();
      drawBlob(ctx, px, py, pr, pOffsets, phaseRef.current);
      const grad = ctx.createRadialGradient(px - pr * 0.3, py - pr * 0.3, 0, px, py, pr * 1.2);
      if (immuneRef.current) {
        grad.addColorStop(0, '#FFE066'); grad.addColorStop(0.55, '#FFD700'); grad.addColorStop(1, '#B8860B');
        ctx.fillStyle = grad; ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 42;
      } else if (bajaActiveRef.current) {
        grad.addColorStop(0, '#7DF9FF'); grad.addColorStop(0.45, '#2BE8C8'); grad.addColorStop(1, '#1B9A78');
        ctx.fillStyle = grad; ctx.shadowColor = '#34FFD9'; ctx.shadowBlur = 32;
      } else {
        grad.addColorStop(0, '#FF50A8'); grad.addColorStop(0.55, '#E01880'); grad.addColorStop(1, '#6600CC');
        ctx.fillStyle = grad; ctx.shadowColor = '#E01880'; ctx.shadowBlur = 28;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
      if (immuneRef.current) {
        const pulseR = pr * 1.3 + pr * 0.12 * Math.sin(phaseRef.current * 5);
        ctx.beginPath(); ctx.arc(px, py, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 3.5;
        ctx.globalAlpha = 0.6 + 0.3 * Math.abs(Math.sin(phaseRef.current * 4));
        ctx.stroke(); ctx.globalAlpha = 1;
      } else if (bajaActiveRef.current) {
        const pulseR = pr * 1.35 + pr * 0.14 * Math.sin(phaseRef.current * 4.2);
        ctx.beginPath(); ctx.arc(px, py, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(80,255,220,0.45)';
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.6 + 0.25 * Math.abs(Math.sin(phaseRef.current * 4));
        ctx.stroke(); ctx.globalAlpha = 1;
      }
      ctx.beginPath();
      ctx.ellipse(px - pr * 0.22, py - pr * 0.3, pr * 0.26, pr * 0.14, -0.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fill();
      ctx.restore();

      // ── Anime Mode overlay ────────────────────────────────────────────────
      if (animeModeRef.current) {
        const inv = (Math.sin(animePhaseRef.current) + 1) / 2;
        ctx.save();
        ctx.globalCompositeOperation = 'difference';
        ctx.fillStyle = `rgba(255,255,255,${(inv * 0.82).toFixed(2)})`;
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
        const slPhase = spotlightPhaseRef.current;
        for (const [baseX, offset] of [
          [W * 0.1, W * 0.18 * Math.sin(slPhase * 0.7)],
          [W * 0.9, W * 0.18 * Math.sin(slPhase * 0.7 + Math.PI)],
        ]) {
          const gx = baseX + offset;
          const sg = ctx.createRadialGradient(gx, H, 10, gx, H * 0.3, H * 0.85);
          sg.addColorStop(0, 'rgba(255,240,180,0.15)');
          sg.addColorStop(0.5, 'rgba(255,220,100,0.07)');
          sg.addColorStop(1, 'rgba(255,200,60,0)');
          ctx.save(); ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H); ctx.restore();
        }
      }

      // ── Confetti ──────────────────────────────────────────────────────────
      for (let i = confettiRef.current.length - 1; i >= 0; i--) {
        const c = confettiRef.current[i];
        c.x += c.vx * dt; c.y += c.vy * dt;
        c.vy += 0.12 * dt; c.rot += c.rotV * dt; c.life -= 0.004 * dt;
        if (c.life <= 0 || c.y > H + 40) { confettiRef.current.splice(i, 1); continue; }
        ctx.save(); ctx.globalAlpha = c.life; ctx.translate(c.x, c.y); ctx.rotate(c.rot);
        ctx.fillStyle = c.color; ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h); ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(animFrameRef.current); window.removeEventListener('resize', resize); };
  }, [screen, spawnEnemy, spawnSlimeSquare, spawnSaturn, spawnCorn, fireProjectile]);

  // ─── Click to shoot ───────────────────────────────────────────────────────────
  const handleAction = useCallback((e) => {
    if (screenRef.current !== 'playing') return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const now = Date.now();
    if (now - lastPlayerFire.current > PLAYER_FIRE_COOLDOWN) {
      const dx = x - playerPos.current.x, dy = y - playerPos.current.y;
      const mag = Math.hypot(dx, dy);
      if (mag > 1) {
        fireProjectile(playerPos.current.x, playerPos.current.y, (dx / mag) * PROJECTILE_SPEED, (dy / mag) * PROJECTILE_SPEED, '#00FF88', 'player', playerSize.current);
        if (bajaActiveRef.current) {
          for (let k = 0; k < 9; k++) {
            const angle = Math.random() * Math.PI * 2;
            lightningArcs.current.push({
              id: uid(),
              angle,
              span: Math.PI * (0.28 + Math.random() * 0.24),
              radius: playerSize.current * (1.2 + Math.random() * 1.1),
              thickness: 6 + Math.random() * 4,
              life: 22,
              phase: Math.random() * Math.PI * 2,
              wobble: 6 + Math.random() * 4,
            });
          }
        }
      }
      lastPlayerFire.current = now;
    }
  }, [fireProjectile]);

  // ─── Submit score ─────────────────────────────────────────────────────────────
  const commitScore = async () => {
    const cleanName = playerName.trim().toUpperCase() || '?????';
    if (BANNED_WORDS.some(w => cleanName.includes(w))) { setErrorMsg('IDENTIFIED AS GRIEFING. ACCESS DENIED.'); return; }
    setIsSubmitting(true);
    try {
      await supabase.from('leaderboard').insert([{ player_name: cleanName.substring(0, 5), score: score.current }]);
      const fresh = await fetchScores();
      const onBoard = fresh.some(e => e && e.score === score.current);
      if (onBoard) { setMadeLeaderboard(true); spawnConfetti(confettiRef); }
      screenRef.current = 'gameOver'; setScreen('gameOver');
    } catch { screenRef.current = 'gameOver'; setScreen('gameOver'); }
    finally { setIsSubmitting(false); }
  };

  const rankMeta = (i) => {
    if (i === 0) return { bg: 'linear-gradient(135deg,#FFD700,#FFA500)', text: '#5A3A00', medal: '🥇', glow: '0 0 20px rgba(255,215,0,0.45)' };
    if (i === 1) return { bg: 'linear-gradient(135deg,#E8E8E8,#C0C0C0)', text: '#1A1A1A', medal: '🥈', glow: '0 0 14px rgba(192,192,192,0.35)' };
    if (i === 2) return { bg: 'linear-gradient(135deg,#CD7F32,#A0522D)', text: '#FFF3E0', medal: '🥉', glow: '0 0 12px rgba(205,127,50,0.35)' };
    return { bg: 'rgba(255,255,255,0.05)', text: '#CCCCCC', medal: null, glow: 'none' };
  };

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden touch-none"
      style={{ cursor: screen === 'playing' ? 'crosshair' : 'auto' }}
      onMouseDown={screen === 'playing' ? handleAction : undefined}
      onTouchStart={screen === 'playing' ? handleAction : undefined}
    >
      <canvas ref={canvasRef} className="fixed inset-0" style={{ zIndex: 101, pointerEvents: 'none' }} />

      {/* Damage flash overlay */}
      <AnimatePresence>
        {damageFlash && (
          <motion.div key="dmgflash"
            initial={{ opacity: 0.55 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 115, background: 'radial-gradient(ellipse at center, rgba(255,0,0,0.0) 30%, rgba(255,0,0,0.62) 100%)' }}
          />
        )}
      </AnimatePresence>

      <button onClick={onClose} className="fixed top-10 right-10 z-[130] p-3 rounded-full text-white transition-all"
        style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
        <X size={22} />
      </button>

      <AnimatePresence>
        {saturnAlert && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-10 right-16 z-[120] pointer-events-none"
            style={{ fontFamily: "'Courier New', monospace", color: '#FF3333', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.15em', textShadow: '0 0 12px rgba(255,50,50,0.8)' }}>
            ⚠ SATURN HAS SPAWNED
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {animeMode && (
          <motion.div key="anime"
            initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.7, 1] }} exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[125] pointer-events-none"
            style={{ fontFamily: "'Courier New', monospace", color: '#FF00FF', fontSize: '1rem', fontWeight: 900, letterSpacing: '0.3em', textShadow: '0 0 20px rgba(255,0,255,0.9)', mixBlendMode: 'difference' }}>
            ✦ ANIME MODE ✦
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {immuneActive && (
          <motion.div key="immune"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-24 right-12 z-[120] pointer-events-none"
            style={{ fontFamily: "'Courier New', monospace", color: '#FFD700', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.18em', textShadow: '0 0 14px rgba(255,215,0,0.9)' }}>
            🌽 IMMUNE
          </motion.div>
        )}
      </AnimatePresence>

      {screen === 'playing' && (
        <div className="fixed top-10 left-12 z-[110] pointer-events-none select-none" style={{ fontFamily: "'Courier New', monospace" }}>
          <p style={{ fontSize: '3.4rem', fontWeight: 900, fontStyle: 'italic', lineHeight: 1, color: '#E01880', textShadow: '0 0 18px rgba(224,24,128,0.55), 0 2px 0 rgba(0,0,0,0.6)' }}>
            {displayScore.toLocaleString()}
          </p>
          <p style={{ fontSize: '0.65rem', color: 'rgba(224,24,128,0.55)', letterSpacing: '0.18em', marginTop: 3 }}>
            SIZE {Math.floor(displayPlayerSize)}
          </p>
          {((immuneActive && displayCornTime > 0) || (bajaActive && displayBajaTime > 0)) && (
            <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
              {immuneActive && displayCornTime > 0 && (() => {
                const isFlash = displayCornTime <= 2;
                return (
                  <div style={{ display: 'grid', placeItems: 'center', width: 46, height: 46, borderRadius: '50%', background: `conic-gradient(rgba(255,215,0,0.95) 0deg ${Math.round(displayCornTime / BAJA_POWERUP_DURATION * 360)}deg, rgba(255,255,255,0.08) ${Math.round(displayCornTime / BAJA_POWERUP_DURATION * 360)}deg 360deg)`, border: `2px solid rgba(255,215,0,${isFlash ? 0.9 : 0.5})`, boxShadow: isFlash ? '0 0 18px rgba(255,215,0,0.4)' : '0 0 10px rgba(255,215,0,0.18)', transform: isFlash ? 'scale(1.08)' : 'none', transition: 'transform 0.12s ease' }}>
                    <div style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,0.25)', color: '#FFF', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center' }}>
                      <span style={{ lineHeight: 1 }}>{displayCornTime}</span>
                      <span style={{ fontSize: '0.55rem', opacity: 0.75 }}>CORN</span>
                    </div>
                  </div>
                );
              })()}
              {bajaActive && displayBajaTime > 0 && (() => {
                const isFlash = displayBajaTime <= 2;
                return (
                  <div style={{ display: 'grid', placeItems: 'center', width: 46, height: 46, borderRadius: '50%', background: `conic-gradient(rgba(20,255,235,0.95) 0deg ${Math.round(displayBajaTime / BAJA_POWERUP_DURATION * 360)}deg, rgba(255,255,255,0.08) ${Math.round(displayBajaTime / BAJA_POWERUP_DURATION * 360)}deg 360deg)`, border: `2px solid rgba(20,255,235,${isFlash ? 0.95 : 0.45})`, boxShadow: isFlash ? '0 0 18px rgba(20,255,235,0.4)' : '0 0 10px rgba(20,255,235,0.18)', transform: isFlash ? 'scale(1.08)' : 'none', transition: 'transform 0.12s ease' }}>
                    <div style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,0.25)', color: '#FFF', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center' }}>
                      <span style={{ lineHeight: 1 }}>{displayBajaTime}</span>
                      <span style={{ fontSize: '0.55rem', opacity: 0.75 }}>BAJA</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {screen === 'title' && (
          <motion.div key="title"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
            style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(140,0,80,0.18) 0%, rgba(0,0,0,0.97) 70%)' }}
          >
            <button onClick={toggleMute} style={{
              position: 'absolute', top: 'clamp(16px, 4vh, 40px)', left: 'clamp(16px, 4vw, 48px)',
              background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.18)',
              borderRadius: 999, padding: '10px 14px', color: muted ? '#888' : '#E01880',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
              fontFamily: "'Courier New', monospace", fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.15em',
              backdropFilter: 'blur(8px)', transition: 'all 0.18s', zIndex: 210,
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(224,24,128,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              {muted ? 'MUTED' : 'SOUND'}
            </button>

            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.1 }}
              style={{ marginBottom: '3vh', textAlign: 'center', lineHeight: 0.85 }}>
              <span style={{ fontFamily: "'Boogaloo','Fredoka One','Nunito',system-ui,sans-serif", fontSize: 'clamp(5rem,16vw,14rem)', fontWeight: 900, letterSpacing: '-0.02em', display: 'block', background: 'linear-gradient(180deg,#aaffaa 0%,#22cc22 30%,#006600 70%,#003300 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 6px 0 #003300) drop-shadow(0 12px 24px rgba(57,255,20,0.35))', userSelect: 'none' }}>BLOB</span>
              <span style={{ fontFamily: "'Boogaloo','Fredoka One','Nunito',system-ui,sans-serif", fontSize: 'clamp(5rem,16vw,14rem)', fontWeight: 900, letterSpacing: '-0.02em', display: 'block', background: 'linear-gradient(180deg,#ff88cc 0%,#E01880 35%,#8800aa 75%,#440055 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 6px 0 #330022) drop-shadow(0 12px 28px rgba(224,24,128,0.4))', userSelect: 'none' }}>GAME</span>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 0.5 }}
              style={{ fontFamily: "'Courier New',monospace", fontSize: '0.8rem', color: '#aaa', letterSpacing: '0.25em', marginBottom: '5vh' }}>
              EAT · GROW · SURVIVE
            </motion.p>

            <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
              onClick={startGame}
              style={{ fontFamily: "'Boogaloo','Fredoka One',system-ui,sans-serif", fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 700, padding: '14px 54px', borderRadius: 999, background: 'linear-gradient(135deg,#E01880,#8800aa)', color: '#fff', border: '3px solid rgba(255,100,200,0.4)', cursor: 'pointer', letterSpacing: '0.08em', boxShadow: '0 0 40px rgba(224,24,128,0.45),0 4px 0 #330022', transition: 'all 0.18s cubic-bezier(.34,1.56,.64,1)', outline: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(224,24,128,0.7),0 6px 0 #330022'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(224,24,128,0.45),0 4px 0 #330022'; }}
            >START GAME</motion.button>

            {highScores[0] && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 0.9 }}
                style={{ marginTop: '4vh', fontFamily: "'Courier New',monospace", fontSize: '0.7rem', color: '#888', letterSpacing: '0.15em', textAlign: 'center' }}>
                <p style={{ color: '#E01880', marginBottom: 4, letterSpacing: '0.3em', fontSize: '0.6rem' }}>── TOP SCORE ──</p>
                <p style={{ fontSize: '1rem', fontWeight: 900, color: '#FFD700' }}>{highScores[0].name} &nbsp; {highScores[0].score.toLocaleString()}</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {screen === 'enteringName' && (
          <motion.div key="name"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(16px)', fontFamily: "'Courier New',monospace" }}>
            <div style={{ maxWidth: 360, width: '100%', textAlign: 'center' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', color: '#E01880', marginBottom: 10 }}>It's a blob eat blob world....</p>
              <h2 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', fontStyle: 'italic', display: 'inline-block', transform: 'skewX(-8deg)', marginBottom: 4 }}>NEURAL ENTRY</h2>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', marginBottom: 22, letterSpacing: '0.12em' }}>FINAL SCORE: {score.current.toLocaleString()}</p>
              {errorMsg && <p style={{ color: '#FF4444', fontWeight: 700, marginBottom: 14, fontSize: '0.82rem' }}>{errorMsg}</p>}
              <input autoFocus maxLength={5} value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && commitScore()}
                placeholder="#####"
                style={{ width: '100%', background: '#fff', color: '#000', fontSize: '3.2rem', textAlign: 'center', fontWeight: 900, textTransform: 'uppercase', outline: 'none', border: '4px solid #E01880', padding: '6px 0', marginBottom: 14, transform: 'skewX(-6deg)', fontFamily: 'inherit', letterSpacing: '0.22em', display: 'block' }}
              />
              <button onClick={commitScore} disabled={isSubmitting}
                style={{ width: '100%', padding: '13px 0', background: '#E01880', color: '#fff', fontWeight: 900, fontSize: '1rem', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', transform: 'skewX(-6deg)', letterSpacing: '0.16em', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'UPLOAD DATA ↗'}
              </button>
            </div>
          </motion.div>
        )}

        {screen === 'gameOver' && (
          <motion.div key="gameover"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.93)', backdropFilter: 'blur(22px)', fontFamily: "'Courier New',monospace" }}>
            <div style={{ maxWidth: 500, width: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: 26 }}>
                {madeLeaderboard && (
                  <motion.p initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                    style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: '#FFD700', marginBottom: 6 }}>🎉 YOU MADE THE LEADERBOARD 🎉</motion.p>
                )}
                <p style={{ fontSize: '0.6rem', letterSpacing: '0.4em', color: '#E01880', marginBottom: 8 }}>── GLOBAL RANKING ──</p>
                <h2 style={{ fontSize: '3.4rem', fontWeight: 900, fontStyle: 'italic', color: '#fff', display: 'inline-block', transform: 'skewX(-10deg)', lineHeight: 1, textShadow: '0 0 40px rgba(224,24,128,0.35)' }}>HALL OF FAME</h2>
                <p style={{ fontSize: '0.72rem', color: 'rgba(224,24,128,0.6)', marginTop: 6, letterSpacing: '0.15em' }}>YOUR SCORE &nbsp;{score.current.toLocaleString()}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 22 }}>
                {Array(10).fill(null).map((_, i) => {
                  const entry = highScores[i];
                  const meta = rankMeta(i);
                  const isTop3 = i < 3;
                  return (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      style={{ display: 'flex', alignItems: 'center', padding: isTop3 ? '9px 14px' : '6px 14px', background: meta.bg, boxShadow: meta.glow, borderRadius: 3, gap: 10, transform: `skewX(${isTop3 ? -3 : -1.5}deg)`, border: isTop3 ? 'none' : '1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ minWidth: 26, textAlign: 'right', fontStyle: 'italic', fontSize: isTop3 ? '1rem' : '0.8rem', fontWeight: 900, color: isTop3 ? meta.text : 'rgba(180,180,180,0.4)' }}>{i + 1}</span>
                      <span style={{ minWidth: 20, textAlign: 'center', fontSize: isTop3 ? 16 : 10 }}>{meta.medal ? meta.medal : <span style={{ color: 'rgba(255,255,255,0.15)' }}>◆</span>}</span>
                      <span style={{ flex: 1, fontWeight: 900, letterSpacing: '0.18em', fontSize: isTop3 ? '1.15rem' : '0.9rem', textTransform: 'uppercase', color: entry ? meta.text : (isTop3 ? `${meta.text}66` : 'rgba(255,255,255,0.16)') }}>{entry ? entry.name : '[EMPTY]'}</span>
                      <span style={{ fontWeight: 900, letterSpacing: '0.05em', fontSize: isTop3 ? '1.15rem' : '0.9rem', color: entry ? meta.text : (isTop3 ? `${meta.text}66` : 'rgba(255,255,255,0.16)') }}>{entry ? entry.score.toLocaleString() : '---'}</span>
                    </motion.div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={goToTitle}
                  style={{ flex: 1, padding: '14px 0', background: 'transparent', color: '#aaa', border: '2px solid rgba(255,255,255,0.2)', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', transform: 'skewX(-6deg)', letterSpacing: '0.1em', fontFamily: 'inherit', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#E01880'; e.currentTarget.style.color = '#E01880'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#aaa'; }}
                >← TITLE</button>
                <button onClick={startGame}
                  style={{ flex: 2, padding: '14px 0', background: '#fff', color: '#000', border: '3px solid #fff', fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer', transform: 'skewX(-6deg)', letterSpacing: '0.12em', fontFamily: 'inherit', transition: 'all 0.15s', boxShadow: '5px 5px 0 rgba(224,24,128,0.45)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#E01880'; e.currentTarget.style.borderColor = '#E01880'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.color = '#000'; }}
                >PLAY AGAIN ↺</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Boogaloo&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default BlobGame;