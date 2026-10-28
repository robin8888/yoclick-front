# 05 · Plan de trabajo

Un ticket = una rama (`feat/API-012-bookings-create`) = un PR pequeño (< 400 líneas cambiadas sin contar generados). Cada ticket cumple la *definition of done* del `CLAUDE.md` de su repo. Los ids de pantalla (`book3`, `iscan`…) son los del prototipo (`design/pantallas.md`).

Orden recomendado: **API-0 → API-1 → APP-0 en paralelo con API-2 → …** La app trabaja con mocks MSW generados del contrato hasta que el endpoint real existe.

## Actualización (10 oct 2026, cierre del día)

Front: lint, typecheck y 1870 tests en verde. Back: lint, tsc, 971 unitarios y 841 e2e en verde.

> ### ⭐ PRIORIDAD PARA MAÑANA
> **Ajustar la vista de la agenda del centro** (cómo se quiere ver). Hoy es una línea temporal del día (filas por hora de apertura, cada sala reservada con servicio, profesor y «Faltan N» en rojo; al pulsar, detalle de la sala). Hay que sentarse a decidir cómo debe verse de verdad (por ejemplo, salas en columnas frente a una lista por horas, qué mostrar en cada bloque, duración de las clases a escala, colores por servicio) y probarla en el móvil con datos reales.

- ✅ **Premium**: fondo de pantalla (liso o degradado) y colmena elegidos en «Tu marca», con contraste seguro; pantalla de bienvenida tras el QR como el prototipo (`welcome`).
- ✅ **Contenido «Practicar» personalizado**: solo lo asignado a todos, su nivel, su grupo o la persona; destino nuevo «Para todos»; se marca a quién se asigna.
- ✅ **Perfil del alumno** como el prototipo (`profile`) y **«Mis datos»** (alumno y profesor) con teléfono y dirección opcionales.
- ✅ **Quién asignó cada cita** (`created_by`) y diseño de citas recurrentes (`07-citas-recurrentes.md`, sin construir las fases B y C).
- ✅ **Solo el centro asigna y mueve citas**; el profesor puede cancelar las suyas. Botón «Nueva cita» en la agenda del centro.
- ✅ **Salas, profesor por sala y citas privadas o grupales** (`08-salas-y-citas-grupales.md`): pestaña «Gestión» en academias (academia, baile, marciales, música, cocina), salas con aforo, profesor fijo opcional y servicios; servicios asignados a cada profesor desde su ficha; «Nueva cita» con tipo privada/grupal, salas y profesores disponibles, apuntarse a un grupo con plazas; reglas de no solape de profesor, sala y alumno y de aforo en servidor.
- ✅ **Agenda del centro por sala** (línea temporal por horas y detalle de cada sala con alumnos), pendiente de ajustar (ver prioridad).
- 🟡 Pendiente de probar en móvil: todo lo anterior.
- ⬜ Límites conocidos de salas: mover una clase grupal (hoy se cancela y se vuelve a asignar), disponibilidad del alumno que descuente salas ocupadas, registro de clase (iniciar/terminar) por grupo, push con el nombre de la sala, solicitudes del alumno y aprobación del centro (fase C de `07`).
- ⬜ Datos de prueba: se cancelaron todas las citas de «Academia Ninja Mortal» (29 reservas, 42 sesiones) el 10 oct; el script para sembrar citas de hoy quedó preparado pero sin ejecutar.

## Actualización (9 oct 2026, cierre del día)

Front: lint, typecheck y 1744 tests en verde. Back: lint, tsc, 971 unitarios y 811 e2e en verde.

- ✅ **Biblioteca de contenido** (vídeo, PDF e **imagen**) con nombre, etiqueta y nivel; asignación por nivel, grupo o persona (también el instructor); aviso push al asignar. Bunny Storage (`yoclick-files`) en marcha.
- ✅ **Foto de perfil** (equipo y alumnado, una por persona, cámara o galería, reducida a 512 px, se puede quitar) y **galería de hasta 6 fotos** en «Mi perfil profesional». Se guardan en Bunny, no en la base de datos.
- ✅ **Límites contra abusos**: espacio de fotos por centro (100 MB), PDF e imágenes (1 GB), tamaño real de los vídeos comprobado con el que informa Bunny, máximo 5 vídeos subiéndose a la vez, límite de subidas por minuto/hora (por IP).
- ✅ **«Mi perfil profesional» como el prototipo** (`iprof`), «Mis alumnos» en tarjetas, agenda del instructor con el color del centro y un solo QR, campana de avisos en la agenda del propietario, botones solos a ancho completo, vídeos verticales y pausa al salir de la pantalla.
- ✅ **Selector de color** (cuadrado + barra de tono + hexadecimal) como único selector del «Color principal» de «Tu marca».
- ✅ **Arreglo del alta con QR**: al iniciar sesión la unión al centro no se completaba si la pantalla de login ya se había cerrado (alumno `letialumno` quedaba en «Sin centro todavía»). Ruta nueva `/j/[code]` (enlace del QR y de WhatsApp).
- 🟡 Pendiente de probar en móvil: cámara y galería de fotos, selector de color con el dedo, vídeo vertical, `/j/[code]` (necesita `yoclick.app` con los ficheros de asociación para abrir la app desde la cámara del móvil).
- 🟡 **Premium (hecho el 10 oct 2026, sin probar en móvil)** — fondo de pantalla liso o degradado (dos colores) y color de la colmena, elegidos con el selector de color; el color del texto se queda como hoy (calculado por el motor de marca). Hace falta: campos del centro en el servidor (solo plan Premium), llegada a la app con los datos del centro, sección «Personalización Premium» en «Tu marca» con vista previa y contraste.
- ⬜ Resto: foto del propietario desde Más, moderar fotos de otras personas desde la app, pantalla completa al tocar una foto, el paso de color del alta de centro sigue con colores de muestra, limpiar fotos de galería al borrar una cuenta, límite de subidas por usuario (hoy por IP), subir imágenes como instructor (hoy solo propietario/administrador), correo a personas importadas, textos legales, claves push Apple/FCM y compilar de nuevo para probar el aviso real.

## Actualización (8 oct 2026, cierre del día)

Todo subido con `git push` en los dos repos. Back: 876 tests unitarios y ~702 e2e en verde; front: 1630 tests, lint y typecheck en verde.

