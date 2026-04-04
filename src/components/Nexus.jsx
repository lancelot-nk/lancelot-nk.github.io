import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, FileText, BarChart3, Palette, BookOpen, Award } from 'lucide-react';

// ASSET
import profilePic from '../assets/profile.jpg';

export const SECTIONS = [
  { id: 'projects',       label: 'Projects',       icon: Code },
  { id: 'resume',         label: 'Resume',          icon: FileText },
  { id: 'dashboards',     label: 'Dash\nBoards',    icon: BarChart3 }, 
  { id: 'design',         label: 'Design',          icon: Palette },
  { id: 'publications',   label: 'Pub &\nGrants',   icon: BookOpen }, 
  { id: 'certifications', label: 'Certs',           icon: Award },
];

function getLayout(w) {
  if (w < 480) return { size: 340, core: 75, radius: 105, hex: 75, fontSize: 10, isMobile: true };
  if (w < 900) return { size: 550, core: 110, radius: 180, hex: 110, fontSize: 16, isMobile: false };
  return { size: 850, core: 175, radius: 255, hex: 155, fontSize: 24, isMobile: false };
}

function renderInwardPath(cx, cy, endX, endY, seed) {
  let path = `M ${cx} ${cy}`;
  let curX = cx; let curY = cy;
  const bends = 2 + (seed % 3);
  for (let i = 0; i < bends; i++) {
    const progress = (i + 1) / (bends + 1);
    if (i === bends - 1) { path += ` L ${endX} ${curY} L ${endX} ${endY}`; } 
    else {
      const horizontalFirst = (seed + i) % 2 === 0;
      if (horizontalFirst) { curX = cx + (endX - cx) * progress; path += ` L ${curX} ${curY}`; } 
      else { curY = cy + (endY - cy) * progress; path += ` L ${curX} ${curY}`; }
    }
  }
  return path;
}

function renderOutwardPath(startX, startY, sideAngle, seed, isMobile) {
  let path = `M ${startX} ${startY}`;
  let curX = startX; let curY = startY;
  
  // Perpendicular Launch
  const launch = isMobile ? 20 : 45;
  curX += Math.cos(sideAngle) * launch;
  curY += Math.sin(sideAngle) * launch;
  path += ` L ${curX} ${curY}`;

  const bends = isMobile ? 1 : 2;
  let currentAngle = sideAngle;

  for (let i = 0; i < bends; i++) {
    // Only turn +/- 90 degrees, never 180 (avoids looping back)
    const turn = (seed + i) % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
    currentAngle += turn;
    const len = 40 + (seed % 40);
    curX += Math.cos(currentAngle) * len;
    curY += Math.sin(currentAngle) * len;
    path += ` L ${curX} ${curY}`;
  }
  return path;
}

