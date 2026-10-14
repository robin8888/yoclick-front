import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { buildCalendarLabels } from '@/shared/i18n/calendar-labels';
import { formatNumericDate } from '@/shared/lib/format';
import { useTheme } from '@/shared/theme';
import { Text } from '@/ui/atoms/Text';
import { TimeWheelField } from '@/ui/molecules/TimeWheelField';
import { DatePickerField } from '@/ui/organisms/DatePickerField';

import type { TimeEntryDraftState } from '../hooks/useTimeEntryDraft';
import { createEditorWheelsStyle } from './TimeClock.styles';

/** Entrada y salida se corrigen al minuto: las ruedas avanzan de uno en uno. */
const WHEEL_STEP_MINUTES = 1;
const WHEEL_VISIBLE_ITEMS = 3;

interface TimeEntryFieldsProps {
  draft: TimeEntryDraftState;
  /** Solo al añadir un día olvidado se elige el día; al corregir, el fichaje ya tiene el suyo. */
  isDateEditable: boolean;
  todayIsoDate: string;
}

function TimeWheels({ draft }: Readonly<{ draft: TimeEntryDraftState }>): React.JSX.Element {
  const theme = useTheme();
  const wheelProps = { stepMinutes: WHEEL_STEP_MINUTES, visibleItems: WHEEL_VISIBLE_ITEMS };

  return (
    <View style={createEditorWheelsStyle(theme)}>
      <TimeWheelField
        {...wheelProps}
        label={i18n.t('timeClock.editor.fromLabel')}
        accessibilityName={i18n.t('timeClock.editor.fromAccessibility')}
        time={draft.inTime}
        onTimeChange={draft.setInTime}
      />
      <TimeWheelField
        {...wheelProps}
        label={i18n.t('timeClock.editor.untilLabel')}
        accessibilityName={i18n.t('timeClock.editor.untilAccessibility')}
        time={draft.outTime}
        onTimeChange={draft.setOutTime}
      />
    </View>
  );
}

/** El día (si se puede elegir) y las ruedas de entrada y salida. */
export function TimeEntryFields({
  draft,
  isDateEditable,
  todayIsoDate,
}: Readonly<TimeEntryFieldsProps>): React.JSX.Element {
  return (
    <>
      {isDateEditable ? (
        <DatePickerField
          value={draft.workDate}
          onValueChange={draft.setWorkDate}
          accessibilityLabel={i18n.t('timeClock.editor.dateLabel')}
          placeholder={i18n.t('timeClock.editor.datePlaceholder')}
          openCalendarLabel={i18n.t('timeClock.editor.openCalendar')}
          formatDate={formatNumericDate}
          todayDate={todayIsoDate}
          isInitiallyOpen={false}
          getCalendarLabels={buildCalendarLabels}
        />
      ) : null}
      <TimeWheels draft={draft} />
      {draft.isOutOnNextDay ? (
        <Text variant="caption" color="ink2">
          {i18n.t('timeClock.editor.nextDayHint')}
        </Text>
      ) : null}
    </>
  );
}
