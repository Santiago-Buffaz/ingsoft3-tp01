export type TipoCaso = 'CIVIL' | 'LABORAL' | 'FAMILIA' | 'COMERCIAL' | 'OTRO'
export type PrioridadCaso = 'BAJA' | 'MEDIA' | 'ALTA'
export type EstadoCaso = 'ABIERTO' | 'EN_PROCESO' | 'CERRADO'
export type EstadoTurno = 'PENDIENTE' | 'CONFIRMADO' | 'REALIZADO' | 'CANCELADO'

export interface Cliente {
  id: string
  nombreCompleto: string
  dni?: string
  email: string
  telefono: string
  notas?: string
  createdAt: string
}

export interface Caso {
  id: string
  clienteId: string
  clienteNombre: string
  titulo: string
  descripcion: string
  tipo: TipoCaso
  prioridad: PrioridadCaso
  estado: EstadoCaso
  fechaApertura: string
  fechaProximoVencimiento?: string
  createdAt: string
}

export interface Turno {
  id: string
  clienteId: string
  clienteNombre: string
  casoId?: string
  casoTitulo?: string
  fechaHoraInicio: string
  duracionMinutos: number
  motivo: string
  notas?: string
  estado: EstadoTurno
  createdAt: string
}

export interface ClienteDetalle {
  cliente: Cliente
  casos: Caso[]
  proximosTurnos: Turno[]
}

export interface DashboardData {
  casosAbiertos: number
  casosEnProceso: number
  turnosHoy: number
  proximosTurnosCantidad: number
  turnosDeHoy: Turno[]
  proximosTurnos: Turno[]
}

export interface ClientePayload {
  nombreCompleto: string
  dni?: string
  email: string
  telefono: string
  notas?: string
}

export interface CasoPayload {
  clienteId: string
  titulo: string
  descripcion: string
  tipo: TipoCaso
  prioridad: PrioridadCaso
  fechaApertura: string
  fechaProximoVencimiento?: string | null
}

export interface TurnoPayload {
  clienteId: string
  casoId?: string | null
  fechaHoraInicio: string
  duracionMinutos: number
  motivo: string
  notas?: string
}
