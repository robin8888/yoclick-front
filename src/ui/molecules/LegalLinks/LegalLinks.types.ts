export interface LegalLinkItem {
  /** Texto visible del enlace: «Política de privacidad». */
  label: string;
  /** Lo que se dice a los lectores de pantalla; sin él se usa `label`. */
  accessibilityLabel?: string | undefined;
  onPress: () => void;
}

export interface LegalLinksProps {
  links: readonly LegalLinkItem[];
  /** Aviso bajo los enlaces, por ejemplo cuando no se pudo abrir uno. */
  errorMessage?: string | undefined;
}
