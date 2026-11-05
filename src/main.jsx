import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/big-shoulders-display'
import '@fontsource/barlow/400.css'
import '@fontsource/barlow/500.css'
import '@fontsource/barlow/600.css'
import '@fontsource/barlow/700.css'
import './lib/install.js' // catches Chrome's install offer before the pass screen loads
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Dev skips it so Vite hot reload never gets served stale files.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
