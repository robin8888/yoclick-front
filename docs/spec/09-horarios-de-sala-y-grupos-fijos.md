# 09 · Horarios de sala, grupos fijos y reserva del alumno

Estado: **diseño acordado el 12 oct 2026; fase 1 construida en back y app el 12 oct 2026 (sin commit, pendiente de probar en el móvil)**. Generaliza `08-salas-y-citas-grupales.md` para que el mismo sistema sirva a gimnasios, escuelas de baile, academias de idiomas, cocina, música, universidades y, en general, cualquier centro que tenga **espacios con aforo**. Sustituye las fases B y C de `07-citas-recurrentes.md` (la fase A, «quién asignó», ya está construida).

## Vocabulario

| Término | Qué es |
|---|---|
| **Espacio** | Sala, aula, pista, box… (el nombre lo pone el vocabulario del sector; en el modelo sigue siendo `rooms`). Tiene aforo y, opcionalmente, un profesor fijo y un servicio fijo. |
| **Servicio** | Lo que el centro imparte o presta (Salsa, Inglés B1, Spinning, Entrenamiento personal). Decide si se da en privado, en grupo o de las dos formas. |
| **Sesión** | Un espacio, una hora de inicio y fin, un servicio, un profesor y un modo (`private` / `group`). Es la unidad que tiene plazas (`class_sessions`, ya existe). |
| **Horario** (nuevo) | Plantilla semanal de sesiones: «Aula 2 · lunes 18:00–19:30 · Inglés B1 · Ana · grupal». El servidor crea las sesiones reales a partir de ella. |
| **Grupo fijo** (nuevo) | Los alumnos matriculados en un horario durante un periodo (curso, trimestre). Tienen plaza en todas sus sesiones sin reservar nada. |
| **Bloqueo** (nuevo) | Tramo en que un espacio no está disponible: alquiler a terceros, mantenimiento, evento. |
| **Cita** | La plaza de una persona en una sesión (`bookings`, ya existe). |

## Lo que ya existe y se conserva

- Espacios con aforo y profesor fijo opcional; servicios de un espacio; profesores por servicio.
- Sesiones privadas (1 plaza, ocupan el espacio) y grupales (aforo del espacio); `join-group`.
- Exclusiones de base de datos: un profesor no está en dos sesiones a la vez; un espacio no tiene dos sesiones a la vez. Comprobación de solapes por alumno. Aforo bajo bloqueo de la sesión → `409 SESSION_FULL`.
- `bookings.created_by_*`: quién asignó cada cita. Solo el centro (`owner | admin`) asigna citas desde la agenda.
- Check-in por QR, registro de clase, política de cancelación por centro y por servicio (`cancel_policy`, `cancel_notice_minutes`), bonos.

## Decisiones

| Tema | Decisión |
|---|---|
| Sectores | La pestaña **Gestión** (espacios, horarios, bloqueos) la tienen **todos** los sectores. Los espacios son opcionales: un centro sin espacios funciona como hasta ahora (cita 1:1 con el profesional). |
| Modo del servicio | `services.mode`: **`private` / `group` / `both`**. Lo fija el centro; el alumno no elige el modo. Sustituye al uso de `services.capacity` (que pasa a ser el tope por sesión cuando es menor que el aforo del espacio). |
| Quién es el profesor | Por **sesión** (como hoy). En el horario se indica; si no, el del espacio; si tampoco, obligatorio elegirlo. |
| Cómo nacen las sesiones | (a) Desde el **horario**, materializadas **8 semanas por delante** por un proceso diario y al crear/editar el horario. (b) **Al vuelo**, cuando el centro asigna una cita o un alumno reserva en un hueco libre (lo que hay hoy). |
| Reserva del alumno | **Directa**: apuntarse a una sesión con plazas confirma al instante. «Requiere aprobación» queda como ajuste por centro para más adelante. |
| Elección de espacio al reservar el alumno | El alumno **no elige espacio**. Grupal: si hay varias sesiones del mismo servicio a la misma hora con plazas, se le mete en la **más llena** (completa grupos). Privada: primer espacio libre utilizable por el profesor, con preferencia por el espacio fijo del servicio. |
| Anular el alumno | Desde su cita, respetando la antelación del servicio o del centro. Fuera de plazo solo anula el centro (o se consume el crédito según la política, como hoy). |
| Última plaza | Gana la petición que **el servidor procesa primero**; la otra recibe `409 SESSION_FULL` y la app ofrece alternativas. No hay lista de espera en fase 1. |
| Grupos fijos y bonos | La matrícula **no descuenta bono**: `bookings.source = enrollment`. Los sueltos descuentan como siempre. |
| Alquiler | Solo **bloquea** el espacio y guarda motivo y nota. Precio y facturación fuera de la app por ahora. |

## Modelo

### `services`

- `mode session_mode_offer NOT NULL DEFAULT 'private'` — enum nuevo `service_mode` (`private | group | both`). Migración: los servicios existentes quedan `private`; `kind` se mantiene por compatibilidad.
- `capacity` pasa a significar «máximo de personas por sesión»; la sesión toma `min(services.capacity, rooms.capacity)` si ambos existen, o el que exista.

