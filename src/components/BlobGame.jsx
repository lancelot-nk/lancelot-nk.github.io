import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// ─── Blob shape math ──────────────────────────────────────────────────────────
const BLOB_POINTS = 8;
function buildBlobOffsets(seed) {
  const offsets = [];
  for (let i = 0; i < BLOB_POINTS; i++) {
    offsets.push(0.82 + ((seed * (i + 3.7) * 17.37) % 1) * 0.36);
  }
  return offsets;
}
function drawBlob(ctx, cx, cy, r, offsets, phase) {
  ctx.beginPath();
  for (let i = 0; i <= BLOB_POINTS; i++) {
    const idx = i % BLOB_POINTS;
    const wobble = 1 + 0.12 * Math.sin(phase * 2.1 + idx * 1.3);
    const rr = r * offsets[idx] * wobble;
    const angle = (idx / BLOB_POINTS) * Math.PI * 2 - Math.PI / 2;
    const x = cx + rr * Math.cos(angle);
    const y = cy + rr * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function drawStar6(ctx, cx, cy, r, rotation) {
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    const rr = i % 2 === 0 ? r : r * 0.48;
    const angle = (Math.PI / 6) * i + rotation;
    const x = cx + rr * Math.cos(angle);
    const y = cy + rr * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

const getVolume = (size) => Math.PI * (size / 2) ** 2;

// ─── Difficulty scaling ───────────────────────────────────────────────────────
function getDifficulty(score) {
  return Math.min(1, score / 60000);
}
function getEnemySpeed(score) {
  return 1.6 + getDifficulty(score) * 2.8;
}
function getEnemyFireCooldown(score) {
  return Math.max(1800, 6000 - getDifficulty(score) * 4200);
}
function getEnemySpawnInterval(score) {
  return Math.max(300, 1200 - getDifficulty(score) * 900);
}

// ─── Main component ───────────────────────────────────────────────────────────
const BlobGame = ({ onClose }) => {
  const [gameState, setGameState] = useState('playing');
  const [displayScore, setDisplayScore] = useState(0);
  const [displayPlayerSize, setDisplayPlayerSize] = useState(60);
  const [highScores, setHighScores] = useState(Array(10).fill(null));
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const canvasRef = useRef(null);
  const gameStateRef = useRef('playing');
  const playerPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const targetPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const playerSize = useRef(60);
  const score = useRef(0);
  const enemies = useRef([]);
  const projectiles = useRef([]);
  const slimeTrails = useRef([]);
  const animFrameRef = useRef(null);
  const phaseRef = useRef(0);
  const idCounter = useRef(0);
  const lastAutoSpawnScore = useRef(0);
  const lastBossScore = useRef(0);
  const lastSlimeScore = useRef(0);
  const lastPlayerFire = useRef(0);

  const PLAYER_SPEED = 5.5;
  const PROJECTILE_SPEED = 13;
  const PLAYER_FIRE_COOLDOWN = 750;
  const SLIME_DRAIN_RATE = 0.06;
  const TRAIL_LINGER_MS = 5000;
  const BANNED_WORDS = ['SLUR1', 'SLUR2', 'FUCK', 'SHIT', 'PISS', 'CUNT'];
  const ENEMY_COLORS = ['#FF1493', '#00FF7F', '#1E90FF', '#FFD700', '#FF6B35', '#B14FFF'];

  const uid = () => ++idCounter.current;

  const fetchScores = useCallback(async () => {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('player_name, score')
      .order('score', { ascending: false })
      .limit(10);
    if (!error && data) {
      setHighScores(Array(10).fill(null).map((_, i) =>
        data[i] ? { name: data[i].player_name, score: data[i].score } : null
      ));
    }
  }, []);

  useEffect(() => { fetchScores(); }, [fetchScores]);

  useEffect(() => {
    const handleParticleScore = () => {
      if (gameStateRef.current !== 'playing') return;
      const sizeBonus = Math.max(1, Math.floor(playerSize.current / 20));
      score.current += 10 + sizeBonus;
      playerSize.current = Math.min(playerSize.current + 0.8, 500);
    };
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('particleCollected', handleParticleScore);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('particleCollected', handleParticleScore);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const handleInput = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      targetPos.current = { x, y };
    };
    window.addEventListener('mousemove', handleInput);
    window.addEventListener('touchmove', handleInput, { passive: false });
    return () => {
      window.removeEventListener('mousemove', handleInput);
      window.removeEventListener('touchmove', handleInput);
    };
  }, []);

  const fireProjectile = useCallback((x, y, vx, vy, color, owner, ownerSize) => {
    const projSize = Math.max(7, Math.min(ownerSize * 0.22, 38));
    projectiles.current.push({ id: uid(), x, y, vx, vy, color, owner, size: projSize });
  }, []);

  const spawnEnemy = useCallback((isBoss = false) => {
    const diff = getDifficulty(score.current);
    const baseSize = isBoss
      ? playerSize.current * (1.6 + diff * 0.6)
      : playerSize.current * (0.4 + Math.random() * 0.9 + diff * 0.4);
    let x, y, tries = 0;
    do {
      x = Math.random() * window.innerWidth;
      y = Math.random() * window.innerHeight;
      tries++;
    } while (tries < 20 && Math.hypot(x - playerPos.current.x, y - playerPos.current.y) < 320);
    const angle = Math.random() * Math.PI * 2;
    enemies.current.push({
      id: uid(), x, y, size: Math.max(baseSize, 20),
      isBoss, type: 'blob',
      color: isBoss ? '#FF2020' : ENEMY_COLORS[Math.floor(Math.random() * ENEMY_COLORS.length)],
      vx: Math.cos(angle), vy: Math.sin(angle),
      lastFire: Date.now() + Math.random() * 1500,
      targetAngle: angle,
      turnSpeed: isBoss ? 0.018 + diff * 0.012 : 0.032 + diff * 0.02,
      blobOffsets: buildBlobOffsets(Math.random()),
      phase: Math.random() * Math.PI * 2,
    });
  }, []);

  const spawnSlimeSquare = useCallback(() => {
    const diff = getDifficulty(score.current);
    let x, y, tries = 0;
    do {
      x = Math.random() * window.innerWidth;
      y = Math.random() * window.innerHeight;
      tries++;
    } while (tries < 20 && Math.hypot(x - playerPos.current.x, y - playerPos.current.y) < 380);
    const angle = Math.random() * Math.PI * 2;
    enemies.current.push({
      id: uid(), x, y,
      size: playerSize.current * (1.5 + diff * 0.5),
      isBoss: true, type: 'slime',
      vx: Math.cos(angle), vy: Math.sin(angle),
      targetAngle: angle, turnSpeed: 0.022,
      lastFire: Date.now(), trailTick: 0,
    });
  }, []);

  // ─── Game loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (gameState !== 'playing') return;
    gameStateRef.current = 'playing';

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let lastTime = performance.now();
    let hudTick = 0;

    const loop = (now) => {
      if (gameStateRef.current !== 'playing') return;
      const dt = Math.min((now - lastTime) / 16.67, 3);
      lastTime = now;
      phaseRef.current += 0.04 * dt;
      hudTick += dt;

      // Only sync React state every ~8 frames for performance
      if (hudTick > 8) {
        setDisplayScore(score.current);
        setDisplayPlayerSize(playerSize.current);
        hudTick = 0;
      }

      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const curScore = score.current;
      const curSize = playerSize.current;
      const enemySpeed = getEnemySpeed(curScore);
      const fireCooldown = getEnemyFireCooldown(curScore);
      const spawnInterval = getEnemySpawnInterval(curScore);
      const nowMs = Date.now();

      // ── Spawning ───────────────────────────────────────────────────────────
      if (curScore >= lastAutoSpawnScore.current + spawnInterval) {
        lastAutoSpawnScore.current = curScore;
        spawnEnemy(false);
      }
      if (curScore >= lastBossScore.current + 5000) {
        lastBossScore.current = Math.floor(curScore / 5000) * 5000;
        spawnEnemy(true);
      }
      if (curScore >= lastSlimeScore.current + 8000) {
        lastSlimeScore.current = Math.floor(curScore / 8000) * 8000;
        spawnSlimeSquare();
      }

      // ── Player movement ────────────────────────────────────────────────────
      const dxP = targetPos.current.x - playerPos.current.x;
      const dyP = targetPos.current.y - playerPos.current.y;
      const distP = Math.hypot(dxP, dyP);
      if (distP > 4) {
        playerPos.current.x += (dxP / distP) * PLAYER_SPEED * dt;
        playerPos.current.y += (dyP / distP) * PLAYER_SPEED * dt;
      }

      // ── Slime trails ───────────────────────────────────────────────────────
      slimeTrails.current = slimeTrails.current.filter(t => nowMs - t.ts < TRAIL_LINGER_MS);
      slimeTrails.current.forEach(t => {
        const age = (nowMs - t.ts) / TRAIL_LINGER_MS;
        const alpha = (1 - age) * 0.38;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(57,255,20,${alpha.toFixed(2)})`;
        ctx.fill();
        const d = Math.hypot(t.x - playerPos.current.x, t.y - playerPos.current.y);
        if (d < t.radius + curSize / 2) {
          playerSize.current = Math.max(playerSize.current - SLIME_DRAIN_RATE * dt, 20);
        }
      });

      // ── Projectiles ────────────────────────────────────────────────────────
      for (let i = projectiles.current.length - 1; i >= 0; i--) {
        const p = projectiles.current[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.x < -120 || p.x > W + 120 || p.y < -120 || p.y > H + 120) {
          projectiles.current.splice(i, 1); continue;
        }

        if (p.owner === 'enemy') {
          if (Math.hypot(p.x - playerPos.current.x, p.y - playerPos.current.y) < curSize / 2 + p.size / 2) {
            playerSize.current = Math.max(playerSize.current - p.size * 0.35, 20);
            projectiles.current.splice(i, 1); continue;
          }
        } else {
          let hit = false;
          for (let j = enemies.current.length - 1; j >= 0; j--) {
            const e = enemies.current[j];
            const hitR = e.type === 'slime' ? e.size * 0.55 : e.size / 2;
            if (Math.hypot(p.x - e.x, p.y - e.y) < hitR + p.size / 2) {
              e.size *= 0.78;
              if (e.size < 14) {
                score.current += e.isBoss ? 1200 : 500;
                enemies.current.splice(j, 1);
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

      // ── Enemies ────────────────────────────────────────────────────────────
      const playerVol = getVolume(curSize);
      for (let i = enemies.current.length - 1; i >= 0; i--) {
        const e = enemies.current[i];
        e.phase = (e.phase || 0) + 0.045 * dt;

        // Steer toward player
        const angleToPlayer = Math.atan2(playerPos.current.y - e.y, playerPos.current.x - e.x);
        let diff = angleToPlayer - e.targetAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        e.targetAngle += diff * e.turnSpeed * dt;
        e.vx = Math.cos(e.targetAngle);
        e.vy = Math.sin(e.targetAngle);
        const spd = e.type === 'slime' ? (2.0 + getDifficulty(curScore) * 1.2) : enemySpeed;
        e.x += e.vx * spd * dt;
        e.y += e.vy * spd * dt;

        // Slime trail emission
        if (e.type === 'slime') {
          e.trailTick = (e.trailTick || 0) + dt;
          if (e.trailTick >= 3) {
            slimeTrails.current.push({ x: e.x, y: e.y, radius: e.size * 0.42, ts: nowMs });
            e.trailTick = 0;
          }
        }

        // Shooting
        if (e.type === 'blob' && nowMs - e.lastFire > fireCooldown) {
          if (e.isBoss) {
            const shots = 6 + Math.floor(getDifficulty(curScore) * 3);
            for (let k = 0; k < shots; k++) {
              const ang = (Math.PI * 2 / shots) * k;
              fireProjectile(e.x, e.y, Math.cos(ang) * 8, Math.sin(ang) * 8, '#FF3333', 'enemy', e.size);
            }
          } else {
            fireProjectile(e.x, e.y, e.vx * PROJECTILE_SPEED, e.vy * PROJECTILE_SPEED, '#00FFFF', 'enemy', e.size);
          }
          e.lastFire = nowMs;
        }

        // Slime eats regular blobs
        if (e.type === 'slime') {
          for (let j = enemies.current.length - 1; j >= 0; j--) {
            if (j === i || enemies.current[j].type === 'slime') continue;
            const other = enemies.current[j];
            if (Math.hypot(e.x - other.x, e.y - other.y) < (e.size * 0.55 + other.size / 2) * 0.85) {
              if (getVolume(e.size) > getVolume(other.size)) {
                e.size = Math.min(e.size + other.size * 0.1, 700);
                enemies.current.splice(j, 1);
                if (j < i) i--;
              }
            }
          }
        }

        // Consumption vs player — volume based
        const enemyVol = getVolume(e.size);
        const contactDist = (curSize / 2 + (e.type === 'slime' ? e.size * 0.55 : e.size / 2)) * 0.82;
        if (Math.hypot(e.x - playerPos.current.x, e.y - playerPos.current.y) < contactDist) {
          if (enemyVol > playerVol) {
            gameStateRef.current = 'enteringName';
            setGameState('enteringName');
            return;
          } else {
            playerSize.current = Math.min(Math.sqrt(playerSize.current ** 2 + (e.size * 0.15) ** 2), 500);
            score.current += Math.floor(e.size * 1.5);
            enemies.current.splice(i, 1);
            continue;
          }
        }

        // ── Draw enemy ──────────────────────────────────────────────────────
        ctx.save();
        if (e.type === 'slime') {
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
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#003300';
          ctx.font = `900 ${Math.max(9, e.size * 0.13)}px 'Courier New', monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('SLIME', 0, 0);
        } else if (e.isBoss) {
          drawStar6(ctx, e.x, e.y, e.size / 2, e.phase * 0.6);
          ctx.fillStyle = '#CC0000';
          ctx.strokeStyle = '#FF6666';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#FF0000';
          ctx.shadowBlur = 24;
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#FFCCCC';
          ctx.font = `900 ${Math.max(9, e.size * 0.14)}px 'Courier New', monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
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

      // ── Player blob ────────────────────────────────────────────────────────
      const px = playerPos.current.x, py = playerPos.current.y;
      const pr = curSize / 2;
      const playerOffsets = [0.95, 1.0, 0.92, 1.02, 0.96, 1.0, 0.94, 1.01];
      ctx.save();
      drawBlob(ctx, px, py, pr, playerOffsets, phaseRef.current);
      const grad = ctx.createRadialGradient(px - pr * 0.3, py - pr * 0.3, 0, px, py, pr * 1.2);
      grad.addColorStop(0, '#FF50A8');
      grad.addColorStop(0.55, '#E01880');
      grad.addColorStop(1, '#6600CC');
      ctx.fillStyle = grad;
      ctx.shadowColor = '#E01880';
      ctx.shadowBlur = 28;
      ctx.fill();
      ctx.shadowBlur = 0;
      // Sheen highlight
      ctx.beginPath();
      ctx.ellipse(px - pr * 0.22, py - pr * 0.3, pr * 0.26, pr * 0.14, -0.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.16)';
      ctx.fill();
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [gameState, spawnEnemy, spawnSlimeSquare, fireProjectile]);

  // ─── Click/tap to shoot ───────────────────────────────────────────────────
  const handleAction = useCallback((e) => {
    if (gameStateRef.current !== 'playing') return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const now = Date.now();
    if (now - lastPlayerFire.current > PLAYER_FIRE_COOLDOWN) {
      const dx = x - playerPos.current.x;
      const dy = y - playerPos.current.y;
      const mag = Math.hypot(dx, dy);
      if (mag > 1) {
        fireProjectile(
          playerPos.current.x, playerPos.current.y,
          (dx / mag) * PROJECTILE_SPEED, (dy / mag) * PROJECTILE_SPEED,
          '#00FF88', 'player', playerSize.current
        );
      }
      lastPlayerFire.current = now;
    }
  }, [fireProjectile]);

  // ─── Submit score ─────────────────────────────────────────────────────────
  const commitScore = async () => {
    const cleanName = playerName.trim().toUpperCase() || '?????';
    if (BANNED_WORDS.some(w => cleanName.includes(w))) {
      setErrorMsg('IDENTIFIED AS GRIEFING. ACCESS DENIED.');
      return;
    }
    setIsSubmitting(true);
    try {
      await supabase.from('leaderboard').insert([{ player_name: cleanName.substring(0, 5), score: score.current }]);
      await fetchScores();
      setGameState('gameOver');
    } catch { setGameState('gameOver'); }
    finally { setIsSubmitting(false); }
  };

  // ─── Rank styling ─────────────────────────────────────────────────────────
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
      style={{ cursor: gameState === 'playing' ? 'crosshair' : 'auto' }}
      onMouseDown={handleAction}
      onTouchStart={handleAction}
    >
      <canvas
        ref={canvasRef}
        className="fixed inset-0"
        style={{ zIndex: 101, pointerEvents: 'none' }}
      />

      {/* HUD */}
      {gameState === 'playing' && (
        <div className="fixed top-10 left-12 z-[110] pointer-events-none select-none" style={{ fontFamily: "'Courier New', monospace" }}>
          <p style={{
            fontSize: '3.4rem', fontWeight: 900, fontStyle: 'italic', lineHeight: 1,
            color: '#E01880', textShadow: '0 0 18px rgba(224,24,128,0.55), 0 2px 0 rgba(0,0,0,0.6)'
          }}>
            {displayScore.toLocaleString()}
          </p>
          <p style={{ fontSize: '0.65rem', color: 'rgba(224,24,128,0.55)', letterSpacing: '0.18em', marginTop: 3 }}>
            SIZE {Math.floor(displayPlayerSize)}
          </p>
        </div>
      )}

      <button
        onClick={onClose}
        className="fixed top-10 right-10 z-[120] p-3 rounded-full text-white transition-all"
        style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
      >
        <X size={22} />
      </button>

      {/* ── Overlays ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {gameState === 'enteringName' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(16px)', fontFamily: "'Courier New', monospace" }}
          >
            <div style={{ maxWidth: 360, width: '100%', textAlign: 'center' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.35em', color: '#E01880', marginBottom: 10 }}>
                ── SYSTEM TERMINATED ──
              </p>
              <h2 style={{
                fontSize: '2.8rem', fontWeight: 900, color: '#fff', fontStyle: 'italic',
                display: 'inline-block', transform: 'skewX(-8deg)', marginBottom: 4
              }}>
                NEURAL ENTRY
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', marginBottom: 22, letterSpacing: '0.12em' }}>
                FINAL SCORE: {score.current.toLocaleString()}
              </p>
              {errorMsg && <p style={{ color: '#FF4444', fontWeight: 700, marginBottom: 14, fontSize: '0.82rem' }}>{errorMsg}</p>}
              <input
                autoFocus maxLength={5}
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && commitScore()}
                placeholder="#####"
                style={{
                  width: '100%', background: '#fff', color: '#000', fontSize: '3.2rem',
                  textAlign: 'center', fontWeight: 900, textTransform: 'uppercase',
                  outline: 'none', border: '4px solid #E01880', padding: '6px 0',
                  marginBottom: 14, transform: 'skewX(-6deg)', fontFamily: 'inherit',
                  letterSpacing: '0.22em', display: 'block'
                }}
              />
              <button
                onClick={commitScore}
                disabled={isSubmitting}
                style={{
                  width: '100%', padding: '13px 0', background: '#E01880', color: '#fff',
                  fontWeight: 900, fontSize: '1rem', border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transform: 'skewX(-6deg)', letterSpacing: '0.16em',
                  fontFamily: 'inherit', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8, opacity: isSubmitting ? 0.7 : 1,
                  transition: 'background 0.15s, color 0.15s'
                }}
              >
                {isSubmitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'UPLOAD DATA ↗'}
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'gameOver' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.93)', backdropFilter: 'blur(22px)', fontFamily: "'Courier New', monospace" }}
          >
            <div style={{ maxWidth: 500, width: '100%' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: 26 }}>
                <p style={{ fontSize: '0.6rem', letterSpacing: '0.4em', color: '#E01880', marginBottom: 8 }}>
                  ── SYSTEM RECORD ──
                </p>
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

              {/* Leaderboard */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 22 }}>
                {Array(10).fill(null).map((_, i) => {
                  const entry = highScores[i];
                  const meta = rankMeta(i);
                  const isTop3 = i < 3;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.045 }}
                      style={{
                        display: 'flex', alignItems: 'center',
                        padding: isTop3 ? '9px 14px' : '6px 14px',
                        background: meta.bg,
                        boxShadow: meta.glow,
                        borderRadius: 3,
                        gap: 10,
                        transform: `skewX(${isTop3 ? -3 : -1.5}deg)`,
                        border: isTop3 ? 'none' : '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      {/* Rank # */}
                      <span style={{
                        minWidth: 26, textAlign: 'right', fontStyle: 'italic',
                        fontSize: isTop3 ? '1rem' : '0.8rem', fontWeight: 900,
                        color: isTop3 ? meta.text : 'rgba(180,180,180,0.4)'
                      }}>
                        {i + 1}
                      </span>
                      {/* Medal or dot */}
                      <span style={{ minWidth: 20, textAlign: 'center', fontSize: isTop3 ? 16 : 10 }}>
                        {meta.medal
                          ? meta.medal
                          : <span style={{ color: 'rgba(255,255,255,0.15)' }}>◆</span>
                        }
                      </span>
                      {/* Name */}
                      <span style={{
                        flex: 1, fontWeight: 900, letterSpacing: '0.18em',
                        fontSize: isTop3 ? '1.15rem' : '0.9rem', textTransform: 'uppercase',
                        color: entry ? meta.text : (isTop3 ? `${meta.text}66` : 'rgba(255,255,255,0.16)')
                      }}>
                        {entry ? entry.name : '[EMPTY]'}
                      </span>
                      {/* Score */}
                      <span style={{
                        fontWeight: 900, letterSpacing: '0.05em',
                        fontSize: isTop3 ? '1.15rem' : '0.9rem',
                        color: entry ? meta.text : (isTop3 ? `${meta.text}66` : 'rgba(255,255,255,0.16)')
                      }}>
                        {entry ? entry.score.toLocaleString() : '---'}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Restart button */}
              <button
                onClick={() => window.location.reload()}
                style={{
                  width: '100%', padding: '16px 0',
                  background: '#fff', color: '#000',
                  border: '3px solid #fff', fontWeight: 900,
                  fontSize: '1.3rem', cursor: 'pointer',
                  transform: 'skewX(-6deg)', letterSpacing: '0.12em',
                  fontFamily: 'inherit', transition: 'all 0.15s',
                  boxShadow: '5px 5px 0 rgba(224,24,128,0.45)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#E01880';
                  e.currentTarget.style.borderColor = '#E01880';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.borderColor = '#fff';
                  e.currentTarget.style.color = '#000';
                }}
              >
                RESTART SYSTEM ↺
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default BlobGame;