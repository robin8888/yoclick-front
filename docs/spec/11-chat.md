# 11 · Mensajes internos (chat)

Decidido el 2026-10-15 con el dueño del producto. Construido en back (`src/modules/chat`) y app (`src/features/chat`).

## Quién habla con quién

| Origen | Destino | Condición |
|---|---|---|
| Alumno | Cualquier profesor del centro | Sin más condición |
| Profesor | Cualquier alumno del centro | Sin más condición |
| Alumno / profesor | El centro | Siempre (la bandeja del centro la atiende la administración) |
| Dueño / administración | Alumno o profesor | Siempre; habla en nombre del centro |

Nunca: alumno con alumno, profesor con profesor, ni nadie con un **menor**.

## Privacidad

- Una conversación entre dos personas **no la lee nadie más**, tampoco el dueño. La RLS de `conversations` solo deja ver
  las conversaciones donde quien pregunta es una de las partes, o las dirigidas al centro (`counterpart` nulo) si es
  dueño o administrador.
- Los mensajes enviados no se borran (`REVOKE DELETE`).
- El push es genérico («Tienes un mensaje nuevo»); el contenido solo se ve dentro de la app (SEC-M5).

## Menores

Solo se escribe a un menor (menos de 18 años según su fecha de nacimiento) a través de su **tutor**. Mientras la app no
tenga cuentas de tutor, un menor no puede abrir ni recibir conversaciones: `403 CHAT_MINOR_REQUIRES_GUARDIAN`.
Pendiente: cuenta de tutor con varios hijos (ver «Familias y menores» en el plan).

## Adjuntos

Imagen (JPEG, PNG o WebP, hasta 5 MB) o PDF (hasta 10 MB). El tipo se lee de los bytes, no del nombre ni del tipo que
diga el móvil. Se guardan en el almacén de ficheros (`chat/{centerId}/{conversationId}/{messageId}.{ext}`) y se
sirven con enlace firmado de corta vida.

## API

- `GET /centers/:id/conversations` · bandeja con no leídos.
- `GET /centers/:id/conversations/contacts` · con quién se puede empezar.
- `POST /centers/:id/conversations` `{ withMembershipId? }` · abre o recupera (nulo = el centro).
- `GET|POST /centers/:id/conversations/:cid/messages` · hilo (más reciente primero, `before` pagina) y envío.
- `POST /centers/:id/conversations/:cid/attachments?fileName=` · cuerpo = el fichero.
- `POST /centers/:id/conversations/:cid/read`.

Errores: `CHAT_NOT_ALLOWED`, `CHAT_MINOR_REQUIRES_GUARDIAN`, `CHAT_ATTACHMENT_UNSUPPORTED`,
`CHAT_ATTACHMENT_TOO_LARGE`.

## Notificaciones

`message_received`: un aviso por conversación mientras quien lo recibe no la abra (no uno por mensaje).

## Pendiente

- Tiempo real (WebSocket) en lugar del sondeo cada 5 s / 15 s.
- Hilo con lo más reciente abajo y desplazamiento automático (ahora lo más reciente va arriba).
- Cuentas de tutor y chat con familias.
- Silenciar o bloquear una conversación; borrar mensajes propios.
- Indicador de mensajes sin leer en la barra de pestañas.
