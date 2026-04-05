import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, FileText, BarChart3, Palette, BookOpen, Award } from 'lucide-react';

import profilePic from '../assets/profile.jpg';

const PINK = '#E01880';

export const SECTIONS = [
  { id: 'projects',       label: 'Projects',      icon: Code },
  { id: 'resume',         label: 'Resume',         icon: FileText },
  { id: 'dashboards',     label: 'Dash\nBoards',  icon: BarChart3 },
  { id: 'design',         label: 'Design',         icon: Palette },
  { id: 'publications',   label: 'Pub &\nGrants', icon: BookOpen },
  { id: 'certifications', label: 'Certs',          icon: Award },
];

// ── PORTRAIT LOADER ANIMATION ────────────────────────────────────────────────
function PortraitLoader({ core, onComplete }) {
  return (
    <motion.div 
      className="absolute top-1/2 left-1/2 z-[110] pointer-events-none overflow-hidden rounded-full"
      style={{ 
        width: core, 
        height: core, 
        x: '-50%', 
        y: '-50%',
        background: '#1A0010' 
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 2.2, duration: 0.8, ease: "easeInOut" }}
      onAnimationComplete={onComplete}
    >
      <motion.svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-[120%]"
        initial={{ y: "100%" }}
        animate={{ y: "-20%" }}
        transition={{ duration: 2, ease: "easeInOut" }}
        style={{ fill: PINK }}
      >
        <path d="M0 10 C 20 0, 30 20, 50 10 C 70 0, 80 20, 100 10 L 100 100 L 0 100 Z" />
      </motion.svg>
    </motion.div>
  );
}

function getLayout(w) {
  // Mobile: Reduced size to minimize empty safety area, keeping it tight to the hexagons
  if (w < 480) return { size: 300, core: 70, radius: 95, hex: 70, fontSize: 10, isMobile: true,  lineCount: 5,  scaleFactor: 0.55, blur: 1 };
  if (w < 900) return { size: 550, core: 110, radius: 180, hex: 110, fontSize: 16, isMobile: false, lineCount: 10, scaleFactor: 0.8, blur: 2 };
  return               { size: 850, core: 175, radius: 255, hex: 155, fontSize: 24, isMobile: false, lineCount: 10, scaleFactor: 1,   blur: 2 };
}

function seededRng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function manhattanPath(x0, y0, x1, y1, horizontalFirst) {
  if (horizontalFirst) return `M ${x0} ${y0} L ${x1} ${y0} L ${x1} ${y1}`;
  return `M ${x0} ${y0} L ${x0} ${y1} L ${x1} ${y1}`;
}

function buildCircuitTrace(startX, startY, faceAngle, bounds, rng, scaleFactor) {
  const minLaunch = 28 * scaleFactor, maxLaunch = 55 * scaleFactor;
  const minSeg    = 18 * scaleFactor, maxSeg    = 70 * scaleFactor;
  const numTurns  = 2 + Math.floor(rng() * 4);

  const cardinalAngle = Math.round(faceAngle / (Math.PI / 2)) * (Math.PI / 2);
  const dx = Math.round(Math.cos(cardinalAngle));
  const dy = Math.round(Math.sin(cardinalAngle));

  const launchDist = minLaunch + rng() * (maxLaunch - minLaunch);
  let curX = Math.max(bounds.minX, Math.min(bounds.maxX, startX + dx * launchDist));
  let curY = Math.max(bounds.minY, Math.min(bounds.maxY, startY + dy * launchDist));
  let points = [[startX, startY], [curX, curY]];
  let dirX = dx, dirY = dy;

  for (let t = 0; t < numTurns; t++) {
    const turnLeft  = [-dirY,  dirX], turnRight = [dirY, -dirX];
    const [ndx, ndy] = rng() < 0.25 ? [dirX, dirY] : (rng() > 0.5 ? turnLeft : turnRight);
    const segLen = minSeg + rng() * (maxSeg - minSeg);
    const clampedX = Math.max(bounds.minX, Math.min(bounds.maxX, curX + ndx * segLen));
    const clampedY = Math.max(bounds.minY, Math.min(bounds.maxY, curY + ndy * segLen));
    const hitBound = clampedX !== curX + ndx * segLen || clampedY !== curY + ndy * segLen;
    curX = clampedX; curY = clampedY; dirX = ndx; dirY = ndy;
    points.push([curX, curY]);
    if (hitBound) break;
  }

  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
}

