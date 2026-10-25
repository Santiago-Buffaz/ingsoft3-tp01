import { describe, expect, it } from 'vitest'
import { describirEstadoTurno } from '../src/lib/estadoTurnoTexto'

describe('descripción del estado de un turno', () => {
  it.each([
    ['PENDIENTE', 'Pendiente: reserva horario.'],
    ['CONFIRMADO', 'Confirmado: reserva horario.'],
    ['REALIZADO', 'Realizado: no reserva horario.'],
    ['CANCELADO', 'Cancelado: no reserva horario.'],
  ])('describe %s', (estado, esperado) => {
    // Arrange: datos de la fila.
    // Act
    const resultado = describirEstadoTurno(estado)
    // Assert
    expect(resultado).toBe(esperado)
  })

  it('rechaza un estado desconocido', () => {
    // Arrange
    const estado = 'INVENTADO'
    // Act: se difiere la llamada para comprobar la excepción.
    const actuar = () => describirEstadoTurno(estado)
    // Assert
    expect(actuar).toThrow('Estado de turno desconocido.')
  })
})
