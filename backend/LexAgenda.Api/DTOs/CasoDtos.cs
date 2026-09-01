using System.ComponentModel.DataAnnotations;
using LexAgenda.Api.Models;

namespace LexAgenda.Api.DTOs;

public class CasoRequest
{
    [Required]
    public Guid ClienteId { get; set; }

    [Required(ErrorMessage = "El título es obligatorio.")]
    [MaxLength(180)]
    public string Titulo { get; set; } = string.Empty;

    public string Descripcion { get; set; } = string.Empty;
    public TipoCaso Tipo { get; set; }
    public PrioridadCaso Prioridad { get; set; }
    public DateOnly FechaApertura { get; set; }
    public DateOnly? FechaProximoVencimiento { get; set; }
}

public class CambiarEstadoCasoRequest
{
    public EstadoCaso Estado { get; set; }
}

public record CasoDto(
    Guid Id,
    Guid ClienteId,
    string ClienteNombre,
    string Titulo,
    string Descripcion,
    TipoCaso Tipo,
    PrioridadCaso Prioridad,
    EstadoCaso Estado,
    DateOnly FechaApertura,
    DateOnly? FechaProximoVencimiento,
    DateTime CreatedAt);
