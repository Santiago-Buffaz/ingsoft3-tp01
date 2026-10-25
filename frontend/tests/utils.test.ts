import { afterEach, describe, expect, it, vi } from 'vitest'
import { fecha, fechaHora, fechaHoraInput, hora, hoyInput } from '../src/utils'

afterEach(() => vi.useRealTimers())

describe('fechas de la interfaz con TZ=UTC en los tests', () => {
  it('muestra Sin fecha cuando no hay dato', () => {
    // Arrange
    const entrada = undefined
    // Act
    const resultado = fecha(entrada)
    // Assert
    expect(resultado).toBe('Sin fecha')
  })

  it('presenta la fecha sin cambiar el día del calendario', () => {
    // Arrange
    const entrada = '2026-08-20'
    // Act
    const resultado = fecha(entrada)
    // Assert
    expect(resultado).toContain('20')
    expect(resultado).toContain('ago')
    expect(resultado).toContain('2026')
  })

  it('presenta fecha y hora del instante dado', () => {
    // Arrange
    const entrada = '2026-08-20T10:05:00Z'
    // Act
    const resultado = fechaHora(entrada)
    // Assert
    expect(resultado).toContain('2026')
    expect(resultado).toContain('10:05')
  })

  it('presenta únicamente hora y minutos', () => {
    // Arrange
    const entrada = '2026-08-20T10:05:00Z'
    // Act
    const resultado = hora(entrada)
    // Assert
    expect(resultado).toMatch(/^10:05(?:\s+a\.\s*m\.)?$/)
  })

  it('arma la fecha de hoy con dos dígitos para mes y día', () => {
    // Arrange
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-03T10:00:00Z'))
    // Act
    const resultado = hoyInput()
    // Assert
    expect(resultado).toBe('2026-02-03')
  })

  it.each([
    ['2026-10-23T10:01:00Z', '2026-10-23T10:30'],
    ['2026-10-23T10:30:00Z', '2026-10-23T10:30'],
    ['2026-10-23T23:50:00Z', '2026-10-24T00:00'],
  ])('redondea %s al próximo bloque de media hora', (entrada, esperado) => {
    // Arrange: entradas de la tabla, incluida la frontera de medianoche.
    // Act
    const resultado = fechaHoraInput(entrada)
    // Assert
    expect(resultado).toBe(esperado)
  })

  it('sin fecha inicial propone una hora después y redondea', () => {
    // Arrange
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-23T10:10:00Z'))
    // Act
    const resultado = fechaHoraInput()
    // Assert
    expect(resultado).toBe('2026-10-23T11:30')
  })
})
