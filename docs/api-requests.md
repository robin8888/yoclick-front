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
| 4 | ~~**Disponibilidad y ausencias del equipo**~~ Resuelto (7 oct 2026): `GET`/`PUT /v1/centers/{id}/team/{membershipId}/availability` (horario semanal propio; `null` vuelve al del centro) y `POST`/`DELETE …/absences` (días de ausencia con motivo; la respuesta cuenta las citas que ya había). Los huecos y las reservas respetan ambas cosas. Migración `20261011090000_add_staff_availability`. | «Disponibilidad» en el perfil de cada profesional y en la ficha del equipo para la administración. |
| 4b | **Reasignar o avisar de las citas que ya había** en una ausencia: la API solo las cuenta y siguen en la agenda. No se avisa a nadie por correo ni push. | Aviso en pantalla con el número de citas afectadas. |
| 4c | **Horario del centro como punto de partida** para el personal: no puede leer los ajustes del centro, así que al crear su horario propio parte de una jornada de lunes a viernes de 9:00 a 17:00. | Se ajusta antes de guardar. |
| 5 | **Permisos finos por rol** (`ateam`: qué ve cada rol): la app solo cambia el rol (administración / equipo) y el cargo. | «Quitar del equipo» marca a la persona como «ya no está». |

## Alumnos y grupos (`aclients`)

| # | Falta | Qué hace la app mientras tanto |
|---|---|---|
| 1 | ~~**Listado de clientes**~~ Resuelto (6 oct 2026): `GET /v1/centers/{id}/clients` (búsqueda por nombre o correo, filtro por estado `active`, `new`, `inactive` o `blocked`, `groupId`, paginación), `GET` y `PATCH /v1/centers/{id}/clients/{membershipId}`. El estado se calcula: nuevo (primera semana), activo (cita en 30 días o futura), inactivo. | «Alumnos (n)» con buscador, filtros y «Ver más». |
| 2 | ~~**Niveles y grupos**~~ Resuelto: nivel por cliente (`beginner`, `intermediate`, `advanced`, con el vocabulario del sector) y grupos (`GET`, `POST`, `DELETE /v1/centers/{id}/groups`; un cliente en un solo grupo). Migración `20261009090000_add_client_groups`. | «Grupos (n)», «Crear grupo», ficha del grupo y ficha del cliente para cambiar nivel y grupo. |
| 3 | **Bono agotado** (estado del prototipo): no hay bonos del alumno todavía (ver «Inicio del alumno» fila 1). | El estado «Bono agotado» no se muestra. |
| 4 | **Ficha completa del cliente** (`acfile`): asistencia, historial, notas privadas, pagos y acciones RGPD. | La ficha solo edita nivel y grupo. |
| 5 | **Añadir varias personas a un grupo a la vez** y **quién da cada grupo al reservar**. | Se asigna desde la ficha de cada persona. |

## Importar clientes (`aimport`)

| # | Falta | Qué hace la app mientras tanto |
|---|---|---|
| 1 | ~~**Importar desde un archivo**~~ Resuelto (7 oct 2026): `POST /v1/centers/{id}/clients/import` (hasta 500 filas con nombre, correo, teléfono y nivel). Quien no tiene cuenta recibe una **sin activar** (sin contraseña utilizable ni correo verificado); a quien ya es cliente se le actualiza el nivel; devuelve cuántos se crearon, cuántos se actualizaron y las filas que se quedaron fuera con su motivo. No envía ningún correo. | Elegir CSV, asignar columnas, revisar y ver el informe. Un archivo de más de 500 filas se envía en varias tandas. |
| 2 | **Invitar a la app por correo** al importar (interruptor del prototipo): sigue sin enviarse ningún correo. **Reclamar la cuenta** ya funciona (7 oct 2026): quien fue importado entra con «¿Olvidaste tu contraseña?», recibe el código en su correo y fija su contraseña (eso también confirma el correo). Falta el aviso por correo que les diga que su centro les ha dado de alta. | El interruptor no se muestra: «No se avisa a nadie hasta que tú lo decidas». El centro debe decirles que entren con «¿Olvidaste tu contraseña?». |
| 3 | **Importar el saldo de bonos** («Sesiones restantes del bono»): no hay bonos todavía (ver «Alumnos y grupos» fila 3). | La columna no se ofrece. |
| 4 | **Filas sin correo**: una membresía necesita una cuenta y la cuenta, un correo; el prototipo las importaba igualmente. | Se cuentan como «sin correo válido» y no se importan. |
| 5 | **Leer Excel** (`.xlsx`): el prototipo lo acepta; la app solo lee CSV (separado por comas, punto y coma o tabulador). | El texto dice «guarda la hoja como CSV». |

