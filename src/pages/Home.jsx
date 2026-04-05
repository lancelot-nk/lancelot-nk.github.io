import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, Github, Mail, ArrowUp, FileDown, Gamepad2 } from 'lucide-react';
import ParticleField from '../components/ParticleField';
import Nexus from '../components/Nexus';
import ContentPanel from '../components/ContentPanel';
import BlobGame from '../components/BlobGame'; // Ensure this file exists!

import bgAsset from '../assets/bg.jpg';

const PINK   = '#E01880';
const VIOLET = '#8B00E8';

function GlitchText({ text, className, style }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`relative inline-block cursor-default ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <h1 style={{ ...style, color: hovered ? PINK : (style.color || '#1A0010'), transition: 'color 0.2s', position: 'relative', zIndex: 10 }}>
        {text}
      </h1>
      {hovered && (
        <>
          <h1 aria-hidden style={{ ...style, position: 'absolute', top: 0, left: 0, width: '100%', color: VIOLET, animation: 'glitch 0.4s steps(1) infinite', mixBlendMode: 'multiply', pointerEvents: 'none', zIndex: 5 }}>{text}</h1>
          <h1 aria-hidden style={{ ...style, position: 'absolute', top: 0, left: 0, width: '100%', color: '#FF3366', animation: 'glitch 0.4s steps(1) infinite 0.1s', mixBlendMode: 'multiply', pointerEvents: 'none', transform: 'translateX(3px)', zIndex: 5 }}>{text}</h1>
        </>
      )}
    </div>
  );
}

// ── SCROLL SYSTEM ─────────────────────────────────────────────────────────────
let scrollRaf       = null;
let userInterrupted = false;
let lastScrollY     = 0;

function cancelScroll() {
  if (scrollRaf) { cancelAnimationFrame(scrollRaf); scrollRaf = null; }
}

function smoothScrollTo(targetY, duration = 900) {
  cancelScroll();
  userInterrupted = false;
  lastScrollY     = window.pageYOffset;
  const startY     = window.pageYOffset;
  const diff       = targetY - startY;
  let startTime   = null;
  const step = (ts) => {
    if (Math.abs(window.pageYOffset - lastScrollY) > 2 && userInterrupted) { cancelScroll(); return; }
    lastScrollY = window.pageYOffset;
    if (!startTime) startTime = ts;
    const p = Math.min((ts - startTime) / duration, 1);
    const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    window.scrollTo(0, startY + diff * e);
    if (p < 1) { scrollRaf = requestAnimationFrame(step); } else { scrollRaf = null; }
  };
  scrollRaf = requestAnimationFrame(step);
}

function initScrollInterruptListeners() {
  const onUserScroll = () => { userInterrupted = true; };
  window.addEventListener('wheel',     onUserScroll, { passive: true });
  window.addEventListener('touchmove', onUserScroll, { passive: true });
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(e.key)) userInterrupted = true;
  });
}

function CertBadge({ label, color, onSelect }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={() => onSelect('certifications')}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="flex items-center gap-2 px-3 py-1 rounded-full border-2 font-mono text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-sm transition-all duration-200 cursor-pointer"
      style={{
        borderColor: color,
        background:  hov ? color  : 'rgba(255,255,255,0.9)',
        color:       hov ? '#fff' : color,
      }}
    >
      <span>✦</span>{label}
    </button>
  );
}

function PillBtn({ href, icon: Icon, label, onClick }) {
  const [hov, setHov] = useState(false);
  const Tag = onClick ? 'button' : 'a';
  return (
    <Tag
      href={onClick ? undefined : href}
      onClick={onClick}
      target={onClick ? undefined : '_blank'}
      rel={onClick ? undefined : 'noopener noreferrer'}
      className="inline-flex items-center gap-[8px] px-6 py-[12px] rounded-full border-2 text-[0.85rem] font-bold no-underline transition-all duration-200 cursor-pointer"
      style={{
        background:  hov ? PINK : 'rgba(255,255,255,0.9)',
        borderColor: PINK,
        color:       hov ? '#fff' : PINK,
        boxShadow:   hov ? '0 0 25px rgba(224,24,128,0.5)' : 'none',
        fontFamily:  'var(--font-inter)',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <Icon size={18} className="flex-shrink-0" />
      {label}
    </Tag>
  );
}

// ── SECRET GAME BUTTON ────────────────────────────────────────────────────────
function QuoteBox({ onGameUnlock }) {
  const [gameVisible,  setGameVisible]  = useState(false);
  const [holding,      setHolding]      = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimer   = useRef(null);
  const progressRaf = useRef(null);
  const holdStart   = useRef(null);
  const HOLD_MS     = 3000;

  const startHold = useCallback(() => {
    holdStart.current = performance.now();
    setHolding(true);
    const tick = () => {
      const progress = Math.min((performance.now() - holdStart.current) / HOLD_MS, 1);
      setHoldProgress(progress);
      if (progress < 1) { progressRaf.current = requestAnimationFrame(tick); }
    };
    progressRaf.current = requestAnimationFrame(tick);
    holdTimer.current = setTimeout(() => {
      setGameVisible(true); setHolding(false); setHoldProgress(0);
    }, HOLD_MS);
  }, []);

  const cancelHold = useCallback(() => {
    clearTimeout(holdTimer.current);
    cancelAnimationFrame(progressRaf.current);
    setHolding(false);
    setHoldProgress(0);
  }, []);

  useEffect(() => () => {
    clearTimeout(holdTimer.current);
    cancelAnimationFrame(progressRaf.current);
  }, []);

  return (
    <div className="relative mt-4 mb-1 sm:mb-0 mx-auto max-w-[750px] pointer-events-auto">
      <motion.div
        className="rounded-2xl border border-white/80 shadow-2xl cursor-default select-none relative z-40"
        style={{ background: 'rgba(255,255,255,0.70)', backdropFilter: 'blur(16px)' }}
        initial={false}
        whileHover={{
          scale:      1.012,
          background: 'rgba(255,255,255,0.92)',
          boxShadow:  '0 8px 48px rgba(224,24,128,0.10)',
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        onMouseLeave={cancelHold}
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        onTouchCancel={cancelHold}
      >
        <motion.p
          className="p-5 text-[0.95rem] sm:text-[1.1rem] font-extrabold italic leading-relaxed font-inter"
          initial={false}
          whileHover={{ color: '#5A0018' }}
          transition={{ duration: 0.25 }}
          style={{ color: '#1A0010' }}
        >
          "Turning complex data into decisive action — from $7.6B budgets to AI-driven systems, I architect solutions that move organizations forward."
        </motion.p>

        {holding && (
          <svg
            className="absolute top-2 right-2 pointer-events-none"
            width={28} height={28}
            style={{ transform: 'rotate(-90deg)' }}
          >
            <circle cx={14} cy={14} r={11} fill="none" stroke="rgba(224,24,128,0.15)" strokeWidth={2.5} />
            <circle
              cx={14} cy={14} r={11} fill="none" stroke={PINK} strokeWidth={2.5}
              strokeDasharray={`${2 * Math.PI * 11}`}
              strokeDashoffset={`${2 * Math.PI * 11 * (1 - holdProgress)}`}
              strokeLinecap="round"
            />
          </svg>
        )}
      </motion.div>

      <AnimatePresence>
        {gameVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 420, damping: 20 }}
            onClick={(e) => { e.stopPropagation(); onGameUnlock(); }}
            className="absolute flex items-center justify-center w-10 h-10 rounded-xl border-2"
            style={{
              top: '-14px',
              right: '-14px',
              borderColor: PINK,
              background: 'rgba(255,255,255,0.97)',
              color: PINK,
              boxShadow: `0 0 18px rgba(224,24,128,0.45), 0 2px 8px rgba(0,0,0,0.10)`,
              zIndex: 50,
            }}
            title="???"
          >
            <Gamepad2 size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── MAIN HOME COMPONENT ───────────────────────────────────────────────────────
export default function Home() {
  const [activeSection, setActiveSection] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const contentRef    = useRef(null);
  const pendingSelect = useRef(null);

  useEffect(() => { initScrollInterruptListeners(); }, []);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToContent = useCallback((delay, scrollDuration = 900) => {
    cancelScroll();
    clearTimeout(pendingSelect.current);
    pendingSelect.current = setTimeout(() => {
      if (contentRef.current) {
        const y = contentRef.current.getBoundingClientRect().top + window.pageYOffset - 20;
        smoothScrollTo(y, scrollDuration);
      }
    }, delay);
  }, []);

  const handleSelect = useCallback((id) => {
    cancelScroll();
    clearTimeout(pendingSelect.current);

    if (activeSection === id) { setActiveSection(null); return; }

    if (activeSection !== null) {
      const SWITCH_ANIM_MS = 1100, BREATH_MS = 150, DRAW_IN_MS = 1400;
      setActiveSection(null);
      pendingSelect.current = setTimeout(() => {
        setActiveSection(id);
        scrollToContent(DRAW_IN_MS, 800);
      }, SWITCH_ANIM_MS + BREATH_MS);
    } else {
      setActiveSection(id);
      scrollToContent(1400 + 100, 800);
    }
  }, [activeSection, scrollToContent]);

  const handleGameUnlock = useCallback(() => {
    setGameActive(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-white">
      <div className="fixed inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${bgAsset})` }} />
      
      <ParticleField isGameMode={gameActive} />

      <AnimatePresence>
        {!gameActive && (
          <motion.div 
            key="main-content"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.5 } }}
            className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-6 pb-12 sm:py-12 gap-6 sm:gap-4"
          >
            {/* Header Section */}
            <motion.div
              className="text-center flex flex-col items-center w-full"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlitchText
                text="Lancelot Naipier-Kane"
                style={{ fontSize: 'clamp(1.8rem, 8vw, 4.5rem)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1.1, fontFamily: 'Inter, sans-serif' }}
              />

              <div className="flex gap-2 mt-3 mb-3 flex-wrap justify-center">
                <CertBadge label="MIT Certified" color="#A31F34" onSelect={handleSelect} />
                <CertBadge label="Microsoft Certified" color="#00A4EF" onSelect={handleSelect} />
                <CertBadge label="Google Certified" color="#34A853" onSelect={handleSelect} />
              </div>

              <GlitchText
                text="Program and Data Manager"
                style={{ fontSize: 'clamp(0.85rem, 3vw, 1.1rem)', fontFamily: 'var(--font-mono)', fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#000000' }}
              />

              <QuoteBox onGameUnlock={handleGameUnlock} />
            </motion.div>

            {/* Nexus Component */}
            <div className="relative mt-2 mb-[-30px] sm:my-[-65px] lg:my-[-90px] z-20">
                <Nexus activeSection={activeSection} onSelect={handleSelect} />
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-4 flex-wrap justify-center mt-4 sm:mt-[-15px] pb-8 sm:pb-0 z-30">
              <PillBtn href="https://www.linkedin.com/in/lancelotnk/" icon={Linkedin} label="LinkedIn" />
              <PillBtn href="https://github.com/lancelot-nk" icon={Github} label="GitHub" />
              <PillBtn href="mailto:lancelotsmnk@gmail.com" icon={Mail} label="Contact For Work" />
              <PillBtn onClick={() => handleSelect('resume')} icon={FileDown} label="Resume" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conditional Game Layer */}
      {gameActive && (
        <BlobGame onClose={() => setGameActive(false)} />
      )}

      {/* Content Panel Section */}
      {!gameActive && (
        <div ref={contentRef} className="relative z-10">
          <ContentPanel activeSection={activeSection} />
        </div>
      )}

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && !gameActive && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => smoothScrollTo(0, 700)}
            className="fixed bottom-8 right-8 z-[100] w-14 h-14 rounded-full border-2 border-[#E01880] bg-white text-[#E01880] shadow-2xl flex items-center justify-center transition-transform active:scale-90"
          >
            <ArrowUp size={28} strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}