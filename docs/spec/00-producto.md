# 00 · Producto

## Qué es Yoclick

Plataforma SaaS de **reservas y gestión en marca blanca** para cualquier centro con clases o citas, clientes o alumnos e instructores o profesores: gimnasios, estudios de entrenamiento, readaptación, box, yoga y pilates, academias (idiomas, refuerzo, oposiciones), baile, artes marciales, música y cocina.

- El centro paga una **suscripción mensual** a Yoclick.
- El cliente final **no ve Yoclick**: ve el logo, el nombre y el color de su centro.
- Yoclick solo aparece en: pantallas de «Unirse a un centro» (marca neutra), alta de centro nuevo y panel web de plataforma.

## Distribución (cómo llega la app al cliente)

| Plan | App | Icono en el móvil | Cómo se une el cliente |
|---|---|---|---|
| Básico · Pro | Una app compartida «Yoclick» en App Store y Google Play | El de Yoclick | QR, código de 6 caracteres (p. ej. `NORTE7`), búsqueda o enlace de invitación (universal link) |
| Premium | Compilación propia por centro (mismo código, *app variant* de Expo) | El del centro | Ya entra con su centro fijado |

- Un cliente puede pertenecer a **varios centros** («Mis centros») con una sola cuenta.
- Premium se publica desde la **cuenta de desarrollador del centro** (Apple 4.2.6 rechaza clones publicados desde una sola cuenta).
- **Un solo backend y una sola base de datos multi-tenant** (no una base por centro), aislada con `center_id` + Row Level Security.

## Perfiles

| Perfil | Dónde | Qué hace (MVP) |
|---|---|---|
| **Cliente / alumno** | App | Se une a un centro, se registra, reserva (individual o clase en grupo), paga, cancela, lista de espera, QR de acceso, avisos, perfil y foto, familias (reservar para un hijo), privacidad y borrar cuenta |
| **Instructor / profesor** | App | Agenda del día, mover / reasignar / cancelar citas, pasar lista y **escanear QR de asistencia**, disponibilidad y ausencias, ficha del cliente (con permiso), su perfil público con vídeo |
| **Administrador del centro** | App (y web en F2) | Panel, servicios (editor completo), tarifas y bonos, clientes e importación CSV, grupos, equipo y permisos, invitar clientes, marca (logo, color), horario y festivos, informes, cobros, seguridad, legal |
| **Alta de centro** | App | Autoservicio: cuenta del propietario, tipo de centro, marca, servicios, equipo, plan y prueba de 14 días |
| **Superadmin de plataforma** | Web 1440 px (`yoclick-web`, F2) | Centros, suscripciones, soporte con acceso auditado, plantillas por sector, textos legales, integraciones |

## Alcance

**MVP (Fase 1)** — 76 pantallas marcadas `MVP` en `design/pantallas.md`:

1. Unirse a un centro (QR, código, búsqueda, enlace) y Mis centros.
2. Autenticación: email + contraseña, Sign in with Apple, Google; recuperación; 2FA para admins.
3. Reservas: servicios individuales y clases en grupo con plazas, lista de espera, reprogramar, cancelar con política.
4. Cobros: tarifas (bono, cuota, matrícula), monedero, pago con Stripe (tarjeta, Apple Pay, Google Pay; Bizum vía Stripe cuando esté disponible), cupones, recibos con IVA.
5. Asistencia: QR del cliente firmado y rotativo; escaneo del instructor; pasar lista.
6. Fichas de cliente, grupos, notas del equipo, salud con consentimiento explícito.
7. Familias: cuenta de tutor y menores con consentimiento parental (< 14 años).
8. Perfiles públicos del equipo con vídeo de presentación, moderados por el centro.
9. Administración: servicios, tarifas, equipo y roles, marca, horario, invitaciones, importación CSV, informes básicos con exportación CSV.
10. Avisos push y correo; añadir al calendario (.ics).
11. Privacidad: consentimientos separados, exportar mis datos (JSON), eliminar cuenta en la app.
12. Estados: esqueletos, vacíos, error con reintento, sin conexión, actualización obligatoria.

**F2+** (no construir en el MVP, pero no cerrar la puerta): chat, campañas y «trae a un amigo», idioma inglés visible, zona de entrenamiento / contenidos / rutinas, informes avanzados, web pública de reservas, panel de plataforma web, WhatsApp, VeriFactu (obligatorio en 2027: enero sociedades, julio autónomos — **planificar para F2**).

## Vocabulario por tipo de centro

El tipo de centro **no cambia el diseño**; cambia palabras, niveles y contenidos sugeridos. Nunca escribir «gimnasio», «entrenar» o «instructor» fijos en pantallas compartidas: usar la plantilla del sector (`sector_templates` en BD, ver `02-modelo-de-datos.md`).

