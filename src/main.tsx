import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Suppress harmless Monaco Editor cancellation errors
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason &&
    typeof event.reason === 'object' &&
    'message' in event.reason &&
    typeof event.reason.message === 'string' &&
    event.reason.message.includes('Canceled')
  ) {
    event.preventDefault()
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
