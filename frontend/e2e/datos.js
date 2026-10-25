import { randomUUID } from 'node:crypto'
import { expect, test as base } from '@playwright/test'

export const API = (process.env.API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')

export async function listar(request, buscar) {
  const response = await request.get(`${API}/api/clientes`, { params: { buscar }, timeout: 60_000 })
  expect(response.status()).toBe(200)
  return response.json()
}

export async function comprobarAusencia(request, email) {
  const clientes = await listar(request, email)
  expect(clientes.filter((cliente) => cliente.email === email)).toEqual([])
}

export async function crear(request, datos) {
  const response = await request.post(`${API}/api/clientes`, { data: datos, timeout: 60_000 })
  expect(response.status()).toBe(201)
  const cliente = await response.json()
  expect(cliente.nombreCompleto).toBe(datos.nombreCompleto)
  expect(cliente.email).toBe(datos.email)
  return cliente
}

export async function borrar(request, cliente) {
  const response = await request.delete(`${API}/api/clientes/${cliente.id}`)
  expect(response.status()).toBe(204)
  expect((await request.get(`${API}/api/clientes/${cliente.id}`)).status()).toBe(404)
  await comprobarAusencia(request, cliente.email)
}

// Un dato diferente por test y reintento. El teardown también limpia un alta
// cuyo POST se guardó aunque una aserción posterior haya fallado.
export const test = base.extend({
  datos: async ({ request }, use) => {
    const identificador = `${Date.now()}-${randomUUID().slice(0, 8)}`
    const datos = {
      nombreCompleto: `TP7 ${identificador}`,
      email: `tp7-${identificador}@lexagenda.example`,
      telefono: '3511234567',
      notas: 'Registro temporal de las pruebas del TP7.',
    }
    try {
      await use(datos)
    } finally {
      const propios = (await listar(request, datos.email)).filter((c) => c.email === datos.email)
      for (const cliente of propios) await borrar(request, cliente)
      await comprobarAusencia(request, datos.email)
    }
  },
})

export { expect }
