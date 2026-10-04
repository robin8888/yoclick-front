# Checklist de publicación · App Store y Google Play

La app se publica en **las dos tiendas**. Marca cada casilla cuando esté hecha y enlaza la evidencia.
Los ids `SEC-xx` están en `docs/spec/04-seguridad.md`.

## 1 · Cuentas y firma

- [ ] Apple Developer Program (organización, no personal; requiere D-U-N-S) — 99 USD/año
- [ ] Google Play Console (organización; verificación de identidad y D-U-N-S) — 25 USD, pago único
- [ ] Cuenta Expo/EAS de la organización, credenciales gestionadas por EAS (SEC-07)
- [ ] Play App Signing activado; clave de subida guardada en EAS
- [ ] App Store Connect API key para `eas submit` (guardada en EAS, nunca en el repo)
- [ ] Cuenta de servicio de Google Play para `eas submit` (guardada en EAS)
- [ ] Google Play: prueba cerrada obligatoria antes de producción en cuentas personales nuevas (12 testers, 14 días); comprobar si aplica a la cuenta de organización

## 2 · Identificadores (no se pueden cambiar tras publicar)

- [ ] Decidir y registrar el identificador definitivo. `com.yoclick.app` es **provisional** (`config/app-config/resolve-app-identity.ts`)
- [ ] Registrar el App ID en Apple con las capacidades: Associated Domains, Push Notifications, Sign in with Apple
- [ ] Crear la ficha de la app en App Store Connect y en Play Console con ese mismo id
- [ ] Publicar `apple-app-site-association` y `assetlinks.json` en `https://yoclick.app/.well-known/` (universal links `/j/{code}` e `/i/{token}`)
- [ ] Sustituir el placeholder de huella SHA-256 del certificado de firma en `assetlinks.json`
- [ ] Premium: cada centro con su propio id (`com.yoclick.center.<slug>` por defecto) y su cuenta de desarrollador; mismo checklist por cada centro

## 3 · Legal y privacidad

- [ ] URL de política de privacidad pública (obligatoria en ambas tiendas)
- [ ] URL de soporte y email de contacto
- [ ] Términos de uso / EULA
- [ ] **Eliminar cuenta dentro de la app** (Ajustes › Privacidad) — obligatorio en Apple 5.1.1(v) y en Google Play; además URL web de borrado de cuenta para el formulario de Play (SEC-26)
- [ ] Exportar mis datos accesible desde la app (SEC-26)
- [ ] Apple **Privacy Manifest** (`PrivacyInfo.xcprivacy`): razones de las APIs de motivo requerido y tipos de datos recogidos; revisar también los de cada SDK (SEC-24)
- [ ] Apple **Privacy Nutrition Labels** (App Privacy en App Store Connect) coherentes con el manifiesto
- [ ] Google Play **Data Safety**: datos recogidos, cifrado en tránsito, borrado a petición (SEC-24)
- [ ] Declarar que no hay SDKs de publicidad ni tracking; sin IDFA (App Tracking Transparency no necesaria si no hay tracking)
- [ ] `ITSAppUsesNonExemptEncryption = false` (ya en la config; confirmar que solo se usa HTTPS/cripto del sistema)
- [ ] Textos de permisos en español revisados: cámara, galería, ubicación «al usar la app» (SEC-22)

## 4 · Reglas de las tiendas

- [ ] **Sign in with Apple** obligatorio si se ofrece Google u otro login social (Apple 4.8) (SEC-11)
- [ ] Pagos: bonos y reservas son servicios físicos presenciales, por lo que se pueden cobrar con Stripe sin In-App Purchase; documentar la justificación para App Review (Apple 3.1.3(e))
- [ ] **Cuenta demo para revisión** (centro DEMO con usuario cliente, usuario staff y datos de ejemplo) en las notas de revisión de Apple y en Play Console
- [ ] Notas de revisión: cómo unirse a un centro con el código demo y cómo funciona el QR
- [ ] Apps de salud: si hay datos de salud, revisar la declaración de Google Play «Health apps» y las guías de Apple 5.1.3
- [ ] Menores de edad: coherente con el consentimiento de tutor (SEC-23) y la clasificación por edad
- [ ] Dirección de contacto del desarrollador visible (Play: obligatoria para cuentas de organización)

## 5 · Ficha de la tienda

- [ ] Nombre (30 caracteres), subtítulo (iOS, 30), descripción corta (Play, 80) y descripción larga, en es-ES
- [ ] Palabras clave (iOS, 100 caracteres) y categoría (Salud y forma física / Estilo de vida)
- [ ] **Clasificación por edad**: cuestionario IARC en Play y cuestionario de Apple (rangos nuevos 4+/9+/13+/16+/18+); declarar contenido generado por usuarios y compras
- [ ] Icono: iOS 1024×1024 PNG sin transparencia ni esquinas redondeadas; Play 512×512 PNG
- [ ] Icono adaptativo Android: primer plano 1024×1024 con el contenido en la zona segura central
- [ ] Gráfico de funciones Play: 1024×500 PNG/JPG
- [ ] Capturas iPhone: 6,9" (1320×2868) obligatorias, 6,5" (1284×2778) si se quiere cubrir; entre 3 y 10
- [ ] Capturas iPad: solo si `supportsTablet` pasa a `true` (ahora es `false`)
- [ ] Capturas Android: teléfono, mínimo 2, 16:9 o 9:16, lado entre 320 y 3840 px
- [ ] Vídeo de vista previa (opcional)
- [ ] Capturas con datos ficticios marcados DEMO y sin PII real

## 6 · Build y calidad

- [ ] Perfil `production` de EAS compila con `APP_ENV=production` y `API_URL=https://api.yoclick.app` (el build falla si no, SEC-31)
- [ ] `npm run lint && npm run typecheck && npm test` en verde; `npm audit --omit=dev` revisado
- [ ] `allowBackup=false`, sin tráfico en claro, ATS sin excepciones en producción (SEC-30)
- [ ] Sin dev client ni menús de depuración en el binario de producción (SEC-32)
- [ ] Hermes y R8 activados; sin `console.*` ni source maps en el binario (SEC-28)
- [ ] Build `preview` instalable en iOS (TestFlight/ad hoc) y Android (APK/AAB interno) probado en dispositivo real
- [ ] TestFlight (prueba interna) y prueba interna de Play antes de enviar a revisión
- [ ] Universal links verificados en dispositivo real
- [ ] Accesibilidad revisada: VoiceOver/TalkBack y texto al 200 %
- [ ] Certificate pinning con pin de respaldo antes de activar datos de salud (SEC-20)
- [ ] Sentry con `beforeSend` que limpia PII (SEC-25)
- [ ] Versionado: `version` en `app.config.ts`; `buildNumber`/`versionCode` autoincrementados por EAS (`appVersionSource: remote`)
