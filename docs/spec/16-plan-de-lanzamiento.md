# Plan de lanzamiento · del código a las tiendas

Creado el 21 oct 2026. Complementa `STORE_CHECKLIST.md` (casillas de las tiendas) y `docs/spec/05-plan-de-trabajo.md`.
Ordena todo lo que falta por **dependencias**, y separa lo que hace Claude en el código de lo que **solo puede hacer Robin** (cuentas, dinero, firma, asesor). Los plazos y precios de Apple, Google, D-U-N-S, hosting y Stripe **no están verificados**: confírmalos en cada web antes de decidir.

## 0 · Dónde estamos (comprobado en el código)

| Hecho | Estado |
|---|---|
| App y API con todo el producto (reservas por clase y por hora, bonos, chat, lista de espera, recibos, tutores, rutinas, vídeos, direcciones) | ✅ construido y con tests; **falta probarlo en el móvil** |
| Borrar cuenta y exportar mis datos dentro de la app | ✅ (`features/privacy`) |
| `allowBackup=false`, `NSPrivacyTracking=false`, universal links configurados | ✅ en `config/app-config` |
| Login social (Google, Apple) | no existe → **Sign in with Apple no hace falta** |
| `/health` y mensajes en tiempo real (en memoria, una sola instancia) | ✅ |
| Perfiles de build EAS `development`, `preview`, `production` | ✅ con `API_URL` de staging y producción **que aún no existen** |
| Identificador de la app `com.yoclick.app` | ⚠️ **provisional**; no se puede cambiar tras publicar |
| CI (GitHub Actions) en los dos repos | ❌ no hay |
| Sentry (errores) y certificate pinning | ❌ no hay |
| Servidor, base de datos gestionada, dominio `yoclick.app`, correo real, Stripe real, push real | ❌ nada contratado todavía |
| Texto legal real (privacidad, términos, encargado de tratamiento) | ❌ sin escribir; `14-terminos-y-condiciones.md` es solo el borrador de decisiones |

## 1 · Camino crítico

```
Decisiones (nombre, cuenta de desarrollador)
   ├─► Cuentas de Apple/Google ──► fichas ──► builds de prueba ──► revisión
   └─► Dominio yoclick.app ──► API en la nube ──► servicios reales ──► builds preview/production
Asesor legal ──► textos públicos ──► URLs para las fichas  (la revisión de las tiendas los exige)
```

Lo que más tarda **no es código**: verificar la organización (D-U-N-S), la prueba cerrada de Google y el asesor legal. Conviene arrancarlos el primer día, en paralelo con el resto.

## 2 · Fases

### Fase A · Decisiones y cuentas (Robin; empezar ya, corren en paralelo)

- [ ] **A1 · Nombre y forma jurídica.** Apple y Google distinguen cuenta personal y de organización (esta última pide D-U-N-S); comprueba cuál admite tu situación. Decídelo con el gestor antes de abrir ninguna cuenta; hoy eres autónomo con tarifa plana.
- [ ] **A2 · Identificador definitivo** (`com.yoclick.app` u otro) **antes** de crear nada en las tiendas.
- [ ] **A3 · Cuentas:** Apple Developer, Google Play Console, Expo/EAS de la organización (casillas de `STORE_CHECKLIST.md` §1). Si Google exige prueba cerrada (12 personas, 14 días), esas 2 semanas son camino crítico: pedir testers pronto.
- [ ] **A4 · Dominio `yoclick.app`:** comprarlo y apuntar el DNS (o confirmar que ya es tuyo).
- [ ] **A5 · Asesor legal:** encargarle ya los textos (Fase D); es el que más tarda en volver.

### Fase B · Infraestructura (Claude prepara; Robin contrata y pega las claves)

- [ ] **B1 · Hosting de la API en la UE** (`01-arquitectura.md` sugiere Fly.io `mad`/`cdg`, Render Frankfurt, Scaleway o AWS `eu-south-2`) y **Postgres gestionado** con copias cifradas y recuperación a un punto del tiempo. *Claude:* `Dockerfile`, script de migraciones (`db:deploy`) y guía de despliegue. *Robin:* elegir proveedor y contratar.
- [ ] **B2 · Dos entornos:** `staging` (`api-staging.yoclick.app`, seed demo) y `producción` (`api.yoclick.app`). Los perfiles de EAS ya apuntan a esas URLs.
- [ ] **B3 · Secretos** en el gestor del proveedor, nunca en el repo: claves JWT de producción y `JWT_KEY_ID` distinto de `dev-1`, `AUTH_CODE_PEPPER_BASE64`, `MFA_ENCRYPTION_KEY_BASE64`, `DATABASE_URL` con TLS (`sslmode=require`) y rol `yoclick_app`, `GEOAPIFY_API_KEY`. El backend **se niega a arrancar en producción** si falta o es débil algo de esto (ya implementado).
- [ ] **B4 · Servicios reales en producción:**
  - Correo: **Brevo** con dominio remitente verificado (SPF y DKIM) → `EMAIL_PROVIDER=brevo`.
  - Push: `PUSH_PROVIDER=expo` + credenciales APNs (Apple) y FCM (Google) en EAS.
  - Vídeo y PDF: Bunny de pago (la prueba gratuita caduca) → `VIDEO_PROVIDER=bunny`, `FILE_STORAGE_PROVIDER=bunny`.
  - Direcciones: `GEOAPIFY_API_KEY` y revisar el plan frente al tráfico real.
  - Pagos: ver Fase E.
