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
