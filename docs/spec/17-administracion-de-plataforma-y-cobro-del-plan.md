# 17 · Administración de la plataforma y cobro del plan

Diseño del 21 oct 2026. Cubre dos cosas que hasta ahora no existían: (1) **cómo paga el centro su plan** (14 días gratis y después cobro) y (2) **tu administración como dueño de la plataforma** (estadísticas, gestión de centros e informes para el gestor, con un usuario especial). Reemplaza lo que `00-producto.md` dejaba como «Superadmin de plataforma, web, F2».

Los precios, plazos y condiciones de terceros (Stripe, proveedores de facturación, Apple, Hacienda) vienen de sus páginas a fecha de hoy y **hay que reconfirmarlos antes de contratar**. Esto no es asesoramiento fiscal ni jurídico.

## 1 · Decisiones tomadas

| # | Decisión | Fecha |
|---|---|---|
| 1 | La administración de la plataforma vive **dentro de la app**, para un usuario especial. El panel web de escritorio queda para después, reutilizando la misma API. | 21 oct |
| 2 | Se ven **solo cifras agregadas** de los clientes finales de cada centro: nunca nombres ni datos personales. Yoclick es solo el software (encargado de tratamiento). | 21 oct |
| 3 | El cobro del plan es **Stripe Billing en la web**, no dentro de la app (decisión del 5 oct). Mientras no esté montado, los cobros se **registran a mano** y sirven ya para los primeros pilotos. | 21 oct |
| 4 | El centro **prueba 14 días con el plan Pro, sin tarjeta**, y elige su plan (mensual o anual) antes de que acabe. El primer cobro es el día en que termina la prueba. | 21 oct |
| 5 | **Stripe solo cobra.** La factura legal con VeriFactu la emite el programa de facturación de tu gestor o un proveedor conectado a Stripe (Finseed, BeeL u otro). Yoclick no emite facturas. | 21 oct |
| 6 | Si falla el cobro o acaba la prueba sin plan: **7 días de gracia**; después el centro queda **suspendido**. Al pagar se reactiva en el acto. | 21 oct |

## 2 · Cobro del plan

### 2.1 · Planes (fuente única)

| Plan | Mensual | Anual (€/mes) | Clientes activos | Documentos (PDF) | Vídeo |
|---|---|---|---|---|---|
| Básico | 39 € | 32 € | 150 | 1 GB | no |
| Pro | 79 € | 65 € | 500 | 5 GB | no |
| Premium | 149 € | 124 € | ilimitado | 20 GB | sí (tope propio) |

IVA aparte. Premium suma **290 € de alta, una sola vez**, en la primera factura. Los importes **no se escriben en el código**: salen de los *Price* de Stripe y de una tabla de planes en el backend. Al activar o cambiar de plan, el backend ajusta los límites del centro (`max_clients`, `document_storage_limit_bytes`, `video_storage_limit_bytes`) desde esa tabla. Queda pendiente corregir `00-producto.md`, que da vídeo a Pro y la decisión del 7 oct lo dejó solo en Premium.

### 2.2 · Ciclo de vida

```
Alta ──► PRUEBA (14 d, plan Pro, sin tarjeta)
              │ el propietario elige plan y pone tarjeta (en cualquier momento)
              ▼
         SUSCRIPCIÓN PROGRAMADA ──(acaba la prueba)──► ACTIVO ◄──── pago correcto
              │ no elige plan                              │ cobro fallido
              ▼                                            ▼
         GRACIA 7 d (past_due) ◄──────────────────────────┘
              │ sigue sin pagar a los 7 días
              ▼
         SUSPENDIDO ──(paga)──► ACTIVO
              │ cancelación o plazo largo sin pagar
              ▼
         CANCELADO ──(plazo legal)──► datos anonimizados
```

| Estado | Qué ve y puede hacer el centro | Qué se le avisa |
|---|---|---|
| **Prueba** | Todo el plan Pro. Cobrar online exige completar Stripe Connect (SEC-57). | Correo a los 7, 3 y 1 días del fin, con el enlace para elegir plan. |
| **Activo** | Todo. | Recibo del cobro (el de Stripe sale desactivado; ver 2.6). |
| **Gracia (7 d)** | Todo funciona; la app muestra un aviso al propietario y a la administración. | Correo el día del fallo, a los 3 y a los 6 días. Stripe reintenta el cobro solo (*Smart Retries*). |
| **Suspendido** | Sin reservas ni altas nuevas. **Los clientes conservan el acceso a lo suyo y pueden exportar sus datos** (RGPD). El propietario puede pagar y reactivar. | Correo al suspender. |
| **Cancelado** | Igual que suspendido; los datos se conservan un plazo y luego se anonimizan. | Correo de confirmación. El plazo lo fija el asesor legal. |

