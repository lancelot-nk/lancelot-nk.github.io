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
  if (w < 480) return { size: 320, core: 75, radius: 110, hex: 75, fontSize: 11 };
  if (w < 900) return { size: 480, core: 110, radius: 170, hex: 105, fontSize: 14 };
  return { size: 650, core: 160, radius: 240, hex: 145, fontSize: 18 };
}

function dendriticPath(x1, y1, x2, y2, seed) {
  const dx = x2 - x1, dy = y2 - y1;
  const mx = x1 + dx * 0.35;
  const my = y1 + dy * 0.35;
  const mx2 = x1 + dx * 0.65;
  const my2 = y1 + dy * 0.65;
  const off1x = (seed % 2 === 0 ? 1 : -1) * Math.abs(dy) * 0.25;
  const off2x = (seed % 3 === 0 ? -1 : 1) * Math.abs(dy) * 0.18;
  return `M ${x1} ${y1} L ${mx + off1x} ${y1} L ${mx + off1x} ${my + 10} L ${mx2 + off2x} ${my2 - 10} L ${mx2 + off2x} ${y2} L ${x2} ${y2}`;
}

export default function Nexus({ activeSection, onSelect }) {
  const [layout, setLayout] = useState(() => getLayout(typeof window !== 'undefined' ? window.innerWidth : 1000));
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const update = () => setLayout(getLayout(window.innerWidth));
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const { size, core, radius, hex, fontSize } = layout;
  const hexH = Math.round(hex * 1.18);
  const cx = size / 2, cy = size / 2;
  
  const brandPink = '#E01880';
  const deepBurgundy = '#4A0000';
  const glowColor = '#FFD1E8'; // Pinkish-White Glow

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      
      {/* SVG Layer for Connections */}
      <svg className="absolute inset-0 w-full h-full overflow-visible z-[5]">
        <defs>
          <filter id="active-glow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {SECTIONS.map((s, i) => {
          const a = (i * 60 - 90) * (Math.PI / 180);
          const hx = cx + radius * Math.cos(a);
          const hy = cy + radius * Math.sin(a);
          const isActive = activeSection === s.id;
          const isHovered = hoveredId === s.id;

          return (
            <g key={`path-${s.id}`}>
              {isActive && (
                <motion.path
                  d={dendriticPath(cx, cy, hx, hy, i)}
                  fill="none"
                  stroke="white"
                  strokeWidth={4}
                  filter="url(#active-glow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  className="animate-dashFlow"
                />
              )}

              {/* HEXAGON SHAPE */}
              <polygon
                points={`${hx},${hy - hexH / 2} ${hx + hex / 2},${hy - hexH / 4} ${hx + hex / 2},${hy + hexH / 4} ${hx},${hy + hexH / 2} ${hx - hex / 2},${hy + hexH / 4} ${hx - hex / 2},${hy - hexH / 4}`}
                fill={isHovered ? 'white' : brandPink} // Inverted Hover
                stroke={isHovered ? brandPink : deepBurgundy}
                strokeWidth={isActive ? 6 : 4}
                className="transition-all duration-300 cursor-pointer"
                style={{ 
                  filter: isActive ? `drop-shadow(0 0 25px ${glowColor})` : 'none' 
                }}
                onClick={() => onSelect(s.id)}
              />
            </g>
          );
        })}
      </svg>

      {/* Interactive Icons & Labels Layer */}
      {SECTIONS.map((s, i) => {
        const a = (i * 60 - 90) * (Math.PI / 180);
        const hx = cx + radius * Math.cos(a);
        const hy = cy + radius * Math.sin(a);
        const isActive = activeSection === s.id;
        const isHovered = hoveredId === s.id;
        const Icon = s.icon;
        
        const iconSize = Math.round(hex * 0.35);
        const currentFontSize = isActive ? fontSize + 4 : fontSize;

        return (
          <motion.button
            key={`btn-${s.id}`}
            className="absolute flex flex-col items-center justify-between z-20 bg-none border-none cursor-pointer pt-6 pb-5 px-2"
            style={{
              left: hx - hex / 2,
              top: hy - hexH / 2,
              width: hex, height: hexH,
            }}
            onMouseEnter={() => setHoveredId(s.id)}
            onMouseLeave={() => setHoveredId(null)}
            whileHover={{ scale: 1.15 }} // Increased growth
            onClick={() => onSelect(s.id)}
          >
            <Icon 
              size={iconSize} 
              className="pointer-events-none transition-colors duration-300"
              style={{ 
                color: isHovered ? deepBurgundy : 'white',
                filter: isActive ? `drop-shadow(0 0 10px white)` : 'none'
              }} 
            />

            <span 
              className="font-mono uppercase font-black tracking-tight text-center pointer-events-none leading-[0.95] transition-colors duration-300"
              style={{
                fontSize: `${currentFontSize}px`,
                color: isHovered ? deepBurgundy : 'white',
                maxWidth: '95%',
                whiteSpace: 'pre-line',
                textShadow: isActive ? `0 0 15px ${glowColor}` : 'none'
              }}
            >
              {s.label}
            </span>
          </motion.button>
        );
      })}

      {/* CORE AVATAR */}
      <motion.div
        className="absolute top-1/2 left-1/2 z-10 overflow-hidden rounded-full border-4 border-[#E01880] shadow-[0_0_50px_rgba(255,255,255,0.4)]"
        style={{ width: core, height: core }}
        initial={{ x: "-50%", y: "-50%", scale: 0 }}
        animate={{ x: "-50%", y: "-50%", scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <img src={profilePic} alt="Lancelot" className="w-full h-full object-cover object-center" />
      </motion.div>

      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white/20 animate-glow-pulse z-[9] pointer-events-none"
        style={{ width: core + 40, height: core + 40 }}
      />
    </div>
  );
}