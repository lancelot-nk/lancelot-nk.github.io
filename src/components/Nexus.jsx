import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Code, FileText, BarChart3, Palette, BookOpen, Award } from 'lucide-react';

import profilePic from '../assets/profile.jpg';

export const SECTIONS = [
  { id: 'projects',       label: 'Projects',     icon: Code },
  { id: 'resume',         label: 'Resume',        icon: FileText },
  { id: 'dashboards',     label: 'Dash\nBoards',  icon: BarChart3 },
  { id: 'design',         label: 'Design',        icon: Palette },
  { id: 'publications',   label: 'Pub &\nGrants', icon: BookOpen },
  { id: 'certifications', label: 'Certs',         icon: Award },
];

function getLayout(w) {
  if (w < 480) return { size: 340, core: 75, radius: 105, hex: 75, fontSize: 10, isMobile: true,  lineCount: 5,  scaleFactor: 0.6, blur: 1 };
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
  const minLaunch = 28 * scaleFactor;
  const maxLaunch = 55 * scaleFactor;
  const minSeg    = 18 * scaleFactor;
  const maxSeg    = 70 * scaleFactor;
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
    const turnLeft  = [-dirY,  dirX];
    const turnRight = [ dirY, -dirX];
    const [ndx, ndy] = rng() < 0.25 ? [dirX, dirY] : (rng() > 0.5 ? turnLeft : turnRight);
    const segLen = minSeg + rng() * (maxSeg - minSeg);
    const clampedX = Math.max(bounds.minX, Math.min(bounds.maxX, curX + ndx * segLen));
    const clampedY = Math.max(bounds.minY, Math.min(bounds.maxY, curY + ndy * segLen));
    const hitBound = clampedX !== curX + ndx * segLen || clampedY !== curY + ndy * segLen;
    curX = clampedX; curY = clampedY;
    dirX = ndx; dirY = ndy;
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
    const midX = (v[0] + next[0]) / 2;
    const midY = (v[1] + next[1]) / 2;
    const edgeDx = next[0] - v[0], edgeDy = next[1] - v[1];
    const len = Math.hypot(edgeDx, edgeDy);
    let nx = -edgeDy / len, ny = edgeDx / len;
    if (nx * (midX - hx) + ny * (midY - hy) < 0) { nx = -nx; ny = -ny; }
    return { midX, midY, angle: Math.atan2(ny, nx), v0: v, v1: next };
  });
}

