export interface LogoProps {
  /**
   * `lockup` es el logotipo completo (icono X‑C y «yoClick») en blanco, para fondos de marca;
   * `symbol` es el icono YC y `wordmark` el texto «YoClick», ambos en azul.
   */
  variant: 'symbol' | 'wordmark' | 'lockup';
  /** Alto en puntos; el ancho sale de la proporción del logotipo. */
  height: number;
}
