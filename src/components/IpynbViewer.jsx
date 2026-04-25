import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

const PINK   = '#B8004E';
const DEEP   = '#0F001E';
const MID    = '#320040';
const SOFT   = '#6A0A50';
const BORDER = 'rgba(184,0,78,0.18)';

// ── Lightweight Ipynb Cell Renderer ────────────────────────────────────────
// Fetches a .ipynb file, parses its cells, and renders them inline.
// Markdown cells → react-markdown, Code cells → styled pre/code,
// Output cells → text/stream/image renders.
// ─────────────────────────────────────────────────────────────────────────

function joinSource(src) {
  return Array.isArray(src) ? src.join('') : (src || '');
}

function CellOutput({ output }) {
  if (!output) return null;
  const { output_type, data, text } = output;

  if (output_type === 'stream' || output_type === 'execute_result') {
    const raw = text || data?.['text/plain'];
    const str = Array.isArray(raw) ? raw.join('') : (raw || '');
    if (!str.trim()) return null;
    return (
      <pre style={{
        margin: '0 0 0 0',
        padding: '8px 12px',
        background: '#f9f5ff',
        borderLeft: `3px solid ${BORDER}`,
        fontSize: '0.72rem',
        fontFamily: 'JetBrains Mono, monospace',
        color: SOFT,
        overflowX: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        lineHeight: 1.5,
      }}>{str}</pre>
    );
  }

  if (output_type === 'display_data' || output_type === 'execute_result') {
    const png = data?.['image/png'];
    if (png) {
      return (
        <img
          src={`data:image/png;base64,${png}`}
          alt="Cell output"
          loading="lazy"
          style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '6px 0', borderRadius: 6 }}
        />
      );
    }
    const html = data?.['text/html'];
    if (html) {
      const htmlStr = Array.isArray(html) ? html.join('') : html;
      return (
        <div
          style={{ overflowX: 'auto', fontSize: '0.8rem', color: DEEP, margin: '6px 0' }}
          dangerouslySetInnerHTML={{ __html: htmlStr }}
        />
      );
    }
  }

  if (output_type === 'error') {
    const tb = output.traceback || [];
    const clean = tb.map(l => l.replace(/\x1b\[[0-9;]*m/g, '')).join('\n');
    return (
      <pre style={{
        margin: '4px 0', padding: '8px 12px', background: '#fff5f5',
        borderLeft: '3px solid #ff4d4d', fontSize: '0.7rem',
        fontFamily: 'JetBrains Mono, monospace', color: '#c00', whiteSpace: 'pre-wrap',
      }}>{clean}</pre>
    );
  }
  return null;
}

const mdComponents = {
  h1: ({ children }) => (
    <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: DEEP, margin: '1rem 0 0.4rem', lineHeight: 1.3 }}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: DEEP, margin: '0.9rem 0 0.35rem' }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: MID, margin: '0.8rem 0 0.3rem' }}>{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: SOFT, margin: '0.7rem 0 0.25rem' }}>{children}</h4>
  ),
  p: ({ children }) => (
    <p style={{ fontSize: '0.87rem', color: MID, lineHeight: 1.7, margin: '0 0 0.6rem' }}>{children}</p>
  ),
  ul: ({ children }) => (
    <ul style={{ paddingLeft: '1.4rem', margin: '0 0 0.6rem', fontSize: '0.87rem', color: MID, lineHeight: 1.7 }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ paddingLeft: '1.4rem', margin: '0 0 0.6rem', fontSize: '0.87rem', color: MID, lineHeight: 1.7 }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: '0.2rem' }}>{children}</li>
  ),
  strong: ({ children }) => (
    <strong style={{ color: DEEP, fontWeight: 700 }}>{children}</strong>
  ),
  em: ({ children }) => (
    <em style={{ color: SOFT }}>{children}</em>
  ),
  code: ({ inline, children }) => {
    if (inline) {
      return (
        <code style={{
          background: 'rgba(184,0,78,0.07)', padding: '1px 5px', borderRadius: 4,
          fontSize: '0.82em', fontFamily: 'JetBrains Mono, monospace', color: PINK,
        }}>{children}</code>
      );
    }
    return (
      <pre style={{
        background: '#1A0028', borderRadius: 8, padding: '12px 14px', margin: '0.5rem 0',
        overflowX: 'auto', fontSize: '0.78rem',
        fontFamily: 'JetBrains Mono, monospace', color: '#E8C0FF', lineHeight: 1.6, whiteSpace: 'pre-wrap',
      }}>
        <code>{children}</code>
      </pre>
    );
  },
  pre: ({ children }) => <>{children}</>,
  blockquote: ({ children }) => (
    <blockquote style={{
      borderLeft: `3px solid ${PINK}`, marginLeft: 0, paddingLeft: '1rem',
      color: SOFT, fontStyle: 'italic', fontSize: '0.87rem',
    }}>{children}</blockquote>
  ),
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', margin: '0.6rem 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', color: DEEP }}>{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th style={{ padding: '6px 10px', background: 'rgba(184,0,78,0.08)', fontWeight: 700, borderBottom: `2px solid ${BORDER}`, textAlign: 'left' }}>{children}</th>
  ),
  td: ({ children }) => (
    <td style={{ padding: '5px 10px', borderBottom: `1px solid ${BORDER}` }}>{children}</td>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: PINK, textDecoration: 'underline' }}>{children}</a>
  ),
  hr: () => <hr style={{ border: 'none', borderTop: `1px solid ${BORDER}`, margin: '0.8rem 0' }} />,
};

