namespace LexAgenda.Api.Services;

public interface IAppClock
{
    DateTime UtcNow { get; }
    (DateTime InicioUtc, DateTime FinUtc) RangoDeHoyUtc();
}

public class AppClock(IConfiguration configuration) : IAppClock
{
    private readonly TimeZoneInfo _timeZone = TimeZoneInfo.FindSystemTimeZoneById(
        configuration["APP_TIME_ZONE"] ?? "America/Argentina/Cordoba");

    public DateTime UtcNow => DateTime.UtcNow;

    public (DateTime InicioUtc, DateTime FinUtc) RangoDeHoyUtc()
    {
        var ahoraLocal = TimeZoneInfo.ConvertTimeFromUtc(UtcNow, _timeZone);
        var inicioLocal = DateTime.SpecifyKind(ahoraLocal.Date, DateTimeKind.Unspecified);
        var finLocal = inicioLocal.AddDays(1);
        return (
            TimeZoneInfo.ConvertTimeToUtc(inicioLocal, _timeZone),
            TimeZoneInfo.ConvertTimeToUtc(finLocal, _timeZone));
    }
}
