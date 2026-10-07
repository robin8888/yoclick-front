import { View } from 'react-native';

import { LoadErrorState, useActiveCenterSectorId } from '@/features/join';
import { ExerciseRows, useMyRoutines } from '@/features/routines';
import type { MyRoutinesResponseDtoRoutinesItem } from '@/shared/api/generated/model';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { formatNumericDate } from '@/shared/lib/format';
import { Text } from '@/ui/atoms/Text';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

const ISO_DATE_LENGTH = 10;
const ROUTINES_STYLE = { gap: 24 } as const;
const ROUTINE_STYLE = { gap: 8 } as const;

function RoutineBlock({
  routine,
}: Readonly<{ routine: MyRoutinesResponseDtoRoutinesItem }>): React.JSX.Element {
  const receivedOn = formatNumericDate(routine.assignedAt.slice(0, ISO_DATE_LENGTH));

  return (
    <View style={ROUTINE_STYLE}>
      <Text variant="titleMd" role="heading">
        {routine.name}
      </Text>
      <Text variant="caption" color="ink2">
        {i18n.t('routines.client.assignedOn', { date: receivedOn })}
      </Text>
      {routine.note === null ? null : <Text color="ink2">{routine.note}</Text>}
      <ExerciseRows exercises={routine.items} />
    </View>
  );
}

/** Pestaña «Practicar» del prototipo: lo que el centro ha asignado a la persona (rutinas, prácticas, tareas…). */
export function PracticeScreen(): React.JSX.Element {
  const routines = useMyRoutines();
  const { contentTabLabel } = getSectorVocabulary(useActiveCenterSectorId());
  const list = routines.data?.routines ?? [];

  return (
    <ScreenTemplate title={contentTabLabel}>
      {routines.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {routines.isError ? (
        <LoadErrorState
          title={i18n.t('routines.client.errorTitle')}
          error={routines.error}
          onRetry={() => void routines.refetch()}
          isRetrying={routines.isFetching}
        />
      ) : null}
      {routines.isSuccess && list.length === 0 ? (
        <EmptyState
          iconName="play"
          title={i18n.t('routines.client.emptyTitle')}
          description={i18n.t('routines.client.emptyDescription')}
          actionLabel={getSharedStateCopy().retryLabel}
          onActionPress={() => void routines.refetch()}
        />
      ) : null}
      <View style={ROUTINES_STYLE}>
        {list.map((routine) => (
          <RoutineBlock key={routine.id} routine={routine} />
        ))}
      </View>
    </ScreenTemplate>
  );
}
