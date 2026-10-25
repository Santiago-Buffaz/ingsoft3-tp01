export function describirEstadoTurno(estado: string): string {
  switch (estado) {
    case 'PENDIENTE':
      return 'Pendiente: reserva horario.'
    case 'CONFIRMADO':
      return 'Confirmado: reserva horario.'
    case 'REALIZADO':
      return 'Realizado: no reserva horario.'
    case 'CANCELADO':
      return 'Cancelado: no reserva horario.'
    default:
      throw new Error('Estado de turno desconocido.')
  }
}
