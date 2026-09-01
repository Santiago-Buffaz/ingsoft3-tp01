import { useEffect, useState } from 'react'
import { api } from '../api/client'
import CasoForm from '../components/CasoForm'
import { EmptyState, Feedback, Loading, StatusBadge } from '../components/Common'
import Modal from '../components/Modal'
import type { Caso, Cliente, EstadoCaso, PrioridadCaso } from '../types'
import { etiquetas, fecha } from '../utils'

export default function CasosPage() {
  const [casos, setCasos] = useState<Caso[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [estado, setEstado] = useState<EstadoCaso | ''>('')
  const [prioridad, setPrioridad] = useState<PrioridadCaso | ''>('')
  const [selected, setSelected] = useState<Caso>()
  const [editing, setEditing] = useState<Caso>()
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string }>()

  async function load(nextEstado = estado, nextPrioridad = prioridad) {
    try { const [items, people] = await Promise.all([api.casos(nextEstado, nextPrioridad), api.clientes()]); setCasos(items); setClientes(people); if (selected) setSelected(items.find((x) => x.id === selected.id)) }
    catch (e) { setFeedback({ type: 'error', text: e instanceof Error ? e.message : 'No se pudieron cargar los casos.' }) }
    finally { setLoading(false) }
  }
  useEffect(() => { void load('', '') }, [])
  const saved = (text: string) => { setCreating(false); setEditing(undefined); setFeedback({ type: 'success', text }); void load() }
  async function avanzar(caso: Caso) {
    const siguiente: EstadoCaso = caso.estado === 'ABIERTO' ? 'EN_PROCESO' : 'CERRADO'
    try { await api.cambiarEstadoCaso(caso.id, siguiente); setFeedback({ type: 'success', text: `Caso actualizado a ${etiquetas[siguiente].toLowerCase()}.` }); await load() }
    catch (e) { setFeedback({ type: 'error', text: e instanceof Error ? e.message : 'No se pudo cambiar el estado.' }) }
  }

  return <>
    <header className="page-header"><div><p className="eyebrow">Expedientes</p><h1>Casos</h1><p>Seguimiento simple de asuntos, prioridades y vencimientos.</p></div><button className="button primary" onClick={() => setCreating(true)}>+ Nuevo caso</button></header>
    {feedback && <Feedback type={feedback.type}>{feedback.text}</Feedback>}
    <section className="panel">
      <div className="filter-bar"><label><span>Estado</span><select value={estado} onChange={(e) => { const v = e.target.value as EstadoCaso | ''; setEstado(v); void load(v, prioridad) }}><option value="">Todos</option><option value="ABIERTO">Abiertos</option><option value="EN_PROCESO">En proceso</option><option value="CERRADO">Cerrados</option></select></label><label><span>Prioridad</span><select value={prioridad} onChange={(e) => { const v = e.target.value as PrioridadCaso | ''; setPrioridad(v); void load(estado, v) }}><option value="">Todas</option><option value="ALTA">Alta</option><option value="MEDIA">Media</option><option value="BAJA">Baja</option></select></label><span className="result-count">{casos.length} resultados</span></div>
      {loading ? <Loading /> : casos.length ? <div className="table-wrap"><table><thead><tr><th>Caso</th><th>Cliente</th><th>Tipo</th><th>Prioridad</th><th>Estado</th><th>Próximo vencimiento</th><th></th></tr></thead><tbody>{casos.map((c) => <tr key={c.id}><td><button className="case-title" onClick={() => setSelected(c)}>{c.titulo}</button></td><td>{c.clienteNombre}</td><td>{etiquetas[c.tipo]}</td><td><StatusBadge value={c.prioridad} /></td><td><StatusBadge value={c.estado} /></td><td>{c.fechaProximoVencimiento ? fecha(c.fechaProximoVencimiento) : <span className="muted">Sin fecha</span>}</td><td><div className="row-actions">{c.estado !== 'CERRADO' && <button className="link-button" onClick={() => setEditing(c)}>Editar</button>}{c.estado === 'ABIERTO' && <button className="button tiny" onClick={() => void avanzar(c)}>Pasar a En Proceso</button>}{c.estado === 'EN_PROCESO' && <button className="button tiny dark" onClick={() => void avanzar(c)}>Cerrar caso</button>}</div></td></tr>)}</tbody></table></div> : <EmptyState title="No hay casos para mostrar" text="Cambiá los filtros o abrí un nuevo caso." />}
    </section>
    {creating && <Modal title="Abrir un caso" eyebrow="Expedientes" onClose={() => setCreating(false)}><CasoForm clientes={clientes} onSaved={saved} onCancel={() => setCreating(false)} /></Modal>}
    {editing && <Modal title="Editar caso" eyebrow={editing.clienteNombre} onClose={() => setEditing(undefined)}><CasoForm clientes={clientes} caso={editing} onSaved={saved} onCancel={() => setEditing(undefined)} /></Modal>}
    {selected && <Modal title={selected.titulo} eyebrow={`Caso ${etiquetas[selected.estado]}`} onClose={() => setSelected(undefined)}><div className="case-detail"><div className="detail-badges"><StatusBadge value={selected.tipo} /><StatusBadge value={selected.prioridad} /><StatusBadge value={selected.estado} /></div><dl className="info-grid"><div><dt>Cliente</dt><dd>{selected.clienteNombre}</dd></div><div><dt>Apertura</dt><dd>{fecha(selected.fechaApertura)}</dd></div><div><dt>Próximo vencimiento</dt><dd>{selected.fechaProximoVencimiento ? fecha(selected.fechaProximoVencimiento) : 'Sin fecha'}</dd></div><div className="span-2"><dt>Descripción</dt><dd>{selected.descripcion || 'Sin descripción.'}</dd></div></dl></div></Modal>}
  </>
}
