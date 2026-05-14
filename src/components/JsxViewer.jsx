import { Component, Suspense } from 'react';

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
        border: '2px solid rgba(184,0,78,0.18)', borderTopColor: '#B8004E',
        animation: 'jsx-spin 0.7s linear infinite',
      }} />
      <span style={{ fontSize: '0.82rem', fontFamily: 'JetBrains Mono, monospace', color: '#6A0A50' }}>
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
    <div style={{
      borderRadius: '0 0 12px 12px',
      width: '100%',
    }}>
      <JsxErrorBoundary>
        <Suspense fallback={<JsxFallback />}>
          <LazyComponent />
        </Suspense>
      </JsxErrorBoundary>
    </div>
  );
}
