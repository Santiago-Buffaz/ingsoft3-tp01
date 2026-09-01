using LexAgenda.Api.Models;

namespace LexAgenda.Api.Services;

public static class TurnoRules
{
    public static readonly int[] DuracionesValidas = [30, 60, 90];

    public static bool EsActivo(EstadoTurno estado) =>
        estado is EstadoTurno.PENDIENTE or EstadoTurno.CONFIRMADO;

    public static bool SeSuperponen(DateTime inicioA, int duracionA, DateTime inicioB, int duracionB) =>
        inicioA < inicioB.AddMinutes(duracionB) && inicioB < inicioA.AddMinutes(duracionA);

    public static void ValidarDuracion(int duracion)
    {
        if (!DuracionesValidas.Contains(duracion))
            throw new BusinessException("La duración debe ser de 30, 60 o 90 minutos.");
    }

    public static bool PuedeTransicionar(EstadoTurno actual, EstadoTurno siguiente) =>
        (actual, siguiente) is
            (EstadoTurno.PENDIENTE, EstadoTurno.CONFIRMADO) or
            (EstadoTurno.PENDIENTE, EstadoTurno.CANCELADO) or
            (EstadoTurno.CONFIRMADO, EstadoTurno.REALIZADO) or
            (EstadoTurno.CONFIRMADO, EstadoTurno.CANCELADO);

    public static void ValidarTransicion(EstadoTurno actual, EstadoTurno siguiente)
    {
        if (!PuedeTransicionar(actual, siguiente))
            throw new BusinessException($"No se puede cambiar el turno de {actual} a {siguiente}.");
    }
}
