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

# Etapa 2: imagen final sin SDK ni código fuente.
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
USER app
EXPOSE 8080
ENTRYPOINT ["dotnet", "LexAgenda.Api.dll"]
