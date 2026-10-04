# Peticiones al backend (`docs/api-requests.md`)

Lo que la app necesita y el contrato (`docs/api/openapi.yaml`) no cubre todavía. No se inventan
endpoints: cada punto indica qué hace la app mientras tanto.

## APP-2 · Unirse y autenticación

| # | Falta | Qué hace la app mientras tanto |
|---|---|---|
| 1 | **Contrato en OpenAPI 3.0.0 con sintaxis 3.1.** `PersonalDataExportResponseDto.profile.phone`, `CenterSearchResponseDtoCentersItem.city` y `.distanceInKilometers` declaran `type: [string, "null"]` bajo `openapi: 3.0.0`; Orval 8 rechaza el yaml. | La copia local `docs/api/openapi.yaml` cambia esos tres a `type: X` + `nullable: true` (equivalente en 3.0). Conviene arreglarlo en el generador del backend para no repetirlo en cada copia. |
| 2 | **`PublicCenterResponseDto.city` es `string[]`** en el contrato (la búsqueda lo declara como `string \| null`). | `formatCenterCity` acepta texto o lista. |
| 3 | **Datos del centro para «¿Es este tu centro?» (`jconfirm`)**: dirección, horario, número de servicios y de profesionales. `GET /v1/centers/{id}/branding` solo da nombre, sector y color. | La confirmación muestra nombre, avatar con iniciales y la nota de privacidad; sin dirección, horario ni resumen de servicios. |
| 4 | **Logo del centro** (URL) en `branding`, `join/code`, `join/search` y `me/memberships`. | `Avatar` con las iniciales del centro. |
| 5 | **Experiencia y objetivos del alta (`reg2`)** y **teléfono (`reg1`)**: `POST /v1/auth/register` solo admite nombre, correo, contraseña y consentimientos. `PATCH /v1/me` admite `phone` pero no experiencia ni objetivos, ni existe «nivel inicial». | `reg2` recoge experiencia y objetivos y calcula el nivel inicial para mostrarlo, pero **no se envían**. `reg1` no pide teléfono ni foto (foto: APP-8). |
| 6 | **Unirse sin sesión**: `POST /v1/join/{centerId}` exige sesión, así que el centro elegido se guarda en memoria y se une justo después de iniciar sesión. Un alta nueva debe verificar el correo y volver a entrar para unirse. | Flujo descrito: elegir centro → crear cuenta → verificar correo → iniciar sesión → unirse. Si el servidor rechaza (privado sin código, bloqueado, límite), se muestra el centro que sí tenga o «Unirse». |
| 7 | **Inicio de sesión con Apple y Google** (decisión pendiente) y **QR de centro (`jqr`)**. | Fuera de este ticket: ni botones ni rutas. |
| 8 | **Búsqueda por cercanía** (`lat`/`lng`): la app aún no pide el permiso de ubicación (`expo-location` no está en el proyecto). | La búsqueda es solo por texto. |
| 9 | **Deep links** `https://yoclick.app/j/{code}` e `/i/{token}`. | Sin implementar en este ticket. |
