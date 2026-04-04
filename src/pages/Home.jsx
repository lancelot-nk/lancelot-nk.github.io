import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Github, Mail, FileDown } from 'lucide-react';
import ParticleField from '../components/ParticleField';
import Nexus from '../components/Nexus';
import ContentPanel from '../components/ContentPanel';

// IMPORT LOCAL ASSET
import bgAsset from '../assets/bg.jpg';

/**
 * Vibrant, High-Contrast Pill Button
 * All buttons now share the "Primary" glowing aesthetic.
 */
function PillBtn({ href, icon: Icon, label }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-[8px] px-6 py-[12px] rounded-full border-2 text-[0.85rem] font-bold no-underline transition-all duration-200 backdrop-blur-sm whitespace-nowrap"
      style={{
        // High-Vibrancy Magenta/Pink Theme
        background: hov ? '#E01880' : 'rgba(224, 24, 128, 0.18)',
        borderColor: '#E01880',
        color: hov ? '#fff' : '#E01880',
        boxShadow: hov ? '0 0 25px rgba(224, 24, 128, 0.4)' : 'none',
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
        fontSize: 'clamp(1.8rem, 6vw, 3.5rem)', fontWeight: 900,
        color: hovered ? '#E01880' : '#1A0010', // Darker base for better contrast
        letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1,
        fontFamily: 'var(--font-inter)',
      }}>
        {text}
      </h1>
      {hovered && (
        <>
          <h1 aria-hidden className="absolute top-0 left-0 w-full animate-glitch mix-blend-multiply pointer-events-none" style={{
            fontSize: 'clamp(1.8rem, 6vw, 3.5rem)', fontWeight: 900,
            color: '#8B00E8', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1,
            fontFamily: 'var(--font-inter)',
          }}>{text}</h1>
          <h1 aria-hidden className="absolute top-0 left-0 w-full animate-glitch mix-blend-multiply pointer-events-none translate-x-[3px]" style={{
            fontSize: 'clamp(1.8rem, 6vw, 3.5rem)', fontWeight: 900,
            color: '#FF3366', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.1,
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
    <span className="inline-flex items-center gap-1 px-[10px] py-[4px] rounded-full border-2" style={{
      fontSize: '0.65rem', fontFamily: 'var(--font-mono)',
      fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
      borderColor: color,
      background: `${color}15`,
      color,
    }}>
      ✦ {label}
    </span>
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
      
      {/* BACKGROUND LAYER: No Blur, Higher Opacity */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center opacity-[0.85] transition-opacity duration-500" 
        style={{ backgroundImage: `url(${bgAsset})` }} 
      />
      
      {/* SUBTLE OVERLAY: Ensures text remains readable without blurring the art */}
      <div className="fixed inset-0 z-[1] bg-gradient-to-b from-white/20 via-transparent to-white/40" />
      
      {/* PULSE BORDER: Sharper and Darker */}
      <div className="fixed inset-0 z-50 pointer-events-none border-2 border-[#E01880]/30 animate-border-pulse" />

      <ParticleField />

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8 gap-8">
        
        <motion.div className="text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <GlitchName />
          <div className="flex gap-3 justify-center flex-wrap my-4">
            <CertBadge label="MIT Certified" color="#A31F34" />
            <CertBadge label="Microsoft Certified" color="#0078D4" />
          </div>
          <p className="mb-2 text-[0.85rem] font-mono text-[#400020] font-bold tracking-[0.2em] uppercase">
            Program and Data Manager
          </p>
          <p className="mx-auto text-[clamp(0.9rem,2.5vw,1.1rem)] text-[#1A0010]/80 font-medium italic max-w-[620px] leading-relaxed font-inter">
            "Turning complex data into decisive action — from $7.6B budgets to AI-driven systems, I architect solutions that move organizations forward."
          </p>
        </motion.div>

        <Nexus activeSection={activeSection} onSelect={handleSelect} />

        <motion.div
          className="flex gap-4 flex-wrap justify-center mt-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
        >
          <PillBtn href="https://www.linkedin.com/in/lancelotnk/" icon={Linkedin} label="LinkedIn" />
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
      <footer className="relative z-10 text-center py-10 px-4 border-t-2 border-[#E01880]/20 bg-white/80 backdrop-blur-md">
        <p className="text-[0.75rem] font-mono text-[#400020] font-bold tracking-widest uppercase">
          © {new Date().getFullYear()} LANCELOT NAIPIER-KANE // NEW YORK CITY
        </p>
      </footer>
    </div>
  );
}