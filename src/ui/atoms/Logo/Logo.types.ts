export interface LogoProps {
  /** `symbol` es el icono YC; `wordmark` es el texto «YoClick». */
  variant: 'symbol' | 'wordmark';
  /** Alto en puntos; el ancho sale de la proporción del logotipo. */
  height: number;
}
