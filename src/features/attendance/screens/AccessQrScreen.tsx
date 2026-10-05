import { useRouter } from 'expo-router';

import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Text } from '@/ui/atoms/Text';
import { QrCard } from '@/ui/organisms/QrCard';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { useCheckInCode } from '../hooks/useCheckInCode';

const ACCESS_QR_SIZE = 240;

/** «Mi QR de acceso»: el código firmado por el servidor que quien atiende escanea al llegar. */
export function AccessQrScreen(): React.JSX.Element {
  const router = useRouter();
  const checkInCode = useCheckInCode();

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
        <QrCard
          value={checkInCode.data.qrContent}
          size={ACCESS_QR_SIZE}
          accessibilityLabel={i18n.t('attendance.accessQr.qrLabel')}
        />
      )}
      <Text variant="caption" color="ink2" align="center">
        {i18n.t('attendance.accessQr.renewsHint')}
      </Text>
    </ScreenTemplate>
  );
}
