import { API, borrar, comprobarAusencia, crear, expect, listar, test } from './datos.js'

test('crear un cliente persiste en la base y eliminarlo lo retira', async ({ request, datos }) => {
  const cliente = await crear(request, datos)
  const detalle = await request.get(`${API}/api/clientes/${cliente.id}`)
  expect(detalle.status()).toBe(200)
  expect((await detalle.json()).cliente).toMatchObject({ id: cliente.id, ...datos })
  expect(await listar(request, datos.email)).toEqual([expect.objectContaining({ id: cliente.id })])
  await borrar(request, cliente)
})

test('un nombre vacío devuelve 400 y no crea el cliente', async ({ request, datos }) => {
  await comprobarAusencia(request, datos.email)
  const response = await request.post(`${API}/api/clientes`, {
    data: { ...datos, nombreCompleto: '' },
  })
  expect(response.status()).toBe(400)
  expect((await response.json()).mensaje).toBe('El nombre es obligatorio.')
  await comprobarAusencia(request, datos.email)
})

test('buscar por email ignora mayúsculas y devuelve el cliente correcto', async ({ request, datos }) => {
  const cliente = await crear(request, datos)
  const encontrados = await listar(request, datos.email.toUpperCase())
  expect(encontrados).toEqual([expect.objectContaining({ id: cliente.id, ...datos })])
  expect(await listar(request, `ausente-${datos.email}`)).toEqual([])
  await borrar(request, cliente)
})