export default function Nexus({ activeSection, onSelect }) {
  const [layout, setLayout] = useState(() => getLayout(typeof window !== 'undefined' ? window.innerWidth : 1000));
  const [hoveredId, setHoveredId] = useState(null);
  const [coreHovered, setCoreHovered] = useState(false);

  useEffect(() => {
    const update = () => setLayout(getLayout(window.innerWidth));
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const { size, core, radius, hex, fontSize, isMobile } = layout;
  const hexH = Math.round(hex * 1.15); 
  const cx = size / 2, cy = size / 2;
  const brandPink = '#E01880';

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 w-full h-full overflow-visible z-[5]">
        <defs>
          <filter id="active-glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>

        {SECTIONS.map((s, i) => {
          const a = (i * 60 - 90) * (Math.PI / 180);
          const hx = cx + radius * Math.cos(a), hy = cy + radius * Math.sin(a);
          const isActive = activeSection === s.id;

          return (
            <AnimatePresence key={`lines-${s.id}`}>
              {isActive && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  
                  {/* PHASE 1: THICK INWARD CONNECTIONS */}
                  {[ -18, -12, -6, 0, 6, 12, 18 ].map((offset, idx) => (
                    <motion.path
                      key={`in-${idx}`}
                      d={renderInwardPath(cx, cy, hx + offset, hy + offset, i * 13 + idx)}
                      fill="none" stroke="white" strokeWidth={idx === 3 ? 3 : 2}
                      opacity={[0.2, 0.4, 0.6, 1, 0.6, 0.4, 0.2][idx]}
                      filter="url(#active-glow)"
                      initial={{ pathLength: 0 }} 
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, ease: "easeOut", delay: idx * 0.02 }}
                    />
                  ))}

                  {/* PHASE 2: CONTROLLED OUTWARD STARBURST (Starts AFTER inward) */}
                  {!isMobile && Array.from({ length: 10 }).map((_, idx) => {
                    const sideIndex = (i + idx) % 6; 
                    const sideAngle = (sideIndex * 60 - 90) * (Math.PI / 180);
                    const spread = (hex / 3) * (((idx % 7) - 3) / 3);
                    const startX = hx + Math.cos(sideAngle) * (hex / 2.2) + Math.cos(sideAngle + Math.PI/2) * spread;
                    const startY = hy + Math.sin(sideAngle) * (hexH / 4) + Math.sin(sideAngle + Math.PI/2) * spread;

                    return (
                      <motion.path
                        key={`out-${idx}`}
                        d={renderOutwardPath(startX, startY, sideAngle, i * 40 + idx, isMobile)}
                        fill="none" stroke="white" strokeWidth={1.5}
                        opacity={0.5 + (idx % 4) * 0.1}
                        filter="url(#active-glow)"
                        initial={{ pathLength: 0 }} 
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, delay: 0.5 + (idx * 0.04) }} // 0.5s Delay to wait for Inward lines
                      />
                    );
                  })}
                </motion.g>
              )}
            </AnimatePresence>
          );
        })}

        {/* HEXAGONS */}
        {SECTIONS.map((s, i) => {
          const a = (i * 60 - 90) * (Math.PI / 180);
          const hx = cx + radius * Math.cos(a), hy = cy + radius * Math.sin(a);
          return (
            <motion.polygon
              key={`poly-${s.id}`}
              animate={{ scale: coreHovered ? 0.92 : 1 }}
              points={`${hx},${hy - hexH / 2} ${hx + hex / 2},${hy - hexH / 4} ${hx + hex / 2},${hy + hexH / 4} ${hx},${hy + hexH / 2} ${hx - hex / 2},${hy + hexH / 4} ${hx - hex / 2},${hy - hexH / 4}`}
              fill={hoveredId === s.id ? 'white' : brandPink}
              stroke={hoveredId === s.id ? brandPink : '#4A0000'}
              strokeWidth={activeSection === s.id ? 6 : 3}
              className="cursor-pointer"
              style={{ transformOrigin: `${hx}px ${hy}px` }}
              onClick={() => onSelect(s.id)}
            />
          );
        })}
      </svg>

      {/* BUTTON CONTENT */}
      {SECTIONS.map((s, i) => {
        const a = (i * 60 - 90) * (Math.PI / 180);
        const hx = cx + radius * Math.cos(a), hy = cy + radius * Math.sin(a);
        const Icon = s.icon;
        return (
          <motion.button
            key={`btn-${s.id}`}
            className="absolute z-20 bg-none border-none cursor-pointer p-0 overflow-visible"
            style={{ left: hx - hex / 2, top: hy - hexH / 2, width: hex, height: hexH }}
            animate={{ scale: coreHovered ? 0.92 : 1 }}
            onMouseEnter={() => setHoveredId(s.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onSelect(s.id)}
          >
            <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
              <Icon size={isMobile ? 18 : 26} style={{ color: hoveredId === s.id ? '#4A0000' : 'white', marginBottom: '2px' }} />
              <span className="font-mono uppercase font-black text-center whitespace-pre-line" 
                    style={{ fontSize: `${activeSection === s.id ? fontSize * 1.1 : fontSize}px`, color: hoveredId === s.id ? '#4A0000' : 'white', lineHeight: '1.0' }}>
                {s.label}
              </span>
            </div>
          </motion.button>
        );
      })}

      {/* PORTRAIT - ADJUSTED CENTER & ZOOM */}
      <motion.a
        href="https://www.linkedin.com/in/lancelotnk/"
        target="_blank" rel="noopener noreferrer"
        className="absolute top-1/2 left-1/2 z-[60] block overflow-hidden rounded-full border-4 border-[#E01880] cursor-pointer shadow-2xl"
        style={{ width: core, height: core, translateX: "-50%", translateY: "-50%" }}
        whileHover={{ scale: 1.75 }}
        onMouseEnter={() => setCoreHovered(true)}
        onMouseLeave={() => setCoreHovered(false)}
      >
        <img 
          src={profilePic} 
          alt="LinkedIn" 
          className="w-full h-full object-cover transition-transform duration-500" 
          style={{ 
            transform: 'scale(2.2) translate(-5%, 8%)', // Adjusted slightly Left and Down
            transformOrigin: '45% 30%' // Focus origin shifted left
          }} 
        />
      </motion.a>
    </div>
  );
}