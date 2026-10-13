export interface ProblemModalProps {
  /** «No se ha podido guardar». */
  title: string;
  /** Por qué no se puede, con palabras del centro; con `null` el aviso no se ve. */
  message: string | null;
  /** «Entendido». */
  dismissLabel: string;
  onDismiss: () => void;
}
