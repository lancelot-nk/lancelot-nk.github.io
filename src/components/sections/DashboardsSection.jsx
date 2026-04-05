import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

const PINK = '#B8004E'; // Updated to match brand consistency
const VIOLET = '#7B00D1'; // Slightly deeper for better contrast
const DEEP = '#0F001E';

/**
 * @param {string} label
 * @param {string} color
 */
function tag(label, color) {
  return (
    <span 
      style={{ 
        fontSize: '0.6rem', 
        fontFamily: 'JetBrains Mono, monospace', 
        textTransform: 'uppercase', 
        letterSpacing: '0.1em', 
        padding: '4px 10px', 
        border: `1px solid ${color}40`, 
        borderRadius: 4, 
        color, 
        fontWeight: 700,
        background: `${color}0D` 
      }}
    >
      {label}
    </span>
  );
}

export default function DashboardsSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Tableau Dashboard */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          borderRadius: '0.75rem', 
          border: `2px solid rgba(184,0,78,0.25)`, // Thickened border
          background: 'rgba(255,255,255,0.95)', 
          backdropFilter: 'blur(10px)', 
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(15,0,30,0.05)'
        }}
      >
        <div style={{ 
          padding: '1.25rem', 
          borderBottom: '1px solid rgba(184,0,78,0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: 12 
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: DEEP }}>Tableau Dashboard</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: PINK, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
              Sales Dataset · Interactive Visualization
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['Tableau', PINK], ['Sales Analytics', PINK], ['Data Viz', PINK]].map(([l, c]) => (
              <span key={l}>{tag(l, c)}</span>
            ))}
          </div>
        </div>

        <div style={{ background: '#f8f9fa' }}>
          <iframe 
            src="https://public.tableau.com/views/LancelotNaipierKaneTableauDemo/TableauDemoDashboardMAIN?:embed=y&:showVizHome=no&:toolbar=yes&:tabs=no&:animate_transition=yes&:display_count=yes&:language=en-US&publish=yes"
            title="Tableau Dashboard" 
            width="100%" 
            height="620" 
            frameBorder="0" 
            allowFullScreen 
            style={{ display: 'block', border: 'none' }} 
          />
        </div>

        <div style={{ padding: '1rem 1.25rem', background: 'rgba(184,0,78,0.02)' }}>
          <a 
            href="https://github.com/lancelot-nk/lancelot-nk.github.io/blob/main/LancelotNaipierKaneTableauDemo.twb" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8, 
              fontSize: '0.75rem', 
              fontFamily: 'JetBrains Mono, monospace', 
              color: PINK, 
              fontWeight: 700,
              textDecoration: 'none', 
              transition: 'all 0.3s ease' 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.7';
              e.currentTarget.style.transform = 'translateX(3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <Download style={{ width: 14, height: 14 }} /> Download Tableau Workbook (.twb)
          </a>
        </div>
      </motion.div>

      {/* Power BI Dashboard */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.15 }}
        style={{ 
          borderRadius: '0.75rem', 
          border: `2px solid rgba(123,0,209,0.25)`, // Thickened border
          background: 'rgba(255,255,255,0.95)', 
          backdropFilter: 'blur(10px)', 
          overflow: 'hidden',
          boxShadow: '0 4px 15px rgba(15,0,30,0.05)'
        }}
      >
        <div style={{ 
          padding: '1.25rem', 
          borderBottom: `1px solid rgba(123,0,209,0.1)`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: 12 
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: DEEP }}>Power BI Dashboard</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: VIOLET, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
              Sales Dataset · Business Intelligence
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['Power BI', VIOLET], ['Business Intel', VIOLET], ['DAX', VIOLET]].map(([l, c]) => (
              <span key={l}>{tag(l, c)}</span>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', paddingBottom: '38%', background: DEEP }}>
          <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=500&fit=crop&q=80" 
            alt="Power BI" 
            style={{ 
              position: 'absolute', 
              inset: 0, 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              opacity: 0.3 
            }} 
          />
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 15,
            padding: '2rem',
            textAlign: 'center'
          }}>
            <p style={{ color: '#fff', fontSize: '0.85rem', margin: 0, fontWeight: 500, opacity: 0.9 }}>
              Power BI requires organizational authentication for live embeds.
            </p>
            <a 
              href="https://github.com/lancelot-nk/lancelot-nk.github.io/blob/main/LancelotNaipierKanePowerBIDemo.pbix" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 10, 
                padding: '10px 24px', 
                border: `2px solid ${VIOLET}`, 
                borderRadius: 999, 
                fontSize: '0.8rem', 
                fontFamily: 'JetBrains Mono, monospace', 
                color: '#fff', 
                fontWeight: 800,
                textDecoration: 'none', 
                background: VIOLET, 
                transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                boxShadow: '0 4px 12px rgba(123,0,209,0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(123,0,209,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(123,0,209,0.3)';
              }}
            >
              <Download style={{ width: 16, height: 16 }} /> Download .pbix Source File
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}