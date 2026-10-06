import { useRouter } from 'expo-router';

import { LoadErrorState } from '@/features/join';
import { i18n } from '@/shared/i18n';
import { getSharedStateCopy } from '@/shared/i18n/shared-state-copy';
import { Button } from '@/ui/atoms/Button';
import { FormErrorBanner } from '@/ui/molecules/FormErrorBanner';
import { ScreenSkeleton } from '@/ui/organisms/ScreenSkeleton';
import { ScreenTemplate } from '@/ui/templates/ScreenTemplate';

import { OpeningDayCard } from '../components/OpeningDayCard';
import { useOpeningHoursEditor } from '../hooks/useOpeningHoursEditor';
import type { OpeningHoursDraft } from '../model/opening-hours-draft';
import { WEEK_DAYS } from '../model/opening-hours-summary';

interface OpeningDaysListProps {
  editor: ReturnType<typeof useOpeningHoursEditor>;
  draft: OpeningHoursDraft;
}

function OpeningDaysList({ editor, draft }: Readonly<OpeningDaysListProps>): React.JSX.Element {
  return (
    <>
      {WEEK_DAYS.map((day) => (
        <OpeningDayCard
          key={day}
          day={day}
          ranges={draft[day]}
          hasProblem={editor.daysWithProblems.includes(day)}
          onOpenChange={(isOpen) => {
            editor.changeDayOpen(day, isOpen);
          }}
          onRangeAdd={() => {
            editor.addRange(day);
          }}
          onRangeRemove={(rangeIndex) => {
            editor.removeRange(day, rangeIndex);
          }}
          onTimeStep={(change) => {
            editor.stepTime(day, change);
          }}
        />
      ))}
    </>
  );
}

/** Prototipo `acenter`, «Horario de apertura»: cada día abierto o cerrado, con sus tramos. */
export function OpeningHoursEditorScreen(): React.JSX.Element {
  const router = useRouter();
  const editor = useOpeningHoursEditor();

  return (
    <ScreenTemplate
      title={i18n.t('centerAdmin.hoursEditor.title')}
      subtitle={i18n.t('centerAdmin.hoursEditor.subtitle')}
      onBackPress={router.back}
      backLabel={i18n.t('actions.back')}
      isLoading={editor.isSaving}
      footer={
        <Button
          isFullWidth
          label={i18n.t('centerAdmin.hoursEditor.saveAction')}
          isDisabled={!editor.canSave}
          onPress={editor.save}
        />
      }
    >
      {editor.isLoading ? (
        <ScreenSkeleton loadingLabel={getSharedStateCopy().loadingLabel} />
      ) : null}
      {editor.hasFailed ? (
        <LoadErrorState
          title={i18n.t('centerAdmin.hoursEditor.errorTitle')}
          error={editor.error}
          onRetry={editor.retry}
        />
      ) : null}
      {editor.draft === null ? null : <OpeningDaysList editor={editor} draft={editor.draft} />}
      {editor.saveErrorMessage === null ? null : (
        <FormErrorBanner message={editor.saveErrorMessage} />
      )}
    </ScreenTemplate>
  );
}
