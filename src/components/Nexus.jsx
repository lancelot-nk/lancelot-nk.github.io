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

function renderCircuit(startX, startY, endX, endY, seed) {
  let path = `M ${startX} ${startY}`;
  const segments = 2 + (seed % 3);
  let curX = startX;
  let curY = startY;

  for (let i = 0; i < segments; i++) {
    const isLast = i === segments - 1;
    const progress = (i + 1) / segments;
    if (isLast) {
      path += ` L ${endX} ${curY} L ${endX} ${endY}`;
    } else {
      const tx = startX + (endX - startX) * progress + (Math.sin(seed + i) * 20);
      const ty = startY + (endY - startY) * progress + (Math.cos(seed + i) * 20);
      path += ` L ${tx} ${curY} L ${tx} ${ty}`;
      curX = tx; curY = ty;
    }
  }
  return path;
}

function getPath(cx, cy, hx, hy, seed, offset = 0, type = 'inward') {
  if (type === 'inward') {
    return renderCircuit(cx, cy, hx + offset, hy + offset, seed);
  }

  // OUTWARD MULTI-FACE LOGIC
  const sideIndex = seed % 6; 
  const sideAngle = (sideIndex * 60 - 90) * (Math.PI / 180);
  const startX = hx + Math.cos(sideAngle) * 30;
  const startY = hy + Math.sin(sideAngle) * 30;
  
  // CUT RANGE IN HALF: Tight 125px - 225px blast
  const dist = 125 + (seed % 100); 
  const endX = startX + Math.cos(sideAngle) * dist;
  const endY = startY + Math.sin(sideAngle) * dist;

  let path = `M ${startX} ${startY}`;
  const initialBurst = 20 + (seed % 15);
  const midX = startX + Math.cos(sideAngle) * initialBurst;
  const midY = startY + Math.sin(sideAngle) * initialBurst;
  path += ` L ${midX} ${midY}`;

  const segments = 2 + (seed % 3);
  for (let i = 0; i < segments; i++) {
    const progress = (i + 1) / segments;
    const tx = midX + (endX - midX) * progress + (Math.sin(seed + i) * 30);
    const ty = midY + (endY - midY) * progress + (Math.cos(seed + i) * 30);
    path += ` L ${tx} ${ty}`;
  }
  
  path += ` L ${endX} ${endY}`;
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
          const isHovered = hoveredId === s.id;

          return (
            <g key={`group-${s.id}`}>
              <AnimatePresence>
                {isActive && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* INWARD */}
                    {[ -18, -12, -6, 0, 6, 12, 18 ].map((offset, idx) => (
                      <motion.path
                        key={`in-${idx}`}
                        d={getPath(cx, cy, hx, hy, i * 13 + idx, offset, 'inward')}
                        fill="none" stroke="white" strokeWidth={idx === 3 ? 3 : 1}
                        opacity={[0.1, 0.3, 0.5, 1, 0.5, 0.3, 0.1][idx]}
                        filter={idx === 3 ? "url(#active-glow)" : "none"}
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} exit={{ pathLength: 0 }}
                        transition={{ duration: 0.8, delay: idx * 0.03 }}
                      />
                    ))}
                    {/* OUTWARD - ALL 6 FACES */}
                    {!isMobile && Array.from({ length: 6 }).map((_, face) => (
                      Array.from({ length: 3 }).map((__, line) => (
                        <motion.path
                          key={`out-${face}-${line}`}
                          d={getPath(cx, cy, hx, hy, (i + 1) * 100 + face * 10 + line, 0, 'outward')}
                          fill="none" stroke="white" strokeWidth={0.8} opacity={0.5}
                          filter="url(#active-glow)"
                          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} exit={{ pathLength: 0 }}
                          transition={{ duration: 0.6, delay: 0.1 + (face * 0.04) }}
                        />
                      ))
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
                style={{ transform: coreHovered ? 'scale(0.92)' : 'scale(1)', transformOrigin: 'center' }}
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
        const Icon = s.icon;
        
        return (
          <motion.button
            key={`btn-${s.id}`}
            className="absolute z-20 bg-none border-none cursor-pointer p-0 overflow-visible transition-transform duration-300"
            style={{ left: hx - hex / 2, top: hy - hexH / 2, width: hex, height: hexH, transform: coreHovered ? 'scale(0.92)' : 'scale(1)' }}
            onMouseEnter={() => setHoveredId(s.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onSelect(s.id)}
          >
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <Icon size={isMobile ? 18 : 24} style={{ color: hoveredId === s.id ? '#4A0000' : 'white', transform: isMobile ? 'none' : 'translateY(-8px)' }} />
              <span className="font-mono uppercase font-black text-center" style={{ fontSize: `${isActive ? fontSize * 1.1 : fontSize}px`, color: hoveredId === s.id ? '#4A0000' : 'white', lineHeight: '0.9' }}>{s.label}</span>
            </div>
          </motion.button>
        );
      })}

      <motion.a
        href="https://www.linkedin.com/in/lancelotnk/"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-1/2 left-1/2 z-[60] block overflow-hidden rounded-full border-4 border-[#E01880] cursor-pointer shadow-2xl transition-all duration-300"
        style={{ width: core, height: core, translateX: "-50%", translateY: "-50%" }}
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.75, filter: "drop-shadow(0 0 30px rgba(224, 24, 128, 0.8))" }}
        onMouseEnter={() => setCoreHovered(true)}
        onMouseLeave={() => setCoreHovered(false)}
      >
        <img src={profilePic} alt="LinkedIn" className="w-full h-full object-cover object-top scale-130 origin-top" />
      </motion.a>
    </div>
  );
}