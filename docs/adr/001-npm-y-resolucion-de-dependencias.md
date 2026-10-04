# ADR 001 · npm, versiones fijas y resolución de dependencias

Estado: aceptada.

## Contexto

La especificación menciona pnpm; el proyecto usa npm (decisión del responsable). Con npm 11,
`expo-router@57` declara `react-dom` como peer opcional y el árbol resuelve `react-dom@19.3`, que
exige `react@^19.3` mientras Expo 57 fija `react@19.2.3`. `npm install` falla con ERESOLVE.

## Decisión

- `.npmrc` con `save-exact=true` y `package-lock.json` commiteado; `npm ci` en CI.
- Se fija `react-dom@19.2.3` (misma versión que `react`) en lugar de usar `legacy-peer-deps`, que
  silenciaría conflictos reales. No se usa en runtime nativo.
- `eslint@9` (no 10) y `typescript@6.0.3`: typescript-eslint no soporta TS >= 6.1.
- `eslint-plugin-boundaries@7` con `eslint-import-resolver-typescript` (sin resolutor no resuelve
  el alias `@/` ni imports relativos y no detecta ninguna violación). Se comprobó con violaciones
  deliberadas atom→molecule, ui→shared/lib y feature→feature/interno.
- `eslint-plugin-react-native@5` sin soporte flat nativo: se envuelve con `fixupPluginRules`.
- `no-restricted-syntax` para hex y `naming-convention.custom` para nombres vagos en lugar de
  `id-denylist` (marca claves impuestas por librerías).

## Consecuencias

`npm audit --omit=dev` informa de vulnerabilidades transitivas de la cadena de build de Expo/Metro
(braces, micromatch, node-forge) que solo se corrigen con actualizaciones upstream; se revisa en
cada subida de SDK.
