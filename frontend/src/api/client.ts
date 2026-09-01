import type {
  Caso,
  CasoPayload,
  Cliente,
  ClienteDetalle,
  ClientePayload,
  DashboardData,
  EstadoCaso,
  EstadoTurno,
  PrioridadCaso,
  Turno,
  TurnoPayload,
} from '../types'

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message)
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new ApiError(body.mensaje ?? 'No se pudo completar la operación.', response.status)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) })

export const api = {
  dashboard: () => request<DashboardData>('/api/dashboard'),

  clientes: (buscar = '') =>
    request<Cliente[]>(`/api/clientes${buscar ? `?buscar=${encodeURIComponent(buscar)}` : ''}`),
  cliente: (id: string) => request<ClienteDetalle>(`/api/clientes/${id}`),
  crearCliente: (body: ClientePayload) => request<Cliente>('/api/clientes', json('POST', body)),
  editarCliente: (id: string, body: ClientePayload) => request<Cliente>(`/api/clientes/${id}`, json('PUT', body)),
  eliminarCliente: (id: string) => request<void>(`/api/clientes/${id}`, { method: 'DELETE' }),

  casos: (estado = '', prioridad: PrioridadCaso | '' = '', clienteId = '') => {
    const params = new URLSearchParams()
    if (estado) params.set('estado', estado)
    if (prioridad) params.set('prioridad', prioridad)
    if (clienteId) params.set('clienteId', clienteId)
    return request<Caso[]>(`/api/casos${params.size ? `?${params}` : ''}`)
  },
  crearCaso: (body: CasoPayload) => request<Caso>('/api/casos', json('POST', body)),
  editarCaso: (id: string, body: CasoPayload) => request<Caso>(`/api/casos/${id}`, json('PUT', body)),
  cambiarEstadoCaso: (id: string, estado: EstadoCaso) =>
    request<Caso>(`/api/casos/${id}/estado`, json('PATCH', { estado })),

  turnos: (proximos = false) => request<Turno[]>(`/api/turnos${proximos ? '?proximos=true' : ''}`),
  crearTurno: (body: TurnoPayload) => request<Turno>('/api/turnos', json('POST', body)),
  editarTurno: (id: string, body: TurnoPayload) => request<Turno>(`/api/turnos/${id}`, json('PUT', body)),
  cambiarEstadoTurno: (id: string, estado: EstadoTurno) =>
    request<Turno>(`/api/turnos/${id}/estado`, json('PATCH', { estado })),
}
