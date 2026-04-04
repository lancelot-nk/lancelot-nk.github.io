import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const PINK = '#E01880';

const PUBLICATIONS = [
  { 
    title: 'RFP Example — DOEE', 
    subtitle: 'Anacostia Watershed Project', 
    desc: 'Green Infrastructure Job Training Program — $400K grant proposal for Living Classrooms Foundation. DOEE-funded green workforce development surrounding Kingman Island rainwater retention gardens.', 
    link: 'https://drive.google.com/file/d/1WZZ8LXzijtkjxMY1qIorSmzfGsAcDe-_', 
    type: 'Grant RFP', 
    img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=450&fit=crop&q=80' 
  },
  { 
    title: 'Private Proposal Example — FXB', 
    subtitle: 'Solar Cooking Wraparound Services', 
    desc: 'Comprehensive private grant proposal for Solar Household Energy Inc. Bolstered industry strength through R&D and multi-actor implementation projects for improved indoor air quality.', 
    link: 'https://docs.google.com/document/d/1332TzoM4aOG2hpZElFrzaTTTUUH6XJkA', 
    type: 'Grant', 
    img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop&q=80' 
  },
  { 
    title: 'Literature Review Example — Research', 
    subtitle: 'Lead and Public Health Lit Review', 
    desc: 'IRB-approved comprehensive literature review on lead exposure and public health implications, conducted in accordance with NIH principles. Resulted in broader regional support for Sankat Mochan Water Foundation.', 
    link: 'https://docs.google.com/document/d/1CW4dZtRgOWOLbsXNkw_kf6LD2AiknIfL', 
    type: 'Research', 
    img: 'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?w=800&h=450&fit=crop&q=80' 
  },
  { 
    title: 'Formal Essay Example — Academic', 
    subtitle: 'Formal Historical Philosophy', 
    desc: 'Academic formal essay demonstrating high-level writing ability for formal publication. Showcases research synthesis, argument construction, and scholarly citation standards.', 
    link: 'https://docs.google.com/document/d/1Rjrx8UXRTJMeNOKCaJUZTDVAe5sYP_4B', 
    type: 'Academic', 
    img: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=450&fit=crop&q=80' 
  },
  { 
    title: 'Annual Report Example & Design', 
    subtitle: 'Annual Report — Designed and Wrote', 
    desc: 'Full annual report encompassing writing, design, data visualization, and stakeholder communication. Demonstrates cross-functional capability in publication design and organizational communication.', 
    link: 'https://drive.google.com/file/d/124sxt1oo8aXMW9WZaSE8gJ4BE5_8X5ET', 
    type: 'Report', 
    img: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&h=450&fit=crop&q=80' 
  },
  { 
    title: 'International Study Example — IRB', 
    subtitle: 'International Ethics Grade Study', 
    desc: 'IRB-approved international research study conducted in Varanasi, India through Where There Be Dragons. Examined environmental impact of natural gas cremation technology and its intersection with local spiritual tradition.', 
    link: 'https://drive.google.com/file/d/1mCYOgNBPo_6ZS2A_PCVpUHdUXcOgVBSu', 
    type: 'IRB Study', 
    img: 'https://images.unsplash.com/photo-1503428593586-e225b39bddfe?w=800&h=450&fit=crop&q=80' 
  },
];

export default function PublicationsSection() {
  return (
    <div>
      <p style={{ textAlign: 'center', color: 'rgba(100,0,60,0.45)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
        8+ years of grant writing, IRB research, annual reporting, and academic publication design
      </p>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 440px), 1fr))', 
        gap: '1.1rem' 
      }}>
        {PUBLICATIONS.map((pub, i) => (
          <motion.a
            key={pub.title}
            href={pub.link} 
            target="_blank" 
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.08 }}
            style={{ 
              display: 'block', 
              borderRadius: '0.75rem', 
              border: '1px solid rgba(224,24,128,0.15)', 
              background: 'rgba(255,255,255,0.75)', 
              backdropFilter: 'blur(10px)', 
              overflow: 'hidden', 
              textDecoration: 'none', 
              transition: 'border-color 0.3s, transform 0.2s' 
            }}
            whileHover={{ scale: 1.01 }}
            onMouseEnter={(/** @type {any} */ e) => e.currentTarget.style.borderColor = 'rgba(224,24,128,0.4)'}
            onMouseLeave={(/** @type {any} */ e) => e.currentTarget.style.borderColor = 'rgba(224,24,128,0.15)'}
          >
            <div style={{ position: 'relative', paddingBottom: '56.25%' }}>
              <img 
                src={pub.img} 
                alt={pub.title} 
                loading="lazy"
                style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  opacity: 0.55 
                }} 
              />
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                background: 'linear-gradient(to bottom, transparent 40%, rgba(255,255,255,0.95) 100%)' 
              }} />
              <span style={{ 
                position: 'absolute', 
                top: 10, 
                left: 10, 
                fontSize: '0.58rem', 
                fontFamily: 'JetBrains Mono, monospace', 
                textTransform: 'uppercase', 
                letterSpacing: '0.1em', 
                padding: '3px 9px', 
                border: `1px solid rgba(224,24,128,0.35)`, 
                borderRadius: 999, 
                color: PINK, 
                background: 'rgba(255,255,255,0.85)' 
              }}>
                {pub.type}
              </span>
            </div>
            <div style={{ padding: '0.85rem 1rem 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  <h3 style={{ margin: '0 0 2px', fontSize: '0.88rem', fontWeight: 700, color: '#2D0040' }}>
                    {pub.title}
                  </h3>
                  <p style={{ 
                    margin: '0 0 6px', 
                    fontSize: '0.7rem', 
                    color: PINK, 
                    fontFamily: 'JetBrains Mono, monospace' 
                  }}>
                    {pub.subtitle}
                  </p>
                </div>
                <ExternalLink style={{ width: 13, height: 13, color: 'rgba(224,24,128,0.4)', flexShrink: 0, marginTop: 3 }} />
              </div>
              <p style={{ 
                margin: 0, 
                fontSize: '0.77rem', 
                color: 'rgba(60,0,60,0.5)', 
                lineHeight: 1.65 
              }}>
                {pub.desc}
              </p>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}