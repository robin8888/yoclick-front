# 12 · Tutores y menores

Construido el 2026-10-15 en back (`src/modules/guardians`) y app (`src/features/guardians`, ficha en `features/clients`).

## Idea

Un menor (menos de 18 años según su fecha de nacimiento) no tiene una cuenta con la que escribir o reservar:
lo hace su **tutor**, una persona adulta del mismo centro. El **centro enlaza** a cada tutor con su hijo
(así comprueba que lo es); no se enlazan solos.

## Modelo

`guardian_links` (centro, tutor, hijo, quién lo enlazó). Única por pareja. El tutor ha de ser adulto y el hijo,
una persona cliente activa del centro. RLS: la administración y el equipo ven todos los enlaces; un tutor, los suyos.

La RLS de `bookings` y `client_passes` deja además a un tutor leer lo de sus hijos.

## Tutor no es alumno

Una persona del centro lleva `isStudent` (por defecto `true`). Un tutor que no da clase tiene `isStudent = false`:
no sale en la lista de **Alumnos**, no cuenta para el límite de clientes del plan, ni en los informes de
alumnos. Se ve en la pestaña **Familias**. Quien además da clase se deja como alumno y tutor a la vez.

- El centro la marca en la ficha («Cuenta como alumno»).
- Se invita directamente como tutor (`isStudent: false` en la invitación): **Más → Invitar a un tutor**.
- `GET /clients?kind=students|guardians|all` (por defecto, alumnos) y `PATCH /clients/:id { isStudent }`.

## Qué hace el tutor

- **Mis hijos** (inicio del alumno, solo si es tutor de alguien): sus próximas clases y las clases que les
  quedan en el bono.
- **Mensajes**: lo que el centro o un profesor escribe a un grupo o a una clase y toca a un menor le llega al
  tutor, en su conversación, con el aviso «Para {hijo}: …». Los menores sin tutor no reciben nada y se cuentan
  aparte («n menores no lo han recibido»).

## API

- `GET /centers/:id/clients/:childId/guardians` · tutores de una persona (administración).
- `POST` ídem `{ guardianMembershipId }` · enlaza. `409 GUARDIAN_MUST_BE_ADULT | GUARDIAN_INVALID_PEOPLE |
  GUARDIAN_ALREADY_LINKED`.
- `DELETE /centers/:id/clients/:childId/guardians/:guardianId` · quita el enlace.
- `GET /centers/:id/guardians/me/children` · lo que ve un tutor de sus hijos.

## Actuar en nombre del hijo

El tutor elige «Para: yo · Lucía» (en reservar, mis citas y mis bonos). La app añade la cabecera
`X-Acting-For: <hijo>` a las peticiones del centro. El servidor (`TenantGuard`) comprueba que existe el enlace de tutor
y, si es así, trata la petición como del hijo: reservar, cancelar, ver y pagar sus bonos, todo con sus datos y
descontando de su bono. Sin enlace, `403`. Al cambiar de centro, o cerrar sesión, se deja de representar.

## Avisos del hijo al tutor

Un trigger de la base de datos (`notify_guardians_of_child`) copia cada aviso de un menor a cada uno de sus
tutores, con `forChildName`. Vale para cualquier aviso (citas, clases canceladas, bonos…) y el envío al móvil no
cambia. En la app el aviso sale «Para Lucía: …» y lleva a «Mis hijos».

## Pendiente

- Que el tutor dé de alta a su hijo desde la app (hoy lo crea y enlaza el centro).
- Consentimientos RGPD del menor firmados por el tutor; exportar o borrar los datos del hijo.
- Avisos de pago pendiente del hijo con acceso directo a pagar.