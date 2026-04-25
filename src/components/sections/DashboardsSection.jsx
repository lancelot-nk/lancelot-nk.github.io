import { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';

const PINK   = '#B8004E';
const VIOLET = '#7B00D1';
const DEEP   = '#0F001E';

function Tag({ label, color }) {
  return (
    <span style={{
      fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
      textTransform: 'uppercase', letterSpacing: '0.1em',
      padding: '4px 10px', border: `1px solid ${color}40`,
      borderRadius: 4, color, fontWeight: 700, background: `${color}0D`,
    }}>
      {label}
    </span>
  );
}

// ── Responsive Tableau embed via their official JS API ────────────────────
// The viz_v1.js script makes the viz truly responsive and fit the container.
// This avoids the fixed-height iframe truncation problem.
function TableauEmbed() {
  const containerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Build the Tableau <object> element programmatically
    const vizObj = document.createElement('object');
    vizObj.className = 'tableauViz';
    // Start hidden; the Tableau script will make it visible and size it
    vizObj.style.cssText = 'display:none;width:100%;';

    const params = [
      ['host_url',             'https%3A%2F%2Fpublic.tableau.com%2F'],
      ['embed_code_version',   '3'],
      ['name',                 'LancelotNaipierKaneTableauDemo/TableauDemoDashboardMAIN'],
      ['tabs',                 'no'],
      ['toolbar',              'yes'],
      ['animate_transition',   'yes'],
      ['display_count',        'yes'],
      ['display_static_image', 'yes'],  // Fallback image while loading
      ['bootstrap',            'yes'],
      ['language',             'en-US'],
    ];
    params.forEach(([name, value]) => {
      const p = document.createElement('param');
      p.name = name; p.value = value;
      vizObj.appendChild(p);
    });

    container.appendChild(vizObj);

    // Dynamically size the viz to match container width (Tableau standard pattern)
    const resize = () => {
      if (!container) return;
      const w = container.offsetWidth;
      // Tableau desktop dashboards are typically wider than tall; 4:3 is safe
      const h = Math.max(500, Math.round(w * 0.72));
      vizObj.style.width  = w + 'px';
      vizObj.style.height = h + 'px';
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Inject Tableau's viz_v1.js (idempotent — safe to call multiple times)
    let script = document.getElementById('tableau-viz-script');
    if (!script) {
      script = document.createElement('script');
      script.id = 'tableau-viz-script';
      script.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';
      script.async = true;
      script.onload = () => setLoaded(true);
      script.onerror = () => setErrored(true);
      vizObj.parentNode.insertBefore(script, vizObj);
    } else {
      setLoaded(true);
    }

    return () => {
      ro.disconnect();
      if (container.contains(vizObj)) container.removeChild(vizObj);
    };
  }, []);

  return (
    <div style={{ position: 'relative', background: '#f8f9fa', borderRadius: '0 0 10px 10px', minHeight: 400 }}>
      {/* Loading placeholder */}
      {!loaded && !errored && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12, zIndex: 2,
          background: '#f8f9fa',
        }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid rgba(184,0,78,0.15)`, borderTopColor: PINK, animation: 'db-spin 0.8s linear infinite' }} />
          <span style={{ fontSize: '0.78rem', fontFamily: 'JetBrains Mono, monospace', color: PINK, fontWeight: 700 }}>
            Loading Tableau Dashboard…
          </span>
          <style>{`@keyframes db-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
      {errored && (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: PINK, fontSize: '0.85rem', margin: 0 }}>
            Could not load Tableau embed. Please check your network and try refreshing.
          </p>
        </div>
      )}
      {/* Tableau injects the viz here */}
      <div
        ref={containerRef}
        style={{ width: '100%', overflow: 'hidden' }}
      />
    </div>
  );
}

export default function DashboardsSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Tableau Dashboard ────────────────────────────────────────────── */}
      <div style={{
        borderRadius: '0.75rem', border: `2px solid rgba(184,0,78,0.25)`,
        background: 'rgba(255,255,255,0.97)', overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(15,0,30,0.05)',
      }}>
        <div style={{
          padding: '1.25rem', borderBottom: '1px solid rgba(184,0,78,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: DEEP }}>Tableau Dashboard</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: PINK, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
              Sales Dataset · Interactive Visualization
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Tag label="Tableau" color={PINK} />
            <Tag label="Sales Analytics" color={PINK} />
            <Tag label="Data Viz" color={PINK} />
          </div>
        </div>

        {/* Responsive Tableau embed — fills frame width, vertical scroll only */}
        <TableauEmbed />

        <div style={{ padding: '1rem 1.25rem', background: 'rgba(184,0,78,0.02)' }}>
          <a
            href="https://github.com/lancelot-nk/lancelot-nk.github.io/blob/main/LancelotNaipierKaneTableauDemo.twb"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace',
              color: PINK, fontWeight: 700, textDecoration: 'none', transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.65'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Download style={{ width: 14, height: 14 }} /> Download Tableau Workbook (.twb)
          </a>
        </div>
      </div>

      {/* ── Power BI Dashboard ───────────────────────────────────────────── */}
      <div style={{
        borderRadius: '0.75rem', border: `2px solid rgba(123,0,209,0.25)`,
        background: 'rgba(255,255,255,0.97)', overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(15,0,30,0.05)',
      }}>
        <div style={{
          padding: '1.25rem', borderBottom: '1px solid rgba(123,0,209,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: DEEP }}>Power BI Dashboard</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: VIOLET, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
              Sales Dataset · Business Intelligence
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Tag label="Power BI" color={VIOLET} />
            <Tag label="Business Intel" color={VIOLET} />
            <Tag label="DAX" color={VIOLET} />
          </div>
        </div>

        <div style={{ position: 'relative', paddingBottom: '38%', background: DEEP }}>
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=500&fit=crop&q=80"
            alt="Power BI"
            loading="lazy"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }}
          />
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 15, padding: '2rem', textAlign: 'center',
          }}>
            <p style={{ color: '#fff', fontSize: '0.85rem', margin: 0, fontWeight: 500, opacity: 0.9 }}>
              Power BI requires organizational authentication for live embeds.<br />
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                Download the .pbix source file to view in Power BI Desktop.
              </span>
            </p>
            <a
              href="/LancelotNaipierKanePowerBIDemo.pbix"
              download
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '10px 24px', border: `2px solid ${VIOLET}`,
                borderRadius: 999, fontSize: '0.8rem',
                fontFamily: 'JetBrains Mono, monospace', color: '#fff', fontWeight: 800,
                textDecoration: 'none', background: VIOLET,
                boxShadow: '0 4px 12px rgba(123,0,209,0.3)', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <Download style={{ width: 16, height: 16 }} /> Download .pbix Source File
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