## Informes (`areports`)

| # | Falta | Qué hace la app mientras tanto |
|---|---|---|
| 1 | ~~**Informes del centro**~~ Resuelto (7 oct 2026): `GET /v1/centers/{id}/reports?period=week\|month\|quarter` (últimos 7, 30 o 90 días contando hoy, con el periodo anterior para comparar). Devuelve ingresos estimados, ocupación media, retención a 3 meses, clientes activos e inactivos, ingresos de los últimos 6 meses, ocupación por servicio, citas y horas por profesional, y retención por mes de alta. | Pantalla con selector de periodo, cifras, gráfico de ingresos, barras por servicio, tabla por profesional y retención. |
| 2 | **Ingresos reales**: no hay cobros, bonos ni cuotas, así que los «ingresos» son una **estimación** (precio del servicio por cada cita a la que vino la persona o que ya pasó confirmada). | Se dice en pantalla: «Es una estimación… Todavía no son cobros». |
| 3 | **Ingresos por tipo** (cuotas, bonos, sesiones sueltas, matrículas) y **valoración media** por profesional: dependen de pagos y de valoraciones, que no existen. | No se muestran. |
| 4 | **Ocupación por servicio**: es el tiempo reservado sobre el tiempo abierto de quienes lo dan (los servicios no tienen aforo ni horario fijo). | Barras de 0 a 100 %. |
| 5 | **Campañas para inactivos** (`acamp`): el aviso «14 sin venir en 30 días» no abre ninguna campaña todavía. | Solo informa. |
| 6 | **Exportar CSV**: se comparte el texto desde el menú del sistema; no se genera un archivo descargable. | Botón «CSV» del informe por profesional. |

## Mi suscripción (`asubs`, `aplans`)

| # | Falta | Qué hace la app mientras tanto |
|---|---|---|
| 1 | ~~**Estado del plan**~~ Resuelto (7 oct 2026): `GET /v1/centers/{id}/subscription` (estado, fin de la prueba, tope de clientes y clientes activos). | «Mi suscripción» con plan, estado, prueba y uso del tope. |
| 2 | **Nombre del plan**: no hay tabla `plans`; la app lo deduce del tope (150 Básico, 500 Pro, sin tope Premium). Cuando exista `plans`, el endpoint debería devolver `planId`. | Cualquier otro tope se muestra como «A medida». |
| 3 | **Próximo cobro, método de pago, facturas y cambio de plan** (`asubs`, `aplans`): la suscripción se cobra en la web con Stripe Billing (decisión del 5 oct 2026) y los importes siguen pendientes ([PRECIO]). | No se muestran; una nota explica que se gestiona en la web. |

## Permisos finos por rol (`ateam`)

| # | Falta | Qué hace la app mientras tanto |
|---|---|---|
| 1 | **Que los permisos extra tengan efecto**: la API guarda `permissions` (`health:read`, `clients:manage`, `services:manage`, `agenda:manage`, `payments:view`, `reports:view`) y acepta cambiarlos, pero ninguna ruta los comprueba: solo mandan los roles. Hace falta decidir qué ruta exige cada permiso y añadir un guard antes de ofrecer interruptores en la app (si no, parecerían conceder algo que no concede). | La ficha del equipo cambia solo el rol (administración o quien da las sesiones) y el cargo. |

## Avisos push (todo aviso a clientes, equipo y administración va por push)

