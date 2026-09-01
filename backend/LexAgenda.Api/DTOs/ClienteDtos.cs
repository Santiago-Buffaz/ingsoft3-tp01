using System.ComponentModel.DataAnnotations;

namespace LexAgenda.Api.DTOs;

public class ClienteRequest
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [MaxLength(160)]
    public string NombreCompleto { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Dni { get; set; }

    [Required(ErrorMessage = "El email es obligatorio.")]
    [EmailAddress(ErrorMessage = "El email no tiene un formato válido.")]
    [MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Telefono { get; set; } = string.Empty;
    public string? Notas { get; set; }
}

public record ClienteDto(
    Guid Id,
    string NombreCompleto,
    string? Dni,
    string Email,
    string Telefono,
    string? Notas,
    DateTime CreatedAt);

public record ClienteDetalleDto(
    ClienteDto Cliente,
    IReadOnlyList<CasoDto> Casos,
    IReadOnlyList<TurnoDto> ProximosTurnos);
