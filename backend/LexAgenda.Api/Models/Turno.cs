namespace LexAgenda.Api.Models;

public class Turno
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ClienteId { get; set; }
    public Cliente Cliente { get; set; } = null!;
    public Guid? CasoId { get; set; }
    public Caso? Caso { get; set; }
    public DateTime FechaHoraInicio { get; set; }
    public int DuracionMinutos { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public string? Notas { get; set; }
    public EstadoTurno Estado { get; set; } = EstadoTurno.PENDIENTE;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
