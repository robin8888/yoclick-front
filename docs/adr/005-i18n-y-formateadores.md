# ADR 005 · i18n y formateadores

Estado: aceptada.

## Decisión

- `i18next` 26 + `react-i18next` 17 (MIT), un solo idioma `es-ES` con claves tipadas desde `es-ES.json`.
- `expo-localization` **no se instala todavía**: con un único idioma no aporta nada y cada dependencia nativa se justifica. Se añadirá con `en.json`.
- Fechas y dinero se formatean a mano en `shared/lib/format` (nombres de día/mes y separadores propios) y `Intl` solo se usa para convertir la zona horaria; así «jue 1 oct» y «12.480 €» son idénticos en iOS, Android (Hermes) y Jest, sin depender de los datos de ICU del dispositivo. En es-ES los números de 4 cifras no llevan separador de miles («1234 €») y los de 5 sí («12.480 €»); `formatMoney` recibe céntimos, así que «12.480 €» es `1248000`.
- El vocabulario de sector es código (`sector-vocabulary.ts`, tabla de `docs/spec/00-producto.md`) y no claves i18n: es una tabla finita que las pantallas piden por `sectorId`. Un sector desconocido usa `otro`.
- Los mensajes de error van por `code` (`shared/api/errors.ts`). La lista de códigos conocidos sale del `ERROR_CATALOG` del backend más los de negocio de `03-api.md`; un test falla si algún código no tiene mensaje.
