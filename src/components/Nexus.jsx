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
  let curX = startX;
  let curY = startY;

  const segments = 2 + (seed % 3);
  
  for (let i = 0; i < segments; i++) {
    const isLast = i === segments - 1;
    const progress = (i + 1) / segments;

    if (isLast) {
      path += ` L ${endX} ${curY} L ${endX} ${endY}`;
    } else {
      const targetStepX = startX + (endX - startX) * progress + (Math.sin(seed + i) * 20);
      const targetStepY = startY + (endY - startY) * progress + (Math.cos(seed + i) * 20);
      path += ` L ${targetStepX} ${curY} L ${targetStepX} ${targetStepY}`;
      curX = targetStepX;
      curY = targetStepY;
    }
  }
  return path;
}

function getPath(cx, cy, hx, hy, seed, offset = 0, type = 'inward') {
  if (type === 'inward') {
    return renderCircuit(cx, cy, hx + offset, hy + offset, seed);
  }

  const sideIndex = seed % 6;
  const sideAngle = (sideIndex * 60) * (Math.PI / 180);
  const startX = hx + Math.cos(sideAngle) * 20;
  const startY = hy + Math.sin(sideAngle) * 20;
  
  const dist = 40 + (seed % 40);
  const destX = startX + Math.cos(sideAngle) * dist + (Math.sin(seed) * 20);
  const destY = startY + Math.sin(sideAngle) * dist + (Math.cos(seed) * 20);

  return renderCircuit(startX, startY, destX, destY, seed);
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
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.g 
                    key={`active-g-${s.id}`}
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                  >
                    {[ -18, -12, -6, 0, 6, 12, 18 ].map((offset, idx) => (
                      <motion.path
                        key={`inward-${idx}`}
                        d={getPath(cx, cy, hx, hy, i * 13 + idx, offset, 'inward')}
                        fill="none" stroke="white" 
                        strokeWidth={idx === 3 ? 3 : 1}
                        opacity={[0.1, 0.3, 0.5, 1, 0.5, 0.3, 0.1][idx]}
                        filter={idx === 3 ? "url(#active-glow)" : "none"}
                        initial={{ pathLength: 0 }} 
                        animate={{ pathLength: 1 }} 
                        exit={{ pathLength: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut", delay: idx * 0.03 }}
                      />
                    ))}

                    {!isMobile && Array.from({ length: 12 }).map((_, idx) => (
                      <motion.path
                        key={`outward-${idx}`}
                        d={getPath(cx, cy, hx, hy, (i + 5) * (idx + 100), 0, 'outward')}
                        fill="none" stroke="white" strokeWidth={1.5}
                        opacity={0.6} filter="url(#active-glow)"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.6 }}
                        exit={{ pathLength: 0, opacity: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 + (idx * 0.04) }}
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