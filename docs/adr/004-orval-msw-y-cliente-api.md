# ADR 004 · Orval, MSW y cliente de la API

Estado: aceptada.

## Contexto

`CLAUDE.md` pide Orval con cliente, hooks, MSW y zod a partir de `openapi.yaml`. El contrato
(OpenAPI 3.0.0) se copia a `docs/api/openapi.yaml`; no se edita en el repo del backend.

## Decisión

- **Orval 8.39.0** con dos salidas del mismo contrato (`orval.config.mjs`, `npm run api:gen`):
  1. `client: 'react-query'` + `httpClient: 'fetch'` + `mock: true` → hooks de TanStack Query,
     tipos del contrato y handlers MSW con datos de `@faker-js/faker`.
  2. `client: 'zod'` → esquemas zod de cuerpos y respuestas (SEC-14/15). Orval 8 genera zod v4,
     que es la versión instalada. Probado con el yaml actual: genera sin errores y `tsc` pasa.
- Todo va a `src/shared/api/generated/` (commiteado, nunca a mano, fuera de ESLint, Prettier y
  cobertura).
- `fetch: { includeHttpResponseReturnType: false }` + mutator propio (`api-mutator.ts`): las
  funciones generadas devuelven solo el cuerpo y los errores se lanzan como `ApiError` (en vez de
  la unión `{ data, status, headers }` que obligaría a comprobar `status` en cada llamada). El tipo
  de error de los hooks es `ErrorType<...>` = `ApiError`.
- Las respuestas se validan con zod de forma explícita donde importa (renovación de sesión); el
  cliente genérico no valida todas las respuestas en runtime todavía (SEC-15 pendiente para
  endpoints críticos cuando existan).

## MSW en Jest: no usado de momento

`msw@3.0.2` y sus dependencias (`rettime`, `until-async`, `@mswjs/interceptors`) son ESM-only
(`.mjs`) y el preset `jest-expo` no los transforma; `msw@2.15.0` falla igual por `rettime`.
Se probó `transformIgnorePatterns` y entorno `node` sin éxito razonable. Decisión: los tests
del cliente usan un `fetch` falso inyectado (`src/test/fake-fetch.ts`), que además es más
determinista para los casos de concurrencia. Los handlers MSW generados se conservan (y `msw` +
`@faker-js/faker` están como devDependencies porque el código generado los importa y `tsc` los
comprueba) para Storybook y desarrollo contra mocks. Si más adelante se quiere MSW en Jest,
habrá que añadir un transform para `.mjs` o esperar a soporte en `jest-expo`.

## Cliente

- Token de acceso solo en memoria (zustand sin persistencia); refresh token solo en
  `src/shared/storage/secure.ts` con `WHEN_UNLOCKED_THIS_DEVICE_ONLY`.
- Renovación single-flight; un 401 con un token distinto al vigente reintenta sin renovar.
- Solo se cierra sesión ante un 4xx (salvo 408/429) en el refresh; red y 5xx mantienen la sesión.
- Un refresh cuya respuesta se pierde puede seguir cerrando la sesión (el servidor ya rotó): aceptado.
