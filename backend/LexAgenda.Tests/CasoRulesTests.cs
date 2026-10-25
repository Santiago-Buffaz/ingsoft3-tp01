using LexAgenda.Api.Models;
using LexAgenda.Api.Services;

namespace LexAgenda.Tests;

public class CasoRulesTests
{
    [Fact]
    public void Abierto_PuedePasarAEnProceso()
    {
        // Arrange
        var actual = EstadoCaso.ABIERTO;
        var siguiente = EstadoCaso.EN_PROCESO;
        // Act
        var permitido = CasoRules.PuedeTransicionar(actual, siguiente);
        // Assert
        Assert.True(permitido);
    }

    [Fact]
    public void EnProceso_PuedeCerrar()
    {
        // Arrange
        var actual = EstadoCaso.EN_PROCESO;
        var siguiente = EstadoCaso.CERRADO;
        // Act
        var permitido = CasoRules.PuedeTransicionar(actual, siguiente);
        // Assert
        Assert.True(permitido);
    }

    [Fact]
    public void Abierto_NoPuedeCerrarDirectamente()
    {
        // Arrange
        var actual = EstadoCaso.ABIERTO;
        var siguiente = EstadoCaso.CERRADO;
        // Act
        var permitido = CasoRules.PuedeTransicionar(actual, siguiente);
        // Assert
        Assert.False(permitido);
    }

    [Fact]
    public void VencimientoAnteriorALaApertura_EsInvalido()
    {
        // Arrange
        var apertura = new DateOnly(2026, 8, 20);
        var vencimiento = new DateOnly(2026, 8, 19);
        // Act: capturo la excepción para comprobarla después.
        var error = Record.Exception(() => CasoRules.ValidarFechas(apertura, vencimiento));
        // Assert
        var negocio = Assert.IsType<BusinessException>(error);
        Assert.Equal("El próximo vencimiento no puede ser anterior a la fecha de apertura.", negocio.Message);
        Assert.Equal(400, negocio.StatusCode);
    }

    [Fact]
    public void VencimientoEnLaApertura_EsValido()
    {
        // Arrange
        var apertura = new DateOnly(2026, 8, 20);
        // Act
        var error = Record.Exception(() => CasoRules.ValidarFechas(apertura, apertura));
        // Assert: el borde igual debe aceptarse.
        Assert.Null(error);
    }

    [Fact]
    public void ValidarTransicion_RechazaCerrarUnCasoAbierto()
    {
        // Arrange
        var actual = EstadoCaso.ABIERTO;
        var siguiente = EstadoCaso.CERRADO;
        // Act
        var error = Record.Exception(() => CasoRules.ValidarTransicion(actual, siguiente));
        // Assert
        Assert.IsType<BusinessException>(error);
    }

    [Fact]
    public void ValidarTransicion_AceptaIniciarUnCasoAbierto()
    {
        // Arrange
        var actual = EstadoCaso.ABIERTO;
        var siguiente = EstadoCaso.EN_PROCESO;
        // Act
        var error = Record.Exception(() => CasoRules.ValidarTransicion(actual, siguiente));
        // Assert
        Assert.Null(error);
    }
}