function getHexFaces(hx, hy, hex, hexH) {
  const verts = [
    [hx,         hy - hexH / 2],
    [hx + hex/2, hy - hexH / 4],
    [hx + hex/2, hy + hexH / 4],
    [hx,         hy + hexH / 2],
    [hx - hex/2, hy + hexH / 4],
    [hx - hex/2, hy - hexH / 4],
  ];
  return verts.map((v, i) => {
    const next = verts[(i + 1) % 6];
    const midX = (v[0] + next[0]) / 2, midY = (v[1] + next[1]) / 2;
    const edgeDx = next[0] - v[0], edgeDy = next[1] - v[1];
    const len = Math.hypot(edgeDx, edgeDy);
    let nx = -edgeDy / len, ny = edgeDx / len;
    if (nx * (midX - hx) + ny * (midY - hy) < 0) { nx = -nx; ny = -ny; }
    return { angle: Math.atan2(ny, nx), v0: v, v1: next };
  });
}

function buildSectionPaths(sectionIdx, cx, cy, radius, hex, hexH, lineCount, scaleFactor, bounds, activationSeed) {
  const rng   = seededRng(activationSeed ^ (sectionIdx * 0x9e3779b9));
  const baseA = ((sectionIdx * 60) - 120) * (Math.PI / 180);
  const hx    = cx + radius * Math.cos(baseA);
  const hy    = cy + radius * Math.sin(baseA);

  const inwardPaths = Array.from({ length: lineCount }, (_, idx) => {
    const frac       = (idx / (lineCount - 1)) - 0.5;
    const perpAngle  = baseA + Math.PI / 2;
    const arrX       = hx + Math.cos(perpAngle) * hex * 0.6 * frac;
    const arrY       = hy + Math.sin(perpAngle) * hex * 0.6 * frac;
    const depOff     = (rng() - 0.5) * 12 * scaleFactor;
    const depX       = cx + Math.cos(perpAngle) * depOff;
    const depY       = cy + Math.sin(perpAngle) * depOff;
    return {
      d:           manhattanPath(depX, depY, arrX, arrY, rng() > 0.5),
      strokeWidth: 0.4 + rng() * 1.6,
      opacity:     0.15 + rng() * 0.45,
      blur:        0.4  + rng() * 1.8,
    };
  });

  const faces = getHexFaces(hx, hy, hex, hexH);
  const outwardPaths = [];
  faces.forEach((face) => {
    const traceCount = rng() < 0.15 ? 0 : 1 + Math.floor(rng() * 3);
    for (let t = 0; t < traceCount; t++) {
      const frac   = 0.1 + rng() * 0.8;
      const startX = face.v0[0] + (face.v1[0] - face.v0[0]) * frac;
      const startY = face.v0[1] + (face.v1[1] - face.v0[1]) * frac;
      outwardPaths.push({
        d:           buildCircuitTrace(startX, startY, face.angle, bounds, rng, scaleFactor),
        strokeWidth: 0.3 + rng() * 1.4,
        opacity:     0.12 + rng() * 0.40,
        blur:        0.3  + rng() * 2.2,
      });
    }
  });

  return { inwardPaths, outwardPaths };
}

function SectionLines({ sectionIdx, cx, cy, radius, hex, hexH, lineCount, scaleFactor, bounds, activationSeed, isLeaving }) {
  const { inwardPaths, outwardPaths } = useMemo(
    () => buildSectionPaths(sectionIdx, cx, cy, radius, hex, hexH, lineCount, scaleFactor, bounds, activationSeed),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activationSeed]
  );

  const IN_DUR           = 0.5;
  const OUT_DUR           = 0.38;
  const OUT_DRAW_DELAY    = IN_DUR + 0.15;
  const OUT_RETRACT_DELAY = 0;
  const IN_RETRACT_DELAY  = OUT_DUR + 0.12;

  return (
    <g>
      {inwardPaths.map((line, idx) => (
        <motion.path
          key={`in-${idx}`}
          d={line.d}
          fill="none" stroke="white"
          strokeWidth={line.strokeWidth}
          opacity={line.opacity}
          filter={`url(#glow-${Math.min(3, Math.floor(line.blur))})`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: isLeaving ? 0 : 1 }}
          transition={{
            duration: isLeaving ? OUT_DUR : IN_DUR,
            delay:     isLeaving ? IN_RETRACT_DELAY : 0,
            ease: 'easeOut',
          }}
        />
      ))}
      {outwardPaths.map((line, idx) => (
        <motion.path
          key={`out-${idx}`}
          d={line.d}
          fill="none" stroke="white"
          strokeWidth={line.strokeWidth}
          opacity={line.opacity}
          filter={`url(#glow-${Math.min(3, Math.floor(line.blur))})`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: isLeaving ? 0 : 1 }}
          transition={{
            duration: isLeaving ? OUT_DUR : 0.75,
            delay:     isLeaving ? OUT_RETRACT_DELAY : OUT_DRAW_DELAY,
            ease: 'easeOut',
          }}
        />
      ))}
    </g>
  );
}