- ✅ **Cambiar hora de una reserva** (cliente): `POST /bookings/:id/reschedule` con el plazo de cancelación y push; pantalla «Cambiar hora». 🟡 Falta que el equipo mueva reservas desde la agenda.
- ✅ **Editar rutinas** (`PUT /routines/:id`, un aviso por persona) y **progreso de rutinas** («Hoy hice esta rutina», casillas por ejercicio, «Quién la ha hecho» para el equipo). Falta: series/pesos, gráficos, avisar al equipo.
- ✅ **Alta de alumnos e instructores con código del centro**: invitación por teléfono o correo desde Más › Invitar (WhatsApp, SMS o copiar), reenviar y anular pendientes, el código aplica la marca del centro (logo y color) en inicio, registro, verificación y login, enlace «¿Has olvidado tu contraseña?» visible, aceptación automática tras el login (idempotente, `accepted_by_user_id`), teclado de Android que ya no tapa los campos.
- ✅ **Aviso push al centro** cuando alguien se da de alta (`member_joined`, propietario y administradores).
- ✅ **Primera pantalla**: «Tengo un código de mi centro» y escáner de QR (escanear el QR de «Invita a tus alumnos» equivale a escribir el código corto). Probado en iPhone: funciona.
- 🟡 **Android: la cámara del escáner no se abría**. Causa: el plugin `expo-image-picker` con `cameraPermission: false` bloqueaba `CAMERA` en toda la app. Corregido (`0a7d675`); falta recompilar (`eas build --profile development --platform android`) y confirmar en el móvil.
- ⬜ Escanear el QR con la cámara nativa del móvil: requiere publicar `yoclick.app` con los ficheros de asociación y la ruta `/j/[code]`.
- ⬜ Pendientes anteriores: correo a las personas importadas, biblioteca de contenido (Bunny Storage), claves push (Apple/FCM, `PUSH_PROVIDER=expo`), `video_storage_limit_bytes`, textos legales, foto de perfil y certificados.

## Estado de avance (28 oct 2026, cierre del día)

Leyenda: ✅ hecho · 🟡 parcial · ⬜ pendiente. Esta sección **añade** a las anteriores. Back: lint, tsc, unitarios y e2e completos en verde; front: lint, typecheck y tests de las carpetas tocadas en verde. Lo de la mañana está subido; el contestador IA está commiteado **sin push**.

### Hecho el 28 de octubre
- ✅ **Cobro del plan fuera de la app** (Apple 3.1.1): enlace firmado por correo, recordatorios de prueba, la app solo informa del plan; tarjeta del plan y «En prueba» en el inicio del centro; borde parpadeante en «Primeros pasos»; campana animada.
- ✅ **Bajar de plan con más clientes del tope**: baja al final del periodo, aviso `plan_over_limit`, sin borrar clientes; párrafo en los términos.
- ✅ **Cuatro bloqueantes de la auditoría de tiendas**: sin textos de pago, borrar cuenta del propietario cierra el centro, enlaces legales y contacto, denunciar y bloquear en el chat.
- ✅ **Variante Premium eliminada** de `app.config`; textos de Apple Pay, Google Pay y Bizum quitados; el nombre del centro ya no se corta.
- ✅ **Contestador IA de citas (add-on), fases 1 a 5**: módulo de voz con Vapi detrás de `VoiceAgentProvider`, código de alumno, cita de prueba para no alumnos, facturación como líneas de la suscripción (cuota fija + minutos medidos, elegible en la página de pago de Stripe), avisos al 80 % y 100 %, pantalla y botón en el inicio del centro, tarjeta «Tu código», guía de Vapi y lista de pruebas (`docs/guides/contestador-ia-vapi.md` en el back).

### Decisiones
- El add-on se contrata fuera de la app; dentro, el estado bloqueado solo informa. Solo con plan mensual.
- Invitados: reserva real solo en servicios marcados «admiten cita de prueba»; no cuentan para el tope de clientes.

### Pendiente
1. ⬜ Probar el contestador de extremo a extremo con cuentas reales de Vapi y Twilio (número +34 9xx con su trámite) y Stripe de prueba (`billing:setup`); lo no verificado está marcado en la guía.
2. ⬜ Revisión legal del aviso de la llamada y del contrato de tratamiento de datos (subencargados).
3. ⬜ Probar en el móvil: botón del inicio, pantalla del contestador, tarjeta «Tu código».
4. ⬜ Enlazar al invitado con su cuenta si luego se registra; herramienta para reservar a un hijo; enlace de pago por SMS (opcional); automatizar el asistente de Vapi por centro.
5. ⬜ Endurecer la configuración de producción del back (Stripe y Bunny obligatorios, `trustProxy`, clave propia para el enlace de pago, subir `zod` y `fastify`), cuenta de revisión para Apple, páginas legales publicadas, notas para App Review.
6. ⬜ Bloqueado por el alta de autónomo: Stripe real, dominio `yoclick.app`, Brevo.

## Estado de avance (27 oct 2026, cierre del día)

Leyenda: ✅ hecho · 🟡 parcial · ⬜ pendiente. Esta sección **añade** a las anteriores; lo que no aparece aquí no ha cambiado. Back: lint, tsc, 1358 unitarios y e2e de pagos, ajustes de centro y facturación en verde; front: lint, typecheck y tests de center-admin y notifications en verde. Lo del día está commiteado **sin push**.

### Hecho el 27 de octubre
- ✅ **P4 (cargos manuales e informes), P5 y P6**: Stripe Billing en modo test, elegir plan mensual o anual, portal del cliente.
- ✅ **Prueba terminada → modal bloqueante** (`PlanRequiredGate`) que lleva a la pantalla de planes; la API devuelve 402 `PLAN_REQUIRED` a propietario y admin si intentan escribir (`PlanGuard`).
- ✅ **Push y registro al comprar o cambiar de plan** (`plan_subscribed`, `plan_changed`).
- ✅ **Qué incluye cada plan**, en una sola tabla en el back (`plan-features.ts`): Básico = lo esencial; Pro suma informes, importar clientes, rutinas, biblioteca, grupos, familias, lista de espera y salas; Premium suma aspecto propio, vídeos y cobro online (Stripe Connect). La API niega las rutas (402 `PLAN_FEATURE_NOT_INCLUDED`) y la app esconde el menú y lo explica en la pantalla de planes.
- ✅ **Premium sin cuota de alta** (decisión del usuario); primer pago 149 € + 21 % IVA.
- ✅ **«App propia con tu icono» quitada del Premium**: no hay proceso para compilar y publicar una app por centro.

### Decisiones
- El cobro de los bonos lo hace cada centro con su Stripe Connect; la app solo cobra los planes de SaaS a los centros.
- Riesgo con Apple/Google por el enlace de pago a Stripe (guía 3.1.1): antes de subir a las tiendas, quitar el botón de pagar en la app y contratar fuera (correo con enlace de Stripe o web); la app solo muestra el estado del plan. Hay que releer las guías vigentes al subir.

### Pendiente
1. ⬜ Avisos de fin de prueba (7, 3 y 1 días antes).
2. ⬜ Qué pasa al bajar de plan con más clientes que el tope del nuevo.
3. ⬜ Botón de equipo en el inicio del centro (nota `yoclick-todo-team-button-center-home`).
4. ⬜ Centro de prueba con plan Básico.
5. ⬜ Bloqueado por el alta de autónomo: Stripe real, dominio `yoclick.app`, Brevo, columnas de Taxfix.
6. ⬜ Reiniciar el back para cargar el nuevo guard; opcional: suite e2e completa del back y suite completa del front.

## Estado de avance (25 oct 2026, cierre del día)

Leyenda: ✅ hecho · 🟡 parcial · ⬜ pendiente. Esta sección **añade** a la del 21 oct; lo que no aparece aquí no ha cambiado. Back: lint, tsc, 1253 unitarios y e2e de plataforma en verde; front: lint, typecheck y tests en verde. Lo del día está commiteado pero **sin push**.