- **Acaba la prueba sin plan elegido:** entra en gracia 7 días (mismo flujo) y después queda suspendido.
- **Tope de clientes del plan:** bloquea altas nuevas (`CLIENT_LIMIT_REACHED`), nunca expulsa a quien ya está.
- **Cambio de plan:** subir es inmediato, con prorrateo; bajar se aplica en la siguiente renovación y **solo si los clientes activos caben en el nuevo tope**.
- **Cancelar:** sigue activo hasta el final del periodo pagado.

### 2.3 · Cómo paga el centro (sin pantalla de pago en la app)

La app solo **informa** del estado del plan; no tiene botón de comprar (decisión del 5 oct, para evitar las comisiones de las tiendas y por las guías de App Review, que hay que revisar antes de publicar).

1. En el alta se crea el centro con `status = trial`, `trial_ends_at = +14 d` y plan de prueba Pro.
2. Un correo con enlace llega al propietario a los 7, 3 y 1 días del fin, y desde «Mi suscripción» en la app se le indica que gestione su plan en la web.
3. El enlace lleva a una **página mínima en `yoclick.app`** (la misma web que ya hace falta para los textos legales y los enlaces universales) con los tres planes y el interruptor mensual/anual. El enlace lleva un **token firmado, de vida corta y de un solo uso**, que identifica al centro; no hay login web.
4. Al elegir, la API crea una **sesión de Stripe Checkout** y redirige a ella:
   - suscripción con el *Price* elegido y `trial_end = trial_ends_at` del centro, de modo que **no se cobra hasta que acaba la prueba** (si ya pasó, se cobra al momento);
   - recogida obligatoria de **NIF/CIF y dirección fiscal** del centro, necesarios para que la factura sea completa;
   - correo del propietario prellenado y `centerId` en los metadatos;
   - para Premium, la cuota de alta de 290 € como línea adicional de la primera factura.
5. Para cambiar de plan, cambiar la tarjeta o cancelar se usa el **portal del cliente de Stripe**, de nuevo con un enlace firmado.
6. IVA: precios sin IVA y 21 % añadido. Decidir con el gestor si se usa Stripe Tax o un tipo fijo.

### 2.4 · Avisos de Stripe (webhooks)

Endpoint propio de la cuenta de Yoclick, con **secreto distinto del webhook de Connect** y firma verificada. Cada evento se guarda por su id para procesarlo **una sola vez**.

| Evento de Stripe | Qué hace el backend |
|---|---|
| `checkout.session.completed` | Guarda cliente y suscripción de Stripe, plan y periodo; aplica los límites del plan. |
| `invoice.paid` | Centro a `active`; crea el **cobro** (base, IVA, total, comisión de Stripe); limpia la gracia. |
| `invoice.payment_failed` | Centro a `past_due`; fija el fin de la gracia a +7 d; avisa por correo. |
| `customer.subscription.updated` | Cambio de plan, o cancelación a fin de periodo. |
| `customer.subscription.deleted` | Centro a cancelado/suspendido según el caso. |

Un **barrido periódico** (como el de la lista de espera) pasa a `suspended` los centros cuya gracia ya venció y envía los avisos de fin de prueba. Lo que Stripe dice manda sobre lo que diga la app; el móvil nunca decide el estado.

### 2.5 · Costes de Stripe (estimación)

Tarjeta europea estándar 1,5 % + 0,25 €, más Stripe Billing 0,7 % del volumen de suscripciones. Un Pro de 79 € + IVA ≈ 95,59 € cuesta **unos 2,35 € por cobro (≈2,5 %)**. No consta si el 0,7 % va sobre importe con o sin IVA. La comisión real de cada cobro se guarda para el informe del gestor.

### 2.6 · Facturas (VeriFactu)

- **Stripe Invoicing no cumple VeriFactu por sí solo** (no encadena, no pone el QR de la AEAT ni envía el registro). Stripe no afirma lo contrario y recomienda aplicaciones externas.
- Plazos vigentes: sociedades 1 ene 2027 y resto, autónomos incluidos, 1 jul 2027 (RD-ley 15/2025). Hacienda comunicó el 5 oct 2026 que **prevé** aplazar hasta oct 2028, pero **no hay norma publicada**: mirar el BOE.
- Flujo: Stripe cobra → un proveedor (Finseed desde 14,95 €/mes con 250 facturas; BeeL desde 19,90 €/mes con 250; o el programa de tu gestor) emite la factura con QR y la registra en la AEAT → la referencia se guarda en el cobro. Con Stripe Billing, las facturas y el correo de Stripe se dejan como proforma/apagados para no duplicar.
- Yoclick **no** emite facturas ni numera: sería software de facturación certificable.