| # | Falta | Qué hace la app mientras tanto |
|---|---|---|
| 1 | ~~**Avisos push**~~ Resuelto (7 oct 2026): `PUT /v1/me/push-token` y `POST /v1/me/push-token/unregister` registran y dan de baja el móvil; la API envía los avisos por el servicio de Expo **después** de confirmar la acción (nunca la rompe y reintenta si falla). El texto del push es genérico (sin nombres, horas ni servicios): el detalle solo se ve dentro de la app. Migración `20261013090000_add_push_devices`. | La app pide el permiso con una tarjeta que explica para qué sirve, registra el móvil, lo da de baja al cerrar sesión y abre los avisos al tocar uno. |
| 2 | ~~**Quién recibe qué**~~ Resuelto: el cliente que reserva o cancela avisa a la persona que da la cita y a la administración; si el cambio lo hace el centro o el instructor (`POST /v1/centers/{id}/agenda/bookings/{bookingId}/cancel`, nuevo; o poner una cita desde la agenda), se avisa al cliente; una ausencia avisa a la administración, a la persona ausente (si no la anotó ella) y a cada cliente con una cita esos días. Quien hace el cambio no recibe el aviso. | Los avisos también se ven en la campana (nueva para el cliente). |
| 3 | **Cambiar la hora de una cita** (reprogramar) por parte del centro, el instructor o el cliente: no hay endpoint; hoy se cancela y se vuelve a reservar, con sus dos avisos. | Cancelar desde la agenda y poner la cita de nuevo. |
| 4 | **Credenciales de los avisos**: iOS necesita la clave de push de Apple (EAS la crea al compilar con `eas credentials`) y Android la configuración de Firebase (FCM). En producción `PUSH_PROVIDER=expo` es obligatorio; en desarrollo `console` no entrega nada. | Sin esas credenciales no llegan avisos al móvil, pero se ven dentro de la app. |
| 5 | **Aviso al importar clientes** y **correos**: lo que sea de avisar a clientes, equipo o administración va por push; el correo queda solo para cuenta (verificación, recuperación). | — |

## Rutinas, prácticas, secuencias y tareas (`aroutines`)

| # | Falta | Qué hace la app mientras tanto |
|---|---|---|
| 1 | ~~**Rutinas**~~ Resuelto (7 oct 2026): `GET /v1/centers/{id}/exercise-library` (ejercicios del tipo de centro, sacados del prototipo), `GET`/`POST /v1/centers/{id}/routines`, `GET`/`DELETE …/routines/{routineId}` (se archiva), `POST …/routines/{routineId}/assignments`, `DELETE …/assignments/{assignmentId}` y `GET /v1/centers/{id}/my-routines` para el cliente. Se asigna a una persona o a un grupo y quien la recibe lo sabe por push. Migraciones `20261012090000_add_routines` y `20261014090000_add_routine_assigned_notification`. | Administración y equipo (desde su perfil) crean desde la biblioteca o con ejercicios propios y asignan; el cliente lo ve en su pestaña de práctica. La palabra cambia por sector (rutina, práctica, secuencia, tarea, plan). |
| 2 | ~~**Vídeo de apoyo por ejercicio**~~ Resuelto (7 oct 2026), ver «Vídeos» más abajo. **Contenidos** (`acontent`, `media`: biblioteca de vídeos y PDF por nivel y necesidad) siguen sin construir. | Los ejercicios pueden llevar un vídeo si el plan del centro lo incluye. |
| 3 | **Marcar un ejercicio como hecho / progreso** del cliente y **«Practicar» con detalle de ejercicio**: no hay modelo de seguimiento. | El cliente solo consulta lo asignado. |
| 4 | **Editar una rutina** ya creada: solo se crea, se asigna y se archiva. | Archivar y crear otra. |
| 5 | **Ejercicios propios reutilizables**: los que escribe el centro viven solo en esa rutina. | Se vuelven a escribir. |

## Vídeos (plan Premium): ejercicios de rutinas y presentación del equipo

