import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, Github, Mail, FileDown } from 'lucide-react';
import ParticleField from '../components/ParticleField';
import Nexus from '../components/Nexus';
import ContentPanel from '../components/ContentPanel';

const BG = "https://lancelot-nk.github.io/images/bg.jpg";
const PINK = 'hsl(var(--primary))';
const VIOLET = 'hsl(var(--secondary))';

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
        fontSize: 'clamp(1.6rem, 5vw, 3.2rem)', fontWeight: 800,
        color: hovered ? '#E01880' : '#2D0040',
        letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1,
        fontFamily: 'var(--font-inter)',
      }}>
        {text}
      </h1>
      {hovered && (
        <>
          <h1 aria-hidden className="absolute top-0 left-0 w-full animate-glitch mix-blend-multiply pointer-events-none" style={{
            fontSize: 'clamp(1.6rem, 5vw, 3.2rem)', fontWeight: 800,
            color: '#8B00E8', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1,
            fontFamily: 'var(--font-inter)',
          }}>{text}</h1>
          <h1 aria-hidden className="absolute top-0 left-0 w-full animate-glitch mix-blend-multiply pointer-events-none translate-x-[3px]" style={{
            fontSize: 'clamp(1.6rem, 5vw, 3.2rem)', fontWeight: 800,
            color: '#FF3366', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1,
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
    <span className="inline-flex items-center gap-1 px-[9px] py-[3px] rounded-full border border-opacity-30" style={{
      fontSize: '0.6rem', fontFamily: 'var(--font-mono)',
      fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
      borderColor: `${color}55`,
      background: `${color}18`,
      color,
    }}>
      ✦ {label}
    </span>
  );
}

function PillBtn({ href, icon: Icon, label, primary }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={href} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-[7px] px-5 py-[10px] rounded-full border-[1.5px] text-[0.78rem] font-semibold no-underline transition-all duration-250 backdrop-blur-md whitespace-nowrap"
      style={{
        background: hov ? (primary ? '#E01880' : 'rgba(224,24,128,0.12)') : (primary ? 'rgba(224,24,128,0.14)' : 'rgba(255,255,255,0.7)'),
        borderColor: primary ? '#E01880' : 'rgba(224,24,128,0.3)',
        color: hov ? (primary ? '#fff' : '#E01880') : (primary ? '#E01880' : '#8B0050'),
        boxShadow: hov ? `0 4px 20px rgba(224,24,128,0.2)` : 'none',
        fontFamily: 'var(--font-inter)',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <Icon size={16} className="flex-shrink-0" />
      {label}
    </a>
  );
}

export default function Home() {
  const [activeSection, setActiveSection] = useState(null);
  const contentRef = useRef(null);

  const handleSelect = (id) => {
    const next = activeSection === id ? null : id;
    setActiveSection(next);
    if (next) {
      setTimeout(() => {
        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-white">
      {/* Background Layers */}
      <div className="fixed inset-0 z-0 bg-cover bg-center opacity-[0.55]" style={{ backgroundImage: `url(${BG})` }} />
      <div className="fixed inset-0 z-[1] bg-gradient-to-br from-white/55 to-[#FFDEF0]/30" />
      <div className="fixed inset-0 z-50 pointer-events-none border border-[#E01880]/15 animate-border-pulse" />

      <ParticleField />

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8 gap-6">
        
        <motion.div className="text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <GlitchName />
          <div className="flex gap-2 justify-center flex-wrap my-3">
            <CertBadge label="MIT Certified" color="#A31F34" />
            <CertBadge label="Microsoft Certified" color="#0078D4" />
          </div>
          <p className="mb-2 text-[0.75rem] font-mono text-[#8B0050]/70 tracking-[0.18em] uppercase">
            Program and Data Manager
          </p>
          <p className="mx-auto text-[clamp(0.85rem,2.2vw,1rem)] text-[#3C003C]/70 italic max-w-[580px] leading-relaxed font-inter">
            "Turning complex data into decisive action — from $7.6B budgets to AI-driven systems, I architect solutions that move organizations forward."
          </p>
        </motion.div>

        <Nexus activeSection={activeSection} onSelect={handleSelect} />

        <motion.div
          className="flex gap-3 flex-wrap justify-center mt-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
        >
          <PillBtn href="https://www.linkedin.com/in/lancelotnk/" icon={Linkedin} label="LinkedIn" primary />
          <PillBtn href="https://github.com/lancelot-nk" icon={Github} label="GitHub" />
          <PillBtn href="mailto:lancelotsmnk@gmail.com" icon={Mail} label="Contact" />
          <PillBtn href="/resume.pdf" icon={FileDown} label="Resume" />
        </motion.div>
      </div>

      {/* Content Section */}
      <div ref={contentRef} className="relative z-10">
        <ContentPanel activeSection={activeSection} />
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 px-4 border-t border-[#E01880]/10 bg-white/70 backdrop-blur-md">
        <p className="text-[0.7rem] font-mono text-[#64003C]/50 tracking-widest uppercase">
          © {new Date().getFullYear()} LANCELOT NAIPIER-KANE // NEW YORK CITY
        </p>
      </footer>
    </div>
  );
}