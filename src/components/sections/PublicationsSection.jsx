import { motion } from 'framer-motion';
import { ExternalLink, FileText } from 'lucide-react';

// ── Brand Colors ────────────────────────────────────────────────────────────
const PINK   = '#B8004E'; 
const DEEP   = '#0F001E';
const BORDER = 'rgba(184,0,78,0.25)'; 

/**
 * Extracts the Google Drive ID and returns a high-res thumbnail URL.
 * Works for both /file/d/ and /document/d/ links.
 */
const getGooglePreview = (url) => {
  const idMatch = url.match(/\/d\/([^/]+)/);
  if (idMatch && idMatch[1]) {
    // This endpoint provides a high-quality generated thumbnail of the first page
    return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w800`;
  }
  // Fallback to a branded gradient if ID extraction fails
  return null;
};

const PUBLICATIONS = [
  { 
    title: 'RFP Example — DOEE', 
    subtitle: 'Anacostia Watershed Project', 
    desc: 'Green Infrastructure Job Training Program — $400K grant proposal for Living Classrooms Foundation. DOEE-funded green workforce development surrounding Kingman Island rainwater retention gardens.', 
    link: 'https://drive.google.com/file/d/1WZZ8LXzijtkjxMY1qIorSmzfGsAcDe-_', 
    type: 'Grant RFP'
  },
  { 
    title: 'Private Proposal Example — FXB', 
    subtitle: 'Solar Cooking Wraparound Services', 
    desc: 'Comprehensive private grant proposal for Solar Household Energy Inc. Bolstered industry strength through R&D and multi-actor implementation projects for improved indoor air quality.', 
    link: 'https://docs.google.com/document/d/1332TzoM4aOG2hpZElFrzaTTTUUH6XJkA', 
    type: 'Grant'
  },
  { 
    title: 'Literature Review Example — Research', 
    subtitle: 'Lead and Public Health Lit Review', 
    desc: 'IRB-approved comprehensive literature review on lead exposure and public health implications, conducted in accordance with NIH principles. Resulted in broader regional support for Sankat Mochan Water Foundation.', 
    link: 'https://docs.google.com/document/d/1CW4dZtRgOWOLbsXNkw_kf6LD2AiknIfL', 
    type: 'Research'
  },
  { 
    title: 'Formal Essay Example — Academic', 
    subtitle: 'Formal Historical Philosophy', 
    desc: 'Academic formal essay demonstrating high-level writing ability for formal publication. Showcases research synthesis, argument construction, and scholarly citation standards.', 
    link: 'https://docs.google.com/document/d/1Rjrx8UXRTJMeNOKCaJUZTDVAe5sYP_4B', 
    type: 'Academic'
  },
  { 
    title: 'Annual Report Example & Design', 
    subtitle: 'Annual Report — Designed and Wrote', 
    desc: 'Full annual report encompassing writing, design, data visualization, and stakeholder communication. Demonstrates cross-functional capability in publication design and organizational communication.', 
    link: 'https://drive.google.com/file/d/124sxt1oo8aXMW9WZaSE8gJ4BE5_8X5ET', 
    type: 'Report'
  },
  { 
    title: 'International Study Example — IRB', 
    subtitle: 'International Ethics Grade Study', 
    desc: 'IRB-approved international research study conducted in Varanasi, India through Where There Be Dragons. Examined environmental impact of natural gas cremation technology and its intersection with local spiritual tradition.', 
    link: 'https://drive.google.com/file/d/1mCYOgNBPo_6ZS2A_PCVpUHdUXcOgVBSu', 
    type: 'IRB Study'
  },
];

export default function PublicationsSection() {
  return (
    <div>
      <p style={{ textAlign: 'center', color: PINK, fontSize: '0.82rem', marginBottom: '1.5rem', fontWeight: 700, opacity: 0.8 }}>
        8+ years of grant writing, IRB research, annual reporting, and academic publication design
      </p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))', 
        gap: '1.25rem' 
      }}>
        {PUBLICATIONS.map((pub, i) => {
          const previewImg = getGooglePreview(pub.link);
          
          return (
            <motion.a
              key={pub.title}
              href={pub.link} 
              target="_blank" 
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.08, duration: 0.3 }}
              whileHover={{ y: -5, scale: 1.015 }}
              style={{ 
                display: 'block', 
                borderRadius: '0.75rem', 
                border: `2px solid ${BORDER}`, 
                background: 'rgba(255,255,255,0.95)', 
                backdropFilter: 'blur(10px)', 
                overflow: 'hidden', 
                textDecoration: 'none', 
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(15,0,30,0.05)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = PINK}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = BORDER}
            >
              <div style={{ position: 'relative', paddingBottom: '52%', background: DEEP }}>
                {previewImg ? (
                  <img 
                    src={previewImg} 
                    alt={pub.title} 
                    loading="lazy"
                    style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      objectPosition: 'top',
                      opacity: 1
                    }} 
                  />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText color={PINK} opacity={0.2} size={48} />
                  </div>
                )}
                
                {/* Type Tag */}
                <span style={{ 
                  position: 'absolute', 
                  top: 10, 
                  left: 10, 
                  fontSize: '0.55rem', 
                  fontFamily: 'JetBrains Mono, monospace', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.12em', 
                  padding: '4px 10px', 
                  borderRadius: 4, 
                  color: '#fff', 
                  background: PINK,
                  fontWeight: 800,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  zIndex: 2
                }}>
                  {pub.type}
                </span>

                {/* External Link Icon */}
                <div style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: '50%',
                  padding: 6,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  zIndex: 2
                }}>
                  <ExternalLink style={{ width: 12, height: 12, color: PINK }} />
                </div>
              </div>

              <div style={{ padding: '1.25rem' }}>
                <div style={{ marginBottom: 10 }}>
                  <h3 style={{ margin: '0 0 3px', fontSize: '0.95rem', fontWeight: 800, color: DEEP }}>
                    {pub.title}
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '0.7rem', 
                    color: PINK, 
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700
                  }}>
                    {pub.subtitle}
                  </p>
                </div>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.78rem', 
                  color: 'rgba(15,0,30,0.75)', 
                  lineHeight: 1.6 
                }}>
                  {pub.desc}
                </p>
              </div>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}