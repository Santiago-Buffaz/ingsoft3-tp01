import { describe, expect, it, vi } from 'vitest'
import { ApiError, createApi } from '../src/api/client'

describe('cliente HTTP de LexAgenda, sin red ni navegador', () => {
  it.each([
    ['', '/api/clientes'],
    ['Ana Pérez', '/api/clientes?buscar=Ana%20P%C3%A9rez'],
    ['a+b@example.com', '/api/clientes?buscar=a%2Bb%40example.com'],
  ])('codifica la búsqueda %s y llama una vez al transporte', async (buscar, url) => {
    // Arrange
    const datos = [{ id: 'c1', nombreCompleto: 'Ana Pérez' }]
    const transporte = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(datos)))
    const cliente = createApi(transporte)
    // Act
    const resultado = await cliente.clientes(buscar)
    // Assert: valor e interacción; ninguna petición sale a Internet.
    expect(resultado).toEqual(datos)
    expect(transporte).toHaveBeenCalledExactlyOnceWith(url, {
      headers: { 'Content-Type': 'application/json' },
    })
  })

  it('expone el mensaje y el status de un error de negocio', async () => {
    // Arrange
    const transporte = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ mensaje: 'El correo ya existe.' }), { status: 409 }),
    )
    const cliente = createApi(transporte)
    // Act
    const resultado = cliente.clientes()
    // Assert
    await expect(resultado).rejects.toMatchObject({ message: 'El correo ya existe.', status: 409 })
    expect(transporte).toHaveBeenCalledTimes(1)
  })

  it.each(['{}', 'respuesta que no es JSON'])('usa un mensaje seguro ante error sin mensaje: %s', async (body) => {
    // Arrange
    const transporte = vi.fn<typeof fetch>().mockResolvedValue(new Response(body, { status: 500 }))
    const cliente = createApi(transporte)
    // Act
    const resultado = cliente.dashboard()
    // Assert
    await expect(resultado).rejects.toThrow(ApiError)
    await expect(resultado).rejects.toMatchObject({
      message: 'No se pudo completar la operación.', status: 500,
    })
  })

  it('elimina por DELETE y acepta una respuesta 204 sin JSON', async () => {
    // Arrange
    const transporte = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 204 }))
    const cliente = createApi(transporte)
    // Act
    const resultado = await cliente.eliminarCliente('c1')
    // Assert
    expect(resultado).toBeUndefined()
    expect(transporte).toHaveBeenCalledExactlyOnceWith('/api/clientes/c1', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
    })
  })

  it('envía el alta del cliente con POST y el cuerpo correcto', async () => {
    // Arrange
    const datos = { nombreCompleto: 'Ana Pérez', email: 'ana@example.com', telefono: '3511234567' }
    const transporte = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ id: 'c1', ...datos })))
    const cliente = createApi(transporte)
    // Act
    const resultado = await cliente.crearCliente(datos)
    // Assert
    expect(resultado.id).toBe('c1')
    expect(transporte).toHaveBeenCalledExactlyOnceWith('/api/clientes', {
      method: 'POST', body: JSON.stringify(datos), headers: { 'Content-Type': 'application/json' },
    })
  })

  it.each([
    ['', '', '', '/api/casos'],
    ['ABIERTO', 'ALTA', 'c1', '/api/casos?estado=ABIERTO&prioridad=ALTA&clienteId=c1'],
  ] as const)('construye los filtros de casos: %s %s %s', async (estado, prioridad, id, url) => {
    // Arrange
    const transporte = vi.fn<typeof fetch>().mockResolvedValue(new Response('[]'))
    const cliente = createApi(transporte)
    // Act
    const resultado = await cliente.casos(estado, prioridad, id)
    // Assert
    expect(resultado).toEqual([])
    expect(transporte.mock.calls[0][0]).toBe(url)
  })

  it.each([false, true])('consulta turnos con proximos=%s', async (proximos) => {
    // Arrange
    const transporte = vi.fn<typeof fetch>().mockResolvedValue(new Response('[]'))
    const cliente = createApi(transporte)
    // Act
    const resultado = await cliente.turnos(proximos)
    // Assert
    expect(resultado).toEqual([])
    expect(transporte.mock.calls[0][0]).toBe(proximos ? '/api/turnos?proximos=true' : '/api/turnos')
  })

  it('consulta el detalle del cliente por su identificador', async () => {
    // Arrange
    const transporte = vi.fn<typeof fetch>().mockResolvedValue(new Response('{"cliente":{"id":"c1"}}'))
    const cliente = createApi(transporte)
    // Act
    const resultado = await cliente.cliente('c1')
    // Assert
    expect(resultado.cliente.id).toBe('c1')
    expect(transporte.mock.calls[0][0]).toBe('/api/clientes/c1')
  })

  it.each([
    ['editar cliente', 'PUT', '/api/clientes/c1', { nombreCompleto: 'Ana', email: 'ana@example.com', telefono: '' }],
    ['crear caso', 'POST', '/api/casos', { clienteId: 'c1', titulo: 'Consulta', descripcion: '', tipo: 'CIVIL', prioridad: 'MEDIA', fechaApertura: '2026-10-23' }],
    ['editar caso', 'PUT', '/api/casos/k1', { clienteId: 'c1', titulo: 'Consulta', descripcion: '', tipo: 'CIVIL', prioridad: 'MEDIA', fechaApertura: '2026-10-23' }],
    ['estado caso', 'PATCH', '/api/casos/k1/estado', { estado: 'EN_PROCESO' }],
    ['crear turno', 'POST', '/api/turnos', { clienteId: 'c1', fechaHoraInicio: '2026-10-24T12:00:00Z', duracionMinutos: 30, motivo: 'Consulta' }],
    ['editar turno', 'PUT', '/api/turnos/t1', { clienteId: 'c1', fechaHoraInicio: '2026-10-24T12:00:00Z', duracionMinutos: 30, motivo: 'Consulta' }],
    ['estado turno', 'PATCH', '/api/turnos/t1/estado', { estado: 'CONFIRMADO' }],
  ])('respeta el contrato HTTP al %s', async (operacion, method, url, datos) => {
    // Arrange
    const transporte = vi.fn<typeof fetch>().mockResolvedValue(new Response('{"id":"ok"}'))
    const cliente = createApi(transporte)
    // Act: cada fila representa una operación distinta del cliente público.
    switch (operacion) {
      case 'editar cliente': await cliente.editarCliente('c1', datos as any); break
      case 'crear caso': await cliente.crearCaso(datos as any); break
      case 'editar caso': await cliente.editarCaso('k1', datos as any); break
      case 'estado caso': await cliente.cambiarEstadoCaso('k1', 'EN_PROCESO'); break
      case 'crear turno': await cliente.crearTurno(datos as any); break
      case 'editar turno': await cliente.editarTurno('t1', datos as any); break
      case 'estado turno': await cliente.cambiarEstadoTurno('t1', 'CONFIRMADO'); break
      default: throw new Error('Operación de prueba desconocida')
    }
    // Assert
    expect(transporte).toHaveBeenCalledExactlyOnceWith(url, {
      method, body: JSON.stringify(datos), headers: { 'Content-Type': 'application/json' },
    })
  })
})
