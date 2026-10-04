# ADR 007 · Formularios con react-hook-form y zod

Estado: aceptada.

## Contexto

`CLAUDE.md` fija react-hook-form + zod como stack de formularios, pero la dependencia no estaba
instalada. APP-2 (unirse y autenticación) es el primer ticket con formularios.

## Decisión

- `react-hook-form@7.89.0` (MIT, mantenimiento activo, sin dependencias, sin `postinstall`).
- `@hookform/resolvers@5.9.1` (MIT) para conectar los esquemas zod 4 ya instalados. Usa
  `standard-schema`, así que no depende de la versión de zod.
- Las versiones van fijadas (sin `^`) como el resto de dependencias.
- El enlace con la UI vive en `ui/molecules/FormTextField`; la lógica de cada formulario, en
  `features/*/schemas` (zod) y la pantalla.

## Alternativas

Estado local con `useState` + `safeParse` manual: más código repetido por formulario y sin
control de «tocado / enviado». Descartado.
