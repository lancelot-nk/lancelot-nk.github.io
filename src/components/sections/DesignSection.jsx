import { motion } from 'framer-motion';

const PINK = '#E01880';

const DESIGNS = [
  { title: 'Photo & Video Editing', desc: 'Fully capable photo and video editor. Adobe suite, Premiere, After Effects, DaVinci Resolve, and more.', img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop&q=80' },
  { title: 'Outreach Campaign Materials', desc: 'Creation of material for various outreach campaigns and community projects across multiple organizations.', img: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&h=450&fit=crop&q=80' },
  { title: 'Business Branding & UI', desc: 'Creation of business branding, UI/UX elements, identity systems, and web design.', img: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=450&fit=crop&q=80' },
  { title: 'Fundraising Publications', desc: 'Creation of publications and visual materials for fundraising, grant applications, and donor engagement.', img: 'https://images.unsplash.com/photo-1524234107056-1c1f48f64ab8?w=800&h=450&fit=crop&q=80' },
  { title: 'Formal Publication Design', desc: 'Creation of high level design pages for formal publication, reports, and government deliverables.', img: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&h=450&fit=crop&q=80' },
  { title: 'Full Digital Mastery', desc: 'Mastery of all available digital design tools: Adobe CC, Figma, Canva, AutoCAD, and motion graphics pipelines.', img: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800&h=450&fit=crop&q=80' },
];

export default function DesignSection() {
  return (
    <div>
      <p style={{ textAlign: 'center', color: 'rgba(100,0,60,0.45)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
        12+ years of graphic and web design across all digital platforms
      </p>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', 
        gap: '1rem' 
      }}>
        {DESIGNS.map((d, i) => (
          <motion.div 
            key={d.title} 
            initial={{ opacity: 0, scale: 0.97 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: i * 0.07 }}
            style={{ 
              borderRadius: '0.75rem', 
              border: '1px solid rgba(224,24,128,0.12)', 
              background: 'rgba(255,255,255,0.75)', 
              backdropFilter: 'blur(10px)', 
              overflow: 'hidden', 
              transition: 'border-color 0.3s' 
            }}
            onMouseEnter={(/** @type {any} */ e) => e.currentTarget.style.borderColor = 'rgba(224,24,128,0.35)'}
            onMouseLeave={(/** @type {any} */ e) => e.currentTarget.style.borderColor = 'rgba(224,24,128,0.12)'}
          >
            <div style={{ position: 'relative', paddingBottom: '56.25%' }}>
              <img 
                src={d.img} 
                alt={d.title} 
                loading="lazy"
                style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  opacity: 0.6 
                }} 
              />
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                background: 'linear-gradient(to bottom, transparent 50%, rgba(255,255,255,0.95) 100%)' 
              }} />
            </div>
            <div style={{ padding: '0.9rem 1rem 1rem' }}>
              <h3 style={{ margin: '0 0 5px', fontSize: '0.88rem', fontWeight: 600, color: '#2D0040' }}>
                {d.title}
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: '0.75rem', 
                color: 'rgba(60,0,60,0.5)', 
                lineHeight: 1.6 
              }}>
                {d.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}