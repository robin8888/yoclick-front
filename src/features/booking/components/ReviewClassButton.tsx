import { useRouter } from 'expo-router';

import type { ServiceSessionsResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';

interface ReviewClassButtonProps {
  serviceId: string;
  selectedSession: ServiceSessionsResponseDto['sessions'][number] | null;
}

/** «Revisar reserva»: desactivado hasta elegir una clase; lleva a la confirmación. */
export function ReviewClassButton({
  serviceId,
  selectedSession,
}: Readonly<ReviewClassButtonProps>): React.JSX.Element {
  const router = useRouter();

  return (
    <Button
      label={i18n.t('booking.slot.continueLabel')}
      isFullWidth
      isDisabled={selectedSession === null}
      onPress={() => {
        if (selectedSession === null) return;
        router.push({
          pathname: '/(client)/book/confirm',
          params: {
            serviceId,
            classSessionId: selectedSession.id,
            startsAt: selectedSession.startsAt,
            staffName: selectedSession.teacher.fullName,
          },
        });
      }}
    />
  );
}
