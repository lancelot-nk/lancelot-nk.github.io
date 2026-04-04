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
  const lastAutoSpawnScore = useRef(0);

  const PLAYER_SPEED = 6; 
  const ENEMY_SPEED = 4.5; // Slightly slower than player for fairness, but constant
  const GROWTH_RATE = 0.5;

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('blobHighScores') || '[]');
    setHighScores(saved);
  }, []);

  // AUTO-SPAWN LOGIC: Every 5000 points
  useEffect(() => {
    if (score >= lastAutoSpawnScore.current + 5000) {
      lastAutoSpawnScore.current = Math.floor(score / 5000) * 5000;
      spawnEnemyAtEdge(playerSize * 0.375); // 3/8ths size
    }
  }, [score, playerSize]);

  const spawnEnemyAtEdge = (size) => {
    const edge = Math.floor(Math.random() * 4);
    let x, y;
    if (edge === 0) { x = Math.random() * window.innerWidth; y = -50; }
    else if (edge === 1) { x = window.innerWidth + 50; y = Math.random() * window.innerHeight; }
    else if (edge === 2) { x = Math.random() * window.innerWidth; y = window.innerHeight + 50; }
    else { x = -50; y = Math.random() * window.innerHeight; }

    addEnemy(x, y, size);
  };

  const addEnemy = (x, y, size) => {
    const enemyColors = ['#FF1493', '#00FF7F', '#1E90FF', '#FFD700'];
    enemies.current.push({
      id: Math.random(),
      x: x,
      y: y,
      size: size,
      color: enemyColors[Math.floor(Math.random() * enemyColors.length)],
      // Constant velocity components
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2
    });
  };

  useEffect(() => {
    let animationFrameId;

    const update = () => {
      if (gameState !== 'playing') return;

      // 1. PLAYER MOVEMENT
      const dx = targetPos.current.x - playerPos.current.x;
      const dy = targetPos.current.y - playerPos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5) {
        playerPos.current.x += (dx / distance) * PLAYER_SPEED;
        playerPos.current.y += (dy / distance) * PLAYER_SPEED;
      }

      if (blobRef.current) {
        blobRef.current.style.transform = `translate3d(${playerPos.current.x - playerSize / 2}px, ${playerPos.current.y - playerSize / 2}px, 0)`;
      }

      // 2. ENEMY LOGIC
      enemies.current.forEach(enemy => {
        // Move at set rate
        const ev = Math.sqrt(enemy.vx ** 2 + enemy.vy ** 2);
        enemy.x += (enemy.vx / ev) * ENEMY_SPEED;
        enemy.y += (enemy.vy / ev) * ENEMY_SPEED;

        enemy.size += 0.04; 

        if (enemy.x < 0 || enemy.x > window.innerWidth) enemy.vx *= -1;
        if (enemy.y < 0 || enemy.y > window.innerHeight) enemy.vy *= -1;

        const distToPlayer = Math.sqrt(
          Math.pow(enemy.x - playerPos.current.x, 2) + 
          Math.pow(enemy.y - playerPos.current.y, 2)
        );

        // Collision Check
        if (distToPlayer < (playerSize / 2 + enemy.size / 2) * 0.85) {
          if (enemy.size > playerSize) {
            setGameState('gameOver');
            saveScore(score);
          } else {
            setPlayerSize(s => Math.min(s + enemy.size * 0.25, 500));
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
      setPlayerSize(s => Math.min(s + GROWTH_RATE, 500));
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
    if (playerSize < 50 || gameState !== 'playing') return;
    if (e.target.closest('button')) return;

    // 3/8ths Loss Logic
    const lostSize = playerSize * 0.375;
    setPlayerSize(prev => prev - lostSize);

    // Spawn hostile at a safe distance (150px offset)
    const angle = Math.random() * Math.PI * 2;
    const spawnX = playerPos.current.x + Math.cos(angle) * 150;
    const spawnY = playerPos.current.y + Math.sin(angle) * 150;

    addEnemy(spawnX, spawnY, lostSize);

    window.dispatchEvent(new CustomEvent('blobSplit', { 
      detail: { x: playerPos.current.x, y: playerPos.current.y, count: 15 } 
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden cursor-none touch-none" onClick={handleSplit}>
      {/* HUD */}
      <div className="fixed top-12 left-12 z-[110] font-mono text-white pointer-events-none select-none">
        <p className="text-[10px] opacity-30 uppercase tracking-[0.4em] mb-1">Total Mass</p>
        <p className="text-6xl font-black text-[#E01880] tabular-nums">{score}</p>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="fixed top-10 right-10 z-[120] p-4 bg-white/5 hover:bg-white/20 rounded-full text-white backdrop-blur-2xl border border-white/10"
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

      {/* Enemies */}
      {enemies.current.map(enemy => (
        <div 
          key={enemy.id}
          className="fixed top-0 left-0 flex items-center justify-center border border-white/10 shadow-lg"
          style={{
            width: enemy.size, height: enemy.size,
            backgroundColor: enemy.color,
            borderRadius: '50%',
            transform: `translate3d(${enemy.x - enemy.size/2}px, ${enemy.y - enemy.size/2}px, 0)`,
            animation: 'blobJiggle 3s infinite ease-in-out reverse',
            zIndex: 90
          }}
        >
          <span className="text-white/40 font-black text-[12px] select-none italic">!</span>
        </div>
      ))}

      {/* GAME OVER */}
      <AnimatePresence>
        {gameState === 'gameOver' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[200] flex items-center justify-center p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div 
              initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              className="max-w-sm w-full bg-[#111] border border-white/10 rounded-[3rem] p-12 text-center"
            >
              <h2 className="text-5xl font-black mb-1 italic text-white">RECLAIMED</h2>
              <p className="text-[#E01880] text-sm font-bold uppercase tracking-widest mb-10">Mass: {score}</p>
              
              <button 
                onClick={() => { 
                    setGameState('playing'); 
                    setScore(0); 
                    setPlayerSize(60); 
                    enemies.current = []; 
                    lastAutoSpawnScore.current = 0;
                }}
                className="w-full py-5 bg-[#E01880] text-white rounded-2xl font-black text-lg hover:bg-white hover:text-black transition-all"
              >
                <RefreshCcw size={20} className="inline mr-2" /> REBOOT
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