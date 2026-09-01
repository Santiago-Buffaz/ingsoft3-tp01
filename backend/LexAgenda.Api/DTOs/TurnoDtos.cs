using System.ComponentModel.DataAnnotations;
using LexAgenda.Api.Models;

namespace LexAgenda.Api.DTOs;

public class TurnoRequest
{
    [Required]
    public Guid ClienteId { get; set; }
    public Guid? CasoId { get; set; }
    public DateTime FechaHoraInicio { get; set; }
    public int DuracionMinutos { get; set; }

    [Required(ErrorMessage = "El motivo es obligatorio.")]
    [MaxLength(200)]
    public string Motivo { get; set; } = string.Empty;

    public string? Notas { get; set; }
}

public class CambiarEstadoTurnoRequest
{
    public EstadoTurno Estado { get; set; }
}

public record TurnoDto(
    Guid Id,
    Guid ClienteId,
    string ClienteNombre,
    Guid? CasoId,
    string? CasoTitulo,
    DateTime FechaHoraInicio,
    int DuracionMinutos,
    string Motivo,
    string? Notas,
    EstadoTurno Estado,
    DateTime CreatedAt);
