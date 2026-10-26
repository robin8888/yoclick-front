import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { ConfirmSheet } from '@/ui/organisms/ConfirmSheet';

interface PassNeededSheetProps {
  isVisible: boolean;
  onDismiss: () => void;
}

/** «Primero necesitas un bono»: el centro reserva con bono y la persona aún no tiene uno en vigor. */
export function PassNeededSheet({
  isVisible,
  onDismiss,
}: Readonly<PassNeededSheetProps>): React.JSX.Element {
  const router = useRouter();

  return (
    <ConfirmSheet
      isVisible={isVisible}
      title={i18n.t('booking.passNeeded.title')}
      message={i18n.t('booking.passNeeded.message')}
      confirmLabel={i18n.t('booking.passNeeded.confirmAction')}
      dismissLabel={i18n.t('booking.passNeeded.dismissAction')}
      onConfirm={() => {
        onDismiss();
        router.push('/(client)/my-passes');
      }}
      onDismiss={onDismiss}
    />
  );
}
