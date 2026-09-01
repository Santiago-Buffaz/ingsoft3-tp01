using LexAgenda.Api.Data;
using LexAgenda.Api.DTOs;
using LexAgenda.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LexAgenda.Api.Services;

public class TurnoService(LexAgendaDbContext db, IAppClock clock)
{
    public async Task<IReadOnlyList<TurnoDto>> ListarAsync(EstadoTurno? estado, bool hoy, bool proximos)
    {
        var query = db.Turnos.AsNoTracking().Include(x => x.Cliente).Include(x => x.Caso).AsQueryable();
        if (estado.HasValue) query = query.Where(x => x.Estado == estado);
        if (hoy)
        {
            var rango = clock.RangoDeHoyUtc();
            query = query.Where(x => x.FechaHoraInicio >= rango.InicioUtc && x.FechaHoraInicio < rango.FinUtc);
        }
        if (proximos)
            query = query.Where(x => x.FechaHoraInicio >= clock.UtcNow &&
                (x.Estado == EstadoTurno.PENDIENTE || x.Estado == EstadoTurno.CONFIRMADO));

        return await query.OrderBy(x => x.FechaHoraInicio).Select(x => Map(x)).ToListAsync();
    }

    public async Task<TurnoDto> ObtenerAsync(Guid id)
    {
        var turno = await db.Turnos.AsNoTracking().Include(x => x.Cliente).Include(x => x.Caso)
            .FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new BusinessException("Turno no encontrado.", 404, "no_encontrado");
        return Map(turno);
    }

    public async Task<TurnoDto> CrearAsync(TurnoRequest request)
    {
        var inicio = NormalizarUtc(request.FechaHoraInicio);
        await ValidarDatosAsync(request, inicio, null);
        var cliente = await db.Clientes.FindAsync(request.ClienteId);
        var caso = request.CasoId.HasValue ? await db.Casos.FindAsync(request.CasoId.Value) : null;
        var turno = new Turno
        {
            ClienteId = request.ClienteId,
            Cliente = cliente!,
            CasoId = request.CasoId,
            Caso = caso,
            FechaHoraInicio = inicio,
            DuracionMinutos = request.DuracionMinutos,
            Motivo = request.Motivo.Trim(),
            Notas = LimpiarOpcional(request.Notas),
            Estado = EstadoTurno.PENDIENTE
        };
        db.Turnos.Add(turno);
        await db.SaveChangesAsync();
        return Map(turno);
    }

    public async Task<TurnoDto> ActualizarAsync(Guid id, TurnoRequest request)
    {
        var turno = await db.Turnos.Include(x => x.Cliente).Include(x => x.Caso).FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new BusinessException("Turno no encontrado.", 404, "no_encontrado");
        if (!TurnoRules.EsActivo(turno.Estado))
            throw new BusinessException("Un turno realizado o cancelado no puede editarse.", 409);

        var inicio = NormalizarUtc(request.FechaHoraInicio);
        await ValidarDatosAsync(request, inicio, id);
        var cliente = await db.Clientes.FindAsync(request.ClienteId);
        var caso = request.CasoId.HasValue ? await db.Casos.FindAsync(request.CasoId.Value) : null;
        turno.ClienteId = request.ClienteId;
        turno.Cliente = cliente!;
        turno.CasoId = request.CasoId;
        turno.Caso = caso;
        turno.FechaHoraInicio = inicio;
        turno.DuracionMinutos = request.DuracionMinutos;
        turno.Motivo = request.Motivo.Trim();
        turno.Notas = LimpiarOpcional(request.Notas);
        await db.SaveChangesAsync();
        return Map(turno);
    }

    public async Task<TurnoDto> CambiarEstadoAsync(Guid id, EstadoTurno siguiente)
    {
        var turno = await db.Turnos.Include(x => x.Cliente).Include(x => x.Caso).FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new BusinessException("Turno no encontrado.", 404, "no_encontrado");
        TurnoRules.ValidarTransicion(turno.Estado, siguiente);
        turno.Estado = siguiente;
        await db.SaveChangesAsync();
        return Map(turno);
    }

    private async Task ValidarDatosAsync(TurnoRequest request, DateTime inicio, Guid? excluirId)
    {
        TurnoRules.ValidarDuracion(request.DuracionMinutos);
        if (inicio <= clock.UtcNow)
            throw new BusinessException("No se pueden crear o mover turnos al pasado.");
        if (!await db.Clientes.AnyAsync(x => x.Id == request.ClienteId))
            throw new BusinessException("El cliente indicado no existe.");
        if (request.CasoId.HasValue)
        {
            var caso = await db.Casos.AsNoTracking().FirstOrDefaultAsync(x => x.Id == request.CasoId.Value)
                ?? throw new BusinessException("El caso indicado no existe.");
            if (caso.ClienteId != request.ClienteId)
                throw new BusinessException("El caso seleccionado no pertenece al mismo cliente.");
        }

        var fin = inicio.AddMinutes(request.DuracionMinutos);
        var candidatos = await db.Turnos.AsNoTracking()
            .Where(x => x.Id != excluirId && x.FechaHoraInicio < fin &&
                        (x.Estado == EstadoTurno.PENDIENTE || x.Estado == EstadoTurno.CONFIRMADO))
            .Select(x => new { x.FechaHoraInicio, x.DuracionMinutos })
            .ToListAsync();
        if (candidatos.Any(x => TurnoRules.SeSuperponen(
                inicio, request.DuracionMinutos, x.FechaHoraInicio, x.DuracionMinutos)))
            throw new BusinessException("El turno se superpone con otro turno pendiente o confirmado.", 409, "superposicion");
    }

    private static DateTime NormalizarUtc(DateTime value) => value.Kind switch
    {
        DateTimeKind.Utc => value,
        DateTimeKind.Local => value.ToUniversalTime(),
        _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
    };

    private static string? LimpiarOpcional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static TurnoDto Map(Turno x) => new(x.Id, x.ClienteId, x.Cliente.NombreCompleto,
        x.CasoId, x.Caso?.Titulo, x.FechaHoraInicio, x.DuracionMinutos, x.Motivo,
        x.Notas, x.Estado, x.CreatedAt);
}
