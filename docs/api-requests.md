# Peticiones al backend (`docs/api-requests.md`)

Lo que la app necesita y el contrato (`docs/api/openapi.yaml`) no cubre todavía. No se inventan
endpoints: cada punto indica qué hace la app mientras tanto.

## APP-2 · Unirse y autenticación

| # | Falta | Qué hace la app mientras tanto |
|---|---|---|
| 1 | **Contrato en OpenAPI 3.0.0 con sintaxis 3.1.** `PersonalDataExportResponseDto.profile.phone`, `CenterSearchResponseDtoCentersItem.city` y `.distanceInKilometers` declaran `type: [string, "null"]` bajo `openapi: 3.0.0`; Orval 8 rechaza el yaml. | La copia local `docs/api/openapi.yaml` cambia esos tres a `type: X` + `nullable: true` (equivalente en 3.0). Conviene arreglarlo en el generador del backend para no repetirlo en cada copia. |
| 2 | **`PublicCenterResponseDto.city` es `string[]`** en el contrato (la búsqueda lo declara como `string \| null`). | `formatCenterCity` acepta texto o lista. |
| 3 | **Datos del centro para «¿Es este tu centro?» (`jconfirm`)**: dirección, horario, número de servicios y de profesionales. `GET /v1/centers/{id}/branding` solo da nombre, sector y color. | La confirmación muestra nombre, avatar con iniciales y la nota de privacidad; sin dirección, horario ni resumen de servicios. |
| 4 | **Logo del centro** (URL) en `branding`, `join/code`, `join/search` y `me/memberships`. | `Avatar` con las iniciales del centro. |
| 5 | **Experiencia y objetivos del alta (`reg2`)** y **teléfono (`reg1`)**: `POST /v1/auth/register` solo admite nombre, correo, contraseña y consentimientos. `PATCH /v1/me` admite `phone` pero no experiencia ni objetivos, ni existe «nivel inicial». | `reg2` recoge experiencia y objetivos y calcula el nivel inicial para mostrarlo, pero **no se envían**. `reg1` no pide teléfono ni foto (foto: APP-8). |
| 6 | **Unirse sin sesión**: `POST /v1/join/{centerId}` exige sesión, así que el centro elegido se guarda en memoria y se une justo después de iniciar sesión. Un alta nueva debe verificar el correo y volver a entrar para unirse. | Flujo descrito: elegir centro → crear cuenta → verificar correo → iniciar sesión → unirse. Si el servidor rechaza (privado sin código, bloqueado, límite), se muestra el centro que sí tenga o «Unirse». |
| 7 | **Inicio de sesión con Apple y Google** (decisión pendiente) y **QR de centro (`jqr`)**. | Fuera de este ticket: ni botones ni rutas. |
| 8 | **Búsqueda por cercanía** (`lat`/`lng`): la app aún no pide el permiso de ubicación (`expo-location` no está en el proyecto). | La búsqueda es solo por texto. |
| 9 | **Deep links** `https://yoclick.app/j/{code}` e `/i/{token}`. | Sin implementar en este ticket. |

## APP-9 · Alta de centro desde la app

| # | Falta | Qué hace la app mientras tanto |
|---|---|---|
| 1 | ~~**Logo del centro**~~ Resuelto (5 oct 2026): `PUT /v1/onboarding/centers/{id}/logo` (propietario, sin MFA) y `GET /v1/centers/{id}/logo` público; `logoUrl` (ruta relativa) en branding, join, búsqueda, mis centros e invitación. Pendiente: extraer el color del logo (`o2`) y cambiarlo desde el panel de administración (ruta con MFA). | El alta sube el logo en la pantalla `/(onboarding)/logo`; el color se sigue eligiendo de una paleta. |
| 2 | **Servicios, horario, equipo y plan del alta** (`o3`, `osvc`, `o4`, `o5`): los servicios son API-3. | El alta se reduce a datos y marca; la prueba de 14 días empieza al crear el centro. |
| 3 | **Segundo factor del dueño**: las rutas de administración exigen sesión con MFA (`MFA_REQUIRED`), pero la app aún no tiene pantalla para activar TOTP (`/v1/me/mfa/totp/setup` y `/confirm`). | Se puede crear el centro; el panel de administración queda a la espera de esa pantalla. |

## Inicio del alumno (`home`) y administración

