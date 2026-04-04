import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, FileText, BarChart3, Palette, BookOpen, Award } from 'lucide-react';

// IMPORT LOCAL ASSET
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
  if (w < 480) return { size: 320, core: 75, radius: 95, hex: 75, fontSize: 11, isMobile: true };
  if (w < 900) return { size: 500, core: 110, radius: 165, hex: 110, fontSize: 16, isMobile: false };
  
  // Web Optimization: Larger Hexagons (150) and wider text area
  return { size: 750, core: 175, radius: 230, hex: 150, fontSize: 22, isMobile: false };
}

/**
 * JAGGED CIRCUIT PATH
 * Creates 90-degree "trace" movements for a circuit board effect.
 */
function circuitPath(x1, y1, x2, y2, seed, offset = 0) {
  const midX = x1 + (x2 - x1) * (0.4 + (seed % 10) / 50) + offset;
  const midY = y1 + (y2 - y1) * (0.6 - (seed % 10) / 50) + offset;
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
  const deepBurgundy = '#4A0000';
  const glowColor = '#FFD1E8';

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      
      <svg className="absolute inset-0 w-full h-full overflow-visible z-[5]">
        <defs>
          <filter id="active-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {SECTIONS.map((s, i) => {
          const a = (i * 60 - 90) * (Math.PI / 180);
          const hx = cx + radius * Math.cos(a), hy = cy + radius * Math.sin(a);
          const isActive = activeSection === s.id;
          const isHovered = hoveredId === s.id;

          return (
            <g key={`circuit-${s.id}`}>
              {isActive && (
                <>
                  {/* Main Active Trace */}
                  <motion.path
                    d={circuitPath(cx, cy, hx, hy, i)}
                    fill="none" stroke="white" strokeWidth={3} filter="url(#active-glow)"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }}
                  />
                  {/* Secondary Parallel Trace (Circuit Board Effect) */}
                  <motion.path
                    d={circuitPath(cx, cy, hx, hy, i, 12)}
                    fill="none" stroke="white" strokeWidth={1} opacity={0.4}
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </>
              )}
              <polygon
                points={`${hx},${hy - hexH / 2} ${hx + hex / 2},${hy - hexH / 4} ${hx + hex / 2},${hy + hexH / 4} ${hx},${hy + hexH / 2} ${hx - hex / 2},${hy + hexH / 4} ${hx - hex / 2},${hy - hexH / 4}`}
                fill={isHovered ? 'white' : brandPink}
                stroke={isHovered ? brandPink : deepBurgundy}
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
        
        const iconSize = Math.round(hex * 0.22); 
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
              {/* ICON: Shifted up on Web, frozen on mobile */}
              <Icon 
                size={iconSize} 
                className="transition-all duration-300"
                style={{ 
                  color: isHovered ? deepBurgundy : 'white',
                  transform: isMobile ? 'translateY(0px)' : 'translateY(-8px)',
                  marginBottom: isMobile ? '2px' : '4px'
                }} 
              />
              
              {/* TEXT: Expanded width for Web to fill the Hexagon belly */}
              <span 
                className="font-mono uppercase font-black tracking-tighter text-center transition-colors duration-300"
                style={{ 
                  width: isMobile ? '85%' : '95%',
                  fontSize: `${currentFontSize}px`, 
                  color: isHovered ? deepBurgundy : 'white', 
                  lineHeight: '0.85', 
                  whiteSpace: 'pre-line' 
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