function CodeCell({ source, outputs }) {
  const [showOutput, setShowOutput] = useState(true);
  const hasOutputs = outputs && outputs.length > 0;

  return (
    <div style={{ margin: '0 0 0.75rem' }}>
      <pre style={{
        background: '#1A0028', borderRadius: hasOutputs ? '8px 8px 0 0' : '8px',
        padding: '10px 14px', margin: 0, overflowX: 'auto',
        fontSize: '0.78rem', fontFamily: 'JetBrains Mono, monospace',
        color: '#E8C0FF', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>
        <code>{source}</code>
      </pre>
      {hasOutputs && showOutput && (
        <div style={{ borderLeft: `3px solid rgba(184,0,78,0.3)`, borderRight: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
          {outputs.map((out, j) => <CellOutput key={j} output={out} />)}
        </div>
      )}
      {hasOutputs && (
        <button
          onClick={() => setShowOutput(v => !v)}
          style={{
            display: 'block', marginTop: 3, fontSize: '0.65rem',
            fontFamily: 'JetBrains Mono, monospace', background: 'none', border: 'none',
            color: 'rgba(184,0,78,0.6)', cursor: 'pointer', padding: '2px 0',
            fontWeight: 700, letterSpacing: '0.04em',
          }}
        >
          {showOutput ? '▲ hide output' : '▼ show output'}
        </button>
      )}
    </div>
  );
}

export default function IpynbViewer({ src }) {
  const [notebook, setNotebook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!src) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    setNotebook(null);

    const controller = new AbortController();
    fetch(src, { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => { setNotebook(data); setLoading(false); })
      .catch(err => {
        if (err.name !== 'AbortError') { setError(err.message); setLoading(false); }
      });

    return () => controller.abort();
  }, [src]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: 12 }}>
        <div style={{
          width: 20, height: 20, border: `2px solid ${BORDER}`,
          borderTopColor: PINK, borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <span style={{ fontSize: '0.82rem', fontFamily: 'JetBrains Mono, monospace', color: SOFT }}>
          Loading notebook…
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ color: '#c00', fontSize: '0.82rem', margin: 0 }}>
          Failed to load notebook: {error}
        </p>
      </div>
    );
  }

  if (!notebook) return null;

  const cells = notebook.cells || [];

  return (
    <div
      ref={scrollRef}
      style={{
        maxHeight: '70vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '1.25rem 1.5rem',
        background: '#fff',
        borderRadius: '0 0 12px 12px',
        // Smooth scrolling performance
        WebkitOverflowScrolling: 'touch',
        contain: 'content',
      }}
    >
      {cells.length === 0 && (
        <p style={{ color: SOFT, fontSize: '0.85rem', textAlign: 'center' }}>No cells found in notebook.</p>
      )}
      {cells.map((cell, i) => {
        const source = joinSource(cell.source);
        if (!source.trim() && !cell.outputs?.length) return null;

        if (cell.cell_type === 'markdown') {
          return (
            <div key={i} style={{ marginBottom: '0.6rem' }}>
              <ReactMarkdown components={mdComponents}>{source}</ReactMarkdown>
            </div>
          );
        }

        if (cell.cell_type === 'code') {
          return (
            <CodeCell
              key={i}
              source={source}
              outputs={cell.outputs || []}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
