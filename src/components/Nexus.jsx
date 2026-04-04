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
  // Mobile
  if (w < 480) return { size: 320, core: 75, radius: 110, hex: 70, fontSize: 11 };
  // Tablet
  if (w < 900) return { size: 480, core: 110, radius: 170, hex: 100, fontSize: 14 };
  // Web / Desktop - MASSIVE INCREASE
  return { size: 650, core: 160, radius: 230, hex: 140, fontSize: 18 };
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

  useEffect(() => {
    const update = () => setLayout(getLayout(window.innerWidth));
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const { size, core, radius, hex, fontSize } = layout;
  const hexH = Math.round(hex * 1.18); // Slightly taller for better text vertical centering
  const cx = size / 2, cy = size / 2;
  
  const brandPink = '#E01880';
  const deepBurgundy = '#4A0000'; // Dark Red/Burgundy Outline

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      
      {/* SVG Layer for Connections */}
      <svg className="absolute inset-0 w-full h-full overflow-visible z-[5]">
        <defs>
          <filter id="white-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
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
                  stroke="white"
                  strokeWidth={4}
                  strokeOpacity={1}
                  filter="url(#white-glow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="animate-dashFlow"
                />
              )}

              {/* HEXAGON SHAPE */}
              <polygon
                points={`${hx},${hy - hexH / 2} ${hx + hex / 2},${hy - hexH / 4} ${hx + hex / 2},${hy + hexH / 4} ${hx},${hy + hexH / 2} ${hx - hex / 2},${hy + hexH / 4} ${hx - hex / 2},${hy - hexH / 4}`}
                fill={brandPink}
                stroke={deepBurgundy} 
                strokeWidth={isActive ? 6 : 4}
                className="transition-all duration-300 cursor-pointer"
                style={{ 
                  filter: isActive ? `drop-shadow(0 0 20px white)` : `drop-shadow(0 0 5px rgba(255,255,255,0.3))` 
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
        const Icon = s.icon;
        
        // Large scale icon shifted up
        const iconSize = Math.round(hex * 0.32);
        const currentFontSize = isActive ? fontSize + 4 : fontSize;

        return (
          <motion.button
            key={`btn-${s.id}`}
            className="absolute flex flex-col items-center justify-center z-20 bg-none border-none p-0 cursor-pointer"
            style={{
              left: hx - hex / 2,
              top: hy - hexH / 2,
              width: hex, height: hexH,
            }}
            whileHover={{ scale: 1.08 }}
            onClick={() => onSelect(s.id)}
          >
            {/* Shift Icon UP */}
            <div className="mt-[-15%] transition-transform duration-300">
              <Icon 
                size={iconSize} 
                className="pointer-events-none"
                style={{ color: 'white', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' }} 
              />
            </div>

            {/* LARGE TEXT spanning width */}
            <span 
              className="font-mono uppercase font-black tracking-tight text-center pointer-events-none leading-[1.0] mt-1 px-1"
              style={{
                fontSize: `${currentFontSize}px`,
                color: 'white',
                maxWidth: '90%',
                whiteSpace: 'pre-line',
                textShadow: '0 0 10px rgba(0,0,0,0.3)'
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
        style={{
          width: core, height: core,
        }}
        initial={{ x: "-50%", y: "-50%", scale: 0 }}
        animate={{ x: "-50%", y: "-50%", scale: 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <img 
          src={profilePic} 
          alt="Lancelot Naipier-Kane" 
          className="w-full h-full object-cover object-center" 
        />
      </motion.div>

      {/* Pulse Effect Rings */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white/20 animate-glow-pulse z-[9] pointer-events-none"
        style={{
          width: core + 40, height: core + 40,
        }}
      />
    </div>
  );
}