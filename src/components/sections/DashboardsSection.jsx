import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

const PINK = '#E01880';
const VIOLET = '#8B00E8';

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
        letterSpacing: '0.08em', 
        padding: '3px 8px', 
        border: `1px solid ${color}30`, 
        borderRadius: 4, 
        color, 
        background: `${color}0A` 
      }}
    >
      {label}
    </span>
  );
}

export default function DashboardsSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Tableau */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          borderRadius: '0.75rem', 
          border: '1px solid rgba(224,24,128,0.18)', 
          background: 'rgba(255,255,255,0.8)', 
          backdropFilter: 'blur(10px)', 
          overflow: 'hidden' 
        }}
      >
        <div style={{ 
          padding: '1rem 1.25rem', 
          borderBottom: '1px solid rgba(224,24,128,0.08)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: 8 
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#2D0040' }}>Tableau Dashboard</h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: 'rgba(100,0,60,0.5)', fontFamily: 'JetBrains Mono, monospace' }}>
              Sales Dataset · Interactive Visualization
            </p>
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {[['Tableau', PINK], ['Sales Analytics', PINK], ['Data Viz', PINK]].map(([l, c]) => (
              <span key={l}>{tag(l, c)}</span>
            ))}
          </div>
        </div>
        <div style={{ background: 'rgba(255,240,248,0.4)' }}>
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
        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(224,24,128,0.06)' }}>
          <a 
            href="https://github.com/lancelot-nk/lancelot-nk.github.io/blob/main/LancelotNaipierKaneTableauDemo.twb" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 6, 
              fontSize: '0.7rem', 
              fontFamily: 'JetBrains Mono, monospace', 
              color: 'rgba(224,24,128,0.6)', 
              textDecoration: 'none', 
              transition: 'color 0.3s' 
            }}
            onMouseEnter={(/** @type {any} */ e) => e.currentTarget.style.color = PINK}
            onMouseLeave={(/** @type {any} */ e) => e.currentTarget.style.color = 'rgba(224,24,128,0.6)'}
          >
            <Download style={{ width: 12, height: 12 }} /> Download Tableau Workbook (.twb)
          </a>
        </div>
      </motion.div>

      {/* Power BI */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.15 }}
        style={{ 
          borderRadius: '0.75rem', 
          border: `1px solid rgba(139,0,232,0.18)`, 
          background: 'rgba(255,255,255,0.8)', 
          backdropFilter: 'blur(10px)', 
          overflow: 'hidden' 
        }}
      >
        <div style={{ 
          padding: '1rem 1.25rem', 
          borderBottom: `1px solid rgba(139,0,232,0.08)`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: 8 
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#2D0040' }}>Power BI Dashboard</h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: 'rgba(100,0,60,0.5)', fontFamily: 'JetBrains Mono, monospace' }}>
              Sales Dataset · Business Intelligence
            </p>
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {[['Power BI', VIOLET], ['Business Intel', VIOLET], ['DAX', VIOLET]].map(([l, c]) => (
              <span key={l}>{tag(l, c)}</span>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', paddingBottom: '38%', background: 'rgba(245,235,255,0.3)' }}>
          <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=500&fit=crop&q=80" 
            alt="Power BI" 
            style={{ 
              position: 'absolute', 
              inset: 0, 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              opacity: 0.25 
            }} 
          />
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 12 
          }}>
            <p style={{ color: 'rgba(60,0,100,0.55)', fontSize: '0.82rem', margin: 0 }}>
              Power BI requires organizational authentication
            </p>
            <a 
              href="https://github.com/lancelot-nk/lancelot-nk.github.io/blob/main/LancelotNaipierKanePowerBIDemo.pbix" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 6, 
                padding: '8px 18px', 
                border: `1px solid rgba(139,0,232,0.4)`, 
                borderRadius: 999, 
                fontSize: '0.75rem', 
                fontFamily: 'JetBrains Mono, monospace', 
                color: VIOLET, 
                textDecoration: 'none', 
                background: 'rgba(139,0,232,0.06)', 
                transition: 'all 0.3s' 
              }}
              onMouseEnter={(/** @type {any} */ e) => e.currentTarget.style.background = 'rgba(139,0,232,0.14)'}
              onMouseLeave={(/** @type {any} */ e) => e.currentTarget.style.background = 'rgba(139,0,232,0.06)'}
            >
              <Download style={{ width: 14, height: 14 }} /> Download .pbix Source File
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}