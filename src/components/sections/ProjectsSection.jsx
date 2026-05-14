import { useState, lazy, Suspense } from 'react';
import { ChevronDown, ChevronUp, Code, Clock, ExternalLink } from 'lucide-react';
import JsxViewer from '../JsxViewer';

// Lazy-load heavy viewers only when first expanded
const IpynbViewer          = lazy(() => import('../IpynbViewer'));
const LazyPrimeFields      = lazy(() => import('../../projects/PrimeFields'));
const LazyInterestSwap     = lazy(() => import('../../projects/InterestSwapReport'));
const LazyMockHRA          = lazy(() => import('../../projects/MockHRA'));
const LazyOilTrainRisk     = lazy(() => import('../../projects/OilTrainRiskDC'));

// ── Image Imports ────────────────────────────────────────────────────────────
import img1 from '../../assets/project1.jpg';
import img2 from '../../assets/project2.jpg';
import img3 from '../../assets/project3.jpg';
import img4 from '../../assets/project4.jpg';
import img5 from '../../assets/project_prime_fields.png';
import img6 from '../../assets/project_interest_swap.jpg';
import img7 from '../../assets/project_mock_hra.jpg';
import img8 from '../../assets/project_oil_train.jpg';

// ── Brand Colors ─────────────────────────────────────────────────────────────
const PINK   = '#B8004E';
const VIOLET = '#5800B8';
const DEEP   = '#0F001E';
const MID    = '#320040';
const SOFT   = '#6A0A50';
const BORDER = 'rgba(184,0,78,0.22)';

export const PROJECTS = [
  {
    title: 'Python & Statistics Analysis',
    desc: 'Data analysis over a restaurant industry dataset applying statistical methods, data cleaning, and Python visualization.',
    tech: ['Python', 'Pandas', 'NumPy', 'Seaborn', 'Statistics'],
    link: '/PythonAndStats_LancelotNK.ipynb',
    img: img1,
  },
  {
    title: 'ML Recommendation System',
    desc: 'Machine learning model over an Amazon item dataset applying model tuning, Scikit-Learn pipelines, and evaluation metrics.',
    tech: ['Python', 'Scikit-Learn', 'ML', 'Model Tuning', 'Jupyter'],
    link: '/LancelotNaipierKaneRecommendationSystemsFullLearnerNotebookComplete%20(1).ipynb',
    img: img2,
  },
  {
    title: 'AI Music Recommendation',
    desc: 'AI-driven hybrid SVD system for music recommendation over a large dataset, applying deep learning and collaborative filtering.',
    tech: ['Python', 'AI', 'SVD', 'Deep Learning', 'NLP'],
    link: '/LancelotNaipierKane_Music_Recommendation_System_Full_Code%20(2).ipynb',
    img: img3,
  },
  {
    title: 'Azure SQL & Cloud Integration',
    desc: 'Hybrid BLOB storage architecture with Azure SQL and NoSQL over a Kaggle sales dataset, applying cloud ETL and data lake design.',
    tech: ['Azure', 'SQL', 'NoSQL', 'Blob Storage', 'ETL'],
    link: '/LancelotNaipierKaneAzureSqlNotebook.ipynb',
    img: img4,
  },
  {
    title: 'Prime Field Functions',
    desc: 'Interactive explorer for ζ-weighted functions over ordered prime pairs — scatter plot and |F| heatmap views, complex plane analysis.',
    tech: ['React', 'Recharts', 'Complex Analysis', 'Number Theory', 'Visualization'],
    link: '/prime_fields.jsx',
    type: 'jsx',
    component: LazyPrimeFields,
    img: img5,
  },
  {
    title: 'Interest Rate Swap Report',
    desc: 'Data-driven analysis of university interest rate swap losses post-2008 — LIBOR collapse, tuition impacts, and institutional timelines.',
    tech: ['React', 'Recharts', 'Finance', 'Data Analysis', 'Policy Research'],
    link: '/interest_swap_report.jsx',
    type: 'jsx',
    component: LazyInterestSwap,
    img: img6,
  },
  {
    title: 'Mock NYC HRA SNAP System',
    desc: 'Simulated NYC Human Resources Administration intake & case management — SNAP eligibility determination, pipeline kanban, and compliance analytics.',
    tech: ['React', 'Tailwind', 'Social Policy', 'Government Systems', 'Data Simulation'],
    link: '/mock_hra.jsx',
    type: 'jsx',
    component: LazyMockHRA,
    img: img7,
  },
  {
    title: 'DC Oil Train Environmental Risk',
    desc: 'Government-grade risk analysis of crude-by-rail corridors through DC — interactive SVG map, waterway impact zones, population density, and regulatory compliance matrix.',
    tech: ['React', 'SVG Maps', 'Environmental Policy', 'Rail Safety', 'Government Analysis'],
    link: '/oil_train_risk_dc.jsx',
    type: 'jsx',
    component: LazyOilTrainRisk,
    img: img8,
  },
];