## 3 · Administración de la plataforma

### 3.1 · Usuarios especiales

Se añade `users.platform_role` con tres valores: `none` (por defecto), `admin` (tú) y `accountant` (tu gestor, **solo lectura** de Cobros e Informes).

- **No se concede por la API.** Solo con un script de línea de comandos que usa la conexión de migraciones (`npm run platform:grant -- correo rol`); revocar es otro comando. Un *trigger* en la base de datos rechaza cualquier cambio de esa columna hecho por el rol de la API.
- **Segundo factor obligatorio**: sin sesión verificada con código de un solo uso, las rutas responden `MFA_REQUIRED`.
- No necesita pertenecer a ningún centro. Al entrar va directo a la zona «Plataforma».
- Cada acción de cambio queda en un **registro de auditoría** (quién, qué, a qué centro, cuándo y detalle).
- Límite de peticiones propio y sesiones cortas.

### 3.2 · Qué datos puede leer (RLS)

La base aísla por centro (Row Level Security). Para la plataforma se añade un contexto `app.platform_role` que solo fija el guard tras comprobar usuario, rol y segundo factor. Políticas de **solo lectura** sobre `centers`, `memberships` y `bookings`, y de escritura limitada sobre `centers` (estado, prueba, límites). **El código solo ejecuta agregados** (contar, sumar, agrupar) y los tests comprueban que ninguna respuesta lleva nombres, correos, teléfonos ni identificadores de personas. Es un riesgo aceptado y documentado: la defensa está en el guard, el segundo factor, la auditoría y que no existe ningún endpoint que devuelva filas de personas.

### 3.3 · Pantallas (zona «Plataforma» de la app)

| Pantalla | Para qué | Quién |
|---|---|---|
| **Resumen** | Centros por estado, ingresos recurrentes mensuales (MRR), altas del mes, pruebas que acaban en 7 días, centros en gracia, clientes finales totales, reservas de los últimos 30 días, evolución de los últimos 12 meses. | admin |
| **Centros** | Lista con buscador y filtros (estado, plan, sector, ciudad). Cada fila: plan, estado, clientes activos frente al tope, equipo, reservas 30 d, última actividad. | admin |
| **Detalle de centro** | Datos del negocio, plan y precio, fin de prueba, límites, historial de cobros y de acciones. Acciones: **ampliar la prueba**, **suspender o reactivar**, **cambiar límites**, **asignar plan y precio**, registrar un cobro manual, nota interna. | admin |
| **Cobros** | Lista por mes de lo cobrado: centro, base, IVA, total, comisión, estado, referencia de la factura. Marcar «factura emitida» y guardar su número. Registrar cobros manuales (primeros pilotos). | admin y accountant (lectura) |
| **Informes para el gestor** | Resumen mensual y trimestral: base, IVA repercutido, total, nº de cobros, comisiones de Stripe; altas y bajas. **Exportar CSV** (y PDF) y compartirlo. | admin y accountant |
| **Seguridad y actividad** | Segundo factor, sesiones abiertas y registro de auditoría. | admin |

### 3.4 · Informe para el gestor

Columnas del CSV: fecha de cobro, periodo, centro, razón social, NIF, base imponible, tipo de IVA, cuota, total, comisión de Stripe, método, referencia de factura, id de Stripe. Resumen trimestral con totales de base e IVA para apoyar la declaración del trimestre. **La app no presenta impuestos ni emite facturas**: entrega los datos ordenados a tu gestor.

### 3.5 · Definiciones de las cifras

- **Cliente activo**: membresía con rol cliente y estado activo.
- **MRR**: suma de los precios mensuales (los anuales divididos entre 12) de los centros con suscripción `active` o en gracia.
- **Pruebas que acaban**: centros en `trial` cuyo `trial_ends_at` cae en los próximos 7 días.
- **Reservas 30 d**: reservas no canceladas con inicio en los últimos 30 días.

## 4 · Datos nuevos (backend)

