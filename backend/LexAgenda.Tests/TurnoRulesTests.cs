using LexAgenda.Api.Models;
using LexAgenda.Api.Services;

namespace LexAgenda.Tests;

public class TurnoRulesTests
{
    [Theory]
    [InlineData(30)]
    [InlineData(60)]
    [InlineData(90)]
    public void DuracionesPermitidas_SonValidas(int duracion)
    {
        // Arrange: cada InlineData aporta una duración permitida.
        // Act
        var error = Record.Exception(() => TurnoRules.ValidarDuracion(duracion));
        // Assert
        Assert.Null(error);
    }

    [Fact]
    public void DuracionDistinta_EsInvalida()
    {
        // Arrange
        var duracion = 45;
        // Act
        var error = Record.Exception(() => TurnoRules.ValidarDuracion(duracion));
        // Assert
        var negocio = Assert.IsType<BusinessException>(error);
        Assert.Equal("La duración debe ser de 30, 60 o 90 minutos.", negocio.Message);
    }

    [Fact]
    public void TurnosQueSeCruzan_SeSuperponen()
    {
        // Arrange
        var inicio = new DateTime(2026, 8, 20, 10, 0, 0, DateTimeKind.Utc);
        // Act
        var seSuperponen = TurnoRules.SeSuperponen(inicio, 60, inicio.AddMinutes(30), 30);
        // Assert
        Assert.True(seSuperponen);
    }

    [Fact]
    public void TurnosContiguos_NoSeSuperponen()
    {
        // Arrange
        var inicio = new DateTime(2026, 8, 20, 10, 0, 0, DateTimeKind.Utc);
        // Act
        var seSuperponen = TurnoRules.SeSuperponen(inicio, 60, inicio.AddMinutes(60), 30);
        // Assert: terminar exactamente cuando empieza el otro está permitido.
        Assert.False(seSuperponen);
    }

    [Fact]
    public void Confirmado_PuedePasarARealizado()
    {
        // Arrange
        var actual = EstadoTurno.CONFIRMADO;
        var siguiente = EstadoTurno.REALIZADO;
        // Act
        var permitido = TurnoRules.PuedeTransicionar(actual, siguiente);
        // Assert
        Assert.True(permitido);
    }

    [Fact]
    public void Realizado_EsEstadoFinal()
    {
        // Arrange
        var actual = EstadoTurno.REALIZADO;
        var siguiente = EstadoTurno.CANCELADO;
        // Act
        var permitido = TurnoRules.PuedeTransicionar(actual, siguiente);
        // Assert
        Assert.False(permitido);
    }

    [Theory]
    [InlineData(EstadoTurno.PENDIENTE, true)]
    [InlineData(EstadoTurno.CONFIRMADO, true)]
    [InlineData(EstadoTurno.REALIZADO, false)]
    [InlineData(EstadoTurno.CANCELADO, false)]
    public void EsActivo_DistingueLosEstadosQueReservanHorario(EstadoTurno estado, bool esperado)
    {
        // Arrange: estado y resultado esperado vienen de InlineData.
        // Act
        var activo = TurnoRules.EsActivo(estado);
        // Assert
        Assert.Equal(esperado, activo);
    }

    [Fact]
    public void ValidarTransicion_RechazaCambiarUnTurnoFinalizado()
    {
        // Arrange
        var actual = EstadoTurno.REALIZADO;
        var siguiente = EstadoTurno.CANCELADO;
        // Act
        var error = Record.Exception(() => TurnoRules.ValidarTransicion(actual, siguiente));
        // Assert
        Assert.IsType<BusinessException>(error);
    }

    [Fact]
    public void ValidarTransicion_AceptaConfirmarUnTurnoPendiente()
    {
        // Arrange
        var actual = EstadoTurno.PENDIENTE;
        var siguiente = EstadoTurno.CONFIRMADO;
        // Act
        var error = Record.Exception(() => TurnoRules.ValidarTransicion(actual, siguiente));
        // Assert
        Assert.Null(error);
    }
}
