# LexAgenda — Gestión de Estudio Jurídico

Aplicación full-stack pequeña para administrar clientes, casos y turnos de un estudio jurídico. Fue diseñada como app del semestre para Ingeniería del Software 3 (UCC, 2026): tiene reglas de negocio suficientes para testear, una arquitectura directa y un despliegue local reproducible con Docker Compose.

## Arranque desde cero (entrega TP2)

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
├── nginx.conf
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
2. `mcr.microsoft.com/dotnet/aspnet:8.0` ejecuta solo los binarios publicados como usuario no root.

### Frontend

1. `node:22-alpine` ejecuta `npm ci` y `npm run build`.
2. `nginx:1.27-alpine` sirve solamente `dist/` y proxea `/api` al backend.

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

La suite incluida tiene 13 casos sobre fechas y transiciones de casos, duraciones, solapamientos y estados de turnos.

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

## Variante con imágenes de registry

`docker-compose.registry.yml` conserva servicios, variables, healthcheck, dependencia y volumen; reemplaza los dos `build:` por imágenes `v0.1.0`.

Para completar la publicación del TP2:

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

- `decisiones.md`: elección de la aplicación, arquitectura, contenerización, persistencia, problemas y declaración de asistencia de IA.
- `evidencias.md`: verificaciones y capturas reales de Compose, persistencia, tamaños y publicación en el registry.