### `rooms`

- `service_id uuid NULL` — servicio fijo del espacio (hoy la relación es al revés, `services.room_id`; se mantienen las dos: `services.room_id` = «este servicio solo se da ahí», `rooms.service_id` = «este espacio solo da esto»). Un espacio con servicio fijo rechaza sesiones de otro servicio → `409 ROOM_UNAVAILABLE`.

### `session_schedules` (nuevo) — el horario

| Columna | Tipo | Notas |
|---|---|---|
| `id`, `center_id` | uuid | |
| `room_id` | uuid NULL | Nulo solo en centros sin espacios (sesión del profesor sin sala). |
| `service_id` | uuid | |
| `staff_membership_id` | uuid | Profesor que da esa sesión. |
| `mode` | `session_mode` | `private` o `group`. Debe ser compatible con `services.mode`. |
| `capacity` | int | Copiada al crear (min de servicio y espacio); editable. |
| `weekday` | smallint 1–7 | Lunes = 1. Un horario de martes y jueves son **dos filas** con el mismo `series_id`. |
| `series_id` | uuid | Agrupa las filas creadas juntas (para editarlas/terminarlas a la vez). |
| `starts_at_time`, `ends_at_time` | time | Hora local del centro (`centers.timezone`). |
| `starts_on`, `ends_on` | date, date NULL | Periodo. Nulo = sin fin. |
| `status` | `active | ended` | Terminar un horario no borra sesiones pasadas; cancela las futuras sin citas y avisa de las que tengan. |
| `label` | text NULL | «Inglés B1 – grupo de tarde», «1.º Derecho – mañana». |
| `created_by_membership_id` | uuid | |

Índices: `(center_id, weekday)`, `(room_id)`, `(staff_membership_id)`.

### `class_sessions` (cambios)

- `schedule_id uuid NULL` → sesión materializada desde un horario. `UNIQUE (schedule_id, starts_at)` evita duplicados al materializar.
- `cancelled_reason text NULL` y `cancelled_by_membership_id` para «cancelar un día» (festivo, profesor enfermo).
- Las exclusiones de profesor y espacio ya existentes siguen aplicando a las sesiones materializadas: al crear un horario se comprueban las 8 semanas y se listan los choques antes de guardar (como preveía `07`).

### `schedule_enrollments` (nuevo) — grupos fijos

| Columna | Tipo | Notas |
|---|---|---|
| `id`, `center_id` | uuid | |
| `series_id` | uuid | La matrícula es a la serie completa (todos sus días). |
| `client_membership_id` | uuid | |
| `starts_on`, `ends_on` | date, date NULL | Por defecto los del horario. |
| `status` | `active | ended` | |
| `created_by_membership_id` | uuid | |

`UNIQUE (series_id, client_membership_id) WHERE status = 'active'`. La suma de matriculados activos no puede superar `capacity` del horario → `409 SESSION_FULL`.

### `bookings` (cambios)

- `source booking_source NOT NULL DEFAULT 'single'` — enum nuevo (`single | enrollment`). Las citas de matrícula no consumen bono y se crean/cancelan con la matrícula.
- `enrollment_id uuid NULL`.

### `room_blocks` (nuevo) — alquiler, mantenimiento, evento

| Columna | Tipo | Notas |
|---|---|---|
| `id`, `center_id`, `room_id` | uuid | |
| `starts_at`, `ends_at` | timestamptz | |
| `reason` | `rental | maintenance | event | other` | |
| `note` | text NULL | «Alquilado a la asociación de vecinos». |
| `created_by_membership_id` | uuid | |

Exclusión `room_blocks_no_overlap` por espacio y, en código, un bloqueo rechaza crear sesiones en ese tramo y no se puede crear sobre sesiones con citas (se avisa y se puede cancelar/ mover antes).

## Materialización (proceso)

1. Al **crear o editar** un horario y **cada día a las 03:00** (hora del centro), para cada horario activo se crean las sesiones que falten hasta **hoy + 56 días** (sin pasar `ends_on`), saltando los días de cierre del centro (`holidays`) y las ausencias del profesor (`staff_absences`), que quedan registradas como sesiones `cancelled` con motivo para que el centro las vea.
2. Para cada sesión nueva se crean las citas (`source = enrollment`) de las matrículas activas en esa fecha.
3. Al **matricular** a alguien: se crean sus citas en las sesiones futuras ya materializadas (comprobando solapes del alumno; se listan los choques). Al **dar de baja**: se cancelan sus citas futuras (`cancelled_by = staff`, sin consumir crédito).
4. Editar la hora, el espacio o el profesor de un horario afecta solo a las **sesiones futuras sin citas sueltas**; las de matrícula se recrean. Si hay citas sueltas, se avisa y se puede optar por cancelarlas con aviso.
5. Idempotente: `UNIQUE (schedule_id, starts_at)`; se puede relanzar sin duplicar.

## Reglas que garantiza el servidor (resumen)

