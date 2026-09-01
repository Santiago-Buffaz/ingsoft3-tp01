namespace LexAgenda.Api.Services;

public class BusinessException(string message, int statusCode = 400, string code = "regla_negocio")
    : Exception(message)
{
    public int StatusCode { get; } = statusCode;
    public string Code { get; } = code;
}
