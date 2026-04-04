import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, RefreshCcw } from 'lucide-react';

const BlobGame = ({ onClose }) => {
  const [gameState, setGameState] = useState('playing');
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState([]);
  const [playerSize, setPlayerSize] = useState(60);
  
  const playerPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const targetPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const enemies = useRef([]); 
  const blobRef = useRef(null);

  // Constants for "Set Rate" movement
  const PLAYER_SPEED = 6; 
  const GROWTH_RATE = 0.5; // Mass gained per particle (Nerfed)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('blobHighScores') || '[]');
    setHighScores(saved);
  }, []);

  useEffect(() => {
    let animationFrameId;

    const update = () => {
      if (gameState !== 'playing') return;

      // 1. CONSTANT RATE MOVEMENT (No Teleporting)
      const dx = targetPos.current.x - playerPos.current.x;
      const dy = targetPos.current.y - playerPos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5) { // Threshold to prevent "jitter" when arriving at cursor
        playerPos.current.x += (dx / distance) * PLAYER_SPEED;
        playerPos.current.y += (dy / distance) * PLAYER_SPEED;
      }

      if (blobRef.current) {
        blobRef.current.style.transform = `translate3d(${playerPos.current.x - playerSize / 2}px, ${playerPos.current.y - playerSize / 2}px, 0)`;
      }

      // 2. ENEMY LOGIC (Movement & Particle Consumption)
      enemies.current.forEach(enemy => {
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        // Enemy Passive Growth (Simulating eating particles)
        enemy.size += 0.04; 

        // Boundary Bounce
        if (enemy.x < 0 || enemy.x > window.innerWidth) enemy.vx *= -1;
        if (enemy.y < 0 || enemy.y > window.innerHeight) enemy.vy *= -1;

        // Collision Check
        const distToPlayer = Math.sqrt(
          Math.pow(enemy.x - playerPos.current.x, 2) + 
          Math.pow(enemy.y - playerPos.current.y, 2)
        );

        if (distToPlayer < (playerSize / 2 + enemy.size / 2) * 0.85) {
          if (enemy.size > playerSize) {
            setGameState('gameOver');
            const finalScore = score;
            saveScore(finalScore);
          } else {
            // Player consumes enemy
            setPlayerSize(s => Math.min(s + enemy.size * 0.2, 450));
            setScore(s => s + Math.floor(enemy.size));
            enemies.current = enemies.current.filter(e => e.id !== enemy.id);
          }
        }
      });

      animationFrameId = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, playerSize, score]);

  const saveScore = (finalScore) => {
    const currentHighs = JSON.parse(localStorage.getItem('blobHighScores') || '[]');
    const newScores = [...currentHighs, { score: finalScore, date: new Date().toLocaleDateString() }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    setHighScores(newScores);
    localStorage.setItem('blobHighScores', JSON.stringify(newScores));
  };

  useEffect(() => {
    const handleInput = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      targetPos.current = { x, y };
    };

    const handleEat = () => {
      setPlayerSize(s => Math.min(s + GROWTH_RATE, 450));
      setScore(s => s + 10);
    };

    window.addEventListener('mousemove', handleInput);
    window.addEventListener('touchmove', handleInput, { passive: false });
    window.addEventListener('mousedown', handleInput);
    window.addEventListener('particleEaten', handleEat);
    
    return () => {
      window.removeEventListener('mousemove', handleInput);
      window.removeEventListener('touchmove', handleInput);
      window.removeEventListener('mousedown', handleInput);
      window.removeEventListener('particleEaten', handleEat);
    };
  }, []);

  const handleSplit = (e) => {
    if (playerSize < 45 || gameState !== 'playing') return;
    
    // Prevent split if clicking UI buttons
    if (e.target.closest('button')) return;

    const newSize = playerSize / 2;
    setPlayerSize(newSize);

    const enemyColors = ['#FF1493', '#00FF7F', '#1E90FF', '#FFD700'];
    enemies.current.push({
      id: Math.random(),
      x: playerPos.current.x,
      y: playerPos.current.y,
      size: newSize,
      color: enemyColors[Math.floor(Math.random() * enemyColors.length)],
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8
    });

    window.dispatchEvent(new CustomEvent('blobSplit', { 
      detail: { x: playerPos.current.x, y: playerPos.current.y, count: 15 } 
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden cursor-none touch-none bg-transparent" onClick={handleSplit}>
      {/* HUD */}
      <div className="fixed top-12 left-12 z-[110] font-mono text-white pointer-events-none select-none">
        <p className="text-[10px] opacity-30 uppercase tracking-[0.4em] mb-1">Mass Index</p>
        <p className="text-6xl font-black text-[#E01880] tabular-nums">{score}</p>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="fixed top-10 right-10 z-[120] p-4 bg-white/5 hover:bg-white/20 rounded-full text-white backdrop-blur-2xl border border-white/10 transition-all active:scale-90"
      >
        <X size={24} />
      </button>

      {/* Player Blob */}
      <div 
        ref={blobRef}
        className="fixed top-0 left-0 pointer-events-none will-change-transform"
        style={{ 
          width: playerSize, height: playerSize, 
          background: 'radial-gradient(circle at 30% 30%, #E01880 0%, #8B00E8 100%)',
          borderRadius: '50%',
          boxShadow: '0 0 50px rgba(224, 24, 128, 0.5)',
          animation: 'blobJiggle 2.5s infinite ease-in-out'
        }}
      />

      {/* Hostile Blobs */}
      {enemies.current.map(enemy => (
        <div 
          key={enemy.id}
          className="fixed top-0 left-0 flex items-center justify-center border border-white/20 shadow-lg"
          style={{
            width: enemy.size, height: enemy.size,
            backgroundColor: enemy.color,
            borderRadius: '50%',
            transform: `translate3d(${enemy.x - enemy.size/2}px, ${enemy.y - enemy.size/2}px, 0)`,
            animation: 'blobJiggle 3s infinite ease-in-out reverse',
            zIndex: 90
          }}
        >
          <span className="text-white/40 font-black text-[12px] select-none">✕</span>
        </div>
      ))}

      {/* GAME OVER */}
      <AnimatePresence>
        {gameState === 'gameOver' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-[200] flex items-center justify-center p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div 
              initial={{ scale: 0.8, y: 40 }} animate={{ scale: 1, y: 0 }}
              className="max-w-sm w-full bg-[#111] border border-white/10 rounded-[3rem] p-12 text-center"
            >
              <h2 className="text-5xl font-black mb-1 italic text-white tracking-tighter">DISSOLVED</h2>
              <p className="text-[#E01880] text-sm font-bold uppercase tracking-widest mb-10">Final Mass: {score}</p>
              
              <div className="bg-white/5 rounded-3xl p-6 mb-10 text-left">
                <div className="flex items-center gap-2 mb-4 text-white/20">
                  <Trophy size={14} /> <span className="text-[10px] font-black uppercase tracking-[0.2em]">Top Sessions</span>
                </div>
                {highScores.map((hs, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-white/5 last:border-0 font-mono text-sm">
                    <span className={i === 0 ? "text-[#E01880]" : "text-white/40"}>#0{i+1}</span>
                    <span className="font-bold text-white">{hs.score}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => { setGameState('playing'); setScore(0); setPlayerSize(60); enemies.current = []; }}
                className="w-full py-5 bg-[#E01880] text-white rounded-2xl font-black text-lg hover:bg-white hover:text-black transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <RefreshCcw size={20} /> REBOOT
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes blobJiggle {
          0%, 100% { border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%; scale: 1; }
          33% { border-radius: 45% 55% 60% 40% / 40% 60% 45% 55%; scale: 1.04; }
          66% { border-radius: 55% 45% 40% 60% / 60% 40% 55% 45%; scale: 0.96; }
        }
      `}</style>
    </div>
  );
};

export default BlobGame;