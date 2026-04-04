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

/**
 * UPDATED OUTWARD ENGINE:
 * Forces a *perpendicular departure* relative to the side's face before randomizing.
 */
function renderOutwardPath(startX, startY, normalAngle, seed, isMobile) {
  let path = `M ${startX} ${startY}`;
  let curX = startX; let curY = startY;
  
  // A. INITIAL PERPENDICULAR LAUNCH (Guaranteed straight line out from the face)
  const launch = isMobile ? 20 : 45 + (seed % 10); // Slight variance in length
  curX += Math.cos(normalAngle) * launch;
  curY += Math.sin(normalAngle) * launch;
  path += ` L ${curX} ${curY}`;

  // B. SUBSEQUENT RANDOM 90-DEGREE BENDS (Relative to new launch vector)
  const bends = isMobile ? 1 : 2;
  let currentAngle = normalAngle; // Current direction of travel

  for (let i = 0; i < bends; i++) {
    // Determine turn (seed + bend count ensures variance)
    const turn = (seed + i) % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
    currentAngle += turn;
    
    // Vary segment length
    const len = 40 + (seed % 40);
    curX += Math.cos(currentAngle) * len;
    curY += Math.sin(currentAngle) * len;
    path += ` L ${curX} ${curY}`;
  }
  return path;
}

function getPath(cx, cy, hx, hy, hexSize, seed, type = 'inward', isMobile, offset = 0) {
  if (type === 'inward') return renderInwardPath(cx, cy, hx + offset, hy + offset, seed);

  // OUTWARD LOGIC: Distributed along 6 sides
  const sideIndex = seed % 6; 
  // Base angle of the radius vector to the side center
  const baseAngle = (sideIndex * 60 - 90) * (Math.PI / 180);
  
  // Angle perpendicular to the Flat Face (0° for left/right, 60°/120° for top/bottom slanted)
  // This is the "normal vector" of the face.
  const normalAngle = baseAngle; // The base angle is already the normal for flat-top hexagons

  const spreadFactor = ((seed % 11) - 5) / 5; // -1 to 1 spread along the face
  const spreadDist = (hexSize / 3) * spreadFactor;
  
  const hexH = hexSize * 1.15;
  // Origin point *on* the hexagon edge, distributed along the face
  // Uses normalAngle and its perpendicular (tangent) vector.
  const startX = hx + Math.cos(normalAngle) * (hexSize / 2.2) + Math.cos(normalAngle + Math.PI/2) * spreadDist;
  const startY = hy + Math.sin(normalAngle) * (hexH / 4) + Math.sin(normalAngle + Math.PI/2) * spreadDist;

  return renderOutwardPath(startX, startY, normalAngle, seed, isMobile);
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
                  
                  {/* PHASE 1: THICK INWARD CONNECTIONS (RESTORED WIDTH) */}
                  {[ -18, -12, -6, 0, 6, 12, 18 ].map((offset, idx) => (
                    <motion.path
                      key={`in-${idx}`}
                      d={renderInwardPath(cx, cy, hx, hy, i * 13 + idx, offset)}
                      fill="none" stroke="white" strokeWidth={idx === 3 ? 3 : 2}
                      opacity={[0.1, 0.3, 0.5, 1, 0.5, 0.3, 0.1][idx]}
                      filter="url(#active-glow)"
                      initial={{ pathLength: 0 }} 
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.02 }}
                    />
                  ))}

                  {/* PHASE 2: BRIGHTER OUTWARD STARBURST (Starts AFTER inward) */}
                  {!isMobile && Array.from({ length: 14 }).map((_, idx) => (
                    <motion.path
                      key={`out-${idx}`}
                      // Passcx and cy to helper for normal calculations if needed, but current setup uses hx/hy
                      d={getPath(cx, cy, hx, hy, hex, i * 40 + idx, 'outward', isMobile)}
                      fill="none" stroke="white" strokeWidth={2} // THICKER
                      opacity={0.6 + (idx % 3) * 0.1} // BRIGHTER
                      filter="url(#active-glow)"
                      initial={{ pathLength: 0 }} 
                      animate={{ pathLength: 1 }} exit={{ pathLength: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 + (idx * 0.04) }} // Stagger start
                    />
                  ))}
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
              transition={{ duration: 0.3 }}
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
            // Corrected: Shifted Y translation from 8% down to 12% down. Shifted origin.
            transform: 'scale(2.2) translate(-5%, 12%)', 
            // Focus origin shifted down slightly
            transformOrigin: '45% 40%' 
          }} 
        />
      </motion.a>
    </div>
  );
}