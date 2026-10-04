# CLAUDE.md · yoclick-app

App móvil marca blanca de Yoclick (iOS y Android) con Expo + React Native + TypeScript. Lee esto entero antes de cada tarea. La especificación está en `docs/spec/` (incluida `06-clean-code.md`, obligatoria) y el diseño en `docs/design/` (abre `docs/design/prototipo-yoclick.html` para ver cada pantalla; los ids de pantalla están en `docs/design/pantallas.md`).

## Comandos

```bash
pnpm i                 # instalar (nunca npm/yarn)
pnpm start             # Expo dev server (dev client)
pnpm ios | pnpm android
pnpm lint              # ESLint + Prettier check
pnpm typecheck         # tsc --noEmit
pnpm test              # Jest + RNTL
pnpm test:e2e          # Maestro (requiere build de dev)
pnpm storybook         # Storybook RN
pnpm api:gen           # Orval: docs/api/openapi.yaml → src/shared/api/generated
```

Antes de dar una tarea por terminada: `pnpm lint && pnpm typecheck && pnpm test` en verde.

## Stack (no cambiar sin ADR en `docs/adr/`)

Expo SDK estable más reciente · Expo Router (typed routes) · TypeScript strict · TanStack Query v5 · Zustand · react-hook-form + zod · Orval (cliente + hooks + MSW + zod) · expo-secure-store · i18next · Reanimated · FlashList · expo-image · expo-camera · expo-notifications · @stripe/stripe-react-native · Jest + RNTL · Maestro · Storybook RN.

## Estructura de carpetas

```
app/                              # SOLO rutas (Expo Router). Ficheros finos: importan una Screen de features/
  _layout.tsx                     # providers raíz
  join/…  (auth)/…  (client)/(tabs)/…  (staff)/(tabs)/…  (admin)/…  (onboarding)/…  settings/…
src/
  ui/                             # Sistema de diseño (Atomic Design) — sin lógica de negocio, sin llamadas a la API
    atoms/        Button/ Text/ Icon/ Avatar/ Badge/ Chip/ Input/ Checkbox/ Switch/ Skeleton/ …
    molecules/    FormField/ ListItem/ SlotButton/ DayPill/ ProgressRing/ ConsentCheckbox/ Toast/ …
    organisms/    AppointmentCard/ SlotPicker/ BottomSheet/ ConfirmSheet/ TabBar/ QrCard/ QrScanner/ …
    templates/    ScreenTemplate/ FormTemplate/ ListTemplate/ WizardTemplate/
  features/                       # Un módulo por dominio de negocio
    auth/ join/ booking/ payments/ attendance/ staff-agenda/ clients/ services/ team/ branding/ onboarding/ profile/ notifications/ reports/
      screens/        # componentes de pantalla (componen organisms/templates + hooks)
      components/     # componentes específicos de la feature (si no son reutilizables globalmente)
      hooks/          # useBookSlot(), useCancelBooking()… envuelven hooks generados
      model/          # tipos de dominio, mappers DTO→modelo, reglas puras + tests
      schemas/        # zod de formularios
      index.ts        # API pública de la feature (lo único que otras features pueden importar)
  shared/
    api/            client.ts (fetch + auth + X-Center-Id + idempotencia), generated/ (NO editar)
    auth/           session store, secure storage, refresh queue
    theme/          tokens.ts, brand-engine.ts, ThemeProvider, useTheme()
    i18n/           es-ES.json, en.json, sector vocabulary
    lib/            format (fechas, moneda), logger, analytics (no-op por defecto)
    storage/        secure.ts (único acceso a SecureStore), public-cache.ts (único acceso a AsyncStorage)
    hooks/          useReducedMotion, useNetwork, useAppState…
  test/             utils de render con providers, factories, MSW handlers
```

### Reglas de dependencia (las comprueba `eslint-plugin-boundaries`)

```
app → features → ui, shared
features/X → features/Y   solo a través de features/Y/index.ts
ui → shared/theme, shared/i18n (solo para tipos), nada más
ui/atoms → nada de ui/molecules ni superior
ui/molecules → ui/atoms
ui/organisms → ui/molecules, ui/atoms
ui/templates → ui/organisms, ui/molecules, ui/atoms
shared → nada de features ni ui
```

## Atomic Design — qué va en cada nivel

| Nivel | Definición | Ejemplo | Prohibido |
|---|---|---|---|
| **Átomo** | Un elemento indivisible, estilado con tokens | `Button`, `Text`, `Avatar`, `Badge` | Estado de servidor, i18n de textos fijos, navegación |
| **Molécula** | Varios átomos con un propósito simple | `FormField` (label + Input + ayuda + error), `SlotButton` | Llamadas a la API |
| **Organismo** | Sección autónoma de UI | `SlotPicker`, `AppointmentCard`, `ConfirmSheet` | Llamadas a la API (reciben datos y callbacks por props) |
| **Plantilla** | Esqueleto de pantalla sin datos | `ScreenTemplate` (header, scroll, safe area, estados) | Datos reales |
| **Pantalla** (`features/*/screens`) | Plantilla + organismos + hooks de datos | `BookSlotScreen` | Estilos sueltos; lógica de negocio inline |

