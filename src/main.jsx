import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

/**
 * Entry point for the Portfolio Application.
 * StrictMode is enabled to help catch common bugs during development,
 * such as memory leaks in the ParticleField canvas or Nexus animations.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)