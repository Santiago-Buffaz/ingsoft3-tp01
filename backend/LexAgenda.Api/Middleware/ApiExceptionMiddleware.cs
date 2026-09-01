using LexAgenda.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace LexAgenda.Api.Middleware;

public class ApiExceptionMiddleware(RequestDelegate next, ILogger<ApiExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (BusinessException ex)
        {
            context.Response.StatusCode = ex.StatusCode;
            await context.Response.WriteAsJsonAsync(new { error = ex.Code, mensaje = ex.Message });
        }
        catch (DbUpdateException ex)
        {
            logger.LogWarning(ex, "Conflicto al guardar datos");
            context.Response.StatusCode = StatusCodes.Status409Conflict;
            await context.Response.WriteAsJsonAsync(new
            {
                error = "conflicto_datos",
                mensaje = "No se pudo guardar porque un dato único ya existe. Revisá email y DNI."
            });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error no controlado");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsJsonAsync(new
            {
                error = "error_interno",
                mensaje = "Ocurrió un error inesperado."
            });
        }
    }
}