export default function Nexus({ activeSection, onSelect, isLocked }) {
  const [layout, setLayout]               = useState(() => getLayout(typeof window !== 'undefined' ? window.innerWidth : 1000));
  const [hoveredId, setHoveredId]         = useState(null);
  const [mountedSections,  setMountedSections]  = useState(new Set());
  const [leavingSections,  setLeavingSections]  = useState(new Set());
  const [activationSeeds,  setActivationSeeds]  = useState({});
  const [portraitHovered,  setPortraitHovered]  = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  
  const prevActiveRef = useRef(null);
  const exitTimers    = useRef({});

  useEffect(() => {
    const update = () => setLayout(getLayout(window.innerWidth));
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (layout.isMobile) return;
    const prev = prevActiveRef.current;
    const next = activeSection;
    prevActiveRef.current = next;

    if (prev && prev !== next) {
      clearTimeout(exitTimers.current[prev]);
      setLeavingSections(s => new Set(s).add(prev));
      exitTimers.current[prev] = setTimeout(() => {
        setMountedSections(s => { const n = new Set(s); n.delete(prev); return n; });
        setLeavingSections(s => { const n = new Set(s); n.delete(prev); return n; });
      }, 1100);
    }

    if (next) {
      setActivationSeeds(m => ({ ...m, [next]: (Math.random() * 0xffffffff) >>> 0 }));
      setMountedSections(s => new Set(s).add(next));
      if (leavingSections.has(next)) {
        clearTimeout(exitTimers.current[next]);
        setLeavingSections(s => { const n = new Set(s); n.delete(next); return n; });
      }
    }
  }, [activeSection, layout.isMobile]);

  useEffect(() => () => Object.values(exitTimers.current).forEach(clearTimeout), []);

  const { size, core, radius, hex, fontSize, isMobile, lineCount, scaleFactor, blur } = layout;
  const hexH      = Math.round(hex * 1.15);
  const cx        = size / 2;
  const cy        = size / 2;
  const brandPink = PINK;
  
  // Minimal padding for mobile to allow the container to collapse closer to content
  const padding   = (isMobile ? 8 : 18) * scaleFactor;

  const bounds = useMemo(() => ({
    minX: padding,
    maxX: size - padding,
    minY: padding + (isMobile ? 0 : 30 * scaleFactor),
    maxY: size - padding - (isMobile ? 0 : 30 * scaleFactor),
  }), [size, padding, scaleFactor, isMobile]);

  const hexData = useMemo(() => SECTIONS.map((_, i) => {
    const a  = ((i * 60) - 120) * (Math.PI / 180);
    const hx = cx + radius * Math.cos(a);
    const hy = cy + radius * Math.sin(a);
    return {
      hx, hy,
      points: `${hx},${hy-hexH/2} ${hx+hex/2},${hy-hexH/4} ${hx+hex/2},${hy+hexH/4} ${hx},${hy+hexH/2} ${hx-hex/2},${hy+hexH/4} ${hx-hex/2},${hy-hexH/4}`,
    };
  }), [cx, cy, radius, hex, hexH]);

  const canHover = !isLocked && animationDone;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>

      {/* ── CIRCUIT LINES — z-[1] ── */}
      <svg className="absolute inset-0 w-full h-full overflow-visible z-[1]"
           style={{ clipPath: `inset(${padding}px)` }}>
        <defs>
          {[0.6, 1.2, 2.0, 3.0].map((std, i) => (
            <filter key={i} id={`glow-${i}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation={std} result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          ))}
        </defs>

        {SECTIONS.map((s, i) => {
          if (isMobile) {
            if (activeSection !== s.id) return null;
            return (
              <g key={`lines-${s.id}`} filter="url(#glow-1)">
                {buildSectionPaths(i, cx, cy, radius, hex, hexH, lineCount, scaleFactor, bounds, 42).inwardPaths.map((l, idx) => (
                  <path key={idx} d={l.d} fill="none" stroke="white" strokeWidth={l.strokeWidth} opacity={l.opacity} />
                ))}
              </g>
            );
          }
          if (!mountedSections.has(s.id)) return null;
          const seed = activationSeeds[s.id] ?? 0;
          return (
            <SectionLines
              key={`lines-${s.id}-${seed}`}
              sectionIdx={i} cx={cx} cy={cy} radius={radius}
              hex={hex} hexH={hexH} lineCount={lineCount}
              scaleFactor={scaleFactor} bounds={bounds}
              activationSeed={seed}
              isLeaving={leavingSections.has(s.id)}
            />
          );
        })}
      </svg>

      {/* ── HEX POLYGONS — z-[10] ── */}
      <svg className="absolute inset-0 w-full h-full overflow-visible z-[10] pointer-events-none">
        <defs>
          <filter id="hex-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {SECTIONS.map((s, i) => {
          const { points } = hexData[i];
          const isActive   = activeSection === s.id;
          return (
            <g key={`hex-${s.id}`}>
              {isActive && (
                <motion.polygon
                  points={points} fill="none"
                  stroke="rgba(255,200,230,0.55)" strokeWidth={14}
                  filter="url(#hex-glow)"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
                />
              )}
              <motion.polygon
                points={points}
                fill={hoveredId === s.id ? 'white' : brandPink}
                stroke={isActive ? 'white' : '#4A0000'}
                strokeWidth={isActive ? 4 : 2}
              />
            </g>
          );
        })}
      </svg>

      {/* ── BUTTONS — z-[20] ── */}
      {SECTIONS.map((s, i) => {
        const { hx, hy } = hexData[i];
        return (
          <motion.button
            key={`btn-${s.id}`}
            className="absolute z-[20] bg-none border-none cursor-pointer p-0"
            style={{ left: hx - hex / 2, top: hy - hexH / 2, width: hex, height: hexH }}
            onMouseEnter={() => canHover && setHoveredId(s.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => !isLocked && onSelect(s.id)}
          >
            <div className="relative w-full h-full flex flex-col items-center justify-center gap-3 pointer-events-none">
              <s.icon size={isMobile ? 22 : 34} style={{ color: hoveredId === s.id ? brandPink : 'white' }} />
              <span
                className="font-mono uppercase font-black text-center whitespace-pre-line"
                style={{ fontSize: `${fontSize}px`, color: hoveredId === s.id ? '#4A0000' : 'white', lineHeight: '1.1' }}
              >
                {s.label}
              </span>
            </div>
          </motion.button>
        );
      })}

      {/* ── PORTRAIT LOADER (FRONTMOST) — z-[110] ── */}
      {!animationDone && <PortraitLoader core={core} onComplete={() => setAnimationDone(true)} />}

      {/* ── PORTRAIT — z-[100] ── */}
      <div
        className="absolute top-1/2 left-1/2 z-[100]"
        style={{ width: core, height: core, transform: 'translate(-50%, -50%)' }}
        onMouseEnter={() => canHover && setPortraitHovered(true)}
        onMouseLeave={() => setPortraitHovered(false)}
      >
        {/* Glow bloom */}
        <motion.div
          className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
          style={{
            width:     core,
            height:    core,
            x:         '-50%',
            y:         '-50%',
            background: 'radial-gradient(circle, rgba(224,24,128,0.60) 0%, rgba(224,24,128,0.20) 55%, transparent 75%)',
            filter:   'blur(14px)',
            zIndex:    -1,
          }}
          animate={{
            scale:   portraitHovered ? 1.7 : 0.5,
            opacity: portraitHovered ? 1   : 0,
          }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />

        {/* Portrait */}
        <motion.a
          href="https://www.linkedin.com/in/lancelotnk/"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full overflow-hidden rounded-full border-4 border-[#E01880] shadow-2xl cursor-pointer"
          animate={{ scale: portraitHovered ? 1.7 : 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <img src={profilePic} alt="Lancelot — LinkedIn" className="w-full h-full object-cover" />
        </motion.a>
      </div>
    </div>
  );
}