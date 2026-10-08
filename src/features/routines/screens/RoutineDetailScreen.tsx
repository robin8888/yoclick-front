import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

import { LoadErrorState } from '@/features/join';
import type { RoutineDetailResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ArchiveRoutineControl } from '../components/ArchiveRoutineControl';
import { ExerciseRows } from '../components/ExerciseRows';
import { RoutineAssignmentsSection } from '../components/RoutineAssignmentsSection';
import { RoutineProgressSection } from '../components/RoutineProgressSection';
import { SECTION_STYLE } from '../components/RoutinesCommon.styles';
import {
  useArchiveRoutine,
  useAssignRoutine,
  useUnassignRoutine,
} from '../hooks/useRoutineMutations';
import { useRoutineDetail } from '../hooks/useRoutineQueries';
import {
  buildEditRoutineRoute,
  parseRoutineRouteParams,
  type RoutineRouteBase,
} from '../model/routine-routes';

interface RoutineDetailBodyProps {
  routine: RoutineDetailResponseDto;
  routeBase: RoutineRouteBase;
}

function EditRoutineButton({
  routine,
  routeBase,
}: Readonly<RoutineDetailBodyProps>): React.JSX.Element {
  const router = useRouter();

  return (
    <Button
      label={i18n.t('routines.detail.editAction')}
      accessibilityLabel={i18n.t('routines.detail.editActionLabel', { name: routine.name })}
      variant="outline"
      onPress={() => {
        router.push(buildEditRoutineRoute(routeBase, routine.id));
      }}
    />
  );
}

function RoutineNote({ note }: Readonly<{ note: string }>): React.JSX.Element {
  return (
    <View>
      <Text variant="titleMd" role="heading">
        {i18n.t('routines.detail.notesTitle')}
      </Text>
      <Text color="ink2">{note}</Text>
    </View>
  );
}

function RoutineDetailBody({
  routine,
  routeBase,
}: Readonly<RoutineDetailBodyProps>): React.JSX.Element {
  const router = useRouter();
  const assignment = useAssignRoutine(routine.id);
  const unassignment = useUnassignRoutine(routine.id);
  const archive = useArchiveRoutine(routine.id);
  const errorMessage = assignment.errorMessage ?? unassignment.errorMessage ?? archive.errorMessage;

  return (
    <View style={SECTION_STYLE}>
      <EditRoutineButton routine={routine} routeBase={routeBase} />
      {routine.note === null ? null : <RoutineNote note={routine.note} />}
      <ExerciseRows exercises={routine.items} />
      <RoutineAssignmentsSection
        assignments={routine.assignments}
        isBusy={assignment.isRunning || unassignment.isRunning}
        onAssign={(target, onDone) => {
          assignment.run(target, onDone);
        }}
        onUnassign={(assignmentId) => {
          unassignment.run(assignmentId);
        }}
      />
      <RoutineProgressSection routineId={routine.id} />
      {errorMessage === null ? null : <FormErrorBanner message={errorMessage} />}
      <ArchiveRoutineControl
        routineName={routine.name}
        isArchiving={archive.isRunning}
        onArchive={() => {
          archive.run(undefined, router.back);
        }}
      />
    </View>
  );
}

function RoutineDetailContent({
  routineId,
  routeBase,
}: Readonly<{ routineId: string; routeBase: RoutineRouteBase }>): React.JSX.Element {
  const router = useRouter();
  const routine = useRoutineDetail(routineId);

  return (
    <ScreenTemplate
      title={routine.data?.name ?? ''}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
    >
      {routine.isPending ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {routine.isError ? (
        <LoadErrorState
          title={i18n.t('routines.detail.notFound')}
          error={routine.error}
          onRetry={() => void routine.refetch()}
          isRetrying={routine.isFetching}
        />
      ) : null}
      {routine.data === undefined ? null : (
        <RoutineDetailBody routine={routine.data} routeBase={routeBase} />
      )}
    </ScreenTemplate>
  );
}

/** Una rutina con sus ejercicios, a quién está asignada, y archivarla. */
export function RoutineDetailScreen({
  routeBase,
}: Readonly<{ routeBase: RoutineRouteBase }>): React.JSX.Element {
  const params = parseRoutineRouteParams(useLocalSearchParams());
  if (params === null) return <Redirect href="/" />;
  return <RoutineDetailContent routineId={params.routineId} routeBase={routeBase} />;
}
