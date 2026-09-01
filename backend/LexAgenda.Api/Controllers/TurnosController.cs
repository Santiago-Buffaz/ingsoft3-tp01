using LexAgenda.Api.DTOs;
using LexAgenda.Api.Models;
using LexAgenda.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace LexAgenda.Api.Controllers;

[ApiController]
[Route("api/turnos")]
public class TurnosController(TurnoService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TurnoDto>>> Listar(
        [FromQuery] EstadoTurno? estado,
        [FromQuery] bool hoy = false,
        [FromQuery] bool proximos = false) =>
        Ok(await service.ListarAsync(estado, hoy, proximos));

    [HttpGet("hoy")]
    public async Task<ActionResult<IReadOnlyList<TurnoDto>>> Hoy() => Ok(await service.ListarAsync(null, true, false));

    [HttpGet("proximos")]
    public async Task<ActionResult<IReadOnlyList<TurnoDto>>> Proximos() => Ok(await service.ListarAsync(null, false, true));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TurnoDto>> Obtener(Guid id) => Ok(await service.ObtenerAsync(id));

    [HttpPost]
    public async Task<ActionResult<TurnoDto>> Crear(TurnoRequest request)
    {
        var creado = await service.CrearAsync(request);
        return CreatedAtAction(nameof(Obtener), new { id = creado.Id }, creado);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TurnoDto>> Actualizar(Guid id, TurnoRequest request) =>
        Ok(await service.ActualizarAsync(id, request));

    [HttpPatch("{id:guid}/estado")]
    public async Task<ActionResult<TurnoDto>> CambiarEstado(Guid id, CambiarEstadoTurnoRequest request) =>
        Ok(await service.CambiarEstadoAsync(id, request.Estado));

    [HttpPatch("{id:guid}/cancelar")]
    public async Task<ActionResult<TurnoDto>> Cancelar(Guid id) =>
        Ok(await service.CambiarEstadoAsync(id, EstadoTurno.CANCELADO));
}