### Hecho el 25 de octubre
- ✅ **Bonos en la lista de clientes**: estado (sin bono, pendiente, activo, terminado), sesiones restantes y caducidad; el centro ve quién solicitó cada bono.
- ✅ **Buscador por nombre** al iniciar una conversación en Mensajes (sin distinguir tildes).
- ✅ **Cerrar sesión** en rojo con texto blanco para todos los roles; el login con correo sin verificar lleva a la pantalla del código.
- ✅ **Plataforma: pestaña Planes** (Basic/Pro/Premium): centros por estado, ingreso mensual, precios editables y cambio de plan por centro, con auditoría. Tabla global `platform_plans`.
- ✅ **Plataforma: rediseño responsive** (`Panel`, `PlatformTabs` de una sola línea con desplazamiento, tarjetas con texto flexible) y **logos de los centros** en la lista y la ficha.

### Decisiones
- Premium con 20 GiB de vídeo es una suposición (no está en la especificación).
- Cambiar precios no cobra a nadie todavía: falta Stripe Billing (P5).

### Pendiente
1. 🟡 **Probar en el móvil** la zona Plataforma con letra grande, la pestaña Planes y los logos.
2. ⬜ **Fallos de la prueba con nora@yopmail.com** (mañana): push en toda acción de centro, profesor y alumno (citas, bonos, mensajes…); editar clases (hora, anular); selector de hora que no se desliza en Android (revisar iPhone); botón de cerrar en el modal de escanear asistencia; al crear una clase, elegir solo entre los profesores que prestan ese servicio.
3. ⬜ Plataforma P4, P5 y P6 como en la sección del 21 oct.

## Estado de avance (21 oct 2026, cierre del día)

Leyenda: ✅ hecho · 🟡 parcial · ⬜ pendiente. Esta sección **añade** a la del 20 oct; lo que no aparece aquí no ha cambiado. Todo subido con `git push` (back `26c9fee`, front `11abb92`). Back: lint, tsc, 1228 unitarios y 1056 e2e en verde; front: lint, typecheck y 2416 tests en verde (307 suites).

### Hecho el 21 de octubre
- ✅ **Direcciones con sugerencias** mientras se escribe (España y Colombia) y **coordenadas del centro**: proxy en el back con **Geoapify** (la clave `GEOAPIFY_API_KEY` es obligatoria en todos los entornos, el mismo proveedor en desarrollo y producción), campo reutilizable en los formularios, crédito de OpenStreetMap y Geoapify bajo las sugerencias y en las dos pantallas de privacidad, filtro de «Perímetro Urbano».
- ✅ **Menos toques al reservar**: «Repetir tu última cita» en el inicio (clase o hora libre, misma persona, día de la semana y hora) y servicio único ya elegido.
- ✅ **Reserva por hora libre** para negocios de citas (elegir con quién, día y hora; confirmar, cambiar y cancelar) frente a las clases con horario de sala.
- ✅ **Ejemplos de servicios por tipo de negocio** (15 tipos, editables, sin precio) y **4 sectores nuevos de citas** con vocabulario propio: peluquería, estética, fisioterapia y psicología.
- ✅ **Plan de lanzamiento** (`16-plan-de-lanzamiento.md`): fases A a H, qué hace Claude y qué solo puede hacer Robin.
- ✅ **Administración de la plataforma, P1 a P3** (`17-administracion-de-plataforma-y-cobro-del-plan.md`): usuario especial `platform_role` (`admin` o `accountant`) que solo concede el comando `npm run platform:role`, segundo factor obligatorio, auditoría, estadísticas agregadas sin datos personales y zona «Plataforma» en la app (Resumen, Centros, Actividad y Detalle con ampliar prueba, suspender, reactivar y tope de clientes).
- ✅ **Diseño del cobro del plan**: 14 días de prueba con Pro sin tarjeta, Stripe Billing en la web, 7 días de gracia y suspensión; Stripe solo cobra y la factura con VeriFactu la emite un proveedor o el gestor (Stripe Invoicing por sí solo no cumple VeriFactu).

### Decisiones
- La administración vive en la app con un usuario especial; solo cifras agregadas de los clientes finales.
- El gestor tendrá un usuario `accountant` de solo lectura (cobros e informes).
- Yoclick no emite facturas: sería software de facturación certificable.
- VeriFactu: sociedades 1 ene 2027 y resto 1 jul 2027 según la norma vigente; Hacienda prevé aplazarlo hasta oct 2028 pero no hay norma publicada (mirar el BOE).

### Pendiente
1. 🟡 **Probar en el móvil**: direcciones, atajo de repetir cita, reserva por hora libre, ejemplos de servicios y la zona «Plataforma».
2. ⬜ **Plataforma P4**: registro de cobros del plan e informes para el gestor (CSV), usuario `accountant`.
3. ⬜ **Plataforma P5**: Stripe Billing (Checkout, portal, webhooks, estados, barrido y avisos); espera a la cuenta de Stripe, el dominio, Brevo y el proveedor de facturación.
4. ⬜ **Plataforma P6**: pantalla «Mi suscripción» del centro con el estado real.
5. ⬜ **Facturas**: probar Finseed o BeeL en su entorno de pruebas con Stripe y preguntar al gestor qué programa usa.
6. ⬜ Bloque de lanzamiento (`16`): cuentas, infraestructura, CI, Sentry, legal y RGPD de menores, Stripe real, tiendas.
7. ⚠️ Aplicar `npm run db:deploy` en cada entorno (hoy: `20261121090000_platform_admin`); para usar la zona, activar el segundo factor y ejecutar `npm run platform:role -- grant <correo> admin`.

## Estado de avance (20 oct 2026, cierre del día)

Leyenda: ✅ hecho · 🟡 parcial · ⬜ pendiente. Esta sección **añade** a la del 19 oct; lo que no aparece aquí no ha cambiado. Commiteado en ambos repos, sin subir. Back: lint, tsc, 1198 unitarios y 1031 e2e en verde; front: lint, typecheck y 2271 tests en verde.

### Hecho el 20 de octubre
- ✅ **Barra de pestañas ya no tapa el campo del chat** (iPhone y Android).
- ✅ **Lista de espera para el equipo**: ver quién espera en una clase y quitar a alguien; si tenía la oferta, pasa a la siguiente persona. El aviso de oferta explica las 12 horas.
- ✅ **Módulos del centro** (contenido, asistencia, bonos, lista de espera, salas): se apagan desde «Módulos», el servidor responde 409 `MODULE_DISABLED` y la app oculta lo que no toca. Pregunta «¿Cómo trabajas?» al crear el centro (clases, citas o ambas). Ver `15-enfoque-citas-y-modulos.md`.
- ✅ **Margen entre citas** por servicio (0–240 min); los huecos y las citas ocupadas lo respetan.
- ✅ **Menú «Más» más ligero**: lo diario a la vista y el resto en «Más ajustes».
- ✅ **Primeros pasos con avance**: pasos hechos marcados, pasos de módulos apagados ocultos y tarjeta de progreso en el inicio del centro.
- ❌ **Vocabulario editable del centro**: descartado (se mantiene el del sector).

