import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { useActiveCenterSummary } from '@/features/auth';
import { LoadErrorState } from '@/features/join';
import { useMyPhoto } from '@/features/photos';
import { getMeGetProfileQueryOptions } from '@/shared/api/generated/endpoints/me/me';
import { useSessionStore } from '@/shared/auth/session-store';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { AccessPassCard } from '../components/AccessPassCard';
import { WorkQrNote } from '../components/WorkQrNote';
import { useCheckInCode } from '../hooks/useCheckInCode';

const CENTER_TIME_ZONE = 'Europe/Madrid';

/** «Mi QR de trabajo»: el código firmado que el centro escanea al entrar y al salir. */
export function WorkQrScreen(): React.JSX.Element {
  const router = useRouter();
  const checkInCode = useCheckInCode();
  const sessionFullName = useSessionStore((state) => state.user?.fullName);
  const profile = useQuery(getMeGetProfileQueryOptions());
  const fullName = sessionFullName ?? profile.data?.fullName ?? '';
  const center = useActiveCenterSummary();
  const { photoUrl } = useMyPhoto();

  return (
    <ScreenTemplate
      title={i18n.t('attendance.workQr.title')}
      subtitle={i18n.t('attendance.workQr.subtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      {checkInCode.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {checkInCode.isError ? (
        <LoadErrorState
          title={i18n.t('attendance.workQr.errorTitle')}
          error={checkInCode.error}
          onRetry={() => void checkInCode.refetch()}
          isRetrying={checkInCode.isFetching}
        />
      ) : null}
      {checkInCode.data === undefined ? null : (
        <AccessPassCard
          fullName={fullName}
          centerName={center.name}
          qrContent={checkInCode.data.qrContent}
          nextAppointment={undefined}
          avatarPhotoUrl={photoUrl}
          timeZone={CENTER_TIME_ZONE}
        />
      )}
      <WorkQrNote />
    </ScreenTemplate>
  );
}
