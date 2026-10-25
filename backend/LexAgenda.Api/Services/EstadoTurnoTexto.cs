using LexAgenda.Api.Models;

namespace LexAgenda.Api.Services;

public static class EstadoTurnoTexto
{
    public static string Describir(EstadoTurno estado)
    {
        string nombre;
        string efecto;
        switch (estado)
        {
            case EstadoTurno.PENDIENTE:
                nombre = "Pendiente";
                efecto = "reserva horario";
                break;
            case EstadoTurno.CONFIRMADO:
                nombre = "Confirmado";
                efecto = "reserva horario";
                break;
            case EstadoTurno.REALIZADO:
                nombre = "Realizado";
                efecto = "no reserva horario";
                break;
            case EstadoTurno.CANCELADO:
                nombre = "Cancelado";
                efecto = "no reserva horario";
                break;
            default:
                throw new BusinessException("Estado de turno desconocido.");
        }
        return $"{nombre}: {efecto}.";
    }
}
