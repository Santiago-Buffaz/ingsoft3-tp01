import { NavLink, Route, Routes } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import ClientesPage from './pages/ClientesPage'
import CasosPage from './pages/CasosPage'

export default function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">L</span>
          <span><strong>LexAgenda</strong><small>Estudio jurídico</small></span>
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
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/casos" element={<CasosPage />} />
        </Routes>
      </main>
    </div>
  )
}
