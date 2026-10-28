# 18 · Contestador IA (add-on): lo que ve la app

El back está descrito en `yoclick-back/docs/spec/07-contestador-ia.md`. Esta nota recoge solo lo que hace la app
(fase 4). **Regla de tiendas (Apple 3.1.1):** la app no vende ni invita a contratar el servicio: sin precios, sin
botón de contratar, sin enlaces a planes. Si el centro no lo tiene, solo se explica qué hace.

## Dónde está

| Quién                | Qué                                                                                                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Propietario y admin  | Botón **«Contestador IA»** en el **inicio del centro** (mismo mosaico que Equipo, Servicios…). Solo sale si el centro tiene el servicio contratado y no cancelado. |
| Propietario y admin  | Pantalla `/(admin)/voice-receptionist`. Si se llega por aviso o por ruta sin tener el servicio, muestra solo la explicación (sin acciones).                        |
| Alumno / cliente     | Tarjeta **«Tu código»** en su inicio y en su perfil: 6 cifras, botón copiar, «díctalo cuando llames para que te identifiquen».                                     |
| Propietario y admin  | Avisos `voice_minutes_80` y `voice_minutes_100` llevan a la pantalla. Sin importes ni invitaciones a contratar.                                                    |

No hay fila en «Más»: quedaba demasiado oculta.

## La pantalla

1. **Estado del servicio**: Activo / Apagado / En pausa / No disponible (con palabra, no solo color) e interruptor
   «Contestador activado». El interruptor solo existe con suscripción en marcha y número asignado; el servidor puede
   negarse (`VOICE_ADDON_NOT_CONTRACTED`, `VOICE_LINE_NOT_ASSIGNED`) y se muestra su mensaje.
2. **Número puente**: copiar, cómo desviar según el modo (siempre, si no contestas, si comunica, fuera de horario;
   texto genérico sin códigos de operador) y «Llamada de prueba» con un enlace `tel:` al número.
3. **Minutos del periodo**: barra usada/incluida, con «Cerca del límite» (≥ 80 %) y «Minutos incluidos agotados»
   (≥ 100 %) y qué pasa después según el ajuste. Sin precios aunque la API los traiga (`addonPlan`).
4. **Ajustes**: saludo y nombre del asistente (solo si `capabilities.canCustomizeAssistant`; si no, de solo lectura
   con una nota neutra), aviso legal, teléfono de transferencia (E.164; el servidor rechaza el del centro o el puente),
   días de retención, cuándo se desvía y qué hacer al agotarse los minutos (`overagePolicy`).
5. **Historial**: llamadas con resultado, duración, fecha y resumen; «Ver más» por cursor. El teléfono se muestra tal
   como lo da la API (enmascarado); no se muestra transcripción (la API solo dice `hasTranscript`).

## Código del alumno o cliente

`GET /v1/centers/:id/me/student-code` lo sortea la primera vez que se pide. La tarjeta no bloquea la pantalla donde
está: si falla, avisa y deja reintentar.

## Código

`src/features/voice-receptionist/` (`model/`, `hooks/`, `components/`, `screens/`). `useHasVoiceReceptionist` decide si
sale el botón del inicio; `StudentCodeCard` se usa en el inicio y el perfil del cliente. `useCopyToClipboard` se movió a
`shared/hooks` para no crear una dependencia circular entre features.
