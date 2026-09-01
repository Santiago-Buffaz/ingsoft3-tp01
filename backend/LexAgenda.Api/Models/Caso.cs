namespace LexAgenda.Api.Models;

public class Caso
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ClienteId { get; set; }
    public Cliente Cliente { get; set; } = null!;
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public TipoCaso Tipo { get; set; }
    public PrioridadCaso Prioridad { get; set; }
    public EstadoCaso Estado { get; set; } = EstadoCaso.ABIERTO;
    public DateOnly FechaApertura { get; set; }
    public DateOnly? FechaProximoVencimiento { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Turno> Turnos { get; set; } = new List<Turno>();
}