### Pendiente
1. ⬜ Probar en el móvil lo del 19 y el 20 de octubre.
2. ⬜ Menos toques al reservar y «repetir mi última cita».
3. ⬜ Plantillas de servicios por tipo de negocio (solo ejemplos editables), si se quiere.
4. ⬜ Lo pendiente del 19 oct que sigue igual (RGPD de menores, Stripe real, Redis, `yoclick.app`).
5. ⚠️ En cualquier entorno hay que lanzar `npm run db:deploy` en el back para las migraciones nuevas.

---

## Estado de avance (19 oct 2026, cierre del día)

Leyenda: ✅ hecho · 🟡 parcial · ⬜ pendiente. Esta sección **sustituye** a la del 16 oct en lo que cambia. Todo lo de este día está subido (front `3b9afee`, back `2a27665`). Back: lint, tsc, 1185 unitarios y 1005 e2e en verde; front: lint, typecheck y 2240 tests en verde.

### Hecho el 19 de octubre
- ✅ **Invitaciones sin enlace roto**: el mensaje de WhatsApp lleva el nombre del centro y el código (el enlace `yoclick.app/j/…` daba error mientras el dominio no esté publicado).
- ✅ **Segundo factor voluntario desde Ajustes**: botón «Activar» en Seguridad.
- ✅ **Reembolsos**: se hacen en el panel de Stripe del centro; el back guarda lo devuelto (`charge.refunded`) y la lista de cobros dice «Reembolsado». Un reembolso total anula el bono.
- ✅ **Citas bloqueadas tras un reembolso total**: las reservas anteriores se conservan pero no se pueden iniciar ni confirmar (409 `PASS_REQUIRED`) hasta tener un bono nuevo; se ven como «Necesita bono nuevo».
- ✅ **Barra de navegación** respeta «reducir movimiento».
- ✅ **Lista de espera**: clases grupales llenas con «Apuntarme a la lista de espera»; al liberarse una plaza se ofrece a la primera persona, que tiene 12 horas para confirmar (la plaza queda retenida) y si no pasa a la siguiente; avisos y push; «Mis citas» muestra puesto u oferta.
- ✅ **Fallo corregido**: al cancelar un cliente su reserva en una clase grupal suelta, la clase se cancelaba para todos.
- ✅ **Recibos con IVA**: número correlativo por centro y año, IVA del 21 % incluido en el precio de los bonos, pantalla de recibo con PDF para compartir, «Recibos» en Mis bonos y en Cobros online; sin razón social, NIF y dirección fiscal no se pueden activar los cobros online.
- ✅ **Chat en tiempo real** por WebSocket (`/v1/realtime`): avisos sin contenido y recarga por la API; el sondeo queda como red de seguridad.

### Pendiente
1. ⬜ Probar en el móvil: lista de espera (apuntarse, oferta, confirmar), recibos y PDF, chat en tiempo real y el bloqueo de citas tras un reembolso (hace falta reconstruir la app si no se hizo tras `expo-blur`).
2. ⬜ **RGPD de menores** (consentimiento del tutor, acceso y borrado) junto con todo el bloque legal, al final.
3. ⬜ **Stripe real antes de las tiendas**: el webhook de Connect debe escuchar `charge.refunded` y `payment_intent.succeeded`; recrear cuentas antiguas; Apple Pay, `account.updated` y página de retorno.
4. ⬜ Chat en tiempo real con varias instancias de la API: hace falta Redis (hoy el registro está en memoria).
5. ⬜ Lista de espera: vista para el equipo y push con más detalle.
6. ⬜ Publicar `yoclick.app` (enlaces `/j/` e `/i/`, QR con cámara nativa) y volver a poner el enlace en los mensajes.
7. ⬜ Lo del 15 oct que sigue: tutor crea a un menor, aviso de bono a punto de caducar, silenciar/borrar mensajes.

---

## Estado de avance (16 oct 2026, cierre del día)

Leyenda: ✅ hecho · 🟡 parcial · ⬜ pendiente. Esta sección **sustituye** a la del 15 oct en lo que cambia. Todo lo de este día está subido (front `c973f12`, back `e7a64d7`).

### Hecho el 16 de octubre
- ✅ **Agenda del día con alquileres sin profesor** (antes daba 500); `staff` nulo en las sesiones vacías.
- ✅ **Alta sin «Soy…»**: el rol sale de la invitación (código, QR o enlace); sin invitación se crea un centro. Alumnos y profesores entran solo por invitación.
- ✅ **Crear centro** sin color ni logo (se ponen después en Marca) y sin servicios de ejemplo: solo existen los que crea el propietario.
- ✅ **Segundo factor opcional**: solo se exige a quien lo activó; se quitó la pantalla «Protege tu cuenta» del propietario nuevo. Al activarlo, el servidor devuelve una sesión ya verificada y no hace falta volver a entrar (causa del bucle de `mao@`).
- ✅ **Barra de navegación** flotante de cristal con desenfoque (`expo-blur`) que se estrecha al hacer scroll.
- ✅ **Bloqueos de sala y «repetir semana» eliminados** (back y app); el alquiler es una clase de un servicio con «Alquiler» y se paga con bono. La tabla `room_blocks` queda sin usar.
- ✅ «Primeros pasos» actualizado (paso «Crea tus clases») y términos y condiciones (`docs/spec/14-terminos-y-condiciones.md`).

### Pendiente
1. ⬜ Reconstruir la app de desarrollo (`expo-blur` es nativo) y probar en el móvil la barra, el alta de propietario y los alquileres.
2. ⬜ Entrada voluntaria para activar el segundo factor (la pantalla existe pero ya no tiene acceso).
3. ⬜ Reembolsos desde la app en la cuenta de Stripe del centro, sin comisión y con registro de quién y por qué.
4. ⬜ Barra de navegación: respetar «reducir movimiento».
5. ⬜ Lo del 15 oct que sigue pendiente: tutor crea a un menor, RGPD de menores, lista de espera, chat en tiempo real, recibos con IVA, aviso de bono a punto de caducar, silenciar/borrar mensajes.
6. ⬜ Lo pendiente del 14 oct (alta Stripe, cobro de punta a punta, recibos y reembolsos).

---

## Estado de avance (15 oct 2026, cierre del día)

Leyenda: ✅ hecho · 🟡 parcial · ⬜ pendiente. Esta sección **sustituye** a la del 14 oct en lo que cambia; lo de Stripe del 14 oct sigue pendiente igual.

### Hecho el 15 de octubre
- ✅ **Avisos de bono** al gastarse clases (`pass_running_low`, `pass_exhausted`).
- ✅ **Chat** (`docs/spec/11-chat.md`): alumno ↔ profesor ↔ centro, adjuntos, difusión a grupos y clases fijas, contador de no leídos en los tres inicios, aviso `message_received`; los menores solo por su tutor.
- ✅ **Tutores** (`docs/spec/12-tutores.md`): vínculo tutor↔menor, pestaña «Familias», «Cuenta como alumno», actuar en nombre del menor (`X-Acting-For`), avisos del menor copiados al tutor.
- ✅ **Gestión** (`docs/spec/13-gestion-y-clases.md`): tres filas (Crear clase, Crear y editar sala, Crear y editar servicio) con la lista para editar bajo cada formulario; salas solo nombre y aforo.
- ✅ **Crear clase**: ruedas de hora de inicio y fin validadas con el horario del centro y lo ocupado, fecha de inicio y de fin, salas con los colores de la agenda.
- ✅ **Alquileres sin profesor**: casilla `isRental` en el servicio, clases sin profesor, profesor del servicio opcional; no se puede reservar una sesión sin profesor.
- ✅ Matricular y «Nueva cita» solo con bono en vigor para el servicio; botón «Salas y clases/sesiones» según el sector.
- 🟡 Teclado en iOS: medido por la plantilla; falta verificar en iPhone y Android reales.