Cada componente de `ui/` vive en su carpeta:

```
Button/
  Button.tsx          # componente
  Button.styles.ts    # estilos derivados de tokens (useStyles(theme))
  Button.types.ts     # props exportadas
  Button.test.tsx     # RNTL: render, roles, estados, accesibilidad
  Button.stories.tsx  # Storybook: variantes × claro/oscuro × 3 marcas
  index.ts
```

## Clean code

- Componentes funcionales, **nombrados** (`export function Button`), sin `default export` salvo en `app/` (Expo Router lo exige).
- Un componente por fichero; ≤ 150 líneas por componente. Si crece, extraer.
- Props tipadas con `interface`; nada de `any` (ESLint `no-explicit-any: error`); `unknown` + zod en fronteras.
- **Nombres descriptivos** (reglas completas y glosario en `docs/spec/06-clean-code.md`, aplicadas por ESLint `naming-convention` e `id-denylist`):
  - Componentes `PascalCase` que dicen qué muestran: `NextAppointmentCard`, `CancelBookingSheet`, `StaffProfileHeader` (no `Card2`, `Wrapper`).
  - Hooks `use` + qué obtienen o hacen: `useAvailableSlots`, `useCancelBooking`, `useActiveCenter` (no `useData`).
  - Variables que describen su contenido: `selectedService`, `availableSlots`, `remainingSessionCount` (prohibidos `data`, `res`, `tmp`, `obj`, `item2`, `x`).
  - Booleanos `is/has/can/should`: `isSlotSelected`, `hasUnreadNotifications`, `canManageTeam`.
  - Funciones verbo + complemento: `formatPriceInEuros`, `mapBookingDtoToAppointment`, `buildCheckinQrPayload`.
  - Props de eventos `onSlotSelect`; handlers internos `handleSlotSelect`.
  - Constantes con unidad: `SKELETON_DELAY_MS`, `MAX_AVATAR_SIZE_BYTES`, `MIN_TOUCH_TARGET_SIZE`.
  - Sin abreviaturas (`appointment`, no `appt`; `service`, no `svc`); términos del glosario (`Center`, `Booking`, `ClassSession`, `staff`, `client`).
- Funciones y hooks ≤ 40 líneas (objetivo 20), ≤ 3 parámetros (si no, objeto con nombre), sin parámetros booleanos que cambian el comportamiento, retornos tempranos.
- Lógica de negocio pura en `features/*/model` (sin React) y testeada con tablas de casos.
- Nada de números mágicos: espacios, radios, colores, duraciones vienen de `theme`.
- Sin comentarios que repiten el código; sí comentarios del **porqué**.
- Sin `useEffect` para derivar estado (calcúlalo); `useEffect` solo para sincronizar con sistemas externos.
- Memoiza solo con evidencia (React Compiler activado si el SDK lo soporta de forma estable).
- Errores: nunca `catch {}` vacío. Mapear `code` de RFC 9457 a mensajes i18n en `shared/api/errors.ts`.
- Commits: Conventional Commits (`feat(booking): …`), PR pequeño con id de ticket (`APP-305`).

## Estado y datos

- **Datos del servidor → TanStack Query** (hooks generados por Orval envueltos en `features/*/hooks`). Nunca copiar datos del servidor a Zustand.
- **Zustand** solo para: sesión (usuario, centro activo), preferencias de UI, borradores de wizard.
- Claves de query incluyen siempre `centerId`. Al cambiar de centro: `queryClient.removeQueries()` del centro anterior.
- Mutaciones de reservas y pagos **no optimistas**; mostrar estado de carga y esperar al servidor. Optimismo permitido en marcar avisos como leídos, preferencias.
- Cada `POST` crítico genera `Idempotency-Key` con `expo-crypto.randomUUID()` una vez por intención del usuario (reintentos reutilizan la misma).

## Tema y marca blanca

- Tokens desde `docs/design/tokens.json` → `src/shared/theme/tokens.ts` (script `pnpm tokens:gen`).
- `brand-engine.ts` según `docs/design/brand-engine.md`; los 6 vectores son test obligatorio.
- `useTheme()` devuelve `{ colors, space, radius, type, motion, mode }`. **Prohibido** escribir colores hex en componentes (regla ESLint `no-restricted-syntax` para literales `#…` fuera de `shared/theme`).
- `brand` solo como relleno; texto de marca con `brandInk`; sobre `brand` siempre `onBrand`.
- Modo: claro / oscuro / sistema (`useColorScheme`).
- Vocabulario de sector: `t('vocab.staff')`, `t('vocab.client_plural')`… Nunca «gimnasio», «instructor» o «entrenar» fijos en pantallas compartidas.
- Premium: `app.config.ts` lee `APP_VARIANT` y `CENTER_SLUG`; si `extra.lockedCenterId` existe, se salta el flujo «Unirse».

## Navegación (Expo Router)

