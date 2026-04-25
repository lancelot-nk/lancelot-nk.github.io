import { useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Lazy-load all heavy section components so they don't block initial render
const ProjectsSection      = lazy(() => import('./sections/ProjectsSection'));
const ResumeSection        = lazy(() => import('./sections/ResumeSection'));
const DashboardsSection    = lazy(() => import('./sections/DashboardsSection'));
const DesignSection        = lazy(() => import('./sections/DesignSection'));
const PublicationsSection  = lazy(() => import('./sections/PublicationsSection'));
const CertificationsSection = lazy(() => import('./sections/CertificationsSection'));

const SECTIONS = {
  projects:      { title: 'Projects',             Component: ProjectsSection },
  resume:        { title: 'Resume',                Component: ResumeSection },
  dashboards:    { title: 'Dashboards',            Component: DashboardsSection },
  design:        { title: 'Graphic Design',         Component: DesignSection },
  publications:  { title: 'Publications & Grants',  Component: PublicationsSection },
  certifications: { title: 'Certifications',        Component: CertificationsSection },
};

// Minimal loading placeholder - no spinning animations to reduce jank
function SectionLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '30vh', gap: 10 }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%',
        border: '2px solid rgba(224,24,128,0.2)',
        borderTopColor: '#E01880',
        animation: 'cp-spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes cp-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const PINK = '#E01880';

// Detect low-end device: skip backdrop-filter which is very GPU-heavy on Intel Macs
function isLowEndDevice() {
  if (typeof navigator === 'undefined') return false;
  const cores = navigator.hardwareConcurrency || 4;
  const dpr = window.devicePixelRatio || 1;
  // Intel Macs with dpr=2 and few cores, or any device with ≤2 cores
  return cores <= 4 && dpr <= 1;
}

export default function ContentPanel({ activeSection }) {
  const ActiveComponent = SECTIONS[activeSection]?.Component;
  const activeTitle = SECTIONS[activeSection]?.title;
  const lowEnd = isLowEndDevice();

  return (
    <AnimatePresence mode="wait">
      {activeSection && ActiveComponent && (
        <motion.div
          key={activeSection}
          role="region"
          aria-label={activeTitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ 
            duration: 0.35, 
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative w-full"
          style={{ 
            paddingBottom: '8rem',
            // Skip expensive backdrop-filter on low-end devices
            background: lowEnd ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.82)',
            backdropFilter: lowEnd ? 'none' : 'blur(16px)',
            WebkitBackdropFilter: lowEnd ? 'none' : 'blur(16px)',
            borderTop: '1px solid rgba(224,24,128,0.12)',
            minHeight: '70vh',
            zIndex: 20,
            // GPU-composite this layer once, don't repaint on scroll
            willChange: 'opacity, transform',
            contain: 'layout style',
          }}
        >
          {/* Section Header */}
          <div className="flex items-center gap-6 max-w-[1040px] mx-auto px-6 py-10">
            <div className="flex-1 h-[1px]" style={{ background: `linear-gradient(to right, transparent, ${PINK}50)` }} />
            <h2 className="font-mono text-[0.7rem] uppercase font-bold whitespace-nowrap m-0" style={{ color: PINK, letterSpacing: '0.4em', fontFamily: 'var(--font-mono)' }}>
              {activeTitle}
            </h2>
            <div className="flex-1 h-[1px]" style={{ background: `linear-gradient(to left, transparent, ${PINK}50)` }} />
          </div>

          {/* Lazy-loaded section — Suspense gives graceful fallback */}
          <div className="max-w-[1040px] mx-auto px-6">
            <Suspense fallback={<SectionLoader />}>
              <ActiveComponent />
            </Suspense>
          </div>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-[#E01880]/20 to-transparent" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}