### Pendiente
1. ⬜ Probar en el móvil todo lo del 15 oct (reiniciar el back por las migraciones nuevas).
2. ⬜ Decidir dónde viven ahora el bloqueo de salas (alquiler/mantenimiento) y «repetir semana»: se quitaron de Gestión y no tienen acceso en la app.
3. ⬜ Tutor crea a un menor desde la app (con aprobación del centro), RGPD de menores, reembolsos en la app, lista de espera, chat en tiempo real, recibos con IVA, aviso de bono a punto de caducar, silenciar/borrar mensajes.
4. ⬜ Lo pendiente del 14 oct (alta Stripe, cobro de punta a punta, e2e de `CENTER_CONTACT_EMAIL_REQUIRED`, recibos y reembolsos).
5. ⬜ Subir los commits con `git push` en los dos repos (34 en el front, 17 en el back).

---

## Estado de avance (14 oct 2026, cierre del día)

Leyenda: ✅ hecho · 🟡 parcial · ⬜ pendiente. Esta sección **sustituye** a la del 13 oct en lo que cambia.

### Hecho el 14 de octubre
- ✅ **Cobro online de bonos y alquileres con Stripe Connect** (API-401 en versión mínima): pagar bono o alquiler con la hoja de pago de Stripe, alta de cobros del centro Premium, listado de cobros, confirmación por webhook y `confirm`.
- ✅ **Alta de cuentas conectadas con Accounts v2** (`/v2/core/accounts` y `/v2/core/account_links`): Stripe ya no deja crear cuentas v1; las cuentas antiguas caen al enlace v1.
- ✅ **Email de contacto obligatorio** para activar cobros: `422 CENTER_CONTACT_EMAIL_REQUIRED` en lugar de un 500.
- ✅ El log del gateway de Stripe muestra el motivo del rechazo (código y mensaje de Stripe).
- ✅ Plugin `@stripe/stripe-react-native` con opciones explícitas (`enableGooglePay: false`).
- ✅ Entorno de pruebas de Stripe preparado: Stripe CLI autorizada para el sandbox, webhook local con `stripe listen`, reconocimiento de responsabilidad por saldo negativo confirmado.

### Pendiente
1. ⬜ **Terminar el alta de «Academia Ninja Mortal»**: pulsar «activar pagos» (ya con Accounts v2), abrir el enlace de Stripe y rellenar con datos de prueba hasta que el centro pase a `ready`.
2. ⬜ **Probar un cobro de punta a punta** con tarjeta `4242 4242 4242 4242` desde el móvil: pedir bono → pagar → webhook → bono activo. Con `stripe listen --events payment_intent.succeeded --forward-to localhost:3000/v1/webhooks/stripe` y `STRIPE_WEBHOOK_SECRET` en `.env`.
3. ⬜ Comprobar que tras el alta la lectura de la cuenta v2 con `GET /v1/accounts/:id` deja el estado en `ready`; si no, leerla con `GET /v2/core/accounts/:id`.
4. ⬜ Test e2e de `CENTER_CONTACT_EMAIL_REQUIRED` en `test/e2e/payments.e2e.spec.ts` y regenerar `openapi.yaml`.
5. ⬜ Recibos con IVA y reembolsos (API-403, 405, 406); avisos al centro cuando se acaba un bono o asiste alguien sin él.
6. ⬜ Lo pendiente del 13 oct que no cambia: probar en el móvil todo lo del 13 oct, fases 2 y 3 de `docs/spec/09`, descontar no presentados con proceso programado, correo a importados, claves push, textos legales, `yoclick.app`.
7. ⬜ Subir los commits con `git push` en los dos repos.

## Estado de avance (13 oct 2026, cierre del día)

Leyenda: ✅ hecho · 🟡 parcial · ⬜ pendiente. Detalle de bonos en `docs/spec/10-bonos.md`.

### Hecho el 13 de octubre
- ✅ **Bonos sin pasarela** (API-402/404 en versión mínima): el centro crea bonos (clases, validez, precio, servicios), el alumno los pide, el centro los activa al cobrar o los asigna desde la ficha, y los puede quitar. Tarjetas como billete con marca de agua del logo del centro.
- ✅ **Descuento del bono**: al confirmar la asistencia (check del profesional o QR), una sola vez; si no va y no cancela, al terminar la clase; si cancela, no. Si el centro apunta a alguien a un grupo se descuenta al instante y se devuelve al cancelar.
- ✅ **Límite al agendar**: el alumno agenda solo lo que le queda menos lo ya agendado; el centro solo apunta a personas con bono y clases.
- ✅ **Alumno**: Día y clase por servicio (el centro fija profesor y sala), varios días hasta el saldo del bono con previsión, cancelar y cambiar de clase, Mis bonos.
- ✅ **Profesor**: agenda estilo iOS (bloques por hora, sin nombres, clases sin alumnos visibles), detalle con foto y check por alumno y «Confirmar asistencia con QR».
- ✅ **Centro**: Inicio con cuadrícula de botones (Agenda, Asignar citas, Salas y horarios, Servicios, Bonos), «Apuntar a la clase» con foto y solo personas con bono, horarios con solapes de sala y profesor y «repetir semana».
- ✅ **Avisos**: borrado lógico (uno o todos) para centro, profesor y alumno; avisos de bono pedido y activado.

### Pendiente
1. ⬜ Probar en el móvil (iOS y Android) todo lo del 13 oct, con la API reiniciada (migraciones `20261101` a `20261104`).
2. ⬜ Cobro online de bonos con Stripe Connect, recibos con IVA y reembolsos (API-401, 403, 405, 406); avisos al centro cuando se acaba un bono o asiste alguien sin él.
3. ⬜ Fase 2 y 3 de `docs/spec/09` (Mi horario del alumno, lista de espera); detalle de una clase sin alumnos en la agenda del profesor.
4. ⬜ Descontar los no presentados con un proceso programado (hoy se hace al consultar los bonos).
5. ⬜ Pendientes de antes: correo a personas importadas, claves push (Apple/FCM), textos legales, publicar `yoclick.app` con los ficheros de asociación.

## Estado de avance (12 oct 2026, cierre del día)

Leyenda: ✅ hecho · 🟡 parcial · ⬜ pendiente. Esta sección **sustituye** a la del 5 oct en lo que cambia; lo que no aparece aquí sigue como se describe más abajo.

