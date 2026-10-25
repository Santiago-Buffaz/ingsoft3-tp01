using LexAgenda.Api.Models;
using LexAgenda.Api.Services;

namespace LexAgenda.Tests;

public class EstadoTurnoTextoTests
{
    [Theory]
    [InlineData(EstadoTurno.PENDIENTE, "Pendiente: reserva horario.")]
    [InlineData(EstadoTurno.CONFIRMADO, "Confirmado: reserva horario.")]
    [InlineData(EstadoTurno.REALIZADO, "Realizado: no reserva horario.")]
    [InlineData(EstadoTurno.CANCELADO, "Cancelado: no reserva horario.")]
    public void CadaEstado_TieneUnaDescripcionCoherente(EstadoTurno estado, string esperado)
    {
        // Arrange: la tabla define los cuatro estados reales de LexAgenda.
        // Act
        var resultado = EstadoTurnoTexto.Describir(estado);
        // Assert
        Assert.Equal(esperado, resultado);
    }

    [Fact]
    public void EstadoDesconocido_SeRechaza()
    {
        // Arrange
        var estado = (EstadoTurno)999;
        // Act
        var error = Record.Exception(() => EstadoTurnoTexto.Describir(estado));
        // Assert
        var negocio = Assert.IsType<BusinessException>(error);
        Assert.Equal("Estado de turno desconocido.", negocio.Message);
    }
}
