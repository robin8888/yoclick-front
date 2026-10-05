// Metro resuelve los PNG a un identificador numérico de recurso.
declare module '*.png' {
  const imageSource: number;
  // eslint-disable-next-line no-restricted-exports -- así tipa Metro los recursos importados
  export default imageSource;
}