| # | Falta | Qué hace la app mientras tanto |
|---|---|---|
| 1 | **Bonos del alumno** («Bono 10 clases · te quedan 6», caducidad). | La tarjeta de bono muestra «Sin bono activo». |
| 2 | ~~**QR de acceso del alumno**~~ Resuelto (5 oct 2026): `POST /v1/centers/{id}/me/checkin-code` (JWT firmado de 5 min en `yoclick:checkin:<jwt>`) y `POST /v1/centers/{id}/attendance/check-in`. Pendiente: mostrar la llegada en la agenda (`checkedInAt` no está en la reserva) y la vista de privacidad en el app switcher (SEC-M6). | «Mi QR de acceso» muestra el QR firmado y se renueva solo; instructores y administración escanean desde la agenda. |
| 3 | **Objetivo semanal por alumno o centro**. | Objetivo fijo de 4 sesiones; el progreso cuenta las citas con asistencia de la semana. |
| 4 | **Zona horaria del centro en reservas** y **horas ocupadas** en la disponibilidad (el prototipo las tacha). | Se usa `Europe/Madrid` y solo se listan huecos libres. |
| 5 | **Datos fiscales y contacto del centro** (teléfono, correo, razón social, CIF) para `acenter`. | Pantalla «Datos del centro» no construida. |
| 6 | **Pasar una clase sin cerrar a cerrada** desde administración. | El registro la muestra como «Sin cerrar». |
| 7 | **Reprogramar una cita** (`appts`, botón «Reprogramar»): no hay endpoint para mover una reserva a otro hueco de forma atómica (cancelar y crear dos veces dejaría al alumno sin cita si falla el segundo paso). Tampoco se guarda la hora anterior («Antes: 10:00»). | La tarjeta de cita no muestra «Reprogramar» ni «Antes». |
| 8 | **Añadir la cita al calendario** (`appts`, enlace «Al calendario»): hace falta `expo-calendar` o `expo-sharing` con un `.ics` (dependencia nueva, pendiente de aprobar). | La tarjeta de cita no muestra «Al calendario». |

## Agenda del centro (`aagenda`)

| # | Falta | Qué hace la app mientras tanto |
|---|---|---|
| 1 | ~~**Ocupación del día**~~ Resuelto (6 oct 2026): `GET /v1/centers/{id}/agenda/summary?date=` (propietario y administración, con MFA) devuelve `occupancyPercent` (tiempo reservado sobre el tiempo abierto del equipo que atiende servicios; `null` si el centro cierra). | La tarjeta «Ocupación» muestra la cifra y la barra; un guion si es `null` o falla. |
| 2 | ~~**Altas de la semana y clientes activos**~~ Resuelto (6 oct 2026) en el mismo endpoint (`newClientsThisWeek`, `activeClientCount`). Sigue pendiente un listado de clientes (`aclients`). | La tarjeta «Altas semana» muestra las altas y los clientes activos. |
| 3 | **Citas reubicadas** («1 reubicada» bajo Cancelaciones): depende de Reprogramar (ver «Inicio del alumno» fila 7). | «Cancelaciones» solo muestra el recuento. |
| 4 | **Huecos libres por profesional** (las casillas «Libre» de cada columna): la agenda solo devuelve citas. | Las columnas muestran solo las citas reservadas. |
| 5 | **Avisos del centro** (campana con contador). | Sin campana hasta que exista la pantalla de avisos. |
| 6 | **Selector de fecha** («Hoy ▾»): lo resuelve la app. | Flechas de día anterior y siguiente junto al título. |

## Tu marca (`abrand`)

| # | Falta | Qué hace la app mientras tanto |
|---|---|---|
| 1 | ~~**Versión para `If-Match`**~~ Resuelto (6 oct 2026): `GET`/`PATCH /v1/centers/{id}` devuelven `version` (el mismo valor que `ETag`) porque el cliente solo lee el cuerpo. | «Publicar cambios» envía `If-Match: <version>`; un 412 muestra el error y se puede recargar. |
| 2 | **Extraer el color del logo** («Extraer color del logo», `o2` y `abrand`): hace falta leer los píxeles de la imagen, en el móvil (dependencia nueva para decodificar PNG) o en el servidor. | El botón no se muestra; el color se elige de la paleta, el selector o escribiendo el hexadecimal. |
| 3 | **Cambiar el logo con 2FA**: la subida usa la ruta del alta (`PUT /v1/onboarding/centers/{id}/logo`, solo propietario, sin MFA). | «Subir» sustituye el logo al pulsar «Publicar cambios». Administradores que no son propietarios no pueden subirlo. |

## Servicios y horario (`asvc`)

| # | Falta | Qué hace la app mientras tanto |
|---|---|---|
| 1 | ~~**Salas y recursos**~~ Resuelto (6 oct 2026): `GET/POST /v1/centers/{id}/rooms`, `DELETE /v1/centers/{id}/rooms/{roomId}` (se archiva) y `roomId`/`room` en los servicios. Migración `20261008090000_add_rooms`. | «Salas y recursos» lista, añade (nombre y aforo) y quita; el editor de servicio elige sala. |
| 2 | **Aviso de conflicto de sala** («Conflicto de sala» del prototipo): los servicios no tienen horario fijo ni periodo, las citas se reservan por huecos, así que no hay solapes de sala que detectar todavía. | La sala se guarda pero no bloquea ni avisa. |
| 3 | **Cierres y festivos** del horario (`acenter`): el servidor ya los guarda (`holidays`) pero la app aún no tiene pantalla. | «Editar» horario cambia solo los tramos semanales. |
| 4 | **Disponibilidad y ausencias del equipo** (`iavail`, `ateam`): no hay horario propio por persona ni vacaciones. | La disponibilidad sale del horario del centro. |
| 5 | **Permisos finos por rol** (`ateam`: qué ve cada rol): la app solo cambia el rol (administración / equipo) y el cargo. | «Quitar del equipo» marca a la persona como «ya no está». |
