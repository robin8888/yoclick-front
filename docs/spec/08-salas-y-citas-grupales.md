# 08 · Salas, profesor por sala y citas privadas o grupales

Estado: **construido el 10 oct 2026** (servidor y app). Pensado para las academias (baile, artes marciales, música, cocina, idiomas…), donde las clases se dan en salas con aforo.

## Qué es

- El centro crea **salas** con un **nombre**, un **aforo** y el **profesor que da clase** en cada una. Se gestionan desde una pestaña nueva, **«Gestión»**, que solo llevan los sectores `academia`, `baile`, `marciales`, `musica` y `cocina`.
- Al asignar una cita (solo la asigna el centro, ver `07-citas-recurrentes.md`) hay dos tipos:
  - **Privada**: una persona con el profesor, en una sala libre.
  - **Grupal**: tantas personas a la misma hora y con el mismo profesor como permita el **aforo de la sala**.
- La **agenda del centro es por sala** (en centros con salas): una **línea temporal del día** con las horas en las que abre el centro; en cada hora aparecen las salas reservadas con el servicio, el profesor y, **en rojo, las personas que faltan para el aforo**. Al pulsar una sala, el detalle del día: qué clase la ocupa, de qué hora a qué hora, aforo y alumnos apuntados, con «Apuntar a alguien a este grupo» si quedan plazas. Los centros sin salas siguen con la agenda por profesor.
- El alumno ve en su cita la **sala**, el profesor y la hora; el profesor ve lo mismo en su agenda.

## Reglas que garantiza el servidor

| Regla | Cómo se garantiza |
|---|---|
| Un profesor no puede estar en dos salas a la misma hora | Restricción `EXCLUDE` de la base de datos sobre sus sesiones programadas (ya existía) |
| Una sala no puede tener dos sesiones a la misma hora (ni dos profesores en la misma sala) | Restricción `EXCLUDE` nueva `class_sessions_no_room_overlap` |
| Un alumno no puede estar en dos salas (ni dos citas) a la misma hora | Comprobación de solapes con bloqueo por persona; también al apuntarse a un grupo |
| Una sala no admite más personas que su aforo | El aforo de la sesión grupal es el de la sala; al apuntarse se cuentan las plazas bajo un bloqueo de la sesión → `409 SESSION_FULL` |
| Una sala con profesor fijo solo la usa ese profesor | `409 ROOM_UNAVAILABLE` |
| Una cita grupal siempre lleva sala | Sin sala utilizable → `409 ROOM_UNAVAILABLE` |

Todo se vuelve a comprobar al guardar: la lista de salas libres de la app es solo una ayuda.

## Servicios, salas y profesores (cambio del 10 oct)

- Cada **profesor** tiene los **servicios** que da (se asignan desde su ficha del equipo o desde el servicio).
- Cada **sala** tiene los **servicios** que se dan en ella (se asignan desde la sala; un servicio tiene una sola sala fija). El profesor fijo de la sala es opcional.
- Al asignar una **cita privada**: se elige el profesional (de los que dan el servicio) y salen sus horas libres con sala.
- Al asignar una **cita grupal**: el profesor **no se elige aparte**. Se elige el servicio y el día y salen las salas donde se da, cada una con los profesores que lo dan (y pueden usar esa sala), con sus horas libres y los grupos con plazas. Se elige la hora de un profesor, o se apunta al alumno a un grupo ya abierto.
- Un servicio con sala fija solo se da en esa sala (privadas incluidas).

## Modelo

- `rooms.staff_membership_id` (nulo = la puede usar cualquiera del equipo).
- `class_sessions.room_id` y `class_sessions.mode` (`private | group`). Una sesión grupal admite varias reservas (`bookings`) hasta su `capacity`.
- Al cancelar una reserva, la sesión solo se libera (hueco del profesor y de la sala) cuando ya no queda nadie apuntado.
- Centros **sin salas**: nada cambia (la cita no lleva sala, es siempre privada).

## API

- `POST /agenda/bookings` admite `mode` (`private` por defecto, `group`) y `roomId`. Sin `roomId` se usa una sala libre del profesor.
- `POST /agenda/bookings/join-group` apunta a un cliente a un grupo existente.
- `GET /agenda/group-options?date&serviceId`: para una cita grupal, cada sala del servicio con cada profesor que lo da, sus horas libres y sus grupos con plazas.
- `PATCH /team/:id` admite `serviceIds` (servicios que da la persona); `POST/PATCH /rooms` admiten `serviceIds` (servicios que se dan en la sala).
- `GET /agenda/placement-options?date&serviceId&staffMembershipId`: horas libres del profesor con sus salas libres y grupos del día con plazas.
- `GET /agenda/rooms?date`: la agenda del día por sala (ocupación, profesor, plazas y alumnos); las citas sin sala salen aparte.
- `PATCH /rooms/:id` edita nombre, aforo o profesor (las citas ya puestas conservan su sala).
- Toda cita (`BookingView`) incluye `room` y `session { id, mode, capacity, bookedCount }`.

## Decisiones y límites

- Una clase grupal **no se mueve de hora**: se cancela y se vuelve a asignar (su hora la comparten otras personas). Las privadas sí se pueden mover y conservan la sala si sigue libre.
- La reserva directa del alumno desde su app no elige sala: usa una libre de su profesor. Pendiente (Fase C de `07`): que el alumno solo solicite y el centro asigne.
- Pendiente: que la disponibilidad que ve el alumno descuente también las salas ocupadas (hoy solo lo comprueba al reservar).
- Pendiente: registro de clase (iniciar/terminar con temporizador) por grupo; hoy es por reserva.
- Pendiente: avisos push con el nombre de la sala.
