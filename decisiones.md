# Decisiones de arquitectura y proceso

## TP2 — Contenedores

### Aplicación elegida

Elegí **LexAgenda**, una aplicación de gestión para un estudio jurídico pequeño. Administra clientes, casos y turnos.

La elección cumple los criterios de la cátedra:

- **Corre localmente:** el sistema completo se levanta con Docker Compose; no depende de nube ni APIs externas.
- **Comandos conocidos:** el backend se compila con `dotnet publish`; el frontend, con `npm ci` y `npm run build`.
- **Conexión parametrizable:** ASP.NET Core recibe `ConnectionStrings__Default` por variable de entorno; dentro de Compose usa `Host=db`.
- **Lógica testeable:** tiene unicidad, restricciones de eliminación, validaciones temporales, solapamientos y transiciones de estado.
- **Comprensible y modificable:** mantiene Controllers, Services, DTOs, Models y DbContext, sin CQRS, MediatR ni microservicios.
- **Tamaño reducido:** tres pantallas principales y tres entidades. El alcance permite demostrarla y modificarla en vivo.

### Stack

- Backend: .NET 8, ASP.NET Core Web API y Entity Framework Core.
- Base: PostgreSQL 16 con Npgsql.
- Frontend: React, TypeScript y Vite, sin framework visual.
- Producción local: nginx, Docker y Docker Compose.

### Reglas de negocio

La lógica principal está en `ClienteService`, `CasoService`, `TurnoService`, `CasoRules` y `TurnoRules`; los controllers solo atienden HTTP y delegan.

Entre otras reglas:

- email único y DNI opcional único;
- cliente con relaciones no eliminable;
- vencimiento de caso igual o posterior a apertura;
- casos con flujo `ABIERTO → EN_PROCESO → CERRADO`;
- caso con turno futuro activo no cerrable;
- turnos futuros de 30, 60 o 90 minutos;
- caso opcional perteneciente al mismo cliente;
- turnos pendientes o confirmados sin superposición;
- estados finales no editables/transicionables.

Esto permite llegar al TP5 con casos válidos, inválidos y de borde que tienen significado de negocio.

### Contenerización del backend

El Dockerfile usa dos etapas:

1. `mcr.microsoft.com/dotnet/sdk:8.0` restaura la solución y ejecuta `dotnet publish -c Release`.
2. `mcr.microsoft.com/dotnet/aspnet:8.0` recibe únicamente los binarios publicados y los ejecuta con el usuario no root `app`.

La imagen final no incluye compilador, tests ni código fuente. Los `.csproj` y la solución se copian antes del resto del código para que el restore quede cacheado.

### Contenerización del frontend

También usa dos etapas:

1. `node:22-alpine` instala exactamente el lockfile con `npm ci` y compila la SPA.
2. `nginx:1.27-alpine` sirve solo los archivos de `dist/`.

La SPA llama rutas relativas `/api`. En desarrollo Vite las proxea al backend y en producción lo hace nginx. El navegador nunca intenta resolver el nombre interno `backend` y no hace falta habilitar CORS.

El `proxy_pass` usa una variable y el resolver DNS de Docker (`127.0.0.11`) para no exigir que el backend exista en el instante exacto en que arranca nginx.

### Compose y red

Compose declara tres servicios: `frontend`, `backend` y `db`. Crea una red interna con DNS; por eso el backend encuentra PostgreSQL como `db` y nginx encuentra la API como `backend`.

`depends_on` por sí solo ordenaría el arranque. El healthcheck con `pg_isready` agrega readiness: el backend espera hasta que PostgreSQL acepte conexiones.

Los puertos 3000 y 8080 se publican para el host. PostgreSQL no publica 5432 porque solo lo consume el backend en la red interna.

### Persistencia

El único estado persistente es PostgreSQL y vive en el volumen nombrado `db_data`, montado en `/var/lib/postgresql/data`.

- `docker compose down` recrea contenedores pero conserva datos.
- `docker compose down -v` elimina también el volumen y reinicia la base.
- Backend, frontend y red son descartables y se reconstruyen desde archivos declarativos.

Para mantener el proyecto introductorio, EF Core usa `EnsureCreatedAsync` al arrancar. Si el modelo evoluciona en TPs posteriores, la mejora natural es incorporar migraciones versionadas.

### Secretos y configuración

La contraseña real vive en `.env`, que está en `.gitignore`. `.env.example` documenta las claves esperadas y se versiona con valores de ejemplo.

La cadena se construye en Compose e ingresa al backend con `ConnectionStrings__Default`. No existe una contraseña fijada en `appsettings.json` ni en el código.

### Variante de registry

`docker-compose.registry.yml` mantiene la misma topología del Compose local, pero reemplaza las instrucciones `build:` por estas imágenes publicadas:

- `ghcr.io/santiago-buffaz/lexagenda-backend:v0.1.0`
- `ghcr.io/santiago-buffaz/lexagenda-frontend:v0.1.0`

Elegí GitHub Container Registry porque utiliza la misma cuenta de GitHub del repositorio y permite mantener el código y las imágenes en una misma plataforma.

Ambas imágenes se publicaron con la versión semántica `v0.1.0` y se configuraron con visibilidad pública. Para verificarlo, cerré la sesión de GHCR, eliminé las referencias locales y ejecuté nuevamente `docker pull` para backend y frontend. Las dos imágenes se descargaron correctamente sin credenciales.

Finalmente levanté el sistema con `docker-compose.registry.yml` y comprobé que frontend, backend y PostgreSQL funcionaran usando las imágenes publicadas, sin construir backend ni frontend desde el código local.

Las imágenes fueron construidas en una Mac con Apple Silicon y arquitectura `arm64`. Para este TP alcanza con documentar la arquitectura utilizada; una publicación multi-arquitectura puede incorporarse más adelante mediante `docker buildx`.

### Problemas encontrados y resolución

1. **El host no tenía .NET ni Node instalados.** Se realizaron build, tests y auditoría con las imágenes SDK de Docker. Esto confirmó el objetivo de reproducibilidad del TP.
2. **Los puertos 3000 y 3001 ya estaban ocupados por servicios ajenos.** No se detuvieron. Se parametrizó el puerto como `FRONTEND_PORT`, con 3000 por defecto, y se usó 3097 solo para validar este workspace.
3. **El primer build descargó capas grandes del SDK.** Los builds siguientes reutilizaron cache gracias al orden de `COPY`.
4. **Versiones iniciales del tooling frontend tenían avisos de seguridad.** Se actualizó el lockfile y `npm audit` terminó con 0 vulnerabilidades conocidas.

### Asistencia de IA

La estructura inicial, parte del código, los archivos Docker/Compose y la documentación fueron producidos con asistencia de IA.

La verificación se realizó ejecutando personalmente los builds, Docker Compose, las pruebas de persistencia, la publicación de las imágenes, la descarga sin credenciales y el arranque mediante el Compose de registry. La asistencia de IA se utilizó como guía, pero los resultados se comprobaron mediante ejecuciones reales.
