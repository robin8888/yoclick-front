export interface ConfirmSheetProps {
  isVisible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  dismissLabel: string;
  /** Mientras el servidor responde, el botón muestra la carga y no se puede cerrar la hoja. */
  isConfirming?: boolean;
  /** Acciones que no se deshacen (cancelar una cita) usan el botón de peligro. */
  isDestructive?: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}