- [ ] **B5 · CI en los dos repos** (*Claude*): lint, typecheck, tests, `npm audit --omit=dev`; en el back, comprobar que `openapi.yaml` coincide con el generado y detectar cambios incompatibles.
- [ ] **B6 · Ficheros públicos de los enlaces** en `https://yoclick.app/.well-known/` (`apple-app-site-association`, `assetlinks.json` con la huella real de firma) y las páginas de retorno de Stripe (`/stripe/return`, `/stripe/refresh`). *Claude* genera los ficheros; hace falta el sitio publicado.
- [ ] **B7 · Redis:** hoy el tiempo real vive en memoria, así que **con una sola instancia no hace falta**. Solo se añade si se corre más de una instancia de la API o si hay trabajos en segundo plano (campañas). Recomendación: lanzar con **una instancia** y no contratar Redis hasta necesitarlo.

### Fase C · Seguridad y observabilidad (Claude)

- [ ] **C1 · Sentry** en app y API con `beforeSend` que limpie datos personales (SEC-25). Dependencia nueva: justificar en el PR y reconstruir el dev client.
- [ ] **C2 · Alertas:** monitor externo de `/health`, aviso de errores, y copia de seguridad **restaurada una vez de prueba** (una copia no probada no cuenta).
- [ ] **C3 · Certificate pinning con pin de respaldo** (SEC-20): obligatorio antes de activar datos de salud; decidir si se hace en el primer lanzamiento o se pospone sin datos de salud.
- [ ] **C4 · Repaso de seguridad** con la lista OWASP Mobile 2024 de `CLAUDE.md` y `04-seguridad.md`; `allowBackup`, ATS, Hermes/R8 y sin `console.*` en el binario (casillas de `STORE_CHECKLIST.md` §6).
- [ ] **C5 · Actualizaciones OTA con firma de código** (`expo-updates` ya está instalado; falta activar la firma).

### Fase D · Legal y RGPD (Robin con el asesor; Claude integra los textos)

- [ ] **D1 · Política de privacidad, términos de uso y contrato de encargado de tratamiento**, con el principio ya decidido: el **centro** responde de cobros, devoluciones e impuestos ante su cliente; Yoclick es solo software y no cobra comisión (`14-terminos-y-condiciones.md`).
- [ ] **D2 · RGPD de menores** (consentimiento del tutor, acceso y borrado): las pantallas de tutores existen; falta que el asesor valide el texto y el flujo.
- [ ] **D3 · Registro de tratamientos** y plazos de conservación.
- [ ] **D4 · Direcciones y mapas:** mencionar a Geoapify/OpenStreetMap en la política (ya se cita en pantalla).
- [ ] **D5 · URLs públicas** de privacidad, soporte, términos y borrado de cuenta (las exigen ambas fichas). *Claude:* páginas estáticas con el texto final.
- [ ] **D6 · Facturación de Yoclick a los centros** (diseño completo en `17-administracion-de-plataforma-y-cobro-del-plan.md`; Stripe cobra y un proveedor o el gestor emite la factura con VeriFactu): el plan (39/79/149 €) se cobra **en la web con Stripe Billing**, no dentro de la app. Falta decidir si el primer piloto se factura a mano y la web de alta/pago se construye después (ver Fase F).

### Fase E · Pagos reales (cuando B esté hecho)

