import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// ── Image Imports ───────────────────────────────────────────────────────────
import gfx1 from '../../assets/gfx1.png';
import gfx2 from '../../assets/gfx2.png';
import gfx3 from '../../assets/gfx3.png';
import gfx4 from '../../assets/gfx4.png';
import gfx5 from '../../assets/gfx5.png';
import gfx6 from '../../assets/gfx6.png';

// ── Brand Colors ────────────────────────────────────────────────────────────
const PINK   = '#B8004E'; 
const DEEP   = '#0F001E';
const BORDER = 'rgba(184,0,78,0.25)'; 

const DESIGNS = [
  { title: 'Photo & Video Editing', desc: 'Fully capable photo and video editor. Adobe suite, Premiere, After Effects, DaVinci Resolve, and more.', img: gfx1 },
  { title: 'Outreach Campaign Materials', desc: 'Creation of material for various outreach campaigns and community projects across multiple organizations.', img: gfx2 },
  { title: 'Business Branding & UI', desc: 'Creation of business branding, UI/UX elements, identity systems, and web design.', img: gfx3 },
  { title: 'Fundraising Publications', desc: 'Creation of publications and visual materials for fundraising, grant applications, and donor engagement.', img: gfx4 },
  { title: 'Formal Publication Design', desc: 'Creation of high level design pages for formal publication, reports, and government deliverables.', img: gfx5 },
  { title: 'Full Digital Mastery', desc: 'Mastery of all available digital design tools: Adobe CC, Figma, Canva, AutoCAD, and motion graphics pipelines.', img: gfx6 },
];

export default function DesignSection() {
  const [selectedImg, setSelectedImg] = useState(null);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSelectedImg(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div>
      <p style={{ textAlign: 'center', color: PINK, fontSize: '0.82rem', marginBottom: '1.5rem', fontWeight: 700, opacity: 0.8 }}>
        12+ years of graphic and web design across all digital platforms
      </p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', 
        gap: '1.25rem' 
      }}>
        {DESIGNS.map((d, i) => (
          <motion.div 
            key={d.title} 
            onClick={() => setSelectedImg(d.img)}
            initial={{ opacity: 0, scale: 0.97 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: i * 0.07, duration: 0.3 }}
            whileHover={{ y: -5, scale: 1.02 }}
            style={{ 
              borderRadius: '0.75rem', 
              border: `2px solid ${BORDER}`, 
              background: 'rgba(255,255,255,0.92)', 
              backdropFilter: 'blur(10px)', 
              overflow: 'hidden', 
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(15,0,30,0.05)',
              cursor: 'zoom-in'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = PINK}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = BORDER}
          >
            <div style={{ position: 'relative', paddingBottom: '56.25%', background: DEEP }}>
              <img 
                src={d.img} 
                alt={d.title} 
                loading="lazy"
                style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  opacity: 0.95 
                }} 
              />
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                background: 'linear-gradient(to bottom, transparent 60%, rgba(255,255,255,0.1) 100%)' 
              }} />
            </div>

            <div style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '0.92rem', fontWeight: 800, color: DEEP }}>
                {d.title}
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: '0.78rem', 
                color: 'rgba(15,0,30,0.7)', 
                lineHeight: 1.6 
              }}>
                {d.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Fullscreen Preview Portal */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImg(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(15, 0, 30, 0.95)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              cursor: 'zoom-out'
            }}
          >
            <motion.button
              onClick={() => setSelectedImg(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: PINK,
                border: 'none',
                borderRadius: '50%',
                padding: '10px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={24} strokeWidth={3} />
            </motion.button>

            <motion.img
              src={selectedImg}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                maxWidth: '95%',
                maxHeight: '95vh',
                borderRadius: '0.5rem',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                objectFit: 'contain'
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}