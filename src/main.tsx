import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { I18nProvider } from './lib/i18n'
import { AuthProvider } from './lib/auth'

// Force HTTPS. Web Crypto (used for the staff login) only exists in a secure
// context — over plain http, crypto.subtle is undefined and login silently
// fails (the Chrome-over-http symptom). Redirect before the app renders.
if (
  typeof location !== 'undefined' &&
  location.protocol === 'http:' &&
  location.hostname !== 'localhost' &&
  location.hostname !== '127.0.0.1'
) {
  location.replace(location.href.replace(/^http:/, 'https:'))
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </I18nProvider>
  </StrictMode>,
)
