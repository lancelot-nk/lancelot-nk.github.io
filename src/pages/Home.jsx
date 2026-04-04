import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, Github, Mail, ArrowUp, FileDown } from 'lucide-react';
import ParticleField from '../components/ParticleField';
import Nexus from '../components/Nexus';
import ContentPanel from '../components/ContentPanel';

// ASSETS
import bgAsset from '../assets/bg.jpg';

const PINK = '#E01880';
const VIOLET = '#8B00E8';

/**
 * ORIGINAL GLITCH COMPONENT
 * Restored exactly as requested with multiply blend mode and staggered timing.
 */
function GlitchText({ text, className, style }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <div
      className={`relative inline-block cursor-default ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <h1 style={{
        ...style,
        color: hovered ? PINK : (style.color || '#1A0010'),
        transition: 'color 0.2s',
        position: 'relative',
        zIndex: 10
      }}>
        {text}
      </h1>
      {hovered && (
        <>
          {/* Violet Layer */}
          <h1 aria-hidden style={{
            ...style,
            position: 'absolute', top: 0, left: 0, width: '100%',
            color: VIOLET,
            animation: 'glitch 0.4s steps(1) infinite',
            mixBlendMode: 'multiply', pointerEvents: 'none',
            zIndex: 5
          }}>{text}</h1>
          
          {/* Red/Pink Offset Layer */}
          <h1 aria-hidden style={{
            ...style,
            position: 'absolute', top: 0, left: 0, width: '100%',
            color: '#FF3366',
            animation: 'glitch 0.4s steps(1) infinite 0.1s',
            mixBlendMode: 'multiply', pointerEvents: 'none',
            transform: 'translateX(3px)',
            zIndex: 5
          }}>{text}</h1>
        </>
      )}
    </div>
  );
}

const smoothScrollTo = (targetY, duration = 2000) => {
  const startY = window.pageYOffset;
  const difference = targetY - startY;
  let startTime = null;
  const step = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = timestamp - startTime;
    const percent = Math.min(progress / duration, 1);
    const easing = percent < 0.5 ? 4 * percent * percent * percent : 1 - Math.pow(-2 * percent + 2, 3) / 2;
    window.scrollTo(0, startY + difference * easing);
    if (progress < duration) window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
};

function CertBadge({ label, color }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full border-2 font-mono text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-white/90 shadow-sm"
      style={{ borderColor: color, color: color }}>
      <span>✦</span>{label}
    </div>
  );
}

function PillBtn({ href, icon: Icon, label, onClick }) {
  const [hov, setHov] = useState(false);
  const Tag = onClick ? 'button' : 'a';
  return (
    <Tag
      href={onClick ? undefined : href}
      onClick={onClick}
      target={onClick ? undefined : "_blank"}
      rel={onClick ? undefined : "noopener noreferrer"}
      className="inline-flex items-center gap-[8px] px-6 py-[12px] rounded-full border-2 text-[0.85rem] font-bold no-underline transition-all duration-200 cursor-pointer"
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
    </Tag>
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

  const triggerScroll = (delay) => {
    setTimeout(() => {
      if (contentRef.current) {
        const y = contentRef.current.getBoundingClientRect().top + window.pageYOffset - 20;
        smoothScrollTo(y, 2000); 
      }
    }, delay);
  };

  const handleSelect = (id) => {
    if (activeSection === id) {
      setActiveSection(null);
      return;
    }
    if (activeSection !== null) {
      setActiveSection(null);
      setTimeout(() => {
        setActiveSection(id);
        triggerScroll(2000); 
      }, 800); 
    } else {
      setActiveSection(id);
      triggerScroll(1500);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-white">
      <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgAsset})` }} />
      <ParticleField />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8 gap-4">
        <motion.div className="text-center flex flex-col items-center w-full" 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          
          {/* RESTORED NAME GLITCH */}
          <GlitchText 
            text="Lancelot Naipier-Kane"
            style={{
              fontSize: 'clamp(1.8rem, 8vw, 4.5rem)',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              lineHeight: 1.1,
              fontFamily: 'Inter, sans-serif'
            }}
          />

          <div className="flex gap-2 mt-3 mb-3 flex-wrap justify-center">
            <CertBadge label="MIT Certified" color="#A31F34" />
            <CertBadge label="Microsoft Certified" color="#00A4EF" />
            <CertBadge label="Google Certified" color="#34A853" />
          </div>

          {/* RESTORED TITLE GLITCH */}
          <GlitchText 
            text="Program and Data Manager"
            style={{
              fontSize: 'clamp(0.85rem, 3vw, 1.1rem)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 900,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#000000'
            }}
          />

          <div className="mt-4 mx-auto max-w-[750px] bg-white/70 backdrop-blur-xl p-5 rounded-2xl border border-white/80 shadow-2xl">
            <p className="text-[0.95rem] sm:text-[1.1rem] text-[#1A0010] font-extrabold italic leading-relaxed font-inter">
              "Turning complex data into decisive action — from $7.6B budgets to AI-driven systems, I architect solutions that move organizations forward."
            </p>
          </div>
        </motion.div>

        <div className="my-[-25px]"> 
          <Nexus activeSection={activeSection} onSelect={handleSelect} />
        </div>

        <div className="flex gap-4 flex-wrap justify-center mt-[-15px]">
          <PillBtn href="https://www.linkedin.com/in/lancelotnk/" icon={Linkedin} label="LinkedIn" />
          <PillBtn href="https://github.com/lancelot-nk" icon={Github} label="GitHub" />
          <PillBtn href="mailto:lancelotsmnk@gmail.com" icon={Mail} label="Contact For Work" />
          <PillBtn onClick={() => handleSelect('resume')} icon={FileDown} label="Resume" />
        </div>
      </div>

      <div ref={contentRef} className="relative z-10">
        <ContentPanel activeSection={activeSection} />
      </div>

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => smoothScrollTo(0, 1500)}
            className="fixed bottom-8 right-8 z-[100] w-14 h-14 rounded-full border-2 border-[#E01880] bg-white text-[#E01880] shadow-2xl flex items-center justify-center transition-transform active:scale-90"
          >
            <ArrowUp size={28} strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}