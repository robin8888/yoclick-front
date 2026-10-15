# 13 · Gestión: salas, servicios y clases

Decidido el 2026-10-15 con el dueño del producto.

## Idea

En «Gestión» hay tres botones y cada cosa se crea en su sitio:

- **Crear sala**: solo un **nombre** y un **aforo**. La sala ya no guarda profesor ni servicio fijos.
- **Crear servicio**: la pantalla de siempre (duración, precio, quién lo da…).
- **Crear clase**: junta todo lo anterior. Se le pone un **nombre**, una **sala** (de las creadas), un **servicio**
  (de los creados), un **profesor que da ese servicio** y **cuándo se da**.

La clase es lo que sale en la agenda del centro y en la de cada profesor, y lo que lleva alumnos apuntados.

## Cuándo se da

- **Cada semana**: uno o varios días de la semana + una hora + «desde el día».
- **Solo una vez**: un día + una hora.

La hora solo se puede elegir entre las **libres**: el servidor (`GET /schedules/busy-times?roomId&staffMembershipId`)
devuelve las franjas que ya ocupan la sala y el profesor con clases activas, y la app ofrece solo las horas de
inicio (de media en media hora) en las que el servicio —con su duración— no pisa ninguna en ninguno de los días
elegidos. El servidor sigue validando al guardar (y devuelve las fechas que no pudo crear).

## Apuntar alumnos y asistencia

Igual que hasta ahora: «Matricular» en la clase y el control de asistencia desde la agenda.
**Solo se puede apuntar a quien tiene un bono en vigor y clases por agendar** para el servicio de la clase
(`GET /passes/eligible?serviceId`). El servidor también lo exige: matricular a alguien sin bono
le devuelve `no_active_pass` en `skipped` y no entra.

## Cambios de datos

Migración `rooms_without_fixed_teacher_and_service`: las salas existentes pierden el profesor y el servicio fijos
para que no impidan crear clases con otros servicios.

## Crear clase: horas y fechas (2026-10-15)

- La hora de inicio y la de fin se eligen con ruedas (como el iPhone); el fin siempre es posterior al inicio.
- Se validan contra el horario del centro (día cerrado, fuera de horario) y contra lo que ya ocupa la sala o el profesor (franjas visibles debajo de las ruedas). Mientras no valgan, no se puede guardar.
- Cada semana: fecha de inicio y de fin (atajos de 1–4 semanas o «sin fin»). Solo una vez: un único día.

## Alquileres sin profesor y botones de Gestión (2026-10-15)

- El servicio tiene la casilla «Es un alquiler (sin profesor)» (`isRental`). En un alquiler, «Crear clase» no pide profesor y la clase/sesión queda con `staff = null` (back: `staff_membership_id` nullable en `session_schedules` y `class_sessions`; un disparador impide reservar una sesión sin profesor).
- El profesor del servicio es opcional: sin nadie asignado, cualquiera del equipo puede darlo (en «Crear clase» salen todos).
- Gestión: «Crear clase», «Crear y editar sala» y «Crear y editar servicio»; la lista de lo ya creado, para editarlo, va debajo de cada formulario de creación.
- Inicio del centro: el acceso «Salas y {clases|sesiones}» usa la palabra del sector.
