import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import type { Caso, CasoPayload, Cliente, PrioridadCaso, TipoCaso } from '../types'
import { hoyInput } from '../utils'
import { Feedback } from './Common'

interface Props {
  clientes: Cliente[]
  caso?: Caso
  clienteInicial?: string
  onSaved: (message: string) => void
  onCancel: () => void
}

export default function CasoForm({ clientes, caso, clienteInicial, onSaved, onCancel }: Props) {
  const [form, setForm] = useState<CasoPayload>({
    clienteId: caso?.clienteId ?? clienteInicial ?? clientes[0]?.id ?? '', titulo: caso?.titulo ?? '',
    descripcion: caso?.descripcion ?? '', tipo: caso?.tipo ?? 'CIVIL', prioridad: caso?.prioridad ?? 'MEDIA',
    fechaApertura: caso?.fechaApertura ?? hoyInput(), fechaProximoVencimiento: caso?.fechaProximoVencimiento ?? '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const update = <K extends keyof CasoPayload>(key: K, value: CasoPayload[K]) => setForm((old) => ({ ...old, [key]: value }))

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      const payload = { ...form, fechaProximoVencimiento: form.fechaProximoVencimiento || null }
      if (caso) await api.editarCaso(caso.id, payload)
      else await api.crearCaso(payload)
      onSaved(caso ? 'Caso actualizado correctamente.' : 'Caso abierto correctamente.')
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar.') }
    finally { setSaving(false) }
  }

  return <form className="form" onSubmit={submit}>
    {error && <Feedback type="error">{error}</Feedback>}
    <label className="field span-2"><span>Cliente *</span><select required value={form.clienteId} onChange={(e) => update('clienteId', e.target.value)}><option value="">Seleccionar cliente</option>{clientes.map((c) => <option key={c.id} value={c.id}>{c.nombreCompleto}</option>)}</select></label>
    <label className="field span-2"><span>Título *</span><input required maxLength={180} value={form.titulo} onChange={(e) => update('titulo', e.target.value)} placeholder="Ej. Reclamo por incumplimiento contractual" /></label>
    <label className="field"><span>Tipo</span><select value={form.tipo} onChange={(e) => update('tipo', e.target.value as TipoCaso)}>{['CIVIL','LABORAL','FAMILIA','COMERCIAL','OTRO'].map((x) => <option key={x}>{x}</option>)}</select></label>
    <label className="field"><span>Prioridad</span><select value={form.prioridad} onChange={(e) => update('prioridad', e.target.value as PrioridadCaso)}>{['BAJA','MEDIA','ALTA'].map((x) => <option key={x}>{x}</option>)}</select></label>
    <label className="field"><span>Fecha de apertura</span><input type="date" required value={form.fechaApertura} onChange={(e) => update('fechaApertura', e.target.value)} /></label>
    <label className="field"><span>Próximo vencimiento</span><input type="date" min={form.fechaApertura} value={form.fechaProximoVencimiento ?? ''} onChange={(e) => update('fechaProximoVencimiento', e.target.value)} /></label>
    <label className="field span-2"><span>Descripción</span><textarea rows={4} value={form.descripcion} onChange={(e) => update('descripcion', e.target.value)} placeholder="Resumen breve del asunto" /></label>
    <div className="form-actions span-2"><button type="button" className="button secondary" onClick={onCancel}>Cancelar</button><button className="button primary" disabled={saving || !clientes.length}>{saving ? 'Guardando…' : caso ? 'Guardar cambios' : 'Abrir caso'}</button></div>
  </form>
}