| Tabla / columna | Contenido |
|---|---|
| `users.platform_role` | `none`, `admin`, `accountant`. |
| `platform_center_billing` | Un perfil por centro: plan, periodicidad, precio mensual, datos fiscales (razón social, NIF, dirección, correo), ids de cliente y suscripción de Stripe, fecha de alta, fin de la gracia, notas. |
| `platform_charges` | Cada cobro: centro, periodo, concepto, base, tipo de IVA en puntos básicos, cuota, total, comisión de Stripe, estado (`pending`, `paid`, `void`), origen (`manual`, `stripe`), referencia de factura, id de Stripe, fechas. |
| `platform_audit_log` | Acción, quién, centro afectado, detalle (JSON), fecha. Solo se inserta. |
| `platform_webhook_events` | Id de cada evento de Stripe ya procesado. |

Todas con RLS forzado y política solo para el contexto de plataforma; sin `DELETE` para el rol de la API.

## 5 · API (propuesta)

Todas bajo `/v1/platform/*`, solo con segundo factor y rol de plataforma; `accountant` solo lee `charges` y `reports`.

- `GET overview` · `GET centers` · `GET centers/:id` · `PATCH centers/:id` (estado, prueba, límites)
- `PUT centers/:id/billing` · `GET charges` · `POST charges` · `PATCH charges/:id`
- `GET reports/monthly` · `GET reports/export.csv`
- `GET audit-log`
- Para los centros: `POST /v1/centers/:id/subscription/links` (propietario; devuelve el enlace firmado a la web) y el endpoint público de webhooks de Stripe.

## 6 · Fases de construcción

| Fase | Contenido | Necesita de ti |
|---|---|---|
| **P1** ✅ | Rol de plataforma, guard con segundo factor, script de concesión, auditoría, políticas RLS. | Nada |
| **P2** ✅ | Estadísticas: resumen y lista de centros con agregados. | Nada |
| **P3** ✅ | App: zona «Plataforma» con Resumen, Centros, Actividad y Detalle (acciones). | Nada |
| **P4** | Registro de cobros, perfil de facturación, informes y exportación CSV; usuario del gestor. | Tus datos fiscales y confirmar columnas con el gestor |
| **P5** | Stripe Billing: tabla de planes, sesiones de Checkout y portal, webhooks, estados y barrido, avisos por correo, límites por plan. | Cuenta de Stripe de Yoclick, productos y precios, Brevo con dominio verificado, página mínima en `yoclick.app` |
| **P6** | Pantalla «Mi suscripción» del centro con el estado real, avisos de gracia y suspensión. | Texto legal revisado |

P1 a P4 son independientes de cualquier cuenta externa y sirven ya para llevar los primeros pilotos a mano. P5 espera a Stripe, al dominio y al proveedor de facturación (fases B y E de `16-plan-de-lanzamiento.md`).

### Cómo activarlo (P1 a P3, ya construidas)

1. En el backend, aplicar la migración: `npm run db:deploy`.
2. Tener una cuenta normal de Yoclick con el **segundo factor activado** (Ajustes › Seguridad).
3. Concederte el rol con el comando de migraciones: `npm run platform:role -- grant tu@correo.com admin`. Para tu gestor: `grant gestor@correo.com accountant`. `revoke` lo quita y `list` enseña quién lo tiene.
4. Entrar en la app con esa cuenta: va directo a «Plataforma». Si falta el segundo factor, la app lo explica y lleva a activarlo.

Hecho en P1 a P3: `users.platform_role` con *trigger* que impide cambiarlo desde la API; tabla de auditoría de solo inserción; políticas RLS de solo lectura para `centers`, `memberships`, `bookings` y `class_sessions` y de cambio en `centers`; guard `@PlatformRoles` con segundo factor obligatorio (un usuario sin rol recibe 404); endpoints `GET overview`, `GET centers`, `GET centers/:id`, `PATCH centers/:id` y `GET audit-log`; y en la app, las pantallas Resumen, Centros (con búsqueda y filtro por estado), Actividad y Detalle de centro (ampliar prueba, suspender, reactivar, cambiar tope). El usuario `accountant` ya entra a su zona, pero solo ve un aviso hasta P4.

## 7 · Pendiente de confirmar

- Revisión de App Review: que la app informe del plan sin botón de compra ni enlace de pago dentro.
- IVA: Stripe Tax o tipo fijo del 21 %; cómo trata Stripe Billing las facturas de importe con IVA.
- Plazo de conservación de datos tras cancelar (asesor legal).
- Qué proveedor de facturación usa tu gestor; si ya tiene programa con VeriFactu y conexión a Stripe, no hace falta contratar otro.
- Columnas exactas del informe y periodicidad (mensual o trimestral) que quiere tu gestor.