- Grupos: `join/`, `(auth)/`, `(client)/(tabs)/`, `(staff)/(tabs)/`, `(admin)/`, `(onboarding)/`, `settings/`.
- Redirecciones por sesión y rol en los `_layout.tsx` de cada grupo (sin sesión → `/join` o `/(auth)/login`; rol `staff` → `(staff)`).
- Rutas en `docs/design/pantallas.md`. Parámetros de ruta validados con zod en la pantalla.
- Deep links: `yoclick://` y universal links `https://yoclick.app/j/{code}` e `/i/{token}`.

## Accesibilidad (WCAG 2.2 AA)

- Todo elemento interactivo: `accessibilityRole`, `accessibilityLabel` si no tiene texto visible, `accessibilityState` (`selected`, `disabled`, `checked`, `busy`).
- Objetivo táctil ≥ 44 × 44 (`hitSlop` si el visual es menor).
- Texto escalable (`allowFontScaling` por defecto); probar a 200 %; `maxFontSizeMultiplier` solo en métricas grandes.
- Estado nunca solo por color (horas ocupadas tachadas + etiqueta; estados con palabra).
- `useReducedMotion()` → animaciones a 1 ms.
- Orden de foco lógico; anunciar cambios con `AccessibilityInfo.announceForAccessibility` (reserva confirmada, error).

## Seguridad (OWASP Mobile Top 10 2024) — obligatorio

Los ids `SEC-xx` están en `docs/spec/04-seguridad.md`. Resumen operativo:

1. **Credenciales (M1)**: ningún secreto en el código ni en `EXPO_PUBLIC_*`. Tokens solo vía `shared/storage/secure.ts` (SecureStore, `WHEN_UNLOCKED_THIS_DEVICE_ONLY`). Access token en memoria.
2. **Cadena de suministro (M2)**: no añadir dependencias sin justificarlo en el PR; `pnpm audit` limpio; EAS Update con code signing.
3. **AuthN/AuthZ (M3)**: la app oculta UI por rol pero nunca decide permisos; reautenticación para borrar cuenta, ver salud, exportar datos.
4. **Validación (M4)**: zod en formularios, parámetros de ruta, deep links, contenido de QR (`yoclick:checkin:<jwt>` y nada más). Sin WebView con contenido de usuario.
5. **Comunicación (M5)**: solo HTTPS; nada sensible en URLs ni en el texto de las push.
6. **Privacidad (M6)**: permisos en el momento de uso con explicación; consentimientos separados y desmarcados; Sentry con `beforeSend` que limpia PII; vista de privacidad en el app switcher para salud, pagos y QR.
7. **Binario (M7)**: sin `console.*` en producción; Hermes; sin source maps en el bundle.
8. **Configuración (M8)**: `allowBackup=false`, sin menús de depuración en producción, URL de API validada por entorno.
9. **Almacenamiento (M9)**: no persistir caché de Query con datos personales; AsyncStorage solo vía `shared/storage/public-cache.ts` para datos públicos (branding, catálogo). Borrar temporales.
10. **Criptografía (M10)**: no implementar cripto propia; `expo-crypto` para aleatorios.

Al cerrar sesión: `secure.clear()`, `queryClient.clear()`, `Image.clearMemoryCache()/clearDiskCache()`, reset de stores, desregistrar push token.

## Tests

- **Unit** (`model/`, `shared/`): Jest, tablas de casos. Cobertura ≥ 90 % en `model/` y `shared/theme`.
- **Componentes** (`ui/`): RNTL, consultar por rol y texto accesible (`getByRole('button', { name: 'Reservar cita' })`), nunca por `testID` salvo última opción.
- **Pantallas**: RNTL + MSW con handlers generados; probar carga, vacío, error, éxito.
- **E2E**: Maestro en `e2e/` para los flujos de cada hito (`docs/spec/05-plan-de-trabajo.md`).
- Datos de prueba con factories (`src/test/factories`), nunca datos reales.

## Definition of done

- [ ] Coincide con la pantalla del prototipo (id citado en el PR), en claro y oscuro, con las 3 marcas demo.
- [ ] Copys en `i18n/es-ES.json`, en español de España con tuteo; vocabulario de sector aplicado.
- [ ] Estados: carga (esqueleto si > 300 ms), vacío, error con reintento, sin conexión.
- [ ] Accesibilidad revisada (roles, labels, 44 px, 200 % de texto, reduce motion).
- [ ] Tests nuevos y en verde; lint y typecheck en verde.
- [ ] Controles SEC aplicables revisados y citados en el PR.
- [ ] Nombres revisados con el checklist de `docs/spec/06-clean-code.md`.
- [ ] Sin `TODO` sin ticket asociado.

## Lo que NO debes hacer

- No editar `src/shared/api/generated/` a mano (se regenera).
- No escribir tipos de la API a mano.
- No usar `AsyncStorage` directamente, ni `console.log`, ni colores literales, ni `any`.
- No meter llamadas a la API en `ui/`.
- No construir pantallas F2+ (`pantallas.md`, columna Fase) salvo que el ticket lo pida.
- No inventar endpoints: si falta uno, déjalo en `docs/api-requests.md` y usa un handler MSW provisional.
