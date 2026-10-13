# 10 · Bonos

Decidido con el usuario el 13 de octubre de 2026. Primera versión **sin pasarela de pago**: el centro cobra
por su cuenta (mostrador, Bizum, transferencia) y activa el bono en la app. Stripe Connect (API-401..406)
se añade después sin rehacer el modelo.

## Qué hace

1. **El centro crea bonos** (Más → Bonos): nombre, número de clases, días de validez, precio y los
   servicios en los que vale (ninguno marcado = todos). Un bono se quita de la venta (se archiva); los ya
   vendidos conservan sus condiciones.
2. **La persona pide un bono** (Inicio → tarjeta de bono → «Pedir»). Queda **pendiente**; el centro recibe
   un aviso (`pass_requested`).
3. **El centro lo activa al cobrarlo** («Marcar como cobrado») o lo rechaza. Al activarlo empieza a contar
   su caducidad (`expiresAt = ahora + validDays`) y la persona recibe un aviso (`pass_activated`).
   También puede entregarlo directamente ya activo (`POST /passes/assign`).
4. **Cada clase a la que asiste descuenta una sesión.** «Asistir» es registrar su llegada (escaneo del QR)
   o cerrar la clase el profesional (`attended`), lo que ocurra primero. Se descuenta **una sola vez** por
   reserva (índice único en `balance_movements.booking_id`).

## Reglas

| Regla | Detalle |
|---|---|
| Qué bono se gasta | El que antes caduca entre los activos, con sesiones y válidos para ese servicio (`pickPassToConsume`). |
| Sin bono que valga | La clase es suelta: no se descuenta nada ni se bloquea la reserva. |
| Matrícula en grupo fijo | `bookings.source = enrollment` **no** descuenta bono (spec 09). |
| Estados | Guardados: `pending`, `active`, `rejected`. Deducidos: `exhausted` (0 sesiones) y `expired` (pasada la fecha), sin procesos en segundo plano. |
| Caducidad | `expiresAt` se fija al activar; un bono caducado no se usa aunque le queden sesiones. |
| Libro | `balance_movements` es solo de inserción (sin `UPDATE`/`DELETE` para la app). |
| Visibilidad | El equipo ve todos los del centro; una persona cliente, solo los suyos (RLS `client_own`). |
| Duplicados | No se puede pedir dos veces el mismo bono mientras haya uno pendiente (409). |

## API

| Método | Ruta | Rol | Para qué |
|---|---|---|---|
| GET | `/centers/{id}/rates` | todos | Bonos a la venta |
| POST / PATCH / DELETE | `/centers/{id}/rates[/{rateId}]` | owner, admin | Crear, cambiar, quitar |
| POST | `/centers/{id}/rates/{rateId}/request` | client | Pedir un bono |
| GET | `/centers/{id}/passes/mine` | client | Mis bonos |
| GET | `/centers/{id}/passes?status=&clientMembershipId=` | owner, admin | Bonos del centro |
| POST | `/centers/{id}/passes/{passId}/activate` · `/reject` | owner, admin | Decidir un pendiente |
| POST | `/centers/{id}/passes/assign` | owner, admin | Entregar un bono ya activo |

## Pantallas

- Admin: `/(admin)/passes` (pendientes + bonos a la venta) y `/(admin)/passes/new`.
- Cliente: `/(client)/my-passes` («Mis bonos» + «Pedir un bono»); la tarjeta de bono de Inicio muestra
  «Te quedan N clases · caduca el …» y abre esa pantalla.

## No incluido todavía

- Cobro online con Stripe, recibos con IVA y reembolsos (API-401..406).
- Devolver la sesión si se corrige una asistencia.
- Avisar al centro cuando a alguien se le acaba el bono o cuando asiste sin bono.
- Importar saldos de bonos desde CSV.
