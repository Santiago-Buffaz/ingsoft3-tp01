using LexAgenda.Api.Data;
using LexAgenda.Api.DTOs;
using LexAgenda.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LexAgenda.Api.Services;

public class CasoService(LexAgendaDbContext db, IAppClock clock)
{
    public async Task<IReadOnlyList<CasoDto>> ListarAsync(
        EstadoCaso? estado, PrioridadCaso? prioridad, Guid? clienteId)
    {
        var query = db.Casos.AsNoTracking().Include(x => x.Cliente).AsQueryable();
        if (estado.HasValue) query = query.Where(x => x.Estado == estado);
        if (prioridad.HasValue) query = query.Where(x => x.Prioridad == prioridad);
        if (clienteId.HasValue) query = query.Where(x => x.ClienteId == clienteId);
        return await query
            .OrderBy(x => x.Estado).ThenByDescending(x => x.Prioridad).ThenBy(x => x.FechaProximoVencimiento)
            .Select(x => Map(x)).ToListAsync();
    }

    public async Task<CasoDto> ObtenerAsync(Guid id)
    {
        var caso = await db.Casos.AsNoTracking().Include(x => x.Cliente).FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new BusinessException("Caso no encontrado.", 404, "no_encontrado");
        return Map(caso);
    }

    public async Task<CasoDto> CrearAsync(CasoRequest request)
    {
        CasoRules.ValidarFechas(request.FechaApertura, request.FechaProximoVencimiento);
        var cliente = await db.Clientes.FindAsync(request.ClienteId)
            ?? throw new BusinessException("El cliente indicado no existe.", 400);

        var caso = new Caso
        {
            ClienteId = cliente.Id,
            Cliente = cliente,
            Titulo = request.Titulo.Trim(),
            Descripcion = request.Descripcion.Trim(),
            Tipo = request.Tipo,
            Prioridad = request.Prioridad,
            Estado = EstadoCaso.ABIERTO,
            FechaApertura = request.FechaApertura,
            FechaProximoVencimiento = request.FechaProximoVencimiento
        };
        db.Casos.Add(caso);
        await db.SaveChangesAsync();
        return Map(caso);
    }

    public async Task<CasoDto> ActualizarAsync(Guid id, CasoRequest request)
    {
        var caso = await db.Casos.Include(x => x.Cliente).FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new BusinessException("Caso no encontrado.", 404, "no_encontrado");
        if (caso.Estado == EstadoCaso.CERRADO)
            throw new BusinessException("Un caso cerrado no puede editarse.", 409);
        CasoRules.ValidarFechas(request.FechaApertura, request.FechaProximoVencimiento);
        var cliente = await db.Clientes.FindAsync(request.ClienteId)
            ?? throw new BusinessException("El cliente indicado no existe.");

        caso.ClienteId = cliente.Id;
        caso.Cliente = cliente;
        caso.Titulo = request.Titulo.Trim();
        caso.Descripcion = request.Descripcion.Trim();
        caso.Tipo = request.Tipo;
        caso.Prioridad = request.Prioridad;
        caso.FechaApertura = request.FechaApertura;
        caso.FechaProximoVencimiento = request.FechaProximoVencimiento;
        await db.SaveChangesAsync();
        return Map(caso);
    }

    public async Task<CasoDto> CambiarEstadoAsync(Guid id, EstadoCaso siguiente)
    {
        var caso = await db.Casos.Include(x => x.Cliente).FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new BusinessException("Caso no encontrado.", 404, "no_encontrado");
        CasoRules.ValidarTransicion(caso.Estado, siguiente);

        if (siguiente == EstadoCaso.CERRADO)
        {
            var tieneTurnosFuturos = await db.Turnos.AnyAsync(x => x.CasoId == id &&
                x.FechaHoraInicio > clock.UtcNow &&
                (x.Estado == EstadoTurno.PENDIENTE || x.Estado == EstadoTurno.CONFIRMADO));
            if (tieneTurnosFuturos)
                throw new BusinessException("No se puede cerrar el caso porque tiene turnos futuros activos.", 409);
        }

        caso.Estado = siguiente;
        await db.SaveChangesAsync();
        return Map(caso);
    }

    private static CasoDto Map(Caso x) => new(x.Id, x.ClienteId, x.Cliente.NombreCompleto,
        x.Titulo, x.Descripcion, x.Tipo, x.Prioridad, x.Estado, x.FechaApertura,
        x.FechaProximoVencimiento, x.CreatedAt);
}