const COMING_SOON = [
  { title: 'Coming Soon', desc: 'New project in development — check back soon.', tech: [] },
];

function NotebookFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem', gap: 10 }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${BORDER}`, borderTopColor: PINK, animation: 'ps-spin 0.7s linear infinite' }} />
      <span style={{ fontSize: '0.82rem', fontFamily: 'JetBrains Mono, monospace', color: SOFT }}>Loading notebook…</span>
      <style>{`@keyframes ps-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ProjectTile({ project, i }) {
  const [open, setOpen] = useState(false);

  return (
    // ps-tile-wrap: 70% centered on desktop, full-width on mobile
    <div className="ps-tile-wrap">
      {/* ── Tile Header (always visible) ─────────────────────────────── */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '0.9rem 1.1rem', background: 'rgba(255,255,255,0.93)',
          border: `2px solid ${open ? PINK : BORDER}`,
          borderRadius: open ? '0.75rem 0.75rem 0 0' : '0.75rem',
          boxShadow: open ? `0 6px 28px rgba(184,0,78,0.13)` : '0 2px 10px rgba(15,0,30,0.05)',
          transition: 'border-color 0.2s, box-shadow 0.2s, border-radius 0.2s',
          cursor: 'pointer', textAlign: 'left',
          overflow: 'hidden',
        }}
        aria-expanded={open}
      >
        {/* Thumbnail */}
        <div className="ps-thumb" style={{
          width: 72, height: 48, borderRadius: 8,
          overflow: 'hidden', flexShrink: 0, background: DEEP,
        }}>
          {project.img && (
            <img src={project.img} alt={project.title} loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>

        {/* Title + tech */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
            <Code style={{ width: 13, height: 13, color: PINK, flexShrink: 0 }} />
            <span className="ps-title" style={{ fontSize: '0.92rem', fontWeight: 800, color: DEEP, lineHeight: 1.2 }}>
              {project.title}
            </span>
          </div>
          <p className="ps-desc" style={{ margin: 0, fontSize: '0.78rem', color: MID, lineHeight: 1.5, opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {project.desc}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
            {project.tech.map(t => (
              <span key={t} style={{
                fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase',
                fontWeight: 700, letterSpacing: '0.05em', padding: '2px 7px',
                border: `1px solid ${BORDER}`, borderRadius: 4, color: SOFT,
                background: 'rgba(106,10,80,0.06)',
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Open/close + external link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              title="Open raw notebook"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: 6, border: `1px solid ${BORDER}`,
                background: 'rgba(184,0,78,0.06)', color: PINK, textDecoration: 'none',
              }}
            >
              <ExternalLink style={{ width: 13, height: 13 }} />
            </a>
          )}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, borderRadius: 6,
            background: open ? PINK : 'rgba(184,0,78,0.07)',
            color: open ? '#fff' : PINK,
            transition: 'all 0.2s',
          }}>
            {open ? <ChevronUp style={{ width: 15, height: 15 }} /> : <ChevronDown style={{ width: 15, height: 15 }} />}
          </div>
        </div>
      </button>

      {/* ── Expanded: inline preview — viewer chosen by project.type ───── */}
      {open && project.link && (
        <div className="ps-preview-wrap">
          <div className="ps-preview-inner">
            {project.type === 'jsx'
              ? <JsxViewer LazyComponent={project.component} />
              : (
              <Suspense fallback={<NotebookFallback />}>
                <IpynbViewer src={project.link} />
              </Suspense>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

function ComingSoonTile({ i }) {
  return (
    <div className="ps-tile-wrap">
      <div style={{
        borderRadius: '0.75rem', border: `2px solid rgba(184,0,78,0.1)`,
        background: 'rgba(255,255,255,0.5)', overflow: 'hidden',
        opacity: 0.6, display: 'flex', alignItems: 'center', gap: 14,
        padding: '0.9rem 1.1rem',
      }}>
        <div style={{ width: 72, height: 48, borderRadius: 8, background: 'rgba(184,0,78,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Clock style={{ width: 20, height: 20, color: 'rgba(184,0,78,0.2)' }} />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: MID }}>Coming Soon</p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: SOFT, opacity: 0.7 }}>New project in development — check back soon.</p>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsSection() {
  return (
    <>
      {/* ── Responsive layout styles ─────────────────────────────────── */}
      <style>{`
        /* Break out of ContentPanel's max-w-[1040px] px-6 container.
           ContentPanel uses px-6 (1.5rem each side), so -1.5rem cancels it.
           Then we add our own small padding so tiles don't kiss the viewport edge. */
        .ps-outer {
          margin-left: -1.5rem;
          margin-right: -1.5rem;
          padding-left: 1rem;
          padding-right: 1rem;
        }
        .ps-tile-wrap {
          width: 100%;
        }
        /* Desktop: also escape the 1040px cap via a wide max-width */
        @media (min-width: 768px) {
          .ps-outer {
            /* Push the content panel's own max-width aside by allowing full viewport.
               Since ContentPanel centres itself, we use a viewport-relative trick. */
            margin-left: calc(-50vw + 50%);
            margin-right: calc(-50vw + 50%);
            width: 100vw;
            padding-left: clamp(1rem, 2vw, 2rem);
            padding-right: clamp(1rem, 2vw, 2rem);
          }
          /* Tile + its dropdown share the same 70%-wide centered container */
          .ps-tile-wrap {
            width: 70%;
            margin-left: auto;
            margin-right: auto;
          }
        }

        /* ── Preview container: always-visible styled scrollbar ─────────── */
        .ps-preview-wrap {
          overflow-x: hidden;
          overflow-y: auto;
          max-height: 72vh;
          border-top: 1px solid ${BORDER};
          scrollbar-width: thin;
          scrollbar-color: ${PINK} ${DEEP};
        }
        .ps-preview-inner {
          padding: 0.9rem 1rem 1rem;
        }
        .ps-preview-wrap::-webkit-scrollbar { width: 12px; }
        .ps-preview-wrap::-webkit-scrollbar-track {
          background: ${DEEP};
          border-radius: 6px;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02);
        }
        .ps-preview-wrap::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, ${PINK} 0%, ${VIOLET} 100%);
          border-radius: 6px;
          border: 3px solid ${DEEP};
          box-shadow: inset 0 0 8px rgba(0,0,0,0.35);
        }
        .ps-preview-wrap::-webkit-scrollbar-thumb:hover { filter: brightness(1.08); }

        /* Desktop: 20% taller preview container (expanded by 20%) */
        @media (min-width: 641px) {
          .ps-preview-wrap { max-height: min(100vh, calc(86vh * 1.2)); }
          .ps-preview-inner { padding: 1rem 1.25rem 1.25rem; }
        }

        /* Mobile: scale preview content down so it fits without horizontal scroll */
        @media (max-width: 640px) {
          .ps-preview-wrap {
            overflow-x: hidden;
            max-height: 65vh;
          }
          .ps-preview-wrap > * {
            transform: scale(0.82);
            transform-origin: top left;
            width: calc(100% / 0.82);
            overflow-y: visible;
            overflow-x: hidden;
          }

          /* Title: clamp to 2 lines, shrink font to fit tile height */
          .ps-title {
            font-size: 0.78rem !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            white-space: normal !important;
            line-height: 1.25 !important;
          }

          /* Keep description single-line ellipsis on mobile too */
          .ps-desc {
            font-size: 0.72rem !important;
          }

          /* Thumbnail slightly smaller on mobile */
          .ps-thumb {
            width: 56px !important;
            height: 40px !important;
          }
        }
      `}</style>

      <div className="ps-outer" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {PROJECTS.map((p, i) => <ProjectTile key={p.title} project={p} i={i} />)}

        <div style={{
          height: 1,
          background: `linear-gradient(to right, transparent, ${BORDER}, transparent)`,
          margin: '0.5rem 0',
        }} />

        {COMING_SOON.map((_, i) => <ComingSoonTile key={i} i={i} />)}
      </div>
    </>
  );
}
