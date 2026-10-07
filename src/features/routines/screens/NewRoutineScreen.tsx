import { useRouter } from 'expo-router';

import { useActiveCenterSectorId } from '@/features/join';
import { getSectorVocabulary, i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { RoutineBuilderForm } from '../components/RoutineBuilderForm';
import { useRoutineBuilder } from '../hooks/useRoutineBuilder';

/** Prototipo `aroutines`: armar una rutina desde la biblioteca y, si se quiere, asignarla al guardar. */
export function NewRoutineScreen(): React.JSX.Element {
  const router = useRouter();
  const builder = useRoutineBuilder();
  const { routine: routineWord } = getSectorVocabulary(useActiveCenterSectorId());
  const isAssigning = builder.draft.target.kind !== 'none';

  return (
    <ScreenTemplate
      title={i18n.t('routines.builder.title', { routineWord: routineWord.singular })}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={builder.isSaving}
      footer={
        <Button
          isFullWidth
          label={i18n.t(
            isAssigning ? 'routines.builder.saveAndAssignAction' : 'routines.builder.saveAction',
          )}
          isDisabled={!builder.canSave}
          onPress={() => {
            builder.save(router.back);
          }}
        />
      }
    >
      <RoutineBuilderForm builder={builder} />
      {builder.errorMessage === null ? null : <FormErrorBanner message={builder.errorMessage} />}
    </ScreenTemplate>
  );
}
