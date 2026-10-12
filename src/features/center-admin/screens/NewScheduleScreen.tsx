import { useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ScheduleChoiceFields, ScheduleTimingFields } from '../components/NewScheduleFields';
import { SkippedOccurrencesSheet } from '../components/SkippedOccurrencesSheet';
import { useNewScheduleForm } from '../hooks/useNewScheduleForm';
import { useScheduleFormOptions } from '../hooks/useScheduleFormOptions';
import { ROOM_TEACHER_VALUE } from '../model/schedule-form';

/**
 * «Nuevo horario» (docs/spec/09): servicio → días → hora → espacio → profesor → modo → periodo.
 * El servidor crea las sesiones de las próximas 8 semanas y devuelve las que no pudo crear.
 */
export function NewScheduleScreen(): React.JSX.Element {
  const router = useRouter();
  const form = useNewScheduleForm();
  const options = useScheduleFormOptions(form.values);
  // Sin profesor fijo en el espacio hay que elegir uno: el servidor no sabría quién da la clase.
  const isTeacherMissing =
    form.values.staffMembershipId === ROOM_TEACHER_VALUE && !options.selectedRoom?.staff;

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.schedules.newTitle')}
      subtitle={i18n.t('centerAdmin.schedules.newSubtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={form.isSaving}
      footer={
        <Button
          isFullWidth
          label={i18n.t('centerAdmin.schedules.saveAction')}
          isDisabled={isTeacherMissing}
          {...(isTeacherMissing
            ? { accessibilityHint: i18n.t('centerAdmin.schedules.teacherRequired') }
            : {})}
          onPress={form.submit}
        />
      }
    >
      <ScheduleChoiceFields form={form} options={options} />
      <ScheduleTimingFields form={form} />
      {form.errorMessage === null ? null : <FormErrorBanner message={form.errorMessage} />}
      <SkippedOccurrencesSheet
        title={i18n.t('centerAdmin.schedules.createdTitle')}
        skipped={form.skipped}
        onDone={form.finish}
      />
    </ScreenTemplate>
  );
}
