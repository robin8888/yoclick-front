import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { Button } from '@/ui/atoms/Button';
import { Text } from '@/ui/atoms/Text';

import type { OpeningHoursDraftEditing } from '../hooks/useOpeningHoursDraft';
import type { OpeningHoursDraft } from '../model/opening-hours-draft';
import { WEEK_DAYS } from '../model/opening-hours-summary';
import { OpeningDayCard } from './OpeningDayCard';

const SECTION_STYLE = { gap: 12 } as const;

interface WeekDaysProps {
  editing: OpeningHoursDraftEditing;
  draft: OpeningHoursDraft;
}

function WeekDays({ editing, draft }: Readonly<WeekDaysProps>): React.JSX.Element {
  return (
    <>
      {WEEK_DAYS.map((day) => (
        <OpeningDayCard
          key={day}
          day={day}
          ranges={draft[day]}
          hasProblem={editing.daysWithProblems.includes(day)}
          onOpenChange={(isOpen) => {
            editing.changeDayOpen(day, isOpen);
          }}
          onRangeAdd={() => {
            editing.addRange(day);
          }}
          onRangeRemove={(rangeIndex) => {
            editing.removeRange(day, rangeIndex);
          }}
          onTimeStep={(change) => {
            editing.stepTime(day, change);
          }}
        />
      ))}
    </>
  );
}

interface StaffWeeklyHoursSectionProps extends WeekDaysProps {
  hasOwnHours: boolean;
  canSave: boolean;
  isBusy: boolean;
  onSave: () => void;
  onResetToCenterHours: () => void;
}

/** Prototipo `iavail`, «Horario semanal»: cada día con sus tramos; sin horario propio sigue el del centro. */
export function StaffWeeklyHoursSection(
  props: Readonly<StaffWeeklyHoursSectionProps>,
): React.JSX.Element {
  const { hasOwnHours, canSave, isBusy } = props;
  const statusKey = hasOwnHours
    ? 'centerAdmin.availability.hasOwnHours'
    : 'centerAdmin.availability.followsCenter';

  return (
    <View style={SECTION_STYLE}>
      <Text variant="titleMd" role="heading">
        {i18n.t('centerAdmin.availability.weeklyTitle')}
      </Text>
      <Text variant="caption" color="ink2">
        {i18n.t(statusKey)}
      </Text>
      <WeekDays editing={props.editing} draft={props.draft} />
      <Button
        label={i18n.t('centerAdmin.availability.saveAction')}
        isFullWidth
        isLoading={isBusy}
        isDisabled={!canSave}
        onPress={props.onSave}
      />
      {hasOwnHours ? (
        <Button
          variant="ghost"
          label={i18n.t('centerAdmin.availability.resetAction')}
          isFullWidth
          isDisabled={isBusy}
          onPress={props.onResetToCenterHours}
        />
      ) : null}
    </View>
  );
}
