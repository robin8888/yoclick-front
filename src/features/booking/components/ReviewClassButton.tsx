import { useRouter } from 'expo-router';

import type { ServiceSessionsResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';

type OpenClass = ServiceSessionsResponseDto['sessions'][number];

interface ReviewClassButtonProps {
  serviceId: string;
  selectedSessions: readonly OpenClass[];
}

/** «Revisar reserva»: desactivado hasta elegir una clase; lleva a la confirmación con todas. */
export function ReviewClassButton({
  serviceId,
  selectedSessions,
}: Readonly<ReviewClassButtonProps>): React.JSX.Element {
  const router = useRouter();
  const [firstSession] = selectedSessions;
  const label =
    selectedSessions.length > 1
      ? i18n.t('booking.slot.continueManyLabel', { count: selectedSessions.length })
      : i18n.t('booking.slot.continueLabel');

  return (
    <Button
      label={label}
      isFullWidth
      isDisabled={firstSession === undefined}
      onPress={() => {
        if (firstSession === undefined) return;
        const params =
          selectedSessions.length === 1
            ? {
                serviceId,
                classSessionId: firstSession.id,
                startsAt: firstSession.startsAt,
                staffName: firstSession.teacher.fullName,
              }
            : {
                serviceId,
                classes: JSON.stringify(
                  selectedSessions.map((session) => ({
                    id: session.id,
                    startsAt: session.startsAt,
                    staffName: session.teacher.fullName,
                  })),
                ),
              };
        router.push({ pathname: '/(client)/book/confirm', params });
      }}
    />
  );
}
