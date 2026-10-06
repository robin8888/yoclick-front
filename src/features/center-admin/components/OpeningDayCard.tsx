import { View } from 'react-native';

import { i18n } from '@/shared/i18n';
import { useTheme } from '@/shared/theme';
import { Button } from '@/ui/atoms/Button';
import { Switch } from '@/ui/atoms/Switch';
import { Text } from '@/ui/atoms/Text';

import { MAX_RANGES_PER_DAY, type TimeField, type TimeRange } from '../model/opening-hours-draft';
import type { WeekDay } from '../model/opening-hours-summary';
import { createOpeningDayStyle, DAY_HEADER_STYLE, DAY_TITLE_STYLE } from './OpeningDayCard.styles';
import { TimeRangeRow } from './TimeRangeRow';

interface OpeningDayCardProps {
  day: WeekDay;
  ranges: readonly TimeRange[];
  hasProblem: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onRangeAdd: () => void;
  onRangeRemove: (rangeIndex: number) => void;
  onTimeStep: (change: { rangeIndex: number; field: TimeField; direction: 1 | -1 }) => void;
}

interface OpeningDayHeaderProps {
  dayName: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

function OpeningDayHeader({
  dayName,
  isOpen,
  onOpenChange,
}: Readonly<OpeningDayHeaderProps>): React.JSX.Element {
  return (
    <View style={DAY_HEADER_STYLE}>
      <View style={DAY_TITLE_STYLE}>
        <Text variant="bodyStrong">{dayName}</Text>
        {isOpen ? null : (
          <Text variant="caption" color="ink2">
            {i18n.t('centerAdmin.services.closed')}
          </Text>
        )}
      </View>
      <Switch
        isOn={isOpen}
        accessibilityLabel={i18n.t('centerAdmin.hoursEditor.openSwitch', { day: dayName })}
        onToggle={onOpenChange}
      />
    </View>
  );
}

interface OpeningDayFooterProps {
  hasProblem: boolean;
  canAddRange: boolean;
  onRangeAdd: () => void;
}

function OpeningDayFooter({
  hasProblem,
  canAddRange,
  onRangeAdd,
}: Readonly<OpeningDayFooterProps>): React.JSX.Element {
  return (
    <>
      {hasProblem ? (
        <Text variant="caption" color="danger" role="alert">
          {i18n.t('centerAdmin.hoursEditor.problem')}
        </Text>
      ) : null}
      {canAddRange ? (
        <Button
          variant="ghost"
          size="sm"
          leadingIconName="plus"
          label={i18n.t('centerAdmin.hoursEditor.addRange')}
          onPress={onRangeAdd}
        />
      ) : null}
    </>
  );
}

/** Un día del horario: interruptor abierto/cerrado y, si abre, sus tramos con la hora de cada extremo. */
export function OpeningDayCard({
  day,
  ranges,
  hasProblem,
  onOpenChange,
  onRangeAdd,
  onRangeRemove,
  onTimeStep,
}: Readonly<OpeningDayCardProps>): React.JSX.Element {
  const theme = useTheme();
  const dayName = i18n.t(`centerAdmin.weekDays.${day}`);
  const isOpen = ranges.length > 0;

  return (
    <View style={createOpeningDayStyle(theme, hasProblem)}>
      <OpeningDayHeader dayName={dayName} isOpen={isOpen} onOpenChange={onOpenChange} />
      {ranges.map((range, rangeIndex) => (
        <TimeRangeRow
          key={`${range.opensAt}-${String(rangeIndex)}`}
          dayName={dayName}
          range={range}
          canRemove={ranges.length > 1}
          onRemove={() => {
            onRangeRemove(rangeIndex);
          }}
          onTimeStep={(field, direction) => {
            onTimeStep({ rangeIndex, field, direction });
          }}
        />
      ))}
      <OpeningDayFooter
        hasProblem={hasProblem}
        canAddRange={isOpen && ranges.length < MAX_RANGES_PER_DAY}
        onRangeAdd={onRangeAdd}
      />
    </View>
  );
}
