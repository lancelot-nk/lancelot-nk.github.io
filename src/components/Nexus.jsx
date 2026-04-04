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
  if (w < 400) return { size: 300, core: 70, radius: 105, hex: 65 };
  if (w < 600) return { size: 360, core: 85, radius: 125, hex: 75 };
  if (w < 900) return { size: 450, core: 110, radius: 160, hex: 95 };
  return { size: 550, core: 140, radius: 200, hex: 110 };
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
  const [layout, setLayout] = useState(() => getLayout(typeof window !== 'undefined' ? window.innerWidth : 900));

  useEffect(() => {
    const update = () => setLayout(getLayout(window.innerWidth));
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const { size, core, radius, hex } = layout;
  const hexH = Math.round(hex * 1.15);
  const cx = size / 2, cy = size / 2;
  
  const pink = '#E01880'; 
  const darkBurgundy = '#300018'; // High contrast dark color

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      
      {/* SVG Layer for Connections */}
      <svg className="absolute inset-0 w-full h-full overflow-visible z-[5]">
        <defs>
          <filter id="nexus-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
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

          return (
            <g key={`path-${s.id}`}>
              {isActive && (
                <motion.path
                  d={dendriticPath(cx, cy, hx, hy, i)}
                  fill="none"
                  stroke={pink}
                  strokeWidth={3}
                  strokeOpacity={0.8}
                  strokeDasharray="8 5"
                  filter="url(#nexus-glow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="animate-dashFlow"
                />
              )}

              <polygon
                points={`${hx},${hy - hexH / 2 + 2} ${hx + hex / 2 - 1},${hy - hexH / 4} ${hx + hex / 2 - 1},${hy + hexH / 4} ${hx},${hy + hexH / 2 - 2} ${hx - hex / 2 + 1},${hy + hexH / 4} ${hx - hex / 2 + 1},${hy - hexH / 4}`}
                fill={isActive ? 'rgba(224,24,128,0.12)' : 'rgba(255,255,255,0.85)'}
                stroke={isActive ? pink : darkBurgundy}
                strokeWidth={isActive ? 4 : 2.5}
                className="transition-all duration-300 cursor-pointer"
                style={{ 
                  filter: isActive ? `drop-shadow(0 0 12px ${pink}88)` : 'none' 
                }}
                onClick={() => onSelect(s.id)}
              />
            </g>
          );
        })}
      </svg>

      {/* Interactive Icons Layer */}
      {SECTIONS.map((s, i) => {
        const a = (i * 60 - 90) * (Math.PI / 180);
        const hx = cx + radius * Math.cos(a);
        const hy = cy + radius * Math.sin(a);
        const isActive = activeSection === s.id;
        const Icon = s.icon;
        
        // Dynamic sizing for clarity
        const iconSize = Math.round(hex * 0.28);
        const fontSize = isActive ? '13px' : '11px';

        return (
          <motion.button
            key={`btn-${s.id}`}
            className="absolute flex flex-col items-center justify-center gap-1 z-20 bg-none border-none p-0 cursor-pointer"
            style={{
              left: hx - hex / 2,
              top: hy - hexH / 2,
              width: hex, height: hexH,
            }}
            whileHover={{ scale: 1.1 }}
            onClick={() => onSelect(s.id)}
          >
            <Icon 
              size={iconSize} 
              className="transition-colors duration-300 pointer-events-none"
              style={{ color: isActive ? pink : darkBurgundy }} 
            />
            <span 
              className="font-mono uppercase font-black tracking-tighter text-center pointer-events-none transition-colors duration-300 leading-[0.95]"
              style={{
                fontSize,
                color: isActive ? pink : darkBurgundy,
                maxWidth: hex - 10,
                whiteSpace: 'pre-line' // Enables multi-line support for \n
              }}
            >
              {s.label}
            </span>
          </motion.button>
        );
      })}

      {/* Core Avatar */}
      <motion.div
        className="absolute top-1/2 left-1/2 z-10 overflow-hidden rounded-full border-4 border-[#E01880] shadow-[0_0_40px_rgba(224,24,128,0.3)]"
        style={{
          width: core, height: core,
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <img 
          src={profilePic} 
          alt="Lancelot Naipier-Kane" 
          className="w-full h-full object-cover object-top" 
        />
      </motion.div>

      {/* Pulse Effect Rings */}
      <div 
        className="absolute top-1/2 left-1/2 rounded-full border-2 border-[#E01880]/30 animate-glow-pulse z-[9] pointer-events-none"
        style={{
          width: core + 30, height: core + 30,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  );
}