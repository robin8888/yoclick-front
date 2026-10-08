import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { LoadErrorState, useActiveCenterSectorId } from '@/features/join';
import type { RoutineDetailResponseDto } from '@/shared/api/generated/model';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { RoutineBuilderForm } from '../components/RoutineBuilderForm';
import { useRoutineEditor } from '../hooks/useRoutineBuilder';
import { useRoutineDetail } from '../hooks/useRoutineQueries';
import { buildDraftFromRoutine } from '../model/routine-draft';
import { parseRoutineRouteParams } from '../model/routine-routes';

function EditRoutineForm({
  routine,
}: Readonly<{ routine: RoutineDetailResponseDto }>): React.JSX.Element {
  const router = useRouter();
  const { routine: routineWord } = getSectorVocabulary(useActiveCenterSectorId());
  const editor = useRoutineEditor(routine.id, buildDraftFromRoutine(routine));

  return (
    <ScreenTemplate
      title={i18n.t('routines.edit.title', { routineWord: routineWord.singular })}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={editor.isSaving}
      footer={
        <Button
          isFullWidth
          label={i18n.t('routines.edit.saveAction')}
          isDisabled={!editor.canSave}
          onPress={() => {
            editor.save(router.back);
          }}
        />
      }
    >
      <RoutineBuilderForm builder={editor} />
      {routine.assignments.length === 0 ? null : (
        <Text variant="caption" color="ink2">
          {i18n.t('routines.edit.notifyHint')}
        </Text>
      )}
      {editor.errorMessage === null ? null : <FormErrorBanner message={editor.errorMessage} />}
    </ScreenTemplate>
  );
}

function EditRoutineContent({ routineId }: Readonly<{ routineId: string }>): React.JSX.Element {
  const router = useRouter();
  const routine = useRoutineDetail(routineId);

  if (routine.data !== undefined) return <EditRoutineForm routine={routine.data} />;
  return (
    <ScreenTemplate title="" onBackPress={router.back} backLabel={i18n.t('actions.back')}>
      {routine.isError ? (
        <LoadErrorState
          title={i18n.t('routines.detail.notFound')}
          error={routine.error}
          onRetry={() => void routine.refetch()}
          isRetrying={routine.isFetching}
        />
      ) : (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      )}
    </ScreenTemplate>
  );
}

/** Corregir una rutina ya creada: el mismo formulario que al crearla, sin la asignación. */
export function EditRoutineScreen(): React.JSX.Element {
  const params = parseRoutineRouteParams(useLocalSearchParams());
  if (params === null) return <Redirect href="/" />;
  return <EditRoutineContent routineId={params.routineId} />;
}
