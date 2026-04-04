import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, Github, Mail, FileDown, ArrowUp } from 'lucide-react';
import ParticleField from '../components/ParticleField';
import Nexus from '../components/Nexus';
import ContentPanel from '../components/ContentPanel';

// IMPORT LOCAL ASSET
import bgAsset from '../assets/bg.jpg';

/**
 * CUSTOM CINEMATIC SCROLL
 * Manually animates the scroll for a "slower" and more elegant feel.
 */
const smoothScrollTo = (targetY, duration = 1200) => {
  const startY = window.pageYOffset;
  const difference = targetY - startY;
  let startTime = null;

  const step = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = timestamp - startTime;
    const percent = Math.min(progress / duration, 1);
    
    // Cubic Bezier Easing (Ease In Out)
    const easing = percent < 0.5 
      ? 4 * percent * percent * percent 
      : 1 - Math.pow(-2 * percent + 2, 3) / 2;

    window.scrollTo(0, startY + difference * easing);

    if (progress < duration) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
};

function PillBtn({ href, icon: Icon, label }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-[8px] px-6 py-[12px] rounded-full border-2 text-[0.85rem] font-bold no-underline transition-all duration-200"
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
    <div className="relative inline-block cursor-default" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <h1 className="transition-colors duration-200" style={{
        fontSize: 'clamp(2rem, 7vw, 4rem)', fontWeight: 900,
        color: hovered ? '#E01880' : '#400020', 
        letterSpacing: '-0.04em', margin: 0, lineHeight: 1.0,
        fontFamily: 'var(--font-inter)',
      }}>{text}</h1>
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

export default function Home() {
  const [activeSection, setActiveSection] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelect = (id) => {
    const next = activeSection === id ? null : id;
    setActiveSection(next);
    
    if (next) {
      setTimeout(() => {
        if (contentRef.current) {
          const y = contentRef.current.getBoundingClientRect().top + window.pageYOffset - 20;
          smoothScrollTo(y, 1400); // 1.4 seconds of buttery smooth travel
        }
      }, 1000); 
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-white">
      <div className="fixed inset-0 z-0 bg-cover bg-center opacity-100" style={{ backgroundImage: `url(${bgAsset})` }} />
      <div className="fixed inset-0 z-[1] bg-gradient-to-b from-white/20 via-transparent to-white/40 pointer-events-none" />
      <div className="fixed inset-0 z-50 pointer-events-none border-4 border-[#E01880]/30 animate-border-pulse" />
      <ParticleField />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8 gap-6">
        <motion.div className="text-center flex flex-col items-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <GlitchName />
          <p className="mt-6 mb-4 text-[1.1rem] font-mono text-black font-black tracking-[0.25em] uppercase">Program and Data Manager</p>
          <p className="mx-auto text-[1.1rem] text-[#1A0010] font-extrabold italic max-w-[700px] leading-relaxed font-inter bg-white/60 backdrop-blur-md p-4 rounded-xl border border-white/60 shadow-xl">
            "Turning complex data into decisive action."
          </p>
        </motion.div>

        <Nexus activeSection={activeSection} onSelect={handleSelect} />

        <div className="flex gap-4 flex-wrap justify-center mt-8">
          <PillBtn href="https://www.linkedin.com/in/lancelotnk/" icon={Linkedin} label="LinkedIn" />
          <PillBtn href="https://github.com/lancelot-nk" icon={Github} label="GitHub" />
          <PillBtn href="mailto:lancelotsmnk@gmail.com" icon={Mail} label="Contact" />
        </div>
      </div>

      <div ref={contentRef} className="relative z-10">
        <ContentPanel activeSection={activeSection} />
      </div>

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => smoothScrollTo(0, 1000)}
            className="fixed bottom-8 right-8 z-[100] w-14 h-14 rounded-full border-2 border-[#E01880] bg-white text-[#E01880] shadow-xl flex items-center justify-center"
          >
            <ArrowUp size={28} strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}