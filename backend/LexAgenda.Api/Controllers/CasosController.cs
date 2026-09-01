using LexAgenda.Api.DTOs;
using LexAgenda.Api.Models;
using LexAgenda.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace LexAgenda.Api.Controllers;

[ApiController]
[Route("api/casos")]
public class CasosController(CasoService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CasoDto>>> Listar(
        [FromQuery] EstadoCaso? estado,
        [FromQuery] PrioridadCaso? prioridad,
        [FromQuery] Guid? clienteId) =>
        Ok(await service.ListarAsync(estado, prioridad, clienteId));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CasoDto>> Obtener(Guid id) => Ok(await service.ObtenerAsync(id));

    [HttpPost]
    public async Task<ActionResult<CasoDto>> Crear(CasoRequest request)
    {
        var creado = await service.CrearAsync(request);
        return CreatedAtAction(nameof(Obtener), new { id = creado.Id }, creado);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CasoDto>> Actualizar(Guid id, CasoRequest request) =>
        Ok(await service.ActualizarAsync(id, request));

    [HttpPatch("{id:guid}/estado")]
    public async Task<ActionResult<CasoDto>> CambiarEstado(Guid id, CambiarEstadoCasoRequest request) =>
        Ok(await service.CambiarEstadoAsync(id, request.Estado));
}
