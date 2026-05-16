import { Suspense, lazy } from 'react';

const AlphaDAW = lazy(() => import('../projects/nearfinaldaw'));

function Loading() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#020617', gap: 12,
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        border: '2px solid rgba(139,92,246,0.3)', borderTopColor: '#8b5cf6',
        animation: 'daw-spin 0.7s linear infinite',
      }} />
      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace' }}>
        Loading Alpha DAW…
      </span>
      <style>{`@keyframes daw-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function DAWPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'auto', background: '#020617' }}>
      <Suspense fallback={<Loading />}>
        <AlphaDAW />
      </Suspense>
    </div>
  );
}
