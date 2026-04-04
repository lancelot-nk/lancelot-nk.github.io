import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ProjectsSection from './sections/ProjectsSection';
import ResumeSection from './sections/ResumeSection';
import DashboardsSection from './sections/DashboardsSection';
import DesignSection from './sections/DesignSection';
import PublicationsSection from './sections/PublicationsSection';
import CertificationsSection from './sections/CertificationsSection';

const SECTIONS = {
  projects:      { title: 'Projects',               Component: ProjectsSection },
  resume:        { title: 'Resume',                 Component: ResumeSection },
  dashboards:    { title: 'Dashboards',             Component: DashboardsSection },
  design:        { title: 'Graphic Design',         Component: DesignSection },
  publications:  { title: 'Publications & Grants',  Component: PublicationsSection },
  certifications: { title: 'Certifications',        Component: CertificationsSection },
};

const PINK = '#E01880';

export default function ContentPanel({ activeSection }) {
  // Reset scroll position within the panel when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ 
            paddingBottom: '5rem', 
            background: 'rgba(255,255,255,0.6)', 
            backdropFilter: 'blur(16px)', 
            borderTop: '1px solid rgba(224,24,128,0.12)',
            minHeight: '60vh'
          }}
        >
          {/* Section Header with Decorative Lines */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.5rem', 
            maxWidth: 1040, 
            margin: '0 auto', 
            padding: '2rem 1.5rem 1.5rem' 
          }}>
            <div style={{ 
              flex: 1, 
              height: 1, 
              background: `linear-gradient(to right, transparent, ${PINK}40)` 
            }} />
            
            <h2 style={{ 
              fontSize: '0.7rem', 
              fontFamily: 'JetBrains Mono, monospace', 
              textTransform: 'uppercase', 
              letterSpacing: '0.4em', 
              color: PINK, 
              margin: 0, 
              whiteSpace: 'nowrap',
              fontWeight: 600
            }}>
              {activeTitle}
            </h2>
            
            <div style={{ 
              flex: 1, 
              height: 1, 
              background: `linear-gradient(to left, transparent, ${PINK}40)` 
            }} />
          </div>

          {/* Dynamic Component Content */}
          <div style={{ 
            maxWidth: 1040, 
            margin: '0 auto', 
            padding: '0 1.5rem' 
          }}>
            <ActiveComponent />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}