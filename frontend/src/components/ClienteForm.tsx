import { useState, type FormEvent } from 'react'
import { api } from '../api/client'
import type { Cliente, ClientePayload } from '../types'
import { Feedback } from './Common'

interface Props {
  cliente?: Cliente
  onSaved: (message: string) => void
  onCancel: () => void
}

export default function ClienteForm({ cliente, onSaved, onCancel }: Props) {
  const [form, setForm] = useState<ClientePayload>({
    nombreCompleto: cliente?.nombreCompleto ?? '', dni: cliente?.dni ?? '',
    email: cliente?.email ?? '', telefono: cliente?.telefono ?? '', notas: cliente?.notas ?? '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const update = (key: keyof ClientePayload, value: string) => setForm((old) => ({ ...old, [key]: value }))
  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      if (cliente) await api.editarCliente(cliente.id, form)
      else await api.crearCliente(form)
      onSaved(cliente ? 'Cliente actualizado correctamente.' : 'Cliente creado correctamente.')
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar.') }
    finally { setSaving(false) }
  }

  return <form className="form" onSubmit={submit}>
    {error && <Feedback type="error">{error}</Feedback>}
    <label className="field span-2"><span>Nombre completo *</span><input required maxLength={160} value={form.nombreCompleto} onChange={(e) => update('nombreCompleto', e.target.value)} placeholder="Ej. María López" /></label>
    <label className="field"><span>DNI</span><input maxLength={20} value={form.dni} onChange={(e) => update('dni', e.target.value)} placeholder="Opcional" /></label>
    <label className="field"><span>Teléfono</span><input maxLength={50} value={form.telefono} onChange={(e) => update('telefono', e.target.value)} placeholder="351 555 1234" /></label>
    <label className="field span-2"><span>Email *</span><input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="nombre@correo.com" /></label>
    <label className="field span-2"><span>Notas</span><textarea rows={3} value={form.notas} onChange={(e) => update('notas', e.target.value)} placeholder="Información útil para futuras consultas" /></label>
    <div className="form-actions span-2"><button type="button" className="button secondary" onClick={onCancel}>Cancelar</button><button className="button primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar cliente'}</button></div>
  </form>
}
