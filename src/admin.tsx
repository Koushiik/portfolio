import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AdminApp from './AdminApp'
import { PORTFOLIO_CONTENT_DEFAULTS, getCmsConfig } from './contentConfig'
import './styles/admin.css'

window.PORTFOLIO_CONTENT_DEFAULTS = { ...PORTFOLIO_CONTENT_DEFAULTS }
window.PORTFOLIO_CMS_CONFIG = getCmsConfig()

createRoot(document.getElementById('admin-root')!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
)