| Regla | Cómo |
|---|---|
| Nunca más personas que el aforo | `capacity` de la sesión bajo bloqueo; matrículas + sueltos ≤ capacidad. |
| Un espacio, una cosa a la vez | `EXCLUDE` de sesiones (ya existe) + `EXCLUDE` de bloqueos + comprobación cruzada en código. |
| Un profesor, una sesión a la vez | `EXCLUDE` existente. |
| Un alumno, una cita a la vez | Comprobación con bloqueo por persona (existe); también al matricular. |
| El modo respeta al servicio | `private` solo en servicios `private|both`; `group` solo en `group|both`. |
| Espacio con servicio fijo | Solo sesiones de ese servicio. |
| Solo el centro asigna, matricula, bloquea y programa | `owner | admin`. El alumno solo se apunta a sesiones con plazas o reserva huecos de su servicio, y anula las suyas. |

## API

### Centro (`owner | admin`)

- `GET /schedules?weekday&roomId&staffMembershipId` · `POST /schedules` (crea una serie con uno o varios días; responde con los choques detectados y, si `force`, los salta) · `PATCH /schedules/:seriesId` · `POST /schedules/:seriesId/end`.
- `GET /schedules/:seriesId/enrollments` · `POST /schedules/:seriesId/enrollments` (`clientMembershipIds[]`) · `DELETE /schedules/:seriesId/enrollments/:id`.
- `POST /sessions/:id/cancel` (`reason`) — cancela un día y avisa a todos.
- `GET /rooms/:id/blocks?from&to` · `POST /rooms/:id/blocks` · `DELETE /rooms/:id/blocks/:blockId`.
- `GET /agenda/rooms?date` incorpora bloqueos y sesiones programadas (con o sin gente), y marca las de matrícula.
- `POST /agenda/bookings` y `join-group`: sin cambios de contrato; aceptan `sessionId` para apuntar a una sesión programada.

### Alumno (`client`)

- `GET /services/:id/availability?from&to` — por día: sesiones grupales con `remainingSeats` (espacio, profesor, hora) y, si el servicio admite privada, huecos libres de cada profesor que lo da. Ya descuenta espacios ocupados y bloqueos.
- `POST /bookings` — `{ sessionId }` (apuntarse) o `{ serviceId, staffMembershipId, startsAt }` (privada). El servidor elige espacio. Errores: `SESSION_FULL`, `SLOT_TAKEN`, `ROOM_UNAVAILABLE`, `OUTSIDE_NOTICE`.
- `DELETE /bookings/:id` — anular (existe); una cita de matrícula se marca como «no voy» ese día (`cancelled_by = client`, `source = enrollment`), no toca la matrícula.
- `GET /me/schedule?from&to` — horario semanal del alumno (sus citas, con espacio y profesor), para los grupos fijos.

`BookingView` añade `source`, `enrollmentId` y `cancelledReason`.

## App

### Centro — pestaña Gestión (todos los sectores)

1. **Espacios**: lista; crear/editar con nombre, aforo, profesor fijo, servicio fijo.
2. **Horario**: vista semanal (lunes–domingo) por espacio; cada bloque muestra servicio, profesor, modo y «N matriculados / aforo». Crear horario: servicio → días → hora → espacio (filtra por compatibles) → profesor → modo → periodo; antes de guardar enseña los choques.
3. **Grupo fijo**: desde un horario, lista de matriculados y «Matricular» con el selector de clientes existente; baja con confirmación.
4. **Bloqueos**: desde un espacio, «Bloquear» con tramo, motivo y nota; se ven en la agenda por espacio con tramado y etiqueta.
5. **Cancelar un día**: desde la sesión en la agenda del centro.

### Alumno

1. **Reservar**: elige servicio → calendario con días disponibles → sesiones grupales («Lun 18:00 · Aula 2 · Ana · quedan 3») y/o huecos de privada → confirmación con fecha, hora, servicio, espacio y profesor → éxito. Si `SESSION_FULL` al confirmar: «Se acaba de agotar» y vuelta al listado actualizado.
2. **Mis citas**: añade espacio y profesor (ya existe) y distingue «Grupo fijo» de cita suelta.
3. **Mi horario** (grupo fijo): semana con sus clases fijas; «No voy este día» con la antelación del servicio.

### Profesor

Ve en su agenda las sesiones programadas (con o sin alumnos), el espacio y los matriculados. No programa, no matricula.

## Fases

1. **Base del centro** (ahora): `services.mode`, `rooms.service_id`, `session_schedules` + materialización, `schedule_enrollments` + citas de matrícula, `room_blocks`, cancelar un día; Gestión para todos los sectores con Espacios, Horario, Grupo fijo y Bloqueos.
2. **Alumno**: disponibilidad por servicio que descuenta espacios y bloqueos; apuntarse a sesión / reservar privada con espacio automático; anular con antelación; «Mi horario»; espacio y profesor en push.
3. **Extras**: lista de espera, reserva con aprobación del centro (ajuste), registro de clase por grupo, agenda por espacio pulida, solicitud de clase fija por el alumno (fase C de `07`).

## Fuera de alcance

Precio y cobro del alquiler; matrícula de pago; mover una serie entera de hora (se termina y se crea otra); varios profesores en una misma sesión.
