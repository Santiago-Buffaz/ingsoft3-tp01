export function describirPrioridadCaso(prioridad: string): string {
  let nombre: string
  let descripcion: string
  switch (prioridad) {
    case 'BAJA':
      nombre = 'Prioridad baja'
      descripcion = 'Seguimiento habitual'
      break
    case 'MEDIA':
      nombre = 'Prioridad media'
      descripcion = 'Revisar en la planificación'
      break
    case 'ALTA':
      nombre = 'Prioridad alta'
      descripcion = 'Revisar primero'
      break
    default:
      throw new Error('Prioridad de caso desconocida.')
  }
  return `${nombre}: ${descripcion}.`
}
