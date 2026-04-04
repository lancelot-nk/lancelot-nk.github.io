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
  const bends = 2;
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

function renderOutwardPath(startX, startY, normalAngle, seed, isGhost = false) {
  let path = `M ${startX} ${startY}`;
  let curX = startX; 
  let curY = startY;
  const upperBoundY = 145; 

  const launch = isGhost ? 35 : 60; 
  curX += Math.cos(normalAngle) * launch;
  curY += Math.sin(normalAngle) * launch;
  path += ` L ${curX} ${curY}`;

  const numTurns = 2 + (seed % 3);
  let currentAngle = normalAngle;

  for (let i = 0; i < numTurns; i++) {
    const turn = (isGhost ? -1.1 : 1) * (((seed + i) % 2 === 0) ? Math.PI / 2 : -Math.PI / 2);
    const nextAngle = currentAngle + turn;
    const segmentLen = 30 + (seed % 40); 
    
    const nextX = curX + Math.cos(nextAngle) * segmentLen;
    const nextY = curY + Math.sin(nextAngle) * segmentLen;

    if (nextY < upperBoundY) {
      curX = nextX;
      path += ` L ${curX} ${curY}`; 
    } else {
      curX = nextX;
      curY = nextY;
      path += ` L ${curX} ${curY}`;
    }
    currentAngle = nextAngle;
  }
  return path;
}

export default function Nexus({ activeSection, onSelect }) {
  const [layout, setLayout] = useState(() => getLayout(typeof window !== 'undefined' ? window.innerWidth : 1000));
  const [hoveredId, setHoveredId] = useState(null);

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
      {/* BACKGROUND SVG (Z-1) */}
      <svg className="absolute inset-0 w-full h-full overflow-visible z-[1]">
        <defs>
          <filter id="active-glow"><feGaussianBlur stdDeviation="2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>

        {SECTIONS.map((s, i) => {
          const baseA = ((i * 60) - 90 - 30) * (Math.PI / 180);
          const hx = cx + radius * Math.cos(baseA), hy = cy + radius * Math.sin(baseA);
          const isActive = activeSection === s.id;

          return (isActive && (
            <motion.g key={`lines-${s.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              
              {/* 10 INWARD CONNECTIONS */}
              {Array.from({ length: 10 }).map((_, idx) => {
                const off = (idx - 4.5) * 4; 
                return (
                  <motion.path
                    key={`in-${idx}`}
                    d={renderInwardPath(cx, cy, hx + off, hy + off, i * 10 + idx)}
                    fill="none" stroke="white" 
                    strokeWidth={idx % 2 === 0 ? 1.8 : 0.8}
                    opacity={0.3 + (idx % 3) * 0.2} 
                    filter="url(#active-glow)"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  />
                );
              })}

              {/* OUTER DENDRIES (10 REAL + 10 GHOST) */}
              {!isMobile && Array.from({ length: 10 }).map((_, idx) => {
                const sideIdx = (idx + i) % 6;
                const normalAngle = ((sideIdx * 60) - 120) * (Math.PI / 180);
                const tightSpread = (hex * 0.04) * (idx - 5);
                
                const startX = hx + Math.cos(normalAngle) * (hex / 2.1) + Math.cos(normalAngle + Math.PI/2) * tightSpread;
                const startY = hy + Math.sin(normalAngle) * (hexH / 4) + Math.sin(normalAngle + Math.PI/2) * tightSpread;

                const sw = 0.8 + (idx % 3); 
                const op = 0.3 + (idx % 5) * 0.12; 

                return (
                  <g key={`out-group-${idx}`}>
                    <motion.path
                      d={renderOutwardPath(startX, startY, normalAngle, i * 40 + idx, false)}
                      fill="none" stroke="white" strokeWidth={sw} opacity={op}
                      filter="url(#active-glow)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    />
                    <motion.path
                      d={renderOutwardPath(startX, startY, normalAngle, i * 40 + idx, true)}
                      fill="none" stroke="white" strokeWidth={sw * 0.6} opacity={op * 0.3}
                      filter="url(#active-glow)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      style={{ transform: `scale(${0.9 + (idx % 3) * 0.15})`, transformOrigin: `${startX}px ${startY}px` }}
                    />
                  </g>
                );
              })}
            </motion.g>
          ));
        })}
      </svg>

      {/* HEX LAYER (Z-10) */}
      <svg className="absolute inset-0 w-full h-full overflow-visible z-[10] pointer-events-none">
        {SECTIONS.map((s, i) => {
          const a = ((i * 60) - 90 - 30) * (Math.PI / 180);
          const hx = cx + radius * Math.cos(a), hy = cy + radius * Math.sin(a);
          return (
            <motion.polygon
              key={`poly-${s.id}`}
              points={`${hx},${hy - hexH / 2} ${hx + hex / 2},${hy - hexH / 4} ${hx + hex / 2},${hy + hexH / 4} ${hx},${hy + hexH / 2} ${hx - hex / 2},${hy + hexH / 4} ${hx - hex / 2},${hy - hexH / 4}`}
              fill={hoveredId === s.id ? 'white' : brandPink}
              stroke={hoveredId === s.id ? brandPink : '#4A0000'}
              strokeWidth={activeSection === s.id ? 4 : 2}
              style={{ transformOrigin: `${hx}px ${hy}px` }}
            />
          );
        })}
      </svg>

      {/* BUTTONS (Z-20) */}
      {SECTIONS.map((s, i) => {
        const a = ((i * 60) - 90 - 30) * (Math.PI / 180);
        const hx = cx + radius * Math.cos(a), hy = cy + radius * Math.sin(a);
        return (
          <motion.button
            key={`btn-${s.id}`}
            className="absolute z-[20] bg-none border-none cursor-pointer p-0"
            style={{ left: hx - hex / 2, top: hy - hexH / 2, width: hex, height: hexH }}
            onMouseEnter={() => setHoveredId(s.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onSelect(s.id)}
          >
            <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
              <s.icon size={isMobile ? 18 : 24} style={{ color: hoveredId === s.id ? '#4A0000' : 'white' }} />
              <span className="font-mono uppercase font-black text-center whitespace-pre-line" 
                    style={{ fontSize: `${fontSize}px`, color: hoveredId === s.id ? '#4A0000' : 'white', lineHeight: '1.0' }}>
                {s.label}
              </span>
            </div>
          </motion.button>
        );
      })}

      {/* PORTRAIT (Z-100) */}
      <motion.a
        href="https://www.linkedin.com/in/lancelotnk/"
        target="_blank" rel="noopener noreferrer"
        className="absolute top-1/2 left-1/2 z-[100] block overflow-hidden rounded-full border-4 border-[#E01880] cursor-pointer shadow-2xl"
        style={{ width: core, height: core, x: "-50%", y: "-50%" }}
        whileHover={{ scale: 1.35 }} // Increased hover zoom
      >
        <img 
          src={profilePic} 
          alt="Lancelot" 
          className="w-full h-full object-cover" 
          style={{ 
            objectPosition: 'center 22%', // Shifted down further from 15%
            transform: 'scale(1.7)' 
          }} 
        />
      </motion.a>
    </div>
  );
}