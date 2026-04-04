import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ProjectsSection from './sections/ProjectsSection';
import ResumeSection from './sections/ResumeSection';
import DashboardsSection from './sections/DashboardsSection';
import DesignSection from './sections/DesignSection';
import PublicationsSection from './sections/PublicationsSection';
import CertificationsSection from './sections/CertificationsSection';

const SECTIONS = {
  projects:      { title: 'Projects',             Component: ProjectsSection },
  resume:        { title: 'Resume',                Component: ResumeSection },
  dashboards:    { title: 'Dashboards',            Component: DashboardsSection },
  design:        { title: 'Graphic Design',         Component: DesignSection },
  publications:  { title: 'Publications & Grants',  Component: PublicationsSection },
  certifications: { title: 'Certifications',        Component: CertificationsSection },
};

const PINK = '#E01880';

export default function ContentPanel({ activeSection }) {
  // We keep the internal scroll reset light to avoid jumping
  useEffect(() => {
    if (!activeSection) return;
  }, [activeSection]);

  const ActiveComponent = SECTIONS[activeSection]?.Component;
  const activeTitle = SECTIONS[activeSection]?.title;

  return (
    <AnimatePresence mode="wait">
      {activeSection && ActiveComponent && (
        <motion.div
          key={activeSection}
          role="region"
          aria-label={activeTitle}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ 
            duration: 0.5, 
            ease: [0.16, 1, 0.3, 1] // Custom quint ease for a premium feel
          }}
          className="relative w-full"
          style={{ 
            paddingBottom: '8rem', 
            background: 'rgba(255,255,255,0.65)', 
            backdropFilter: 'blur(20px)', 
            borderTop: '1px solid rgba(224,24,128,0.12)',
            minHeight: '70vh',
            zIndex: 20
          }}
        >
          {/* Section Header with Decorative Gradient Lines */}
          <div className="flex items-center gap-6 max-w-[1040px] mx-auto px-6 py-12">
            <div 
              className="flex-1 h-[1px]" 
              style={{ background: `linear-gradient(to right, transparent, ${PINK}50)` }} 
            />
            
            <motion.h2 
              initial={{ letterSpacing: '0.2em', opacity: 0 }}
              animate={{ letterSpacing: '0.4em', opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="font-mono text-[0.7rem] uppercase font-bold whitespace-nowrap m-0"
              style={{ 
                color: PINK, 
                fontFamily: 'var(--font-mono)',
              }}
            >
              {activeTitle}
            </motion.h2>
            
            <div 
              className="flex-1 h-[1px]" 
              style={{ background: `linear-gradient(to left, transparent, ${PINK}50)` }} 
            />
          </div>

          {/* Component Injection Site */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="max-w-[1040px] mx-auto px-6"
          >
            <ActiveComponent />
          </motion.div>

          {/* Subtle Bottom Accent */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-[#E01880]/20 to-transparent" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}