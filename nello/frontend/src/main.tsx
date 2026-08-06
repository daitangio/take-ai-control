import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nProvider } from '@lingui/react'
import './index.css'
import App from './App.tsx'
import { dynamicActivate, getStoredLocale, i18n } from './i18n'

await dynamicActivate(getStoredLocale())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider i18n={i18n}>
      <App />
    </I18nProvider>
  </StrictMode>,
)
