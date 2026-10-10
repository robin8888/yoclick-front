export interface CenterLogoTileProps {
  /** Nombre del centro: da las iniciales cuando no hay logo y el texto alternativo. */
  centerName: string;
  /** URL completa del logo; sin ella (o si falla la carga) se muestran las iniciales. */
  logoUrl?: string | null | undefined;
}
