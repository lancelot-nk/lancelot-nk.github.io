import { Component, Suspense } from 'react';

const PINK   = '#B8004E';
const SOFT   = '#6A0A50';
const BORDER = 'rgba(184,0,78,0.18)';

// ── Error boundary so a broken component doesn't crash the whole page ──────
class JsxErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(err) { return { error: err }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: '#c00', fontSize: '0.82rem', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>
            Component error: {this.state.error.message}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

function JsxFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem', gap: 10 }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%',
        border: `2px solid ${BORDER}`, borderTopColor: PINK,
        animation: 'jsx-spin 0.7s linear infinite',
      }} />
      <span style={{ fontSize: '0.82rem', fontFamily: 'JetBrains Mono, monospace', color: SOFT }}>
        Loading component…
      </span>
      <style>{`@keyframes jsx-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/**
 * JsxViewer — renders a lazily-imported React component inside a constrained
 * scroll container. The caller passes the already-`React.lazy()`-wrapped
 * component as `LazyComponent`; this wrapper adds Suspense + error boundary.
 */
export default function JsxViewer({ LazyComponent }) {
  if (!LazyComponent) return null;
  return (
    <>
      <style>{`
        .jsx-viewer-wrap { border-top: 1px solid ${BORDER}; max-height: 70vh; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch; contain: content; border-radius: 0 0 12px 12px; }
        .jsx-viewer-wrap::-webkit-scrollbar { width: 12px; }
        .jsx-viewer-wrap::-webkit-scrollbar-track { background: ${DEEP}; border-radius: 6px; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02); }
        .jsx-viewer-wrap::-webkit-scrollbar-thumb { background: linear-gradient(180deg, ${PINK} 0%, ${VIOLET} 100%); border-radius: 6px; border: 3px solid ${DEEP}; box-shadow: inset 0 0 8px rgba(0,0,0,0.35); }
        .jsx-viewer-wrap::-webkit-scrollbar-thumb:hover { filter: brightness(1.08); }
        .jsx-viewer-wrap { scrollbar-width: thin; scrollbar-color: ${PINK} ${DEEP}; }
      `}</style>
      <div className="jsx-viewer-wrap">
        <JsxErrorBoundary>
          <Suspense fallback={<JsxFallback />}>
            <LazyComponent />
          </Suspense>
        </JsxErrorBoundary>
      </div>
    </>
  );
}