### Hecho del 6 al 10 de octubre
- ✅ Agenda del centro con resumen, «Tu marca», salas, horas y equipo en «Servicios y horario»; reprogramar (cliente y equipo); registro por código del centro; avisos push al unirse; escáner de QR y de código (Android incluido).
- ✅ Importación de clientes, informes, push, rutinas (crear, editar, asignar, progreso), disponibilidad del equipo, vídeos (Bunny), solicitudes RGPD y perfil público completo.
- ✅ Biblioteca de contenido (PDF, vídeo e imagen) y asignación por persona; foto de perfil y galería del profesional; límites de subida; selector de color de marca.
- ✅ Apariencia Premium (fondo y color de colmena), pantalla de bienvenida como el prototipo.
- ✅ Salas con profesor, citas privadas y grupales, «quién asignó» cada cita, pestaña Gestión, agenda por salas (`docs/spec/08`).

### Hecho el 12 de octubre (`docs/spec/09`, fase 1)
- ✅ **API**: horarios fijos semanales (`session_schedules`, materialización a 8 semanas), grupos fijos (`schedule_enrollments`, citas de matrícula sin consumir bono), bloqueos de espacio, cancelar un día, `services.mode` (privado / grupo / ambos), servicio fijo por espacio, avisos y errores nuevos. Migraciones `20261031090000` y `20261031090100`.
- ✅ **App, Gestión**: espacios (aforo, profesor y servicio fijos), horario fijo por días de la semana, nuevo y editar horario, matricular y dar de baja, terminar horario, bloqueos por espacio, modo del servicio en el editor.
- ✅ **App, agenda del centro**: franja de la semana con un punto de color por sala, leyenda de salas (letra y color) con filtro por sala y por servicio, fichas por hora con borde rojo (quedan plazas) o verde (completa), bloqueos y días cancelados, «Cancelar este día».
- ✅ **App, citas**: «Apuntar a la clase» desde el detalle de una sala (solo se elige al alumno).
- ✅ **Teclado**: las pantallas se desplazan hasta el campo enfocado y las hojas inferiores suben con el teclado (iOS y Android).
- ✅ Los mocks de Orval ya no bloquean el typecheck (excluidos en `tsconfig.json`).

### Pendiente
1. **Fase 2 de `docs/spec/09` (alumno)**: disponibilidad por servicio que descuenta espacios y bloqueos, apuntarse a una sesión o reservar privada con espacio automático, anular con antelación, «Mi horario» (grupo fijo) y espacio y profesor en los push.
2. **Fase 3**: lista de espera, reserva con aprobación del centro, registro de clase por grupo, solicitud de clase fija por el alumno.
3. Probar en el móvil (iOS y Android) todo lo del 12 oct: Gestión, horarios, matrícula, bloqueos, agenda con filtros, teclado.
4. Pendientes de antes: correo a las personas importadas, claves push (Apple/FCM), textos legales, recompilar el development build de Android si cambian módulos nativos, publicar `yoclick.app` con los ficheros de asociación.
5. Subir los commits con `git push` en los dos repos (son locales hasta entonces).

## Estado de avance (5 oct 2026, cierre del día)

Leyenda: ✅ hecho · 🟡 parcial · ⬜ pendiente. Basado en el historial de git de cada repo.

### yoclick-api
- ✅ API-0 Cimientos · ✅ API-1 Identidad (registro, login, refresh rotatorio, recuperar contraseña, 2FA obligatorio para owner/admin, cuenta propia).
- 🟡 API-2 Centros y unirse: unirse por código, búsqueda, branding, alta de centro con prueba y logo, ajustes y equipo con invitaciones (código y enlace) hechos. Falta ubicación en la búsqueda.
- 🟡 API-3 Agenda y reservas: servicios individuales (CRUD y archivado), disponibilidad, reservas con concurrencia (EXCLUDE + cerrojos), cancelación con política, agenda del día, **registro de clase** (iniciar y terminar con temporizador, informe para el propietario) y **asistencia por QR** (`POST /me/checkin-code` con JWT firmado de 5 min y `POST /attendance/check-in`, columnas `checked_in_*`). Falta: clases en grupo y lista de espera, cierre administrativo de una clase sin cerrar, mostrar `checkedInAt` en la reserva.
- ⬜ API-4 Cobros · API-5 Personas, contenido y avisos · API-6 Endurecimiento y salida.

### yoclick-app
- ✅ APP-001 a APP-006 y APP-008. ⬜ APP-007 Storybook.
- 🟡 APP-1 Sistema de diseño: añadidos `SegmentedControl`, `SlotButton`, `DayPill`, `ProgressRing`, `TabBar` (píldora activa, etiqueta en una línea), `AppointmentCard`, `ConfirmSheet`, `QrCard`, `SessionTimerDisplay`, `LogoLoader`, `ChoiceCard`. Faltan SearchBar, KPI, Toast, StepIndicator y plantillas Form/List/Wizard.
- ✅ APP-2 Unirse y autenticación (sin Apple/Google ni E2E Maestro) y APP-9 alta de centro (datos, logo, código para compartir, 2FA del propietario).
- 🟡 APP-3 Cliente: inicio **alineado con el prototipo** (cabecera, «Próxima cita», «Esta semana», «Mi QR de acceso», bono, accesos rápidos), barra Inicio/Reservar/Mis citas/Practicar/Perfil, **Mi QR de acceso** real. Reservar (pasos 1 a 4), «reservada» y «Mis citas» están hechos pero **sin revisar contra el prototipo renderizado**: el usuario indicó que no coinciden.
- 🟡 APP-5 Instructor: agenda, clase con temporizador, **escáner de asistencia**; la agenda sigue sin el estilo del prototipo (`iagenda`, `iclass`).
- 🟡 APP-6 Administración: pestañas Agenda, Registro de clases y **Más** con Servicios y horario (lista, editor, archivar, horario en lectura), Invita a tu equipo e Invita a tus clientes. Falta: Datos del centro (sin campos fiscales en la API), editar horario, Clientes, Marca, equipo con lista de miembros.
- ⬜ APP-4, APP-7, APP-8 y fases 2+ (Practicar y bonos solo como pantallas «muy pronto» o estado vacío).

### Pendientes para mañana, en orden
1. **Revisar con el prototipo renderizado** (`docs/design/prototipo-yoclick.html`, truco: copiar el HTML, cambiar `render();` final por `jump("ID");` y capturar con Edge headless) las pantallas ya construidas: `book1..book4`, `booked`, `appts`, `iagenda`, `iclass`, `aagenda` y la barra del instructor (Agenda, Clientes, Avisos, Perfil). Seguir el prototipo tal cual salvo que el usuario diga otra cosa; fondo blanco.
2. Perfil del alumno real (hoy es un marcador con cerrar sesión) y pestaña «Mis clientes» del instructor.
3. Clases en grupo y lista de espera (el usuario eligió antes las pantallas de administración).
4. Vista de privacidad en el app switcher para el QR (SEC-M6; requiere una dependencia nueva: pedir permiso).
5. Mostrar la llegada (`checkedInAt`) en la agenda del instructor y administración.

