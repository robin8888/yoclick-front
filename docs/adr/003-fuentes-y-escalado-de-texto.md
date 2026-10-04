# ADR 003 · Fuentes estáticas y escalado de texto

Estado: aceptada.

## Contexto

`sistema-de-diseno.md` pide Archivo con el eje de anchura (`font-stretch: 112%`) en los titulares.
`@expo-google-fonts/archivo` solo publica instancias estáticas (400 a 800, sin eje de anchura) y React
Native no soporta `font-stretch`.

## Decisión

- Se usan las instancias estáticas Archivo 700/800 y Figtree 400/500/600/700, importadas peso a peso
  (no desde el índice del paquete) para no embeber cursivas ni pesos sin uso.
- Los titulares quedan sin la anchura expandida. Si diseño la considera imprescindible, habría
  que empaquetar una variante expandida propia (por ejemplo «Archivo Expanded») como fuente local.
- En React Native cada peso de una fuente personalizada es una familia: `resolveFontFaceName`
  traduce (familia, peso) al nombre cargado y los estilos no usan `fontWeight`.
- Se cargan en runtime con `useFonts` y el splash se mantiene hasta tenerlas; si falla la carga se
  continúa con la fuente del sistema.
- `Text` siempre usa `allowFontScaling`. `maxFontSizeMultiplier` solo se admite (a nivel de tipos)
  en `display` y `metric`.

## Pendiente de verificar

El comportamiento a 200 % (cortes de línea, `lineHeight` escalado) solo se puede comprobar en un
dispositivo o simulador con un development build; los tests solo cubren las props que se pasan.
