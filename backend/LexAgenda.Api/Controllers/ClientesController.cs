using LexAgenda.Api.DTOs;
using LexAgenda.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace LexAgenda.Api.Controllers;

[ApiController]
[Route("api/clientes")]
public class ClientesController(ClienteService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ClienteDto>>> Listar([FromQuery] string? buscar) =>
        Ok(await service.ListarAsync(buscar));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ClienteDetalleDto>> Obtener(Guid id) => Ok(await service.ObtenerAsync(id));

    [HttpPost]
    public async Task<ActionResult<ClienteDto>> Crear(ClienteRequest request)
    {
        var creado = await service.CrearAsync(request);
        return CreatedAtAction(nameof(Obtener), new { id = creado.Id }, creado);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ClienteDto>> Actualizar(Guid id, ClienteRequest request) =>
        Ok(await service.ActualizarAsync(id, request));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Eliminar(Guid id)
    {
        await service.EliminarAsync(id);
        return NoContent();
    }
}
