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

// Seeded PRNG — deterministic per section+render cycle, but changes each activation
function seededRng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// Manhattan path from (x0,y0) to (x1,y1) — horizontal first or vertical first based on seed
function manhattanPath(x0, y0, x1, y1, horizontalFirst) {
  if (horizontalFirst) {
    return `M ${x0} ${y0} L ${x1} ${y0} L ${x1} ${y1}`;
  } else {
    return `M ${x0} ${y0} L ${x0} ${y1} L ${x1} ${y1}`;
  }
}

// Generate outward circuit traces from a hex face
// startX/Y: point on hex edge, faceAngle: outward normal angle of that face
// bounds: { minX, maxX, minY, maxY } — safe clip region in SVG coords
// rng: seeded random function
function buildCircuitTrace(startX, startY, faceAngle, bounds, rng, scaleFactor) {
  const minLaunch = 28 * scaleFactor;
  const maxLaunch = 55 * scaleFactor;
  const minSeg    = 18 * scaleFactor;
  const maxSeg    = 70 * scaleFactor;
  const numTurns  = 2 + Math.floor(rng() * 4); // 2–5 turns

  // Snap faceAngle to nearest 90° (cardinal direction)
  const cardinalAngle = Math.round(faceAngle / (Math.PI / 2)) * (Math.PI / 2);
  const dx = Math.round(Math.cos(cardinalAngle));
  const dy = Math.round(Math.sin(cardinalAngle));

  // Launch perpendicularly outward
  const launchDist = minLaunch + rng() * (maxLaunch - minLaunch);
  let curX = startX + dx * launchDist;
  let curY = startY + dy * launchDist;

  // Clamp launch endpoint
  curX = Math.max(bounds.minX, Math.min(bounds.maxX, curX));
  curY = Math.max(bounds.minY, Math.min(bounds.maxY, curY));

  let points = [[startX, startY], [curX, curY]];

  // Current direction as [dx, dy]
  let dirX = dx, dirY = dy;

  for (let t = 0; t < numTurns; t++) {
    // Turn 90° — either left or right, but never reverse (no -dirX, -dirY)
    // Perpendicular options: [-dirY, dirX] or [dirY, -dirX]
    const turnLeft  = [-dirY,  dirX];
    const turnRight = [ dirY, -dirX];
    const chosen = rng() > 0.5 ? turnLeft : turnRight;

    // Optionally keep going forward (weighted toward turning)
    const keepForward = rng() < 0.25;
    const [ndx, ndy] = keepForward ? [dirX, dirY] : chosen;

    const segLen = minSeg + rng() * (maxSeg - minSeg);
    const nextX = curX + ndx * segLen;
    const nextY = curY + ndy * segLen;

    // Stop if we'd exit bounds
    const clampedX = Math.max(bounds.minX, Math.min(bounds.maxX, nextX));
    const clampedY = Math.max(bounds.minY, Math.min(bounds.maxY, nextY));
    const hitBound = (clampedX !== nextX || clampedY !== nextY);

    curX = clampedX;
    curY = clampedY;
    dirX = ndx;
    dirY = ndy;
    points.push([curX, curY]);

    if (hitBound) break;
  }

  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
}

// Get the 6 face centers and normals of a hex
function getHexFaces(hx, hy, hex, hexH) {
  // Flat-top hex has 6 edges. We'll use pointy-top style as rendered:
  // vertices: top, top-right, bottom-right, bottom, bottom-left, top-left
  const verts = [
    [hx,         hy - hexH / 2],   // top
    [hx + hex/2, hy - hexH / 4],   // top-right
    [hx + hex/2, hy + hexH / 4],   // bottom-right
    [hx,         hy + hexH / 2],   // bottom
    [hx - hex/2, hy + hexH / 4],   // bottom-left
    [hx - hex/2, hy - hexH / 4],   // top-left
  ];

  return verts.map((v, i) => {
    const next = verts[(i + 1) % 6];
    const midX = (v[0] + next[0]) / 2;
    const midY = (v[1] + next[1]) / 2;
    // Outward normal: perpendicular to edge, pointing away from center
    const edgeDx = next[0] - v[0];
    const edgeDy = next[1] - v[1];
    const len = Math.hypot(edgeDx, edgeDy);
    // Normal pointing outward (away from hx,hy)
    let nx = -edgeDy / len;
    let ny =  edgeDx / len;
    // Flip if pointing inward
    if (nx * (midX - hx) + ny * (midY - hy) < 0) { nx = -nx; ny = -ny; }
    const angle = Math.atan2(ny, nx);
    return { midX, midY, angle, v0: v, v1: next };
  });
}

