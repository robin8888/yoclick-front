import { useLocalSearchParams, useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { getProblemModalCopy } from '@/shared/i18n/problem-modal-copy';
import { Button } from '@/ui/atoms/Button';
import { ProblemModal } from '@/ui/organisms/ProblemModal';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { CreateClassPlaceFields } from '../components/CreateClassPlaceFields';
import { CreateClassWhenFields } from '../components/CreateClassWhenFields';
import { SkippedOccurrencesSheet } from '../components/SkippedOccurrencesSheet';
import { useCreateClassForm } from '../hooks/useCreateClassForm';
import { newScheduleRouteParamsSchema } from '../model/new-schedule-route-params';

/**
 * «Crear clase»: nombre, sala (de las creadas), servicio (de los creados), profesor que da ese
 * servicio y día y hora entre los que están libres. Es lo que luego sale en la agenda del centro y
 * en la de cada profesor, y donde se apunta a quien tiene bono en vigor.
 */
export function CreateClassScreen(): React.JSX.Element {
  const router = useRouter();
  const params = newScheduleRouteParamsSchema.safeParse(useLocalSearchParams());
  const form = useCreateClassForm(params.success ? params.data.roomId : undefined);

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.createClass.title')}
      subtitle={i18n.t('centerAdmin.createClass.subtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={form.isSaving}
      footer={
        <Button
          isFullWidth
          label={i18n.t('centerAdmin.createClass.saveAction')}
          isDisabled={!form.canSave}
          onPress={form.save}
        />
      }
    >
      <CreateClassPlaceFields form={form} />
      <CreateClassWhenFields form={form} />
      <ProblemModal
        message={form.errorMessage}
        onDismiss={form.clearError}
        {...getProblemModalCopy()}
      />
      <SkippedOccurrencesSheet
        title={i18n.t('centerAdmin.schedules.createdTitle')}
        skipped={form.skipped}
        onDone={form.finish}
      />
    </ScreenTemplate>
  );
}
