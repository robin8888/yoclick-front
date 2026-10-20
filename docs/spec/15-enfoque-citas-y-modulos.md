# 15 · Enfoque de citas y módulos por centro

Hasta ahora la app estaba pensada para centros de **clases y grupos** (academia, baile, yoga, gimnasio…). Muchos negocios solo necesitan que el cliente **pida cita según disponibilidad, la anule o la cambie** (estética, peluquería, psicología, fisioterapia, taller…). No hace falta un sector por profesión: el centro elige cómo trabaja y qué módulos usa.

## Cómo elige el centro

1. **Al darse de alta**, antes que el sector: «¿Cómo trabajas?» (`workMode`).

| Respuesta | `workMode` | Módulos al nacer |
|---|---|---|
| Clases y grupos | `classes` | todo encendido |
| Citas con clientes | `appointments` | todo apagado (solo reservar, anular y cambiar citas) |
| Las dos cosas | `both` | todo encendido |

2. **Después**, en Ajustes del centro, cada módulo es un interruptor: un taller que empieza con citas y luego vende bonos solo enciende «Bonos».
3. Los centros que ya existen quedan con **todo encendido** (la columna guarda lo apagado, no lo encendido).

## Módulos

`content` (contenido y práctica: rutinas, vídeos, biblioteca) · `attendance` (QR de acceso y asistencia) · `passes` (bonos) · `waitlist` (lista de espera) · `rooms` (salas, horarios fijos, grupos fijos).

El núcleo (reservar por disponibilidad, anular, cambiar, avisos, chat, recibos, equipo y agenda) **no se puede apagar**.

## Contrato

- `GET /v1/centers/{id}/branding` (público) devuelve `modules: { content, attendance, passes, waitlist, rooms }` para que la app esconda lo apagado antes de iniciar sesión.
- `GET/PATCH /v1/centers/{id}` (propietario y administración) devuelve `modules` y acepta `modules` parcial (`{ "passes": false }`); solo cambian los módulos enviados.
- `POST /v1/onboarding/centers` acepta `workMode` (`both` por defecto) y devuelve `modules`.
- La app **oculta** lo apagado; el servidor es quien decide permisos (ver «Pendiente»).

## Por hacer, por fases

1. ✅ Back: columna `disabled_modules`, `modules` en marca, ajustes, «mis centros» y alta, `workMode` en el alta.
2. ✅ App: lee `modules` de «mis centros» (`useActiveCenterModules`) y esconde la pestaña «Practicar», el QR de acceso, el escáner y la asistencia, «Bonos», la lista de espera, «Gestión de salas», rutinas y la pestaña de contenido del admin. Pantalla «Módulos del centro» (Más → Tu centro) con un interruptor por módulo. Pregunta «¿Cómo trabajas?» en el alta.
3. ✅ Registro del cliente sin el paso de experiencia y objetivos cuando el centro no usa contenido (`useAccessCenterUsesContent`: lee la marca pública del centro; mientras no se sabe, se pregunta como siempre).
4. ✅ **Margen entre citas** por servicio (`bufferMinutes`, 0 a 240 de 5 en 5): tras cada cita queda libre ese tiempo. La rejilla del cliente avanza cada duración más margen; una cita ocupa también su margen, así que no se ofrece una hora que lo pise. El último hueco puede acabar a la hora de cierre. El equipo puede reservar a intervalos de 15 minutos, pero respetando el margen. Campo «Margen entre citas» en el editor de servicios.
5. Plantillas sugeridas opcionales (peluquería, fisio, psicología, estética…) que solo precargan servicios y palabras.

**Descartado:** vocabulario editable por el centro (decisión del 20/10/2026). Se queda el vocabulario por sector.

## Pendiente (decidir más adelante)

- ✅ **El servidor rechaza** lo apagado (409 `MODULE_DISABLED`) en las rutas que crean o cambian datos de cada módulo (`@RequiresModule`); las de solo lectura siguen abiertas para no romper las citas.
- Ficha o historial del cliente con notas, pago o señal al reservar, y cita con varios servicios seguidos son funciones aparte.

## Duración de la cita

La fija el centro por servicio (`durationMinutes`). El cliente solo elige la hora de inicio: la petición no lleva fin ni duración, y el inicio tiene que coincidir con un hueco que calcula el servidor. Para duraciones distintas se crean servicios distintos.
