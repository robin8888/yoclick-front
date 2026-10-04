# yoclick-app

App móvil marca blanca de Yoclick (iOS y Android): Expo SDK 57 + React Native + TypeScript.
Reglas del repo en `CLAUDE.md`; especificación en `docs/spec/`; diseño en `docs/design/`.

## Requisitos

- Node 24 (`.nvmrc`) y npm 11. Gestor de paquetes: **npm** (nunca pnpm ni yarn).
- **No funciona en Expo Go**: la app necesita un _development build_ (Stripe, SecureStore, pinning).
  Compílalo con `npm run ios` / `npm run android` (requiere Xcode / Android Studio) o con EAS.

## Comandos

```bash
npm ci               # instalar respetando package-lock.json
npm start            # Metro con el dev client
npm run ios          # compila y abre el development build en iOS
npm run android      # compila y abre el development build en Android
npm run lint         # ESLint (strict-type-checked + capas) + Prettier --check
npm run typecheck    # tsc --noEmit
npm test             # Jest + Testing Library
npm run format       # Prettier --write
```

Antes de cada commit se ejecutan lint-staged, `typecheck` y gitleaks (si está instalado);
`commit-msg` valida Conventional Commits. No uses `--no-verify`.

## Alias

`@/` apunta a `src/` (tsconfig `paths`, resuelto por Metro, Jest y ESLint).

## Decisiones

Las decisiones técnicas que se desvían de la especificación están en `docs/adr/`.

## Entornos y variantes (`app.config.ts`)

La configuración se construye en `config/app-config/` (funciones puras con tests) y la lee `app.config.ts`.

| Variable                                  | Valores                                              | Notas                                                                              |
| ----------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `APP_ENV`                                 | `development` (por defecto), `preview`, `production` | Un valor desconocido falla el build                                                |
| `API_URL`                                 | origen de la API                                     | `production` solo acepta `https://api.yoclick.app` (SEC-31); `preview` exige https |
| `APP_VARIANT`                             | `shared` (por defecto), `premium`                    |                                                                                    |
| `CENTER_SLUG`, `CENTER_NAME`, `CENTER_ID` | solo Premium                                         | Fijan nombre, slug, esquema, id de bundle y `extra.lockedCenterId`                 |

Los perfiles de EAS (`eas.json`) fijan `APP_ENV`/`API_URL`. Para un centro Premium crea un perfil que
extienda `production` con `APP_VARIANT=premium` y los datos del centro, y añade sus iconos en
`assets/centers/<slug>/{icon,adaptive-icon,splash-icon}.png` (el build falla si faltan).

El id `com.yoclick.app` es **provisional** y no se puede cambiar tras publicar (ver `STORE_CHECKLIST.md`).
Los iconos de `assets/` son marcadores de posición. La URL de staging de `eas.json` también es provisional.