### Pendientes transversales (decisiones o acciones tuyas)
- Reiniciar la API en el puerto 3000 tras cada cambio del backend; la migración `20261007090000_add_booking_check_in` ya está aplicada en la base local. `npm run db:seed` restablece las contraseñas demo.
- Si Metro da errores de tipos de rutas, arrancar con `npx expo start --clear` (la caché de rutas tipadas se queda vieja).
- Reinstalar el development build si cambian módulos nativos; id de bundle definitivo, URL de staging y cuentas de Apple y Google (`STORE_CHECKLIST.md`).
- Code signing de EAS Update y gitleaks en el equipo.
- Comprobar en dispositivo el texto al 200 % y los nuevos QR (generar y escanear con dos cuentas).
- Subir cambios con `git push` en los dos repos (los commits son locales hasta entonces).

---

## yoclick-api

### API-0 · Cimientos
| Ticket | Alcance | Aceptación |
|---|---|---|
| API-001 | Repo: Node.js 22 LTS + NestJS 11 + Fastify, TS strict, pnpm, ESLint/Prettier, Vitest, Husky + lint-staged, gitleaks, commitlint | `pnpm lint && pnpm test && pnpm build` en verde en CI |
| API-002 | Docker Compose: Postgres 16, Redis 7, MinIO, Mailpit, Stripe CLI | `docker compose up` + `pnpm dev` levantan la API en `:3000` con `/health` |
| API-003 | Config tipada con zod (falla al arrancar si falta una variable), logger pino con redacción, OpenTelemetry, Sentry | Variables inválidas → el proceso no arranca con mensaje claro |
| API-004 | Prisma ORM + PostgreSQL: `schema.prisma`, Prisma Migrate, roles `yoclick_app` (sin BYPASSRLS) y `yoclick_migrator`, `TenantPrismaService.runInTenantContext()` con `set_config(..., true)`, primera migración con RLS en SQL | Test con Testcontainers: RLS bloquea lecturas cruzadas; un repositorio que use el cliente global falla el lint |
| API-005 | Errores RFC 9457, `ValidationPipe` zod, paginación por cursor, `Idempotency-Key` (Redis), ETag | Tests unitarios de cada helper |
| API-006 | OpenAPI generado (`nestjs-zod` / `@nestjs/swagger`) → `openapi.yaml` commiteado; CI compara y ejecuta `oasdiff` | Cambiar un DTO sin regenerar → CI falla |
| API-007 | Guards: `AuthGuard`, `TenantGuard`, `RolesGuard` deny-by-default + test que recorre rutas | Ruta sin decorador → test falla (SEC-53) |
| API-008 | Seed (`prisma/seed.ts`): 4 centros demo, plantillas de sector, usuarios demo por rol | `pnpm prisma db seed` idempotente |

### API-1 · Identidad
| Ticket | Alcance | Aceptación |
|---|---|---|
| API-101 | Registro + verificación de email + consentimientos | Sin consentimiento de privacidad → `400 CONSENT_REQUIRED` |
| API-102 | Login, refresh rotativo con detección de reutilización, logout | Reusar refresh revocado revoca la familia (test) |
| API-103 | Apple / Google con nonce y JWKS | Tokens con `aud` erróneo → `401` |
| API-104 | Recuperar contraseña (respuesta constante, token de un uso 30 min) | Tiempo de respuesta similar exista o no el email |
| API-105 | MFA TOTP para owner/admin | Admin sin MFA no accede a rutas `/admin` |
| API-106 | `/me`, avatar (URL prefirmada), push tokens, preferencias | — |
| API-107 | Rate limiting (login, forgot, mfa, join) | 11.º intento en 1 min → `429` |
| API-108 | Exportar datos (job) y eliminar cuenta (reauth + anonimización diferida) | JSON contiene todos los datos del usuario y nada de otros |

### API-2 · Centros y unirse
| Ticket | Alcance | Aceptación |
|---|---|---|
| API-201 | Onboarding de centro: crea centro `trial`, owner, servicios sugeridos del sector, código de unión | Pantallas `o1`…`o5`, `osvc`, `overify` y `odone` del prototipo cubiertas |
| API-202 | Branding público (`/branding`), logo (PNG/WebP o SVG saneado) | SVG con `<script>` → rechazado |
| API-203 | Unirse: código, búsqueda geográfica, invitación; límite de clientes del plan | Código inválido → `404 JOIN_CODE_INVALID`; límite → `CLIENT_LIMIT_REACHED` |
| API-204 | Mis centros (`/me/memberships`) | — |
| API-205 | Datos del centro, horario, festivos, política de cancelación (ETag) | `If-Match` viejo → `412` |
| API-206 | Equipo: invitar staff, roles y permisos | Staff no puede invitar admins |

### API-3 · Agenda y reservas
| Ticket | Alcance | Aceptación |
|---|---|---|
| API-301 | Servicios CRUD (editor completo), salas, staff asignado | Sala solapada → aviso de conflicto |
| API-302 | Disponibilidad del staff y ausencias | — |
| API-303 | Cálculo de huecos (`/availability`) con zona horaria del centro, festivos, ausencias, antelación mínima | Tests de tabla con cambio de horario de verano |
| API-304 | Clases en grupo: programar, recurrencia semanal, plazas | — |
| API-305 | Crear reserva (transacción, `for update`, `EXCLUDE`, idempotencia) | 50 peticiones concurrentes por la última plaza → 1 confirmada, 49 `SESSION_FULL`/`waitlisted` |
| API-306 | Cancelar y reprogramar con política (devolución de sesión o dinero) | Fuera de plazo → `withinPolicy=false`, no devuelve sesión |
| API-307 | Lista de espera + promoción automática (job) | Al cancelar, el nº 1 pasa a confirmada y recibe aviso |
| API-308 | Agenda del staff; mover / reasignar / cancelar con aviso | El cliente recibe notificación |
| API-309 | Check-in QR (token Ed25519 60 s, un uso) y pasar lista | Token reutilizado → `409`; de otro centro → `404` |
| API-310 | `.ics` de una reserva | Valida en calendarios iOS y Google |
| API-312 | Registro de clase con temporizador: el profesional inicia y termina la clase (`start`/`end`), el servidor guarda `startedAt`, `endedAt` y la duración real, y el propietario ve el registro (previsto frente a real, sin cerrar) | Solo el profesional asignado (o admin/owner) puede iniciar o cerrar; cerrar dos veces es idempotente; el listado de registros exige MFA |
| API-311 | Familias: reservar para un menor | Tutor ve las reservas del menor; otro cliente no |

### API-4 · Cobros
| Ticket | Alcance | Aceptación |
|---|---|---|
| API-401 | Stripe Connect Express: onboarding del centro, estado de la cuenta | Centro sin KYC completo no puede cobrar online |
| API-402 | Tarifas (bonos, cuotas, matrícula) y sincronización con Stripe Prices | — |
| API-403 | Compra de tarifa (PaymentIntent / Subscription) + webhooks idempotentes | Webhook duplicado no duplica saldo |
| API-404 | Pago al reservar, descuento de bono, monedero, cupones | Saldo insuficiente → `NO_BALANCE` |
| API-405 | Recibos/facturas con IVA, numeración correlativa, PDF | Numeración sin huecos bajo concurrencia |
| API-406 | Reembolsos | — |
| API-407 | Suscripción del centro a Yoclick (Stripe Billing, portal, fin de prueba, impago) | `past_due` → banner en admin; 14 días → `suspended` (solo lectura) |

