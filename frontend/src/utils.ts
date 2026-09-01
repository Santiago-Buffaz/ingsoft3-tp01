export const etiquetas: Record<string, string> = {
  ABIERTO: 'Abierto',
  EN_PROCESO: 'En proceso',
  CERRADO: 'Cerrado',
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
  PENDIENTE: 'Pendiente',
  CONFIRMADO: 'Confirmado',
  REALIZADO: 'Realizado',
  CANCELADO: 'Cancelado',
  CIVIL: 'Civil',
  LABORAL: 'Laboral',
  FAMILIA: 'Familia',
  COMERCIAL: 'Comercial',
  OTRO: 'Otro',
}

export const fecha = (value?: string) =>
  value ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00`)) : 'Sin fecha'

export const fechaHora = (value: string) =>
  new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

export const hora = (value: string) =>
  new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))

export const hoyInput = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export const fechaHoraInput = (iso?: string) => {
  const date = iso ? new Date(iso) : new Date(Date.now() + 60 * 60 * 1000)
  date.setMinutes(Math.ceil(date.getMinutes() / 30) * 30, 0, 0)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}
