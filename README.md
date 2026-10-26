# LexAgenda — Gestión de Estudio Jurídico

[![CI](https://github.com/Santiago-Buffaz/ingsoft3-tp01/actions/workflows/ci.yml/badge.svg)](https://github.com/Santiago-Buffaz/ingsoft3-tp01/actions/workflows/ci.yml)

LexAgenda permite administrar clientes, casos y turnos de un estudio jurídico. La desarrollé para Ingeniería del Software 3 (UCC, 2026) y fui incorporando las pruebas, los despliegues y el monitoreo a lo largo de los trabajos prácticos.

## Trabajos prácticos 5 a 9

El detalle de lo que hice, las decisiones y los problemas de cada etapa está en [decisiones.md](decisiones.md). Cada release conserva el cierre del práctico correspondiente.

| TP | Qué incorporé | Documentación | Release |
|---|---|---|---|
| 5 | Tests y cobertura mínima en CI. | [Calidad automatizada](decisiones.md#tp5---calidad-automatizada) | [v5.0.0](https://github.com/Santiago-Buffaz/ingsoft3-tp01/releases/tag/v5.0.0) |
| 6 | Publicación de imágenes, QA, aprobación de producción y un ensayo de rollback. | [Entrega continua y entornos](decisiones.md#tp6--entrega-continua-y-entornos) | [v6.0.0](https://github.com/Santiago-Buffaz/ingsoft3-tp01/releases/tag/v6.0.0) |
| 7 | Promoción de la misma imagen entre entornos, con pruebas de integración y E2E. | [Imágenes, integración y E2E](decisiones.md#tp7--imágenes-integración-y-e2e-como-condición-de-promoción) | [v7.0.0](https://github.com/Santiago-Buffaz/ingsoft3-tp01/releases/tag/v7.0.0) |
| 8 | Creación y destrucción de preproducción con Terraform. | [Infraestructura como código](decisiones.md#tp8--preproducción-con-infraestructura-como-código) | [v8.0.0](https://github.com/Santiago-Buffaz/ingsoft3-tp01/releases/tag/v8.0.0) |
| 9 | Dependabot, CodeQL, Sentry y una prueba de alertas de caída y recuperación con UptimeRobot. | [Seguridad y observabilidad](decisiones.md#tp9--seguridad-y-observabilidad) | [v9.0.0](https://github.com/Santiago-Buffaz/ingsoft3-tp01/releases/tag/v9.0.0) |

Los enlaces a paquetes, corridas y reportes están al comienzo de [decisiones.md](decisiones.md#enlaces-del-tp7).

La aplicación se puede abrir en [QA](https://lexagenda-front-qa-sbuffaz.onrender.com) o en [producción](https://lexagenda-front-prod-sbuffaz.onrender.com). Para ejecutarla en una máquina local, seguí los pasos de abajo.

## Arranque local

Requisito único: Docker Desktop o Docker Engine con Docker Compose.

```bash
cp .env.example .env
docker compose up -d
```

La primera ejecución descarga las imágenes base y construye backend y frontend, por lo que puede tardar algunos minutos. Después abrí:

- Aplicación: <http://localhost:3000>
- Health de la API: <http://localhost:8080/health>

Comprobá el estado con:

```bash
docker compose ps
docker compose logs backend
```

Para detener el sistema sin perder los datos:

```bash
docker compose down
```

El archivo `.env` contiene la configuración local y está ignorado por Git. Si el puerto 3000 ya está ocupado, cambiá `FRONTEND_PORT` dentro de `.env`.

## Funcionalidad

### Clientes

- Alta, edición, listado, búsqueda y detalle.
- Búsqueda por nombre, DNI o email.
- Email obligatorio, válido y único.
- DNI opcional y único cuando se informa.
- Eliminación bloqueada si existen casos o turnos asociados.

### Casos

- Alta, edición, listado, detalle y filtros por estado y prioridad.
- Relación obligatoria con un cliente existente.
- El próximo vencimiento no puede ser anterior a la apertura.
- Flujo permitido: `ABIERTO → EN_PROCESO → CERRADO`.
- No permite cerrar directamente un caso abierto.
- Un caso cerrado no puede editarse.
- No permite cerrar un caso con turnos futuros pendientes o confirmados.

### Turnos

- Alta, edición, listado de hoy y próximos turnos.
- Duraciones permitidas: 30, 60 o 90 minutos.
- No admite turnos en el pasado.
- Si se asocia un caso, debe pertenecer al mismo cliente.
- Los turnos pendientes o confirmados no pueden superponerse.
- Los cancelados dejan libre el horario.
- Flujo permitido:
  - `PENDIENTE → CONFIRMADO | CANCELADO`
  - `CONFIRMADO → REALIZADO | CANCELADO`
  - `REALIZADO` y `CANCELADO` son finales.

## Pantallas

- `/`: resumen, turnos de hoy, próximos turnos y accesos rápidos.
- `/clientes`: búsqueda, listado y ficha con casos y próximos turnos.
- `/casos`: tabla, filtros, detalle y acciones de estado contextuales.

Los turnos se gestionan con un formulario desde la Agenda o desde la ficha de un cliente; no se agregó un calendario gráfico para mantener el alcance reducido.

## Arquitectura

```text
Navegador
   │  http://localhost:3000 + rutas /api relativas
   ▼
nginx (frontend React compilado)
   │  proxy_pass http://backend:8080
   ▼
ASP.NET Core Web API
   │  Host=db (DNS interno de Compose)
   ▼
PostgreSQL 16 + volumen db_data
```

El backend mantiene una estructura deliberadamente sencilla:

```text
Controllers → Services → LexAgendaDbContext → PostgreSQL
                  │
                  └→ CasoRules / TurnoRules
```

- Los controllers traducen HTTP y delegan.
- Los services concentran reglas, consultas y persistencia.
- Los DTOs definen el contrato JSON.
- Los modelos representan las entidades de EF Core.
- Un middleware devuelve errores JSON uniformes.

## Estructura principal

```text
backend/
├── LexAgenda.Api/
│   ├── Controllers/
│   ├── Data/
│   ├── DTOs/
│   ├── Middleware/
│   ├── Models/
│   └── Services/
├── LexAgenda.Tests/
├── LexAgenda.sln
├── Dockerfile
└── .dockerignore

frontend/
├── src/
│   ├── api/
│   ├── components/
│   ├── pages/
│   └── types/
├── Dockerfile
├── default.conf.template
└── .dockerignore
```

## Configuración

Variables de `.env`:

| Variable | Uso |
|---|---|
| `DB_PASSWORD` | Contraseña local de PostgreSQL. |
| `FRONTEND_PORT` | Puerto publicado del frontend; por defecto, 3000. |
| `REGISTRY_USER` | Usuario en minúsculas usado por la variante de registry. |

Compose inyecta la conexión con la convención de configuración de .NET:

```text
ConnectionStrings__Default=Host=db;Database=lexagenda;Username=postgres;Password=...
```

`db` no es una IP ni el host local: es el nombre del servicio que resuelve el DNS interno de Compose.

## Builds multi-stage

### Backend

1. `mcr.microsoft.com/dotnet/sdk:8.0` restaura y publica.
2. La etapa `test` ejecuta los tests y mide la cobertura.
3. `mcr.microsoft.com/dotnet/aspnet:8.0` ejecuta solo los binarios publicados como usuario no root.

### Frontend

1. `node:22-alpine` ejecuta `npm ci` y `npm run build`.
2. La etapa `test` ejecuta Vitest con cobertura.
3. `nginx:1.27-alpine` sirve solamente `dist/` y proxea `/api` al backend indicado por `BACKEND_URL`.

Copiar primero los archivos de dependencias permite reutilizar el cache cuando solo cambia el código fuente. El SDK y `node_modules` no llegan a las imágenes finales.

## Desarrollo sin Docker

Hace falta .NET SDK 8, Node 22 y PostgreSQL 16.

Backend:

```bash
cd backend
export ConnectionStrings__Default='Host=localhost;Database=lexagenda;Username=postgres;Password=TU_CLAVE'
dotnet run --project LexAgenda.Api
```

Frontend, en otra terminal:

```bash
cd frontend
npm ci
npm run dev
```

Vite sirve en <http://localhost:5173> y proxea `/api` a `localhost:8080`.

## Tests y verificaciones

Tests del backend con el SDK instalado:

```bash
dotnet test backend/LexAgenda.sln -c Release
```

O usando solamente Docker:

```bash
docker run --rm -v "$PWD/backend:/src" -w /src mcr.microsoft.com/dotnet/sdk:8.0 dotnet test LexAgenda.sln -c Release
```

Auditoría y build del frontend:

```bash
docker run --rm -v "$PWD/frontend:/app" -w /app node:22-alpine npm audit
docker build -t lexagenda-frontend:dev ./frontend
```

Build del backend:

```bash
docker build -t lexagenda-backend:dev ./backend
```

Hay pruebas de reglas y servicios en el backend, y pruebas con Vitest en el frontend. Para ejecutar estas últimas, después de instalar las dependencias:

```bash
npm --prefix frontend run test:ci
```

CI ejecuta ambas suites y publica sus reportes de cobertura. Después del despliegue a QA, corre las pruebas de integración de la API y las E2E con Playwright antes de habilitar la promoción a producción. El alcance y las exclusiones de cobertura están explicados en la [sección del TP5](decisiones.md#tp5---calidad-automatizada).

## Persistencia

PostgreSQL guarda sus datos en el volumen nombrado `db_data`.

```bash
docker compose down
docker compose up -d
```

Los registros continúan porque se recrean contenedores, no el volumen.

La siguiente orden también elimina el volumen y, por lo tanto, los datos. Usala solo cuando realmente quieras reiniciar la base:

```bash
docker compose down -v
```

## Variante de registry del TP2

`docker-compose.registry.yml` se conserva como parte del TP2: reemplaza los dos `build:` por imágenes `v0.1.0`. Los despliegues actuales de QA y producción usan imágenes identificadas por el SHA del commit, como se explica en el TP7.

Para reproducir la publicación de esa etapa:

1. Publicá `lexagenda-backend:v0.1.0` y `lexagenda-frontend:v0.1.0` en GHCR o Docker Hub.
2. Hacé públicas ambas imágenes.
3. Escribí tu usuario en minúsculas en `REGISTRY_USER` dentro de `.env`.
4. Probá la descarga sin credenciales:

```bash
docker compose -f docker-compose.registry.yml up -d
```

La variante local puede validarse sin publicar con:

```bash
docker compose config --quiet
docker compose -f docker-compose.registry.yml config --quiet
```

## Documentación de la entrega

- [decisiones.md](decisiones.md): decisiones de los TP1 al TP9, problemas encontrados, resultados y declaración de uso de IA.
- [Releases](https://github.com/Santiago-Buffaz/ingsoft3-tp01/releases): versiones de cierre y notas de cada entrega.
- [infra/README.md](infra/README.md): instrucciones para crear y destruir preproducción con Terraform.
- [evidencias.md](evidencias.md): verificaciones y capturas de los TP1 y TP2. Las evidencias de los trabajos posteriores se consultan en las corridas, los reportes y los servicios enlazados desde `decisiones.md`.
