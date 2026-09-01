using LexAgenda.Api.Models;
using LexAgenda.Api.Services;

namespace LexAgenda.Tests;

public class TurnoRulesTests
{
    [Theory]
    [InlineData(30)]
    [InlineData(60)]
    [InlineData(90)]
    public void DuracionesPermitidas_SonValidas(int duracion) => TurnoRules.ValidarDuracion(duracion);

    [Fact]
    public void DuracionDistinta_EsInvalida() =>
        Assert.Throws<BusinessException>(() => TurnoRules.ValidarDuracion(45));

    [Fact]
    public void TurnosQueSeCruzan_SeSuperponen()
    {
        var inicio = new DateTime(2026, 8, 20, 10, 0, 0, DateTimeKind.Utc);
        Assert.True(TurnoRules.SeSuperponen(inicio, 60, inicio.AddMinutes(30), 30));
    }

    [Fact]
    public void TurnosContiguos_NoSeSuperponen()
    {
        var inicio = new DateTime(2026, 8, 20, 10, 0, 0, DateTimeKind.Utc);
        Assert.False(TurnoRules.SeSuperponen(inicio, 60, inicio.AddMinutes(60), 30));
    }

    [Fact]
    public void Confirmado_PuedePasarARealizado() =>
        Assert.True(TurnoRules.PuedeTransicionar(EstadoTurno.CONFIRMADO, EstadoTurno.REALIZADO));

    [Fact]
    public void Realizado_EsEstadoFinal() =>
        Assert.False(TurnoRules.PuedeTransicionar(EstadoTurno.REALIZADO, EstadoTurno.CANCELADO));
}
