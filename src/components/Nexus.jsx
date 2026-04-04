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
  if (w < 480) return { size: 320, core: 75, radius: 100, hex: 75, fontSize: 11, isMobile: true };
  if (w < 900) return { size: 550, core: 110, radius: 180, hex: 110, fontSize: 16, isMobile: false };
  return { size: 850, core: 175, radius: 255, hex: 155, fontSize: 24, isMobile: false };
}

/**
 * RECTILINEAR CIRCUIT ENGINE
 * Modified to take an initial angle to ensure the first "burst" is perpendicular to the side.
 */
function render90DegreeCircuit(startX, startY, sideAngle, seed, isMobile) {
  let path = `M ${startX} ${startY}`;
  let curX = startX;
  let curY = startY;
  
  // Initial perpendicular burst
  const burstDist = 20 + (seed % 15);
  curX += Math.cos(sideAngle) * burstDist;
  curY += Math.sin(sideAngle) * burstDist;
  path += ` L ${curX} ${curY}`;

  const bends = isMobile ? 2 : 2 + (seed % 3);
  let currentAngle = sideAngle;

  for (let i = 0; i < bends; i++) {
    // Force 90-degree turn relative to current direction
    const turn = (seed + i) % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
    currentAngle += turn;
    
    const segmentLen = isMobile ? 30 : 50 + (seed % 40);
    curX += Math.cos(currentAngle) * segmentLen;
    curY += Math.sin(currentAngle) * segmentLen;
    path += ` L ${curX} ${curY}`;
  }
  return path;
}

/**
 * PATH GENERATOR
 * Now specifically handles Inward (to center) and Outward (distributed across sides).
 */
function getPath(hx, hy, hexSize, seed, type = 'inward', cx, cy) {
  if (type === 'inward') {
    // Inward lines move from hex to center
    const angleToCenter = Math.atan2(cy - hy, cx - hx);
    return render90DegreeCircuit(hx, hy, angleToCenter, seed, false);
  }

  // OUTWARD LOGIC: Distribute lines across all 6 sides
  const sideIndex = seed % 6; 
  const sideAngle = (sideIndex * 60 - 90) * (Math.PI / 180);
  
  // Spread start point along the flat edge of the hexagon
  const hexH = hexSize * 1.15;
  const spreadFactor = ((seed % 11) - 5) / 5; // -1 to 1
  const spreadDist = (hexSize / 3) * spreadFactor;
  
  // Calculate perpendicular offset for start
  const startX = hx + Math.cos(sideAngle) * (hexSize / 2.2) + Math.cos(sideAngle + Math.PI/2) * spreadDist;
  const startY = hy + Math.sin(sideAngle) * (hexH / 4) + Math.sin(sideAngle + Math.PI/2) * spreadDist;

  return render90DegreeCircuit(startX, startY, sideAngle, seed, false);
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
          <filter id="active-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* LAYER 1: DENDRIATE PATHS */}
        {SECTIONS.map((s, i) => {
          const a = (i * 60 - 90) * (Math.PI / 180);
          const hx = cx + radius * Math.cos(a), hy = cy + radius * Math.sin(a);
          const isActive = activeSection === s.id;

          return (
            <AnimatePresence key={`lines-${s.id}`}>
              {isActive && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* INWARD RECTILINEAR (Center bound) */}
                  {[ -12, -6, 0, 6, 12 ].map((off, idx) => (
                    <motion.path
                      key={`in-${idx}`}
                      d={getPath(hx, hy, hex, i * 13 + idx, 'inward', cx, cy)}
                      fill="none" stroke="white" strokeWidth={idx === 2 ? 2 : 0.8}
                      opacity={idx === 2 ? 0.8 : 0.3}
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                    />
                  ))}

                  {/* OUTWARD RECTILINEAR (Distributed Perimeter) */}
                  {!isMobile && Array.from({ length: 18 }).map((_, idx) => (
                    <motion.path
                      key={`out-${idx}`}
                      d={getPath(hx, hy, hex, i * 50 + idx, 'outward')}
                      fill="none" stroke="white" strokeWidth={1} opacity={0.4}
                      filter="url(#active-glow)"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} exit={{ pathLength: 0 }}
                      transition={{ duration: 0.7, delay: idx * 0.02, ease: "easeOut" }}
                    />
                  ))}
                </motion.g>
              )}
            </AnimatePresence>
          );
        })}

        {/* LAYER 2: HEX POLYGONS */}
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

      {/* LAYER 3: BUTTON CONTENT */}
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
              <Icon size={isMobile ? 18 : 24} style={{ color: hoveredId === s.id ? '#4A0000' : 'white', transform: isMobile ? 'none' : 'translateY(-4px)' }} />
              <span className="font-mono uppercase font-black text-center whitespace-pre-line" 
                    style={{ fontSize: `${fontSize}px`, color: hoveredId === s.id ? '#4A0000' : 'white', lineHeight: '0.9' }}>
                {s.label}
              </span>
            </div>
          </motion.button>
        );
      })}

      {/* LAYER 4: CENTER PORTRAIT */}
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
          src={profilePic} alt="LinkedIn" 
          className="w-full h-full object-cover transition-transform duration-500" 
          style={{ transform: 'scale(2.2) translateY(12%)', transformOrigin: 'top center' }} 
        />
      </motion.a>
    </div>
  );
}