function buildSectionPaths(sectionIdx, cx, cy, radius, hex, hexH, lineCount, scaleFactor, bounds, activationSeed) {
  const rng = seededRng(activationSeed ^ (sectionIdx * 0x9e3779b9));
  const baseA = ((sectionIdx * 60) - 120) * (Math.PI / 180);
  const hx = cx + radius * Math.cos(baseA);
  const hy = cy + radius * Math.sin(baseA);

  const inwardPaths = Array.from({ length: lineCount }, (_, idx) => {
    const frac = (idx / (lineCount - 1)) - 0.5;
    const perpAngle = baseA + Math.PI / 2;
    const spread = hex * 0.6;
    const arrX = hx + Math.cos(perpAngle) * spread * frac;
    const arrY = hy + Math.sin(perpAngle) * spread * frac;
    const depOff = (rng() - 0.5) * 12 * scaleFactor;
    const depX = cx + Math.cos(perpAngle) * depOff;
    const depY = cy + Math.sin(perpAngle) * depOff;
    return {
      d: manhattanPath(depX, depY, arrX, arrY, rng() > 0.5),
      strokeWidth: 0.4 + rng() * 1.6,         // 0.4–2.0
      opacity:     0.15 + rng() * 0.45,        // 0.15–0.60
      blur:        0.4  + rng() * 1.8,         // individual glow variance
    };
  });

  const faces = getHexFaces(hx, hy, hex, hexH);
  const outwardPaths = [];
  faces.forEach((face) => {
    const traceCount = rng() < 0.15 ? 0 : 1 + Math.floor(rng() * 3);
    for (let t = 0; t < traceCount; t++) {
      const frac = 0.1 + rng() * 0.8;
      const startX = face.v0[0] + (face.v1[0] - face.v0[0]) * frac;
      const startY = face.v0[1] + (face.v1[1] - face.v0[1]) * frac;
      outwardPaths.push({
        d: buildCircuitTrace(startX, startY, face.angle, bounds, rng, scaleFactor),
        strokeWidth: 0.3 + rng() * 1.4,        // 0.3–1.7
        opacity:     0.12 + rng() * 0.40,       // 0.12–0.52
        blur:        0.3  + rng() * 2.2,         // wider variance for depth
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

  // Timing constants
  const IN_DUR   = 0.5;
  const OUT_DUR  = 0.38;
  // Outward draws after inward finishes
  const OUT_DRAW_DELAY    = IN_DUR + 0.15;   // inward fully drawn + pause
  // Retract: outward retracts first, then inward after a gap
  const OUT_RETRACT_DELAY = 0;
  const IN_RETRACT_DELAY  = OUT_DUR + 0.12;  // outward done retracting + pause

  return (
    <g>
      {inwardPaths.map((line, idx) => (
        <motion.path
          key={`in-${idx}`}
          d={line.d}
          fill="none"
          stroke="white"
          strokeWidth={line.strokeWidth}
          opacity={line.opacity}
          filter={`url(#glow-${Math.min(3, Math.floor(line.blur))})`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: isLeaving ? 0 : 1 }}
          transition={{
            duration: isLeaving ? OUT_DUR  : IN_DUR,
            delay:    isLeaving ? IN_RETRACT_DELAY : 0,
            ease: 'easeOut',
          }}
        />
      ))}
      {outwardPaths.map((line, idx) => (
        <motion.path
          key={`out-${idx}`}
          d={line.d}
          fill="none"
          stroke="white"
          strokeWidth={line.strokeWidth}
          opacity={line.opacity}
          filter={`url(#glow-${Math.min(3, Math.floor(line.blur))})`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: isLeaving ? 0 : 1 }}
          transition={{
            duration: isLeaving ? OUT_DUR  : 0.75,
            delay:    isLeaving ? OUT_RETRACT_DELAY : OUT_DRAW_DELAY,
            ease: 'easeOut',
          }}
        />
      ))}
    </g>
  );
}

export default function Nexus({ activeSection, onSelect }) {
  const [layout, setLayout] = useState(() => getLayout(typeof window !== 'undefined' ? window.innerWidth : 1000));
  const [hoveredId, setHoveredId] = useState(null);
  const [mountedSections,  setMountedSections]  = useState(new Set());
  const [leavingSections,  setLeavingSections]  = useState(new Set());
  const [activationSeeds,  setActivationSeeds]  = useState({});
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
      // total retract time: OUT_DUR(0.38) + IN_RETRACT_DELAY(0.5) + OUT_DUR(0.38) + buffer
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
  const hexH    = Math.round(hex * 1.15);
  const cx      = size / 2;
  const cy      = size / 2;
  const brandPink = '#E01880';
  const padding   = 18 * scaleFactor;

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

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>

      {/* ── CIRCUIT LINES — z-[1] ── */}
      <svg className="absolute inset-0 w-full h-full overflow-visible z-[1]"
           style={{ clipPath: `inset(${padding}px)` }}>
        <defs>
          {/* Tiered glow filters — lines pick one based on their individual blur value */}
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
          const isActive = activeSection === s.id;
          return (
            <g key={`hex-${s.id}`}>
              {/* Outer glow polygon — only visible when active */}
              {isActive && (
                <motion.polygon
                  points={points}
                  fill="none"
                  stroke="rgba(255, 200, 230, 0.55)"
                  strokeWidth={14}
                  filter="url(#hex-glow)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
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
            onMouseEnter={() => setHoveredId(s.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onSelect(s.id)}
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

      {/* ── PORTRAIT — z-[100] ── */}
      <motion.div
        className="absolute top-1/2 left-1/2 z-[100] overflow-hidden rounded-full border-4 border-[#E01880] shadow-2xl"
        style={{ width: core, height: core, x: '-50%', y: '-50%' }}
        whileHover={{ scale: 1.7 }}
      >
        <img src={profilePic} alt="Lancelot" className="w-full h-full object-cover" />
      </motion.div>
    </div>
  );
}