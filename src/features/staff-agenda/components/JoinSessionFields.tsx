import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Text } from '@/ui/atoms/Text';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';

import type { ChosenClient } from '../hooks/useNewAppointmentForm';
import type { useRoomAgenda } from '../hooks/useRoomAgenda';
import type { FoundSession } from '../model/room-agenda';
import { ClientChoiceField } from './ClientChoiceField';
import { SessionSummaryCard } from './SessionSummaryCard';

interface JoinSessionFieldsProps {
  agenda: ReturnType<typeof useRoomAgenda>;
  /** La sesión a la que se apunta, ya localizada en la agenda; `undefined` si no está. */
  found: FoundSession | undefined;
  clients: readonly ChosenClient[];
  onClientToggle: (client: ChosenClient) => void;
  onClientsClear: () => void;
}

/**
 * Apuntar a alguien a una clase que ya existe: la clase viene decidida (servicio, profesor, sala y
 * hora), así que solo se elige a la persona.
 */
export function JoinSessionFields({
  agenda,
  found,
  clients,
  onClientToggle,
  onClientsClear,
}: Readonly<JoinSessionFieldsProps>): React.JSX.Element {
  if (agenda.isPending) return <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />;
  if (agenda.isError) {
    return (
      <LoadErrorState
        title={i18n.t('staffAgenda.agenda.errorTitle')}
        error={agenda.error}
        onRetry={() => void agenda.refetch()}
        isRetrying={agenda.isFetching}
      />
    );
  }
  if (found === undefined) {
    return <Text color="ink2">{i18n.t('staffAgenda.newAppointment.sessionNotFound')}</Text>;
  }
  return (
    <>
      <Text variant="titleMd">{i18n.t('staffAgenda.newAppointment.joinSessionLabel')}</Text>
      <SessionSummaryCard found={found} timeZone={agenda.data.timezone} />
      <ClientChoiceField
        clients={clients}
        canChooseSeveral
        requiredPassServiceId={found.session.service.id}
        onClientToggle={onClientToggle}
        onClientsClear={onClientsClear}
      />
    </>
  );
}
