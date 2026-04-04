import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, RefreshCcw, Send, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const BlobGame = ({ onClose }) => {
  const [gameState, setGameState] = useState('playing'); 
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState(Array(10).fill(null));
  const [playerSize, setPlayerSize] = useState(60);
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const playerPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const targetPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const enemies = useRef([]); 
  const projectiles = useRef([]); 
  const blobRef = useRef(null);
  
  const lastAutoSpawnScore = useRef(0);
  const lastBossScore = useRef(0);
  const lastPlayerFire = useRef(0);

  // Balanced Game Constants
  const PLAYER_SPEED = 6; 
  const ENEMY_SPEED = 3.5; 
  const PROJECTILE_SPEED = 12;
  const PLAYER_FIRE_COOLDOWN = 800; 
  const ENEMY_FIRE_COOLDOWN = 5000;

  const BANNED_WORDS = ['SLUR1', 'SLUR2', 'FUCK', 'SHIT', 'PISS', 'CUNT'];

  useEffect(() => {
    fetchScores();

    // Matches the updated ParticleField.jsx event
    const handleParticleScore = () => {
      if (gameState === 'playing') {
        setScore(s => s + 10);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('particleCollected', handleParticleScore);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('particleCollected', handleParticleScore);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, onClose]);

  const fetchScores = async () => {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('player_name, score')
      .order('score', { ascending: false })
      .limit(10);
    
    if (!error && data) {
      const formatted = Array(10).fill(null).map((_, i) => 
        data[i] ? { name: data[i].player_name, score: data[i].score } : null
      );
      setHighScores(formatted);
    }
  };

  const fireProjectile = (x, y, vx, vy, color, owner) => {
    projectiles.current.push({
      id: Math.random(),
      x, y, vx, vy, color, owner,
      size: 20 
    });
  };

  const spawnEnemy = (isBoss = false) => {
    const size = isBoss ? playerSize * 1.8 : playerSize * (Math.random() * 1.0 + 0.5);
    let x, y;
    do {
      x = Math.random() * window.innerWidth;
      y = Math.random() * window.innerHeight;
    } while (Math.sqrt((x - playerPos.current.x)**2 + (y - playerPos.current.y)**2) < 300);

    const angle = Math.random() * Math.PI * 2;
    enemies.current.push({
      id: Math.random(),
      x, y, size, isBoss,
      color: isBoss ? '#FF0000' : ['#FF1493', '#00FF7F', '#1E90FF', '#FFD700'][Math.floor(Math.random() * 4)],
      vx: Math.cos(angle),
      vy: Math.sin(angle),
      lastFire: Date.now() + Math.random() * 2000,
      targetAngle: angle,
      turnSpeed: isBoss ? 0.02 : 0.04
    });
  };

  useEffect(() => {
    let animationFrameId;
    const update = () => {
      if (gameState !== 'playing') return;

      if (score >= lastAutoSpawnScore.current + 1000) {
        lastAutoSpawnScore.current = Math.floor(score / 1000) * 1000;
        spawnEnemy(false);
      }
      if (score >= lastBossScore.current + 10000) {
        lastBossScore.current = Math.floor(score / 10000) * 10000;
        spawnEnemy(true);
      }

      const now = Date.now();
      
      // Move Player
      const dxP = targetPos.current.x - playerPos.current.x;
      const dyP = targetPos.current.y - playerPos.current.y;
      const distP = Math.sqrt(dxP * dxP + dyP * dyP);
      if (distP > 5) {
        playerPos.current.x += (dxP / distP) * PLAYER_SPEED;
        playerPos.current.y += (dyP / distP) * PLAYER_SPEED;
      }

      if (blobRef.current) {
        blobRef.current.style.transform = `translate3d(${playerPos.current.x - playerSize / 2}px, ${playerPos.current.y - playerSize / 2}px, 0)`;
      }

      // Projectiles Logic: HIT = HALVE SIZE
      projectiles.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.owner === 'enemy') {
          const d = Math.sqrt((p.x - playerPos.current.x)**2 + (p.y - playerPos.current.y)**2);
          if (d < playerSize / 2) {
            setPlayerSize(s => Math.max(s / 2, 25)); // Cut player in half
            projectiles.current.splice(idx, 1);
          }
        } else {
          enemies.current.forEach((e, eIdx) => {
            const d = Math.sqrt((p.x - e.x)**2 + (p.y - e.y)**2);
            if (d < e.size / 2) {
              e.size = e.size / 2; // Cut enemy in half
              if (e.size < 15) {
                setScore(s => s + 500);
                enemies.current.splice(eIdx, 1);
              }
              projectiles.current.splice(idx, 1);
            }
          });
        }
        
        if (p.x < -100 || p.x > window.innerWidth + 100 || p.y < -100 || p.y > window.innerHeight + 100) {
          projectiles.current.splice(idx, 1);
        }
      });

      // Enemy AI & Shooting
      enemies.current.forEach(e => {
        const angleToPlayer = Math.atan2(playerPos.current.y - e.y, playerPos.current.x - e.x);
        let diff = angleToPlayer - e.targetAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        
        e.targetAngle += diff * e.turnSpeed;
        e.vx = Math.cos(e.targetAngle);
        e.vy = Math.sin(e.targetAngle);
        e.x += e.vx * ENEMY_SPEED;
        e.y += e.vy * ENEMY_SPEED;

        // Auto-shoot every 5s
        if (now - e.lastFire > ENEMY_FIRE_COOLDOWN) {
          if (e.isBoss) {
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI * 2 / 6) * i;
              fireProjectile(e.x, e.y, Math.cos(angle) * 8, Math.sin(angle) * 8, '#FF0000', 'enemy');
            }
          } else {
            fireProjectile(e.x, e.y, e.vx * PROJECTILE_SPEED, e.vy * PROJECTILE_SPEED, '#00FFFF', 'enemy');
          }
          e.lastFire = now;
        }

        // Consumption Logic
        const dPlayer = Math.sqrt((e.x - playerPos.current.x)**2 + (e.y - playerPos.current.y)**2);
        if (dPlayer < (playerSize / 2 + e.size / 2) * 0.85) {
          if (e.size > playerSize) {
            setGameState('enteringName');
          } else {
            setPlayerSize(s => Math.min(s + e.size * 0.15, 500));
            setScore(s => s + Math.floor(e.size));
            enemies.current = enemies.current.filter(item => item.id !== e.id);
          }
        }
      });

      animationFrameId = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, playerSize, score]);

  const handleAction = (e) => {
    if (gameState !== 'playing') return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const now = Date.now();
    
    if (now - lastPlayerFire.current > PLAYER_FIRE_COOLDOWN) {
      const dx = x - playerPos.current.x;
      const dy = y - playerPos.current.y;
      const mag = Math.sqrt(dx*dx + dy*dy);
      fireProjectile(playerPos.current.x, playerPos.current.y, (dx / mag) * PROJECTILE_SPEED, (dy / mag) * PROJECTILE_SPEED, '#00FF00', 'player');
      lastPlayerFire.current = now;
    }
  };

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

  const commitScore = async () => {
    const cleanName = playerName.trim().toUpperCase() || '?????';
    if (BANNED_WORDS.some(word => cleanName.includes(word))) {
      setErrorMsg('IDENTIFIED AS GRIEFING. ACCESS DENIED.');
      return;
    }
    setIsSubmitting(true);
    try {
      await supabase.from('leaderboard').insert([{ player_name: cleanName.substring(0,5), score: score }]);
      await fetchScores();
      setGameState('gameOver');
    } catch (err) { setGameState('gameOver'); }
    finally { setIsSubmitting(false); }
  };

  const getRankColor = (index) => {
    if (index === 0) return 'bg-yellow-400 border-yellow-600'; 
    if (index === 1) return 'bg-slate-300 border-slate-500'; 
    if (index === 2) return 'bg-amber-600 border-amber-800'; 
    return 'bg-white border-black';
  };

  return (
    <div className={`fixed inset-0 z-[100] overflow-hidden touch-none bg-black/40 ${gameState === 'playing' ? 'cursor-crosshair' : 'cursor-auto'}`} 
      onMouseDown={handleAction} onTouchStart={handleAction}>
      
      <div className="fixed top-12 left-12 z-[110] font-mono text-white pointer-events-none select-none italic">
        <p className="text-6xl font-black text-[#E01880] drop-shadow-[0_0_15px_rgba(224,24,128,0.5)]">{score}</p>
      </div>

      <button onClick={onClose} className="fixed top-10 right-10 z-[120] p-4 bg-white/10 rounded-full text-white backdrop-blur-md hover:bg-white/30 transition-all">
        <X size={24} />
      </button>

      {projectiles.current.map(p => (
        <div key={p.id} className="fixed top-0 left-0" style={{
          width: p.size, height: p.size, backgroundColor: p.color,
          transform: `translate3d(${p.x - p.size/2}px, ${p.y - p.size/2}px, 0)`,
          boxShadow: `0 0 20px ${p.color}`, borderRadius: '50%'
        }} />
      ))}

      <div ref={blobRef} className="fixed top-0 left-0 pointer-events-none" style={{ 
          width: playerSize, height: playerSize, background: 'radial-gradient(circle, #E01880, #8B00E8)',
          borderRadius: '50%', boxShadow: '0 0 50px #E0188088', animation: 'blobJiggle 2.5s infinite'
      }} />

      {enemies.current.map(e => (
        <div key={e.id} className={`fixed top-0 left-0 flex items-center justify-center border-2 ${e.isBoss ? 'border-red-500 shadow-[0_0_20px_red]' : 'border-white/40'}`} style={{
            width: e.size, height: e.size, backgroundColor: e.color, borderRadius: '50%',
            transform: `translate3d(${e.x - e.size/2}px, ${e.y - e.size/2}px, 0)`
        }}><span className="text-white font-black italic">{e.isBoss ? 'BOSS' : '!'}</span></div>
      ))}

      <AnimatePresence>
        {gameState === 'enteringName' && (
          <motion.div className="fixed inset-0 bg-black/95 z-[300] flex items-center justify-center p-6 italic">
            <div className="max-w-sm w-full text-center">
              <h2 className="text-5xl font-black text-white mb-2 uppercase skew-x-[-10deg]">Neural Entry</h2>
              {errorMsg && <p className="text-red-500 font-bold mb-4">{errorMsg}</p>}
              <input autoFocus maxLength={5} value={playerName} onChange={(e) => setPlayerName(e.target.value)}
                className="w-full bg-white text-black text-6xl text-center font-black uppercase outline-none mb-6 skew-x-[-10deg] border-4 border-[#E01880]"
                placeholder="#####" />
              <button onClick={commitScore} disabled={isSubmitting}
                className="w-full py-4 bg-[#E01880] text-white font-black rounded-none skew-x-[-10deg] flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-all">
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'UPLOAD DATA'}
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'gameOver' && (
          <motion.div className="fixed inset-0 bg-[#E01880]/20 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
            <div className="max-w-lg w-full p-4 relative">
              <h2 className="text-7xl font-black mb-8 italic text-white tracking-tighter skew-x-[-12deg] text-center">HALL OF FAME</h2>
              <div className="space-y-3 mb-10">
                {highScores.map((entry, i) => (
                  <div key={i} className={`flex justify-between items-center px-8 py-3 border-4 ${getRankColor(i)} skew-x-[-15deg] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}>
                    <span className="text-2xl font-black uppercase">{entry ? entry.name : '[EMPTY]'}</span>
                    <span className="text-2xl font-black">{entry ? entry.score.toLocaleString() : '---'}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => window.location.reload()} className="w-full py-6 bg-white text-black border-4 border-black font-black text-3xl skew-x-[-15deg] shadow-[10px_10px_0px_0px_#000]">
                Restart System
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes blobJiggle {
          0%, 100% { border-radius: 50%; scale: 1; }
          50% { border-radius: 40% 60% 50% 50%; scale: 1.05; }
        }
      `}</style>
    </div>
  );
};

export default BlobGame;