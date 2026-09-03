// TP4: demostración del gate de integración continua.
using System.Text.Json.Serialization;
using LexAgenda.Api.Data;
using LexAgenda.Api.Middleware;
using LexAgenda.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Default");
if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException(
        "Falta ConnectionStrings:Default. Configurala con la variable ConnectionStrings__Default.");

builder.Services.AddDbContext<LexAgendaDbContext>(options => options.UseNpgsql(connectionString));
builder.Services.AddSingleton<IAppClock, AppClock>();
builder.Services.AddScoped<ClienteService>();
builder.Services.AddScoped<CasoService>();
builder.Services.AddScoped<TurnoService>();
builder.Services.AddScoped<DashboardService>();
builder.Services.AddControllers().AddJsonOptions(options =>
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var mensajes = context.ModelState.Values
            .SelectMany(x => x.Errors)
            .Select(x => string.IsNullOrWhiteSpace(x.ErrorMessage) ? "Dato inválido." : x.ErrorMessage)
            .ToArray();
        return new BadRequestObjectResult(new
        {
            error = "validacion",
            mensaje = mensajes.FirstOrDefault() ?? "Revisá los datos enviados.",
            detalles = mensajes
        });
    };
});

var app = builder.Build();
app.UseMiddleware<ApiExceptionMiddleware>();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapControllers();

await using (var scope = app.Services.CreateAsyncScope())
{
    var db = scope.ServiceProvider.GetRequiredService<LexAgendaDbContext>();
    await db.Database.EnsureCreatedAsync();
}

await app.RunAsync();

public partial class Program;
