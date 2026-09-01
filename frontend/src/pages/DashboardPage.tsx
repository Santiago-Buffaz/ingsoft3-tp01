import { useEffect, useState } from 'react'
import { api } from '../api/client'
import CasoForm from '../components/CasoForm'
import ClienteForm from '../components/ClienteForm'
import { EmptyState, Feedback, Loading, StatusBadge } from '../components/Common'
import Modal from '../components/Modal'
import TurnoForm from '../components/TurnoForm'
import type { Caso, Cliente, DashboardData, EstadoTurno, Turno } from '../types'
import { fechaHora, hora } from '../utils'

type OpenModal = 'cliente' | 'caso' | 'turno' | null

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [casos, setCasos] = useState<Caso[]>([])
  const [modal, setModal] = useState<OpenModal>(null)
  const [turnoEdit, setTurnoEdit] = useState<Turno>()
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string }>()

  async function load() {
    try {
      const [dashboard, allClientes, allCasos] = await Promise.all([api.dashboard(), api.clientes(), api.casos()])
      setData(dashboard); setClientes(allClientes); setCasos(allCasos)
    } catch (e) { setFeedback({ type: 'error', text: e instanceof Error ? e.message : 'No se pudo cargar la agenda.' }) }
  }
  useEffect(() => { void load() }, [])

  const saved = (text: string) => { setModal(null); setTurnoEdit(undefined); setFeedback({ type: 'success', text }); void load() }
  async function cambiarTurno(turno: Turno, estado: EstadoTurno) {
    try { await api.cambiarEstadoTurno(turno.id, estado); setFeedback({ type: 'success', text: 'Estado del turno actualizado.' }); await load() }
    catch (e) { setFeedback({ type: 'error', text: e instanceof Error ? e.message : 'No se pudo actualizar.' }) }
  }

  const encabezadoFecha = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date())

  const renderTurno = (turno: Turno, compact = false) => <article className="appointment" key={turno.id}>
    <div className="appointment-time"><strong>{compact ? hora(turno.fechaHoraInicio) : fechaHora(turno.fechaHoraInicio)}</strong><span>{turno.duracionMinutos} min</span></div>
    <div className="appointment-main"><strong>{turno.clienteNombre}</strong><span>{turno.motivo}</span>{turno.casoTitulo && <small>{turno.casoTitulo}</small>}</div>
    <StatusBadge value={turno.estado} />
    <div className="row-actions">
      {(turno.estado === 'PENDIENTE' || turno.estado === 'CONFIRMADO') && <button className="link-button" onClick={() => { setTurnoEdit(turno); setModal('turno') }}>Editar</button>}
      {turno.estado === 'PENDIENTE' && <button className="link-button" onClick={() => void cambiarTurno(turno, 'CONFIRMADO')}>Confirmar</button>}
      {turno.estado === 'CONFIRMADO' && <button className="link-button" onClick={() => void cambiarTurno(turno, 'REALIZADO')}>Realizado</button>}
      {(turno.estado === 'PENDIENTE' || turno.estado === 'CONFIRMADO') && <button className="link-button danger-text" onClick={() => void cambiarTurno(turno, 'CANCELADO')}>Cancelar</button>}
    </div>
  </article>

  return <>
    <header className="page-header">
      <div><p className="eyebrow">{encabezadoFecha} · Agenda del estudio</p><h1>Buen día</h1><p>Un panorama claro para organizar la jornada.</p></div>
      <button className="button primary" onClick={() => setModal('turno')}>+ Nuevo turno</button>
    </header>
    {feedback && <Feedback type={feedback.type}>{feedback.text}</Feedback>}
    {!data ? <Loading /> : <>
      <section className="stats-grid" aria-label="Resumen">
        <div className="stat-card"><span className="stat-icon teal">□</span><div><strong>{data.casosAbiertos}</strong><p>Casos abiertos</p></div></div>
        <div className="stat-card"><span className="stat-icon gold">↗</span><div><strong>{data.casosEnProceso}</strong><p>En proceso</p></div></div>
        <div className="stat-card"><span className="stat-icon blue">◷</span><div><strong>{data.turnosHoy}</strong><p>Turnos de hoy</p></div></div>
        <div className="stat-card"><span className="stat-icon rose">→</span><div><strong>{data.proximosTurnosCantidad}</strong><p>Próximos turnos</p></div></div>
      </section>
      <section className="quick-actions">
        <span>Accesos rápidos</span>
        <button onClick={() => setModal('cliente')}>+ Nuevo cliente</button>
        <button onClick={() => setModal('caso')}>+ Nuevo caso</button>
        <button onClick={() => setModal('turno')}>+ Nuevo turno</button>
      </section>
      <div className="dashboard-grid">
        <section className="panel"><div className="panel-heading"><div><p className="eyebrow">Hoy</p><h2>Turnos de hoy</h2></div><span>{data.turnosDeHoy.length} agendados</span></div>
          {data.turnosDeHoy.length ? <div className="appointment-list">{data.turnosDeHoy.map((x) => renderTurno(x, true))}</div> : <EmptyState title="Jornada despejada" text="No hay turnos para hoy." />}
        </section>
        <section className="panel"><div className="panel-heading"><div><p className="eyebrow">Próximos días</p><h2>Lo que viene</h2></div></div>
          {data.proximosTurnos.length ? <div className="appointment-list">{data.proximosTurnos.map((x) => renderTurno(x))}</div> : <EmptyState title="Sin próximos turnos" text="Agendá una consulta para verla acá." />}
        </section>
      </div>
    </>}
    {modal === 'cliente' && <Modal title="Nuevo cliente" eyebrow="Clientes" onClose={() => setModal(null)}><ClienteForm onSaved={saved} onCancel={() => setModal(null)} /></Modal>}
    {modal === 'caso' && <Modal title="Abrir un caso" eyebrow="Expedientes" onClose={() => setModal(null)}><CasoForm clientes={clientes} onSaved={saved} onCancel={() => setModal(null)} /></Modal>}
    {modal === 'turno' && <Modal title={turnoEdit ? 'Editar turno' : 'Agendar turno'} eyebrow="Agenda" onClose={() => { setModal(null); setTurnoEdit(undefined) }}><TurnoForm clientes={clientes} casos={casos} turno={turnoEdit} onSaved={saved} onCancel={() => { setModal(null); setTurnoEdit(undefined) }} /></Modal>}
  </>
}
