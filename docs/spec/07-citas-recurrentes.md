# 07 · Citas recurrentes y «quién asignó la cita»

Estado: **diseño acordado el 10 oct 2026, sin construir**. Decisiones tomadas con el propietario del producto.

## Problema

Un alumno quiere una clase (o una sesión de su bono) siempre el mismo día y a la misma hora (todos los jueves, todos los miércoles…). El centro o el maestro debe poder fijarlo; las citas tienen que verse en la agenda del maestro y reflejarse en su disponibilidad. Además, **toda cita debe decir quién la asignó**: el alumno, el centro (administración) o el maestro.

## Decisiones

| Tema | Decisión |
|---|---|
| Quién asigna citas | **Solo el centro** (propietario o administración). El maestro **no asigna** citas ni series (cambio del 10 oct 2026). |
| Quién crea la serie | El alumno la **solicita**; **el centro** la aprueba o la asigna directamente. El maestro solo la ve en su agenda. |
| Horizonte | **8 semanas rodando**: siempre existen las citas de las próximas 8 semanas; un proceso diario añade lo que falta. La serie no acaba salvo que se indique una fecha final. |
| Bono de sesiones | **Descuenta al ocurrir**: cada cita gasta una sesión cuando se hace, como una cita normal. Si no queda bono, se avisa al centro. |

## Modelo

1. **Quién asignó (todas las citas)**: `bookings.created_by_membership_id` y `bookings.created_by_role` (`client | staff | admin | owner`). Lo rellena siempre el servidor desde el actor autenticado.
2. **Serie**: tabla `recurring_bookings` con `client_membership_id`, `staff_membership_id`, `service_id`, `weekdays` (uno o varios), `starts_at_time`, `starts_on`, `ends_on` (opcional), `status` (`requested | active | paused | ended | rejected`), `requested_by_membership_id`, `approved_by_membership_id`, `created_at`.
3. **Ocurrencias**: citas normales (`class_sessions` + `bookings`) con `recurrence_id`, generadas desde la regla. Agenda, disponibilidad, avisos y bono funcionan sin cambios.
4. **Excepciones**: cancelar o mover **solo una fecha** no rompe la serie; se puede pausar o terminar toda la serie.
5. **Conflictos**: al crear o aprobar se comprueban todas las fechas de la ventana; se listan las que chocan (hueco ocupado, ausencia, festivo, fuera de horario) y se puede crear saltándolas.

## Fases

1. **Fase A — Quién asignó**: columnas en `bookings`, rellenado en todos los puntos de creación (alumno, nueva cita de la agenda, reprogramar), y mostrarlo en la agenda del maestro, la ficha del alumno y las citas del alumno.
2. **Fase B — Serie asignada por el centro o el maestro**: regla + generación de 8 semanas + proceso diario + cancelar una fecha / terminar la serie.
3. **Fase C — Solicitud del alumno**: «Pedir cita fija» en la app del alumno, bandeja de solicitudes del centro para aprobar o rechazar, avisos a ambas partes.

## Fuera de alcance por ahora

Pago por adelantado de todas las sesiones de la serie; series con varios maestros; cambios masivos de hora de toda la serie (se hará terminando una y creando otra).
