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

function circuitPath(x1, y1, x2, y2, seed, offset = 0, isSpawning = false) {
  // Random jitter for the 7 inward lines to prevent overlap
  const rand = (Math.sin(seed * 437.5) * 15);
  const midX = x1 + (x2 - x1) * (0.3 + (seed % 10) / 40) + offset + rand;
  const midY = y1 + (y2 - y1) * (0.5 + (seed % 10) / 40) + offset + rand;
  
  if (isSpawning) {
    // Spawns from random sides/angles of the hex
    const angle = (seed * 60) * (Math.PI / 180);
    const spawnX = x2 + Math.cos(angle) * 2;
    const spawnY = y2 + Math.sin(angle) * 2;
    
    // Architectural 90-degree bend constrained to safe distance
    const dist = 35 + (seed % 25);
    const targetX = spawnX + Math.cos(angle) * dist;
    const targetY = spawnY + Math.sin(angle) * dist;
    
    return `M ${spawnX} ${spawnY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
  }
  
  return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
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
  const glowColor = '#FFD1E8';

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      
      <svg className="absolute inset-0 w-full h-full overflow-visible z-[5]">
        <defs>
          <filter id="active-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {SECTIONS.map((s, i) => {
          const a = (i * 60 - 90) * (Math.PI / 180);
          const hx = cx + radius * Math.cos(a), hy = cy + radius * Math.sin(a);
          const isActive = activeSection === s.id;
          const isHovered = hoveredId === s.id;

          return (
            <g key={`circuit-group-${s.id}`}>
              <AnimatePresence>
                {isActive && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* RANDOMIZED 7-PATH INWARD MANIFOLD */}
                    {[ -18, -12, -6, 0, 6, 12, 18 ].map((offset, idx) => (
                      <motion.path
                        key={`inward-${idx}`}
                        d={circuitPath(cx, cy, hx, hy, i * 77 + idx, offset)}
                        fill="none" stroke="white" 
                        strokeWidth={idx === 3 ? 3 : 1}
                        opacity={[0.1, 0.3, 0.5, 1, 0.5, 0.3, 0.1][idx]}
                        filter={idx === 3 ? "url(#active-glow)" : "none"}
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} exit={{ pathLength: 0 }}
                        transition={{ duration: 0.7, ease: "easeInOut", delay: idx * 0.02 }}
                      />
                    ))}

                    {/* WHITE GLOW OUTWARD SPINDLES (10 paths, architecture style) */}
                    {!isMobile && Array.from({ length: 10 }).map((_, idx) => (
                      <motion.path
                        key={`outward-${idx}`}
                        d={circuitPath(cx, cy, hx, hy, i * 13 + (idx * 17), 0, true)}
                        fill="none" stroke="white" strokeWidth={1}
                        opacity={0.4} filter="url(#active-glow)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.5 }}
                        exit={{ pathLength: 0, opacity: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 + (idx * 0.05) }}
                      />
                    ))}
                  </motion.g>
                )}
              </AnimatePresence>
              
              <polygon
                points={`${hx},${hy - hexH / 2} ${hx + hex / 2},${hy - hexH / 4} ${hx + hex / 2},${hy + hexH / 4} ${hx},${hy + hexH / 2} ${hx - hex / 2},${hy + hexH / 4} ${hx - hex / 2},${hy - hexH / 4}`}
                fill={isHovered ? 'white' : brandPink}
                stroke={isHovered ? brandPink : '#4A0000'}
                strokeWidth={isActive ? 6 : 3}
                className="transition-all duration-300 cursor-pointer"
                style={{ filter: isActive ? `drop-shadow(0 0 25px ${glowColor})` : 'none' }}
                onClick={() => onSelect(s.id)}
              />
            </g>
          );
        })}
      </svg>

      {SECTIONS.map((s, i) => {
        const a = (i * 60 - 90) * (Math.PI / 180);
        const hx = cx + radius * Math.cos(a), hy = cy + radius * Math.sin(a);
        const isActive = activeSection === s.id;
        const isHovered = hoveredId === s.id;
        const Icon = s.icon;
        
        const iconSize = isMobile ? Math.round(hex * 0.22) : Math.round(hex * 0.20); 
        const currentFontSize = isActive ? Math.round(fontSize * 1.1) : fontSize;

        return (
          <motion.button
            key={`btn-${s.id}`}
            className="absolute z-20 bg-none border-none cursor-pointer p-0 overflow-visible"
            style={{ left: hx - hex / 2, top: hy - hexH / 2, width: hex, height: hexH }}
            onMouseEnter={() => setHoveredId(s.id)}
            onMouseLeave={() => setHoveredId(null)}
            whileHover={{ scale: 1.05 }}
            onClick={() => onSelect(s.id)}
          >
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <Icon 
                size={iconSize} 
                className="transition-all duration-300"
                style={{ 
                  color: isHovered ? '#4A0000' : 'white',
                  transform: isMobile ? 'translateY(0px)' : 'translateY(-10px)',
                  marginBottom: '2px'
                }} 
              />
              <span 
                className="font-mono uppercase font-black text-center transition-colors duration-300"
                style={{ 
                  width: isMobile ? '85%' : '98%',
                  fontSize: `${currentFontSize}px`, 
                  color: isHovered ? '#4A0000' : 'white', 
                  lineHeight: isMobile ? '0.85' : '0.9', 
                  letterSpacing: '0.05em',
                  whiteSpace: 'pre-line',
                  display: 'inline-block',
                  transform: isMobile ? 'none' : 'scaleX(1.05)'
                }}
              >
                {s.label}
              </span>
            </div>
          </motion.button>
        );
      })}

      <motion.div
        className="absolute top-1/2 left-1/2 z-10 overflow-hidden rounded-full border-4 border-[#E01880] shadow-2xl"
        style={{ width: core, height: core, x: "-50%", y: "-50%" }}
      >
        <img src={profilePic} alt="Lancelot" className="w-full h-full object-cover object-top" />
      </motion.div>
    </div>
  );
}