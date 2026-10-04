# ADR 002 · Importar la lógica de `app.config.ts` con extensión `.ts`

Estado: aceptada.

## Contexto

La especificación pide `app.config.ts` y que la lógica sea testeable. Expo transpila solo
`app.config.ts`; los ficheros TypeScript que éste importa se cargan con el `require` de Node, que no
resuelve imports sin extensión (`Cannot find module './config/...'`, comprobado con `expo config`).

## Decisión

- La lógica vive en `config/app-config/*.ts` y se importa con extensión explícita (`./x.ts`), que
  Node 24 ejecuta con _type stripping_. Por eso `tsconfig` activa `allowImportingTsExtensions`.
- El código de ese directorio solo usa sintaxis borrable (sin `enum`, sin parámetros-propiedad).
- `ios.infoPlist.NSAppTransportSecurity = { NSAllowsArbitraryLoads: false }` en `preview` y
  `production`. En `development` se conserva el valor por defecto de la plantilla de Expo
  (`NSAllowsLocalNetworking`), necesario para que el dev client llegue a Metro por HTTP.
- `expo-dev-client` solo se añade como plugin en builds `development` (SEC-32).
- El id `com.yoclick.app`, el dominio de universal links y la URL de staging son provisionales.
