import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, RefreshCcw } from 'lucide-react';

const BlobGame = ({ onClose }) => {
  const [gameState, setGameState] = useState('playing'); // playing, gameOver
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState([]);
  const [playerSize, setPlayerSize] = useState(60);
  
  const playerPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const targetPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const enemies = useRef([]); // { id, x, y, size, color, vx, vy }
  const blobRef = useRef(null);
  const requestRef = useRef();

  // Load Leaderboard
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('blobHighScores') || '[]');
    setHighScores(saved);
  }, []);

  const saveScore = (finalScore) => {
    const newScores = [...highScores, { score: finalScore, date: new Date().toLocaleDateString() }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    setHighScores(newScores);
    localStorage.setItem('blobHighScores', JSON.stringify(newScores));
  };

  // Main Game Loop
  useEffect(() => {
    const update = () => {
      if (gameState !== 'playing') return;

      // 1. Smooth Player Movement (Lerp)
      const lerp = 0.1;
      playerPos.current.x += (targetPos.current.x - playerPos.current.x) * lerp;
      playerPos.current.y += (targetPos.current.y - playerPos.current.y) * lerp;

      if (blobRef.current) {
        blobRef.current.style.transform = `translate(${playerPos.current.x - playerSize / 2}px, ${playerPos.current.y - playerSize / 2}px)`;
      }

      // 2. Update Enemies
      enemies.current.forEach(enemy => {
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        // Bounce off walls
        if (enemy.x < 0 || enemy.x > window.innerWidth) enemy.vx *= -1;
        if (enemy.y < 0 || enemy.y > window.innerHeight) enemy.vy *= -1;

        // Collision with Player
        const dx = enemy.x - playerPos.current.x;
        const dy = enemy.y - playerPos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < (playerSize / 2 + enemy.size / 2) * 0.8) {
          if (enemy.size > playerSize) {
            setGameState('gameOver');
            saveScore(score);
          } else {
            // Eat enemy
            setPlayerSize(s => Math.min(s + enemy.size * 0.2, 400));
            setScore(s => s + Math.floor(enemy.size));
            enemies.current = enemies.current.filter(e => e.id !== enemy.id);
          }
        }
      });

      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, playerSize, score]);

  // Input Listeners
  useEffect(() => {
    const handleInput = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      targetPos.current = { x, y };
    };

    const handleEat = () => {
      setPlayerSize(s => Math.min(s + 1.5, 400));
      setScore(s => s + 10);
    };

    window.addEventListener('mousemove', handleInput);
    window.addEventListener('touchmove', handleInput);
    window.addEventListener('particleEaten', handleEat);
    return () => {
      window.removeEventListener('mousemove', handleInput);
      window.removeEventListener('touchmove', handleInput);
      window.removeEventListener('particleEaten', handleEat);
    };
  }, []);

  const handleSplit = () => {
    if (playerSize < 40 || gameState !== 'playing') return;

    const newSize = playerSize / 2;
    setPlayerSize(newSize);

    // Create Enemy from the split half
    const colors = ['#FF0000', '#FF8C00', '#00FF00', '#00FFFF'];
    const newEnemy = {
      id: Math.random(),
      x: playerPos.current.x,
      y: playerPos.current.y,
      size: newSize,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10
    };
    enemies.current.push(newEnemy);

    // Visual particles scatter
    window.dispatchEvent(new CustomEvent('blobSplit', { 
      detail: { x: playerPos.current.x, y: playerPos.current.y, count: 15 } 
    }));
  };

  const resetGame = () => {
    setPlayerSize(60);
    setScore(0);
    enemies.current = [];
    setGameState('playing');
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden cursor-crosshair touch-none" onClick={handleSplit}>
      {/* UI: Score */}
      <div className="fixed top-8 left-8 z-[110] font-mono text-white pointer-events-none">
        <p className="text-sm opacity-50 uppercase tracking-widest">Current Mass</p>
        <p className="text-4xl font-black text-[#E01880]">{score}</p>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="fixed top-8 right-8 z-[110] p-2 bg-white/10 hover:bg-white/30 rounded-full text-white backdrop-blur-md"
      >
        <X size={32} />
      </button>

      {/* Player Blob */}
      <div 
        ref={blobRef}
        className="fixed top-0 left-0 pointer-events-none will-change-transform"
        style={{ 
          width: playerSize, height: playerSize, 
          background: 'radial-gradient(circle, #E01880 0%, #8B00E8 100%)',
          borderRadius: '50%', filter: 'blur(1px)',
          boxShadow: '0 0 30px rgba(224, 24, 128, 0.6)',
          animation: 'blobJiggle 2s infinite ease-in-out'
        }}
      />

      {/* Enemy Blobs */}
      {enemies.current.map(enemy => (
        <div 
          key={enemy.id}
          className="fixed top-0 left-0 flex items-center justify-center font-black text-white/50"
          style={{
            width: enemy.size, height: enemy.size,
            backgroundColor: enemy.color,
            borderRadius: '50%',
            transform: `translate(${enemy.x - enemy.size/2}px, ${enemy.y - enemy.size/2}px)`,
            boxShadow: `0 0 20px ${enemy.color}88`,
            zIndex: 90
          }}
        >
          <X size={enemy.size * 0.5} />
        </div>
      ))}

      {/* Game Over Screen */}
      <AnimatePresence>
        {gameState === 'gameOver' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-md w-full bg-white p-8 rounded-3xl text-center shadow-2xl">
              <h2 className="text-5xl font-black mb-2 italic">GAME OVER</h2>
              <p className="text-gray-500 mb-6 uppercase tracking-tighter">Your Mass: <span className="text-[#E01880]">{score}</span></p>
              
              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-4 justify-center text-gray-400">
                  <Trophy size={16} /> <span className="text-xs font-bold uppercase">Hall of Fame</span>
                </div>
                {highScores.map((hs, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-gray-100 last:border-0 font-mono text-sm">
                    <span className="text-gray-400">#{i+1}</span>
                    <span className="font-bold">{hs.score}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={resetGame}
                className="w-full py-4 bg-[#E01880] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              >
                <RefreshCcw size={20} /> TRY AGAIN
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes blobJiggle {
          0%, 100% { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; transform: scale(1); }
          50% { border-radius: 70% 30% 46% 54% / 30% 30% 70% 70%; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default BlobGame;