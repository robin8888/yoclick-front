import { i18n } from '@/shared/i18n';
import { ConfirmSheet } from '@/ui/organisms/ConfirmSheet';

interface EndClassSheetProps {
  isVisible: boolean;
  isEnding: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

/** «¿Terminar la clase?»: se pregunta antes de cerrar porque queda registrado para el centro. */
export function EndClassSheet({
  isVisible,
  isEnding,
  onConfirm,
  onDismiss,
}: Readonly<EndClassSheetProps>): React.JSX.Element {
  return (
    <ConfirmSheet
      isVisible={isVisible}
      title={i18n.t('staffAgenda.session.endConfirmTitle')}
      message={i18n.t('staffAgenda.session.endConfirmMessage')}
      confirmLabel={i18n.t('staffAgenda.session.endConfirmAction')}
      dismissLabel={i18n.t('staffAgenda.session.keepGoingAction')}
      isConfirming={isEnding}
      onConfirm={onConfirm}
      onDismiss={onDismiss}
    />
  );
}
