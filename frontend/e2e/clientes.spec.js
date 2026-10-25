import { comprobarAusencia, expect, test } from './datos.js'

function fila(page, datos) {
  return page.getByRole('button').filter({ has: page.getByText(datos.email, { exact: true }) })
}

async function abrirAlta(page) {
  await page.goto('/clientes')
  await page.getByRole('button', { name: '+ Nuevo cliente', exact: true }).click()
  return page.getByRole('dialog', { name: 'Nuevo cliente', exact: true })
}

async function altaEnPantalla(page, datos) {
  const form = await abrirAlta(page)
  await form.getByLabel('Nombre completo *', { exact: true }).fill(datos.nombreCompleto)
  await form.getByLabel('Email *', { exact: true }).fill(datos.email)
  await form.getByLabel('Teléfono', { exact: true }).fill(datos.telefono)
  await form.getByRole('button', { name: 'Guardar cliente', exact: true }).click()
  await expect(form).not.toBeVisible()
  await expect(fila(page, datos)).toBeVisible()
}

async function eliminarEnPantalla(page, datos) {
  await fila(page, datos).click()
  await expect(page.getByRole('heading', { name: datos.nombreCompleto, exact: true })).toBeVisible()
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toBe(`¿Eliminar a ${datos.nombreCompleto}?`)
    await dialog.accept()
  })
  await page.getByRole('button', { name: 'Eliminar', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Cliente eliminado.')
  await expect(fila(page, datos)).toHaveCount(0)
}

test('crear un cliente lo muestra y eliminarlo lo quita de la lista', async ({ page, request, datos }) => {
  await altaEnPantalla(page, datos)
  await expect(fila(page, datos)).toContainText(datos.nombreCompleto)
  await eliminarEnPantalla(page, datos)
  await comprobarAusencia(request, datos.email)
})

test('un nombre de espacios muestra el error y no se crea el cliente', async ({ page, request, datos }) => {
  const form = await abrirAlta(page)
  // HTML required acepta espacios; la validación real de la API debe rechazarlos.
  await form.getByLabel('Nombre completo *', { exact: true }).fill('   ')
  await form.getByLabel('Email *', { exact: true }).fill(datos.email)
  await form.getByRole('button', { name: 'Guardar cliente', exact: true }).click()
  const error = form.getByRole('status')
  await expect(error).toBeVisible()
  await expect(error).toContainText('El nombre es obligatorio.')
  await form.getByRole('button', { name: 'Cancelar', exact: true }).click()
  await expect(fila(page, datos)).toHaveCount(0)
  await comprobarAusencia(request, datos.email)
})

test('buscar un cliente por email funciona después de recargar', async ({ page, request, datos }) => {
  await altaEnPantalla(page, datos)
  await page.reload()
  await expect(fila(page, datos)).toBeVisible()
  const buscar = page.getByPlaceholder('Buscar por nombre, DNI o email', { exact: true })
  await buscar.fill(`ausente-${datos.email}`)
  await page.getByRole('button', { name: 'Buscar', exact: true }).click()
  await expect(page.getByText('No encontramos clientes', { exact: true })).toBeVisible()
  await expect(fila(page, datos)).toHaveCount(0)
  await buscar.fill(datos.email.toUpperCase())
  await page.getByRole('button', { name: 'Buscar', exact: true }).click()
  await expect(fila(page, datos)).toBeVisible()
  await expect(fila(page, datos)).toContainText(datos.nombreCompleto)
  await eliminarEnPantalla(page, datos)
  await comprobarAusencia(request, datos.email)
})
