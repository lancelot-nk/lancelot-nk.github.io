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
  const bends = 2 + (seed % 2);
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

function renderOutwardPath(startX, startY, normalAngle, seed, isMobile) {
  let path = `M ${startX} ${startY}`;
  let curX = startX; let curY = startY;
  
  // SAFE ZONE: Travel a strict set distance before any randomization
  const launch = isMobile ? 30 : 60; 
  curX += Math.cos(normalAngle) * launch;
  curY += Math.sin(normalAngle) * launch;
  path += ` L ${curX} ${curY}`;

  const bends = isMobile ? 1 : 2;
  let currentAngle = normalAngle;

  for (let i = 0; i < bends; i++) {
    const turn = (seed + i) % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
    let nextAngle = currentAngle + turn;
    const segmentLen = 50 + (seed % 30);
    curX += Math.cos(nextAngle) * segmentLen;
    curY += Math.sin(nextAngle) * segmentLen;
    path += ` L ${curX} ${curY}`;
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
      <svg className="absolute inset-0 w-full h-full overflow-visible z-[5]">
        <defs>
          <filter id="active-glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>

        {SECTIONS.map((s, i) => {
          const baseA = ((i * 60) - 90 - 30) * (Math.PI / 180);
          const hx = cx + radius * Math.cos(baseA), hy = cy + radius * Math.sin(baseA);
          const isActive = activeSection === s.id;

          return (
            <AnimatePresence key={`lines-${s.id}`}>
              {isActive && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {[ -18, -10, 0, 10, 18 ].map((off, idx) => (
                    <motion.path
                      key={`in-${idx}`}
                      d={renderInwardPath(cx, cy, hx + off, hy + off, i * 11 + idx)}
                      fill="none" stroke="white" strokeWidth={idx === 2 ? 3 : 2}
                      opacity={idx === 2 ? 1 : 0.5} filter="url(#active-glow)"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.7 }}
                    />
                  ))}

                  {!isMobile && Array.from({ length: 12 }).map((_, idx) => {
                    const sideIdx = idx % 6;
                    // SYNCED NORMALS: Fixed to flat-top orientation
                    const normalAngle = ((sideIdx * 60) - 120) * (Math.PI / 180);
                    
                    // VERTEX SAFE ZONE: Ensure lines don't spawn exactly on corners
                    const spread = (hex / 4) * (((idx % 5) - 2) / 2);
                    const startX = hx + Math.cos(normalAngle) * (hex / 2.2) + Math.cos(normalAngle + Math.PI/2) * spread;
                    const startY = hy + Math.sin(normalAngle) * (hexH / 4) + Math.sin(normalAngle + Math.PI/2) * spread;

                    return (
                      <motion.path
                        key={`out-${idx}`}
                        d={renderOutwardPath(startX, startY, normalAngle, i * 30 + idx, isMobile)}
                        fill="none" stroke="white" strokeWidth={2} opacity={0.7}
                        filter="url(#active-glow)"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, delay: 0.7 + (idx * 0.03) }}
                      />
                    );
                  })}
                </motion.g>
              )}
            </AnimatePresence>
          );
        })}

        {SECTIONS.map((s, i) => {
          const a = ((i * 60) - 90 - 30) * (Math.PI / 180);
          const hx = cx + radius * Math.cos(a), hy = cy + radius * Math.sin(a);
          return (
            <motion.polygon
              key={`poly-${s.id}`}
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

      {SECTIONS.map((s, i) => {
        const a = ((i * 60) - 90 - 30) * (Math.PI / 180);
        const hx = cx + radius * Math.cos(a), hy = cy + radius * Math.sin(a);
        const Icon = s.icon;
        return (
          <motion.button
            key={`btn-${s.id}`}
            className="absolute z-20 bg-none border-none cursor-pointer p-0"
            style={{ left: hx - hex / 2, top: hy - hexH / 2, width: hex, height: hexH }}
            onMouseEnter={() => setHoveredId(s.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onSelect(s.id)}
          >
            <div className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none">
              <Icon size={isMobile ? 18 : 26} style={{ color: hoveredId === s.id ? '#4A0000' : 'white' }} />
              <span className="font-mono uppercase font-black text-center whitespace-pre-line" 
                    style={{ fontSize: `${fontSize}px`, color: hoveredId === s.id ? '#4A0000' : 'white', lineHeight: '1.0' }}>
                {s.label}
              </span>
            </div>
          </motion.button>
        );
      })}

      {/* PORTRAIT - RE-CENTERED AND DROPPED */}
      <motion.a
        href="https://www.linkedin.com/in/lancelotnk/"
        target="_blank" rel="noopener noreferrer"
        className="absolute top-1/2 left-1/2 z-[60] block overflow-hidden rounded-full border-4 border-[#E01880] cursor-pointer shadow-2xl"
        style={{ width: core, height: core, translateX: "-50%", translateY: "-50%" }}
        whileHover={{ scale: 1.75 }}
      >
        <img 
          src={profilePic} 
          alt="LinkedIn" 
          className="w-full h-full object-cover" 
          style={{ 
            // 35% drop and 40% origin to keep the face from hitting the crop ceiling
            transform: 'scale(2.2) translate(-5%, 35%)', 
            transformOrigin: '50% 40%' 
          }} 
        />
      </motion.a>
    </div>
  );
}