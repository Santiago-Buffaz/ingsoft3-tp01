namespace LexAgenda.Api.DTOs;

public record DashboardDto(
    int CasosAbiertos,
    int CasosEnProceso,
    int TurnosHoy,
    int ProximosTurnosCantidad,
    IReadOnlyList<TurnoDto> TurnosDeHoy,
    IReadOnlyList<TurnoDto> ProximosTurnos);
