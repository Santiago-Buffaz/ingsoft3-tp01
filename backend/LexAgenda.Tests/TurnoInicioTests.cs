using LexAgenda.Api.Services;
using Moq;

namespace LexAgenda.Tests;

public class TurnoInicioTests
{
    [Theory]
    [InlineData(-1)]
    [InlineData(0)]
    public void InicioNoFuturo_SeRechazaYConsultaElRelojUnaVez(int minutos)
    {
        // Arrange: una hora fija sustituye al reloj del sistema.
        var ahora = new DateTime(2026, 10, 23, 12, 0, 0, DateTimeKind.Utc);
        var reloj = new Mock<IAppClock>(MockBehavior.Strict);
        reloj.SetupGet(x => x.UtcNow).Returns(ahora);
        var inicio = ahora.AddMinutes(minutos);
        // Act
        var error = Record.Exception(() => TurnoRules.ValidarInicio(inicio, reloj.Object));
        // Assert: comportamiento e interacción con la dependencia.
        var negocio = Assert.IsType<BusinessException>(error);
        Assert.Equal("No se pueden crear o mover turnos al pasado.", negocio.Message);
        Assert.Equal("regla_negocio", negocio.Code);
        reloj.VerifyGet(x => x.UtcNow, Times.Once);
        reloj.VerifyNoOtherCalls();
    }

    [Fact]
    public void InicioUnMinutoEnElFuturo_SeAceptaYConsultaElRelojUnaVez()
    {
        // Arrange
        var ahora = new DateTime(2026, 10, 23, 12, 0, 0, DateTimeKind.Utc);
        var reloj = new Mock<IAppClock>(MockBehavior.Strict);
        reloj.SetupGet(x => x.UtcNow).Returns(ahora);
        // Act
        var error = Record.Exception(() => TurnoRules.ValidarInicio(ahora.AddMinutes(1), reloj.Object));
        // Assert
        Assert.Null(error);
        reloj.VerifyGet(x => x.UtcNow, Times.Once);
        reloj.VerifyNoOtherCalls();
    }
}