| # | Falta | Qué hace la app mientras tanto |
|---|---|---|
| 1 | ~~**Alojamiento de vídeo**~~ Resuelto (7 oct 2026) con **Bunny Stream** (`VIDEO_PROVIDER=bunny`; `fake` en desarrollo no llama a nadie). `POST /v1/centers/{id}/videos` reserva el vídeo y devuelve la **firma de subida** (TUS): el móvil sube **directamente** a Bunny, sin pasar por la API. `GET …/videos/{videoId}` consulta el estado (subiendo, procesando, listo, fallido) y, al estar listo, da los **enlaces de reproducción firmados que caducan**; `DELETE` lo borra. Migración `20261015090000_add_videos`. | La app elige el vídeo de la galería (máx. 500 MB), lo sube a trozos con reintentos, espera al procesado y lo reproduce con `expo-video` (streaming adaptativo). |
| 2 | ~~**Solo planes que lo incluyen**~~ Resuelto: `centers.video_storage_limit_bytes` (nulo = el plan no incluye vídeo) y el servidor rechaza con `VIDEO_NOT_INCLUDED` / `VIDEO_QUOTA_EXCEEDED`. `GET …/video-plan` lo dice al equipo y `GET …/subscription` al propietario (límite y usado). **Pendiente**: que la facturación web (Stripe Billing) ponga ese campo al contratar Premium; hoy se cambia a mano en la base de datos. | La app oculta los botones de vídeo si el plan no lo incluye y la pantalla del perfil lo explica. |
| 3 | ~~**Vídeo de presentación del equipo con revisión**~~ Sustituido (8 oct 2026) por la revisión del **perfil entero**, ver «Perfil público del equipo». Los vídeos de presentación y de técnica se suben con `POST …/videos` (propósitos `profile` y `technique`, hasta tres de técnica: 409 `TECHNIQUE_VIDEO_LIMIT_REACHED`). | — |
| 4 | ~~**Perfil público completo**~~ Resuelto, ver «Perfil público del equipo». | — |
| 5 | **Contenidos** (`acontent`, `media`): subir vídeos y PDF y asignarlos por nivel, grupo o cliente; visor de PDF. | No existe. |
| 6 | **Aviso de enlaces de reproducción caducados**: los enlaces duran 4 h; si una pantalla se queda abierta más tiempo hay que recargarla. | Al abrir la pantalla se piden enlaces nuevos. |
| 7 | **Comprobar las claves reales de Bunny**: `npm run videos:check` en el back crea un vídeo vacío, firma una subida y un enlace, comprueba que el CDN acepta la firma y lo borra. La firma de reproducción (token de directorio del CDN) se ha escrito según la documentación de Bunny y **hay que verificarla con la cuenta real** antes de publicar. | — |

## Derechos RGPD (`alegal`, `privacy`, `delacct`)

| # | Falta | Qué hace la app mientras tanto |
|---|---|---|
| 1 | ~~**Solicitudes de derechos al centro**~~ Resuelto (8 oct 2026): `POST /v1/centers/{id}/privacy-requests` (cliente: acceso, rectificación, supresión u oposición; una abierta por derecho), `GET …/privacy-requests/mine`, `GET …/privacy-requests` (administración: las abiertas primero, la que vence antes arriba) y `POST …/privacy-requests/{id}/resolve` (atendida, o rechazada con motivo). Plazo: **un mes** desde que se recibe (`dueAt`). No se borran (constancia). Migración `20261016090000_add_privacy_requests`. Avisos push a la administración al recibirla y a la persona al resolverla. | El cliente las pide desde «Privacidad y datos» y ve su estado y plazo; la administración las responde desde «Privacidad y legal» (con aviso «Fuera de plazo»). |
| 2 | ~~**Responder a un derecho de acceso**~~ Resuelto: `POST …/clients/{membershipId}/data-export` (administración, pide su contraseña, queda en el registro de actividad) devuelve todo lo que el centro guarda de la persona. | «Exportar sus datos» en la ficha del cliente, por el menú de compartir. |
| 3 | **Ejecutar una supresión pedida al centro**: resolver la solicitud solo la marca; borrar los datos de la persona en ese centro (o dar de baja) sigue siendo manual. La persona sí puede **eliminar su cuenta entera** desde la app (ya existía en la API). | El centro marca la solicitud como atendida tras hacerlo a mano. |
| 4 | **Rutas**: la spec dice `/settings/privacy` y `/settings/delete-account`; se han puesto en `(client)/privacy` y `(client)/delete-account` para heredar la guarda de sesión y la barra. | — |
| 5 | **Textos legales** (contrato de encargado, política de privacidad del centro, registro de actividades): siguen pendientes del asesor; el copy de la pantalla de borrado y de derechos es provisional y debe revisarse con él. | No se muestran. |
| 6 | **Dueños de centro**: `DELETE /me` rechaza con `ACCOUNT_OWNS_CENTER` si la persona es propietaria de un centro; la app lo explica. No hay flujo para traspasar o cerrar el centro. | Mensaje de error. |

