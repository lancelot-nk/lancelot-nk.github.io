import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const BlobGame = ({ onClose }) => {
  const [size, setSize] = useState(60);
  const pos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const blobRef = useRef(null);

  useEffect(() => {
    const move = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      pos.current = { x, y };
      if (blobRef.current) {
        blobRef.current.style.transform = `translate(${x - size/2}px, ${y - size/2}px)`;
      }
    };

    const handleCollision = () => {
      // Custom event dispatched from ParticleField when a particle is "eaten"
      setSize(s => Math.min(s + 2, 300));
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move);
    window.addEventListener('particleEaten', handleCollision);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('particleEaten', handleCollision);
    };
  }, [size]);

  const handleSplit = () => {
    if (size < 40) return;
    const particlesToSpawn = Math.floor(size / 4);
    setSize(s => s / 2);
    // Dispatch event to ParticleField to spawn mass
    window.dispatchEvent(new CustomEvent('blobSplit', { 
      detail: { x: pos.current.x, y: pos.current.y, count: particlesToSpawn } 
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] cursor-none touch-none" onClick={handleSplit}>
      <button 
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="fixed top-8 right-8 z-[110] p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-md transition-colors"
      >
        <X size={32} />
      </button>

      <div 
        ref={blobRef}
        className="fixed top-0 left-0 pointer-events-none will-change-transform"
        style={{ 
          width: size, 
          height: size, 
          background: 'radial-gradient(circle, #E01880 0%, #8B00E8 100%)',
          borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
          filter: 'blur(2px)',
          boxShadow: '0 0 40px rgba(224, 24, 128, 0.6)',
          animation: 'blobJiggle 3s infinite ease-in-out',
          transition: 'width 0.2s, height 0.2s'
        }}
      />

      <style>{`
        @keyframes blobJiggle {
          0%, 100% { border-radius: 40% 60% 70% 30% / 40% 40% 60% 50%; scale: 1; }
          33% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; scale: 1.05; }
          66% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 40%; scale: 0.95; }
        }
      `}</style>
    </div>
  );
};

export default BlobGame;