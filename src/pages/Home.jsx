import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, Github, Mail, ArrowUp, FileDown } from 'lucide-react';
import ParticleField from '../components/ParticleField';
import Nexus from '../components/Nexus';
import ContentPanel from '../components/ContentPanel';

// ASSETS
import bgAsset from '../assets/bg.jpg';

const smoothScrollTo = (targetY, duration = 2000) => {
  const startY = window.pageYOffset;
  const difference = targetY - startY;
  let startTime = null;

  const step = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = timestamp - startTime;
    const percent = Math.min(progress / duration, 1);
    const easing = percent < 0.5 
      ? 4 * percent * percent * percent 
      : 1 - Math.pow(-2 * percent + 2, 3) / 2;

    window.scrollTo(0, startY + difference * easing);
    if (progress < duration) window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
};

function GlitchText({ text, fontSize, letterSpacing = 'normal', color = '#1A0010' }) {
  return (
    <div className="relative inline-block group cursor-default" style={{ color, fontSize, letterSpacing, fontWeight: 900, fontFamily: 'var(--font-inter)', lineHeight: 1.1 }}>
      <span className="relative z-10">{text}</span>
      <span className="absolute top-0 left-0 -translate-x-[2px] -translate-y-[2px] text-[#ff0080] opacity-0 group-hover:opacity-70 group-hover:animate-glitch-1 z-0">{text}</span>
      <span className="absolute top-0 left-0 translate-x-[2px] translate-y-[2px] text-[#00ffff] opacity-0 group-hover:opacity-70 group-hover:animate-glitch-2 z-0">{text}</span>
    </div>
  );
}

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

  const scrollToContent = () => {
    setTimeout(() => {
      if (contentRef.current) {
        const y = contentRef.current.getBoundingClientRect().top + window.pageYOffset - 20;
        smoothScrollTo(y, 2000); 
      }
    }, 3000); 
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
        scrollToContent();
      }, 800);
    } else {
      setActiveSection(id);
      scrollToContent();
    }
  };

  const triggerResume = () => handleSelect('resume');

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-white">
      <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgAsset})` }} />
      <ParticleField />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8 gap-4">
        <motion.div className="text-center flex flex-col items-center w-full" 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          
          <GlitchText 
            text="Lancelot Naipier-Kane" 
            fontSize="clamp(1.8rem, 8vw, 4.5rem)" 
            letterSpacing="-0.05em" 
          />

          <div className="flex gap-2 mt-3 mb-3 flex-wrap justify-center">
            <CertBadge label="MIT Certified" color="#A31F34" />
            <CertBadge label="Microsoft Certified" color="#00A4EF" />
            <CertBadge label="Google Certified" color="#34A853" />
          </div>

          <div className="hover:scale-105 transition-transform duration-300">
            <GlitchText 
              text="Program and Data Manager" 
              fontSize="clamp(0.85rem, 3vw, 1.1rem)" 
              letterSpacing="0.3em"
              color="#000"
            />
          </div>

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
          <PillBtn onClick={triggerResume} icon={FileDown} label="Resume" />
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