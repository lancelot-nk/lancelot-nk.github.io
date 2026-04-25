import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  componentDidCatch(e, info) { console.error('[ErrorBoundary]', e, info); }
  render() {
    if (this.state.error) {
      return React.createElement('div', {
        style: { padding: 40, fontFamily: 'monospace', background: '#0F001E', color: '#E01880', minHeight: '100vh' }
      }, [
        React.createElement('h2', { key: 'h' }, '⚠ Render Error'),
        React.createElement('pre', { key: 'p', style: { whiteSpace: 'pre-wrap', color: '#fff', fontSize: 13 } },
          String(this.state.error?.message || this.state.error)
        )
      ]);
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)