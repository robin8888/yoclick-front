import { useLocalSearchParams, useRouter } from 'expo-router';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { getProblemModalCopy } from '@/shared/i18n/problem-modal-copy';
import { ProblemModal } from '@/ui/organisms/ProblemModal';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { ScheduleChoiceFields, ScheduleTimingFields } from '../components/NewScheduleFields';
import { SkippedOccurrencesSheet } from '../components/SkippedOccurrencesSheet';
import { useNewScheduleForm } from '../hooks/useNewScheduleForm';
import { useScheduleFormOptions } from '../hooks/useScheduleFormOptions';
import { newScheduleRouteParamsSchema } from '../model/new-schedule-route-params';
import { ROOM_TEACHER_VALUE } from '../model/schedule-form';

/** La sala ya elegida y si se llega justo después de crearla (la ruta los pasa como parámetros). */
function useNewScheduleParams(): { presetRoomId: string | undefined; isNewRoom: boolean } {
  const params = newScheduleRouteParamsSchema.safeParse(useLocalSearchParams());
  return {
    presetRoomId: params.success ? params.data.roomId : undefined,
    isNewRoom: params.success && params.data.isNewRoom === 'true',
  };
}

function SaveScheduleButton({
  isTeacherMissing,
  onPress,
}: Readonly<{ isTeacherMissing: boolean; onPress: () => void }>): React.JSX.Element {
  return (
    <Button
      isFullWidth
      label={i18n.t('centerAdmin.schedules.saveAction')}
      isDisabled={isTeacherMissing}
      {...(isTeacherMissing
        ? { accessibilityHint: i18n.t('centerAdmin.schedules.teacherRequired') }
        : {})}
      onPress={onPress}
    />
  );
}

/**
 * «Nuevo horario» (docs/spec/09): servicio → días → hora → espacio → profesor → modo → periodo.
 * El servidor crea las sesiones de las próximas 8 semanas y devuelve las que no pudo crear.
 */
export function NewScheduleScreen(): React.JSX.Element {
  const router = useRouter();
  const { presetRoomId, isNewRoom } = useNewScheduleParams();
  const form = useNewScheduleForm(presetRoomId);
  const options = useScheduleFormOptions(form.values);
  // Sin profesor fijo en el espacio hay que elegir uno: el servidor no sabría quién da la clase.
  const isTeacherMissing =
    form.values.staffMembershipId === ROOM_TEACHER_VALUE && !options.selectedRoom?.staff;

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.schedules.newTitle')}
      subtitle={i18n.t(
        isNewRoom ? 'centerAdmin.schedules.newRoomSubtitle' : 'centerAdmin.schedules.newSubtitle',
      )}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={form.isSaving}
      footer={<SaveScheduleButton isTeacherMissing={isTeacherMissing} onPress={form.submit} />}
    >
      <ScheduleChoiceFields form={form} options={options} />
      <ScheduleTimingFields form={form} />
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
