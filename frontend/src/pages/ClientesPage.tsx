import { useEffect, useState } from 'react'
import { api } from '../api/client'
import CasoForm from '../components/CasoForm'
import ClienteForm from '../components/ClienteForm'
import { EmptyState, Feedback, Loading, StatusBadge } from '../components/Common'
import Modal from '../components/Modal'
import TurnoForm from '../components/TurnoForm'
import type { Caso, Cliente, ClienteDetalle } from '../types'
import { fecha, fechaHora } from '../utils'

type ModalType = 'crear' | 'editar' | 'caso' | 'turno' | null

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [casos, setCasos] = useState<Caso[]>([])
  const [detalle, setDetalle] = useState<ClienteDetalle>()
  const [buscar, setBuscar] = useState('')
  const [modal, setModal] = useState<ModalType>(null)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string }>()

  async function load(search = buscar, keepId?: string) {
    try {
      const [items, allCasos] = await Promise.all([api.clientes(search), api.casos()])
      setClientes(items); setCasos(allCasos)
      const id = keepId ?? detalle?.cliente.id
      if (id && items.some((x) => x.id === id)) setDetalle(await api.cliente(id)); else setDetalle(undefined)
    } catch (e) { setFeedback({ type: 'error', text: e instanceof Error ? e.message : 'No se pudieron cargar los clientes.' }) }
    finally { setLoading(false) }
  }
  useEffect(() => { void load('') }, [])

  async function seleccionar(id: string) {
    try { setDetalle(await api.cliente(id)) }
    catch (e) { setFeedback({ type: 'error', text: e instanceof Error ? e.message : 'No se pudo abrir el cliente.' }) }
  }
  const saved = (text: string) => { const id = detalle?.cliente.id; setModal(null); setFeedback({ type: 'success', text }); void load(buscar, id) }
  async function eliminar() {
    if (!detalle || !window.confirm(`¿Eliminar a ${detalle.cliente.nombreCompleto}?`)) return
    try { await api.eliminarCliente(detalle.cliente.id); setFeedback({ type: 'success', text: 'Cliente eliminado.' }); setDetalle(undefined); await load(buscar) }
    catch (e) { setFeedback({ type: 'error', text: e instanceof Error ? e.message : 'No se pudo eliminar.' }) }
  }

  return <>
    <header className="page-header"><div><p className="eyebrow">Directorio</p><h1>Clientes</h1><p>Datos de contacto, casos y próximas consultas en un solo lugar.</p></div><button className="button primary" onClick={() => setModal('crear')}>+ Nuevo cliente</button></header>
    {feedback && <Feedback type={feedback.type}>{feedback.text}</Feedback>}
    <div className="split-layout">
      <section className="panel list-panel">
        <form className="search" onSubmit={(e) => { e.preventDefault(); void load(buscar) }}><span>⌕</span><input value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Buscar por nombre, DNI o email" /><button>Buscar</button></form>
        {loading ? <Loading /> : clientes.length ? <div className="client-list">{clientes.map((c) => <button key={c.id} className={`client-row ${detalle?.cliente.id === c.id ? 'selected' : ''}`} onClick={() => void seleccionar(c.id)}><span className="avatar">{c.nombreCompleto.slice(0, 2).toUpperCase()}</span><span><strong>{c.nombreCompleto}</strong><small>{c.email}</small></span><span className="chevron">›</span></button>)}</div> : <EmptyState title="No encontramos clientes" text="Probá otra búsqueda o agregá el primero." />}
      </section>
      <section className="panel detail-panel">
        {!detalle ? <EmptyState title="Seleccioná un cliente" text="Su información, casos y turnos aparecerán acá." /> : <>
          <div className="detail-hero"><span className="avatar large">{detalle.cliente.nombreCompleto.slice(0, 2).toUpperCase()}</span><div><p className="eyebrow">Ficha del cliente</p><h2>{detalle.cliente.nombreCompleto}</h2><p>{detalle.cliente.email} · {detalle.cliente.telefono || 'Sin teléfono'}</p></div></div>
          <div className="detail-actions"><button className="button secondary small" onClick={() => setModal('editar')}>Editar</button><button className="button ghost small" onClick={() => setModal('caso')}>+ Caso</button><button className="button ghost small" onClick={() => setModal('turno')}>+ Turno</button><button className="link-button danger-text" onClick={() => void eliminar()}>Eliminar</button></div>
          <dl className="info-grid"><div><dt>DNI</dt><dd>{detalle.cliente.dni || 'No informado'}</dd></div><div><dt>Alta</dt><dd>{fecha(detalle.cliente.createdAt.slice(0, 10))}</dd></div><div className="span-2"><dt>Notas</dt><dd>{detalle.cliente.notas || 'Sin notas adicionales.'}</dd></div></dl>
          <div className="subsection"><h3>Casos asociados <span>{detalle.casos.length}</span></h3>{detalle.casos.length ? detalle.casos.map((c) => <div className="mini-row" key={c.id}><div><strong>{c.titulo}</strong><small>{c.tipo} · {c.prioridad}</small></div><StatusBadge value={c.estado} /></div>) : <p className="muted">Todavía no tiene casos.</p>}</div>
          <div className="subsection"><h3>Próximos turnos <span>{detalle.proximosTurnos.length}</span></h3>{detalle.proximosTurnos.length ? detalle.proximosTurnos.map((t) => <div className="mini-row" key={t.id}><div><strong>{fechaHora(t.fechaHoraInicio)}</strong><small>{t.motivo}</small></div><StatusBadge value={t.estado} /></div>) : <p className="muted">No hay turnos futuros activos.</p>}</div>
        </>}
      </section>
    </div>
    {modal === 'crear' && <Modal title="Nuevo cliente" eyebrow="Clientes" onClose={() => setModal(null)}><ClienteForm onSaved={saved} onCancel={() => setModal(null)} /></Modal>}
    {modal === 'editar' && detalle && <Modal title="Editar cliente" eyebrow="Clientes" onClose={() => setModal(null)}><ClienteForm cliente={detalle.cliente} onSaved={saved} onCancel={() => setModal(null)} /></Modal>}
    {modal === 'caso' && detalle && <Modal title="Abrir un caso" eyebrow={detalle.cliente.nombreCompleto} onClose={() => setModal(null)}><CasoForm clientes={clientes} clienteInicial={detalle.cliente.id} onSaved={saved} onCancel={() => setModal(null)} /></Modal>}
    {modal === 'turno' && detalle && <Modal title="Agendar turno" eyebrow={detalle.cliente.nombreCompleto} onClose={() => setModal(null)}><TurnoForm clientes={clientes} casos={casos} clienteInicial={detalle.cliente.id} onSaved={saved} onCancel={() => setModal(null)} /></Modal>}
  </>
}
