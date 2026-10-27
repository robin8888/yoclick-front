export interface BlockingModalProps {
  isVisible: boolean;
  title: string;
  message: string;
  /** El único botón: lleva a lo que desbloquea la app. */
  actionLabel: string;
  onActionPress: () => void;
}
