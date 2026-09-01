using LexAgenda.Api.Models;
using LexAgenda.Api.Services;

namespace LexAgenda.Tests;

public class CasoRulesTests
{
    [Fact]
    public void Abierto_PuedePasarAEnProceso() =>
        Assert.True(CasoRules.PuedeTransicionar(EstadoCaso.ABIERTO, EstadoCaso.EN_PROCESO));

    [Fact]
    public void EnProceso_PuedeCerrar() =>
        Assert.True(CasoRules.PuedeTransicionar(EstadoCaso.EN_PROCESO, EstadoCaso.CERRADO));

    [Fact]
    public void Abierto_NoPuedeCerrarDirectamente() =>
        Assert.False(CasoRules.PuedeTransicionar(EstadoCaso.ABIERTO, EstadoCaso.CERRADO));

    [Fact]
    public void VencimientoAnteriorALaApertura_EsInvalido() =>
        Assert.Throws<BusinessException>(() => CasoRules.ValidarFechas(
            new DateOnly(2026, 8, 20), new DateOnly(2026, 8, 19)));

    [Fact]
    public void VencimientoEnLaApertura_EsValido() =>
        CasoRules.ValidarFechas(new DateOnly(2026, 8, 20), new DateOnly(2026, 8, 20));
}
