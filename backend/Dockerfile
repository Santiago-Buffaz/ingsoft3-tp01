# Etapa 1: compila con el SDK completo.
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Los archivos de dependencias se copian primero para aprovechar el cache.
COPY LexAgenda.sln .
COPY LexAgenda.Api/LexAgenda.Api.csproj LexAgenda.Api/
COPY LexAgenda.Tests/LexAgenda.Tests.csproj LexAgenda.Tests/
RUN dotnet restore LexAgenda.sln

COPY . .
RUN dotnet publish LexAgenda.Api/LexAgenda.Api.csproj -c Release --no-restore -o /app/publish

# Etapa 2: tests. Hereda /src, el SDK, la solución y las dependencias.
FROM build AS test
ENTRYPOINT ["dotnet", "test", "LexAgenda.sln", \
            "/p:CollectCoverage=true", "/p:Threshold=8.5", "/p:ThresholdType=line", \
            "/p:CoverletOutput=/out/coverage", "/p:CoverletOutputFormat=cobertura", \
            "/p:Exclude=[LexAgenda.Api]Program*%2c[LexAgenda.Api]LexAgenda.Api.Data.*%2c[LexAgenda.Api]LexAgenda.Api.Models.*%2c[LexAgenda.Api]LexAgenda.Api.DTOs.*", \
            "--logger", "trx;LogFileName=tests.trx", "--results-directory", "/out"]

# Etapa 3: imagen final sin SDK ni código fuente.
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
USER app
EXPOSE 8080
ENTRYPOINT ["dotnet", "LexAgenda.Api.dll"]
