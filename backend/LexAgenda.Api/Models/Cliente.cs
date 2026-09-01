namespace LexAgenda.Api.Models;

public class Cliente
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string NombreCompleto { get; set; } = string.Empty;
    public string? Dni { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string? Notas { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Caso> Casos { get; set; } = new List<Caso>();
    public ICollection<Turno> Turnos { get; set; } = new List<Turno>();
}
