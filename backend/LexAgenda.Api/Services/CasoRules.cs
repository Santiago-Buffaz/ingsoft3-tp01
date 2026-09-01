using LexAgenda.Api.Models;

namespace LexAgenda.Api.Services;

public static class CasoRules
{
    public static bool PuedeTransicionar(EstadoCaso actual, EstadoCaso siguiente) =>
        (actual, siguiente) is
            (EstadoCaso.ABIERTO, EstadoCaso.EN_PROCESO) or
            (EstadoCaso.EN_PROCESO, EstadoCaso.CERRADO);

    public static void ValidarTransicion(EstadoCaso actual, EstadoCaso siguiente)
    {
        if (!PuedeTransicionar(actual, siguiente))
            throw new BusinessException($"No se puede cambiar el caso de {actual} a {siguiente}.");
    }

    public static void ValidarFechas(DateOnly apertura, DateOnly? vencimiento)
    {
        if (vencimiento.HasValue && vencimiento.Value < apertura)
            throw new BusinessException("El próximo vencimiento no puede ser anterior a la fecha de apertura.");
    }
}
