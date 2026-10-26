import { NavLink, Route, Routes } from 'react-router-dom'
import { withSentryReactRouterV7Routing } from '@sentry/react'
import DashboardPage from './pages/DashboardPage'
import ClientesPage from './pages/ClientesPage'
import CasosPage from './pages/CasosPage'

const SentryRoutes = withSentryReactRouterV7Routing(Routes)

export default function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">L</span>
          <span><strong>LexAgenda</strong><small>Agenda del estudio</small></span>
        </div>
        <nav aria-label="Navegación principal">
          <NavLink to="/" end><span>⌂</span> Agenda</NavLink>
          <NavLink to="/clientes"><span>◎</span> Clientes</NavLink>
          <NavLink to="/casos"><span>□</span> Casos</NavLink>
        </nav>
        <div className="sidebar-note">
          <span className="online-dot" /> Sistema disponible
        </div>
      </aside>
      <main className="content">
        <SentryRoutes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/casos" element={<CasosPage />} />
        </SentryRoutes>
      </main>
    </div>
  )
}
