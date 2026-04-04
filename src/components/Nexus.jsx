import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, FileText, BarChart3, Palette, BookOpen, Award } from 'lucide-react';

export const SECTIONS = [
  { id: 'projects',       label: 'Projects',       icon: Code },
  { id: 'resume',         label: 'Resume',          icon: FileText },
  { id: 'dashboards',     label: 'Dashboards',      icon: BarChart3 },
  { id: 'design',         label: 'Design',          icon: Palette },
  { id: 'publications',   label: 'Pub & Grants',    icon: BookOpen },
  { id: 'certifications', label: 'Certs',           icon: Award },
];

const NEXUS_IMG = "https://lancelot-nk.github.io/images/pic10.jpg";

function getLayout(w) {
  if (w < 400) return { size: 280, core: 64, radius: 98, hex: 58 };
  if (w < 600) return { size: 340, core: 78, radius: 118, hex: 66 };
  if (w < 900) return { size: 420, core: 96, radius: 148, hex: 80 };
  return { size: 520, core: 120, radius: 180, hex: 92 };
}

/**
 * Creates a "dendritic" or circuit-like path from core to node
 */
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
  
  // Use HSL from CSS variables for consistency
  const pink = '#E01880'; 

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      
      {/* SVG Layer for Connections */}
      <svg className="absolute inset-0 w-full h-full overflow-visible z-[5]">
        <defs>
          <filter id="nexus-glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
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
                  strokeWidth={2}
                  strokeOpacity={0.5}
                  strokeDasharray="6 4"
                  filter="url(#nexus-glow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="animate-dashFlow"
                />
              )}

              <polygon
                points={`${hx},${hy - hexH / 2 + 2} ${hx + hex / 2 - 1},${hy - hexH / 4} ${hx + hex / 2 - 1},${hy + hexH / 4} ${hx},${hy + hexH / 2 - 2} ${hx - hex / 2 + 1},${hy + hexH / 4} ${hx - hex / 2 + 1},${hy - hexH / 4}`}
                fill={isActive ? 'rgba(224,24,128,0.08)' : 'rgba(255,255,255,0.7)'}
                stroke={isActive ? pink : 'rgba(224,24,128,0.25)'}
                strokeWidth={isActive ? 2.5 : 1}
                className="transition-all duration-300 cursor-pointer"
                style={{ 
                  filter: isActive ? `drop-shadow(0 0 8px ${pink}66)` : 'none' 
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
        const iconSize = Math.round(hex * 0.24);
        const fontSize = Math.min(9, Math.round(hex * 0.12));

        return (
          <motion.button
            key={`btn-${s.id}`}
            className="absolute flex flex-col items-center justify-center gap-1 z-20 bg-none border-none p-0 cursor-pointer"
            style={{
              left: hx - hex / 2,
              top: hy - hexH / 2,
              width: hex, height: hexH,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => onSelect(s.id)}
          >
            <Icon 
              size={iconSize} 
              className="transition-colors duration-300 pointer-events-none"
              style={{ color: isActive ? pink : 'rgba(120,0,140,0.5)' }} 
            />
            <span 
              className="font-mono uppercase tracking-wider text-center pointer-events-none transition-colors duration-300"
              style={{
                fontSize,
                color: isActive ? pink : 'rgba(100,0,120,0.55)',
                maxWidth: hex - 8,
              }}
            >
              {s.label}
            </span>
          </motion.button>
        );
      })}

      {/* Core Avatar */}
      <motion.div
        className="absolute top-1/2 left-1/2 z-10 overflow-hidden rounded-full border-2 border-[#E01880]/40 shadow-[0_0_30px_rgba(224,24,128,0.2)]"
        style={{
          width: core, height: core,
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <img 
          src={NEXUS_IMG} 
          alt="Core Identity" 
          className="w-full h-full object-cover object-top scale-110" 
        />
      </motion.div>

      {/* Pulse Effect Rings */}
      <div 
        className="absolute top-1/2 left-1/2 rounded-full border border-[#E01880]/15 animate-glow-pulse z-[9] pointer-events-none"
        style={{
          width: core + 24, height: core + 24,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  );
}