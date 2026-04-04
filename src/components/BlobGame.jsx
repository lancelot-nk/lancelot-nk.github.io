import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, RefreshCcw, Send } from 'lucide-react';

const BlobGame = ({ onClose }) => {
  const [gameState, setGameState] = useState('playing'); 
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState([]);
  const [playerSize, setPlayerSize] = useState(60);
  const [playerName, setPlayerName] = useState('');
  
  const playerPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const targetPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const enemies = useRef([]); 
  const projectiles = useRef([]); 
  const blobRef = useRef(null);
  
  const lastAutoSpawnScore = useRef(0);
  const lastPlayerFire = useRef(0);

  const PLAYER_SPEED = 6; 
  const ENEMY_SPEED = 4.5;
  const PROJECTILE_SPEED = 12;
  const FIRE_COOLDOWN = 5000;

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('globalBlobLeaderboard') || '[]');
    setHighScores(saved);
  }, []);

  const fireProjectile = (x, y, vx, vy, color, owner) => {
    projectiles.current.push({
      id: Math.random(),
      x, y, vx, vy, color, owner,
      size: 8
    });
  };

  const spawnEnemy = () => {
    // 1. IMPROVED SCALING: Start smaller, grow harder over time
    const baseScale = 0.25; 
    const scoreFactor = Math.min(score / 40000, 1.0); 
    const sizeVar = baseScale + (Math.random() * 0.3) + scoreFactor; 
    const size = playerSize * sizeVar;
    
    // 2. IMPROVED SPAWNING: Random position with distance check
    let x, y;
    let attempts = 0;
    do {
      x = Math.random() * window.innerWidth;
      y = Math.random() * window.innerHeight;
      const dist = Math.sqrt((x - playerPos.current.x)**2 + (y - playerPos.current.y)**2);
      if (dist > 300) break; // Ensure safe distance
      attempts++;
    } while (attempts < 10);

    const angle = Math.random() * Math.PI * 2;
    enemies.current.push({
      id: Math.random(),
      x, y, size,
      color: ['#FF1493', '#00FF7F', '#1E90FF', '#FFD700'][Math.floor(Math.random() * 4)],
      vx: Math.cos(angle),
      vy: Math.sin(angle),
      lastFire: Date.now() + Math.random() * 2000,
      targetTimer: 0 // For random pathing
    });
  };

  const addEnemy = (x, y, size) => {
    const angle = Math.random() * Math.PI * 2;
    enemies.current.push({
      id: Math.random(),
      x, y, size,
      color: ['#FF1493', '#00FF7F', '#1E90FF', '#FFD700'][Math.floor(Math.random() * 4)],
      vx: Math.cos(angle),
      vy: Math.sin(angle),
      lastFire: Date.now() + Math.random() * 1000,
      targetTimer: 0
    });
  };

  useEffect(() => {
    let animationFrameId;
    const update = () => {
      if (gameState !== 'playing') return;

      if (score >= lastAutoSpawnScore.current + 1000) {
        lastAutoSpawnScore.current = Math.floor(score / 1000) * 1000;
        spawnEnemy();
      }

      const now = Date.now();
      const dx = targetPos.current.x - playerPos.current.x;
      const dy = targetPos.current.y - playerPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 5) {
        playerPos.current.x += (dx / dist) * PLAYER_SPEED;
        playerPos.current.y += (dy / dist) * PLAYER_SPEED;
      }
      
      if (now - lastPlayerFire.current > FIRE_COOLDOWN && dist > 10) {
        fireProjectile(playerPos.current.x, playerPos.current.y, (dx / dist) * PROJECTILE_SPEED, (dy / dist) * PROJECTILE_SPEED, '#00FF00', 'player');
        lastPlayerFire.current = now;
      }

      if (blobRef.current) {
        blobRef.current.style.transform = `translate3d(${playerPos.current.x - playerSize / 2}px, ${playerPos.current.y - playerSize / 2}px, 0)`;
      }

      projectiles.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.owner === 'enemy') {
          const d = Math.sqrt((p.x - playerPos.current.x)**2 + (p.y - playerPos.current.y)**2);
          if (d < playerSize / 2) {
            setPlayerSize(s => Math.max(s - 15, 20));
            projectiles.current.splice(idx, 1);
          }
        } else {
          enemies.current.forEach(e => {
            const d = Math.sqrt((p.x - e.x)**2 + (p.y - e.y)**2);
            if (d < e.size / 2) {
              e.size -= 20;
              projectiles.current.splice(idx, 1);
            }
          });
        }
        if (p.x < -100 || p.x > window.innerWidth + 100 || p.y < -100 || p.y > window.innerHeight + 100) {
          projectiles.current.splice(idx, 1);
        }
      });

      enemies.current.forEach(e => {
        // 3. IMPROVED PATHING: Random Roaming
        e.targetTimer--;
        if (e.targetTimer <= 0) {
          const randAngle = Math.random() * Math.PI * 2;
          e.vx = Math.cos(randAngle);
          e.vy = Math.sin(randAngle);
          e.targetTimer = 100 + Math.random() * 200; 
        }

        e.x += e.vx * ENEMY_SPEED;
        e.y += e.vy * ENEMY_SPEED;
        e.size += 0.04;

        // Boundary Bounce (Allows roam but keeps in space)
        if (e.x < 0 || e.x > window.innerWidth) e.vx *= -1;
        if (e.y < 0 || e.y > window.innerHeight) e.vy *= -1;

        if (now - e.lastFire > FIRE_COOLDOWN) {
          fireProjectile(e.x, e.y, e.vx * PROJECTILE_SPEED, e.vy * PROJECTILE_SPEED, '#00FFFF', 'enemy');
          e.lastFire = now;
        }

        const dPlayer = Math.sqrt((e.x - playerPos.current.x)**2 + (e.y - playerPos.current.y)**2);
        if (dPlayer < (playerSize / 2 + e.size / 2) * 0.85) {
          if (e.size > playerSize) setGameState('enteringName');
          else {
            setPlayerSize(s => Math.min(s + e.size * 0.25, 500));
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

  const commitScore = () => {
    const finalName = playerName.trim() || 'ANON!';
    const newScores = [...highScores, { name: finalName.substring(0, 5), score, date: new Date().toLocaleDateString() }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    setHighScores(newScores);
    localStorage.setItem('globalBlobLeaderboard', JSON.stringify(newScores));
    setGameState('gameOver');
  };

  useEffect(() => {
    const handleInput = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      targetPos.current = { x, y };
    };
    const handleEat = () => { setPlayerSize(s => Math.min(s + 0.5, 500)); setScore(s => s + 10); };
    window.addEventListener('mousemove', handleInput);
    window.addEventListener('touchmove', handleInput, { passive: false });
    window.addEventListener('particleEaten', handleEat);
    return () => {
      window.removeEventListener('mousemove', handleInput);
      window.removeEventListener('touchmove', handleInput);
      window.removeEventListener('particleEaten', handleEat);
    };
  }, []);

  return (
    <div className={`fixed inset-0 z-[100] overflow-hidden touch-none bg-black/20 ${gameState === 'playing' ? 'cursor-none' : 'cursor-auto'}`} 
      onClick={() => {
        if (playerSize >= 50 && gameState === 'playing') {
          const lost = playerSize * 0.375;
          setPlayerSize(s => s - lost);
          const angle = Math.random() * Math.PI * 2;
          addEnemy(playerPos.current.x + Math.cos(angle) * 150, playerPos.current.y + Math.sin(angle) * 150, lost);
        }
      }}>
      <div className="fixed top-12 left-12 z-[110] font-mono text-white pointer-events-none select-none">
        <p className="text-[10px] opacity-30 uppercase tracking-[0.4em]">Mass Index</p>
        <p className="text-6xl font-black text-[#E01880]">{score}</p>
      </div>

      <button onClick={onClose} className="fixed top-10 right-10 z-[120] p-4 bg-white/5 rounded-full text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-90">
        <X size={24} />
      </button>

      {projectiles.current.map(p => (
        <div key={p.id} className="fixed top-0 left-0 rounded-full blur-[1px]" style={{
          width: p.size, height: p.size, backgroundColor: p.color,
          transform: `translate3d(${p.x}px, ${p.y}px, 0)`,
          boxShadow: `0 0 15px ${p.color}`
        }} />
      ))}

      <div ref={blobRef} className="fixed top-0 left-0 pointer-events-none" style={{ 
          width: playerSize, height: playerSize, background: 'radial-gradient(circle, #E01880, #8B00E8)',
          borderRadius: '50%', boxShadow: '0 0 50px #E0188088', animation: 'blobJiggle 2.5s infinite ease-in-out'
      }} />

      {enemies.current.map(e => (
        <div key={e.id} className="fixed top-0 left-0 flex items-center justify-center border border-white/20" style={{
            width: e.size, height: e.size, backgroundColor: e.color, borderRadius: '50%',
            transform: `translate3d(${e.x - e.size/2}px, ${e.y - e.size/2}px, 0)`, animation: 'blobJiggle 3s infinite reverse'
        }}><span className="text-white/40 text-[10px] font-black">!</span></div>
      ))}

      <AnimatePresence>
        {gameState === 'enteringName' && (
          <motion.div className="fixed inset-0 bg-black/95 z-[300] flex items-center justify-center p-6">
            <div className="max-w-sm w-full text-center">
              <h2 className="text-4xl font-black text-white italic mb-4 uppercase">New Record!</h2>
              <p className="text-white/40 text-sm mb-8 tracking-widest">ENTER 5 CHAR SIGNATURE</p>
              <input 
                autoFocus maxLength={5} value={playerName} onChange={(e) => setPlayerName(e.target.value)}
                className="w-full bg-transparent border-b-2 border-[#E01880] text-6xl text-center text-white font-mono uppercase focus:outline-none mb-10"
                placeholder="#####"
              />
              <button onClick={commitScore} className="w-full py-4 bg-[#E01880] text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-white hover:text-[#E01880]">
                <Send size={20} /> SUBMIT TO NEURAL NET
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'gameOver' && (
          <motion.div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[200] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-[#111] border border-white/10 rounded-[3rem] p-12 text-center relative">
              {/* EXIT X FOR SCOREBOARD */}
              <button onClick={onClose} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
                <X size={20} />
              </button>
              
              <h2 className="text-5xl font-black mb-1 italic text-white">RANKINGS</h2>
              <div className="bg-white/5 rounded-3xl p-6 my-8 text-left font-mono">
                {highScores.map((hs, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-white/5 last:border-0 text-sm">
                    <span className="text-white/40">{hs.name}</span>
                    <span className="font-black text-[#E01880]">{hs.score}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => window.location.reload()} className="w-full py-5 bg-[#E01880] text-white rounded-2xl font-black text-lg transition-all hover:bg-white hover:text-black">
                <RefreshCcw size={20} className="inline mr-2" /> REBOOT
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes blobJiggle {
          0%, 100% { border-radius: 50%; scale: 1; }
          33% { border-radius: 45% 55% 60% 40%; scale: 1.04; }
          66% { border-radius: 55% 45% 40% 60%; scale: 0.96; }
        }
      `}</style>
    </div>
  );
};

export default BlobGame;