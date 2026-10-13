import { View } from 'react-native';

import type { RepeatWeekResponseDto } from '@/shared/api/generated/model';
import { i18n } from '@/shared/i18n';
import { formatNumericDate } from '@/shared/lib/format';
import { Button } from '@/ui/atoms/Button';
import { IconButton } from '@/ui/atoms/IconButton';
import { Text } from '@/ui/atoms/Text';

import { getWeekEnd } from '../model/schedule-week';

const NAVIGATOR_STYLE = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
} as const;
const PANEL_STYLE = { gap: 8 } as const;

interface WeekNavigatorProps {
  weekStart: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

function WeekNavigator({
  weekStart,
  onPreviousWeek,
  onNextWeek,
}: Readonly<WeekNavigatorProps>): React.JSX.Element {
  return (
    <View style={NAVIGATOR_STYLE}>
      <IconButton
        iconName="chevronLeft"
        accessibilityLabel={i18n.t('centerAdmin.schedules.previousWeek')}
        onPress={onPreviousWeek}
      />
      <Text variant="bodyStrong" accessibilityLiveRegion="polite">
        {i18n.t('centerAdmin.schedules.weekRange', {
          from: formatNumericDate(weekStart),
          to: formatNumericDate(getWeekEnd(weekStart)),
        })}
      </Text>
      <IconButton
        iconName="chevronRight"
        accessibilityLabel={i18n.t('centerAdmin.schedules.nextWeek')}
        onPress={onNextWeek}
      />
    </View>
  );
}

function describeResult(result: RepeatWeekResponseDto): string {
  const parts = [
    i18n.t('centerAdmin.schedules.repeatCopied', { count: result.copiedSeriesCount }),
    result.alreadyCopiedSeriesCount === 0
      ? null
      : i18n.t('centerAdmin.schedules.repeatAlready', { count: result.alreadyCopiedSeriesCount }),
    result.skipped.length === 0
      ? null
      : i18n.t('centerAdmin.schedules.repeatSkipped', { count: result.skipped.length }),
  ];
  return parts.filter((part) => part !== null).join(' ');
}

interface WeekRepeatPanelProps extends WeekNavigatorProps {
  /** Cuántos horarios de esa semana se pueden copiar (los configurados solo para ella). */
  copyableSeriesCount: number;
  isRepeating: boolean;
  result: RepeatWeekResponseDto | undefined;
  onRepeat: () => void;
}

/**
 * La semana que se está viendo, con flechas, y «Repetir en la semana siguiente»: copia a la
 * semana de después los horarios configurados solo para esta, con el mismo servicio, sala,
 * profesor y horas.
 */
export function WeekRepeatPanel({
  copyableSeriesCount,
  isRepeating,
  result,
  onRepeat,
  ...navigation
}: Readonly<WeekRepeatPanelProps>): React.JSX.Element {
  return (
    <View style={PANEL_STYLE}>
      <WeekNavigator {...navigation} />
      <Button
        variant="outline"
        leadingIconName="refresh"
        label={i18n.t('centerAdmin.schedules.repeatWeekAction')}
        isDisabled={copyableSeriesCount === 0}
        isLoading={isRepeating}
        onPress={onRepeat}
      />
      {copyableSeriesCount === 0 ? (
        <Text variant="caption" color="ink2">
          {i18n.t('centerAdmin.schedules.repeatWeekHelper')}
        </Text>
      ) : null}
      {result === undefined ? null : (
        <Text color="success" accessibilityLiveRegion="polite">
          {describeResult(result)}
        </Text>
      )}
    </View>
  );
}
