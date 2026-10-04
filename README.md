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