### API-5 · Personas, contenido y avisos
| Ticket | Alcance |
|---|---|
| API-501 | Clientes: lista, ficha, nivel, notas, grupos |
| API-502 | Salud con cifrado de campo y auditoría |
| API-503 | Importación CSV con previsualización |
| API-504 | Perfiles del staff, subida de vídeo, worker de validación/transcodificación, revisión del centro |
| API-505 | Opiniones verificadas (solo con asistencia) |
| API-506 | Notificaciones: bandeja, push (Expo), correo, recordatorios |
| API-507 | Panel e informes con CSV seguro |
| API-508 | Registro de actividad (`audit_log`) |

### API-6 · Endurecimiento y salida
| Ticket | Alcance |
|---|---|
| API-601 | Revisión SEC-40…75 completa, Semgrep/CodeQL, Trivy |
| API-602 | Pruebas de carga (k6): 200 reservas/min con p95 < 600 ms |
| API-603 | Copias, PITR, prueba de restauración, runbook de incidentes |
| API-604 | Pentest externo y corrección |

---

## yoclick-app

### APP-0 · Cimientos
| Ticket | Alcance | Aceptación |
|---|---|---|
| APP-001 | `create-expo-app` (TS), Expo Router, estructura de carpetas del `CLAUDE.md`, alias `@/`, ESLint/Prettier, Jest + RNTL, Husky, gitleaks | `pnpm lint && pnpm typecheck && pnpm test` en CI |
| APP-002 | `app.config.ts` con entornos y *app variants* (Premium), EAS profiles (`development`, `preview`, `production`) | Build `preview` instalable en iOS y Android |
| APP-003 | Tokens (`design/tokens.json` → `src/shared/theme/tokens.ts`), `brand-engine` con tests de los vectores, `ThemeProvider` claro/oscuro/sistema | Los 3 vectores de `brand-engine.md` pasan |
| APP-004 | Fuentes Archivo + Figtree (`expo-font`), escala tipográfica, soporte de escalado de fuente | Texto a 200 % sin cortes en átomos |
| APP-005 | Cliente API generado con Orval (+ MSW + zod), `apiClient` con auth, `X-Center-Id`, refresh con cola, Idempotency-Key | Un 401 dispara un único refresh aunque haya 5 peticiones en vuelo |
| APP-006 | i18n (es-ES), formateadores (fecha «jue 1 oct», hora 24 h, moneda «12.480 €»), vocabulario de sector `t('staff')` | — |
| APP-007 | Storybook RN con todos los átomos y moléculas en claro y oscuro con 3 marcas | — |
| APP-008 | Estados compartidos: `ScreenSkeleton`, `EmptyState`, `ErrorState`, `OfflineBanner`, `ForceUpdateGate` (pantallas `st*`) | — |

### APP-1 · Sistema de diseño (átomos → organismos)
Átomos: `Text`, `Icon`, `Button` (primary, secondary, outline, ghost, danger; tamaños), `IconButton`, `Avatar` (foto o iniciales), `Badge`/`StatusPill`, `Chip`, `Input`, `Checkbox`, `Switch`, `Radio`, `Divider`, `Skeleton`, `Spinner`, `Logo`.
Moléculas: `FormField`, `SearchBar`, `ListItem`, `SlotButton`, `DayPill`, `ProgressRing`, `KPI`, `ConsentCheckbox`, `Toast`, `SegmentedControl`, `StepIndicator`.
Organismos: `AppointmentCard`, `NextAppointmentCard`, `ServiceCard`, `StaffCard`, `SlotPicker`, `DayStrip`, `BottomSheet`, `ConfirmSheet`, `TabBar`, `Header`, `NotificationItem`, `QrCard`, `QrScanner`, `ClientRow`, `AgendaTimeline`, `RateCard`, `PaymentSummary`.
Plantillas: `ScreenTemplate`, `FormTemplate`, `ListTemplate`, `WizardTemplate`, `TabsTemplate`.

Aceptación de cada componente: historia en Storybook, test RNTL (render, accesibilidad: `accessibilityRole`, `accessibilityLabel`, estado), objetivo táctil ≥ 44, contraste vía tokens, sin colores literales.

### APP-2 · Unirse y autenticación
`jstart`, `jqr`, `jcode`, `jsearch`, `jconfirm`, `welcome`, `login`, `reg1`, `reg2`, recuperar contraseña, Apple/Google, verificación, MFA (admin), `jcenters`. Aceptación: flujo E2E Maestro «unirse con código NORTE7 → registrarse → ver Inicio con marca de Studio Norte».

### APP-3 · Cliente: reservar
`home`, `book1`→`booked`, `appts`, reprogramar, cancelar con política, lista de espera, clases en grupo con plazas, «¿Para quién?», `.ics`, QR de acceso. Aceptación: E2E «reservar, cancelar dentro de plazo, ver la sesión devuelta».

### APP-4 · Cobros
Tarifas, compra con PaymentSheet (tarjeta, Apple Pay, Google Pay), monedero, cupón, pago al reservar, recibos. Aceptación: E2E en modo test de Stripe; la UI no marca «pagado» hasta confirmación del servidor.

### APP-5 · Staff
`iagenda`, `iedit`, **iniciar y terminar la clase con temporizador (el tiempo sale de la hora de inicio del servidor)**, escáner QR (`iscan`), pasar lista, disponibilidad y ausencias, ficha de cliente, perfil profesional con subida de vídeo. Aceptación: E2E «escanear QR válido → asistencia marcada; QR caducado → error claro».

### APP-6 · Admin
Panel, servicios (editor completo), tarifas, clientes + importación CSV, grupos, equipo y permisos, invitar (QR, enlace, código, cartel), marca (logo y color con vista previa AA), horario y festivos, revisión de perfiles, informes, seguridad (2FA, actividad), legal, suscripción.

### APP-7 · Onboarding de centro
`overify`, `o1`…`o5`, `osvc`, `odone`: cuenta del propietario, tipo de centro, marca, servicios sugeridos, equipo, plan y prueba.

### APP-8 · Perfil, privacidad, avisos
`profile`, foto (cámara/galería, recorte 240 px), datos, consentimientos, notificaciones y preferencias, exportar datos, eliminar cuenta (escribir ELIMINAR), ayuda, tema.

### APP-9 · Endurecimiento y salida
Revisión SEC-01…37, Privacy Manifest y Data Safety, pinning, integridad (App Attest / Play Integrity) en escáner y pagos, accesibilidad con VoiceOver y TalkBack, rendimiento (arranque < 2,5 s), Maestro en CI, fichas de tienda, build Premium de un centro piloto.

---

## Hitos

| Hito | Contenido | Señal de terminado |
|---|---|---|
| H1 · Esqueleto | API-0, API-1, APP-0, APP-1 | Login real en la app contra staging |
| H2 · Reservar | API-2, API-3, APP-2, APP-3, APP-5 (agenda + QR) | Un centro piloto reserva y pasa lista sin papel |
| H3 · Cobrar | API-4, APP-4 | Primer cobro real en modo live con un centro |
| H4 · Gestionar | API-5, APP-6, APP-7, APP-8 | Un centro se da de alta solo y opera una semana |
| H5 · Lanzar | API-6, APP-9 | Pentest cerrado, apps aprobadas en tiendas |