| id | Nombre | Familia | Equipo (sing. / pl.) | Clientes | Sesiones | Pestaña de contenido | Niveles |
|---|---|---|---|---|---|---|---|
| `gym` | Gimnasio | Deporte | instructor / instructores | cliente / clientes | sesiones | Entrenar | Inicio · Base · Avanzado |
| `estudio` | Estudio de entrenamiento | Deporte | instructor | cliente | sesiones | Entrenar | Inicio · Base · Avanzado |
| `readap` | Centro de readaptación | Deporte | profesional | cliente | sesiones | Entrenar | Inicio · Base · Avanzado |
| `box` | Box / funcional | Deporte | coach / coaches | cliente | sesiones | Entrenar | Inicio · Base · Avanzado |
| `yoga` | Yoga y pilates | Deporte* | profesor | alumno | clases | Practicar | Iniciación · Intermedio · Avanzado |
| `academia` | Academia (idiomas, refuerzo, oposiciones) | Academia | profesor | alumno | clases | Estudiar | Básico · Intermedio · Avanzado |
| `baile` | Academia de baile | Academia | profesor | alumno | clases | Practicar | Iniciación · Intermedio · Avanzado |
| `marciales` | Artes marciales | Academia | maestro / maestros | alumno | clases | Practicar | Principiante · Intermedio · Avanzado |
| `musica` | Escuela de música | Academia | profesor | alumno | clases | Practicar | Iniciación · Intermedio · Avanzado |
| `cocina` | Escuela de cocina | Academia | chef / chefs | alumno | clases | Aprender | Iniciación · Intermedio · Avanzado |
| `otro` | Otro centro con clases o citas | Otros | profesional | cliente | clases | Contenido | Básico · Intermedio · Avanzado |

\* Yoga se agrupa con Deporte en el selector pero usa vocabulario de academia.

Cada plantilla incluye además: necesidades, objetivos del registro, grupos sugeridos, servicios sugeridos (nombre + duración) y biblioteca de contenidos de ejemplo. Los valores completos están en el prototipo (`design/prototipo-yoclick.html`, objeto `SECTORS`) y se cargan como *seed*.

## Planes y precios (propuesta)

| Plan | Mensual | Anual (€/mes) | Límite de clientes activos | Incluye |
|---|---|---|---|---|
| Básico | 39 € | 32 € | 150 | App compartida, reservas, cobros, 1 sede |
| Pro | 79 € | 65 € | 500 | + grupos, familias, perfiles con vídeo, informes, importación |
| Premium | 149 € | 124 € | Ilimitado | + app propia con su icono (pago único de alta 290 €) |

IVA no incluido. Prueba de 14 días sin tarjeta. En el código, los precios **nunca se escriben a mano**: vienen de la tabla `plans` y de los *Price* de Stripe.

## Modelo de negocio y ciclo de vida

**Dos flujos de dinero independientes.** (1) Centro → Yoclick: la suscripción del plan, con Stripe Billing. (2) Alumno → centro: bonos, cuotas y clases, con Stripe Connect (cuenta Express por centro); Yoclick no custodia fondos.

**Decisión (5 oct 2026): la suscripción de Yoclick se cobra en la web (Stripe Billing), no dentro de la app.** Motivo: las tiendas exigen su sistema de compras (15–30 %) para servicios digitales vendidos dentro de la app, y el cliente es un negocio que necesita factura con IVA (VeriFactu en 2027). La app solo muestra el estado del plan; los avisos de fin de prueba y de impago van por correo, sin enlazar al pago desde la app. Los cobros de alumnos a su centro (servicios del mundo real) sí van por Stripe dentro de la app. Revisar las guías de App Review vigentes antes de publicar.

**Roles.** La cuenta es de la persona; el rol es de cada centro. Propietario: se es al crear el centro. Instructor: solo por invitación (enlace o código). Alumno: se une con QR, código, búsqueda o enlace. El «Soy…» del registro solo decide la primera pantalla tras entrar; nunca da permisos.

**Ciclo de vida del centro** (propuesta pendiente de validar):

| Estado | Qué pasa |
|---|---|
| Prueba (14 días, sin tarjeta) | Todo funciona salvo cobrar online hasta completar Stripe Connect (SEC-57). Avisos a los 7, 3 y 1 días. |
| Activo | Suscripción pagada. |
| Impago | Se reintenta el cobro unos días; el panel avisa y la clientela sigue reservando. |
| Suspendido | Sin reservas ni altas nuevas; los datos se conservan; el propietario puede reactivar. |
| Cancelado | Datos conservados un periodo definido y luego anonimizados. |

La clientela nunca pierde el acceso a sus propias reservas y datos aunque el centro esté suspendido (acceso y exportación, RGPD). El límite de clientes activos del plan bloquea las altas nuevas (`CLIENT_LIMIT_REACHED`), nunca expulsa a quien ya está.

## Datos demo

Cuatro centros ficticios (`seed`), marcados como demo:

| Centro | Tipo | Color | Código |
|---|---|---|---|
| Studio Norte (Madrid) | estudio | #E4572E | NORTE7 |
| Forja Readaptación (Valencia) | readap | #2446C7 | FORJA2 |
| Kiné Lab (Bilbao) | box | #C8F031 | KINE24 |
| Compás Escuela de Baile (Sevilla) | baile | #7A3FE0 | COMPAS |

## Tono

Español de España, tuteo, mayúscula solo inicial, botones con verbo en infinitivo, fechas «jue 1 oct», horas 24 h, «12.480 €». Sin emoji. Detalle completo en `design/sistema-de-diseno.md`.