// Build all paths for a section (called fresh on each activation — intentionally random)
function buildSectionPaths(sectionIdx, cx, cy, radius, hex, hexH, lineCount, scaleFactor, bounds, activationSeed) {
  const rng = seededRng(activationSeed ^ (sectionIdx * 0x9e3779b9));
  const baseA = ((sectionIdx * 60) - 120) * (Math.PI / 180);
  const hx = cx + radius * Math.cos(baseA);
  const hy = cy + radius * Math.sin(baseA);

  // === PHASE 1: Inward — center to hex (Manhattan, 90° only) ===
  const inwardPaths = Array.from({ length: lineCount }, (_, idx) => {
    // Spread arrival points across the hex face nearest to center
    const frac = (idx / (lineCount - 1)) - 0.5; // -0.5 to 0.5
    const perpAngle = baseA + Math.PI / 2;
    const spread = hex * 0.6;
    const arrX = hx + Math.cos(perpAngle) * spread * frac;
    const arrY = hy + Math.sin(perpAngle) * spread * frac;

    // Slight random offset on departure from center
    const depOff = (rng() - 0.5) * 12 * scaleFactor;
    const depPerpAngle = baseA + Math.PI / 2;
    const depX = cx + Math.cos(depPerpAngle) * depOff;
    const depY = cy + Math.sin(depPerpAngle) * depOff;

    const horizontalFirst = rng() > 0.5;
    return {
      d: manhattanPath(depX, depY, arrX, arrY, horizontalFirst),
      strokeWidth: 0.6 + rng() * 1.2,
      opacity: 0.25 + rng() * 0.2,
    };
  });

  // === PHASE 2: Outward — circuit traces from hex faces ===
  const faces = getHexFaces(hx, hy, hex, hexH);
  const outwardPaths = [];

  faces.forEach((face, faceIdx) => {
    // Random number of traces per face (0–3), weighted so most faces get something
    const traceCount = rng() < 0.15 ? 0 : 1 + Math.floor(rng() * 3);

    for (let t = 0; t < traceCount; t++) {
      // Pick a random point along this face edge
      const frac = 0.1 + rng() * 0.8;
      const startX = face.v0[0] + (face.v1[0] - face.v0[0]) * frac;
      const startY = face.v0[1] + (face.v1[1] - face.v0[1]) * frac;

      const d = buildCircuitTrace(startX, startY, face.angle, bounds, rng, scaleFactor);
      outwardPaths.push({
        d,
        strokeWidth: 0.5 + rng() * 1.1,
        opacity: 0.28 + rng() * 0.25,
      });
    }
  });

  return { inwardPaths, outwardPaths };
}

function SectionLines({ sectionIdx, cx, cy, radius, hex, hexH, lineCount, scaleFactor, bounds, activationSeed, isLeaving, blur }) {
  // Compute paths once when this component mounts (new seed = new random layout each activation)
  const { inwardPaths, outwardPaths } = useMemo(
    () => buildSectionPaths(sectionIdx, cx, cy, radius, hex, hexH, lineCount, scaleFactor, bounds, activationSeed),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activationSeed] // intentionally only re-run when activationSeed changes
  );

  const pathLength = isLeaving ? 0 : 1;
  const inDur  = 0.55;
  const outDur = 0.38;
  const inDelay  = 0;
  const outDelay = 0;

  return (
    <g>
      {/* Inward traces draw first, then outward after slight delay */}
      {inwardPaths.map((line, idx) => (
        <motion.path
          key={`in-${idx}`}
          d={line.d}
          fill="none"
          stroke="white"
          strokeWidth={line.strokeWidth}
          opacity={line.opacity}
          filter="url(#active-glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength }}
          transition={{ duration: isLeaving ? outDur : inDur, delay: isLeaving ? outDelay : inDelay, ease: 'easeOut' }}
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
          filter="url(#active-glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength }}
          transition={{ duration: isLeaving ? outDur : 0.75, delay: isLeaving ? outDelay : 0.25, ease: 'easeOut' }}
        />
      ))}
    </g>
  );
}

