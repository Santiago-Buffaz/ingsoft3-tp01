using LexAgenda.Api.Data;
using LexAgenda.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace LexAgenda.Api.Services;

public class ClienteService(LexAgendaDbContext db, IAppClock clock)
{
    public async Task<IReadOnlyList<ClienteDto>> ListarAsync(string? buscar)
    {
        var query = db.Clientes.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(buscar))
        {
            var patron = $"%{buscar.Trim()}%";
            query = query.Where(x =>
                EF.Functions.ILike(x.NombreCompleto, patron) ||
                (x.Dni != null && EF.Functions.ILike(x.Dni, patron)) ||
                EF.Functions.ILike(x.Email, patron));
        }

        return await query.OrderBy(x => x.NombreCompleto).Select(x => Map(x)).ToListAsync();
    }

    public async Task<ClienteDetalleDto> ObtenerAsync(Guid id)
    {
        var cliente = await db.Clientes.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id)
            ?? throw new BusinessException("Cliente no encontrado.", 404, "no_encontrado");

        var casos = await db.Casos.AsNoTracking().Where(x => x.ClienteId == id)
            .OrderByDescending(x => x.FechaApertura)
            .Select(x => new CasoDto(x.Id, x.ClienteId, cliente.NombreCompleto, x.Titulo, x.Descripcion,
                x.Tipo, x.Prioridad, x.Estado, x.FechaApertura, x.FechaProximoVencimiento, x.CreatedAt))
            .ToListAsync();

        var turnos = await db.Turnos.AsNoTracking()
            .Where(x => x.ClienteId == id && x.FechaHoraInicio >= clock.UtcNow &&
                        (x.Estado == Models.EstadoTurno.PENDIENTE || x.Estado == Models.EstadoTurno.CONFIRMADO))
            .OrderBy(x => x.FechaHoraInicio)
            .Select(x => new TurnoDto(x.Id, x.ClienteId, cliente.NombreCompleto, x.CasoId,
                x.Caso != null ? x.Caso.Titulo : null, x.FechaHoraInicio, x.DuracionMinutos,
                x.Motivo, x.Notas, x.Estado, x.CreatedAt))
            .ToListAsync();

        return new ClienteDetalleDto(Map(cliente), casos, turnos);
    }

    public async Task<ClienteDto> CrearAsync(ClienteRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var dni = LimpiarOpcional(request.Dni);
        await ValidarUnicosAsync(email, dni, null);

        var cliente = new Models.Cliente
        {
            NombreCompleto = request.NombreCompleto.Trim(),
            Dni = dni,
            Email = email,
            Telefono = request.Telefono.Trim(),
            Notas = LimpiarOpcional(request.Notas)
        };
        db.Clientes.Add(cliente);
        await db.SaveChangesAsync();
        return Map(cliente);
    }

    public async Task<ClienteDto> ActualizarAsync(Guid id, ClienteRequest request)
    {
        var cliente = await db.Clientes.FindAsync(id)
            ?? throw new BusinessException("Cliente no encontrado.", 404, "no_encontrado");
        var email = request.Email.Trim().ToLowerInvariant();
        var dni = LimpiarOpcional(request.Dni);
        await ValidarUnicosAsync(email, dni, id);

        cliente.NombreCompleto = request.NombreCompleto.Trim();
        cliente.Dni = dni;
        cliente.Email = email;
        cliente.Telefono = request.Telefono.Trim();
        cliente.Notas = LimpiarOpcional(request.Notas);
        await db.SaveChangesAsync();
        return Map(cliente);
    }

    public async Task EliminarAsync(Guid id)
    {
        var cliente = await db.Clientes.FindAsync(id)
            ?? throw new BusinessException("Cliente no encontrado.", 404, "no_encontrado");
        if (await db.Casos.AnyAsync(x => x.ClienteId == id))
            throw new BusinessException("No se puede eliminar el cliente porque tiene casos asociados.", 409);
        if (await db.Turnos.AnyAsync(x => x.ClienteId == id))
            throw new BusinessException("No se puede eliminar el cliente porque tiene turnos asociados.", 409);

        db.Clientes.Remove(cliente);
        await db.SaveChangesAsync();
    }

    private async Task ValidarUnicosAsync(string email, string? dni, Guid? excluirId)
    {
        if (await db.Clientes.AnyAsync(x => x.Email == email && x.Id != excluirId))
            throw new BusinessException("Ya existe un cliente con ese email.", 409, "email_duplicado");
        if (dni != null && await db.Clientes.AnyAsync(x => x.Dni == dni && x.Id != excluirId))
            throw new BusinessException("Ya existe un cliente con ese DNI.", 409, "dni_duplicado");
    }

    private static string? LimpiarOpcional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static ClienteDto Map(Models.Cliente x) =>
        new(x.Id, x.NombreCompleto, x.Dni, x.Email, x.Telefono, x.Notas, x.CreatedAt);
}
