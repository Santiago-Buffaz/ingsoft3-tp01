<!-- TP7:ENLACES:INICIO -->
## Enlaces del TP7

- [Paquete público del backend](https://github.com/users/Santiago-Buffaz/packages/container/package/ingsoft3-tp01-backend) · `ghcr.io/santiago-buffaz/ingsoft3-tp01-backend`.
- [Paquete público del frontend](https://github.com/users/Santiago-Buffaz/packages/container/package/ingsoft3-tp01-frontend) · `ghcr.io/santiago-buffaz/ingsoft3-tp01-frontend`.
- Etiqueta de ambas imágenes en el ensayo: `sha-b1bd4651506fd82d857959f67134cb8e2fdefbb8`; en la recuperación: `sha-300a3070ba83f7b6dbd333c3235da25c9bec2caf`.
- [Commit que cambió el botón](https://github.com/Santiago-Buffaz/ingsoft3-tp01/commit/b1bd4651506fd82d857959f67134cb8e2fdefbb8) · [PR #27](https://github.com/Santiago-Buffaz/ingsoft3-tp01/pull/27) · [corrida roja #38](https://github.com/Santiago-Buffaz/ingsoft3-tp01/actions/runs/40244244743).
- Reportes de esa misma corrida: [integración verde, 3 aprobadas](https://github.com/Santiago-Buffaz/ingsoft3-tp01/actions/runs/40244244743/artifacts/12618008453) · [E2E rojo, 3 fallidas, con captura y trazas](https://github.com/Santiago-Buffaz/ingsoft3-tp01/actions/runs/40244244743/artifacts/12618078760).
- [Corrección, PR #28](https://github.com/Santiago-Buffaz/ingsoft3-tp01/pull/28) · [corrida completa verde #40, posterior al ensayo y hasta PROD](https://github.com/Santiago-Buffaz/ingsoft3-tp01/actions/runs/40245238070) · [promoción a producción](https://github.com/Santiago-Buffaz/ingsoft3-tp01/actions/runs/40245238070/job/121325956904).
- Reportes de recuperación: [integración verde](https://github.com/Santiago-Buffaz/ingsoft3-tp01/actions/runs/40245238070/artifacts/12618322494) · [E2E verde](https://github.com/Santiago-Buffaz/ingsoft3-tp01/actions/runs/40245238070/artifacts/12618801151).
- QA: [frontend](https://lexagenda-front-qa-sbuffaz.onrender.com) · [API](https://lexagenda-api-qa-sbuffaz.onrender.com) · [salud](https://lexagenda-api-qa-sbuffaz.onrender.com/health).
- PROD: [frontend](https://lexagenda-front-prod-sbuffaz.onrender.com) · [API](https://lexagenda-api-prod-sbuffaz.onrender.com) · [salud](https://lexagenda-api-prod-sbuffaz.onrender.com/health).

La corrida #40 documenta la recuperación del ensayo. El cierre documental también genera imágenes y otra corrida; el tag `v7.0.0` se coloca sólo después de verificar cuál de esos commits está en PROD. Las notas de la release registran esa corrida final y su SHA. `git rev-list -n1 v7.0.0` permite obtenerlo sin suponer que coincide con la punta actual de `main`.

Las secciones TP1–TP6 se conservan como historia de cada etapa. La sección TP7 al final describe el proceso vigente. Las URLs de QA y PROD se mantienen para la defensa; los detalles privados de Render se muestran desde el panel.
<!-- TP7:ENLACES:FIN -->

<!-- TP6:ENLACES:INICIO -->
## Enlaces de este TP — TP6

- [Paquete público del backend](https://github.com/users/Santiago-Buffaz/packages/container/package/ingsoft3-tp01-backend).
- [Paquete público del frontend](https://github.com/users/Santiago-Buffaz/packages/container/package/ingsoft3-tp01-frontend).
- [Job de un PR verde: Entrar al registry salteado](https://github.com/Santiago-Buffaz/ingsoft3-tp01/actions/runs/40202254345/job/121195706516).
- [Job de main: construir y publicar como último paso propio](https://github.com/Santiago-Buffaz/ingsoft3-tp01/actions/runs/40202749007/job/121197178919).
- QA: [frontend](https://lexagenda-front-qa-sbuffaz.onrender.com) · [API](https://lexagenda-api-qa-sbuffaz.onrender.com) · [salud](https://lexagenda-api-qa-sbuffaz.onrender.com/health).
- PROD: [frontend](https://lexagenda-front-prod-sbuffaz.onrender.com) · [API](https://lexagenda-api-prod-sbuffaz.onrender.com) · [salud](https://lexagenda-api-prod-sbuffaz.onrender.com/health).
- [Primer QA automático](https://github.com/Santiago-Buffaz/ingsoft3-tp01/actions/runs/40212824842).
- [Corrida rechazada](https://github.com/Santiago-Buffaz/ingsoft3-tp01/actions/runs/40212824842) · [promoción aprobada A](https://github.com/Santiago-Buffaz/ingsoft3-tp01/actions/runs/40214755224) · [versión B del ensayo](https://github.com/Santiago-Buffaz/ingsoft3-tp01/actions/runs/40228356830).
- [Rollback del backend en Render](https://dashboard.render.com/web/srv-dbf1v50473hc73bin2m0/deploys/dep-dbf67t8473hc73c0bp40) · [rollback del frontend en Render](https://dashboard.render.com/web/srv-dbf2f1gae00c73ehta1g/deploys/dep-dbf6pscs728c73eafadg). El detalle de Render se muestra desde mi cuenta en la defensa.

Las imágenes se identifican con sha- seguido del commit completo. Las páginas de los paquetes permiten elegir la versión correspondiente a cada merge. El tag académico de cierre es v6.0.0; su commit se comprueba contra el último despliegue aprobado, no suponiendo que es la punta actual de main.
<!-- TP6:ENLACES:FIN -->

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

## TP5 - Calidad automatizada
### Lógica elegida y técnicas

Elegí probar reglas que afectan el uso de LexAgenda: el vencimiento de un caso no puede ser anterior a su apertura; las transiciones de estado deben ser válidas; los turnos sólo admiten duraciones de 30, 60 o 90 minutos; dos turnos contiguos no deben tratarse como superpuestos; PENDIENTE y CONFIRMADO son los estados activos que reservan horario; y el inicio de un turno debe ser posterior al reloj actual.

La suite final del backend contiene 20 métodos de test y ejecuta 29 casos. Los métodos siguen Arrange, Act, Assert; los Theory e InlineData repiten un comportamiento con entradas distintas y no se cuentan como métodos adicionales. Se verifican resultados y errores concretos, incluidos inicio igual a ahora, duración inválida y borde de horarios contiguos.

En frontend se ejecutan 34 casos unitarios sin DOM. Se prueban el cliente HTTP, el armado de rutas, filtros y cuerpos JSON, la traducción de errores y las utilidades de fecha. Se usan it.each, casos de error y vi.fn. TZ=UTC y el reloj falso evitan depender de la fecha o zona del runner. El reloj se restaura después de cada test.

No agregué una regla nueva de negocio para llegar al mínimo: las reglas ya existían. Las funciones descriptivas de estados del primer PR son código nuevo acotado para demostrar el efecto de agregar lógica sin tests; no cambian las transiciones permitidas ni se conectaron a la UI.

### Mocks y cambios para poder probar

El backend ya tenía IAppClock inyectado en TurnoService. La validación temporal estaba dentro de un método del servicio que también utiliza la base de datos. Extraje esa condición a TurnoRules.ValidarInicio y mantuve su llamada desde el servicio. Así puedo verificar la misma regla sin montar Postgres.

Con Moq, SetupGet fija UtcNow y VerifyGet comprueba que el reloj se consultó exactamente una vez; VerifyNoOtherCalls verifica que no hubo otras interacciones. La respuesta fija es el papel de stub; la comprobación de la interacción es lo que hace que el test use un mock. También compruebo la excepción o ausencia de excepción: verificar sólo la llamada no probaría la regla.

En frontend convertí el cliente en createApi(fetcher), con globalThis.fetch como valor por defecto. La exportación api conserva las llamadas de la aplicación. En los tests inyecto vi.fn y respuestas HTTP en memoria; los asserts comprueban ruta, método, cuerpo y resultado, sin salir a la red. Las utilidades puras no necesitan mocks.

### Cobertura, métrica y elección del umbral

El gate final del backend exige **12% de líneas**. El primer piso fue 8,5%, contra la base medida de aproximadamente 8,76%. Después de incorporar las pruebas del código nuevo elevé el piso a 12%. No bajé el umbral para hacer pasar el PR.

En la corrida verde enlazada abajo, el backend registra **12.59% de líneas** (51/405) y **28.00% de ramas**. Ramas se informa siempre, aunque el gate de backend esté configurado sobre líneas.

Esta cobertura global sigue siendo baja: hay servicios, controladores y manejo de errores que cuentan y todavía no están probados por esta suite. El 12% es un punto inicial para impedir retrocesos sobre la base medida, no una afirmación de cobertura suficiente para producción. Para subirlo tengo que probar más comportamientos de servicios y sus bordes, aislar sus dependencias cuando corresponda e incorporar pruebas de integración para la colaboración con datos. Excluir esos servicios para aumentar el porcentaje escondería el trabajo pendiente.

El gate del frontend exige **90% de líneas y 80% de ramas** sobre la lógica TypeScript incluida. El resultado real es **100.00% de líneas** (50/50) y **100.00% de ramas**. Se eligió un margen por debajo de esa base que aun así detecta el agregado concreto de código sin tests. No garantiza detectar cualquier cambio de cualquier tamaño.

Los summaries y ambos reportes HTML descargables están en [esta corrida verde](https://github.com/Santiago-Buffaz/ingsoft3-tp01/actions/runs/40151951191). Los porcentajes de esta sección se tomaron de sus artefactos, no de una corrida local distinta.

### Alcance y exclusiones de cobertura

- Backend: se excluye Program, que arma la aplicación y registra servicios/rutas; se verificó que las reglas bajo prueba están fuera de ese arranque.
- Backend: se excluye LexAgenda.Api.Data, que contiene el DbContext y el mapeo de persistencia, sin las reglas elegidas. La configuración de datos requiere pruebas de integración y no se considera probada por esta exclusión.
- Backend: se excluyen LexAgenda.Api.Models y LexAgenda.Api.DTOs, clases de datos y transporte sin comportamiento propio en esta versión.
- Backend: servicios, reglas, controladores, middleware y excepciones siguen en la cuenta. No se filtró el reporte a una sola clase para mostrar un número mayor. El proyecto de tests no forma parte del código de aplicación medido por Coverlet.
- Frontend: include abarca src/**/*.ts y excluye src/**/*.d.ts y src/types/** porque son declaraciones de tipos, sin comportamiento ejecutable. El cliente HTTP y las utilidades entran aunque ningún test los importe.
- Frontend: los archivos TSX de arranque, componentes y páginas, así como CSS y recursos estáticos, quedan fuera de este alcance unitario sin DOM. Esto limita el significado del 100%: no significa que la interfaz ni toda LexAgenda estén cubiertas. Las pruebas de UI e integración quedan pendientes; no se considera demostrado su comportamiento por medir sólo los archivos TS.
- Las carpetas de tests, dependencias, builds y reportes no son código de aplicación dentro del alcance configurado.

### Una única medición y ejecución en Docker

Se usa coverlet.msbuild 6.0.4 para instrumentar, exportar coverage.cobertura.xml y exigir el umbral en la misma ejecución. No se instaló coverlet.collector ni se agregó --collect. Es una adaptación declarada de la práctica sugerida: [Coverlet indica elegir una integración y no instalar ambas juntas](https://github.com/coverlet-coverage/coverlet#msbuild-integration-guide-known-issue). ReportGenerator 5.4.18 transforma ese mismo XML en HTML y summary, sin aplicar un segundo filtro de clases que cambie el alcance.

Vitest y coverage-v8 están fijados en 4.1.0 para el Vite 8.2.1 del proyecto. Se versionó package-lock.json para que npm ci reproduzca las dependencias resueltas.

Los jobs conservan los nombres build-backend y build-frontend del TP4. Ambos construyen la imagen final y la etapa test de su Dockerfile; test está entre build y final y hereda el directorio de trabajo. load: true permite ejecutar la imagen de tests en el runner; push: false evita publicarla. Hay cuatro scopes de caché separados.

Los tests se ejecutan mediante el ENTRYPOINT al hacer docker run. Un volumen guarda sus reportes fuera del contenedor. !cancelled() permite publicar los reportes después de un fallo de cobertura; no convierte el test fallido en éxito. El frontend tiene reportOnFailure. Los artefactos coverage-backend y coverage-frontend conservan HTML y datos de medición durante 30 días. Se comprobó su presencia en la corrida enlazada.

### Primer PR: rojo por cobertura, corrección y merge

En el [primer PR, ya mergeado](https://github.com/Santiago-Buffaz/ingsoft3-tp01/pull/17), agregué EstadoTurnoTexto.cs y estadoTurnoTexto.ts sin sus pruebas. Compilaron y todos los tests existentes pasaron, pero aumentó el código medido sin aumentar el código cubierto.

En [la corrida roja por cobertura](https://github.com/Santiago-Buffaz/ingsoft3-tp01/actions/runs/40151213292), build-backend quedó rojo por **líneas: 8.39% < 8,5%**, y build-frontend por **líneas: 88.00% < 90%**. El rojo se produjo por el umbral, no por un assert forzado ni por compilación. El log de cada job permite distinguirlo.

Agregué las pruebas de los cuatro estados y del estado desconocido, con asserts sobre los textos o la excepción. En backend también elevé el piso a 12%. La [corrida verde con esos tests](https://github.com/Santiago-Buffaz/ingsoft3-tp01/actions/runs/40151951191) permitió el merge. Los checks del TP4 siguen requeridos por main: el código de salida de la herramienta pasa a Docker, de Docker al step y del step al job obligatorio.

### Segundo PR: prueba vigente del freno

El [segundo PR, abierto y rojo](https://github.com/Santiago-Buffaz/ingsoft3-tp01/pull/18) agrega prioridadCasoTexto.ts sin sus tests. No se mergea ni se cierra hasta la defensa. La compilación y los tests existentes pasan; build-frontend falla por cobertura de líneas. Se mantiene como PR normal, no como borrador, para que el motivo demostrable del bloqueo sea el required check.

El primer PR demuestra la historia completa; éste permite ver que el freno sigue funcionando. El tag v5.0.0 corresponde a main con la implementación corregida y esta documentación, sin el archivo deliberadamente sin probar.

### Cobertura alta no equivale a calidad

Mi ejemplo es TurnoRules.SeSuperponen. Llamar al método sin assert ejecutaría sus líneas y sumaría cobertura aunque aceptara una superposición incorrecta. El test de turnos contiguos sí exige false: detectaría, por ejemplo, que se reemplazara el límite estricto por uno inclusivo. El porcentaje sólo informa ejecución; el assert comprueba el resultado esperado.

CasoRules muestra otra limitación: todas sus líneas pueden estar ejecutadas mientras falta una alternativa de la condición de vencimiento. Por eso miro también ramas. Ni un porcentaje alto ni tests verdes prueban que haya interpretado bien todos los requisitos.

### Ejercicio obligatorio del camino sin cubrir

Abrí el HTML del backend y revisé [CasoRules.ValidarFechas, línea 20](https://github.com/Santiago-Buffaz/ingsoft3-tp01/blob/aaebdb553c088346fda22d1469623712ff3a86f4/backend/LexAgenda.Api/Services/CasoRules.cs#L20). La condición es vencimiento.HasValue && vencimiento.Value < apertura.

Los tests actuales prueban una fecha anterior y una igual a la apertura, pero no vencimiento = null. La entrada concreta apertura = new DateOnly(2026, 8, 20), vencimiento = null recorre HasValue == false y el cortocircuito del &&: no debe evaluar Value ni lanzar BusinessException.

Decisión: **no agregué ese test en este cierre** y lo registré como caso pendiente. La consigna permite esa decisión; lo obligatorio es identificar el camino, dar una entrada concreta y explicar qué hice. Esto no es una rama de Git: es una alternativa de ejecución del código.

### Problemas y soluciones

La Mac no necesita dotnet ni npm instalados: los comandos locales usan las imágenes SDK 8 y Node 22. Las versiones de Vitest y coverage-v8 se fijaron juntas para evitar incompatibilidad con Vite. Usé el package-lock.json preparado con npm 11.6.2 dentro de Node; las imágenes instalan con npm ci a partir de ese lock.

La ruta de Cobertura es plana, TestResults/coverage.cobertura.xml, porque se usa la integración MSBuild. No se usó el patrón con subcarpeta GUID del ejemplo collector. Esto mantiene reporte y gate sobre el mismo XML.

Los tests de fechas fijan UTC y un instante conocido. El formato de hora puede incluir el sufijo regional a. m.; el assert acepta esa decoración, pero comprueba exactamente hora y minutos. Los fallos deliberados de los PRs se resolvieron agregando tests en el primero y se conservaron como evidencia en el segundo.

### Uso de IA y verificación

Usé ChatGPT/Codex para preparar los tests, la configuración y este borrador. Apliqué los archivos preparados con un asistente local por etapas; no escribí manualmente todo ese código. Los cambios también se probaron en una copia aislada.

Para verificar mi entrega, ejecuté los comandos y abrí los reportes. En GitHub comprobé el primer PR rojo, su corrección y merge, y el segundo PR que quedó abierto. Los porcentajes y enlaces de este documento salen de esas corridas. El caso de vencimiento nulo quedó identificado como pendiente.

<!-- TP6:DECISIONES:INICIO -->
## TP6 — Entrega continua y entornos

### Qué agregué

Continué en el mismo repositorio de LexAgenda. Los tests y la cobertura del TP5 siguen siendo la primera condición. Después del merge, el pipeline publica backend y frontend en GHCR y actualiza QA. Para continuar a PROD hace falta revisar y aprobar el environment production.

La aplicación mantiene React con nginx en el frontend, .NET 8 en el backend y PostgreSQL en Neon. Cada entorno tiene frontend, API y base propia: app_qa o app_prod. Los cuatro servicios Docker están en Render. Los creé desde el repositorio y dejé Auto-Deploy en Off, para que el proveedor no se adelante a las verificaciones de GitHub.

### Qué hace confiable la publicación

La garantía combina tres condiciones: la protección de main exige CI y cobertura; sólo el evento push a main publica; y construir/publicar la imagen final es el último paso propio del mismo job que ejecutó sus tests. Si una verificación anterior falla, el paso final no corre. Los pasos Post de GitHub son limpieza automática.

El login utiliza GITHUB_TOKEN, sin PAT personal. Di contents: read y packages: write sólo a los dos jobs que publican. Los jobs de deploy no necesitan permiso de escritura sobre paquetes. Las imágenes de tests usan target: test y load: true para ejecutarse en el runner; no se publican como imágenes de la aplicación.

El enlace del PR muestra tests verdes y login salteado por la condición de evento/rama. El enlace de main muestra el orden final de publicación. Un PR rojo con el login salteado no demostraría esa condición: podría haberse omitido simplemente porque falló antes.

Cada job publica su componente después de sus propias pruebas; el inicio de QA depende de que los DOS jobs terminen bien. El registry conserva versiones identificables por commit. Publicar aunque falle la verificación haría que estar en el registry dejara de significar que ese componente superó los controles.

Esto garantiza el comportamiento del pipeline, no impide que alguien con permiso haga un docker push manual. Además, un tag es un nombre que técnicamente se puede reasignar; un digest identifica el contenido de la imagen. En este TP uso los tags sha- del commit como trazabilidad.

### Cadena y alcance de los datos

Los jobs build-backend y build-frontend conservan sus nombres para no romper los checks de la protección de main. deploy-qa declara needs para ambos. deploy-prod necesita deploy-qa. Los dos deploys tienen condición de push a main: los PR verifican, pero no despliegan.

El environment qa contiene RENDER_HOOK_API_QA y RENDER_HOOK_FRONT_QA. production contiene RENDER_HOOK_API_PROD y RENDER_HOOK_FRONT_PROD. Son URLs con una clave que permite disparar despliegues, por eso son secretos. URL_API y URL_FRONT son variables públicas con el mismo nombre en ambos environments y distinto valor.

La contraseña de Neon está en ConnectionStrings__Default del backend de Render correspondiente, no en la imagen, el workflow ni este documento. Los dos guiones bajos corresponden a la sección ConnectionStrings y la clave Default de .NET.

La dirección de la API del frontend quedó en BACKEND_URL y el DNS en DNS_RESOLVER. nginx genera su configuración al arrancar a partir de default.conf.template. Dentro de la imagen quedaron los archivos compilados de React, nginx y la plantilla. Los valores por defecto backend:8080 y 127.0.0.11 permiten usar Compose; Render los reemplaza con la API pública y el resolver configurado.

Probé una misma imagen local con dos configuraciones de arranque y comparé los IDs de imagen. Cambiar el entorno no necesita recompilar React. Host usa el servidor de destino y SNI permite la conexión HTTPS hacia la API de Render.

### Delivery y criterio de aprobación

Implementé Continuous Delivery: el cambio queda verificado y QA se actualiza solo, pero llegar a PROD requiere una decisión humana. Continuous Deployment quitaría esa última aprobación. Hoy prefiero conservarla porque las verificaciones automáticas todavía no comprueban toda la experiencia ni tengo observabilidad de producción completa.

production tiene a mi usuario como required reviewer y Prevent self-review desactivado para poder practicar solo. Un environment no aloja la app: reúne secretos y variables con alcance, reglas de protección e historial de despliegues. El servicio corre en Render.

Antes de aprobar reviso CI y smoke QA, el SHA Live de los dos servicios QA, el cambio visible en la pantalla, la carga de Clientes, los destinos de PROD y que no haya una promoción vieja pendiente. El comentario del rechazo que dejé fue:

> No lo paso a producción todavía porque abajo de LexAgenda sigue apareciendo “TP6 · Revisión QA pendiente”. Quedó ese texto de prueba, así que primero lo voy a cambiar por el definitivo y revisar que se vea bien antes de aprobar el despliegue.

El rechazo detuvo ese run antes de ejecutar los hooks de PROD. La corrección se promovió en una corrida nueva. No cambié los tests ni bajé la cobertura para fabricar ese caso.

Esta revisión sigue sin demostrar rendimiento bajo carga, todos los recorridos de usuario ni ausencia de fallas intermitentes. Necesitaría mejores E2E y métricas de error/latencia para tomar una decisión más completa; esos temas continúan en los siguientes TPs.

### Commit, reconstrucción y límite del smoke

Los hooks reciben ref con GITHUB_SHA de la corrida. Si usara solamente la rama, otro merge podría hacer que Render construya un commit distinto del que acaba de pasar los controles. La concurrencia de PROD evita dos jobs simultáneos, pero no vuelve seguro aprobar una corrida antigua fuera de orden. Para este ejercicio trabajé una promoción por vez.

Render reconstruye desde el repositorio. Por eso en TP6 promuevo el mismo commit, pero no ejecuto la imagen publicada por Actions. Una reconstrucción puede cambiar por dependencias externas o bases de imagen que se actualicen: no puedo afirmar igualdad de bytes entre esos builds. El TP7 conecta la promoción con la imagen del registry.

El hook aceptado sólo confirma que se pidió el deploy. El smoke consulta /health, /api/clientes y el frontend. La consulta a Clientes añade una comprobación de acceso a la base; /health solo informa disponibilidad del proceso. Hay 30 intentos, pausas de 20 segundos y timeout por petición; al agotarse, el job devuelve error.

Un smoke verde no informa qué versión respondió, ni prueba que todos los flujos funcionen. La versión anterior podría seguir sirviendo mientras Render construye la nueva. Por eso antes de aprobar o cerrar la entrega comparé el SHA solicitado con los dos servicios Live y revisé el texto visible. No presento el HTTP 200 como prueba de identidad de versión.

### Aislamiento y plan gratuito

Creé la marca SOY PROD - LexAgenda TP6 mediante SQL sólo en app_prod y comprobé que no aparece en QA. También guardé un cliente ficticio de QA que no aparece en PROD. Las bases son distintas aunque compartan proyecto/rama de Neon. Los hooks de PROD se contrastan con el id del servicio de PROD en Render.

Los servicios gratuitos pueden dormir por inactividad y necesitan tiempo de arranque. Las horas del workspace se comparten entre los servicios: cuatro servicios no significan cuatro cuotas completas independientes. Los reintentos y timeouts manejan una espera limitada; no prometen resolver una cuota agotada. No agregué un ping continuo para mantenerlos despiertos.

Datos que revisé en mis cuentas: El 25/10/2026 revisé los paneles de mis cuentas. En Render, Billing > Monthly Included Usage mostraba 10,27 de 750 horas gratuitas, 5 de 500 minutos de construcción, 1 MB de los 5 GB incluidos de transferencia, 4 de 25 servicios y 0 de 2 dominios personalizados. Esos valores corresponden al workspace completo. En Neon, Billing confirmaba Free Plan, USD 0 por mes, con 1 GB de almacenamiento, 100 horas de cómputo, autoescalado hasta 2 CU y 10 ramas por proyecto. En Organization > Projects, con un único proyecto lexagenda-tp6, el consumo mostrado era 0,19 CU-h, 0,04 GB de almacenamiento, 0,01 GB de historial y 0 GB de transferencia, desde el 25/10/2026. El panel advierte que las métricas pueden demorar una hora y no se actualizan para proyectos inactivos. Registré los valores de mi cuenta que aparecen en las capturas, no los números de ejemplo de la documentación.

Elegí Neon para la base, en vez del Postgres gratuito temporal de Render. Los builds y las pruebas de recuperación también consumen recursos. Antes de la defensa revisaré que las URLs y las cuotas sigan disponibles y abriré los servicios con tiempo para el cold start.

### Patrón que elegiría en una producción real

Para un estudio que necesita consultar su agenda durante el horario de atención elegiría blue-green si puede asumir el costo: dos versiones preparadas de la infraestructura de producción y un cambio de tráfico después de comprobar la nueva. Permite recuperar el tráfico hacia la versión anterior con rapidez mientras esa versión siga sana.

El costo de cómputo puede acercarse al doble durante la convivencia. El beneficio sería reducir el tiempo de recuperación de la aplicación; no elimina errores compartidos ni problemas de datos. Hace falta que ambos esquemas y contratos sean compatibles. Hoy me faltan balanceo/control de tráfico, capacidad duplicada, métricas de errores y latencia, alertas y una verificación de negocio más completa.

QA y PROD NO son las dos mitades de blue-green: QA tiene datos de prueba. Blue-green necesita dos slots de PRODUCCIÓN y un mecanismo para dirigir el tráfico. El TP actual usa redespliegues del proveedor; no implementé blue-green, canary ni flags.

Canary permitiría exponer el cambio a pocos usuarios, pero sin métricas para comparar los errores no sabría cuándo frenarlo. Rolling reemplaza instancias por tandas y obliga a tolerar versiones simultáneas. Un feature flag controla una funcionalidad dentro de la app y puede combinarse con esos patrones; no es lo mismo que repartir tráfico entre dos versiones.

### Plan actual de rollback y medición

Hice un ensayo controlado, no un incidente con usuarios. A era la versión conocida con “Agenda del estudio”; B mostraba “TP6 · Ensayo de recuperación”. Ambas habían pasado CI, QA y aprobación de PROD.

- SHA de A, destino de recuperación: d2fb7afd0c754746c580894b791bec8304cebae3.
- SHA de B, versión desde la que volví: 95c192a799c7b7126d284606b9c9af1c9685c1a5.

El procedimiento fue: detener nuevas promociones; identificar A por su despliegue aprobado; recuperar desde Render los hooks de los DOS servicios de PROD; iniciar el cronómetro; llamar a ambos hooks con ref=A; esperar Live con ese SHA en ambos; recargar el frontend y comprobar Clientes. No usé main como destino ni v5.0.0, que todavía no tiene la plantilla nginx de TP6.

El primer intento del frontend figuró Live, pero la web seguía mostrando el texto de B. Después de revisar el timeout de detección de puerto y la configuración indicada, volví a desplegar A manualmente desde el dashboard. La fila del frontend y su enlace corresponden a ese reintento, que sí recuperó la interfaz. Conservé también el [detalle del primer intento del frontend](https://dashboard.render.com/web/srv-dbf2f1gae00c73ehta1g/deploys/dep-dbf67tl9fdbs738vj39g). La explicación del problema y el alcance de la comprobación están en Problemas y uso de IA.

| Servicio PROD | Inicio del despliegue | Live del mismo deploy | Intervalo entre las marcas visibles |
|---|---|---|---|
| Backend | 2026-10-25T17:17:57-03:00 | 2026-10-25T17:34:16-03:00 | 979 segundos |
| Frontend | 2026-10-25T17:56:17-03:00 | 2026-10-25T17:56:43-03:00 | 26 segundos |

El tiempo total observado desde antes de llamar a los hooks hasta confirmar los servicios Live y el funcionamiento de la interfaz fue 2654 segundos. Incluye la espera, el diagnóstico, los reintentos y mi confirmación manual. No es la suma de las dos duraciones de la tabla ni representa solamente tiempo de construcción.

Sobre las marcas horarias: Tomé el inicio del campo Deployed del detalle de cada despliegue y la hora final de la línea «Your service is live» de sus logs, con el visor configurado en GMT-3 (-03:00), el 25/10/2026. El backend corresponde al pedido original por Deploy Hook y el frontend al reintento manual que dejó la interfaz correcta. Las marcas visibles dan intervalos de 979 segundos para backend y 26 para frontend. El campo Duration de Render muestra, respectivamente, 16m18s y 25.7s; conservo ambos datos sin hacerlos coincidir artificialmente. El total del asistente incluye la espera, el diagnóstico, el reintento del frontend y mi confirmación manual posterior; no es solamente el tiempo del último build.

Los enlaces del detalle de cada deploy están arriba. Deploys conserva el SHA y el estado Live. Una respuesta /health de B no habría sido suficiente para detener el cronómetro. Este ensayo practica el tiempo de recuperación de un despliegue fallido, relacionado con la métrica DORA de recuperación; una única prueba no permite afirmar una media de incidentes.

El rollback vuelve el código, no la base de datos ni las variables del servicio. Una migración que borrara una columna o un dato no se deshace por volver al commit anterior. Para cambios de datos necesitaría compatibilidad de esquema, respaldos/restauración y un procedimiento específico probado.

El ensayo comenzó por hooks, con el procedimiento de emergencia que propone la guía. Sus pedidos y el reintento manual del frontend quedan registrados en Render; no son una nueva promoción aprobada desde Actions. Para la entrega, el cierre documental vuelve a pasar por el pipeline, QA y la aprobación de PROD, y después se crea v6.0.0 sobre ese commit desplegado.

### Problemas y uso de IA

Al desplegar el frontend de QA, LexAgenda abría, pero en Clientes aparecía el mensaje «No se pudo completar la operación». Con ayuda de Codex comprobé el backend y el frontend por separado: el backend respondía correctamente en `/health` y devolvía `[]` en `/api/clientes`, mientras que esas consultas desde el frontend devolvían 404. Esto permitió ubicar el problema en la conexión del frontend con la API.

Revisé las variables del frontend en Render: `BACKEND_URL` debía quedar como `https://lexagenda-api-qa-sbuffaz.onrender.com`, sin barra final ni rutas agregadas, y `DNS_RESOLVER` como `8.8.8.8`. Después de aplicar la configuración y volver a desplegar, la consulta `/api/clientes` desde el frontend devolvió HTTP 200 con `[]` y Clientes cargó sin el mensaje rojo. También corregí la dirección de una prueba: había abierto `/clientes/api/clientes`, cuando correspondía `/api/clientes` desde la raíz del dominio.

Al iniciar el rollback desde mi Mac, el asistente se frenó con el mensaje «No se pudo confirmar el hook de backend». Con ayuda de Codex se reprodujo un problema de certificados HTTPS en Python: una consulta de lectura a Render fallaba con CERTIFICATE_VERIFY_FAILED. La misma conexión con curl del sistema sí respondía. Se ajustó el asistente para usar curl manteniendo la verificación HTTPS, mostrar errores concretos y aceptar las respuestas de despliegue sin depender de que siempre incluyan JSON. La corrección se probó con respuestas simuladas, sin disparar despliegues durante esas pruebas. Este intento interrumpido no se tomó como evidencia de un rollback terminado.

Durante el ensayo de rollback ingresé los SHA y respondí SI en la terminal antes de comprobar que los dos servicios estuvieran Live con A. El asistente registró 295 segundos, pero Render todavía mostraba B activa y los nuevos despliegues en progreso. Descarté esa medición como prueba de finalización. Se agregó una confirmación separada que conserva el inicio original y permite completar la verificación sin volver a llamar a los hooks; los tiempos de construcción se toman de los detalles de Render.

Render terminó mostrando los dos servicios Live con el commit A, pero al abrir producción todavía aparecía «TP6 · Ensayo de recuperación», el texto de B. Una consulta externa también recibió ese frontend, por lo que no di el rollback por verificado. En los logs del frontend se veía que había descargado el commit A y terminado la construcción, pero después aparecía «Port scan timeout reached, no open ports detected». Ese intento figuraba exitoso con una duración de 16 minutos y 27 segundos. Con ayuda de Codex revisé el puerto: el código de nginx escucha en el 80 y se indicó configurar PORT=80 y desplegar nuevamente el commit A. Después del nuevo despliegue manual, Render mostró A Live en 25,7 segundos y la web volvió a mostrar «Agenda del estudio». Clientes siguió cargando el dato de PROD. La comprobación externa confirmó el subtítulo y las respuestas HTTP 200 de la API y del proxy del frontend. Conservé el intento anterior y el reintento para distinguir el tiempo del último despliegue del tiempo total de recuperación.

Para dar por terminada la recuperación comprobé el commit A en Render, el subtítulo «Agenda del estudio» y la carga del cliente de PROD. No tomé el HTTP 200 ni el estado Live por sí solos como prueba suficiente.

Usé ChatGPT/Codex para preparar una guía adaptada a LexAgenda, el workflow, la plantilla de nginx y una base de esta explicación. Apliqué los archivos preparados por etapas con un asistente local; no escribí manualmente todo el código. La verificación la hice ejecutando los pasos y leyendo sus resultados: CI, publicación pública, QA/PROD, revisión y rechazo, separación de datos y rollback con horas de Render. Revisé el texto para que describa lo que realmente hice y no tomé como evidencia una respuesta de la IA.
<!-- TP6:DECISIONES:FIN -->

<!-- TP7:DECISIONES:INICIO -->
## TP7 — Imágenes, integración y E2E como condición de promoción

### La unidad que se promueve

En TP6 Actions publicaba imágenes, pero Render reconstruía el repositorio para cada entorno. El mismo commit no garantizaba los mismos binarios: una imagen base o una dependencia externa podía cambiar entre construcciones. En TP7 Render ejecuta las imágenes ya publicadas por Actions. Para cada componente se construye y publica una imagen final después de sus tests; QA y PROD reciben la misma referencia del registry, sin reconstruir en el proveedor. Las etapas de tests siguen siendo imágenes de trabajo separadas, no las que se despliegan.

Convertí los cuatro servicios existentes de Render a `Existing Image`: API y frontend de QA, API y frontend de PROD. Conservé sus URLs, configuración, bases y hooks; no quedaron servicios duplicados. Para iniciar la conversión configuré las dos imágenes con `sha-7c43135fbcc7b67bb420117975ae70be346916d4`, el commit del cierre del TP6. Los despliegues posteriores los dispara el pipeline con otra etiqueta explícita.

La primera promoción con este mecanismo fue el commit `55b0a8a6c5173d8e8f876d18d833385cfec9187d`, [corrida #34](https://github.com/Santiago-Buffaz/ingsoft3-tp01/actions/runs/40239421181). Se verificaron ambas descargas públicas con una configuración vacía de Docker, sin credenciales de GHCR. Las capturas de los cuatro servicios mostraron los despliegues por hook con esa etiqueta.

### Etiquetas, credenciales y configuración por entorno

El pipeline etiqueta cada imagen `sha-<commit completo de 40 caracteres>`. Usa el SHA de la corrida, no una rama móvil ni el SHA corto. No publica `latest`: ese nombre cambia con el tiempo y dificultaría saber qué se verificó y qué recuperar. Un tag por SHA proporciona trazabilidad, pero técnicamente alguien con permiso podría reasignarlo; el digest identifica el contenido. La igualdad de referencias presupone que no se sobrescriben esas etiquetas.

Los hooks ahora reciben `imgURL`, construido con `ghcr.io/santiago-buffaz/ingsoft3-tp01-backend:sha-$GITHUB_SHA` o la variante `frontend`. `curl --get --data-urlencode` codifica el parámetro. Los dos jobs de deploy calculan las mismas referencias; cambian los hooks y las variables de entorno. Ya no se pide reconstruir con `ref`. `curl -f` convierte una respuesta HTTP de error en un fallo del paso.

La publicación sigue limitada al push a `main`. Cada job de build tiene `packages: write`, inicia sesión con el `GITHUB_TOKEN` de la corrida y publica sólo después de sus propias pruebas. QA depende de que ambos builds terminen bien. No se incorporó un PAT ni se incluyeron secretos en las imágenes. Las claves de los hooks están en los environments de GitHub; las conexiones a `app_qa` y `app_prod`, en los servicios backend correspondientes de Render.

La misma imagen del frontend sirve en ambos entornos. React compilado usa `/api`; nginx genera su configuración al arrancar desde `default.conf.template`, sustituyendo `BACKEND_URL` y `DNS_RESOLVER`. En Render cada frontend apunta a su API HTTPS y utiliza el resolver configurado. `proxy_ssl_server_name on` y `Host $proxy_host` permiten dirigirse al servicio correcto. Dentro de la imagen quedan la SPA, nginx y la plantilla; las direcciones concretas y los secretos de base quedan fuera. No recompilo React para cambiar de QA a PROD.

La imagen de `Settings → Image` es la configuración inicial del servicio, no necesariamente la que está activa: el hook puede desplegar otra etiqueta sin reemplazar ese ajuste. Para la comprobación uso el último despliegue activo y sus Events. Un `Manual Deploy` desde esa configuración podría volver a la imagen inicial; el procedimiento habitual del TP usa los hooks de Actions.

### Qué verifican las dos suites

Las dos suites están en `frontend/e2e/`, usan Playwright 1.62.1 y se ejecutan en jobs separados contra las URLs públicas de QA. `API_BASE_URL` apunta directamente al backend de QA; `E2E_BASE_URL`, al frontend de QA. Aunque hay valores locales de respaldo para trabajar en desarrollo, CI fija explícitamente las URLs desplegadas.

| Suite | Flujo | Resultado comprobado |
|---|---|---|
| Integración | Alta, lectura y baja | POST 201, consulta del dato persistido por ID y email, DELETE 204, GET 404 y ausencia en el listado. |
| Integración | Nombre vacío | HTTP 400 con «El nombre es obligatorio.» y ausencia del registro antes y después. |
| Integración | Búsqueda por email | Encuentra exactamente el cliente creado aunque el email se consulte en mayúsculas; una búsqueda sin coincidencia devuelve vacío. |
| E2E | Alta y eliminación desde la pantalla | Completa el formulario, comprueba la fila propia, abre el detalle, confirma la eliminación y verifica que desaparezca. |
| E2E | Nombre compuesto por espacios | Envía el formulario, observa el error real en pantalla y comprueba que no se creó el cliente. HTML `required` admite espacios; la validación de la API debe rechazarlos. |
| E2E | Búsqueda y persistencia al recargar | Crea un cliente, recarga, lo busca con un email que no coincide y luego con su email en mayúsculas; finalmente lo elimina. |

La tercera prueba de cada suite cubre una necesidad cotidiana: encontrar la ficha de un cliente. Si la búsqueda falla, quien atiende el estudio no puede localizarla aunque el alta haya funcionado. La integración comprueba el filtro de la API y su consulta a PostgreSQL; el navegador comprueba también el formulario de búsqueda, su envío y el resultado visible después de recargar.

La integración usa únicamente `request`: recorre HTTP, ASP.NET, EF Core/Npgsql y PostgreSQL real de QA, sin navegador ni dobles. Es integración amplia porque prueba el servicio desplegado con su base. Reutiliza el entorno y detecta problemas de configuración y persistencia, a cambio de depender de la red, la disponibilidad y un estado compartido. Una integración estrecha podría arrancar la aplicación y un Postgres temporal controlado por cada test; sería más aislada, pero no comprobaría el despliegue real.

Las E2E usan Chromium y los controles reales por rol, nombre y label. No hay interceptación de respuestas, HAR, mocks de API ni pruebas salteadas por indisponibilidad. No dupliqué en el navegador todas las combinaciones de reglas de casos, turnos o fechas: esas combinaciones pertenecen a la base unitaria de la pirámide. Tampoco cubro todavía todos los CRUD relacionados, rendimiento ni seguridad. En integración prioricé los límites de persistencia y validación de Clientes. Un verde sólo cubre los comportamientos que estas pruebas afirman.

### Datos, esperas y diagnóstico de fallos

Cada intento de cada prueba genera nombre y email con timestamp y parte de un UUID. Sólo borra los registros que coinciden con su email exacto. El flujo normal comprueba la eliminación; además, una fixture hace limpieza de respaldo en `finally`, incluso si un alta se guardó antes de fallar una aserción. La limpieza también tiene aserciones: no oculta una API caída. Los clientes de referencia de TP6 se conservan.

Se usa un worker, ejecución secuencial y un reintento por prueba. Los límites son 120 segundos por prueba, 15 para aserciones, 20 para acciones del navegador y 90 para navegación. Las peticiones de alta/listado tienen un máximo de 60 segundos. Los jobs de integración y E2E tienen 15 y 20 minutos respectivamente. Son esperas acotadas para el cold start; no garantizan superar una cuota agotada. Las suites no agregan sleeps arbitrarios: esperan elementos o resultados mediante Playwright.

Cada suite publica su HTML como artefacto propio, también cuando falla: `playwright-report-integracion` y `playwright-report-e2e`, con retención de 30 días. Los fallos conservan screenshot y traza. El resumen muestra aprobadas, fallidas, omitidas e inestables y falla si hay menos de tres aprobadas, alguna fallida, alguna omitida o un error global. Un test que falla y pasa al reintentar se informa como `flaky`; esta configuración permite ese verde, por lo que hay que revisar el reporte y diagnosticar la causa. Las corridas de recuperación documentadas tuvieron cero flaky.

### Orden del pipeline y aprobación

La cadena de `main` es `build-backend + build-frontend → deploy-qa → integracion → e2e → deploy-prod`. Integración necesita QA; E2E necesita integración; PROD necesita E2E. Si la API falla, no se gasta un navegador en comprobar un servicio ya roto. En los PR sólo corren los builds y unitarios: las cuatro etapas posteriores quedan salteadas porque QA requiere un push a `main`.

Los pasos de publicación de reportes usan `!cancelled()` para conservar evidencia tras un fallo. Esa condición no está en el job de producción ni hay `continue-on-error` que permita promover con pruebas fallidas. Después de los controles automáticos, el environment `production` conserva a `Santiago-Buffaz` como required reviewer, con autorrevisión permitida para el trabajo individual. Es entrega continua con aprobación humana.

QA es compartido. Se agregó concurrencia al workflow con grupo por PR o referencia y `cancel-in-progress: false`: las corridas de `main` se serializan incluyendo la espera de aprobación. Aun así, trabajo con un merge por vez. Esto no impide cambios manuales en Render ni garantiza conservar todas las corridas pendientes si se acumulan varias. Si un despliegue ajeno reemplaza QA, las pruebas podrían comprobar otra versión; contrasto los Events y las horas de ejecución, y rechazo una promoción desactualizada en lugar de volver a ejecutar sus pruebas contra el nuevo QA.

### Ensayo: integración verde y E2E rojo

El PR #27 cambió una sola línea de la aplicación: el botón pasó de `+ Nuevo cliente` a `+ Alta de cliente`. No cambió `e2e/`, el backend ni el workflow. Se alteró el nombre esperado del control; el botón podía seguir abriendo el formulario, pero ya no cumplía el contrato de interfaz que verificaban los recorridos. Los unitarios del TP5 no prueban ese TSX, por lo que siguieron verdes: su 100% de cobertura se refiere a sus archivos incluidos, no a toda la aplicación.

En la corrida #38, commit `b1bd4651506fd82d857959f67134cb8e2fdefbb8`, ambos builds y el smoke de QA pasaron. Integración aprobó sus tres pruebas en 4,6 segundos. Los tres E2E fallaron, también después de su único reintento; PROD quedó `skipped` sin pasos ejecutados ni solicitud de aprobación.

El diagnóstico se hizo con el reporte descargado: en `abrirAlta`, línea 9 de `clientes.spec.js`, apareció `TimeoutError: locator.click: Timeout 20000ms exceeded` esperando el botón con nombre exacto `+ Nuevo cliente`. La captura y el snapshot mostraron `+ Alta de cliente`. Se conservaron seis trazas, una por intento, y la captura del fallo. La integración verde confirmó que los recorridos de API y persistencia seguían funcionando; el fallo estaba en la interfaz que el usuario y el navegador encontraban. El smoke sólo había comprobado respuestas HTTP, no ese recorrido.

El PR #28 restauró el texto original sin adaptar los tests para aceptar la regresión. La corrida #40, commit `300a3070ba83f7b6dbd333c3235da25c9bec2caf`, aprobó integración (3, en 1,4 segundos) y E2E (3, en 15,4 segundos), con cero fallidas, omitidas o flaky. Después de la revisión de `production` por `Santiago-Buffaz`, `deploy-prod` terminó bien. Los logs de QA y PROD nombran las mismas dos imágenes con ese SHA. Esos tiempos son los de las suites, no incluyen instalación, despliegues ni la espera humana.

### Identidad del despliegue y release

El hook aceptado indica qué imagen se solicitó. El HTTP 200 del smoke indica disponibilidad de `/health`, consulta a `/api/clientes` y frontend; no identifica el commit que respondió. Puede responder la versión anterior mientras termina el despliegue. Por eso, antes de aprobar y antes de etiquetar, la comprobación operativa exige ambos servicios Live con la etiqueta de la corrida en Render y origen Deploy Hook. Los Events privados se muestran en vivo en la defensa.

El siguiente control automático, estudiado como concepto, sería hornear el commit dentro de cada imagen mediante `ARG` y `build-args`, exponerlo por un endpoint y compararlo desde el smoke contra el SHA de la corrida. No bastaría con cargar una variable externa que pudiera declarar una versión distinta a la de los binarios. Esta identificación desde afuera no está implementada en este TP; no presento el smoke actual como una prueba de identidad.

La release académica usa el tag Git `v7.0.0` sobre el commit efectivamente desplegado en PROD, comprobado después de la corrida del cierre documental. Se obtiene ese commit con `git rev-list -n1 v7.0.0`; se antepone `sha-` y se usa en los dos paquetes. La publicación de la release lleva `--verify-tag`, para exigir que el tag ya exista. Así se conecta nombre de versión → commit → dos imágenes. La documentación del cierre puede producir un SHA posterior al de la recuperación #40: no se etiqueta por costumbre el último commit sin verificar su despliegue.

### Problemas encontrados y uso de IA

Después del PR #25 repetí el bloque que creaba `tp7/imagenes`. Git informó que la rama ya existía y detuvo la cadena de comandos. El PR ya estaba mergeado; no hacía falta otro. La corrida esperaba la aprobación de producción, que completé después de revisar QA.

En la validación local de las suites faltaba la revisión de Chromium correspondiente a Playwright. Se instaló la versión requerida y la prueba local del navegador pasó. Ese fallo de preparación no se usó como evidencia de bloqueo: la evidencia oficial es el cambio real de la aplicación desplegada en QA y la corrida #38. También se distinguió la imagen inicial de Settings de la etiqueta activa del último despliegue, para no confundir la fuente configurada con la versión ejecutada.

Usé ChatGPT/Codex para interpretar la consigna, preparar el cambio de hooks, las suites, el helper por etapas y esta documentación. Codex realizó verificaciones en copias aisladas y consultas de lectura a Actions, descargó reportes y examinó la captura del fallo. Yo ejecuté en el repositorio las ramas, commits, pushes, PRs y merges, configuré Render y aprobé las promociones. El código no fue escrito íntegramente a mano por mí; la evidencia son las ejecuciones y sus artefactos, no la afirmación de la IA. El cierre se completa con el tag y la release verificados sobre PROD.
<!-- TP7:DECISIONES:FIN -->

<!-- TP8:DECISIONES:INICIO -->
## TP8 — Preproducción con infraestructura como código

Elegí Terraform con `kislerdm/neon` **0.18.0** y `render-oss/render` **1.9.1**, fijados en `infra/versions.tf` y con `.terraform.lock.hcl` versionado. Lo ejecuté con Terraform **1.15.8**. Declaro cinco recursos: proyecto Neon exclusivo, rol, base `app_preprod`, API y frontend gratuitos en Render. Ambos componentes usan las imágenes del TP7 con etiqueta `sha-87aceb673cc160a9cd28e64355020e4139fc8e82`; la conexión a PostgreSQL y `BACKEND_URL` se derivan de referencias entre recursos. Las API keys se cargan en el entorno, y el estado local, sus backups y los tfvars quedan fuera de Git. QA y producción no se importan ni forman parte de esta configuración.

Comprobé el alta del entorno, un segundo plan sin cambios, `/health`, la consulta `/api/clientes` y el frontend conectado a su API. Probé crear, recargar y eliminar un cliente ficticio; borré manualmente `app_preprod` y Terraform la recreó. Vi la contraseña en el estado y comprobé que una `base_intrusa` creada manualmente no cambiaba el plan; luego la eliminé. También recreé el entorno completo, comprobé nuevamente las respuestas y ensayé el rechazo de un plan de destrucción con `prevent_destroy`; retiré esa protección temporal. Al terminar destruí los cinco recursos y `terraform state list` quedó vacío. La recreación conserva la configuración, no los datos anteriores. Los endpoints de QA y producción siguieron respondiendo durante la comprobación posterior a la recreación.

El problema encontrado fue la detección del workspace de Render: el Python 3.13 de mi Mac rechazaba su certificado HTTPS. El helper se corrigió para consultar la API con `curl`, conservando la verificación TLS y sin guardar la clave en archivos. La consigna advierte además un defecto del provider Render 1.9.1 al actualizar servicios gratuitos con `maintenance_mode`: no lo sufrí en este ejercicio, porque usé creación y destrucción. No implementé el workflow opcional de plan por PR. El cierre usa los checks normales del PR y un squash con `[skip ci]` únicamente en el mensaje final de integración, una vez aprobados esos checks, para evitar que el push documental/de infraestructura vuelva a desplegar QA y producción con el pipeline existente.

Usé ChatGPT/Codex para interpretar la consigna, preparar el HCL, los helpers y esta documentación. Codex validó los archivos en copias aisladas e hizo consultas de lectura; yo ejecuté los planes, aplicaciones, ensayos y destrucciones en mis cuentas. La verificación se basó en las salidas de Terraform y el funcionamiento real del entorno. Para la defensa mantengo preprod destruido y lo creo, compruebo y destruyo en vivo desde `infra/`.
<!-- TP8:DECISIONES:FIN -->