Lista ya acordada (memoria «prelaunch Stripe»), pospuesta a propósito hasta aquí:
- [ ] Cuenta Stripe de Yoclick con Connect, y `PAYMENT_PROVIDER=stripe` con `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` y `STRIPE_CONNECT_WEBHOOK_SECRET`.
- [ ] El webhook de Connect escucha `payment_intent.succeeded`, `charge.refunded` y `account.updated`.
- [ ] Recrear las cuentas conectadas creadas antes de los cobros directos; identificador de comerciante de Apple Pay; páginas `/stripe/return` y `/stripe/refresh`.
- [ ] Datos fiscales del centro (NIF, dirección) y precios con IVA incluido (decidido el 19 oct).
- [ ] Prueba de punta a punta con tarjeta de prueba y después un cobro y una devolución reales de importe pequeño.
- [ ] Aviso para App Review de por qué no hay compra dentro de la app (servicios presenciales, Apple 3.1.3(e)).

### Fase F · Producto antes de tiendas (Robin prueba, Claude arregla)

- [ ] **F1 · Recorrido completo en móvil real** de lo construido el 19, 20 y 21 oct (lista de espera, recibos, chat en tiempo real, reservas bloqueadas, módulos, «¿Cómo trabajas?», margen entre citas, Primeros pasos, direcciones, atajo de repetir cita, reserva por hora libre en una peluquería, ejemplos de servicios). Apuntar fallos; Claude los arregla en tandas.
- [ ] **F2 · Centro DEMO** con usuario cliente y usuario del equipo, y datos de ejemplo, para la revisión de Apple y Google (hay un `demo-seeder` en el back).
- [ ] **F3 · Decidir el pequeño hueco de producto de la web:** el centro nuevo se da de alta desde la app (prueba de 14 días sin tarjeta); el cobro del plan puede quedarse manual para los primeros pilotos.
- [ ] **F4 · Planes y vídeo:** `00-producto.md` dice que Pro tiene «perfiles con vídeo» y la decisión del 7 oct lo dejó solo en Premium; corregir uno de los dos antes de publicar los planes.

### Fase G · Tiendas

- [ ] **G1 · Fichas** de App Store Connect y Play Console con el identificador definitivo (`STORE_CHECKLIST.md` §2 y §5): nombre, textos en es-ES, capturas con datos ficticios, clasificación por edad, iconos.
- [ ] **G2 · Declaraciones de privacidad** coherentes con el código: Privacy Manifest, Nutrition Labels de Apple y Data Safety de Google (§3).
- [ ] **G3 · Builds `preview`** en TestFlight y prueba interna de Play, instalados en móviles reales (iOS y Android), con universal links verificados.
- [ ] **G4 · Prueba cerrada de Google** si te la exigen (ver A3).
- [ ] **G5 · Notas de revisión** con la cuenta demo, el código de centro y cómo funciona el QR.
- [ ] **G6 · Build `production`** y `eas submit`; responder a lo que pida la revisión.

### Fase H · Lanzamiento suave

- [ ] **H1 · 1 a 3 centros piloto** conocidos (uno de clases, uno de citas) antes de abrirlo al público; el invitado entra con su código o enlace.
- [ ] **H2 · Soporte:** buzón de correo, tiempos de respuesta y plantilla de respuesta para solicitudes RGPD (plazo legal).
- [ ] **H3 · Plan de marcha atrás:** cómo volver a la versión anterior de la API (migraciones compatibles hacia atrás) y qué hacer si una build OTA falla.
- [ ] **H4 · Primeras dos semanas:** revisar errores en Sentry a diario, el uso de Geoapify, Brevo y Bunny, y los costes reales frente a los de `yoclick-pricing-and-costs`.

## 3 · Primeros pasos recomendados (esta semana)

1. **Tú:** A1 (forma jurídica y cuenta de organización), A2 (identificador), A4 (dominio) y A5 (contactar al asesor). Son decisiones y trámites con espera.
2. **Tú:** F1, probar en el móvil. Lo que salga alimenta la siguiente tanda de arreglos.
3. **Claude:** B5 (CI), B1 (Dockerfile y guía de despliegue), C1 (Sentry) y el borrador de páginas públicas de D5, que no dependen de ninguna cuenta.
4. **Después:** con dominio y hosting, B2 a B4 y B6; con la cuenta de Apple/Google, G1 a G3.

## 4 · Costes recurrentes conocidos

Cifras de `STORE_CHECKLIST.md` y de la memoria del proyecto; **a confirmar antes de comprometerse**: Apple Developer 99 USD/año, Google Play 25 USD (pago único), cuota de autónomo y gestor (ver `yoclick-pricing-and-costs`). El resto (hosting, base de datos, Bunny, Brevo, Sentry) depende del proveedor elegido; Geoapify arranca en el plan gratuito.

## 5 · Qué no hace falta para el primer lanzamiento

- Redis (una instancia basta), tablets (`supportsTablet=false`), apps Premium por centro (cada una necesita su propia cuenta y ficha; después del lanzamiento compartido), login social, compras dentro de la app y campañas/cupones.
