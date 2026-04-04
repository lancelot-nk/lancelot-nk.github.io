import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

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

// ─── Spawn difficulty scaling ─────────────────────────────────────────────────
// Base size multiplier range increments +0.1 per 10k points
function getSpawnSizeRange(score) {
  const tiers = Math.floor(score / 10000);
  const baseMin = 0.4 + tiers * 0.1;
  const baseMax = 1.3 + tiers * 0.1;
  return { min: baseMin, max: baseMax };
}
// Extra spawn chance: 10% per 10k points, rolls extra spawns if >100%
function getExtraSpawnRolls(score) {
  const pct = Math.floor(score / 10000) * 10; // e.g. 110% at 110k
  const guaranteed = Math.floor(pct / 100);
  const remainder = (pct % 100) / 100;
  return { guaranteed, remainder };
}

// ─── Saturn texture helper ────────────────────────────────────────────────────
function drawSaturn(ctx, cx, cy, size, staticRot, spinRot, hits) {
  const half = size * 0.48;
  // Color darkens with hits: 0=tan, 1=brown, 2=dark brown
  const baseColors = ['rgba(210,180,130,0.88)', 'rgba(160,110,60,0.88)', 'rgba(90,55,20,0.88)'];
  const ringColors = ['rgba(230,200,140,0.7)', 'rgba(180,130,70,0.7)', 'rgba(110,70,25,0.7)'];
  const col = baseColors[Math.min(hits, 2)];
  const rcol = ringColors[Math.min(hits, 2)];

  ctx.save();
  ctx.translate(cx, cy);

  // Static square (planet body)
  ctx.save();
  ctx.rotate(staticRot);
  ctx.fillStyle = col;
  ctx.strokeStyle = rcol;
  ctx.lineWidth = 2;
  ctx.fillRect(-half, -half, half * 2, half * 2);
  ctx.strokeRect(-half, -half, half * 2, half * 2);
  // Planet bands
  for (let b = 1; b < 4; b++) {
    ctx.strokeStyle = `rgba(0,0,0,0.12)`;
    ctx.lineWidth = half * 0.18;
    ctx.beginPath();
    ctx.moveTo(-half, -half + (b / 4) * half * 2);
    ctx.lineTo(half, -half + (b / 4) * half * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Spinning ring square (rotated)
  ctx.save();
  ctx.rotate(spinRot);
  ctx.strokeStyle = rcol;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.7;
  ctx.strokeRect(-half * 1.35, -half * 1.35, half * 2.7, half * 2.7);
  ctx.globalAlpha = 1;
  ctx.restore();

  // Label
  ctx.fillStyle = hits === 2 ? '#FF6666' : '#3A2000';
  ctx.font = `900 ${Math.max(8, size * 0.13)}px 'Courier New', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SATURN', 0, 0);
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

// ─── Main component ───────────────────────────────────────────────────────────
const BlobGame = ({ onClose }) => {
  const [screen, setScreen] = useState('title'); // 'title' | 'playing' | 'enteringName' | 'gameOver'
  const [displayScore, setDisplayScore] = useState(0);
  const [displayPlayerSize, setDisplayPlayerSize] = useState(60);
  const [highScores, setHighScores] = useState(Array(10).fill(null));
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [saturnAlert, setSaturnAlert] = useState(false);
  const [madeLeaderboard, setMadeLeaderboard] = useState(false);

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
  const animFrameRef = useRef(null);
  const phaseRef = useRef(0);
  const idCounter = useRef(0);
  const lastAutoSpawnScore = useRef(0);
  const lastBossScore = useRef(0);
  const lastSlimeScore = useRef(0);
  const lastSaturnScore = useRef(0);
  const lastPlayerFire = useRef(0);
  const hudTickRef = useRef(0);
  const saturnAlertTimer = useRef(0);

  const PLAYER_SPEED = 5.5;
  const PROJECTILE_SPEED = 13;
  const PLAYER_FIRE_COOLDOWN = 1000;
  const SLIME_DRAIN_RATE = 0.06;
  const TRAIL_LINGER_MS = 5000;
  const BANNED_WORDS = ['SLUR1', 'SLUR2', 'FUCK', 'SHIT', 'PISS', 'CUNT'];
  const ENEMY_COLORS = ['#FF1493', '#00FF7F', '#1E90FF', '#FFD700', '#FF6B35', '#B14FFF'];
  const uid = () => ++idCounter.current;

  // ─── Fetch scores (universal) ─────────────────────────────────────────────
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

  // ─── Particle score listener ──────────────────────────────────────────────
  useEffect(() => {
    const handle = () => {
      if (screenRef.current !== 'playing') return;
      const sizeBonus = Math.max(0, Math.floor(playerSize.current / 80)); // very subtle
      score.current = Math.min(score.current + 15 + sizeBonus, MAX_SCORE);
      playerSize.current = Math.min(playerSize.current + 0.8, 500);
    };
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('particleCollected', handle);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('particleCollected', handle);
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  // ─── Mouse/touch movement ─────────────────────────────────────────────────
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

  // ─── Spawn helpers ────────────────────────────────────────────────────────
  const fireProjectile = useCallback((x, y, vx, vy, color, owner, ownerSize) => {
    const projSize = Math.max(8, Math.min(ownerSize * 0.32, 50));
    projectiles.current.push({ id: uid(), x, y, vx, vy, color, owner, size: projSize });
  }, []);

  const safeSpawnPos = () => {
    let x, y, tries = 0;
    do {
      x = Math.random() * window.innerWidth;
      y = Math.random() * window.innerHeight;
      tries++;
    } while (tries < 20 && Math.hypot(x - playerPos.current.x, y - playerPos.current.y) < 340);
    return { x, y };
  };

  const spawnEnemy = useCallback((isBoss = false) => {
    const { x, y } = safeSpawnPos();
    const { min, max } = getSpawnSizeRange(score.current);
    const playerVol = playerSize.current;
    const maxBossSize = playerVol; // boss can't spawn bigger than player
    const rawSize = isBoss
      ? playerSize.current * (1.5 + Math.random() * 0.4)
      : playerSize.current * (min + Math.random() * (max - min));
    const size = isBoss ? Math.min(rawSize, maxBossSize) : Math.max(rawSize, 18);
    const angle = Math.random() * Math.PI * 2;
    enemies.current.push({
      id: uid(), x, y, size,
      isBoss, type: 'blob',
      color: isBoss ? '#FF2020' : ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)],
      vx: Math.cos(angle), vy: Math.sin(angle),
      lastFire: Date.now() + Math.random() * 1500,
      targetAngle: angle, turnSpeed: isBoss ? 0.022 : 0.038,
      blobOffsets: buildBlobOffsets(Math.random()),
      phase: Math.random() * Math.PI * 2,
    });
  }, []);

  const spawnSlimeSquare = useCallback(() => {
    const { x, y } = safeSpawnPos();
    const angle = Math.random() * Math.PI * 2;
    enemies.current.push({
      id: uid(), x, y,
      size: Math.min(playerSize.current * 1.5, playerSize.current),
      isBoss: true, type: 'slime',
      vx: Math.cos(angle), vy: Math.sin(angle),
      targetAngle: angle, turnSpeed: 0.022,
      lastFire: Date.now(), trailTick: 0,
    });
  }, []);

  const spawnSaturn = useCallback(() => {
    const { x, y } = safeSpawnPos();
    const angle = Math.random() * Math.PI * 2;
    enemies.current.push({
      id: uid(), x, y,
      size: Math.min(playerSize.current * 1.6, playerSize.current * 1.2),
      isBoss: true, type: 'saturn',
      vx: Math.cos(angle), vy: Math.sin(angle),
      targetAngle: angle, turnSpeed: 0.015,
      staticRot: 0, spinRot: 0,
      hits: 0, // 0,1,2 → 3rd hit kills
      knockbackImmune: false,
    });
    setSaturnAlert(true);
    saturnAlertTimer.current = 180; // frames
  }, []);

  // ─── Reset game state ─────────────────────────────────────────────────────
  const resetGame = useCallback(() => {
    playerPos.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    targetPos.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    playerSize.current = 60;
    score.current = 0;
    enemies.current = [];
    projectiles.current = [];
    slimeTrails.current = [];
    confettiRef.current = [];
    lastAutoSpawnScore.current = 0;
    lastBossScore.current = 0;
    lastSlimeScore.current = 0;
    lastSaturnScore.current = 0;
    lastPlayerFire.current = 0;
    phaseRef.current = 0;
    setDisplayScore(0);
    setDisplayPlayerSize(60);
    setPlayerName('');
    setErrorMsg('');
    setMadeLeaderboard(false);
    setSaturnAlert(false);
  }, []);

  const startGame = useCallback(() => {
    resetGame();
    screenRef.current = 'playing';
    setScreen('playing');
  }, [resetGame]);

  const goToTitle = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    resetGame();
    screenRef.current = 'title';
    setScreen('title');
  }, [resetGame]);

  // ─── Main game loop ───────────────────────────────────────────────────────
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
        hudTickRef.current = 0;
      }

      // Saturn alert countdown
      if (saturnAlertTimer.current > 0) {
        saturnAlertTimer.current -= dt;
        if (saturnAlertTimer.current <= 0) setSaturnAlert(false);
      }

      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const curScore = score.current;
      const curSize = playerSize.current;
      const nowMs = Date.now();

      // ── Spawning ─────────────────────────────────────────────────────────
      if (curScore >= lastAutoSpawnScore.current + Math.max(300, 1200 - Math.floor(curScore / 5000) * 60)) {
        lastAutoSpawnScore.current = curScore;
        spawnEnemy(false);
        // Extra spawn rolls
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
        playerPos.current.x += (dxP / distP) * PLAYER_SPEED * dt;
        playerPos.current.y += (dyP / distP) * PLAYER_SPEED * dt;
      }

      // ── Slime trails ─────────────────────────────────────────────────────
      slimeTrails.current = slimeTrails.current.filter(t => nowMs - t.ts < TRAIL_LINGER_MS);
      slimeTrails.current.forEach(t => {
        const age = (nowMs - t.ts) / TRAIL_LINGER_MS;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(57,255,20,${((1 - age) * 0.38).toFixed(2)})`;
        ctx.fill();
        if (Math.hypot(t.x - playerPos.current.x, t.y - playerPos.current.y) < t.radius + curSize / 2) {
          playerSize.current = Math.max(playerSize.current - SLIME_DRAIN_RATE * dt, 20);
        }
      });

      // ── Projectiles ──────────────────────────────────────────────────────
      for (let i = projectiles.current.length - 1; i >= 0; i--) {
        const p = projectiles.current[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -120 || p.x > W + 120 || p.y < -120 || p.y > H + 120) {
          projectiles.current.splice(i, 1); continue;
        }

        // Saturn bounces enemy projectiles
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
          if (Math.hypot(p.x - playerPos.current.x, p.y - playerPos.current.y) < curSize / 2 + p.size / 2) {
            // Projectile size determines damage — bigger = more damage
            const dmg = p.size * 0.6;
            playerSize.current = Math.max(playerSize.current - dmg, 20);
            projectiles.current.splice(i, 1); continue;
          }
        } else {
          // Player projectile
          let hit = false;
          for (let j = enemies.current.length - 1; j >= 0; j--) {
            const e = enemies.current[j];
            const hitR = e.type === 'slime' ? e.size * 0.55 : e.type === 'saturn' ? e.size * 0.55 : e.size / 2;
            if (Math.hypot(p.x - e.x, p.y - e.y) < hitR + p.size / 2) {
              if (e.type === 'saturn') {
                e.hits++;
                if (e.hits >= 3) {
                  score.current = Math.min(score.current + 2000, MAX_SCORE);
                  enemies.current.splice(j, 1);
                }
              } else if (e.type === 'slime') {
                // Slime splits in half when shot
                if (e.size > 28) {
                  const halfSize = e.size * 0.5;
                  const perpAngle = e.targetAngle + Math.PI / 2;
                  for (const side of [-1, 1]) {
                    const ang = Math.random() * Math.PI * 2;
                    enemies.current.push({
                      id: uid(),
                      x: e.x + Math.cos(perpAngle) * side * halfSize * 0.6,
                      y: e.y + Math.sin(perpAngle) * side * halfSize * 0.6,
                      size: halfSize,
                      isBoss: true, type: 'slime',
                      vx: Math.cos(ang), vy: Math.sin(ang),
                      targetAngle: ang, turnSpeed: 0.022,
                      lastFire: Date.now(), trailTick: 0,
                    });
                  }
                  enemies.current.splice(j, 1);
                } else {
                  e.size *= 0.78;
                  if (e.size < 14) { score.current = Math.min(score.current + 1200, MAX_SCORE); enemies.current.splice(j, 1); }
                }
              } else {
                e.size *= 0.78;
                if (e.size < 14) {
                  score.current = Math.min(score.current + (e.isBoss ? 1200 : 500), MAX_SCORE);
                  enemies.current.splice(j, 1);
                }
              }
              projectiles.current.splice(i, 1);
              hit = true; break;
            }
          }
          if (hit) continue;
        }

        // Draw projectile
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

        // Steer toward player
        const angToP = Math.atan2(playerPos.current.y - e.y, playerPos.current.x - e.x);
        let dAng = angToP - e.targetAngle;
        while (dAng < -Math.PI) dAng += Math.PI * 2;
        while (dAng > Math.PI) dAng -= Math.PI * 2;
        e.targetAngle += dAng * e.turnSpeed * dt;
        e.vx = Math.cos(e.targetAngle);
        e.vy = Math.sin(e.targetAngle);

        // Handle knockback (for saturn-sent enemies)
        if (e.knockbackTimer > 0) {
          e.knockbackTimer -= dt;
          e.x += e.knockbackVx * dt;
          e.y += e.knockbackVy * dt;
        } else {
          const spd = e.type === 'slime' ? 2.2 : e.type === 'saturn' ? 2.0 : 2.8;
          e.x += e.vx * spd * dt;
          e.y += e.vy * spd * dt;
        }

        // Saturn ring spin
        if (e.type === 'saturn') {
          e.spinRot = (e.spinRot || 0) + 0.04 * dt;
          e.staticRot = (e.staticRot || 0) + 0.003 * dt;
        }

        // Star boss spins
        if (e.type === 'blob' && e.isBoss) {
          e.starRot = (e.starRot || 0) + 0.015 * dt;
        }

        // Slime trail
        if (e.type === 'slime') {
          e.trailTick = (e.trailTick || 0) + dt;
          if (e.trailTick >= 3) {
            slimeTrails.current.push({ x: e.x, y: e.y, radius: e.size * 0.42, ts: nowMs });
            e.trailTick = 0;
          }
        }

        // Enemy eats particles (handled via particleCollected event for player only;
        // for enemies we simulate by checking proximity to blob positions and growing passively)
        // Growth rate: blobs grow slowly over time to simulate eating particles
        if (e.type !== 'saturn') {
          const growRate = e.isBoss ? 0.008 : 0.003;
          e.size = Math.min(e.size + growRate * dt, e.isBoss ? 400 : 250);
        }

        // Blob enemies shoot
        const FIRE_CD = e.isBoss ? 2500 : 5500;
        if (e.type === 'blob' && nowMs - e.lastFire > FIRE_CD) {
          if (e.isBoss) {
            for (let k = 0; k < 8; k++) {
              const ang = (Math.PI * 2 / 8) * k + (e.starRot || 0);
              fireProjectile(e.x, e.y, Math.cos(ang) * 9, Math.sin(ang) * 9, '#FF3333', 'enemy', e.size);
            }
          } else {
            fireProjectile(e.x, e.y, e.vx * PROJECTILE_SPEED, e.vy * PROJECTILE_SPEED, '#00FFFF', 'enemy', e.size);
          }
          e.lastFire = nowMs;
        }

        // Saturn — collide with other enemies (knock, don't eat)
        if (e.type === 'saturn') {
          for (let j = enemies.current.length - 1; j >= 0; j--) {
            if (j === i) continue;
            const other = enemies.current[j];
            if (other.type === 'saturn') continue;
            const dist = Math.hypot(e.x - other.x, e.y - other.y);
            const contactR = (e.size * 0.55 + other.size / 2) * 0.9;
            if (dist < contactR) {
              const knockAng = Math.atan2(other.y - e.y, other.x - e.x);
              const kspeed = 6 * 2; // doubled speed
              other.knockbackVx = Math.cos(knockAng) * kspeed;
              other.knockbackVy = Math.sin(knockAng) * kspeed;
              other.knockbackTimer = 2 * 60; // 2 seconds at 60fps
            }
          }
        }

        // Enemies eat each other (except saturn)
        if (e.type !== 'saturn') {
          for (let j = enemies.current.length - 1; j >= 0; j--) {
            if (j === i) continue;
            const other = enemies.current[j];
            if (other.type === 'saturn') continue;
            const dist = Math.hypot(e.x - other.x, e.y - other.y);
            const contactR = (e.size / 2 + other.size / 2) * 0.82;
            if (dist < contactR && getVolume(e.size) > getVolume(other.size)) {
              e.size = Math.min(e.size + other.size * 0.08, e.isBoss ? 400 : 250);
              enemies.current.splice(j, 1);
              if (j < i) i--;
            }
          }
        }

        // Slime eats blobs specifically (more aggressive)
        if (e.type === 'slime') {
          for (let j = enemies.current.length - 1; j >= 0; j--) {
            if (j === i || enemies.current[j].type === 'slime' || enemies.current[j].type === 'saturn') continue;
            const other = enemies.current[j];
            if (Math.hypot(e.x - other.x, e.y - other.y) < (e.size * 0.55 + other.size / 2) * 0.85) {
              if (getVolume(e.size) > getVolume(other.size)) {
                e.size = Math.min(e.size + other.size * 0.12, 400);
                enemies.current.splice(j, 1);
                if (j < i) i--;
              }
            }
          }
        }

        // Slime can only be eaten from the front (check direction)
        const canPlayerEatSlimeFromFront = (eSlime) => {
          // "front" = player approaching from ahead of slime's movement direction
          const toPlayer = Math.atan2(playerPos.current.y - eSlime.y, playerPos.current.x - eSlime.x);
          let fDiff = eSlime.targetAngle - toPlayer;
          while (fDiff < -Math.PI) fDiff += Math.PI * 2;
          while (fDiff > Math.PI) fDiff -= Math.PI * 2;
          return Math.abs(fDiff) > Math.PI * 0.55; // player is in front half
        };

        // Consumption vs player
        const enemyVol = getVolume(e.size);
        const contactDist = (curSize / 2 + (e.type === 'slime' ? e.size * 0.55 : e.type === 'saturn' ? e.size * 0.55 : e.size / 2)) * 0.82;
        if (Math.hypot(e.x - playerPos.current.x, e.y - playerPos.current.y) < contactDist) {
          if (e.type === 'saturn') {
            // Saturn only propels player
            const ang = Math.atan2(playerPos.current.y - e.y, playerPos.current.x - e.x);
            playerPos.current.x += Math.cos(ang) * 40;
            playerPos.current.y += Math.sin(ang) * 40;
          } else if (enemyVol > playerVol) {
            if (e.type === 'slime' && !canPlayerEatSlimeFromFront(e)) {
              // Slime eats player from behind/side
              screenRef.current = 'enteringName';
              setScreen('enteringName');
              return;
            } else if (e.type !== 'slime') {
              screenRef.current = 'enteringName';
              setScreen('enteringName');
              return;
            }
          } else {
            // Player eats enemy
            if (e.type === 'slime' && !canPlayerEatSlimeFromFront(e)) {
              // Can't eat slime from behind
            } else {
              playerSize.current = Math.min(Math.sqrt(playerSize.current ** 2 + (e.size * 0.15) ** 2), 500);
              score.current = Math.min(score.current + Math.floor(e.size * 1.5), MAX_SCORE);
              enemies.current.splice(i, 1);
              continue;
            }
          }
        }

        // ── Draw enemy ───────────────────────────────────────────────────
        ctx.save();
        if (e.type === 'saturn') {
          drawSaturn(ctx, e.x, e.y, e.size, e.staticRot, e.spinRot, e.hits);
        } else if (e.type === 'slime') {
          const half = e.size * 0.52;
          ctx.translate(e.x, e.y);
          ctx.rotate(e.phase * 0.4);
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(-half, -half, half * 2, half * 2, half * 0.18);
          else ctx.rect(-half, -half, half * 2, half * 2);
          ctx.fillStyle = 'rgba(20,200,10,0.82)';
          ctx.strokeStyle = '#00FF00';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#39FF14';
          ctx.shadowBlur = 18;
          ctx.fill(); ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#003300';
          ctx.font = `900 ${Math.max(9, e.size * 0.13)}px 'Courier New', monospace`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('SLIME', 0, 0);
        } else if (e.isBoss) {
          drawStar6(ctx, e.x, e.y, e.size / 2, e.starRot || 0);
          ctx.fillStyle = '#CC0000';
          ctx.strokeStyle = '#FF6666';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#FF0000';
          ctx.shadowBlur = 24;
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
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.restore();
      }

      // ── Player blob ───────────────────────────────────────────────────────
      const px = playerPos.current.x, py = playerPos.current.y, pr = curSize / 2;
      const pOffsets = [0.95, 1.0, 0.92, 1.02, 0.96, 1.0, 0.94, 1.01];
      ctx.save();
      drawBlob(ctx, px, py, pr, pOffsets, phaseRef.current);
      const grad = ctx.createRadialGradient(px - pr * 0.3, py - pr * 0.3, 0, px, py, pr * 1.2);
      grad.addColorStop(0, '#FF50A8');
      grad.addColorStop(0.55, '#E01880');
      grad.addColorStop(1, '#6600CC');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#E01880';
      ctx.shadowBlur = 28;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.ellipse(px - pr * 0.22, py - pr * 0.3, pr * 0.26, pr * 0.14, -0.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.fill();
      ctx.restore();

      // ── Confetti ──────────────────────────────────────────────────────────
      for (let i = confettiRef.current.length - 1; i >= 0; i--) {
        const c = confettiRef.current[i];
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.vy += 0.12 * dt;
        c.rot += c.rotV * dt;
        c.life -= 0.004 * dt;
        if (c.life <= 0 || c.y > H + 40) { confettiRef.current.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = c.life;
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(animFrameRef.current); window.removeEventListener('resize', resize); };
  }, [screen, spawnEnemy, spawnSlimeSquare, spawnSaturn, fireProjectile]);

  // ─── Click to shoot ───────────────────────────────────────────────────────
  const handleAction = useCallback((e) => {
    if (screenRef.current !== 'playing') return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const now = Date.now();
    if (now - lastPlayerFire.current > PLAYER_FIRE_COOLDOWN) {
      const dx = x - playerPos.current.x, dy = y - playerPos.current.y;
      const mag = Math.hypot(dx, dy);
      if (mag > 1) fireProjectile(playerPos.current.x, playerPos.current.y, (dx / mag) * PROJECTILE_SPEED, (dy / mag) * PROJECTILE_SPEED, '#00FF88', 'player', playerSize.current);
      lastPlayerFire.current = now;
    }
  }, [fireProjectile]);

  // ─── Submit score ─────────────────────────────────────────────────────────
  const commitScore = async () => {
    const cleanName = playerName.trim().toUpperCase() || '?????';
    if (BANNED_WORDS.some(w => cleanName.includes(w))) { setErrorMsg('IDENTIFIED AS GRIEFING. ACCESS DENIED.'); return; }
    setIsSubmitting(true);
    try {
      await supabase.from('leaderboard').insert([{ player_name: cleanName.substring(0, 5), score: score.current }]);
      const fresh = await fetchScores();
      // Check if player made the board
      const onBoard = fresh.some(e => e && e.score === score.current);
      if (onBoard) {
        setMadeLeaderboard(true);
        spawnConfetti(confettiRef);
      }
      screenRef.current = 'gameOver';
      setScreen('gameOver');
    } catch { screenRef.current = 'gameOver'; setScreen('gameOver'); }
    finally { setIsSubmitting(false); }
  };

  // ─── Rank meta ────────────────────────────────────────────────────────────
  const rankMeta = (i) => {
    if (i === 0) return { bg: 'linear-gradient(135deg,#FFD700,#FFA500)', text: '#5A3A00', medal: '🥇', glow: '0 0 20px rgba(255,215,0,0.45)' };
    if (i === 1) return { bg: 'linear-gradient(135deg,#E8E8E8,#C0C0C0)', text: '#1A1A1A', medal: '🥈', glow: '0 0 14px rgba(192,192,192,0.35)' };
    if (i === 2) return { bg: 'linear-gradient(135deg,#CD7F32,#A0522D)', text: '#FFF3E0', medal: '🥉', glow: '0 0 12px rgba(205,127,50,0.35)' };
    return { bg: 'rgba(255,255,255,0.05)', text: '#CCCCCC', medal: null, glow: 'none' };
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden touch-none"
      style={{ cursor: screen === 'playing' ? 'crosshair' : 'auto' }}
      onMouseDown={screen === 'playing' ? handleAction : undefined}
      onTouchStart={screen === 'playing' ? handleAction : undefined}
    >
      {/* Game canvas — always mounted so confetti can play on gameOver too */}
      <canvas ref={canvasRef} className="fixed inset-0" style={{ zIndex: 101, pointerEvents: 'none' }} />

      {/* Close button */}
      <button onClick={onClose} className="fixed top-10 right-10 z-[130] p-3 rounded-full text-white transition-all"
        style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
        <X size={22} />
      </button>

      {/* Saturn alert */}
      <AnimatePresence>
        {saturnAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-10 right-16 z-[120] pointer-events-none"
            style={{ fontFamily: "'Courier New', monospace", color: '#FF3333', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.15em', textShadow: '0 0 12px rgba(255,50,50,0.8)' }}
          >
            ⚠ SATURN HAS SPAWNED
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD */}
      {screen === 'playing' && (
        <div className="fixed top-10 left-12 z-[110] pointer-events-none select-none" style={{ fontFamily: "'Courier New', monospace" }}>
          <p style={{ fontSize: '3.4rem', fontWeight: 900, fontStyle: 'italic', lineHeight: 1, color: '#E01880', textShadow: '0 0 18px rgba(224,24,128,0.55), 0 2px 0 rgba(0,0,0,0.6)' }}>
            {displayScore.toLocaleString()}
          </p>
          <p style={{ fontSize: '0.65rem', color: 'rgba(224,24,128,0.55)', letterSpacing: '0.18em', marginTop: 3 }}>
            SIZE {Math.floor(displayPlayerSize)}
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ── TITLE SCREEN ── */}
        {screen === 'title' && (
          <motion.div
            key="title"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
            style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(140,0,80,0.18) 0%, rgba(0,0,0,0.97) 70%)' }}
          >
            {/* BLOB GAME title */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.1 }}
              style={{ marginBottom: '3vh', textAlign: 'center', lineHeight: 0.85 }}
            >
              <span style={{
                fontFamily: "'Boogaloo', 'Fredoka One', 'Nunito', system-ui, sans-serif",
                fontSize: 'clamp(5rem, 16vw, 14rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                display: 'block',
                // Slimy effect: green-tinted with drip shadow
                background: 'linear-gradient(180deg, #aaffaa 0%, #22cc22 30%, #006600 70%, #003300 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 6px 0 #003300) drop-shadow(0 12px 24px rgba(57,255,20,0.35))',
                textShadow: 'none',
                userSelect: 'none',
              }}>
                BLOB
              </span>
              <span style={{
                fontFamily: "'Boogaloo', 'Fredoka One', 'Nunito', system-ui, sans-serif",
                fontSize: 'clamp(5rem, 16vw, 14rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                display: 'block',
                background: 'linear-gradient(180deg, #ff88cc 0%, #E01880 35%, #8800aa 75%, #440055 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 6px 0 #330022) drop-shadow(0 12px 28px rgba(224,24,128,0.4))',
                textShadow: 'none',
                userSelect: 'none',
              }}>
                GAME
              </span>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 0.5 }}
              style={{ fontFamily: "'Courier New', monospace", fontSize: '0.8rem', color: '#aaa', letterSpacing: '0.25em', marginBottom: '5vh' }}
            >
              EAT · GROW · SURVIVE
            </motion.p>

            {/* Start button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
              onClick={startGame}
              style={{
                fontFamily: "'Boogaloo', 'Fredoka One', system-ui, sans-serif",
                fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                fontWeight: 700,
                padding: '14px 54px',
                borderRadius: 999,
                background: 'linear-gradient(135deg, #E01880, #8800aa)',
                color: '#fff',
                border: '3px solid rgba(255,100,200,0.4)',
                cursor: 'pointer',
                letterSpacing: '0.08em',
                boxShadow: '0 0 40px rgba(224,24,128,0.45), 0 4px 0 #330022',
                transition: 'all 0.18s cubic-bezier(.34,1.56,.64,1)',
                outline: 'none',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 0 60px rgba(224,24,128,0.7), 0 6px 0 #330022';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                e.currentTarget.style.boxShadow = '0 0 40px rgba(224,24,128,0.45), 0 4px 0 #330022';
              }}
            >
              START GAME
            </motion.button>

            {/* Leaderboard preview on title */}
            {highScores[0] && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 0.9 }}
                style={{ marginTop: '4vh', fontFamily: "'Courier New', monospace", fontSize: '0.7rem', color: '#888', letterSpacing: '0.15em', textAlign: 'center' }}
              >
                <p style={{ color: '#E01880', marginBottom: 4, letterSpacing: '0.3em', fontSize: '0.6rem' }}>── TOP SCORE ──</p>
                <p style={{ fontSize: '1rem', fontWeight: 900, color: '#FFD700' }}>
                  {highScores[0].name} &nbsp; {highScores[0].score.toLocaleString()}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── ENTERING NAME ── */}
        {screen === 'enteringName' && (
          <motion.div
            key="name"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(16px)', fontFamily: "'Courier New', monospace" }}
          >
            <div style={{ maxWidth: 360, width: '100%', textAlign: 'center' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', color: '#E01880', marginBottom: 10 }}>── SYSTEM TERMINATED ──</p>
              <h2 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#fff', fontStyle: 'italic', display: 'inline-block', transform: 'skewX(-8deg)', marginBottom: 4 }}>
                NEURAL ENTRY
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', marginBottom: 22, letterSpacing: '0.12em' }}>
                FINAL SCORE: {score.current.toLocaleString()}
              </p>
              {errorMsg && <p style={{ color: '#FF4444', fontWeight: 700, marginBottom: 14, fontSize: '0.82rem' }}>{errorMsg}</p>}
              <input
                autoFocus maxLength={5} value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && commitScore()}
                placeholder="#####"
                style={{
                  width: '100%', background: '#fff', color: '#000', fontSize: '3.2rem',
                  textAlign: 'center', fontWeight: 900, textTransform: 'uppercase',
                  outline: 'none', border: '4px solid #E01880', padding: '6px 0',
                  marginBottom: 14, transform: 'skewX(-6deg)', fontFamily: 'inherit',
                  letterSpacing: '0.22em', display: 'block',
                }}
              />
              <button
                onClick={commitScore} disabled={isSubmitting}
                style={{
                  width: '100%', padding: '13px 0', background: '#E01880', color: '#fff',
                  fontWeight: 900, fontSize: '1rem', border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transform: 'skewX(-6deg)', letterSpacing: '0.16em',
                  fontFamily: 'inherit', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8, opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'UPLOAD DATA ↗'}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── GAME OVER / LEADERBOARD ── */}
        {screen === 'gameOver' && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.93)', backdropFilter: 'blur(22px)', fontFamily: "'Courier New', monospace" }}
          >
            <div style={{ maxWidth: 500, width: '100%' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: 26 }}>
                {madeLeaderboard && (
                  <motion.p
                    initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                    style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: '#FFD700', marginBottom: 6 }}
                  >
                    🎉 YOU MADE THE LEADERBOARD 🎉
                  </motion.p>
                )}
                <p style={{ fontSize: '0.6rem', letterSpacing: '0.4em', color: '#E01880', marginBottom: 8 }}>── GLOBAL RANKING ──</p>
                <h2 style={{
                  fontSize: '3.4rem', fontWeight: 900, fontStyle: 'italic', color: '#fff',
                  display: 'inline-block', transform: 'skewX(-10deg)', lineHeight: 1,
                  textShadow: '0 0 40px rgba(224,24,128,0.35)'
                }}>
                  HALL OF FAME
                </h2>
                <p style={{ fontSize: '0.72rem', color: 'rgba(224,24,128,0.6)', marginTop: 6, letterSpacing: '0.15em' }}>
                  YOUR SCORE &nbsp;{score.current.toLocaleString()}
                </p>
              </div>

              {/* Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 22 }}>
                {Array(10).fill(null).map((_, i) => {
                  const entry = highScores[i];
                  const meta = rankMeta(i);
                  const isTop3 = i < 3;
                  return (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      style={{
                        display: 'flex', alignItems: 'center',
                        padding: isTop3 ? '9px 14px' : '6px 14px',
                        background: meta.bg, boxShadow: meta.glow, borderRadius: 3, gap: 10,
                        transform: `skewX(${isTop3 ? -3 : -1.5}deg)`,
                        border: isTop3 ? 'none' : '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <span style={{ minWidth: 26, textAlign: 'right', fontStyle: 'italic', fontSize: isTop3 ? '1rem' : '0.8rem', fontWeight: 900, color: isTop3 ? meta.text : 'rgba(180,180,180,0.4)' }}>
                        {i + 1}
                      </span>
                      <span style={{ minWidth: 20, textAlign: 'center', fontSize: isTop3 ? 16 : 10 }}>
                        {meta.medal ? meta.medal : <span style={{ color: 'rgba(255,255,255,0.15)' }}>◆</span>}
                      </span>
                      <span style={{ flex: 1, fontWeight: 900, letterSpacing: '0.18em', fontSize: isTop3 ? '1.15rem' : '0.9rem', textTransform: 'uppercase', color: entry ? meta.text : (isTop3 ? `${meta.text}66` : 'rgba(255,255,255,0.16)') }}>
                        {entry ? entry.name : '[EMPTY]'}
                      </span>
                      <span style={{ fontWeight: 900, letterSpacing: '0.05em', fontSize: isTop3 ? '1.15rem' : '0.9rem', color: entry ? meta.text : (isTop3 ? `${meta.text}66` : 'rgba(255,255,255,0.16)') }}>
                        {entry ? entry.score.toLocaleString() : '---'}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={goToTitle}
                  style={{
                    flex: 1, padding: '14px 0', background: 'transparent', color: '#aaa',
                    border: '2px solid rgba(255,255,255,0.2)', fontWeight: 900,
                    fontSize: '1rem', cursor: 'pointer', transform: 'skewX(-6deg)',
                    letterSpacing: '0.1em', fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#E01880'; e.currentTarget.style.color = '#E01880'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#aaa'; }}
                >
                  ← TITLE
                </button>
                <button
                  onClick={startGame}
                  style={{
                    flex: 2, padding: '14px 0', background: '#fff', color: '#000',
                    border: '3px solid #fff', fontWeight: 900, fontSize: '1.1rem',
                    cursor: 'pointer', transform: 'skewX(-6deg)', letterSpacing: '0.12em',
                    fontFamily: 'inherit', transition: 'all 0.15s',
                    boxShadow: '5px 5px 0 rgba(224,24,128,0.45)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#E01880'; e.currentTarget.style.borderColor = '#E01880'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.color = '#000'; }}
                >
                  PLAY AGAIN ↺
                </button>
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