export default function Nexus({ activeSection, onSelect }) {
  const [layout, setLayout] = useState(() => getLayout(typeof window !== 'undefined' ? window.innerWidth : 1000));
  const [hoveredId, setHoveredId] = useState(null);
  const [mountedSections, setMountedSections]   = useState(new Set());
  const [leavingSections, setLeavingSections]   = useState(new Set());
  // Each activation gets a new seed so paths are freshly random every time
  const [activationSeeds, setActivationSeeds]   = useState({});
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
      }, 520);
    }

    if (next) {
      // New random seed every activation = fresh random circuit layout
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
  const hexH = Math.round(hex * 1.15);
  const cx   = size / 2;
  const cy   = size / 2;
  const brandPink = '#E01880';

  // Safe bounds for circuit traces — inset from SVG edges to avoid overlapping UI
  // The SVG is size×size. On desktop the Nexus has my-[-25px] so we add some padding.
  const padding = 18 * scaleFactor;
  const bounds = useMemo(() => ({
    minX: padding,
    maxX: size - padding,
    minY: padding + (isMobile ? 0 : 30 * scaleFactor),  // clear header overlap
    maxY: size - padding - (isMobile ? 0 : 30 * scaleFactor), // clear button overlap
  }), [size, padding, scaleFactor, isMobile]);

  // Hex geometry reused across layers
  const hexData = useMemo(() => SECTIONS.map((s, i) => {
    const a  = ((i * 60) - 120) * (Math.PI / 180);
    const hx = cx + radius * Math.cos(a);
    const hy = cy + radius * Math.sin(a);
    const points = `${hx},${hy-hexH/2} ${hx+hex/2},${hy-hexH/4} ${hx+hex/2},${hy+hexH/4} ${hx},${hy+hexH/2} ${hx-hex/2},${hy+hexH/4} ${hx-hex/2},${hy-hexH/4}`;
    return { hx, hy, points };
  }), [cx, cy, radius, hex, hexH]);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>

      {/* ── CIRCUIT LINES — z-[1], behind everything ── */}
      <svg className="absolute inset-0 w-full h-full overflow-visible z-[1]"
           style={{ clipPath: `inset(${padding}px)` }}>
        <defs>
          <filter id="circuit-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={blur} result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {SECTIONS.map((s, i) => {
          if (isMobile) {
            // Mobile: instant show/hide, zero animation
            if (activeSection !== s.id) return null;
            return (
              <g key={`lines-${s.id}`} filter="url(#circuit-glow)">
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
              sectionIdx={i}
              cx={cx} cy={cy} radius={radius} hex={hex} hexH={hexH}
              lineCount={lineCount} scaleFactor={scaleFactor}
              bounds={bounds} activationSeed={seed}
              isLeaving={leavingSections.has(s.id)}
              blur={blur}
            />
          );
        })}
      </svg>

      {/* ── HEX POLYGONS — z-[10] ── */}
      <svg className="absolute inset-0 w-full h-full overflow-visible z-[10] pointer-events-none">
        {SECTIONS.map((s, i) => (
          <motion.polygon
            key={`poly-${s.id}`}
            points={hexData[i].points}
            fill={hoveredId === s.id ? 'white' : brandPink}
            stroke={activeSection === s.id ? 'white' : '#4A0000'}
            strokeWidth={activeSection === s.id ? 4 : 2}
          />
        ))}
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