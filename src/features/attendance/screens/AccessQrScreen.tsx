import { useRouter } from 'expo-router';

import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { AccessPassCard } from '../components/AccessPassCard';
import { AccessQrNote } from '../components/AccessQrNote';
import { useAccessPassHolder } from '../hooks/useAccessPassHolder';
import { useCheckInCode } from '../hooks/useCheckInCode';

const CENTER_TIME_ZONE = 'Europe/Madrid';

/** «Mi QR de acceso»: el código firmado por el servidor que quien atiende escanea al llegar. */
export function AccessQrScreen(): React.JSX.Element {
  const router = useRouter();
  const checkInCode = useCheckInCode();
  const passHolder = useAccessPassHolder();

  return (
    <ScreenTemplate
      title={i18n.t('attendance.accessQr.title')}
      subtitle={i18n.t('attendance.accessQr.subtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      {checkInCode.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {checkInCode.isError ? (
        <LoadErrorState
          title={i18n.t('attendance.accessQr.errorTitle')}
          error={checkInCode.error}
          onRetry={() => void checkInCode.refetch()}
          isRetrying={checkInCode.isFetching}
        />
      ) : null}
      {checkInCode.data === undefined ? null : (
        <AccessPassCard
          fullName={passHolder.fullName}
          centerName={passHolder.centerName}
          qrContent={checkInCode.data.qrContent}
          nextAppointment={passHolder.nextAppointment}
          timeZone={CENTER_TIME_ZONE}
        />
      )}
      <AccessQrNote />
    </ScreenTemplate>
  );
}
