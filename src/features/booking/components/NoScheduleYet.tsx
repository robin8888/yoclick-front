import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { ProblemModal } from '@/ui/organisms/ProblemModal';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

/** Aviso cuando el centro aún no ha fijado sala y horario para el servicio. */
export function NoScheduleYet(): React.JSX.Element {
  const router = useRouter();

  return (
    <ScreenTemplate
      title={i18n.t('booking.slot.title')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      footer={<Button label={i18n.t('actions.back')} isFullWidth onPress={router.back} />}
    >
      <Text color="ink2">{i18n.t('booking.slot.noScheduleMessage')}</Text>
      <ProblemModal
        title={i18n.t('booking.slot.noScheduleTitle')}
        message={i18n.t('booking.slot.noScheduleMessage')}
        dismissLabel={i18n.t('booking.slot.noScheduleDismiss')}
        onDismiss={router.back}
      />
    </ScreenTemplate>
  );
}