## Perfil público del equipo (`iprof`, `team`, `tprof`, `aprofiles`)

| # | Falta | Qué hace la app mientras tanto |
|---|---|---|
| 1 | ~~**Perfil profesional con revisión**~~ Resuelto (8 oct 2026): `GET /v1/centers/{id}/team-profiles` (la clientela solo ve los **publicados**; el equipo, los publicados y el suyo; la administración, todos), `GET …/team-profiles/{membershipId}`, `PUT …/team-profiles/me` (titular, biografía, especialidades, idiomas y la **autorización para publicar la imagen y los vídeos**: sin ella no se envía), `POST …/team-profiles/me/submit` (el equipo queda `pending` y la administración lo sabe por push; propietario y administración publican directamente), `POST …/team-profiles/{membershipId}/review` (aprobar o pedir cambios con nota; la persona lo sabe por push). Migraciones `20261017090000_add_staff_profiles` y `20261017100000_add_staff_review_booking_link`. | «Mi perfil profesional» (equipo y administración), «Perfiles del equipo» (revisión) y «Nuestro equipo» con el perfil de cada persona (clientela). |
| 2 | **Editar un perfil publicado lo oculta** hasta que se vuelva a enviar y aprobar (cualquier cambio lo devuelve a borrador). Es lo del prototipo, pero un retoque pequeño quita el perfil de la vista unos días. Mejora posible: guardar una copia de lo publicado y enseñarla mientras se revisa lo nuevo. | La pantalla lo avisa antes de editar. |
| 3 | ~~**Titulaciones**~~ Resuelto: `POST …/team-profiles/me/certifications` (hasta 10), `DELETE …/me/certifications/{id}` y `POST …/team-profiles/{membershipId}/certifications/{id}/verify` (administración). **Pendiente**: adjuntar el certificado (PDF o foto) para que lo vea solo la dirección; necesita almacenamiento de ficheros. | Se escribe nombre y «centro y año»; el centro marca «verificada». |
| 4 | ~~**Opiniones verificadas**~~ Resuelto: `POST …/team-profiles/{membershipId}/reviews` (cliente, de 1 a 5; **solo si tuvo una sesión con esa persona** —llegada escaneada o clase terminada— y **una por sesión**: 409 `REVIEW_NOT_ALLOWED`), `GET …/reviews` (publicadas, con «Nombre I.»), `GET …/staff-reviews/pending` y `POST …/staff-reviews/{id}/moderate` (administración). Con «revisar opiniones» activado quedan pendientes; al publicarse la persona del equipo lo sabe por push. No se borran, se rechazan. | «Valorar» en el perfil, y la media y la lista de opiniones; moderación en «Perfiles del equipo». |
| 5 | ~~**Ajustes del equipo**~~ Resuelto: `GET`/`PUT …/team-settings` (`showTeamOnWeb`, `reviewsNeedApproval`). **Pendiente**: la web de reservas que usaría `showTeamOnWeb`. | Los interruptores se guardan. |
| 6 | **Foto de perfil** de la persona del equipo (prototipo `photoPicker`): no hay almacenamiento de imágenes de personas. | Se muestran las iniciales. |
| 7 | **«Reservar con…»**: el perfil lleva a elegir servicio y, desde ahí, directo a los huecos de esa persona (parámetro `staffMembershipId`). Si el servicio elegido no lo da esa persona, no habrá huecos. | Hay que elegir un servicio que ofrezca esa persona. |
| 8 | **Idiomas y especialidades** son textos libres (máx. 8 de 40 letras); las especialidades que se ofrecen salen de una lista por tipo de centro en la app, no del servidor. | — |
