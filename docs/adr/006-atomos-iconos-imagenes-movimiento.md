# ADR 006 · Átomos: iconos, imágenes y movimiento

Estado: aceptada.

## Decisión

- **Iconos**: `lucide-react-native` 1.52.0 (ISC) sobre `react-native-svg` 15.15.4 (MIT, versión de `bundledNativeModules` de Expo 57). El sistema de diseño ya declara Lucide como sustituto de los iconos dibujados a mano (misma rejilla de 24 y trazo redondeado). `Icon` usa un registro explícito de nombres de la app (`icon-registry.ts`) en lugar de aceptar cualquier icono, para limitar lo que entra en el bundle y mantener un vocabulario cerrado.
- **Jest** elige el build ESM (`.mjs`) de lucide por su campo `module` y `jest-expo` no lo transforma: `jest.config.js` lo redirige al build CJS con `moduleNameMapper`. Metro en la app no se ve afectado (no verificado en dispositivo).
- **Fotos**: `expo-image` 57.0.5 (MIT; ya estaba en el stack de `CLAUDE.md`) para `Avatar`; da caché en disco y `clearMemoryCache/clearDiskCache` para el cierre de sesión (pendiente de cablear: hoy `signOut` no llama a esas funciones).
- **Movimiento**: `useReducedMotion` y `usePressableStyle` viven en `shared/theme` (y no en `shared/hooks`) porque `eslint-plugin-boundaries` solo permite a los átomos depender de `shared/theme` e `shared/i18n`. Sin Reanimated todavía: el pulso del `Skeleton` usa `Animated` de React Native con el driver nativo.
- Las historias de Storybook quedan para APP-007 (Storybook RN aún no está instalado).
