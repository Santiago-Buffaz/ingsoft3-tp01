# Decisiones de arquitectura y proceso

## TP1 — Git y colaboración

### Conflicto de merge

Git no pudo resolver automáticamente el conflicto porque dos ramas modificaron la misma parte del README de maneras incompatibles. Git identificó ambas versiones, pero no podía decidir cuál representaba el resultado correcto.

El conflicto se resolvió manualmente revisando los marcadores `<<<<<<<`, `=======` y `>>>>>>>`, conservando el contenido necesario y creando un commit de resolución.

### Protección de main

Se configuró un Ruleset activo sobre `main` para exigir que los cambios ingresen mediante Pull Request. Como el proyecto es individual, la cantidad de aprobaciones requeridas se dejó en cero, ya que GitHub no permite aprobar el propio Pull Request.

Se comprobó la protección intentando realizar un push directo a `main`. GitHub rechazó la operación, demostrando que la regla también se aplica al propietario del repositorio.

### Asistencia de IA

Se utilizó asistencia de IA para interpretar los mensajes de Git, ordenar la resolución del conflicto y redactar parte de la documentación. El conflicto, el Pull Request, el push rechazado, el tag y la Release fueron ejecutados y comprobados manualmente.

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

## TP3 — Planificación y trazabilidad

### Duración del sprint

Se configuró un sprint de dos semanas, desde el 31/08/2026. Elegí esta duración porque permite trabajar con incrementos pequeños, recibir retroalimentación frecuente y mantener el trabajo alineado con el calendario de entregas de la materia.

### Límite de trabajo en progreso

Se configuró un límite WIP de 2 elementos en la columna `In Progress`. Como el proyecto es individual, se aplicó la regla de cantidad de personas más uno: un elemento principal en desarrollo y un segundo lugar disponible si el primero queda esperando una revisión o respuesta. Un límite mucho mayor aumentaría el cambio de contexto y dejaría de cumplir su función.

### Diagnóstico de la historia mal escrita

La historia “Como desarrollador quiero crear la tabla usuarios para guardar los datos” está mal planteada porque describe una tarea técnica y no un incremento de valor observable para un usuario.

La reescribiría como: “Como administrador del estudio jurídico quiero registrar usuarios para asignarles permisos y controlar el acceso a LexAgenda”.

### Problemas encontrados y resolución

Al comenzar, GitHub CLI no tenía el permiso necesario para consultar y administrar Projects. El problema se resolvió ejecutando `gh auth refresh -s project` y autorizando nuevamente GitHub CLI desde el navegador.

Además, los Projects personales se crean privados por defecto. Se cambió la visibilidad a pública y se verificó que los issues del repositorio fueran incorporados automáticamente al Project.

### Asistencia de IA

Se utilizó asistencia de IA para interpretar la consigna, organizar el procedimiento, redactar los textos iniciales de los issues y resolver dudas durante la configuración.

La creación del Project, los issues, la jerarquía, el sprint, el tablero y sus automatizaciones fue realizada y verificada manualmente. También se comprobó que el Project fuera público y que la estructura coincidiera con los requisitos del TP3.

## TP4 — Integración continua

### Estructura del pipeline

El pipeline está definido como código en `.github/workflows/ci.yml`. Se ejecuta en cada Pull Request dirigido a `main` y también en cada push a `main`.

Se definieron dos jobs independientes: `build-backend` y `build-frontend`. Cada job utiliza su propio runner de GitHub Actions y ambos pueden ejecutarse en paralelo porque ninguno depende del resultado del otro.

El backend se construye utilizando `backend/Dockerfile` y el frontend utilizando `frontend/Dockerfile`.

### Caché de capas

El workflow utiliza Docker Buildx y la caché de GitHub Actions. Se configuraron scopes separados para backend y frontend para evitar que las capas de las dos imágenes se mezclen.

En el backend pueden reutilizarse la imagen base, la copia de los archivos de proyecto y la restauración de dependencias. Cuando cambia el código fuente, se reconstruyen las capas posteriores de copia y publicación.

En el frontend pueden reutilizarse la imagen base, los archivos de dependencias y la ejecución de `npm ci`. Cuando cambia el código de la aplicación, se reconstruyen la copia del código y el build de Vite.

La caché mejora el tiempo de ejecución, pero no es necesaria para que el pipeline funcione. Si desaparece, las imágenes se construyen nuevamente desde cero y la ejecución tarda más.

### Uso de los Dockerfiles

El pipeline utiliza los mismos Dockerfiles creados en el TP2. De esta manera, el procedimiento de construcción se mantiene definido en un único lugar y no se duplican comandos de compilación dentro del workflow.

Esto evita diferencias entre las imágenes construidas localmente y las verificadas por GitHub Actions.

### Gate de calidad

El Ruleset de `main` exige que los checks `build-backend` y `build-frontend` terminen correctamente antes de permitir un merge. También exige que la rama esté actualizada con la versión más reciente de `main`.

De esta manera, un cambio que no puede construir alguna de las imágenes no puede incorporarse a la rama principal.

### Demostración rojo, bloqueo, arreglo y verde

Para comprobar el gate se creó un Pull Request con un `using` inexistente en el backend. El job `build-backend` falló, mientras que `build-frontend` terminó correctamente. Como el check del backend era obligatorio, GitHub bloqueó el merge.

Luego se eliminó la referencia inválida mediante un segundo commit en el mismo Pull Request. Los dos jobs finalizaron correctamente y GitHub habilitó el merge.

También se mantuvo abierto un segundo Pull Request mientras cambiaba `main`. GitHub lo marcó como desactualizado y exigió actualizar la rama y ejecutar nuevamente los checks antes del merge.

### Problemas encontrados y resolución

El workflow del TP3 solamente realizaba `checkout`, por lo que fue reemplazado por el pipeline completo que construye las imágenes del backend y del frontend.

Al configurar el Ruleset, inicialmente los nombres `build-backend` y `build-frontend` se agregaron como si fueran un único check. Se eliminó esa configuración y se añadieron nuevamente como dos checks independientes.

La reutilización de capas se comprobó mediante una segunda ejecución, observando capas marcadas como `CACHED` tanto en el backend como en el frontend.

### Asistencia de IA

Se utilizó asistencia de IA para adaptar el workflow a la estructura de LexAgenda, interpretar los resultados de GitHub Actions, resolver la configuración de los checks y redactar parte de la documentación.

La creación de ramas y commits, los Pull Requests, el fallo deliberado, la corrección, la configuración del Ruleset, la comprobación de la caché y los merges fueron realizados y verificados manualmente.

## Aclaración general sobre la asistencia de IA

Durante los cuatro trabajos prácticos utilicé asistencia de IA para interpretar las consignas, adaptar a macOS los comandos y procedimientos mostrados en las guías, convertirlos en un paso a paso más específico y resolver dudas o errores puntuales.

La IA se utilizó como apoyo para comprender y ejecutar el proceso. Todas las operaciones, configuraciones, capturas, Pull Requests, ejecuciones de Docker y GitHub Actions, tags y releases fueron realizadas y verificadas personalmente.
