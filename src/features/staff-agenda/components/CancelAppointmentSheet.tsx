import { i18n } from '@/shared/i18n';
import { ConfirmSheet } from '@/ui/organisms/ConfirmSheet';

interface CancelAppointmentSheetProps {
  isVisible: boolean;
  isCancelling: boolean;
  clientName: string;
  onConfirm: () => void;
  onDismiss: () => void;
}

/** «¿Cancelar esta cita?»: la persona recibe un aviso en el móvil, así que se pregunta antes. */
export function CancelAppointmentSheet({
  isVisible,
  isCancelling,
  clientName,
  onConfirm,
  onDismiss,
}: Readonly<CancelAppointmentSheetProps>): React.JSX.Element {
  return (
    <ConfirmSheet
      isVisible={isVisible}
      title={i18n.t('staffAgenda.session.cancelConfirmTitle')}
      message={i18n.t('staffAgenda.session.cancelConfirmMessage', { clientName })}
      confirmLabel={i18n.t('staffAgenda.session.cancelConfirmAction')}
      dismissLabel={i18n.t('staffAgenda.session.keepAppointmentAction')}
      isConfirming={isCancelling}
      isDestructive
      onConfirm={onConfirm}
      onDismiss={onDismiss}
    />
  );
}
