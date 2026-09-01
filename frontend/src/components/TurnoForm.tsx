import { useMemo, useState, type FormEvent } from 'react'
import { api } from '../api/client'
import type { Caso, Cliente, Turno, TurnoPayload } from '../types'
import { fechaHoraInput } from '../utils'
import { Feedback } from './Common'

interface Props {
  clientes: Cliente[]
  casos: Caso[]
  turno?: Turno
  clienteInicial?: string
  onSaved: (message: string) => void
  onCancel: () => void
}

export default function TurnoForm({ clientes, casos, turno, clienteInicial, onSaved, onCancel }: Props) {
  const [localDate, setLocalDate] = useState(fechaHoraInput(turno?.fechaHoraInicio))
  const [form, setForm] = useState<Omit<TurnoPayload, 'fechaHoraInicio'>>({
    clienteId: turno?.clienteId ?? clienteInicial ?? clientes[0]?.id ?? '', casoId: turno?.casoId ?? '',
    duracionMinutos: turno?.duracionMinutos ?? 30, motivo: turno?.motivo ?? '', notas: turno?.notas ?? '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const casosCliente = useMemo(() => casos.filter((x) => x.clienteId === form.clienteId && x.estado !== 'CERRADO'), [casos, form.clienteId])
  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((old) => ({ ...old, [key]: value }))

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      const payload: TurnoPayload = { ...form, casoId: form.casoId || null, fechaHoraInicio: new Date(localDate).toISOString() }
      if (turno) await api.editarTurno(turno.id, payload)
      else await api.crearTurno(payload)
      onSaved(turno ? 'Turno actualizado correctamente.' : 'Turno agendado correctamente.')
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar.') }
    finally { setSaving(false) }
  }

  return <form className="form" onSubmit={submit}>
    {error && <Feedback type="error">{error}</Feedback>}
    <label className="field"><span>Cliente *</span><select required value={form.clienteId} onChange={(e) => { update('clienteId', e.target.value); update('casoId', '') }}><option value="">Seleccionar cliente</option>{clientes.map((c) => <option key={c.id} value={c.id}>{c.nombreCompleto}</option>)}</select></label>
    <label className="field"><span>Caso asociado</span><select value={form.casoId ?? ''} onChange={(e) => update('casoId', e.target.value)}><option value="">Sin caso asociado</option>{casosCliente.map((c) => <option key={c.id} value={c.id}>{c.titulo}</option>)}</select></label>
    <label className="field"><span>Fecha y hora *</span><input required type="datetime-local" value={localDate} onChange={(e) => setLocalDate(e.target.value)} /></label>
    <label className="field"><span>Duración</span><select value={form.duracionMinutos} onChange={(e) => update('duracionMinutos', Number(e.target.value))}><option value={30}>30 minutos</option><option value={60}>60 minutos</option><option value={90}>90 minutos</option></select></label>
    <label className="field span-2"><span>Motivo *</span><input required maxLength={200} value={form.motivo} onChange={(e) => update('motivo', e.target.value)} placeholder="Ej. Revisión de documentación" /></label>
    <label className="field span-2"><span>Notas</span><textarea rows={3} value={form.notas} onChange={(e) => update('notas', e.target.value)} placeholder="Información para preparar la consulta" /></label>
    <div className="form-actions span-2"><button type="button" className="button secondary" onClick={onCancel}>Cancelar</button><button className="button primary" disabled={saving || !clientes.length}>{saving ? 'Guardando…' : 'Guardar turno'}</button></div>
  </form>
}
