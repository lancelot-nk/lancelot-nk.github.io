import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, Github, Mail, FileDown, ArrowUp } from 'lucide-react';
import ParticleField from '../components/ParticleField';
import Nexus from '../components/Nexus';
import ContentPanel from '../components/ContentPanel';

// IMPORT LOCAL ASSET
import bgAsset from '../assets/bg.jpg';

/**
 * High-Definition, High-Contrast Pill Button
 */
function PillBtn({ href, icon: Icon, label }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-[8px] px-6 py-[12px] rounded-full border-2 text-[0.85rem] font-bold no-underline transition-all duration-200 whitespace-nowrap"
      style={{
        background: hov ? '#E01880' : 'rgba(255, 255, 255, 0.9)',
        borderColor: '#E01880',
        color: hov ? '#fff' : '#E01880',
        boxShadow: hov ? '0 0 25px rgba(224, 24, 128, 0.5)' : 'none',
        fontFamily: 'var(--font-inter)',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <Icon size={18} className="flex-shrink-0" />
      {label}
    </a>
  );
}

function GlitchName() {
  const [hovered, setHovered] = useState(false);
  const text = "Lancelot Naipier-Kane";
  return (
    <div
      className="relative inline-block cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <h1 className="transition-colors duration-200" style={{
        fontSize: 'clamp(2rem, 7vw, 4rem)', fontWeight: 900,
        color: hovered ? '#E01880' : '#400020', 
        letterSpacing: '-0.04em', margin: 0, lineHeight: 1.0,
        fontFamily: 'var(--font-inter)',
      }}>
        {text}
      </h1>
      {hovered && (
        <>
          <h1 aria-hidden className="absolute top-0 left-0 w-full animate-glitch mix-blend-multiply pointer-events-none" style={{
            fontSize: 'clamp(2rem, 7vw, 4rem)', fontWeight: 900,
            color: '#8B00E8', letterSpacing: '-0.04em', margin: 0, lineHeight: 1.0,
            fontFamily: 'var(--font-inter)',
          }}>{text}</h1>
          <h1 aria-hidden className="absolute top-0 left-0 w-full animate-glitch mix-blend-multiply pointer-events-none translate-x-[3px]" style={{
            fontSize: 'clamp(2rem, 7vw, 4rem)', fontWeight: 900,
            color: '#FF3366', letterSpacing: '-0.04em', margin: 0, lineHeight: 1.0,
            fontFamily: 'var(--font-inter)',
            animationDelay: '0.1s'
          }}>{text}</h1>
        </>
      )}
    </div>
  );
}

function CertBadge({ label, color }) {
  return (
    <span className="inline-flex items-center gap-1 px-[12px] py-[6px] rounded-full border-2 shadow-sm" style={{
      fontSize: '0.7rem', fontFamily: 'var(--font-mono)',
      fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
      borderColor: color,
      background: '#FFFFFF', 
      color,
    }}>
      ✦ {label}
    </span>
  );
}

export default function Home() {
  const [activeSection, setActiveSection] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const contentRef = useRef(null);

  // Monitor scroll for Back to Top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * HEXAGON SELECT LOGIC
   * Includes a 600ms delay to allow Nexus dendrites to complete 
   * their animation before smooth scrolling down to content.
   */
  const handleSelect = (id) => {
    const next = activeSection === id ? null : id;
    setActiveSection(next);
    
    if (next) {
      setTimeout(() => {
        contentRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 600); // Syncs with the Nexus.jsx path animation duration
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-white">
      
      {/* BACKGROUND LAYER: 100% Opacity, NO Blur */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center opacity-100" 
        style={{ backgroundImage: `url(${bgAsset})` }} 
      />
      
      {/* SHARP OVERLAY */}
      <div className="fixed inset-0 z-[1] bg-gradient-to-b from-white/20 via-transparent to-white/40 pointer-events-none" />
      
      {/* VIBRANT BORDER */}
      <div className="fixed inset-0 z-50 pointer-events-none border-4 border-[#E01880]/30 animate-border-pulse" />

      <ParticleField />

      {/* Main UI */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8 gap-6">
        
        <motion.div className="text-center flex flex-col items-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <GlitchName />
          
          <div className="flex gap-4 justify-center flex-wrap my-6">
            <CertBadge label="MIT Certified" color="#A31F34" />
            <CertBadge label="Microsoft Certified" color="#0078D4" />
          </div>

          {/* Title: Black, Sharp, Sub-header size */}
          <p className="mb-4 text-[1.1rem] md:text-[1.3rem] font-mono text-black font-black tracking-[0.25em] uppercase leading-tight">
            Program and Data Manager
          </p>

          {/* Quote: Vibrant, Larger, High-Visibility Background */}
          <p className="mx-auto text-[clamp(1rem,2.8vw,1.2rem)] text-[#1A0010] font-extrabold italic max-w-[700px] leading-relaxed font-inter bg-white/60 backdrop-blur-md p-4 rounded-xl border border-white/60 shadow-xl">
            "Turning complex data into decisive action — from $7.6B budgets to AI-driven systems, I architect solutions that move organizations forward."
          </p>
        </motion.div>

        <Nexus activeSection={activeSection} onSelect={handleSelect} />

        <motion.div
          className="flex gap-4 flex-wrap justify-center mt-8"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
        >
          <PillBtn href="https://www.linkedin.com/in/lancelotnk/" icon={Linkedin} label="LinkedIn" />
          <PillBtn href="https://github.com/lancelot-nk" icon={Github} label="GitHub" />
          <PillBtn href="mailto:lancelotsmnk@gmail.com" icon={Mail} label="Contact" />
          <PillBtn href="/resume.pdf" icon={FileDown} label="Resume" />
        </motion.div>
      </div>

      {/* Content Container Target for Smooth Scroll */}
      <div ref={contentRef} className="relative z-10">
        <ContentPanel activeSection={activeSection} />
      </div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-[100] w-14 h-14 rounded-full border-2 border-[#E01880] bg-white flex items-center justify-center text-[#E01880] shadow-[0_0_20px_rgba(224,24,128,0.3)] hover:bg-[#E01880] hover:text-white transition-all duration-300"
          >
            <ArrowUp size={28} strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>

      <footer className="relative z-10 text-center py-12 px-4 border-t-4 border-[#E01880] bg-white">
        <p className="text-[0.85rem] font-mono text-black font-black tracking-widest uppercase">
          © {new Date().getFullYear()} LANCELOT NAIPIER-KANE // NEW YORK CITY
        </p>
      </footer>
    </div>
  );
}