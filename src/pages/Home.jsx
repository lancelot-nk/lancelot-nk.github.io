import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, Github, Mail, ArrowUp, FileDown } from 'lucide-react';
import ParticleField from '../components/ParticleField';
import Nexus from '../components/Nexus';
import ContentPanel from '../components/ContentPanel';

// IMPORT LOCAL ASSET
import bgAsset from '../assets/profile.jpg'; // Using profile as placeholder if bg.jpg is missing

const smoothScrollTo = (targetY, duration = 1200) => {
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

function CertBadge({ label, color }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full border-2 font-mono text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-white shadow-sm"
      style={{ borderColor: color, color: color }}>
      <span>✦</span>{label}
    </div>
  );
}

function PillBtn({ href, icon: Icon, label, onClick }) {
  const [hov, setHov] = useState(false);
  const isButton = !!onClick;
  const Tag = isButton ? 'button' : 'a';

  return (
    <Tag
      href={isButton ? undefined : href}
      onClick={onClick}
      target={isButton ? undefined : "_blank"}
      rel={isButton ? undefined : "noopener noreferrer"}
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
        smoothScrollTo(y, 1400);
      }
    }, 800);
  };

  const handleSelect = (id) => {
    const next = activeSection === id ? null : id;
    setActiveSection(next);
    if (next) scrollToContent();
  };

  const triggerResume = () => {
    setActiveSection('resume');
    scrollToContent();
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-white">
      <div className="fixed inset-0 z-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${bgAsset})` }} />
      <ParticleField />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12 gap-8">
        
        <motion.div className="text-center flex flex-col items-center w-full" 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          
          {/* 1. NAME (One line always) */}
          <h1 className="whitespace-nowrap" style={{
            fontSize: 'clamp(1.8rem, 8vw, 4.5rem)', fontWeight: 900,
            color: '#1A0010', letterSpacing: '-0.05em', margin: 0, lineHeight: 1.1,
            fontFamily: 'var(--font-inter)',
          }}>Lancelot Naipier-Kane</h1>

          {/* 2. CERT PILLS */}
          <div className="flex gap-2 mt-6 mb-6 flex-wrap justify-center">
            <CertBadge label="MIT Certified" color="#A31F34" />
            <CertBadge label="Microsoft Certified" color="#00A4EF" />
            <CertBadge label="Google Certified" color="#34A853" />
          </div>

          {/* 3. TITLE (One line always) */}
          <p className="whitespace-nowrap text-[0.8rem] sm:text-[1.2rem] font-mono text-black font-black tracking-[0.15em] sm:tracking-[0.3em] uppercase">
            Program and Data Manager
          </p>

          {/* 4. QUOTE */}
          <div className="mt-6 mx-auto max-w-[750px] bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/80 shadow-2xl">
            <p className="text-[1rem] sm:text-[1.15rem] text-[#1A0010] font-extrabold italic leading-relaxed font-inter">
              "Turning complex data into decisive action — from $7.6B budgets to AI-driven systems, I architect solutions that move organizations forward."
            </p>
          </div>
        </motion.div>

        <Nexus activeSection={activeSection} onSelect={handleSelect} />

        <div className="flex gap-4 flex-wrap justify-center mt-4">
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
            onClick={() => smoothScrollTo(0, 1000)}
            className="fixed bottom-8 right-8 z-[100] w-14 h-14 rounded-full border-2 border-[#E01880] bg-white text-[#E01880] shadow-2xl flex items-center justify-center transition-transform active:scale-90"
          >
            <ArrowUp size={28} strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}