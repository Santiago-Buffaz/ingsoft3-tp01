using LexAgenda.Api.DTOs;
using LexAgenda.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace LexAgenda.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController(DashboardService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<DashboardDto>> Obtener() => Ok(await service.ObtenerAsync());
}
