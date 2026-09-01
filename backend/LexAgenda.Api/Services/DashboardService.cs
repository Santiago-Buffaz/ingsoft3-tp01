using LexAgenda.Api.Data;
using LexAgenda.Api.DTOs;
using LexAgenda.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LexAgenda.Api.Services;

public class DashboardService(LexAgendaDbContext db, IAppClock clock)
{
    public async Task<DashboardDto> ObtenerAsync()
    {
        var rango = clock.RangoDeHoyUtc();
        var ahora = clock.UtcNow;
        var activos = new[] { EstadoTurno.PENDIENTE, EstadoTurno.CONFIRMADO };

        var hoy = await db.Turnos.AsNoTracking().Include(x => x.Cliente).Include(x => x.Caso)
            .Where(x => x.FechaHoraInicio >= rango.InicioUtc && x.FechaHoraInicio < rango.FinUtc)
            .OrderBy(x => x.FechaHoraInicio).Select(x => Map(x)).ToListAsync();
        var proximos = await db.Turnos.AsNoTracking().Include(x => x.Cliente).Include(x => x.Caso)
            .Where(x => x.FechaHoraInicio >= rango.FinUtc && activos.Contains(x.Estado))
            .OrderBy(x => x.FechaHoraInicio).Take(8).Select(x => Map(x)).ToListAsync();
        var cantidadProximos = await db.Turnos.CountAsync(x => x.FechaHoraInicio >= ahora && activos.Contains(x.Estado));

        return new DashboardDto(
            await db.Casos.CountAsync(x => x.Estado == EstadoCaso.ABIERTO),
            await db.Casos.CountAsync(x => x.Estado == EstadoCaso.EN_PROCESO),
            hoy.Count,
            cantidadProximos,
            hoy,
            proximos);
    }

    private static TurnoDto Map(Turno x) => new(x.Id, x.ClienteId, x.Cliente.NombreCompleto,
        x.CasoId, x.Caso?.Titulo, x.FechaHoraInicio, x.DuracionMinutos, x.Motivo,
        x.Notas, x.Estado, x.CreatedAt);
}
